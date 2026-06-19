// ============================================================================
// Dossiê — fatos VERIFICADOS (fonte única dos números da página). Os valores
// vêm de pipeline/artifacts/metrics.json, docs/leakage-audit.json,
// docs/model-honesty.md e lib/eda-data.json — copiados para cá porque
// /pipeline e /docs são vercelignored (não importáveis no bundle do app).
// Verificação adversarial contra o repo: spec §11.
// See docs/superpowers/specs/2026-06-19-dossie-explicabilidade-design.md §4, §6.
// ============================================================================

export const MODEL_FACTS = {
  /** Conjunto de TESTE (holdout) — metrics.json. */
  rocAucTest: 0.988,
  recallTest: 0.95,
  precisionTest: 0.803,
  f1Test: 0.87,
  /** Gap treino−teste de ROC-AUC ("sem overfit relevante"). */
  overfitGap: 0.0103,
  /** Corte por custo com restrição recall ≥ 0,70. */
  threshold: 0.05,
  /** Churn observado no dataset (positivos) e churn mensal do case. */
  baseRateDataset: 0.265,
  churnMonthlyCase: 0.102,
  churnTargetCase: 0.06,
  /** A/B de leakage com classificador-SONDA (LogReg, split de teste 30%) — NÃO o
   *  XGBoost de produção: remover Month_to_end_contract mantém o AUC (0,9739 com
   *  vs 0,9739 sem) → o desempenho não vinha dessa quase-leakage. */
  leakageProbeAuc: 0.9739,
  leakageAbDeltaAuc: 0.0,
  /** Correlação Month_to_end_contract × Contract_period (motivo da exclusão). */
  corrMteContract: 0.973,
  /** Funil de elegibilidade (lib/eda-data.json): tiers de risco + arquétipo excluído. */
  tierAlto: 1051,
  tierMedio: 85,
  tierBaixo: 2864,
  tierCritico: 0,
  sleepingDogs: 54,
  /** Churn observado no grupo sleeping_dog (≈ 1 caso em 54 — política, não estatística). */
  sleepingDogChurn: 0.019,
  /** Tamanho do dataset e nº de colunas (brutas). */
  nDataset: 4000,
  nColumns: 14,
  /** Drivers legítimos dominantes (leakage-audit.json). */
  topDrivers: "delta_freq (−0,60), flag_early_user (+0,56), Lifetime (−0,44)",
  modelVersion: "vitaliza-churn-1.0.0",
} as const;

export type EvidenceKind = "tela" | "doc";
export interface Evidence {
  label: string;
  href: string;
  kind: EvidenceKind;
}

const REPO = "https://github.com/igorregoir-lgtm/Modulo2-G6/blob/main";

/** Links de evidência — telas vivas (rota interna) e docs (GitHub). */
export const EVIDENCE = {
  dashboard: { label: "Dashboard executivo", href: "/dashboard", kind: "tela" },
  eda: { label: "EDA interativa", href: "/eda", kind: "tela" },
  individual: { label: "Consulta individual", href: "/individual", kind: "tela" },
  explicar: { label: "Casos contrastantes (SHAP)", href: "/individual?trilha=explicar", kind: "tela" },
  carteira: { label: "Visão de carteira", href: "/carteira", kind: "tela" },
  trilha: { label: "Trilha de Aprendizado", href: "/trilha", kind: "tela" },
  avaliar: { label: "Estação Avaliar (threshold + calibração + uplift)", href: "/trilha/avaliar?trilha=avaliar", kind: "tela" },
  sintese: { label: "Síntese (capstone)", href: "/trilha/sintese?trilha=sintese", kind: "tela" },
  modelCard: { label: "Model card", href: `${REPO}/docs/model_card.md`, kind: "doc" },
  honesty: { label: "Honestidade do modelo", href: `${REPO}/docs/model-honesty.md`, kind: "doc" },
  leakage: { label: "Auditoria de leakage (evidência)", href: `${REPO}/docs/leakage-audit.json`, kind: "doc" },
  traceability: { label: "Matriz de rastreabilidade", href: `${REPO}/docs/traceability-matrix.md`, kind: "doc" },
  decisions: { label: "Decision log (ADRs)", href: `${REPO}/docs/decisions/README.md`, kind: "doc" },
  roteiro: { label: "Roteiro de demonstração", href: `${REPO}/docs/roteiro-demo.md`, kind: "doc" },
  spec: { label: "Specs de design", href: `${REPO}/docs/superpowers/specs`, kind: "doc" },
} as const satisfies Record<string, Evidence>;
