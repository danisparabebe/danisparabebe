import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Otimização do Monte Seu Kit (Fase 4)', () => {
    const stepItemsPath = path.resolve(process.cwd(), 'src/components/configurator/step-items.tsx');
    const stepReviewPath = path.resolve(process.cwd(), 'src/components/configurator/step-review.tsx');
    const pricingPath = path.resolve(process.cwd(), 'src/lib/pricing.ts');

    test('Regras de desconto progressivo por volume do Monte Seu Kit devem ser consistentes', () => {
        const pricingContent = fs.readFileSync(pricingPath, 'utf-8');
        assert.ok(pricingContent.includes('getKitDiscountPercentage'), 'Deve exportar getKitDiscountPercentage');
        
        // Extrai a função do arquivo pricing.ts de forma isolada e remove anotações TypeScript
        const match = pricingContent.match(/function getKitDiscountPercentage\([\s\S]*?\n\}/);
        assert.ok(match, 'Função getKitDiscountPercentage deve estar definida em pricing.ts');

        const cleanJsFunction = match[0].replace(/:\s*number/g, '');
        const fn = new Function('itemCount', `${cleanJsFunction}; return getKitDiscountPercentage(itemCount);`);
        assert.equal(fn(0), 0, '0 peças deve ter 0%');
        assert.equal(fn(1), 0, '1 peça deve ter 0%');
        assert.equal(fn(2), 3, '2 peças deve ter 3%');
        assert.equal(fn(3), 3, '3 peças deve ter 3%');
        assert.equal(fn(4), 5, '4 peças deve ter 5%');
        assert.equal(fn(5), 5, '5 peças deve ter 5%');
        assert.equal(fn(6), 8, '6 peças deve ter 8%');
        assert.equal(fn(10), 8, '10 peças deve manter 8%');
    });

    test('step-items.tsx deve ter resumo gaveta de peças e gatilho de desconto dinâmico na sticky bar', () => {
        const content = fs.readFileSync(stepItemsPath, 'utf-8');

        // Gaveta de peças
        assert.ok(content.includes('showItemsDrawer'), 'Deve conter estado para drawer de peças escolhidas');
        assert.ok(content.includes('Ver peças'), 'Deve conter botão de acionamento do resumo de peças');
        assert.ok(content.includes('Peças no seu Kit'), 'Deve conter título na gaveta de resumo');

        // Gamificação e incentivo dinâmico na sticky bar
        assert.ok(content.includes('+1 peça para 3% OFF') || content.includes('peça para 3% OFF'), 'Deve incentivar próximo desconto na sticky bar');
        assert.ok(content.includes('5% OFF') && content.includes('8% OFF'), 'Deve referenciar marcos de 5% e 8%');
    });

    test('step-review.tsx deve ter sticky mobile bar e fallback para Instagram WebView', () => {
        const content = fs.readFileSync(stepReviewPath, 'utf-8');

        // Sticky Mobile Bar
        assert.ok(content.includes('md:hidden fixed bottom-0'), 'Deve conter barra fixa no mobile');
        assert.ok(content.includes('PAGAR AGORA'), 'Deve conter botão PAGAR AGORA na barra mobile');

        // Instagram WebView Fallback
        assert.ok(content.includes('paymentRedirectUrl'), 'Deve conter estado de fallback de redirecionamento');
        assert.ok(content.includes('window.location.assign'), 'Deve utilizar window.location.assign com fallback');
        assert.ok(content.includes('Abrir Pagamento Seguro'), 'Deve conter botão de fallback explícito para WebView');
    });
});
