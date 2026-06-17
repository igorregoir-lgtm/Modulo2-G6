"""Fase 2 do seed: explicações SHAP reais por cliente + agregados de EDA reais.

1. Para cada um dos 4.000 clientes, calcula a explicação local (SHAP) via
   pipeline.inference e popula a tabela `explanation` (base_value + drivers).
2. Calcula agregados REAIS do dataset/escores e grava em `lib/eda-data.json`
   (consumido por lib/analytics.ts), substituindo as figuras de referência.

Uso: python -m pipeline.seed_phase2   (após seed_supabase)
"""
from __future__ import annotations
import json
from pathlib import Path

import numpy as np
import pandas as pd
from supabase import create_client

from pipeline import inference

ROOT = Path(__file__).resolve().parents[1]
CHUNK = 200


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def chunks(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i : i + n]


def native(v):
    return v.item() if hasattr(v, "item") else v


def fetch_all(sb, table, cols):
    out, start = [], 0
    while True:
        res = sb.table(table).select(cols).range(start, start + 999).execute()
        out.extend(res.data)
        if len(res.data) < 1000:
            break
        start += 1000
    return out


def main() -> None:
    env = load_env()
    sb = create_client(env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"])

    df = pd.read_csv(ROOT / "data" / "gym_churn_us.csv")
    rows = df.to_dict(orient="records")

    # mapas external_ref -> customer_id -> score_id
    customers = fetch_all(sb, "customer", "id, external_ref")
    scores = fetch_all(sb, "score", "id, customer_id")
    ext_to_cid = {c["external_ref"]: c["id"] for c in customers}
    cid_to_sid = {s["customer_id"]: s["id"] for s in scores}
    print(f"customers={len(ext_to_cid)} scores={len(cid_to_sid)}")

    # limpa explicações antigas
    sb.table("explanation").delete().neq("id", 0).execute()

    # 1) explicações SHAP reais
    expl = []
    for i, r in enumerate(rows):
        feats = {k: native(v) for k, v in r.items() if k != "Churn"}
        cid = ext_to_cid.get(f"VZ{i:04d}")
        sid = cid_to_sid.get(cid)
        if sid is None:
            continue
        pred = inference.predict(feats)
        sl = pred.get("shap_local") or {}
        expl.append(
            {
                "score_id": sid,
                "base_value": round(float(sl.get("base_value", 0.0)), 5),
                "drivers": sl.get("contributions", []),
                "narrative": None,
                "recommendation": None,
            }
        )
        if (i + 1) % 500 == 0:
            print(f"  shap {i + 1}/{len(rows)}")
    ins = 0
    for ch in chunks(expl, CHUNK):
        res = sb.table("explanation").insert(ch).execute()
        ins += len(res.data)
    print(f"explanations inseridas: {ins}")

    # 2) agregados de EDA reais ------------------------------------------------
    y = df["Churn"]
    # churn por contrato
    by_contract = []
    labels = {1: "Mensal", 6: "Semestral", 12: "Anual"}
    for cp in sorted(df["Contract_period"].unique()):
        sub = df[df["Contract_period"] == cp]
        by_contract.append(
            {
                "contract": int(cp),
                "label": labels.get(int(cp), f"{int(cp)}m"),
                "total": int(len(sub)),
                "churn": int(sub["Churn"].sum()),
                "churn_rate": round(float(sub["Churn"].mean()), 3),
            }
        )
    # churn por cohort de Lifetime
    bins = [(-1, 2, "0-2m"), (2, 5, "3-5m"), (5, 8, "6-8m"), (8, 12, "9-12m"), (12, 1e9, "12m+")]
    by_cohort = []
    for lo, hi, lab in bins:
        sub = df[(df["Lifetime"] > lo) & (df["Lifetime"] <= hi)]
        if len(sub) == 0:
            continue
        by_cohort.append(
            {
                "cohort": lab,
                "total": int(len(sub)),
                "churn": int(sub["Churn"].sum()),
                "churn_rate": round(float(sub["Churn"].mean()), 3),
            }
        )
    # distribuição de frequência mês-corrente por churn
    fbins = [(-1, 0.0001, "0"), (0.0001, 1, "0-1"), (1, 2, "1-2"), (2, 3, "2-3"), (3, 1e9, "3+")]
    freq_dist = []
    for lo, hi, lab in fbins:
        sub = df[(df["Avg_class_frequency_current_month"] > lo) & (df["Avg_class_frequency_current_month"] <= hi)]
        freq_dist.append(
            {
                "bucket": lab,
                "churn": int(sub["Churn"].sum()),
                "retained": int((sub["Churn"] == 0).sum()),
            }
        )
    # correlação (features-chave + churn)
    corr_cols = ["Lifetime", "Avg_class_frequency_current_month", "Contract_period",
                 "Avg_additional_charges_total", "Age", "Churn"]
    corr_labels = ["Lifetime", "Freq_atual", "Contrato", "Adicionais", "Idade", "Churn"]
    cm = df[corr_cols].corr().values
    correlation = []
    for i2, yl in enumerate(corr_labels):
        for j2, xl in enumerate(corr_labels):
            correlation.append({"x": xl, "y": yl, "value": round(float(cm[i2][j2]), 2)})
    # retenção por lifetime (share retido no lifetime m)
    survival = []
    for m in range(0, 13):
        sub = df[df["Lifetime"] == m]
        ret = float((sub["Churn"] == 0).mean()) if len(sub) else None
        survival.append({"lifetime": m, "retention": round(ret, 3) if ret is not None else None})
    # scatter (amostra real de 400 pontos)
    samp = df.sample(min(400, len(df)), random_state=42)
    scatter = [
        {
            "freq_total": round(float(r["Avg_class_frequency_total"]), 2),
            "freq_current": round(float(r["Avg_class_frequency_current_month"]), 2),
            "churned": bool(r["Churn"] == 1),
            "sleeping_dog": bool(r["Lifetime"] > 6 and r["Avg_class_frequency_current_month"] < 0.5),
        }
        for r in samp.to_dict("records")
    ]
    # split por tier/arquétipo (real, dos escores)
    score_rows = fetch_all(sb, "score", "risk_tier, archetype, churn_probability")
    tiers = ["baixo", "medio", "alto", "critico"]
    archs = ["preco_sensivel", "desengajado_conteudo", "early_dropper", "sleeping_dog", "concorrente_driven"]
    tier_split = [{"tier": t, "count": sum(1 for s in score_rows if s["risk_tier"] == t)} for t in tiers]
    arch_split = [{"archetype": a, "count": sum(1 for s in score_rows if s["archetype"] == a)} for a in archs]
    avg_score = round(float(np.mean([float(s["churn_probability"]) for s in score_rows])), 4)

    eda_data = {
        "n": int(len(df)),
        "churn_rate_dataset": round(float(y.mean()), 4),
        "churn_rate_monthly_case": 0.102,
        "avg_score": avg_score,
        "tier_split": tier_split,
        "archetype_split": arch_split,
        "by_contract": by_contract,
        "by_cohort": by_cohort,
        "freq_dist": freq_dist,
        "correlation": correlation,
        "survival": survival,
        "scatter": scatter,
    }
    out_path = ROOT / "lib" / "eda-data.json"
    out_path.write_text(json.dumps(eda_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"EDA real escrito em {out_path} | tier_split={tier_split}")


if __name__ == "__main__":
    main()
