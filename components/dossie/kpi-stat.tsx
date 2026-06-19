// Destaque de métrica do dossiê — número grande + rótulo + dica. Sem estado.

export function KpiStat({
  value,
  label,
  hint,
  accent = true,
}: {
  value: string;
  label: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--paper)] p-4">
      <p
        className="mono text-2xl font-semibold leading-none"
        style={{ color: accent ? "var(--accent-deep)" : "var(--ink)" }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-[var(--ink-soft)]">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-[var(--steel)]">{hint}</p>}
    </div>
  );
}

/** Grade responsiva de KPIs. */
export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}
