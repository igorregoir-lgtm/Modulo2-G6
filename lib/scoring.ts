// ============================================================================
// Server-side scoring resolver. Supabase-first (REAL model outputs), sample
// fallback. Headline score/tier/archetype come from the `score` table; the
// per-customer SHAP local explanation comes from the `explanation` table
// (real XGBoost + shap.TreeExplainer values, seeded via pipeline.seed_phase2).
// The transparent heuristic is used ONLY when Supabase has no rows (pre-seed).
// ============================================================================

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { predictHeuristic } from "@/lib/heuristic";
import { SAMPLE_CUSTOMERS, findSample } from "@/lib/sample";
import type { Customer, PredictResult, ShapDriver } from "@/lib/types";

export interface ScoredCustomer {
  customer: Customer;
  prediction: PredictResult;
  source: "supabase" | "heuristic";
}

interface CustomerRow {
  id: number;
  external_ref: string | null;
  features: Customer["features"];
  true_churn: number | null;
}

interface ScoreRow {
  id: number;
  customer_id: number;
  churn_probability: number | string;
  risk_tier: PredictResult["risk_tier"];
  archetype: PredictResult["archetype"];
  proactive_allowed: boolean;
  threshold: number | string;
  model_version: string;
  created_at: string;
}

interface RawDriver {
  feature: string;
  shap_value: number;
  value: number | string | null;
  actionable: boolean;
  direction?: string;
}

/** Normaliza um driver SHAP do banco (direção em PT) para o contrato da UI. */
function normalizeDriver(d: RawDriver): ShapDriver {
  return {
    feature: d.feature,
    shap_value: Number(d.shap_value),
    value: d.value ?? 0,
    actionable: Boolean(d.actionable),
    direction: Number(d.shap_value) >= 0 ? "up" : "down",
  };
}

function buildPrediction(
  customerId: number | string,
  score: ScoreRow,
  drivers: RawDriver[],
  baseValue: number | null,
): PredictResult {
  const contributions = drivers.map(normalizeDriver);
  const top_drivers = [...contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 6);
  return {
    customer_id: customerId,
    churn_probability: Number(score.churn_probability),
    risk_tier: score.risk_tier,
    threshold: Number(score.threshold),
    archetype: score.archetype,
    proactive_allowed: score.proactive_allowed,
    model_version: score.model_version,
    top_drivers,
    shap_local: { base_value: Number(baseValue ?? 0), contributions },
  };
}

/** Carrega clientes do Supabase (até `limit`); vazio se nenhum/erro. */
async function loadSupabaseCustomers(limit = 1000): Promise<CustomerRow[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("customer")
      .select("id, external_ref, features, true_churn")
      .limit(limit);
    if (error || !data) return [];
    return data as CustomerRow[];
  } catch {
    return [];
  }
}

async function loadLatestScores(customerIds: number[]): Promise<Map<number, ScoreRow>> {
  const map = new Map<number, ScoreRow>();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("score")
      .select(
        "id, customer_id, churn_probability, risk_tier, archetype, proactive_allowed, threshold, model_version, created_at",
      )
      .in("customer_id", customerIds)
      .order("created_at", { ascending: false });
    if (error || !data) return map;
    for (const row of data as ScoreRow[]) {
      if (!map.has(row.customer_id)) map.set(row.customer_id, row);
    }
    return map;
  } catch {
    return map;
  }
}

function buildSampleScored(): ScoredCustomer[] {
  return SAMPLE_CUSTOMERS.map((customer) => ({
    customer,
    prediction: predictHeuristic(customer.id, customer.features),
    source: "heuristic" as const,
  }));
}

/** Lista de clientes pontuados (Supabase se populado; senão amostra). */
export async function getScoredCustomers(): Promise<ScoredCustomer[]> {
  const rows = await loadSupabaseCustomers();
  if (rows.length === 0) return buildSampleScored();

  const scoreMap = await loadLatestScores(rows.map((r) => r.id));

  return rows.map((row) => {
    const customer: Customer = {
      id: row.id,
      external_ref: row.external_ref ?? String(row.id),
      features: row.features,
      true_churn: row.true_churn,
    };
    const persisted = scoreMap.get(row.id);
    if (persisted) {
      const base = predictHeuristic(row.id, row.features); // só p/ drivers de listagem
      return {
        customer,
        source: "supabase" as const,
        prediction: {
          ...base,
          customer_id: row.id,
          churn_probability: Number(persisted.churn_probability),
          risk_tier: persisted.risk_tier,
          archetype: persisted.archetype,
          proactive_allowed: persisted.proactive_allowed,
          threshold: Number(persisted.threshold),
          model_version: persisted.model_version,
        },
      };
    }
    return {
      customer,
      source: "supabase" as const,
      prediction: predictHeuristic(row.id, row.features),
    };
  });
}

/**
 * Resolve UM cliente com SHAP REAL (tabela `explanation`). Consulta direcionada
 * (não carrega a base toda) para a tela de Consulta Individual.
 */
export async function getScoredCustomer(idOrRef: string): Promise<ScoredCustomer | null> {
  try {
    const admin = createAdminClient();
    const isNumeric = /^\d+$/.test(idOrRef);
    const sel = admin.from("customer").select("id, external_ref, features, true_churn");
    const { data: cust } = isNumeric
      ? await sel.eq("id", Number(idOrRef)).maybeSingle()
      : await sel.eq("external_ref", idOrRef).maybeSingle();

    if (cust) {
      const c = cust as CustomerRow;
      const customer: Customer = {
        id: c.id,
        external_ref: c.external_ref ?? String(c.id),
        features: c.features,
        true_churn: c.true_churn,
      };
      const { data: score } = await admin
        .from("score")
        .select(
          "id, customer_id, churn_probability, risk_tier, archetype, proactive_allowed, threshold, model_version, created_at",
        )
        .eq("customer_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (score) {
        const s = score as ScoreRow;
        const { data: expl } = await admin
          .from("explanation")
          .select("base_value, drivers")
          .eq("score_id", s.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const drivers = (expl?.drivers as RawDriver[] | undefined) ?? [];
        if (drivers.length > 0) {
          return { customer, source: "supabase", prediction: buildPrediction(c.id, s, drivers, expl?.base_value ?? null) };
        }
        // score sem explanation → usa SHAP heurístico, mas headline real
        const base = predictHeuristic(c.id, c.features);
        return {
          customer,
          source: "supabase",
          prediction: {
            ...base,
            customer_id: c.id,
            churn_probability: Number(s.churn_probability),
            risk_tier: s.risk_tier,
            archetype: s.archetype,
            proactive_allowed: s.proactive_allowed,
            threshold: Number(s.threshold),
            model_version: s.model_version,
          },
        };
      }
      return { customer, source: "supabase", prediction: predictHeuristic(c.id, c.features) };
    }
  } catch {
    // cai para amostra
  }

  const sample = findSample(idOrRef);
  if (sample) {
    return {
      customer: sample,
      prediction: predictHeuristic(sample.id, sample.features),
      source: "heuristic",
    };
  }
  return null;
}
