// ═══════════════════════════════════════════════════════
// REGRAS DE FRETE GRÁTIS — FONTE ÚNICA DA VERDADE
// Qualquer alteração aqui se propaga para TODO o site.
// ═══════════════════════════════════════════════════════

/** Valor mínimo do carrinho para elegibilidade ao frete grátis */
export const FREE_SHIPPING_THRESHOLD = 400;

/** Estados elegíveis ao frete grátis */
export const FREE_SHIPPING_STATES = [
    'SP', // São Paulo
    'RJ', // Rio de Janeiro
    'MG', // Minas Gerais
    'PR', // Paraná
    'SC', // Santa Catarina
];

/** Verifica se o estado informado tem direito a frete grátis */
export function isEligibleForFreeShipping(state: string): boolean {
    return FREE_SHIPPING_STATES.includes(state.toUpperCase().trim());
}

/** Label amigável das regiões para exibição ao cliente */
export const FREE_SHIPPING_REGIONS_LABEL = 'SP, RJ, MG, PR e SC';
