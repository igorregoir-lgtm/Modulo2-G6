// ============================================================================
// Dossiê de Explicabilidade — fonte ÚNICA das seções (índice ↔ âncoras).
// See docs/superpowers/specs/2026-06-19-dossie-explicabilidade-design.md §5.
// ============================================================================

export interface DossieSection {
  id: string;
  label: string;
}

export const SECTIONS: DossieSection[] = [
  { id: "tese", label: "A tese" },
  { id: "problema", label: "O problema e as dores" },
  { id: "solucao", label: "A solução" },
  { id: "arquitetura", label: "Arquitetura técnica" },
  { id: "modelo", label: "O modelo e o rigor" },
  { id: "explicabilidade", label: "Explicabilidade → ação" },
  { id: "etica", label: "Ética e governança (LGPD)" },
  { id: "trilha", label: "A Trilha de Aprendizado" },
  { id: "avaliar", label: "Como avaliar este artefato" },
  { id: "decisoes", label: "Decisões e auditoria" },
];
