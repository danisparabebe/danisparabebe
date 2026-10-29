# Regras de Desenvolvimento — Dani's Para Bebê

## Regra Obrigatória: Testes de Regressão Automatizados

Sempre que você (o agente) corrigir um bug, ajustar regras de cálculo, atualizar opções de catálogo, configurador de kit, personalizações ou checkout:

1. **NUNCA** considere a tarefa concluída apenas com base em teste manual ou visual.
2. **CRIE OU ATUALIZE** um teste de regressão automatizado em `tests/regression/<nome-do-modulo>.test.mjs`.
3. **EXECUTE** a suíte de testes com `node --test tests/regression/**/*.test.mjs` (ou `npm run test:regression`).
4. **CONFIRME** que 100% dos testes passam antes de dar o trabalho por encerrado.
5. **CONSULTE** a skill oficial `danis-regression-testing` para padrões e convenções de testes.
