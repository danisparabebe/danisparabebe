import { UNIT_PRICES_NET } from '@/data/pricing-data';

export const BASE_PRICES: Record<string, number> = {
    // Sincronizado dinamicamente com a Tabela Oficial de Precificação Unitária
    ...UNIT_PRICES_NET,
    // Aliases e itens complementares
    'FRP': UNIT_PRICES_NET['FRP'] || 39.00,
    'FRM': UNIT_PRICES_NET['FRM'] || 48.00,
    'FRG': UNIT_PRICES_NET['FRG'] || 56.00,
    'BDC': UNIT_PRICES_NET['BDC'] || 54.00,
    'BDL': UNIT_PRICES_NET['BDL'] || 56.00,
    'MIJ': UNIT_PRICES_NET['MIJ'] || 33.00,
    'SHO': UNIT_PRICES_NET['SHO'] || 20.00,
    'MNT': UNIT_PRICES_NET['MNT'] || 125.00,
    'TOB': UNIT_PRICES_NET['TOB'] || 137.00,
    'TOF': UNIT_PRICES_NET['TOF'] || 89.00,
    'TOU': UNIT_PRICES_NET['TOU'] || 33.00,
    'FAI': UNIT_PRICES_NET['FAI'] || 25.00,
};

export const PERSONALIZATION_PRICE = 20.00; // Custo do bordado do nome

export const EMBROIDERY_THEME_PRICE = 35.00; // Custo base do bordado do tema (por peça principal)

// Helper to calculate product price based on composition and options
export function calculateProductPrice(
    composition: { type: string; qty: number }[],
    hasCustomName: boolean = false
): number {
    let total = 0;

    // Calculate sum of individual items
    if (composition && composition.length > 0) {
        composition.forEach(item => {
            const basePrice = BASE_PRICES[item.type] || 0;
            total += (basePrice * item.qty);

            // Assume we charge the theme embroidery per item for simplicity, or it's built into base price.
            // For premium feel, let's say base price includes fabric+basic finish, theme is extra on main items.
            // Let's keep it simple for now: Base price includes standard theme embroidery.
        });
    }

    // Add personalization fee if applicable
    if (hasCustomName) {
        // Charge personalization fee once per "kit" or individual product being sold
        total += PERSONALIZATION_PRICE;
    }

    // Apply a kit discount if there are many items? Optional feature.
    return total;
}

// Logic for progressive discounts based on number of items in a custom kit
export function getKitDiscountPercentage(itemCount: number): number {
    if (itemCount >= 6) return 8;   // 8% desconto (Máximo)
    if (itemCount >= 4) return 5;   // 5% desconto
    if (itemCount >= 2) return 3;   // 3% desconto
    return 0;
}

export function formatPrice(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
