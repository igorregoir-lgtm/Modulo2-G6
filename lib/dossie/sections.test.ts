import { describe, it, expect } from "vitest";
import { SECTIONS } from "./sections";

describe("dossie SECTIONS", () => {
  it("tem 10 seções com ids únicos e labels preenchidos", () => {
    expect(SECTIONS).toHaveLength(10);
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(10);
    for (const s of SECTIONS) {
      expect(s.id).toMatch(/^[a-z]+$/);
      expect(s.label.length).toBeGreaterThan(0);
    }
  });
});
