import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
  /** Whether an "up" trend is good (green) or bad (red). */
  upIsGood?: boolean;
  target?: string;
}

export function KpiCard({ label, value, hint, trend, upIsGood = true, target }: KpiCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const good = trend === "flat" ? false : (trend === "up") === upIsGood;
  const trendColor = trend === "flat" ? "var(--steel)" : good ? "var(--accent-deep)" : "var(--tier-alto)";

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--paper)] p-4">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="mono text-2xl font-semibold tracking-tight text-[var(--ink)]">{value}</span>
        {trend && (
          <span
            className={cn("flex items-center gap-1 text-xs font-medium")}
            style={{ color: trendColor }}
          >
            <TrendIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {(hint || target) && (
        <p className="mt-1.5 text-xs text-[var(--steel)]">
          {hint}
          {target && <span className="ml-1">· Meta: {target}</span>}
        </p>
      )}
    </div>
  );
}
