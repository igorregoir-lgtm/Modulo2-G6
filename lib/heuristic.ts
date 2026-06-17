// ============================================================================
// TRANSPARENT FALLBACK HEURISTIC — NOT the real ML model.
// Used only when the Supabase `score`/`explanation` rows are absent and the
// Python inference service is not yet wired. It produces contract-shaped
// PredictResult objects from raw features so the UI renders end-to-end.
//
// TODO: wire to /api/py inference (joblib model + SHAP). This file should be
// bypassed once real scores exist in Supabase.
// ============================================================================

import type {
  Archetype,
  CustomerFeatures,
  PredictResult,
  RiskTier,
  ShapDriver,
} from "./types";

export const MODEL_VERSION = "heuristic-fallback-0.1";
export const DEFAULT_THRESHOLD = 0.5;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function deriveFeatures(f: CustomerFeatures): CustomerFeatures {
  const ratio =
    f.Avg_class_frequency_total > 0
      ? f.Avg_class_frequency_current_month / f.Avg_class_frequency_total
      : 0;
  const delta = f.Avg_class_frequency_current_month - f.Avg_class_frequency_total;
  const earlyUser = f.Lifetime <= 1 ? 1 : 0;
  const sleepingDog = f.Lifetime > 6 && f.Avg_class_frequency_current_month < 0.5 ? 1 : 0;
  return {
    ...f,
    ratio_freq_atual_vs_lifetime: Number(ratio.toFixed(3)),
    delta_freq: Number(delta.toFixed(3)),
    flag_early_user: earlyUser,
    flag_sleeping_dog: sleepingDog,
  };
}

/**
 * Transparent weighted logit. Each weight is documented so the explanation is
 * auditable. Positive contribution => pushes toward churn.
 */
const WEIGHTS: { feature: string; w: number; actionable: boolean; pick: (f: CustomerFeatures) => number }[] = [
  // Low current frequency is the strongest churn signal (actionable: reengage).
  { feature: "Avg_class_frequency_current_month", w: -1.35, actionable: true, pick: (f) => f.Avg_class_frequency_current_month },
  // Short contract => easier to leave (actionable: upsell longer plan).
  { feature: "Contract_period", w: -0.11, actionable: true, pick: (f) => f.Contract_period },
  // Closer to contract end => higher churn risk (actionable: renewal nudge).
  { feature: "Month_to_end_contract", w: -0.16, actionable: true, pick: (f) => f.Month_to_end_contract },
  // Longer lifetime => stickier (not directly actionable).
  { feature: "Lifetime", w: -0.08, actionable: false, pick: (f) => f.Lifetime },
  // Group challenges build habit (actionable: invite to challenges).
  { feature: "Group_visits", w: -0.55, actionable: true, pick: (f) => f.Group_visits },
  // Additional spend signals engagement (semi-actionable).
  { feature: "Avg_additional_charges_total", w: -0.0035, actionable: false, pick: (f) => f.Avg_additional_charges_total },
  // Promo/indication friends => social anchor.
  { feature: "Promo_friends", w: -0.35, actionable: false, pick: (f) => f.Promo_friends },
  // Partner (corporate convênio) => stickier.
  { feature: "Partner", w: -0.30, actionable: false, pick: (f) => f.Partner },
];

const INTERCEPT = 1.05;

export function predictHeuristic(
  customerId: number | string,
  rawFeatures: CustomerFeatures,
): PredictResult {
  const f = deriveFeatures(rawFeatures);

  // Build SHAP-like local contributions relative to a reference (base) sample.
  const base = REFERENCE;
  const contributions: ShapDriver[] = WEIGHTS.map(({ feature, w, actionable, pick }) => {
    const value = pick(f);
    const baseValue = pick(base);
    const shap = w * (value - baseValue);
    return {
      feature,
      shap_value: Number(shap.toFixed(4)),
      value: Number(value.toFixed(2)),
      actionable,
      direction: shap >= 0 ? "up" : "down",
    };
  });

  // ratio feature (engagement drop) — strong actionable driver
  const ratio = f.ratio_freq_atual_vs_lifetime ?? 0;
  const ratioShap = -0.9 * (ratio - (base.ratio_freq_atual_vs_lifetime ?? 0.9));
  contributions.push({
    feature: "ratio_freq_atual_vs_lifetime",
    shap_value: Number(ratioShap.toFixed(4)),
    value: ratio,
    actionable: true,
    direction: ratioShap >= 0 ? "up" : "down",
  });

  const baseLogit = INTERCEPT;
  const logit = baseLogit + contributions.reduce((s, c) => s + c.shap_value, 0);
  const prob = sigmoid(logit);

  const top_drivers = [...contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 6);

  const risk_tier = tierFromProb(prob);
  const archetype = archetypeFor(f, prob);
  const proactive_allowed = archetype !== "sleeping_dog";

  return {
    customer_id: customerId,
    churn_probability: Number(prob.toFixed(5)),
    risk_tier,
    threshold: DEFAULT_THRESHOLD,
    archetype,
    proactive_allowed,
    model_version: MODEL_VERSION,
    top_drivers,
    shap_local: {
      base_value: Number(sigmoid(baseLogit).toFixed(5)),
      contributions,
    },
  };
}

export function tierFromProb(p: number): RiskTier {
  if (p >= 0.75) return "critico";
  if (p >= 0.55) return "alto";
  if (p >= 0.35) return "medio";
  return "baixo";
}

export function archetypeFor(f: CustomerFeatures, prob: number): Archetype {
  // Sleeping dog: long tenure + near-zero current usage => do not wake.
  if (f.flag_sleeping_dog === 1) return "sleeping_dog";
  // Early dropper: very new and already at risk.
  if (f.flag_early_user === 1 && prob >= 0.4) return "early_dropper";
  // Engagement collapse => disengaged from content.
  const ratio = f.ratio_freq_atual_vs_lifetime ?? 1;
  if (ratio < 0.6) return "desengajado_conteudo";
  // Short contract + low additional spend => price sensitive.
  if (f.Contract_period <= 1 && f.Avg_additional_charges_total < 120) return "preco_sensivel";
  // Otherwise treat moderate-risk mid-tenure as competitor-driven.
  return "concorrente_driven";
}

// Reference "average healthy member" used as the SHAP base point.
const REFERENCE: CustomerFeatures = {
  gender: 1,
  Near_Location: 1,
  Partner: 1,
  Promo_friends: 1,
  Phone: 1,
  Contract_period: 6,
  Group_visits: 1,
  Age: 29,
  Avg_additional_charges_total: 150,
  Month_to_end_contract: 5,
  Lifetime: 5,
  Avg_class_frequency_total: 2.0,
  Avg_class_frequency_current_month: 1.9,
  ratio_freq_atual_vs_lifetime: 0.95,
  delta_freq: -0.1,
  flag_early_user: 0,
  flag_sleeping_dog: 0,
};
