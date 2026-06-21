import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowLeft, BookText } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PrincipiosContent } from "@/lib/types";
import { CONTENT } from "@/lib/dossie/content";
import { REFINEMENTS } from "@/lib/dossie/refinements";
import { EVIDENCE, type Evidence } from "@/lib/dossie/facts";
import { Section } from "@/components/dossie/section";
import { KpiStat, KpiGrid } from "@/components/dossie/kpi-stat";
import { Callout, LimitationNote } from "@/components/dossie/callout";
import { EvidenceRow } from "@/components/dossie/evidence-link";
import { Funnel } from "@/components/dossie/funnel";
import { FlowDiagram } from "@/components/dossie/flow-diagram";
import { DossieNav } from "@/components/dossie/dossie-nav";
import { PrintButton } from "@/components/dossie/print-button";

export const metadata: Metadata = {
  title: "O Artefato — dossiê de explicabilidade",
  description:
    "Explicação completa do sistema Vitaliza para avaliação: o que é, as dores, a arquitetura, o rigor e a honestidade do modelo, a Trilha e como avaliar. Inclui os princípios de personalização (LGPD / ANPD).",
};

const EV = EVIDENCE as Record<string, Evidence>;

const FALLBACK: PrincipiosContent = {
  titulo: "Princípios de Personalização",
  resumo:
    "Como usamos dados de comportamento para reduzir o churn de forma transparente, proporcional e contestável.",
  base_legal:
    "LGPD (Lei 13.709/2018) e Nota Técnica ANPD 07/2025 sobre transparência em decisões automatizadas.",
  principios: [
    { nome: "Finalidade", texto: "Os dados comportamentais (frequência de uso, tipo de contrato, tempo de assinatura, participação em desafios) são usados exclusivamente para estimar risco de cancelamento e oferecer ações de retenção úteis ao usuário." },
    { nome: "Transparência", texto: "Toda previsão é explicável: mostramos quais variáveis pesaram e em que direção. As explicações descrevem o comportamento do modelo, não relações de causa e efeito." },
    { nome: "Proporcionalidade", texto: "No máximo 2 canais de contato simultâneos por pessoa; nenhuma oferta de desconto sem segmentação prévia." },
    { nome: "Não-intrusão", texto: "Usuários de baixíssimo uso e vínculo longo (perfil “cão que dorme”) são excluídos de qualquer campanha proativa, para respeitar quem não quer ser contatado." },
    { nome: "Contestação", texto: "Qualquer pessoa pode solicitar revisão humana de uma decisão automatizada e a exclusão de seus dados do processo de personalização." },
    { nome: "Auditabilidade", texto: "Cada previsão e cada ação ficam registradas (entrada anonimizada, score, versão do modelo, explicação, decisão) para auditoria e melhoria contínua." },
  ],
};

async function getPrincipios(): Promise<PrincipiosContent> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("principios").select("conteudo").eq("id", 1).maybeSingle();
    if (data?.conteudo) return data.conteudo as PrincipiosContent;
  } catch {
    /* fall through to FALLBACK */
  }
  return FALLBACK;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--paper-soft)] p-4 text-sm leading-relaxed text-[var(--ink-soft)]">
      {children}
    </div>
  );
}

function LgpdBlock({ lgpd }: { lgpd: PrincipiosContent }) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--paper)] p-4">
      <p className="eyebrow text-[var(--accent-deep)]">Princípios de personalização (LGPD / ANPD)</p>
      <ol className="flex flex-col gap-3">
        {lgpd.principios.map((p, i) => (
          <li key={p.nome} className="flex gap-3">
            <span className="mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--rule)] text-[10px] text-[var(--steel)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">{p.nome}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--ink-soft)]">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-[var(--steel)]">
        <span className="font-medium text-[var(--ink-soft)]">Base legal:</span> {lgpd.base_legal}
      </p>
    </div>
  );
}

export default async function ArtefatoPage() {
  const lgpd = await getPrincipios();

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header (não imprime) */}
      <header className="no-print border-b border-[var(--primary-deep)] bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-white">
              <Activity className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold">Vitaliza</span>
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--cloud)] hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Intro / capa do dossiê (imprime) */}
        <div className="mb-8 border-b border-[var(--rule)] pb-6">
          <p className="eyebrow mb-2 flex items-center gap-2 text-[var(--accent-deep)]">
            <BookText className="h-4 w-4" />O Artefato · dossiê de explicabilidade
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            Vitaliza — Sistema de Inteligência de Retenção de Clientes
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            Explicação completa do artefato para avaliação: o que é, as dores que ataca, a arquitetura
            técnica, o rigor e a honestidade do modelo, a lógica da Trilha de Aprendizado e como
            avaliar — com links vivos para cada evidência.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
          <aside className="no-print mb-6 hidden lg:block">
            <div className="sticky top-6">
              <DossieNav />
            </div>
          </aside>

          <div className="flex flex-col gap-10">
            {CONTENT.map((c) => {
              const r = REFINEMENTS[c.id];
              const ev = c.evidenceKeys.map((k) => EV[k]).filter(Boolean) as Evidence[];
              return (
                <Section key={c.id} id={c.id} eyebrow={c.eyebrow} title={c.title}>
                  <p className="text-base font-medium text-[var(--ink)]">{c.lead}</p>

                  {c.stats.length > 0 && (
                    <KpiGrid>
                      {c.stats.map((s, i) => (
                        <KpiStat key={i} value={s.value} label={s.label} hint={s.hint} />
                      ))}
                    </KpiGrid>
                  )}

                  {c.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}

                  {c.bullets.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {c.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                          <span className="text-sm leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {c.id === "solucao" && <FlowDiagram />}

                  {c.id === "problema" && r?.funnel && (
                    <div>
                      <p className="eyebrow mb-2">{r.funnel.title}</p>
                      <Funnel steps={r.funnel.steps} />
                    </div>
                  )}

                  {c.callout && <Callout label={c.callout.label}>{c.callout.text}</Callout>}
                  {r?.proof && <Callout label={r.proof.label}>{r.proof.text}</Callout>}
                  {r?.notes?.map((n, i) => <Note key={i}>{n}</Note>)}

                  {c.id === "etica" && <LgpdBlock lgpd={lgpd} />}

                  {r?.limitation && <LimitationNote>{r.limitation}</LimitationNote>}

                  {ev.length > 0 && <EvidenceRow items={ev} />}
                </Section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
