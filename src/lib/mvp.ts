import { productControl } from '@/data/product-control';
import { MVP_PRODUCT_SELECTION } from '@/data/mvp-config';
import { resolveProductId } from './short-codes';

/**
 * Normaliza e obtém todos os IDs de produtos explicitamente ativos no MVP.
 */
export function getActiveMvpProductIds(): Set<string> {
    const activeIds = new Set<string>();

    // 1. Coleta da lista em mvp-config.ts
    for (const item of MVP_PRODUCT_SELECTION) {
        if (item && item.trim()) {
            const trimmed = item.trim();
            const resolved = resolveProductId(trimmed);
            activeIds.add(resolved);
            // Também adiciona o shortCode se for
            activeIds.add(trimmed);
        }
    }

    // 2. Coleta de produtos com flag mvpEnabled: true no product-control.ts
    for (const p of productControl) {
        if (p.mvpEnabled === true) {
            activeIds.add(p.id);
            if (p.shortCode) activeIds.add(p.shortCode);
        }
    }

    return activeIds;
}

/**
 * Verifica se um produto específico está disponível para compra no MVP.
 * Se o produto estiver na lista de selecionados do MVP, retorna true.
 * Caso contrário, retorna false (indicando que está "Em Breve").
 */
export function isProductAvailable(productIdOrShortCode: string): boolean {
    if (!productIdOrShortCode) return false;
    const active = getActiveMvpProductIds();
    
    // Se a Dani já selecionou algum produto, apenas os selecionados estão disponíveis
    if (active.size > 0) {
        const resolved = resolveProductId(productIdOrShortCode);
        return active.has(productIdOrShortCode) || active.has(resolved);
    }

    // Se os 10 slots ainda estiverem "em branco", nenhum produto está liberado ainda
    // (todos ficam como "Em Breve" aguardando a seleção)
    return false;
}

/**
 * Retorna se o produto deve exibir a badge e estado "Em Breve"
 */
export function isProductComingSoon(productIdOrShortCode: string): boolean {
    return !isProductAvailable(productIdOrShortCode);
}
