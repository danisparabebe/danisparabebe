// ═══════════════════════════════════════════════════════
// REGRAS DE FRETE GRÁTIS — FONTE ÚNICA DA VERDADE
// Qualquer alteração aqui se propaga para TODO o site.
// ═══════════════════════════════════════════════════════

/** Valor mínimo do carrinho para elegibilidade ao frete grátis */
export const FREE_SHIPPING_THRESHOLD = 350;

/** Estados elegíveis ao frete grátis (Sul, Sudeste e partes do Centro-Oeste) */
export const FREE_SHIPPING_STATES = [
    'SP', // São Paulo
    'MG', // Minas Gerais
    'RJ', // Rio de Janeiro
    'PR', // Paraná
    'RS', // Rio Grande do Sul
    'GO', // Goiás
    'DF', // Distrito Federal
];

/** Verifica se o estado informado tem direito a frete grátis */
export function isEligibleForFreeShipping(state: string): boolean {
    return FREE_SHIPPING_STATES.includes(state.toUpperCase().trim());
}

/** Label amigável das regiões para exibição ao cliente */
export const FREE_SHIPPING_REGIONS_LABEL = 'SP, MG, RJ, PR, RS, GO e DF';
