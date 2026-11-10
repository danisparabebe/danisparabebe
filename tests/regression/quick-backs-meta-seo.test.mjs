import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Redução de Quick Backs & Otimização Meta/Instagram (Fase 3)', () => {
    test('Simulador de frete deve estar presente na página do produto', () => {
        const viewPath = path.resolve('src/app/produto/[id]/product-client-view.tsx');
        const viewContent = fs.readFileSync(viewPath, 'utf8');
        assert.ok(
            viewContent.includes('<ProductShippingCalculator'),
            'Componente ProductShippingCalculator deve estar renderizado na página de produto'
        );
        assert.ok(
            viewContent.includes('productPrice={currentPixPrice}'),
            'Calculadora deve receber o preço atualizado do produto'
        );
    });

    test('Robots.txt e Sitemap.ts devem existir com autorização expressa para bots da Meta/Instagram', () => {
        const robotsPath = path.resolve('public/robots.txt');
        const sitemapPath = path.resolve('src/app/sitemap.ts');

        assert.ok(fs.existsSync(robotsPath), 'public/robots.txt deve existir');
        assert.ok(fs.existsSync(sitemapPath), 'src/app/sitemap.ts deve existir');

        const robotsContent = fs.readFileSync(robotsPath, 'utf8');
        assert.ok(
            robotsContent.includes('facebookexternalhit'),
            'Robots.txt deve autorizar explicitamente o crawler do Facebook/Instagram'
        );
        assert.ok(
            robotsContent.includes('Meta-ExternalAgent'),
            'Robots.txt deve autorizar o agente de validação externa da Meta'
        );
    });

    test('Layout raiz deve conter metatags OpenGraph e Twitter completas', () => {
        const layoutPath = path.resolve('src/app/layout.tsx');
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');

        assert.ok(
            layoutContent.includes('openGraph:'),
            'Metadados OpenGraph devem estar configurados'
        );
        assert.ok(
            layoutContent.includes('metadataBase: new URL("https://danisparabebe.com.br")'),
            'metadataBase canônica deve estar definida para evitar rejeição de links'
        );
    });
});
