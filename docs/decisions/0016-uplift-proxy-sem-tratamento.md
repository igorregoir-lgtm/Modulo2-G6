# ADR-0016 — Uplift como proxy honesto (sem dados de tratamento) + desenho de experimento

- **Status:** Accepted · **Data:** 2026-06-19

## Contexto
Prever **churn** responde "quem vai cancelar". A pergunta de negócio melhor é **uplift**: "quem
*responde* à intervenção?" — o efeito incremental de abordar um membro (CATE / treatment effect).
Os dois divergem: há quem cancelaria mesmo sem ação, quem fica de qualquer jeito, e quem só fica
*por causa* da ação. O "cão que dorme" é o caso extremo — risco alto e **uplift negativo** (abordar
acelera a saída), o que já motiva a política de não-intrusão ([ADR-0008](0008-arquetipos-sleeping-dog.md)).

**Restrição dura:** o dataset `gym_churn` tem rótulo de churn, mas **não tem grupo de
tratamento/controle** — ninguém foi aleatoriamente abordado/não-abordado. Sem isso, **não é possível
treinar um modelo de uplift honesto** (T-/X-/S-learner exigem o tratamento observado). Fingir um
seria a antítese do objetivo de honestidade do artefato.

## Decisão
Tratar uplift em **dois níveis**, sem inventar dados:

1. **Proxy de uplift (entregue agora).** Derivar o efeito incremental do **modelo transparente já
   existente**: para cada membro, `uplift = score_real − projeção_da_intervenção_mais_barata`
   (`lib/trilha/uplift.ts`, reusa `findCheapestLever`/`projectAnchored`, ancorado no score real —
   [ADR-0014](0014-ancoragem-simulador-real-mais-delta.md)). É rotulado explicitamente como
   **proxy**, não como modelo de uplift. "Cão que dorme"/proativo bloqueado → uplift 0 (não abordar).
   Surfaced na estação **Avaliar** da Trilha ("Risco ≠ uplift").
2. **Desenho de experimento (caminho para o uplift real).** Documentado abaixo: como coletar os
   dados que permitiriam treinar um modelo de uplift de verdade.

## Desenho de experimento (para coletar tratamento/controle)
- **Unidade:** membro elegível (exclui "cão que dorme" por não-intrusão).
- **Aleatorização:** split A/B estável por hash do id — *treatment* (recebe a oferta da Função B) vs
  *control* (sem contato proativo). Registrar a atribuição no `intervention`/`audit_log`.
- **Desfecho:** churn observado em janela fixa (ex.: 60 dias) pós-atribuição.
- **Estimando uplift:** treinar dois modelos (T-learner) — P(churn | tratado) e P(churn | controle) —
  e prever `uplift = P_control − P_treat` por membro. Validar com **curva de Qini / uplift@decil**.
- **Guardrails:** manter a não-intrusão (sleeping dogs fora), teto de desconto (20%) e o limite de
  canais já existentes; auditar cada atribuição.

## Opções consideradas
1. **Treinar uplift agora** (rejeitado): sem tratamento observado, qualquer "uplift" seria fabricado.
2. **Ignorar uplift** (rejeitado): perde o salto conceitual mais relevante para retenção.
3. **Proxy transparente + desenho de experimento (escolhido):** entrega o insight de forma honesta
   hoje e deixa o caminho metodológico para o uplift real amanhã.

## Consequências
- A estação Avaliar ensina **risco ≠ uplift** com números reais (o sleeping dog evidencia o ponto).
- O proxy reusa o engine transparente — zero modelo novo, zero dado inventado; herda a ancoragem
  honesta da ADR-0014 e a não-intrusão da ADR-0008.
- Limite declarado: é proxy, não CATE estimado de RCT. O `docs/model-honesty.md` registra isso.
- Caminho de evolução: implementado o experimento, troca-se o proxy por um T-learner sem mudar a UX
  da estação (mesma leitura "uplift por membro").
