import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Página Oficial de Links da Bio (/links)', () => {
    const linksPagePath = path.resolve(process.cwd(), 'src/app/links/page.tsx');
    const sitemapPath = path.resolve(process.cwd(), 'src/app/sitemap.ts');

    test('Página /links deve existir com metatags e branding oficial', () => {
        assert.ok(fs.existsSync(linksPagePath), 'src/app/links/page.tsx deve existir');
        const content = fs.readFileSync(linksPagePath, 'utf-8');

        assert.ok(content.includes("Dani's Para Bebê"), 'Deve conter o nome oficial da marca');
        assert.ok(content.includes('@danisparabebe'), 'Deve conter o arroba oficial do Instagram');
        assert.ok(content.includes('5518997518078'), 'Deve utilizar o telefone oficial de atendimento');
        assert.ok(content.includes('/monte-seu-kit'), 'Deve conter link direto para o Monte Seu Kit');
        assert.ok(content.includes('/catalogo'), 'Deve conter link para o catálogo completo');
        assert.ok(content.includes('InfinitePay'), 'Deve destacar segurança InfinitePay');
    });

    test('Sitemap deve incluir a rota /links', () => {
        const content = fs.readFileSync(sitemapPath, 'utf-8');
        assert.ok(content.includes('/links'), 'Sitemap deve conter rota /links');
    });
});
