// Diagrama simples do fluxo do sistema (tokens; sem libs). Ponta a ponta +
// camada pedagógica. Server component (sem estado).

import { Database, Brain, BarChart3, Sparkles, Send, ShieldCheck, GraduationCap, ChevronRight } from "lucide-react";

const STEPS = [
  { icon: Database, label: "Dados", sub: "gym_churn 4.000×14" },
  { icon: Brain, label: "Modelo", sub: "XGBoost calibrado" },
  { icon: BarChart3, label: "SHAP", sub: "explicação local" },
  { icon: Sparkles, label: "Advisor", sub: "oferta prescritiva" },
  { icon: Send, label: "Ação", sub: "aplicar intervenção" },
  { icon: ShieldCheck, label: "Auditoria", sub: "audit_log" },
];

export function FlowDiagram() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--paper-soft)] p-4">
      <div className="flex flex-wrap items-stretch gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex min-w-[112px] flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--accent-deep)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-[var(--ink)]">{s.label}</span>
                <span className="text-[10px] leading-tight text-[var(--steel)]">{s.sub}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--steel-soft)]" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--accent)]/40 bg-[var(--accent-light)]/30 px-3 py-2">
        <GraduationCap className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" aria-hidden />
        <p className="text-xs text-[var(--ink-soft)]">
          Camada pedagógica sobre tudo isto: <span className="font-medium text-[var(--ink)]">tutor</span> (DeepSeek),{" "}
          <span className="font-medium text-[var(--ink)]">Simulador Vivo</span> (what-if) e a{" "}
          <span className="font-medium text-[var(--ink)]">Trilha</span> (jornada Bloom).
        </p>
      </div>
    </div>
  );
}
