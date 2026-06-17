import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AprenderCard } from "@/components/aprender-card";
import { EdaView } from "@/components/eda-view";
import { computeEdaSummary } from "@/lib/analytics";

export const metadata: Metadata = { title: "EDA Interativa" };

export default async function EdaPage() {
  const summary = await computeEdaSummary();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Produto / Dados"
        title="EDA Interativa"
        description="Análise exploratória do comportamento da base: o que separa quem fica de quem cancela."
      />

      <AprenderCard
        screen="EDA Interativa"
        title="Por que explorar os dados antes de modelar"
        what="Mostra as seis visualizações-chave do case: churn por contrato e por cohort, retenção ao longo do tempo, distribuição de frequência, correlações e o scatter que isola os 'cães que dormem'."
        why="A EDA revela padrões e riscos (como vazamento de dados e segmentos especiais) antes do modelo. É o que sustenta as escolhas de features e a regra de não-intrusão."
        bullets={[
          "Frequência no mês atual é o sinal mais forte de churn.",
          "O scatter frequência histórica × atual isola visualmente o perfil 'cão que dorme'.",
        ]}
      />

      <EdaView summary={summary} />
    </div>
  );
}
