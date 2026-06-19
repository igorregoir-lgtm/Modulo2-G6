// ============================================================================
// Refinamentos CURADOS do dossiê — incorporam o crítico de completude do
// Workflow (nível banca de doutorado): reconciliações, funil de elegibilidade,
// limitações declaradas, 5ª prova (uplift) e o lastro de código da auditoria.
// Renderizados após o conteúdo verificado de cada seção (content.ts).
// See docs/superpowers/specs/2026-06-19-dossie-explicabilidade-design.md §11.
// ============================================================================

import type { FunnelStep } from "@/components/dossie/funnel";

export interface Refinement {
  /** Callout accent extra (ex.: a 5ª prova). */
  proof?: { label: string; text: string };
  /** Parágrafos-nota extras (reconciliações, justificativas, lastro de código). */
  notes?: string[];
  /** Funil de elegibilidade. */
  funnel?: { title: string; steps: FunnelStep[] };
  /** Limitação central declarada (autoconsciência metodológica). */
  limitation?: string;
}

export const REFINEMENTS: Record<string, Refinement> = {
  tese: {
    proof: {
      label: "5ª prova — risco ≠ quem abordar",
      text:
        "O salto conceitual mais alto: prever churn não é prever resposta à intervenção (efeito incremental). O sistema expõe um proxy de uplift — a redução de risco projetada pela alavanca mais barata — e, com honestidade, recusa-se a treinar um modelo de uplift sem grupo de tratamento/controle (ADR-0016). O 'cão que dorme', de risco alto e uplift ≈ 0, é o caso-limite. O caminho para o uplift real (A/B + T-learner + curva de Qini, que acumula o efeito incremental ordenando por uplift previsto) está desenhado, não fingido.",
    },
  },
  problema: {
    notes: [
      "Reconciliação da meta de churn: o número canônico é 6,0% (Dashboard e README); o texto da SPEC cita 6,2% como meta legada — e é a essa que o '63% acima' se prende (10,2 / 6,2 ≈ 1,63). A divergência entre duas fontes do mesmo repositório é assumida de propósito: rastreabilidade honesta inclui apontar as próprias inconsistências.",
    ],
    funnel: {
      title: "Funil de elegibilidade — do problema (quem) à ética (quem NÃO abordar)",
      steps: [
        { value: "4.000", label: "base modelada", hint: "dataset gym_churn" },
        { value: "1.051", label: "risco alto (+0 crítico)", hint: "tier_split" },
        { value: "−54", label: "sleeping dogs", hint: "excluídos (ADR-0008)" },
        { value: "≈ alvo", label: "base proativa elegível", hint: "ilustrativo, não somatório validado" },
      ],
    },
  },
  modelo: {
    notes: [
      "Por que a sonda basta? O A/B de leakage usa uma regressão logística (modelo linear) justamente para isolar a contribuição marginal de Month_to_end_contract; um modelo linear tende a ser mais sensível a uma variável quase-determinística, então o delta +0,0000 é evidência conservadora de que o XGBoost de produção também não dependia dela. O passo rigoroso seguinte — registrado como trabalho futuro — é rodar o mesmo A/B no próprio XGBoost.",
    ],
    limitation:
      "O ROC-AUC de 0,988 vem de um holdout estático de um dataset sintético/anonimizado (4.000 linhas, split aleatório 70/15/15). É característica deste dado — não uma promessa de generalização. A validação out-of-time (treinar em coortes antigas, testar em novas) e o monitoramento de deriva são o próximo passo metodológico declarado.",
  },
  explicabilidade: {
    limitation:
      "O uplift exibido é um proxy derivado do modelo transparente — não há medição de efeito incremental real (sem grupo de tratamento/controle). SHAP e a projeção do simulador descrevem o comportamento do modelo, não causalidade no mundo real; e o ROI é projeção com premissas explícitas, não impacto medido.",
  },
  etica: {
    notes: [
      "A não-intrusão é uma decisão de engenharia de segurança, não um achado estatístico: o churn de 1,9% no grupo equivale a ≈ 1 caso em 54 sleeping dogs. Por isso a regra é determinística e por código (Lifetime > 6 ∧ frequência < 0,5 → prioridade máxima de arquétipo), partindo do princípio de que o custo de um falso positivo (lembrar alguém de cancelar) supera o benefício — alinhado à literatura de uplift / 'do-not-disturb'.",
      "Auditável por código, não só por declaração: cada decisão grava no audit_log (writeAudit em lib/supabase/admin.ts; a intervenção sobre um sleeping dog é registrada com status 'bloqueada' em /api/apply-intervention), e proactive_allowed é derivado deterministicamente (lib/heuristic.ts e pipeline/archetypes.py). Até a NÃO-ação fica auditável.",
    ],
  },
  decisoes: {
    notes: [
      "A auditabilidade tem prova de código: o audit_log registra entrada anonimizada, score, limiar, versão do modelo, explicação, decisão e ator (writeAudit, lib/supabase/admin.ts), e a recusa de agir sobre um sleeping dog entra como status 'bloqueada' — a não-ação é auditável. As 17 ADRs e a matriz de rastreabilidade (seções A–E) ligam cada requisito a um componente e à sua fundamentação.",
    ],
  },
};
