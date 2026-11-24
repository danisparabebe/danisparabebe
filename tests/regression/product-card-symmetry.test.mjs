import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Alinhamento e Simetria dos Cards de Produto (Mobile e Desktop)', () => {
    const cardPath = path.resolve('src/components/homepage/product-card.tsx');
    const gridPath = path.resolve('src/components/homepage/product-grid.tsx');
    const collectionPath = path.resolve('src/components/collection/collection-products.tsx');

    test('ProductCard não deve comprimir o título com pr-8 e deve centralizar textos e preços', () => {
        const content = fs.readFileSync(cardPath, 'utf8');
        assert.ok(
            !content.includes('pr-8'),
            'Título do card não deve ter pr-8 desnecessário que causa assimetria'
        );
        assert.ok(
            content.includes('text-center'),
            'Corpo do card deve usar alinhamento centralizado para simetria'
        );
        assert.ok(
            content.includes('min-h-[2.375rem]'),
            'Título e bloco de parcelamento devem ter altura mínima uniforme entre cards'
        );
    });

    test('Pílula de PIX do ProductCard deve ocupar largura total, centralizar sem "ou" e manter linha De/por', () => {
        const content = fs.readFileSync(cardPath, 'utf8');
        assert.ok(
            content.includes('w-full flex items-center justify-center') && content.includes('whitespace-nowrap'),
            'Pílula de PIX deve ser simétrica (w-full justify-center) e não quebrar linha no mobile'
        );
        assert.ok(
            content.includes('De R$ {originalPrice!.toFixed(2)}') && content.includes('>por</span>'),
            'Linha superior de preço deve exibir formato De R$ ... por ...x R$ ...'
        );
        assert.ok(
            !content.includes('>ou</span>') && content.includes('font-black'),
            'Pílula de PIX deve exibir R$ ... no PIX sem "ou" e com fonte destacada'
        );
        assert.ok(
            content.includes('className="text-sm sm:text-base font-black text-emerald-400">R$ {price.toFixed(2)}'),
            'Valor do PIX no ProductCard deve usar text-emerald-400 e font-black uniformemente para todos os produtos'
        );
        assert.ok(
            !content.includes("badge?.toLowerCase().includes('black baby')\n                                ? 'text-emerald-400'\n                                : 'text-sage-green-dark'") &&
                !content.includes("'text-sage-green-dark'"),
            'Valor do PIX não deve alternar para text-sage-green-dark'
        );
    });

    test('Grades de produtos devem usar gap compacto (gap-3 sm:gap-4) no mobile de 2 colunas', () => {
        const gridContent = fs.readFileSync(gridPath, 'utf8');
        const collectionContent = fs.readFileSync(collectionPath, 'utf8');
        assert.ok(
            gridContent.includes('grid-cols-2 gap-3 sm:gap-4'),
            'ProductGrid deve usar gap-3 sm:gap-4 no mobile'
        );
        assert.ok(
            collectionContent.includes('grid-cols-2 gap-3 sm:gap-4'),
            'CollectionProducts deve usar gap-3 sm:gap-4 no mobile'
        );
    });
});
