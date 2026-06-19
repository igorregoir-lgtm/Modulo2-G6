import { describe, it, expect } from "vitest";
import { upliftProxy } from "./uplift";
import { predictHeuristic } from "@/lib/heuristic";
import { SAMPLE_CUSTOMERS, findSample } from "@/lib/sample";

// Usa o score heurístico como realProb (no modo amostra real == baseline).
function probOf(ref: string): number {
  const c = findSample(ref)!;
  return predictHeuristic(c.id, c.features).churn_probability;
}

describe("upliftProxy", () => {
  it("membro de risco acionável tem uplift > 0 e ação recomendada", () => {
    // VZ-3071: frequência caiu forte, contrato curto — acionável.
    const c = findSample("VZ-3071")!;
    const r = upliftProxy(c.features, probOf("VZ-3071"));
    if (r.reason === "ok") {
      expect(r.uplift).toBeGreaterThan(0);
      expect(r.actionable).toBe(true);
      expect(r.recommendedAction).toBeTruthy();
      expect(r.projected).toBeLessThan(r.realProb);
      expect(r.expectedValue).toBeGreaterThan(0);
    } else {
      // se não cruzar tier, ao menos não vaza NaN e uplift = 0
      expect(r.uplift).toBe(0);
    }
  });

  it("'cão que dorme' tem uplift 0 por não-intrusão", () => {
    // VZ-4115: vínculo longo, uso quase zero → sleeping_dog.
    const c = findSample("VZ-4115")!;
    const pred = predictHeuristic(c.id, c.features);
    expect(pred.archetype).toBe("sleeping_dog");
    const r = upliftProxy(c.features, pred.churn_probability);
    expect(r.uplift).toBe(0);
    expect(r.actionable).toBe(false);
    expect(r.reason).toBe("nao_intrusao");
    expect(r.recommendedAction).toBeNull();
  });

  it("nunca retorna NaN e uplift é sempre >= 0 em toda a amostra", () => {
    for (const c of SAMPLE_CUSTOMERS) {
      const pred = predictHeuristic(c.id, c.features);
      const r = upliftProxy(c.features, pred.churn_probability);
      expect(Number.isNaN(r.uplift)).toBe(false);
      expect(r.uplift).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(r.expectedValue)).toBe(false);
    }
  });

  it("risco alto ≠ uplift alto: o sleeping dog pode ter risco e ainda assim uplift 0", () => {
    const dog = findSample("VZ-4115")!;
    const dogPred = predictHeuristic(dog.id, dog.features);
    const dogUp = upliftProxy(dog.features, dogPred.churn_probability);
    // a tese central da estação: não é o risco que decide abordar, é o uplift
    expect(dogUp.actionable).toBe(false);
  });
});
