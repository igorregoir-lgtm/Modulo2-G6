// Bloco de destaque accent — usado nos momentos de destaque do dossiê.

import { Zap, TriangleAlert } from "lucide-react";

export function Callout({
  children,
  label = "Repare nisto",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--accent)]/50 bg-[var(--accent-light)]/40 p-4">
      <p className="eyebrow mb-1.5 flex items-center gap-1.5 text-[var(--accent-deep)]">
        <Zap className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="text-[15px] leading-relaxed text-[var(--ink)]">{children}</p>
    </div>
  );
}

/** Limitação declarada — autoconsciência metodológica (tom de aviso, sóbrio). */
export function LimitationNote({
  children,
  label = "Limitação declarada",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border-l-2 border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--warning-text)]">
        <TriangleAlert className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="text-sm leading-relaxed text-[var(--warning-text-soft)]">{children}</p>
    </div>
  );
}
