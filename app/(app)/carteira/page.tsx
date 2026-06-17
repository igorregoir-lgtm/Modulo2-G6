import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AprenderCard } from "@/components/aprender-card";
import { CarteiraView, type PortfolioRow } from "@/components/carteira-view";
import { Badge } from "@/components/ui/badge";
import { getScoredCustomers } from "@/lib/scoring";

export const metadata: Metadata = { title: "Visão de Carteira" };

export default async function CarteiraPage() {
  const scored = await getScoredCustomers();
  const rows: PortfolioRow[] = scored.map((s) => ({
    id: s.customer.external_ref,
    external_ref: s.customer.external_ref,
    churn_probability: s.prediction.churn_probability,
    risk_tier: s.prediction.risk_tier,
    archetype: s.prediction.archetype,
    proactive_allowed: s.prediction.proactive_allowed,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Liderança / CS"
        title="Visão de Carteira"
        description="Priorize a operação: membros ranqueados por risco, com bloqueio explícito de quem não deve ser contatado."
      >
        <Badge variant="muted">{rows.length} membros</Badge>
      </PageHeader>

      <AprenderCard
        screen="Visão de Carteira"
        title="Priorizar sem ser intrusivo"
        what="Lista a carteira ordenada por risco, com filtros por tier e arquétipo e ação em lote. Membros 'cão que dorme' ficam em cinza e bloqueados para ação."
        why="A operação tem tempo limitado: agir primeiro em quem tem maior risco recuperável. O bloqueio dos 'cães que dormem' evita acelerar cancelamentos e respeita a política de não-intrusão."
        bullets={[
          "Ordenação por probabilidade de churn (maior risco no topo).",
          "Ação em lote registra intervenções e grava no audit_log.",
        ]}
      />

      <CarteiraView rows={rows} />
    </div>
  );
}
