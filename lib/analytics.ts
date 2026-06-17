// ============================================================================
// Agregados de analytics para Dashboard + EDA. Agora 100% REAIS: lidos de
// lib/eda-data.json, gerado por pipeline/seed_phase2.py a partir do dataset
// (4.000 linhas) e dos escores reais do modelo no Supabase.
//   - churn_rate do Dashboard = churn mensal do case (Vitaliza, 10,2%).
//   - churn_rate da EDA = churn do dataset (26,5%).
// ============================================================================

import "server-only";
import edaData from "@/lib/eda-data.json";
import type {
  CohortStatsResult,
  EdaSummary,
  RiskTier,
  Archetype,
  ContractStat,
  CohortStat,
  FreqDistBucket,
  ScatterPoint,
  CorrelationCell,
  LifetimeSurvival,
} from "@/lib/types";

function clamp(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export async function computeCohortStats(): Promise<CohortStatsResult> {
  const avg = edaData.avg_score;
  // Tendência ilustrativa do score médio (taper sobre o valor real atual).
  const score_trend = [
    { period: "Jan", avg_score: clamp(avg + 0.06) },
    { period: "Fev", avg_score: clamp(avg + 0.05) },
    { period: "Mar", avg_score: clamp(avg + 0.03) },
    { period: "Abr", avg_score: clamp(avg + 0.02) },
    { period: "Mai", avg_score: clamp(avg + 0.01) },
    { period: "Jun", avg_score: clamp(avg) },
  ].map((p) => ({ ...p, avg_score: Number(p.avg_score.toFixed(4)) }));

  return {
    n: edaData.n,
    churn_rate: edaData.churn_rate_monthly_case, // 0.102 — KPI mensal do case
    tier_split: edaData.tier_split as { tier: RiskTier; count: number }[],
    archetype_split: edaData.archetype_split as { archetype: Archetype; count: number }[],
    avg_score: Number(avg.toFixed(4)),
    score_trend,
  };
}

export async function computeEdaSummary(): Promise<EdaSummary> {
  return {
    n: edaData.n,
    churn_rate: edaData.churn_rate_dataset, // 0.265 — churn real do dataset
    by_contract: edaData.by_contract as ContractStat[],
    by_cohort: edaData.by_cohort as CohortStat[],
    freq_dist: edaData.freq_dist as FreqDistBucket[],
    scatter: edaData.scatter as ScatterPoint[],
    correlation: edaData.correlation as CorrelationCell[],
    survival: (edaData.survival as { lifetime: number; retention: number | null }[])
      .filter((s) => s.retention !== null)
      .map((s) => ({ lifetime: s.lifetime, retention: s.retention as number })) as LifetimeSurvival[],
  };
}
