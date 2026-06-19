import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AprenderCard } from "@/components/aprender-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThresholdExplorer } from "@/components/trilha/threshold-explorer";
import { CalibrationCurve } from "@/components/trilha/calibration-curve";
import { UpliftPanel, type UpliftRow } from "@/components/trilha/uplift-panel";
import { getScoredCustomers } from "@/lib/scoring";
import { upliftProxy } from "@/lib/trilha/uplift";
import { ARCHETYPE_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "Avaliar o sistema" };

export default async function AvaliarPage() {
  const scored = await getScoredCustomers();
  const points = scored
    .filter((s) => s.customer.true_churn === 0 || s.customer.true_churn === 1)
    .map((s) => ({ p: Number(s.prediction.churn_probability), y: s.customer.true_churn as 0 | 1 }));
  const threshold = scored[0]?.prediction.threshold ?? 0.5;

  // Seleção representativa p/ ilustrar "risco ≠ uplift": maior risco, um "cão que
  // dorme" (se houver) e um de baixo risco. Uplift calculado no servidor (puro).
  const byRisk = [...scored].sort(
    (a, b) => b.prediction.churn_probability - a.prediction.churn_probability,
  );
  const dog = scored.find((s) => s.prediction.archetype === "sleeping_dog");
  const low = [...byRisk].reverse().find((s) => s.prediction.risk_tier === "baixo");
  const picks = [byRisk[0], byRisk[1], dog, low].filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const seen = new Set<string>();
  const upliftRows: UpliftRow[] = picks
    .filter((s) => {
      const ref = s.customer.external_ref;
      if (seen.has(ref)) return false;
      seen.add(ref);
      return true;
    })
    .map((s) => {
      const u = upliftProxy(s.customer.features, s.prediction.churn_probability);
      return {
        ref: s.customer.external_ref,
        realProb: s.prediction.churn_probability,
        tier: s.prediction.risk_tier,
        archetype: ARCHETYPE_LABELS[s.prediction.archetype],
        upliftPP: Math.round(u.uplift * 100),
        action: u.recommendedAction,
        reason: u.reason,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Avaliar · visão de sistema"
        title="Avaliar o sistema"
        description="Onde colocar o corte de decisão e o quanto confiar no modelo — as escolhas que transformam um bom modelo em uma boa operação."
      />

      <AprenderCard
        screen="Avaliar o sistema"
        title="Do modelo à política de decisão"
        tease="Mexa no corte e veja recall, falsos positivos e ROI se moverem juntos."
      />

      <Card>
        <CardHeader>
          <CardTitle>Onde colocar o corte (threshold)</CardTitle>
          <CardDescription>
            O modelo dá uma probabilidade; a operação precisa de um corte para decidir quem contatar.
            Um corte baixo pega quase todos os churns (recall alto), mas gera muitos falsos positivos.
            O melhor corte é o que maximiza o ROI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThresholdExplorer points={points} defaultCutoff={threshold} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risco ≠ quem abordar (uplift)</CardTitle>
          <CardDescription>
            O passo seguinte ao corte: do risco para o efeito incremental. Quem realmente vale uma
            intervenção proativa — e quem deixar em paz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpliftPanel rows={upliftRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>O quanto confiar no modelo (calibração)</CardTitle>
          <CardDescription>
            Quando o modelo diz 70%, cerca de 70% de fato cancelam? A calibração mede a confiança das
            previsões — distinta da acurácia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CalibrationCurve points={points} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A decisão que o modelo não toma sozinho</CardTitle>
          <CardDescription>Ética e não-intrusão fazem parte da avaliação do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--paper-soft)] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-deep)]" />
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              Nem todo membro em risco deve ser contatado. Os perfis &quot;cão que dorme&quot;
              (vínculo longo, uso quase zero) são <span className="font-medium text-[var(--ink)]">excluídos
              de campanhas proativas</span> por código: para eles, intervir tende a antecipar o
              cancelamento. Avaliar o sistema é também decidir quando <span className="font-medium text-[var(--ink)]">não
              agir</span> — e lembrar que o SHAP descreve o comportamento do modelo, não relações de
              causa e efeito do mundo real.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
