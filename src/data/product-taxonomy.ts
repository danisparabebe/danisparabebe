/**
 * TABELA OFICIAL DE TAXONOMIA E MEDIDAS — Danis Para Bebê
 * ========================================================
 * Este arquivo atua como o Banco de Dados Fonte (Source of Truth) para as 
 * dimensões exatas, materiais e acabamentos de todas as peças do enxoval.
 * Ele será usado para gerar descrições de produtos de forma padronizada 
 * e calculada dinamicamente, evitando erros humanos.
 */

export interface ProductSizing {
    type: string;
    dimensions: string;
    material: string;
    details?: string;
}

export const PRODUCT_TAXONOMY: Record<string, ProductSizing> = {
    // ─── FRALDAS ─────────────────────────────────────────────
    'FRP': {
        type: 'Fralda Pequena (Boca/Ombro)',
        dimensions: '38x32 cm',
        material: 'Tecido Duplo 100% Algodão',
        details: 'Extremamente macia e absorvente para o contato constante com a pele do bebê.'
    },
    'FRM': {
        type: 'Fralda Média',
        dimensions: '65x33 cm',
        material: 'Tecido Duplo 100% Algodão',
        details: 'Tamanho versátil para apoio no ombro ou bercinho.'
    },
    'FRG': {
        type: 'Fralda Grande',
        dimensions: '65x69 cm',
        material: 'Tecido Duplo 100% Algodão',
        details: 'Ideal para cobrir o bebê ou forrar superfícies com conforto extra.'
    },
    'TOF': {
        type: 'Toalha Fralda',
        dimensions: '65x69 cm', // Assumido o mesmo da fralda grande ou ajustar depois
        material: 'Tecido Duplo 100% Algodão',
    },

    // ─── BANHO & CAMA ────────────────────────────────────────
    'MNT': {
        type: 'Manta',
        dimensions: '80x80 cm',
        material: 'Tecido Flanelado 100% Algodão',
        details: 'Forrada e flanelada para máxima retenção de calor e aconchego.'
    },
    'TOB': {
        type: 'Toalha de Banho',
        dimensions: '80x68 cm',
        material: 'Tecido Atoalhado forrado com Fralda',
        details: 'Atoalhado premium por fora, com forro interno em fralda macia que absorve e abraça a pele delicada após o banho.'
    },

    // ─── ROUPINHAS & VESTUÁRIO ───────────────────────────────
    'BDC': {
        type: 'Body Manga Curta',
        dimensions: 'Tamanhos P ao G',
        material: 'Suedine 100% Algodão',
        details: 'Toque aveludado e flexível, ideal para o conforto diário.'
    },
    'BDL': {
        type: 'Body Manga Longa',
        dimensions: 'Tamanhos P ao G',
        material: 'Suedine 100% Algodão',
        details: 'Toque aveludado e flexível, mantendo o bebê aquecido confortavelmente.'
    },
    'BOD': {
        type: 'Body', // Generic
        dimensions: 'Tamanhos P ao G',
        material: 'Suedine 100% Algodão',
    },
    'MIJ': {
        type: 'Mijão',
        dimensions: 'Tamanhos P ao G',
        material: 'Suedine 100% Algodão',
        details: 'Moldagem confortável para liberdade de movimentos.'
    },
    'SHO': {
        type: 'Short',
        dimensions: 'Tamanhos P ao G',
        material: 'Malha Canelada 100% Algodão',
        details: 'Malha que se adapta ao corpinho.'
    },
    
    // ─── ACESSÓRIOS ──────────────────────────────────────────
    'TOU': {
        type: 'Touca',
        dimensions: 'Tamanho Único RN',
        material: 'Malha Especial 100% Algodão',
        details: 'Macia e quentinha, não aperta a cabecinha sensível do bebê.'
    },
    'FAI': {
        type: 'Faixa de Cabelo',
        dimensions: 'Adaptável',
        material: 'Viscoelastano / Meia de Seda',
    }
};

/**
 * Função utilitária que, dada uma sigla (ex: FRP, MNT), 
 * retorna uma frase completa formatada com as medidas daquela peça para injeção 
 * em descrições de produtos no front-end.
 */
export function getProductMeasureString(code: string): string {
    const data = PRODUCT_TAXONOMY[code];
    if (!data) return '';
    return `${data.type}: ${data.dimensions} (${data.material})`;
}
