// ============================================================================
// GERADO pelo Workflow "dossie-content-verify" — conteúdo redigido e VERIFICADO
// adversarialmente contra o repo (números conferidos fato-a-fato). Não editar à
// mão; refinamentos curados (funil, limitações, 5ª prova) vivem em refinements.ts.
// See docs/superpowers/specs/2026-06-19-dossie-explicabilidade-design.md
// ============================================================================

export interface DossieStat { value: string; label: string; hint?: string; }
export interface DossieCallout { label: string; text: string; }
export interface DossieContent {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  paragraphs: string[];
  bullets: string[];
  stats: DossieStat[];
  callout: DossieCallout | null;
  evidenceKeys: string[];
}

export const CONTENT: DossieContent[] = [
  {
    "id": "tese",
    "eyebrow": "Tese",
    "title": "A tese",
    "lead": "O Vitaliza não é \"mais um modelo de churn de aluno\". É um sistema de retenção auditável que aceita ser interrogado: deixa manipular o raciocínio do modelo ao vivo, prova com um teste A/B que sua variável suspeita não inflava a métrica, sabe quando NÃO agir e se explica enquanto se ensina.",
    "paragraphs": [
      "A previsão de churn é tratada como hipótese a ser auditada, não como resultado a ser exibido. O ROC-AUC de teste é 0,988 (ROC-AUC = capacidade de ordenar quem cancela acima de quem fica, de 0,5 ao acaso a 1,0 perfeito) sobre um held-out de n=600, com recall 0,950 (proporção de quem realmente cancela que o modelo captura) e gap de overfit treino−teste de apenas 0,0103. Mas o artefato não pede que se acredite nisso: ele entrega o aparato para desconfiar.",
      "Primeira prova — manipular o raciocínio ao vivo. A tela de Consulta Individual traz um Simulador Vivo: arrastar alavancas acionáveis (frequência de aulas no mês, desafios em grupo, duração do plano, meses até o fim do contrato) e ver score, waterfall SHAP e arquétipo recalcularem no navegador. SHAP é o método que decompõe uma previsão na contribuição de cada variável. Por desenho honesto, há dois modelos com papéis separados: o score \"Atual · XGBoost\" é sempre o modelo real de produção; a projeção ancora nesse score real e aplica apenas o delta de um surrogate transparente (heurística client-side, clamp01(score_real + (heurística_modificada − heurística_base))), com o disclaimer fixo de que descreve o comportamento do modelo, não causalidade.",
      "Segunda prova — a variável suspeita não estava inflando a métrica. Month_to_end_contract correlaciona 0,973 com Contract_period (funciona como \"relógio\" do contrato, uma variável de futuro / quase-leakage) e foi removida. Em vez de só removê-la, o pipeline roda um teste A/B explícito: um classificador-sonda (LogReg), com e sem a variável, atinge ROC-AUC 0,9739 nos dois casos — delta +0,0000. Removê-la não custou nada, evidência de que o desempenho não vinha desse atalho. O sinal forte vem de engajamento legítimo e acionável (delta_freq, ratio de frequência), e a base é desbalanceada (churn de 26,52%, 1.061/4.000), então o modelo precisa superar muito o \"chute na taxa-base\".",
      "Terceira prova — saber quando NÃO agir. O guardrail \"não acorde o cão que dorme\" (ADR-0008) marca o arquétipo sleeping_dog com proactive_allowed=False: a recomendação proativa é recusada por política, com justificativa empírica (churn de apenas 1,9% nesse grupo, onde intervir tende a piorar). A não-intrusão é preservada inclusive no otimizador do simulador, que não sugere intervenção para esses casos, e na Visão de Carteira, que bloqueia sleeping dogs. (Honestamente: é uma política de negócio sobre amostra pequena — 54 sleeping dogs — não um teste de uplift.) Quarta prova — o sistema se explica e se ensina: a Trilha de Aprendizado guia 6 missões pela taxonomia de Bloom (Entender → Explicar → Simular → Decidir → Avaliar → Sintetizar) sobre as telas reais, incluindo a estação Avaliar, que abre no threshold de 5% e expõe o diagrama de confiabilidade e o Brier score (medida de quão bem a probabilidade prevista bate com a frequência real) sobre os escores reais."
    ],
    "bullets": [
      "Prova 1 — Raciocínio manipulável ao vivo: o Simulador Vivo recalcula score, SHAP e arquétipo ao arrastar alavancas acionáveis; \"Atual · XGBoost\" é o modelo real, projeção = score real + delta do surrogate.",
      "Prova 2 — A variável suspeita não inflava: A/B com classificador-sonda (LogReg), com e sem Month_to_end_contract, dá ROC-AUC 0,9739 vs 0,9739, delta +0,0000 — remover não custou nada.",
      "Prova 3 — Sabe quando NÃO agir: guardrail \"não acorde o cão que dorme\" (ADR-0008) recusa ação proativa para sleeping_dog (churn de só 1,9% no grupo; política de negócio sobre amostra de 54).",
      "Prova 4 — Se explica e se ensina: Trilha de 6 missões (Bloom) sobre as telas reais, com a estação Avaliar (threshold 5%, curva de calibração e Brier sobre escores reais)."
    ],
    "stats": [
      {
        "value": "0,988",
        "label": "ROC-AUC (teste)",
        "hint": "capacidade de ordenar quem cancela acima de quem fica; held-out n=600"
      },
      {
        "value": "+0,0000",
        "label": "delta AUC do A/B de leakage",
        "hint": "classificador-sonda (LogReg): 0,9739 com vs 0,9739 sem Month_to_end_contract"
      },
      {
        "value": "0,950",
        "label": "Recall de churn (teste)",
        "hint": "fração de quem cancela que o modelo captura; meta recall ≥ 0,70 atingida"
      },
      {
        "value": "1,9%",
        "label": "churn dos sleeping dogs",
        "hint": "grupo (n=54) onde a ação proativa é recusada por política (ADR-0008)"
      }
    ],
    "callout": {
      "label": "O cerne",
      "text": "Não é um modelo de churn — é um sistema de retenção que se deixa auditar: prova que a variável suspeita não inflava o AUC (A/B delta +0,0000), deixa manipular o modelo ao vivo, recusa-se a agir sobre sleeping dogs e se ensina pela Trilha."
    },
    "evidenceKeys": [
      "honesty",
      "avaliar",
      "individual",
      "trilha"
    ]
  },
  {
    "id": "problema",
    "eyebrow": "O problema",
    "title": "O problema e as dores",
    "lead": "A Vitaliza perde assinantes a uma taxa que tensiona sua tese de crescimento — e a operação de retenção opera às cegas em várias frentes ao mesmo tempo. O sistema existe para fechar essas lacunas sem cometer o erro de incomodar quem ia ficar.",
    "paragraphs": [
      "A Vitaliza é uma assinatura de bem-estar/fitness com churn mensal de 10,2%, segundo a especificação do artefato. A SPEC registra esse churn como 63% acima da meta interna que ela cita (6,2%); já o Dashboard Executivo (e o README) trabalham com uma meta de 6,0%. As duas referências convivem no repositório e estão sinalizadas aqui de propósito — não harmonizamos o número. A magnitude conversa com a saúde financeira da empresa: a SPEC reporta um LTV/CAC de 2,02, abaixo do piso de 3,0 que ela atribui à rodada Série B. Em outras palavras, o churn deixa de ser um KPI operacional e passa a dialogar com a própria captação de capital.",
      "O sinal aparece cru nos dados. No dataset de modelagem (4.000 registros, 14 colunas), a taxa de churn é de 26,5% — 1.061 cancelamentos contra 2.939 permanências. Essa é a base rate, a fração de eventos positivos na amostra, e serve de linha de base contra a qual qualquer modelo precisa provar que agrega informação (atenção: é o churn do dataset de modelagem, distinto do churn mensal de 10,2% do case). O risco se concentra no início da jornada e nos contratos curtos: a retenção no primeiro mês de vida (lifetime 0) é de apenas 17,2%, a coorte de 0–2 meses cancela a 50,2%, e o churn associado ao contrato cai de 42,3% no plano mensal para 12,5% no semestral e 2,4% no anual. Há, portanto, uma janela estreita e identificável em que a intervenção importa — o que torna o problema endereçável, não apenas grande.",
      "Sobre esse pano de fundo, o artefato organiza o problema em dores operacionais concretas. A primeira é não saber QUEM vai cancelar: sem um escore de risco por usuário, a equipe trata a base como um bloco e dilui esforço onde ele não muda o desfecho. A segunda é não saber POR QUÊ: mesmo identificando um cliente em risco, falta o diagnóstico de quais variáveis pesaram naquele caso — lacuna que o sistema preenche com explicabilidade individual (SHAP, que decompõe a previsão em contribuições por variável; AUC e calibração entram como conceitos para atestar que o escore separa e pode ser lido como probabilidade). A terceira é não saber O QUE FAZER: explicar o risco não basta se a explicação não vira ação, daí a melhoria pedida pelo professor — de variáveis acionáveis para uma recomendação prática de retenção (oferta, canal, copy, timing).",
      "A quarta dor é a mais sutil e dá nome à principal salvaguarda do produto: o risco de AGIR ERRADO. Nem todo cliente em risco deve ser abordado. Há um perfil — os 'cães que dormem' (sleeping dogs) — para quem uma campanha de retenção pode funcionar como lembrete de cancelar. A SPEC institui o guardrail 'não acorde o cão que dorme': o arquétipo sleeping_dog é excluído da camada proativa (a Função B nunca intervém nele), e tanto o simulador de ROI quanto a tela de carteira declaram a exclusão como premissa de não-intrusão. É, no fim, um problema de retenção que é também de governança: agir muito, ou no alvo errado, é tão custoso quanto não agir."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "10,2%",
        "label": "Churn mensal do case",
        "hint": "vs. meta de 6,0% (Dashboard/README) e 6,2% (texto da SPEC) — divergência sinalizada"
      },
      {
        "value": "26,5%",
        "label": "Base rate no dataset de modelagem",
        "hint": "1.061 churn / 2.939 não-churn em 4.000 registros (≠ churn mensal do case)"
      },
      {
        "value": "2,02",
        "label": "LTV/CAC atual",
        "hint": "abaixo do piso de 3,0 atribuído pela SPEC à Série B"
      },
      {
        "value": "50,2%",
        "label": "Churn na coorte 0-2 meses",
        "hint": "risco concentrado no início da jornada (retenção lifetime 0 = 17,2%)"
      },
      {
        "value": "42,3% → 2,4%",
        "label": "Churn: plano mensal → anual",
        "hint": "contrato curto associado a maior risco (SHAP descreve o modelo, não causa)"
      }
    ],
    "callout": {
      "label": "Não acorde o cão que dorme",
      "text": "A quarta dor não é falta de informação, e sim o risco de AGIR ERRADO. Para o perfil 'sleeping dog', uma campanha de retenção pode lembrar o cliente de cancelar. Por isso a SPEC exclui esse arquétipo da camada proativa (a Função B nunca intervém nele); o simulador de ROI e a tela de carteira declaram essa exclusão como premissa de não-intrusão — guardrail de negócio antes de tática."
    },
    "evidenceKeys": [
      "dashboard",
      "eda"
    ]
  },
  {
    "id": "solucao",
    "eyebrow": "Visão geral",
    "title": "A solução",
    "lead": "A Vitaliza é um Sistema de Inteligência de Retenção que prevê o risco de churn por usuário, explica a previsão (global e individual), traduz essa explicação em linguagem natural empática e a converte em recomendação prescritiva de retenção — tudo dentro de uma camada pedagógica (PBL) e auditável de ponta a ponta.",
    "paragraphs": [
      "Em uma frase, a solução acopla quatro capacidades que normalmente vivem separadas: (i) predição de churn validada por usuário; (ii) explicabilidade do modelo, global e individual, via SHAP — método que decompõe a previsão atribuindo a cada variável o quanto ela empurrou o risco para cima ou para baixo; (iii) um agente de IA com dois modos, tutor (educacional/empático) e advisor (Função A, que narra a explicação sem jargão, e Função B, que emite a recomendação prescritiva); e (iv) uma jornada pedagógica que ensina o 'como' e o 'porquê' de cada etapa. O sistema está no ar em https://vitaliza-retencao.vercel.app, em modo demonstração de acesso aberto, com o gate de autenticação por perfil (CS/Executivo) presente no código (lib/supabase/middleware.ts, lib/auth.ts) e reativável.",
      "O fluxo tem duas metades. Offline (Python 3.12), um pipeline de treinamento parte da EDA no notebook Marimo, treina o modelo (XGBoost com tuning por Optuna em validação k-fold k=5), aplica calibração — CalibratedClassifierCV/sigmoid, para que o escore de saída possa ser lido como probabilidade de risco — e define um limiar de decisão por custo; o resultado é serializado em model.joblib. A inferência é feita em lote: os 4.000 clientes do dataset são pontuados e os escores, com os valores SHAP por cliente, persistem no Supabase (ADR-0011, batch vs online). Online, a aplicação Next.js na Vercel serve essas previsões e, na tela de Consulta Individual, gera a narrativa e a recomendação via agente, sempre server-side.",
      "A interface organiza-se em quatro telas mais uma página pública de governança, todas com um cartão 'Aprender' (PBL). O Dashboard Executivo consolida os KPIs (churn, LTV, LTV/CAC, retenção no mês 6, meta de 6%), o split por nível de risco e um simulador de ROI (projeção, não resultado medido). A Consulta Individual — onde mora a melhoria pedida pela avaliação anterior — mostra, por usuário, o escore, o tier, o waterfall SHAP, a explicação narrativa e a recomendação prescritiva (oferta, canal, copy e timing), além de um Simulador Vivo em que o usuário arrasta alavancas acionáveis e vê escore, waterfall e arquétipo recalcularem ao vivo no cliente. Completam o conjunto a EDA Interativa, a Visão de Carteira (com bloqueio explícito dos 'sleeping dogs', que não devem ser perturbados) e a página /principios-de-personalizacao (LGPD/ANPD).",
      "A auditabilidade é parte do produto, não acessório: decision log (ADRs), matriz de rastreabilidade que liga cada item do checklist a um componente e à sua fundamentação, model card e um log de previsões no Supabase (audit_log) que guarda input anonimizado, escore, limiar, versão do modelo, explicação, decisão e ator. Há também guardrails codificados no agente — exclusão de sleeping dogs da camada proativa, teto de desconto e máximo de dois canais por cliente — e a ressalva metodológica de que o SHAP descreve o comportamento do modelo, não causalidade no mundo real."
    ],
    "bullets": [
      "Uma frase: predição de churn explicável + recomendação prescritiva + agente IA educacional/empático + jornada pedagógica, auditável ponta a ponta.",
      "Fluxo: treino offline (Marimo EDA -> XGBoost/Optuna k-fold + calibração sigmoid + threshold por custo -> model.joblib) e pontuação EM LOTE dos 4.000 clientes -> Supabase; app Next.js na Vercel serve previsões e gera narrativa/recomendação server-side.",
      "Quatro telas (Dashboard Executivo, EDA Interativa, Consulta Individual, Visão de Carteira) + página pública LGPD; cada tela com cartão 'Aprender' (PBL).",
      "Consulta Individual concentra a melhoria avaliada: waterfall SHAP por usuário, drivers acionáveis vs não-acionáveis, explicação narrativa e recomendação (oferta/canal/copy/timing).",
      "Modelo final validado (model_card): TEST ROC-AUC 0,988, recall 0,95, overfit gap 0,010; leakage auditado e Month_to_end_contract removido (teste A/B com delta de AUC +0,0000).",
      "Auditabilidade: ADRs, matriz de rastreabilidade, model card e audit_log (input anonimizado, escore, limiar, versão do modelo, decisão, ator); guardrails codificados (sleeping dogs excluídos, teto de desconto, máx. 2 canais)."
    ],
    "stats": [
      {
        "value": "4.000",
        "label": "Clientes pontuados em lote (dataset 4.000 x 14)",
        "hint": "docs/SPEC.md §6 / README.md"
      },
      {
        "value": "26,5%",
        "label": "Churn no dataset (2.939 não / 1.061 sim)",
        "hint": "docs/SPEC.md §6; model_card §2 (26,52%)"
      },
      {
        "value": "0,988",
        "label": "TEST ROC-AUC do modelo final (overfit gap 0,010)",
        "hint": "docs/model_card.md §5 (0,9878) e §6 (gap +0,0103)"
      },
      {
        "value": "4 + 1",
        "label": "Telas + página pública de governança LGPD",
        "hint": "README.md §Telas / docs/SPEC.md §9"
      }
    ],
    "callout": {
      "label": "O que torna a solução distinta",
      "text": "Não é só um classificador de churn: a previsão é explicada por usuário (waterfall SHAP), traduzida em linguagem natural empática e convertida em ação prescritiva com guardrails codificados (sleeping dogs nunca são perturbados, teto de desconto, máx. 2 canais), tudo registrado em audit_log para auditoria LGPD/ANPD."
    },
    "evidenceKeys": [
      "dashboard",
      "individual"
    ]
  },
  {
    "id": "arquitetura",
    "eyebrow": "Stack e separação treino × inferência",
    "title": "Arquitetura técnica",
    "lead": "O Vitaliza separa rigorosamente o que é treinado offline do que é servido online: um modelo XGBoost calibrado pontua os 4.000 clientes em lote e o Supabase guarda esses escores reais, enquanto o app Next.js na Vercel serve previsões já auditáveis. Sobre essa base, dois agentes de LLM (tutor e advisor) e uma camada de voz com fallback compõem a experiência explicável.",
    "paragraphs": [
      "O front-end e a camada de API rodam em Next.js (App Router) na Vercel, conforme a ADR-0001, que registra a diretriz do cliente pela dobradinha Vercel + Supabase. A interface usa React 19.2.4 sobre Next 16.2.9 (package.json), Tailwind CSS 4 e componentes shadcn/ui (estilo new-york) construídos a partir de primitivas Radix UI; gráficos vêm do Recharts e notificações do Sonner. A persistência, autenticação e o controle de acesso ficam no Supabase (Postgres + RLS + Auth por perfil CS/Exec, via @supabase/ssr), com tabelas como customer, score, explanation, intervention, audit_log, principios e profiles. O sistema está no ar em modo demonstração de acesso aberto: o middleware atualmente apenas repassa a requisição (lib/supabase/middleware.ts), e o que permanece em código é o modelo de papéis/identidade (lib/auth.ts, com role CS/Exec resolvida pela tabela profiles) — reativar a proteção de rotas exige restaurar a enforcement no middleware.",
      "A separação treino × inferência exigida pelo checklist é o eixo da arquitetura. O treino é offline em Python 3.12 (notebook Marimo, scripts de treino, SHAP e serialização joblib), produzindo pipeline/artifacts/model.joblib e artefatos correlatos. A inferência é um pipeline distinto (pipeline/inference.py) que carrega o modelo serializado, reaplica o mesmo pré-processamento do treino (proteção anti-leakage) e pontua os clientes. A ADR-0011 fixa a escolha de inferência em lote servida pelo Supabase em vez de inferência online: como as dependências do XGBoost calibrado + SHAP (xgboost, shap, scikit-learn, scipy) são pesadas para uma Vercel Python Function — com risco de estourar limite de tamanho e cold start —, optou-se por pontuar os 4.000 clientes em lote, persistir escore, tier, arquétipo e waterfall SHAP local em score/explanation, e fazer o app servir essas previsões reais. A ADR-0005 documenta o desenho alternativo de função Python online (contrato {churn_probability, risk_tier, top_drivers, shap_local, arquétipo} + registro em audit_log), mantido como caminho de evolução. Vale a ressalva: a inferência efetivamente servida hoje é o lote real do XGBoost; a função Python online da ADR-0005 é desenho/caminho de evolução, e o what-if ad hoc interativo usa um surrogate heurístico transparente (lib/heuristic.ts), claramente rotulado, ancorado no score real + delta (ADR-0014), e não o modelo de produção.",
      "A camada de IA conversacional tem dois agentes server-side, sempre com a chave de API no servidor. O advisor prescritivo roda em OpenRouter (/api/agent, lib/agent.ts) e produz a Função A (narrativa explicativa, máx. 150 palavras, com guardrail de nunca afirmar causalidade) e a Função B (recomendação oferta/canal/copy/timing). Os guardrails vivem tanto no system prompt quanto em código: a função runAdvisor recusa qualquer oferta proativa para o arquétipo sleeping_dog ou quando proactive_allowed === false, e sanitizeRecommendation limita a no máximo 2 canais (MAX_CHANNELS) entre uma lista permitida e tampa qualquer desconto acima de 20% (MAX_DISCOUNT_PCT) tanto na oferta quanto na copy. O tutor pedagógico (PBL, empático, sem jargão) roda em DeepSeek (/api/tutor, deepseek-chat), com escopo restrito ao repositório (ADR-0012). Há também um fallback determinístico offline para advisor e capstone quando o LLM está indisponível. O modelo padrão do advisor no código é anthropic/claude-sonnet-4.6 quando OPENROUTER_MODEL não está definido — configurável por variável de ambiente.",
      "A voz (TTS) é uma camada server-side com seleção e fallback automático (lib/tts/index.ts e ADR-0013). Existem dois provedores — ElevenLabs (primário por padrão) e Google Cloud TTS (fallback por padrão) — e a ordem de tentativa é configurável por TTS_PROVIDER / TTS_FALLBACK_PROVIDER; se nenhum provedor estiver configurado ou todos falharem, o cliente degrada para a voz do navegador (Web Speech). A função synthesizeSpeech nunca lança exceção — retorna um outcome com o motivo (desativado, nao_configurado, falha_provedores) — e o texto é normalizado e truncado a 1.500 caracteres (TTS_TEXT_LIMIT). O DeepSeek permanece apenas como LLM de texto; o TTS é uma camada separada. As telas materializam a explicabilidade: Trilha de Aprendizado (jornada Bloom em 6 missões, porta de entrada pedagógica), Dashboard Executivo (KPIs e simulador de ROI), EDA Interativa (6 visualizações do dataset), Consulta Individual (score + tier + waterfall SHAP + narrativa + recomendação, com o Simulador Vivo client-side) e Visão de Carteira (ranking por risco com bloqueio de sleeping dogs). O dataset é único: data/gym_churn_us.csv, 4.000 registros × 14 colunas, versionado por SHA-256, com taxa de churn de 26,52% (1.061/4.000) e split estratificado 70/15/15 (seed 42)."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "Next 16.2.9 / React 19.2.4",
        "label": "Front na Vercel",
        "hint": "App Router + Tailwind 4 + shadcn (new-york)/Radix (package.json)"
      },
      {
        "value": "4.000 × 14",
        "label": "Dataset gym_churn_us.csv",
        "hint": "churn 26,52% (1.061/4.000); split 70/15/15 seed 42"
      },
      {
        "value": "Lote real + surrogate",
        "label": "Inferência (ADR-0011)",
        "hint": "4.000 clientes pontuados pelo XGBoost real no Supabase; what-if usa heurística rotulada"
      },
      {
        "value": "desconto ≤20% · ≤2 canais",
        "label": "Guardrails em código",
        "hint": "MAX_DISCOUNT_PCT / MAX_CHANNELS + recusa sleeping_dog (lib/agent.ts)"
      }
    ],
    "callout": {
      "label": "O que sustenta a explicabilidade",
      "text": "A previsão servida é 100% do modelo real (XGBoost calibrado + SHAP local), auditável no banco (score/explanation) e registrável em audit_log. O agente nunca afirma causalidade — por system prompt e por código — e o desconto/canais são limitados deterministicamente após a resposta do LLM."
    },
    "evidenceKeys": [
      "decisions",
      "modelCard"
    ]
  },
  {
    "id": "modelo",
    "eyebrow": "Tese",
    "title": "O modelo e o rigor",
    "lead": "O ROC-AUC de 0,9878 no conjunto de teste não é \"bom demais para ser verdade\": é alto porque o churn neste dataset é fortemente previsível por engajamento, e provamos por A/B que não depende da variável suspeita de vazamento. O rigor está documentado em evidência reproduzível, não em opinião.",
    "paragraphs": [
      "Todas as métricas reportadas vêm de um holdout estratificado de teste (n=600), separado de treino (n=2800) e validação (n=600), com taxa-base de positivos de 0,265 — ou seja, o modelo precisa superar com folga o desempenho de simplesmente chutar a classe majoritária. No teste, o modelo (XGBoost com hiperparâmetros via Optuna em validação cruzada, calibrado por sigmoid) atinge ROC-AUC 0,9878 (a probabilidade de o modelo ranquear um cancelador acima de um não-cancelador), PR-AUC 0,9748, recall 0,9497, precisão 0,8032 e F1 0,8703. O gap de generalização — ROC-AUC de treino (0,9981) menos teste (0,9878) — é de 0,0103, classificado no próprio pipeline como 'sem overfit relevante'.",
      "O limiar de decisão (threshold) não foi fixado em 0,5 por inércia, mas escolhido por custo sob a restrição operacional recall >= 0,70. O corte selecionado é 0,05, com custo esperado de 282,0 e recall no limiar de 0,9686, dentro de uma região factível não-vazia. É esse corte de 5% que a estação 'Avaliar' da Trilha de Aprendizado abre por padrão — a escolha de threshold fica exposta e auditável, não escondida no código.",
      "O ponto mais sensível para uma banca — um AUC ~0,99 levanta suspeita imediata de vazamento (leakage) — é tratado por um teste A/B explícito. A variável 'Month_to_end_contract' (quanto falta para o contrato acabar) é 0,973 correlacionada com 'Contract_period', funcionando como um 'relógio do contrato' que antecipa o desfecho — um quase-leakage de futuro. Esse A/B usa um modelo leve (LogisticRegression, teste 30%) de propósito, para isolar o efeito da feature, não para reproduzir o modelo de produção: treinando-o com e sem a variável, o ROC-AUC de teste é 0,9739 vs 0,9739, delta +0,0000. Removê-la não custou nada, porque o desempenho nunca veio dela. Ela foi removida; 'Lifetime' (tempo de casa observável hoje) foi mantida por ser causal-plausível, não-futura e necessária para as flags derivadas. Os drivers que dominam são sinais de engajamento legítimos e acionáveis: delta_freq (correlação -0,60 com o alvo), flag_early_user (+0,56), Lifetime (-0,44), ratio_freq_atual_vs_lifetime (-0,43) e Avg_class_frequency_current_month (-0,41).",
      "A confiança na probabilidade — não só no ranqueamento — é tratada via calibração: o modelo é calibrado por sigmoid e a estação 'Avaliar' deixa isso explorável ao vivo, com diagrama de confiabilidade (compara a probabilidade média prevista por faixa com a frequência real observada de cancelamento) e Brier score (média de (p − y)², onde menor é melhor e 0 é previsão perfeita) calculados ao vivo sobre os escores reais (p, y) — o repositório define a fórmula e a UI a avalia, sem fixar um valor numérico de Brier. Por fim, há uma honestidade declarada quanto ao what-if: a simulação interativa NÃO roda o XGBoost online (a inferência real é em lote no Supabase, ADR-0011), e sim um surrogate transparente (heurística pura, client-safe). Pela ADR-0014, a projeção ancora no score real do XGBoost e aplica apenas o delta da heurística — clamp01(score_real + (heuristica_modificada − heuristica_base)) — com os dois números rotulados ('Atual · XGBoost' / 'Projeção · simulação') e a ressalva de que toda explicabilidade descreve o comportamento do modelo, não causalidade do mundo real."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "0,9878",
        "label": "ROC-AUC (teste)",
        "hint": "holdout estratificado, n=600"
      },
      {
        "value": "0,9748",
        "label": "PR-AUC (teste)",
        "hint": "taxa-base de positivos 0,265"
      },
      {
        "value": "0,9497",
        "label": "Recall (teste)",
        "hint": "precisão 0,8032 · F1 0,8703"
      },
      {
        "value": "0,0103",
        "label": "Overfit gap (train−test AUC)",
        "hint": "'sem overfit relevante'"
      },
      {
        "value": "+0,0000",
        "label": "Delta AUC da var. suspeita",
        "hint": "0,9739 vs 0,9739 (A/B LogReg) — não é leakage"
      },
      {
        "value": "0,05",
        "label": "Threshold por custo",
        "hint": "restrição recall >= 0,70; recall 0,9686"
      }
    ],
    "callout": {
      "label": "O que o A/B prova",
      "text": "Remover a variável suspeita de vazamento (Month_to_end_contract) custa ROC-AUC +0,0000 no A/B controlado (0,9739 vs 0,9739, com LogReg leve para isolar a feature). O 0,988 do modelo de produção não é leakage: vem de sinais de engajamento legítimos e acionáveis, não de um atalho que antecipa o desfecho."
    },
    "evidenceKeys": [
      "honesty",
      "leakage",
      "avaliar",
      "modelCard"
    ]
  },
  {
    "id": "explicabilidade",
    "eyebrow": "Tese",
    "title": "Explicabilidade → ação",
    "lead": "A Vitaliza não para na previsão de churn: ela traduz cada score em explicação local (SHAP), em narrativa sem jargão e em uma oferta prescritiva — sempre com guardrails embutidos no código, não só no prompt. O fio condutor é a honestidade: a explicabilidade descreve o comportamento do modelo, nunca causalidade do mundo real.",
    "paragraphs": [
      "A camada de explicabilidade opera em dois níveis. O nível LOCAL responde \"por que ESTE membro?\": a Consulta Individual mostra o score (gauge), o arquétipo e um waterfall SHAP — técnica que decompõe a previsão atribuindo a cada variável o quanto ela empurrou o risco para cima ou para baixo neste caso específico (campo pred.shap_local renderizado pelo ShapWaterfall em components/individual-view.tsx). O nível GLOBAL aparece quando o advisor resume os principais fatores SHAP (summarizeDrivers usa pred.top_drivers, com direção up/down, valor SHAP e flag de acionável) em linguagem corrente. Em ambos, interface e prompt repetem o mesmo aviso: a leitura descreve o COMPORTAMENTO DO MODELO, não relações de causa e efeito — texto fixado na CardDescription da tela (components/individual-view.tsx) e nos system prompts de lib/agent.ts (TUTOR_SYSTEM e ADVISOR_SYSTEM).",
      "O advisor (lib/agent.ts, runAdvisor) entrega duas saídas. A Função A é a explicação narrativa (campo narrative, no máximo 150 palavras, sem jargão) que diz por que o membro está naquele risco e quais variáveis acionáveis pesaram, com guardrail obrigatório contra afirmar causalidade (formulações como \"o modelo associou\", \"pesou no cálculo\"). A Função B é a recomendação prescritiva — objeto { offer, channel, copy, timing }. Crucial para uma banca: os guardrails não vivem só no system prompt, vivem também no código. sanitizeRecommendation aplica o teto de desconto (constante MAX_DISCOUNT_PCT = 20, via regex que rebaixa para 20% qualquer percentual citado ACIMA do teto em offer e copy) e o limite de canais (MAX_CHANNELS = 2, filtrando contra a lista permitida e-mail, whatsapp, push, ligacao, sms; se nada sobra, default e-mail). Há fallback determinístico (fallbackAdvisor) que opera sem LLM, e a UI avisa esse modo de contingência via toast.",
      "O guardrail mais conceitual é a não-intrusão do \"cão que dorme\" (sleeping dog): vínculo longo com uso baixíssimo. runAdvisor checa em código — antes de qualquer chamada ao LLM — se pred.archetype === 'sleeping_dog' ou pred.proactive_allowed === false; nesse caso retorna blocked: true, com narrativa explicando que contatá-lo tende a antecipar o cancelamento, e recommendation: null. Não é uma instrução que o modelo de linguagem pode contornar; é uma trava determinística. A mesma regra reaparece no fallback (fallbackAdvisor), no otimizador (findCheapestLever) e no proxy de uplift (upliftProxy) — coerência de política em toda a pilha.",
      "O Simulador Vivo transforma a tela em laboratório: o usuário arrasta alavancas acionáveis de um membro e vê o modelo recalcular ao vivo (score, waterfall e arquétipo). A decisão de design que sustenta a defesa acadêmica é a ANCORAGEM HONESTA (ADR-0014), implementada em lib/simulator/engine.ts: projected = clamp01(realProb + simNew − simBaseline). O ponto de partida é o score REAL do XGBoost; o delta vem do modelo transparente e auditável (a heurística pura, client-safe). O simulador nunca toca o XGBoost real (spec §12). Em modo amostra (sem score real), realProb == heurística base, então a projeção degrada de forma consistente. A spec frisa o objetivo: como o artefato é acadêmico e não tem demo ao vivo, a feature foi desenhada para um momento de autodescoberta.",
      "Sobre o simulador roda o otimizador da alavanca mais barata (findCheapestLever em engine.ts). Ele varre as 4 alavancas declaradas em lib/simulator/levers.ts (frequência de aulas no mês — a alavanca herói; participação em desafios em grupo; duração do plano; meses até o fim do contrato), testa cada valor candidato dentro do range e escolhe a menor mudança de esforço (esforço normalizado |Δ|/(max−min) para sliders; custo por nível para toggle e select) que rebaixe o membro em pelo menos um tier de risco. Ele retorna null exatamente quando NÃO se deve agir: sleeping dog / proativo bloqueado, membro já no tier 'baixo', ou nenhuma alavanca isolada cruza o tier dentro do range — refletindo a mesma não-intrusão do advisor.",
      "O salto conceitual final é tratar UPLIFT como proxy honesto, não como modelo treinado (lib/trilha/uplift.ts, ADR-0016). A tese: risco != quem abordar. Prever churn responde \"quem vai cancelar\"; uplift responde \"quem RESPONDE à intervenção\" (efeito incremental). Os dois divergem — há quem cancelaria de qualquer forma e quem ficaria de qualquer forma. Como o dataset gym_churn não tem grupo de tratamento/controle, a ADR-0016 recusa treinar um modelo de uplift (T-/X-/S-learner exigem o tratamento observado) e em vez disso deriva uplift = max(0, realProb − projeção da intervenção mais barata), reusando findCheapestLever já ancorado no score real. O caso-limite que prova o ponto: o \"cão que dorme\" tem uplift 0 por não-intrusão (reason 'nao_intrusao'), apesar de risco alto — a hipótese de uplift NEGATIVO aparece como racional na ADR-0016, não como valor computado. O valor esperado preservado por membro abordado é uplift × churnLoss, e a ADR documenta o caminho para o uplift real (experimento A/B + T-learner validado por curva de Qini), mantendo os mesmos guardrails (não-intrusão, teto de 20%, limite de canais)."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "20%",
        "label": "Teto de desconto",
        "hint": "MAX_DISCOUNT_PCT, em código + prompt"
      },
      {
        "value": "2",
        "label": "Máx. de canais por membro",
        "hint": "MAX_CHANNELS, lista permitida"
      },
      {
        "value": "0",
        "label": "Uplift do \"cão que dorme\"",
        "hint": "não-intrusão, apesar de risco alto"
      },
      {
        "value": "4",
        "label": "Alavancas acionáveis",
        "hint": "frequência é a alavanca herói"
      },
      {
        "value": "R$ 712",
        "label": "Perda por churn (LTV)",
        "hint": "R$89/mês × 8 meses (DEFAULT_COSTS)"
      },
      {
        "value": "≤150",
        "label": "Palavras na narrativa (Função A)",
        "hint": "limite no ADVISOR_SYSTEM"
      }
    ],
    "callout": {
      "label": "Veja ao vivo",
      "text": "Arraste a alavanca de frequência e o modelo recalcula ao vivo — score, waterfall SHAP e até o arquétipo viram na sua frente. E o número que muda parte do score REAL do XGBoost (ancoragem honesta da ADR-0014): só o delta vem do modelo transparente. O simulador nunca toca o modelo real."
    },
    "evidenceKeys": [
      "individual",
      "explicar",
      "avaliar"
    ]
  },
  {
    "id": "etica",
    "eyebrow": "Não-intrusão por design",
    "title": "Ética e governança (LGPD)",
    "lead": "O Vitaliza trata a não-intrusão como uma propriedade do código, não como uma promessa de página. O perfil \"cão que dorme\" — vínculo longo e uso quase zero — é excluído de qualquer campanha proativa por um guardrail que recusa gerar a oferta antes mesmo de chamar o modelo de linguagem.",
    "paragraphs": [
      "A governança ética do artefato repousa sobre seis princípios publicados em página pública (rota /principios-de-personalizacao), com base legal declarada: a LGPD (Lei 13.709/2018) e a Nota Técnica ANPD 07/2025 sobre transparência em decisões automatizadas. Os seis princípios, no texto do produto, são: Finalidade — \"Os dados comportamentais (frequência de uso, tipo de contrato, tempo de assinatura, participação em desafios) são usados exclusivamente para estimar risco de cancelamento e oferecer ações de retenção úteis ao usuário\"; Transparência — \"Toda previsão é explicável: mostramos quais variáveis pesaram e em que direção. As explicações descrevem o comportamento do modelo, não relações de causa e efeito\"; Proporcionalidade — \"No máximo 2 canais de contato simultâneos por pessoa; nenhuma oferta de desconto sem segmentação prévia\"; Não-intrusão — \"Usuários de baixíssimo uso e vínculo longo (perfil 'cão que dorme') são excluídos de qualquer campanha proativa, para respeitar quem não quer ser contatado\"; Contestação — \"Qualquer pessoa pode solicitar revisão humana de uma decisão automatizada e a exclusão de seus dados do processo de personalização\"; e Auditabilidade — \"Cada previsão e cada ação ficam registradas (entrada anonimizada, score, versão do modelo, explicação, decisão) para auditoria e melhoria contínua\". Contestação e Auditabilidade são compromissos declarados na página: a página encaminha o exercício de direitos ao canal de atendimento, sem que os arquivos lidos mostrem um fluxo automatizado de revisão/exclusão ou o código de persistência do log de auditoria.",
      "O diferencial frente a uma política meramente declarativa é que parte desses princípios está implementada como restrição verificável em código. A função runAdvisor (lib/agent.ts) aplica um guardrail rígido — \"don't wake the sleeping dog\": se o arquétipo é sleeping_dog OU proactive_allowed === false, o sistema retorna blocked: true e a explicação de não-intrusão SEM nunca chamar o LLM para gerar uma oferta. A mensagem de bloqueio é explícita ao membro: contatá-lo \"tende a antecipar o cancelamento em vez de evitá-lo\". O mesmo bloqueio existe no fallback determinístico (fallbackAdvisor), de modo que a proteção persiste mesmo quando o modelo de linguagem está indisponível. Aqui o produto é cuidadoso em afirmar que os fatores SHAP — a explicação local que indica quanto cada variável pesou e em que direção — descrevem o comportamento do modelo, não causa e efeito do mundo real.",
      "A proporcionalidade também é codificada como tetos numéricos exatos. As constantes MAX_DISCOUNT_PCT = 20 e MAX_CHANNELS = 2 fixam o teto de desconto em 20% e o máximo de 2 canais por pessoa. A lista ALLOWED_CHANNELS restringe os canais a e-mail, whatsapp, push, ligacao e sms. A função sanitizeRecommendation atua como clamp sobre a saída do LLM: filtra canais fora da lista, corta o excedente acima de 2 canais e reescreve qualquer percentual acima de 20% para 20% nos campos de oferta e de copy. Ou seja, mesmo que o modelo de linguagem proponha algo fora da política, o código corrige antes de entregar — os guardrails vivem tanto no prompt do sistema quanto no código.",
      "A decisão de excluir os sleeping_dogs e de organizar a carteira em arquétipos acionáveis está registrada como ADR. A ADR-0008 (Accepted, 2026-06-17) define cinco arquétipos — preço_sensível, desengajado_conteúdo, early_dropper, sleeping_dog, concorrente_driven — e estabelece o critério do cão que dorme como Lifetime > 6m e freq < 0,5; nesse grupo a Função B (recomendação) recusa gerar oferta, a Visão de Carteira (Tela 4) bloqueia a ação em lote e expõe link para a política pública (LGPD). A ADR-0008 também documenta — como política, não como mecanismo verificado nos arquivos lidos — um trigger de escalonamento: cancelamentos de S2 acima de 20% após disparo levam a pausa. Complementarmente, a ADR-0010 (Accepted, 2026-06-17) registra a regra de marca-neutra (RM4): usar a paleta da allla sem qualquer menção à marca, com verificação por grep -ri \"allla\" retornando vazio no app — um ponto de governança de identidade, não de proteção de dados pessoais."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "20%",
        "label": "Teto de desconto (em código)",
        "hint": "MAX_DISCOUNT_PCT = 20"
      },
      {
        "value": "2",
        "label": "Máx. de canais por pessoa",
        "hint": "MAX_CHANNELS = 2"
      },
      {
        "value": "6",
        "label": "Princípios LGPD publicados",
        "hint": "Finalidade a Auditabilidade"
      },
      {
        "value": "5",
        "label": "Arquétipos acionáveis",
        "hint": "ADR-0008"
      }
    ],
    "callout": {
      "label": "O que de fato impede o abuso",
      "text": "A não-intrusão não depende de boa vontade do operador: o código recusa gerar oferta para o 'cão que dorme' antes de chamar o modelo, e um clamp reescreve qualquer desconto acima de 20% e descarta canais fora da lista — guardrails que persistem inclusive no modo offline sem LLM."
    },
    "evidenceKeys": [
      "decisions"
    ]
  },
  {
    "id": "trilha",
    "eyebrow": "Jornada pedagógica",
    "title": "A Trilha de Aprendizado",
    "lead": "A Trilha de Aprendizado converte o Vitaliza de \"ferramenta com explicações\" em uma jornada pedagógica guiada: seis missões que sobem os degraus da Taxonomia de Bloom, ancoradas em quatro princípios de aprendizagem declarados na especificação — Bloom, construtivismo (faded scaffolding), prática de recuperação (predict-first) e productive failure. Como o artefato é avaliado sem demonstração ao vivo — o avaliador abre o sistema sozinho — a trilha é o roteiro que conduz a leitura.",
    "paragraphs": [
      "A fundamentação pedagógica é declarada de forma explícita na especificação (§1) e materializada no código. A espinha é a Taxonomia de Bloom, subindo os degraus cognitivos Entender -> Analisar -> Aplicar -> Avaliar -> Criar; cada missão em lib/trilha/missions.ts carrega um campo bloom com exatamente um desses níveis. Sobre essa espinha incidem três princípios complementares. O construtivismo aparece como faded scaffolding (andaime decrescente): muito apoio no início -- a instrução passo a passo das missões 1 e 2 -- e apoio que diminui até as missões 4 e 5, que a spec descreve como 'mais enxutas' e cujo painel-guia colapsa por padrão. A prática de recuperação (retrieval practice) entra no formato predict-first: cada missão fecha com um check formativo em que o aprendiz primeiro prevê (\"antes de ver, o que você acha?\") e só depois recupera o que aprendeu, recebendo feedback por opção -- e sem punição: pode-se concluir mesmo errando, mas o feedback ensina. O productive failure aparece concretamente na missão Simular, cuja instrução pede \"tente você primeiro: arraste a frequência de aulas para cima... só depois clique em 'Simular esta alavanca' para ver a sugestão do otimizador\".",
      "As seis estações percorrem o ciclo completo de raciocínio sobre o churn. Entender (Bloom: Entender, /dashboard?trilha=entender) dimensiona o problema: churn mensal de 10,2% contra meta de 6,0%, e a noção de custo/ROI; seu check fixa a taxa-base do dataset em 26,5% (\"pouco mais de 1 em cada 4\"), reforçando que um modelo só é útil se supera o chute da taxa-base. Explicar (Bloom: Analisar, /individual?trilha=explicar) lê, para um membro específico, por que o modelo o considera em risco, via waterfall SHAP -- a técnica que decompõe a previsão atribuindo a cada variável quanto ela moveu o score daquele membro (comportamento do modelo, não causa e efeito do mundo real). Simular (Bloom: Aplicar, /individual?trilha=simular) reusa o Simulador Vivo: o aprendiz mexe nas alavancas e vê o modelo recalcular o risco ao vivo. Decidir (Bloom: Avaliar no código, /individual?trilha=decidir) transforma a leitura em ação de retenção custo-consciente, incluindo saber quando NÃO agir -- a regra do \"cão que dorme\" (vínculo longo, uso quase zero), em que o contato proativo tende a antecipar o cancelamento e o sistema bloqueia a ação proativa por código (e limita descontos a 20%). Avaliar (Bloom: Avaliar, /trilha/avaliar?trilha=avaliar) é a estação de sistema, com o trade-off do limiar e a calibração. E Síntese (Bloom: Criar, /trilha/sintese?trilha=sintese) é o capstone: um resumo executivo gerado pelo agente, imprimível, que costura a estratégia para a liderança.",
      "A inteligência de engenharia da trilha está em não recriar telas. Conforme o ADR-0015, ela é um overlay guiado dirigido pela URL: cada missão abre a tela real que já existe com o parâmetro ?trilha=<id>, e um componente GuideRail -- montado uma única vez no AppShell -- aparece sempre que esse parâmetro está presente, sobrepondo objetivo, instrução, semente de tutor, o botão \"Concluir missão\" e o check formativo. As telas reais não mudam (a única exceção citada no ADR é a Consulta Individual, que ganha o módulo de casos contrastantes quando ?trilha=explicar). Apenas as estações sem tela equivalente -- Avaliar (sistema) e Síntese (capstone) -- ganham rota própria sob /trilha/*. As missões 2 a 4 reusam a mesma tela /individual com lentes diferentes (waterfall -> simulador -> advisor), e uma fonte única de verdade (lib/trilha/missions.ts) alimenta a capa, o GuideRail e o check, evitando divergência.",
      "O progresso é deliberadamente local e efêmero, decisão coerente com um artefato avaliado por várias pessoas. O ADR-0015 fixa o armazenamento em sessionStorage (não localStorage), sem login nem servidor de estado, via hook use-trilha-progress implementado com useSyncExternalStore (SSR-safe), sob a chave vitaliza:trilha:v1. A consequência projetada é o reset por visita: cada visita começa limpa -- o progresso zera ao fechar a aba/janela -- mas sobrevive a um reload acidental no meio do tour; a capa ainda oferece um botão \"Reiniciar trilha\" para zerar manualmente. Por decisão explícita, o progresso não sincroniza entre abas nem dispositivos. As estações quantitativas usam dados honestos -- os escores REAIS do modelo (churn_probability do XGBoost) somados a true_churn, não a heurística -- e a linguagem descreve sempre o comportamento do modelo, não causalidade."
    ],
    "bullets": [
      "Bloom como espinha: Entender -> Analisar -> Aplicar -> Avaliar -> Criar, um nível por missão (campo bloom em missions.ts).",
      "Faded scaffolding: instrução completa nas missões 1-2; missões 4-5 'mais enxutas' com painel-guia que colapsa por padrão (apoio decrescente).",
      "Predict-first: check formativo onde o aprendiz prevê antes de ver; feedback por opção; sem punição por errar.",
      "Productive failure concreto em Simular: 'Tente você primeiro' antes de revelar o otimizador.",
      "Overlay dirigido por URL (?trilha=<id>) + GuideRail no AppShell: não recria telas reais (exceto casos contrastantes em Individual com ?trilha=explicar).",
      "Reset por visita via sessionStorage (chave vitaliza:trilha:v1), sem login/servidor; sobrevive a reload, zera ao fechar a aba; não sincroniza entre abas.",
      "Dados honestos: threshold e calibração sobre os pares (p,y) reais do XGBoost (churn_probability + true_churn), não heurística; linguagem não-causal."
    ],
    "stats": [
      {
        "value": "6",
        "label": "missões (Bloom)",
        "hint": "Entender, Explicar, Simular, Decidir, Avaliar, Síntese/capstone"
      },
      {
        "value": "10,2%",
        "label": "churn mensal",
        "hint": "contra meta de 6,0% (missão Entender)"
      },
      {
        "value": "26,5%",
        "label": "taxa-base do dataset",
        "hint": "fração que cancelou no conjunto de treino"
      },
      {
        "value": "sessionStorage",
        "label": "reset por visita",
        "hint": "chave vitaliza:trilha:v1; zera ao fechar a aba"
      }
    ],
    "callout": {
      "label": "O insight central de Avaliar",
      "text": "A estação Avaliar ensina que o melhor corte de decisão (threshold) é o que MAXIMIZA o ROI, não o que maximiza o recall: baixar o corte para 'não perder nenhum churn' gera muitos falsos positivos (contatar quem não ia cancelar), encarecendo a operação. A calibração responde 'quando o modelo diz 70%, ~70% de fato cancelam?', medida na spec por curva de confiabilidade e Brier score."
    },
    "evidenceKeys": [
      "trilha",
      "avaliar",
      "sintese"
    ]
  },
  {
    "id": "avaliar",
    "eyebrow": "Guia de avaliação",
    "title": "Como avaliar este artefato",
    "lead": "Cada exigência do checklist oficial está ligada a uma evidência verificável em dois lugares: a tela viva no sistema no ar e o artefato de código/documentação correspondente. A banca pode auditar requisito por requisito sem depender de demonstração assistida.",
    "paragraphs": [
      "O artefato foi construído para ser auditável de forma autônoma. O sistema está no ar em https://vitaliza-retencao.vercel.app com acesso aberto (sem login, em modo demonstração), e o repositório mantém uma Matriz de Rastreabilidade (docs/traceability-matrix.md) que liga cada requisito ao componente que o cumpre e à sua fundamentação na Trilha de Tecnologia. Recomenda-se ao avaliador começar pela Trilha de Aprendizado (/trilha), uma jornada guiada de seis missões pela taxonomia de Bloom (Entender, Explicar, Simular, Decidir, Avaliar e Sintetizar) sobreposta às telas reais — em formato de tour de ~13 minutos —, ou seguir o roteiro de telas avulsas de ~5 minutos em docs/roteiro-demo.md.",
      "Modelo validado, sem overfit nem vazamento. O treino fica em pipeline/train_final.py (XGBoost com otimização de hiperparâmetros via Optuna e validação cruzada k-fold de 5 dobras, sobre um split 70/15/15). As métricas no conjunto de teste, registradas em metrics.json e no Dashboard, são: ROC-AUC 0,988 (a ROC-AUC mede a capacidade do modelo de ordenar quem vai cancelar acima de quem fica; 1,0 é perfeito, 0,5 é acaso), PR-AUC 0,975, recall 0,95, F1 0,87 e lift 3,77. O risco de overfit (o modelo decorar o treino em vez de generalizar) é controlado por um gap treino−teste de AUC de apenas 0,010. Quanto a vazamento (leakage, quando uma variável carrega informação do futuro/do alvo e infla a métrica artificialmente), a auditoria removeu a variável Month_to_end_contract, que tinha correlação 0,97 com o alvo, com ΔAUC 0,000 (docs/model_card.md, traceability A2); a estação 'Avaliar' da Trilha e docs/model-honesty.md trazem o teste A/B mostrando que removê-la custa AUC +0,0000, evidência reforçada por leakage-audit.json. Onde conferir: tela Dashboard e estação /trilha/avaliar (curva de calibração e Brier sobre escores reais — sem valor numérico de Brier publicado nos três documentos); docs/model_card.md e docs/model-honesty.md.",
      "Explicabilidade SHAP (global e local) com narrativa em linguagem natural. SHAP atribui a cada variável uma contribuição em direção ao risco de um caso específico, somando até a predição. O serviço pipeline/shap_service.py gera tanto a visão global (summary/beeswarm e importâncias de variáveis, em shap_global.json e na EDA/Dashboard) quanto a local (waterfall por cliente, persistida na tabela explanation). A explicação em linguagem natural é produzida pelo agente (lib/agent.ts, Função A). Onde conferir: tela EDA (global) e tela Consulta Individual (waterfall por cliente, item A4–A6 da matriz).",
      "Serviço web, separação treino × inferência e joblib. A aplicação Next.js na Vercel serve escores e explicações reais a partir do Supabase, segundo o padrão de inferência em lote (ADR-0011): pipeline/inference.py pontua os 4.000 clientes (dataset de 4.000 × 14) e grava no banco, com contrato de entrada tipado, model_version, threshold por custo e registro em audit_log. O treino (pipeline/train_*.py) e a inferência (pipeline/inference.py) são arquivos separados, e o modelo treinado é serializado em model.joblib. Onde conferir: qualquer tela com escores (Dashboard, Carteira, Individual) e docs/runbook.md; itens A7–A9 da matriz.",
      "Demonstração funcional e a melhoria pedida pelo professor. A melhoria — levar a explicabilidade individual de 'explicar a previsão' para 'algo acionável e prescritivo' — está na tela Consulta Individual (/individual, item B9): waterfall SHAP real por cliente, drivers marcados como acionáveis vs. não-acionáveis, e recomendação prescritiva de oferta/canal/copy/timing via agente. Ela é estendida pelo Simulador Vivo (seção E da matriz): arrastar 4 alavancas acionáveis (frequência de aulas, desafios em grupo, duração do plano, meses até o fim) recalcula score, waterfall SHAP e arquétipo ao vivo no cliente, com um otimizador que sugere a 'alavanca mais barata' e respeita a não-intrusão de sleeping dogs. O núcleo do simulador e da trilha é coberto por testes (28 no simulador via Vitest; suíte total de 63, cobrindo engine, narração, threshold e calibração — não o pipeline de treino). Onde conferir: /individual (botões 'Simular esta alavanca' e 'Tutor Explica'), passo 4 do docs/roteiro-demo.md, e a tabela 'Onde está a rigor' ao final do roteiro."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "0,988",
        "label": "ROC-AUC (teste)",
        "hint": "capacidade de ordenar churn; metrics.json / traceability A3"
      },
      {
        "value": "0,010",
        "label": "Gap overfit (AUC treino−teste)",
        "hint": "controle de generalização; traceability A1"
      },
      {
        "value": "0,95",
        "label": "Recall (teste)",
        "hint": "cobertura de quem cancela; traceability A3"
      },
      {
        "value": "+0,0000",
        "label": "AUC ao remover variável de leakage",
        "hint": "prova A/B em model-honesty.md (roteiro linha 67)"
      },
      {
        "value": "63",
        "label": "Testes na suíte total",
        "hint": "28 do simulador; Vitest; roteiro linhas 73-74"
      },
      {
        "value": "4.000 × 14",
        "label": "Dataset pontuado em lote",
        "hint": "inferência → Supabase; README linhas 78/114"
      }
    ],
    "callout": {
      "label": "Veja na prática",
      "text": "Na Consulta Individual, o botão 'Simular esta alavanca' anima sozinho a alavanca mais barata sugerida pelo otimizador e recalcula ao vivo score, waterfall SHAP e arquétipo — abrindo o 'Tutor Explica' em texto (áudio opcional). A projeção ancora no XGBoost real e soma só o delta de um surrogate transparente (projetado = clamp01(real + simNew − simBase), ADR-0014); o XGBoost de produção não é reexecutado nem alterado e o disclaimer deixa claro: descreve o comportamento do modelo, não causalidade."
    },
    "evidenceKeys": [
      "traceability",
      "roteiro",
      "modelCard"
    ]
  },
  {
    "id": "decisoes",
    "eyebrow": "Governança e rastreabilidade",
    "title": "Decisões e auditoria",
    "lead": "A explicabilidade do Vitaliza não termina no modelo: ela é institucionalizada em quatro instrumentos de auditoria que tornam cada escolha e cada intervenção inspecionáveis após o fato — um registro de 17 decisões de arquitetura, uma matriz que liga requisito a componente, um cartão de modelo no padrão tipo-ANPD e um log de auditoria de intervenções no banco.",
    "paragraphs": [
      "O primeiro pilar é o **decision log**: 17 ADRs (Architecture Decision Records), de ADR-0001 a ADR-0017, todos com status \"Accepted\", em que cada registro documenta contexto, decisão, opções consideradas e consequências, seguindo a convenção da organização. Eles cobrem desde escolhas de infraestrutura (ADR-0001, stack Vercel + Supabase + Next.js) até decisões diretamente ligadas à explicabilidade e à governança: o ADR-0006 firma a explicabilidade por SHAP global e local com explicação em linguagem natural via LLM; o ADR-0008 institui os 5 arquétipos e a exclusão proativa dos \"sleeping dogs\"; e o ADR-0009 define explicitamente a tríade de auditabilidade — decision log, audit_log e model card. SHAP, aqui, é o método que atribui a cada variável uma contribuição (positiva ou negativa) para a previsão de um cliente específico, permitindo abrir a \"caixa-preta\" caso a caso.",
      "O segundo pilar é a **matriz de rastreabilidade**, organizada em cinco seções (A a E), que liga cada requisito ao componente do artefato que o cumpre e à fundamentação correspondente. A seção A percorre o checklist oficial em dez itens (A1–A10), associando cada exigência a arquivos e evidências concretas — por exemplo, A1 (ausência de overfit) aponta para o split 70/15/15 com validação cruzada k-fold de 5 partições e busca de hiperparâmetros via Optuna, registrando um gap de AUC treino−teste de 0,010. As seções B (avaliação do professor, incluindo a melhoria B9 de explicabilidade individual acionável), C (regras mestras), D (consonância com o artefato de negócio) e E (o Simulador Vivo com seus oito requisitos E1–E8) completam o mapeamento, todas com itens marcados como prontos.",
      "O terceiro pilar é o **model card** do `vitaliza-churn-1.0.0`, declaradamente uma exigência tipo-ANPD. Ele documenta o escopo (priorização com humano no loop, não decisão automática nem juízo causal), os dados (4.000 registros, 14 colunas, fonte versionada por SHA-256), o método de validação e as métricas no conjunto de teste held-out (n=600): ROC-AUC de 0,9878, PR-AUC de 0,9748, recall de churn de 0,9497 e F1 de 0,8703. ROC-AUC mede a capacidade de o modelo ordenar corretamente quem tem mais risco; a calibração — feita por método sigmoid via CalibratedClassifierCV, escolhido pela PR-AUC na validação — busca aproximar a probabilidade emitida da frequência real de churn observada. O cartão também documenta a auditoria de vazamento de dados que removeu a variável `Month_to_end_contract` (correlação de 0,973 com o período de contrato, com delta de AUC de +0,0000 ao removê-la) e os limites declarados do modelo.",
      "O quarto pilar é o **audit_log no Supabase**, que registra as intervenções e ações. A matriz documenta o `audit_log` como parte do requisito de deploy (A8) e, na seção E (item E6), especifica que \"Aplicar intervenção\" grava em `intervention` e `audit_log`, com o caso \"sleeping dog\" registrado explicitamente como intervenção \"bloqueada\" — ou seja, até a recusa de uma ação por política fica auditável. O conjunto desses quatro instrumentos sustenta a tese central do dossiê: o que o sistema decide, e por que decidiu assim, pode ser reconstruído por um terceiro a partir de artefatos versionados, e não apenas afirmado."
    ],
    "bullets": [],
    "stats": [
      {
        "value": "17",
        "label": "ADRs no decision log",
        "hint": "Todos com status Accepted; ADR-0001 a ADR-0017"
      },
      {
        "value": "A–E",
        "label": "Seções da matriz de rastreabilidade",
        "hint": "Checklist oficial, professor, regras mestras, negócio e Simulador Vivo"
      },
      {
        "value": "0,9878",
        "label": "ROC-AUC (teste, n=600)",
        "hint": "Conjunto held-out; capacidade de ordenar risco"
      },
      {
        "value": "+0,0103",
        "label": "Gap ROC-AUC treino−teste",
        "hint": "0,9981 → 0,9878; sem overfit relevante (model card §6)"
      }
    ],
    "callout": {
      "label": "Auditável por desenho",
      "text": "Até a recusa de uma ação fica registrada: o item E6 da matriz especifica que uma intervenção bloqueada pela política 'não acorde o cão que dorme' (ADR-0008) é gravada no audit_log com status 'bloqueada' — a não-ação é tão auditável quanto a ação."
    },
    "evidenceKeys": [
      "decisions",
      "traceability",
      "modelCard"
    ]
  }
];
