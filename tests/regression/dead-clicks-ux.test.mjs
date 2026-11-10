import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Eliminação de Cliques Mortos & UX Tátil (Fase 2)', () => {
    const cardPath = path.resolve('src/components/homepage/product-card.tsx');
    const viewPath = path.resolve('src/app/produto/[id]/product-client-view.tsx');

    test('Card de produto na Home deve ter título e categoria clicáveis navegando na mesma aba', () => {
        const cardContent = fs.readFileSync(cardPath, 'utf8');
        assert.ok(
            !cardContent.includes('target="_blank"'),
            'Cards de produto não devem forçar abertura em nova aba no Instagram Webview'
        );
        assert.ok(
            cardContent.includes('group-hover/title:text-sage-green-dark'),
            'Título e categoria devem ser envoltos por Link com efeito visual de clique'
        );
    });

    test('Página de produto deve ter detalhes abertos por padrão e instrução de zoom tátil', () => {
        const viewContent = fs.readFileSync(viewPath, 'utf8');
        assert.ok(
            viewContent.includes('useState(true)'),
            'Detalhes do produto devem vir expandidos por padrão'
        );
        assert.ok(
            viewContent.includes('Toque para ver detalhes do bordado'),
            'Botão de ampliação deve ter instrução tátil clara para celular'
        );
    });
});
