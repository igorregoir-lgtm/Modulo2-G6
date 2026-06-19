// ============================================================================
// Painel "Risco ≠ Uplift" (estação Avaliar). Presentacional (sem estado): recebe
// linhas já calculadas no servidor com o proxy de uplift. Mostra que prever churn
// não é o mesmo que saber quem responde — o "cão que dorme" pode ter risco alto e
// uplift zero. Ver lib/trilha/uplift.ts + ADR-0016.
// ============================================================================

import { ArrowDownRight, Ban, Check, Minus } from "lucide-react";
import { TierBadge } from "@/components/tier-badge";
import { pct } from "@/lib/utils";
import type { RiskTier } from "@/lib/types";
import type { UpliftReason } from "@/lib/trilha/uplift";

export interface UpliftRow {
  ref: string;
  realProb: number;
  tier: RiskTier;
  archetype: string;
  upliftPP: number;
  action: string | null;
  reason: UpliftReason;
}

const VERDICT: Record<UpliftReason, { label: string; icon: typeof Check; cls: string }> = {
  ok: { label: "Abordar", icon: Check, cls: "text-[var(--accent-deep)]" },
  nao_intrusao: { label: "Não — não-intrusão", icon: Ban, cls: "text-[var(--tier-alto)]" },
  ja_baixo: { label: "Não — já baixo risco", icon: Minus, cls: "text-[var(--steel)]" },
  sem_alavanca: { label: "Sem alavanca barata", icon: Minus, cls: "text-[var(--steel)]" },
};

export function UpliftPanel({ rows }: { rows: UpliftRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        Prever <span className="font-medium text-[var(--ink)]">quem vai cancelar</span> não é o mesmo
        que saber <span className="font-medium text-[var(--ink)]">quem responde à intervenção</span>.
        O <span className="font-medium text-[var(--ink)]">uplift</span> estima o efeito incremental de
        abordar cada membro — e é por ele que se decide a ação, não pelo risco puro. Repare como um
        &quot;cão que dorme&quot; pode ter risco alto e uplift zero.
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--rule)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--rule)] bg-[var(--paper-soft)] text-left">
              <th className="px-3 py-2 font-medium text-[var(--steel)]">Membro</th>
              <th className="px-3 py-2 font-medium text-[var(--steel)]">Risco</th>
              <th className="px-3 py-2 font-medium text-[var(--steel)]">Uplift estimado</th>
              <th className="px-3 py-2 font-medium text-[var(--steel)]">Decisão</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const v = VERDICT[r.reason];
              const Icon = v.icon;
              return (
                <tr key={r.ref} className="border-b border-[var(--rule-soft)] last:border-0">
                  <td className="px-3 py-2">
                    <span className="mono text-xs text-[var(--ink)]">{r.ref}</span>
                    <span className="block text-[10px] text-[var(--steel)]">{r.archetype}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="mono text-xs">{pct(r.realProb, 0)}</span>
                      <TierBadge tier={r.tier} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {r.upliftPP > 0 ? (
                      <span className="inline-flex items-center gap-1 font-medium text-[var(--accent-deep)]">
                        <ArrowDownRight className="h-3.5 w-3.5" />−{r.upliftPP} p.p.
                      </span>
                    ) : (
                      <span className="text-[var(--steel)]">~0</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${v.cls}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {v.label}
                    </span>
                    {r.action && r.reason === "ok" && (
                      <span className="block text-[10px] text-[var(--steel)]">{r.action}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--steel)]">
        Proxy honesto: o uplift vem da redução de risco projetada pela intervenção mais barata do
        modelo transparente (ancorada no score real) — não de um modelo de uplift treinado, pois o
        dataset não tem grupo de tratamento/controle. Para um uplift real, ver o desenho de
        experimento na ADR-0016.
      </p>
    </div>
  );
}
