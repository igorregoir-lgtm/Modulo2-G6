import { describe, it, expect } from "vitest";
import { MODEL_FACTS, EVIDENCE } from "./facts";

describe("dossie facts", () => {
  it("métricas/proporções caem em [0,1]", () => {
    const probs = [
      MODEL_FACTS.rocAucTest,
      MODEL_FACTS.recallTest,
      MODEL_FACTS.precisionTest,
      MODEL_FACTS.f1Test,
      MODEL_FACTS.threshold,
      MODEL_FACTS.baseRateDataset,
      MODEL_FACTS.churnMonthlyCase,
      MODEL_FACTS.churnTargetCase,
    ];
    for (const v of probs) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("fatos estruturais conferem", () => {
    expect(MODEL_FACTS.nDataset).toBe(4000);
    expect(MODEL_FACTS.nColumns).toBe(14);
    expect(MODEL_FACTS.leakageAbDeltaAuc).toBe(0);
    expect(MODEL_FACTS.overfitGap).toBeLessThan(0.05);
  });

  it("EVIDENCE: telas linkam rota interna, docs linkam URL", () => {
    for (const ev of Object.values(EVIDENCE)) {
      expect(ev.label.length).toBeGreaterThan(0);
      if (ev.kind === "tela") expect(ev.href.startsWith("/")).toBe(true);
      else expect(ev.href.startsWith("http")).toBe(true);
    }
  });
});
