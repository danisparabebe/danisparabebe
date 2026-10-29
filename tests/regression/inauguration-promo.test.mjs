import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Promoção de Inauguração — Leve 4 Pague 3', () => {
    test('Configuração da campanha deve ter dados consistentes de preço e brinde', () => {
        const promoConfigPath = path.resolve('src/data/inauguration-promo.ts');
        const content = fs.readFileSync(promoConfigPath, 'utf8');

        // Valida valores centrais da oferta
        assert.ok(content.includes('priceFull: 249'), 'Preço cheio de 4 peças deve ser R$ 249');
        assert.ok(content.includes('pixPrice: 197'), 'Preço no PIX deve ser R$ 197');
        assert.ok(content.includes('installmentCount: 3'), 'Parcelamento da promoção deve ser em 3x');
        assert.ok(content.includes('installmentValue: 70.62'), 'Parcela em 3x deve ser R$ 70,62 (taxa InfinitePay)');
        assert.ok(content.includes('unitsAvailable: 5'), 'Quantidade limitada deve ser 5 unidades por modelo');
    });

    test('Produtos cadastrados em product-control.ts devem conter as 4 peças e valores corretos', () => {
        const productControlPath = path.resolve('src/data/product-control.ts');
        const content = fs.readFileSync(productControlPath, 'utf8');

        // Localiza produtos promocionais
        assert.ok(content.includes('FEM-KIT-MAN-BOR-RSE-PROMO-INAU_01'), 'Produto menina deve existir');
        assert.ok(content.includes('MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01'), 'Produto menino deve existir');
        assert.ok(content.includes('"shortCode": "DPB-INAU-FEM"'), 'ShortCode DPB-INAU-FEM deve existir');
        assert.ok(content.includes('"shortCode": "DPB-INAU-MAS"'), 'ShortCode DPB-INAU-MAS deve existir');
    });

    test('Textos públicos NÃO devem conter termos artificiais ou jargões de IA', () => {
        const filesToCheck = [
            'src/data/inauguration-promo.ts',
            'src/components/homepage/inauguration-banner.tsx',
            'src/app/produto/[id]/product-client-view.tsx'
        ];

        const forbiddenTerms = [
            'sentimento de super vantagem',
            'sentimento de vantagem',
            'marketing agressivo',
            'economia absurda'
        ];

        for (const relPath of filesToCheck) {
            const fullPath = path.resolve(relPath);
            const text = fs.readFileSync(fullPath, 'utf8').toLowerCase();

            for (const term of forbiddenTerms) {
                assert.ok(
                    !text.includes(term),
                    `Regressão evitada: Termo artificial "${term}" encontrado em ${relPath}`
                );
            }
        }
    });

    test('Deve haver aviso explícito de que os demais kits NÃO estão na promoção', () => {
        const bannerPath = path.resolve('src/components/homepage/inauguration-banner.tsx');
        const content = fs.readFileSync(bannerPath, 'utf8');

        assert.ok(
            content.includes('Os demais kits e produtos do site não fazem parte da promoção') ||
            content.includes('demais kits do ateliê continuam com preços regulares') ||
            content.includes('demais produtos do site não fazem parte') ||
            content.includes('Demais produtos fora da promoção') ||
            content.includes('demais produtos fora da promoção'),
            'O banner deve conter aviso claro de que os demais kits seguem o valor normal'
        );
    });

    test('Callout da página do produto deve ser conciso e limpo', () => {
        const viewPath = path.resolve('src/app/produto/[id]/product-client-view.tsx');
        const content = fs.readFileSync(viewPath, 'utf8');

        assert.ok(!content.includes('(Fralda de Boca 100% Algodão) de presente'), 'Texto poluído antigo não deve existir');
        assert.ok(content.includes('Leve 4, Pague 3 · Brinde Incluso'), 'Callout limpo deve existir');
        assert.ok(content.includes('Apenas 5 unidades'), 'Indicação de 5 unidades deve existir');
    });

    test('Sincronização de estoque dos kits de inauguração deve existir e ser dinâmica', () => {
        const stockLibPath = path.resolve('src/lib/inauguration-stock.ts');
        const stockApiPath = path.resolve('src/app/api/inauguration-stock/route.ts');
        const bannerPath = path.resolve('src/components/homepage/inauguration-banner.tsx');

        assert.ok(fs.existsSync(stockLibPath), 'Módulo de cálculo de estoque src/lib/inauguration-stock.ts deve existir');
        assert.ok(fs.existsSync(stockApiPath), 'Rota de API /api/inauguration-stock deve existir');

        const libContent = fs.readFileSync(stockLibPath, 'utf8');
        assert.ok(libContent.includes('DPB-INAU-FEM'), 'Lib deve rastrear produto feminino');
        assert.ok(libContent.includes('DPB-INAU-MAS'), 'Lib deve rastrear produto masculino');
        assert.ok(libContent.includes('Math.max(0, initialPerGender - femSold)'), 'Cálculo de decremento por venda deve estar presente');

        const bannerContent = fs.readFileSync(bannerPath, 'utf8');
        assert.ok(bannerContent.includes('/api/inauguration-stock'), 'Banner deve carregar estoque dinâmico da API');
    });
});
