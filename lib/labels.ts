import type { Archetype, RiskTier } from "./types";

// Human-readable PT-BR labels for the model features.
export const FEATURE_LABELS: Record<string, string> = {
  gender: "Gênero",
  Near_Location: "Mora perto da unidade",
  Partner: "Convênio empresarial",
  Promo_friends: "Veio por indicação",
  Phone: "Telefone cadastrado",
  Contract_period: "Período de contrato (meses)",
  Group_visits: "Participa de desafios em grupo",
  Age: "Idade",
  Avg_additional_charges_total: "Gasto médio em adicionais",
  Month_to_end_contract: "Meses até o fim do contrato",
  Lifetime: "Tempo de assinatura (meses)",
  Avg_class_frequency_total: "Frequência média (histórico)",
  Avg_class_frequency_current_month: "Frequência média (mês atual)",
  ratio_freq_atual_vs_lifetime: "Razão freq. atual / histórica",
  flag_early_user: "Usuário recém-chegado",
  flag_sleeping_dog: "Perfil 'cão que dorme'",
  delta_freq: "Variação de frequência",
};

export function featureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? feature;
}

export const TIER_LABELS: Record<RiskTier, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
};

export const TIER_COLOR_VAR: Record<RiskTier, string> = {
  baixo: "var(--tier-baixo)",
  medio: "var(--tier-medio)",
  alto: "var(--tier-alto)",
  critico: "var(--tier-critico)",
};

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  preco_sensivel: "Preço-sensível",
  desengajado_conteudo: "Desengajado de conteúdo",
  early_dropper: "Early dropper",
  sleeping_dog: "Cão que dorme",
  concorrente_driven: "Atraído por concorrente",
};

export const ARCHETYPE_DESC: Record<Archetype, string> = {
  preco_sensivel:
    "Reage a preço e percepção de valor. Sensível a descontos e benefícios tangíveis.",
  desengajado_conteudo:
    "Frequência caiu; perdeu conexão com aulas e desafios. Precisa de reengajamento de conteúdo.",
  early_dropper:
    "Recém-chegado em risco de abandonar antes de criar hábito. Janela curta de onboarding.",
  sleeping_dog:
    "Vínculo longo e uso baixíssimo. Excluído de campanhas proativas (política de não-intrusão).",
  concorrente_driven:
    "Sinais de comparação com concorrentes. Foco em diferenciais e retenção por valor.",
};
