// Funil de elegibilidade — base → tiers → exclusões → população acionável.
// Server component (sem estado). Liga "o problema" (quem) à "ética" (quem NÃO).

import { ChevronRight } from "lucide-react";

export interface FunnelStep {
  value: string;
  label: string;
  hint?: string;
}

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="min-w-[116px] flex-1 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5">
            <p className="mono text-lg font-semibold leading-none text-[var(--ink)]">{s.value}</p>
            <p className="mt-1.5 text-xs font-medium text-[var(--ink-soft)]">{s.label}</p>
            {s.hint && <p className="mt-0.5 text-[10px] leading-tight text-[var(--steel)]">{s.hint}</p>}
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--steel-soft)]" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
