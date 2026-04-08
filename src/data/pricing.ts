/**
 * TABELA OFICIAL DE PREÇOS (LÍQUIDOS) E TAXAS — Danis Para Bebê
 * =============================================================
 * Valores aqui são os LÍQUIDOS que a loja deseja receber.
 * O sistema embutirá as taxas (Cartão/PIX) no preço bruto final.
 */

// ─── TAXAS GATEWAY (STRIPE) ──────────────────────────────────
export const STRIPE_CARD_PCT = 0.085;   // ~8.5% no cartão (3x sem juros: 4% base + ~4.5% antecipação parcelamento)
export const STRIPE_PIX_PCT = 0.0199;   // 1.99% no PIX
export const STRIPE_FIXED = 0.39;       // R$ 0,39 fixo por transação

import { UNIT_PRICES_NET, KIT_PRICES_NET } from './pricing-data';

// ─── FUNÇÕES DE CÁLCULO DE TAXAS ─────────────────────────────

export function calculateGrossCard(netValue: number): number {
    if (netValue <= 0) return 0;
    // Líquido / (1 - 5%) + 0.39 -> e arredonda para cima para garantir o valor
    const raw = (netValue / (1 - STRIPE_CARD_PCT)) + STRIPE_FIXED;
    return Math.ceil(raw); // Preços redondos, ex: R$ 56,00
}

export function calculateGrossPix(netValue: number): number {
    if (netValue <= 0) return 0;
    // Líquido / (1 - 1.99%)
    const raw = netValue / (1 - STRIPE_PIX_PCT);
    return Math.ceil(raw);
}

// ─── FUNÇÕES AUXILIARES ──────────────────────────────────────

/**
 * Calcula o preço líquido bruto (soma dos avulsos líquidos).
 */
export function calculateBrutoNetPrice(composition: { type: string; qty: number }[], hasFrufru: boolean = false): number {
    return composition.reduce((total, item) => {
        let typeKey = item.type;
        if (hasFrufru && typeKey === 'FRP') typeKey = 'FRP_FRU';
        if (hasFrufru && typeKey === 'FRG') typeKey = 'FRG_FRU';

        const unitPriceNet = UNIT_PRICES_NET[typeKey] || 0;
        return total + (unitPriceNet * item.qty);
    }, 0);
}

export function getKitPriceNet(kitName: string): number | null {
    if (KIT_PRICES_NET[kitName] !== undefined) return KIT_PRICES_NET[kitName];
    for (const key of Object.keys(KIT_PRICES_NET)) {
        if (kitName.toLowerCase().includes(key.toLowerCase())) {
            return KIT_PRICES_NET[key];
        }
    }
    return null;
}

/**
 * Identify manual kit discounts strictly via mathematical exact composition!
 * ZERO reliance on the typed commercial name.
 */
export function getKitPriceByComposition(composition: { type: string; qty: number }[]): number | null {
    // Helper to get piece counts regardless of fru-fru modifier
    const getQty = (t: string) => composition.find(c => c.type === t || c.type === `${t}_FRU`)?.qty || 0;
    
    const mnt = getQty('MNT');
    const frg = getQty('FRG');
    const frp = getQty('FRP');
    const totalPieces = composition.reduce((sum, c) => sum + c.qty, 0);

    // Kit Manta Default Recipe = exactly 3 pieces (1x MNT, 1x FRG, 1x FRP)
    if (totalPieces === 3 && mnt === 1 && frg === 1 && frp === 1) {
        return KIT_PRICES_NET["Kit Manta"] || null;
    }
    
    // Kit Fraldas Default Recipe = exactly 2 pieces (1x FRG, 1x FRP)
    if (totalPieces === 2 && frg === 1 && frp === 1) {
        return KIT_PRICES_NET["Kit Fraldas"] || null;
    }

    return null;
}

export interface ProductPricingInfo {
    originalPriceFull: number; // Sum of individual items (gross card) - only > priceFull if it's a kit
    priceFull: number;     // Gross Price for Credit Card (com taxas)
    pixPrice: number;      // Gross Price for PIX (com taxas, menor que cartão)
    netValue: number;      // Master Net Value (O que você recebe)
    discountPct: number;   // Economia do Kit em relação aos avulsos (somente se original > priceFull)
    pixDiscountPct: number; // Economia PIX vs Cartão (ex: 3%)
}

/**
 * Calcula os preços preenchidos para a exibição no site.
 * O `priceFull` agora embute as taxas do cartão.
 * O `pixPrice` embute as taxas do PIX.
 * O `discountPct` reflete a real economia ao pagar no PIX.
 */
export function getProductPricing(
    composition: { type: string; qty: number }[],
    productName: string,
    hasFrufru: boolean = false
): ProductPricingInfo {
    const netSomaAvulsos = calculateBrutoNetPrice(composition, hasFrufru);
    
    // Strict composition match - no fuzzy name guessing!
    const netKitExactMatch = getKitPriceByComposition(composition);
    
    // Se o kit tem Fru-fru, o valor do kit pronto não pode ser o padrão.
    let finalNetValue = netSomaAvulsos;
    if (!hasFrufru && netKitExactMatch !== null && (netSomaAvulsos === 0 || netKitExactMatch < netSomaAvulsos)) {
        finalNetValue = netKitExactMatch;
    }

    // originalPriceFull = soma dos preços brutos INDIVIDUAIS de cada peça (como se comprados avulsos)
    // Isso garante que o "De R$ X" mostre ao cliente o preço real caso comprasse cada item separadamente
    const originalPriceFull = composition.reduce((total, item) => {
        let typeKey = item.type;
        if (hasFrufru && typeKey === 'FRP') typeKey = 'FRP_FRU';
        if (hasFrufru && typeKey === 'FRG') typeKey = 'FRG_FRU';

        const unitNet = UNIT_PRICES_NET[typeKey] || 0;
        return total + (calculateGrossCard(unitNet) * item.qty);
    }, 0);

    const priceFull = calculateGrossCard(finalNetValue);
    const pixPrice = calculateGrossPix(finalNetValue);
    
    // Desconto do KIT em relação aos itens avulsos 
    const isKitDiscount = originalPriceFull > priceFull;
    const kitDiscountPct = isKitDiscount ? Math.round(((originalPriceFull - priceFull) / originalPriceFull) * 100) : 0;

    // Desconto real do PIX em relação ao valor parcelado no cartão (aprox 3-4%)
    const pixDiscountPct = priceFull > 0 ? Math.round(((priceFull - pixPrice) / priceFull) * 100) : 0;

    return {
        originalPriceFull: originalPriceFull > priceFull ? originalPriceFull : priceFull,
        priceFull,
        pixPrice,
        netValue: finalNetValue,
        discountPct: kitDiscountPct, // Reaproveitando a propriedade antiga para o Kit
        pixDiscountPct,
    };
}
