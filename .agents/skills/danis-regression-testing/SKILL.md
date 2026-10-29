---
name: danis-regression-testing
description: >-
  Protocolo obrigatório de testes de regressão automatizados para o projeto Dani's Para Bebê.
  Use sempre que corrigir um bug, ajustar regras de negócio, preços, personalizações,
  carrinho, catálogo ou checkout para criar e rodar um teste automatizado que garanta
  que o bug nunca volte a acontecer.
---

# 🛡️ Dani's Regression Testing Protocol — Testes de Regressão Automatizados

## Propósito

Este documento estabelece a **regra obrigatória de testes de regressão** para o desenvolvimento do site **Dani's Para Bebê** (danisparabebe.com.br).

> [!IMPORTANT]
> **A REGRA DE OURO:**
> Nunca considere um bug corrigido com base apenas em testes manuais ou visuais.
> **Todo bug resolvido DEVE ter um teste de regressão automatizado correspondente** em `tests/regression/`.
> Antes de entregar a resposta ao usuário, o teste DEVE ser executado e passar com 100% de sucesso.

---

## O que é um Teste de Regressão?

Um teste de regressão é um pequeno script automatizado que:
1. Simula exatamente a situação em que o sistema falhou no passado.
2. Afirma matematicamente que a resposta ou comportamento atual está correto.
3. Roda em milissegundos e pode ser reexecutado milhares de vezes no futuro.
4. Garante que qualquer alteração futura no código **NUNCA** quebre novamente o que já foi consertado (evita o "efeito cobertor curto").

---

## Estrutura do Projeto de Testes

Os testes são executados com o **test runner nativo do Node.js** (`node:test` e `node:assert/strict`), sem dependências pesadas externas e executando em milissegundos.

```text
c:\DANIS\danisparabebe\
├── tests/
│   └── regression/
│       ├── monte-seu-kit.test.mjs          # Regras do configurador e itens permitidos
│       ├── inauguration-promo.test.mjs     # Preços, estoque, brinde e shortcodes da promo
│       ├── pricing-infinitepay.test.mjs    # Cálculos de taxas de cartão e parcelamento
│       └── checkout-pedidos.test.mjs       # Ficha técnica, acabamentos e dados de pedidos
```

---

## Ciclo Obrigatório de Correção de Bugs (Bugfix Protocol)

Sempre que o usuário reportar um bug ou ajuste:

1. **Identificar a Falha**: Compreender exatamente a condição que falhou (ex: "o body não pediu tamanho", "short e mijão apareceram no monte seu kit", "cálculo de 3x incorreto").
2. **Escrever o Teste de Regressão**: Criar um arquivo `.test.mjs` dentro de `tests/regression/` contendo um teste que valida a condição esperada.
3. **Aplicar a Correção**: Modificar o código da aplicação para resolver a causa raiz.
4. **Executar a Suíte**: Rodar `npm run test:regression` no terminal.
5. **Verificar Ausência de Regressão**: Garantir que tanto o novo teste quanto todos os testes anteriores continuam verdes (100% aprovados).

---

## Comandos Oficiais de Execução

No terminal em `c:\DANIS\danisparabebe`:

```bash
# Rodar todos os testes de regressão
npm run test:regression

# Ou diretamente via Node
node --test tests/regression/**/*.test.mjs
```
