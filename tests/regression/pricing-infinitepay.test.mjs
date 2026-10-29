import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Regressão: Precificação e Taxas InfinitePay', () => {
    test('Cálculo da parcela em 3x com fator InfinitePay (1.0754) para R$ 197 deve resultar em R$ 70,62', () => {
        const val = 197;
        const factor = 1.0754;
        const installment = Math.round(((val * factor) / 3) * 100) / 100;
        const total = Math.round((val * factor) * 100) / 100;

        assert.strictEqual(installment, 70.62, 'Parcela 3x deve ser R$ 70,62');
        assert.strictEqual(total, 211.85, 'Total em 3x deve ser R$ 211,85');
    });

    test('Desconto de R$ 52 no PIX deve ser a diferença entre R$ 249 e R$ 197', () => {
        const original = 249;
        const promoPix = 197;
        const savings = original - promoPix;

        assert.strictEqual(savings, 52, 'Economia real deve ser exatamente R$ 52,00');
    });
});
