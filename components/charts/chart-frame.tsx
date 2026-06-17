import { cn } from "@/lib/utils";

export function ChartFrame({
  title,
  subtitle,
  children,
  className,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--paper)] p-4",
        className,
      )}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-[var(--steel)]">{subtitle}</p>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      {footer && <div className="mt-3 text-xs text-[var(--steel)]">{footer}</div>}
    </div>
  );
}
