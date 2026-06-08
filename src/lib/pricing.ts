export const BASE_PRICES: Record<string, number> = {
    // Fraldas
    'FRP': 25.00, // Fralda Pequena (Boca)
    'FRM': 45.00, // Fralda Média (Ombro)
    'FRG': 65.00, // Fralda Grande (Passeio)

    // Roupas
    'BDC': 40.00, // Body Manga Curta
    'BDL': 45.00, // Body Manga Longa
    'MIJ': 35.00, // Mijão
    'SHO': 30.00, // Short

    // Acessórios / Outros
    'MNT': 150.00, // Manta
    'TOB': 180.00, // Toalha de Banho
    'TOF': 120.00, // Toalha Fralda
    'TOU': 30.00, // Touca
    'FAI': 25.00, // Faixa de Cabelo
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
