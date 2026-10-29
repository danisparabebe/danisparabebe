import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Monte Seu Kit — Produtos Descontinuados', () => {
    test('Short (SHO) e Mijão (MIJ) NÃO devem estar disponíveis no Monte Seu Kit', () => {
        const stepItemsPath = path.resolve('src/components/configurator/step-items.tsx');
        const content = fs.readFileSync(stepItemsPath, 'utf8');

        // Extrai a definição da constante CATEGORIES
        const match = content.match(/const CATEGORIES[\s\S]*?\];/);
        assert.ok(match, 'CATEGORIES deve existir em step-items.tsx');

        const categoriesCode = match[0];

        // Garante que nem 'SHO' nem 'MIJ' estão presentes na lista de categorias do Monte Seu Kit
        assert.ok(
            !categoriesCode.includes("'SHO'"),
            'Regressão evitada: Short (SHO) foi reintroduzido no Monte Seu Kit!'
        );
        assert.ok(
            !categoriesCode.includes('"SHO"'),
            'Regressão evitada: Short (SHO) foi reintroduzido no Monte Seu Kit!'
        );
        assert.ok(
            !categoriesCode.includes("'MIJ'"),
            'Regressão evitada: Mijão (MIJ) foi reintroduzido no Monte Seu Kit!'
        );
        assert.ok(
            !categoriesCode.includes('"MIJ"'),
            'Regressão evitada: Mijão (MIJ) foi reintroduzido no Monte Seu Kit!'
        );
    });

    test('Categoria de Roupas no Monte Seu Kit deve conter apenas Bodies (BDC e BDL)', () => {
        const stepItemsPath = path.resolve('src/components/configurator/step-items.tsx');
        const content = fs.readFileSync(stepItemsPath, 'utf8');

        // Verifica a lista de Roupas
        assert.ok(
            content.includes("ids: ['BDC', 'BDL']"),
            'A lista de roupas deve conter exatamente BDC e BDL'
        );
    });
});
