# Honestidade do modelo — "dá para confiar nesse 0,988?"

> Página de leitura crítica do modelo de churn da Vitaliza, para a banca. Resume
> as evidências de que a métrica não é "boa demais para ser verdade", onde estão
> os limites e o que é deliberadamente simplificado. Evidência, não opinião.

## 1. Métricas (conjunto de teste, holdout estratificado)

Fonte: [`pipeline/artifacts/metrics.json`](../pipeline/artifacts/metrics.json) ·
modelo XGBoost + Optuna (k-fold), calibrado (sigmoid).

| Métrica | Treino | Validação | **Teste** |
|---|---|---|---|
| ROC-AUC | 0,9981 | 0,9896 | **0,9878** |
| PR-AUC | 0,9949 | 0,9792 | **0,9748** |
| Recall | 1,00 | 0,969 | **0,950** |
| Precisão | 0,827 | 0,798 | **0,803** |
| F1 | 0,905 | 0,875 | **0,870** |

- **Overfit:** gap treino−teste de ROC-AUC = **0,0103** → "sem overfit relevante".
- **Threshold = 0,05** escolhido por **custo** com restrição `recall ≥ 0,70` (região factível
  não-vazia). É por isso que a estação *Avaliar* da Trilha abre no corte de 5%.
- Taxa-base (positivos) ≈ **0,265** — o modelo precisa bater MUITO mais que "chutar a taxa-base".

## 2. Por que o AUC alto NÃO é leakage (teste A/B)

Fonte: [`pipeline/leakage_audit.py`](../pipeline/leakage_audit.py) → evidência em
[`docs/leakage-audit.json`](./leakage-audit.json).

- `Month_to_end_contract` é **0,973 correlacionada com `Contract_period`** — funciona como
  *relógio do contrato* (variável de futuro / quase-leakage). Foi **removida**.
- **A prova:** treinando o mesmo modelo COM e SEM essa variável, o ROC-AUC no teste é
  **0,9739 vs 0,9739 — delta +0,0000**. Removê-la **não custou nada**: o desempenho não vinha dela.
- Os drivers legítimos (observáveis no momento da predição, não-futuros) dominam:
  `delta_freq` (−0,60), `flag_early_user` (+0,56), `Lifetime` (−0,44),
  `ratio_freq_atual_vs_lifetime` (−0,43), `Avg_class_frequency_current_month` (−0,41).
  São sinais de **engajamento** — causal-plausíveis e acionáveis, não atalhos.
- `Lifetime` foi **mantida** (tempo de casa observável hoje; necessária para `flag_early_user` e
  `flag_sleeping_dog`); pré-processamento é `fit` só no treino.

> Conclusão: o 0,988 é alto porque o churn neste dataset é fortemente previsível por engajamento —
> e provamos que não depende da variável suspeita.

## 3. Calibração (o quanto confiar na probabilidade)

O modelo é calibrado (sigmoid). A **estação *Avaliar* da Trilha** (`/trilha/avaliar`) deixa isso
explorável ao vivo: **diagrama de confiabilidade + Brier score** sobre os escores reais (`(p, y)`),
respondendo "quando o modelo diz 70%, ~70% de fato cancelam?". Ver
[`lib/trilha/calibration.ts`](../lib/trilha/calibration.ts).

## 4. Limites declarados (o asterisco honesto)

- **Simulação what-if usa um surrogate transparente, não o XGBoost online.** O Simulador Vivo e a
  projeção recalculam com a heurística (`lib/heuristic.ts`), **ancorada no score real** + delta
  ([ADR-0014](decisions/0014-ancoragem-simulador-real-mais-delta.md)). É honesto e rotulado, mas
  **não é** o modelo de produção rodando na borda — decisão de custo/infra
  ([ADR-0011](decisions/0011-inferencia-batch-vs-online.md)). Servir o XGBoost real online é o
  próximo passo planejado.
- **Toda explicabilidade descreve o comportamento do MODELO, não causalidade** do mundo real.
- **Sem dados de tratamento/controle:** o dataset prevê *quem cancela*, não *quem responde à
  intervenção* — por isso uplift é tratado como conceito/proxy, não como modelo treinado
  (ver a estratégia na Trilha e o roteiro de evolução).

## 5. Reproduzir a evidência

```bash
# auditoria de leakage (gera o relatório estruturado)
.venv/Scripts/python -m pipeline.leakage_audit
# ou regenerar o JSON commitado:
.venv/Scripts/python -c "import json; from pipeline.leakage_audit import run_audit; \
  open('docs/leakage-audit.json','w',encoding='utf-8').write(json.dumps(run_audit(verbose=False), ensure_ascii=False, indent=2))"
```
