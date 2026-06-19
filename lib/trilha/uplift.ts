// ============================================================================
// Uplift PROXY (#) — do "quem vai cancelar" para "quem responde à intervenção".
// PURO. O dataset não tem grupo de tratamento/controle, então NÃO é um modelo de
// uplift treinado: é um proxy honesto do efeito incremental, derivado do modelo
// transparente (a redução de risco projetada pela intervenção mais barata, já
// ancorada no score real — ADR-0014). "Cão que dorme" tem uplift 0 por
// não-intrusão. Ver ADR-0016. See spec da Trilha §3.
// ============================================================================

import type { CustomerFeatures } from "@/lib/types";
import { predictHeuristic, tierFromProb } from "@/lib/heuristic";
import { findCheapestLever } from "@/lib/simulator/engine";
import { DEFAULT_COSTS, type ThresholdCosts } from "./threshold";

export type UpliftReason = "ok" | "nao_intrusao" | "ja_baixo" | "sem_alavanca";

export interface UpliftResult {
  realProb: number;
  /** Ação recomendada (alavanca mais barata) ou null. */
  recommendedAction: string | null;
  /** Risco projetado após a intervenção, ou null se não há ação. */
  projected: number | null;
  /** Efeito incremental estimado = realProb − projected (≥ 0; 0 se sem ação). */
  uplift: number;
  /** R$ esperados preservados por membro abordado = uplift × churnLoss. */
  expectedValue: number;
  /** Vale abordar proativamente? */
  actionable: boolean;
  reason: UpliftReason;
}

/**
 * Proxy de uplift para um membro. Usa a alavanca mais barata (que já respeita a
 * não-intrusão) como estimativa do efeito incremental de uma intervenção real.
 */
export function upliftProxy(
  features: CustomerFeatures,
  realProb: number,
  costs: ThresholdCosts = DEFAULT_COSTS,
): UpliftResult {
  const pred = predictHeuristic("uplift", features);

  // Não-intrusão: "cão que dorme" / proativo bloqueado → uplift 0 (não abordar).
  if (pred.archetype === "sleeping_dog" || pred.proactive_allowed === false) {
    return {
      realProb,
      recommendedAction: null,
      projected: null,
      uplift: 0,
      expectedValue: 0,
      actionable: false,
      reason: "nao_intrusao",
    };
  }

  const lever = findCheapestLever(features, realProb);
  if (!lever) {
    return {
      realProb,
      recommendedAction: null,
      projected: null,
      uplift: 0,
      expectedValue: 0,
      actionable: false,
      reason: tierFromProb(realProb) === "baixo" ? "ja_baixo" : "sem_alavanca",
    };
  }

  const uplift = Math.max(0, realProb - lever.projected);
  return {
    realProb,
    recommendedAction: lever.humanAction,
    projected: lever.projected,
    uplift,
    expectedValue: uplift * costs.churnLoss,
    actionable: uplift > 0,
    reason: "ok",
  };
}
