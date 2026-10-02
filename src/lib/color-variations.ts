import { COLORS } from '@/data/admin-options';

export const COLOR_HEX_MAP: Record<string, string> = {
    // Cores Principais
    'rosa bebê': '#FADADD',
    'rosa bebe': '#FADADD',
    'rosa claro': '#FFD1DC',
    'rosa': '#F49AC2',
    'rosé': '#D4A373',
    'rose': '#D4A373',
    'rosê': '#D4A373',
    'rosé claro': '#E8C5B8',
    'rose claro': '#E8C5B8',
    'rosa chiclete': '#FF69B4',
    'pink': '#E0218A',
    'marsala': '#651C32',
    'salmão': '#FA8072',
    'salmao': '#FA8072',
    'vermelho': '#DC2626',
    
    // Azuis
    'azul bebê': '#B0E0E6',
    'azul bebe': '#B0E0E6',
    'azul celeste': '#87CEEB',
    'celeste': '#87CEEB',
    'azul marinho': '#1E3A8A',
    'marinho': '#1E3A8A',
    'azul turquesa': '#40E0D0',
    'turquesa': '#40E0D0',
    'azul royal': '#2563EB',
    'azul': '#3B82F6',

    // Verdes
    'verde claro': '#A7F3D0',
    'verde menta': '#6EE7B7',
    'menta': '#6EE7B7',
    'verde militar': '#4D5D53',
    'militar': '#4D5D53',
    'verde': '#10B981',

    // Neutros e Tons de Terra
    'branco': '#FFFFFF',
    'creme': '#FFFDD0',
    'off white': '#FAF9F6',
    'off-white': '#FAF9F6',
    'bege': '#E5D3B3',
    'caramelo': '#C68B59',
    'marrom': '#78350F',
    'cinza': '#9CA3AF',
    'preto': '#1E293B',

    // Tons Quentes
    'amarelo': '#FDE047',
    'amarelo bebê': '#FEF08A',
    'amarelo bebe': '#FEF08A',
    'laranja': '#FB923C',
    'lilás': '#C084FC',
    'lilas': '#C084FC',
    'lavanda': '#DDD6FE',
    'colorido': '#F43F5E',
};

/**
 * Retorna o código hexadecimal correspondente ao nome da cor.
 */
export function getColorHex(colorName?: string): string {
    if (!colorName) return '#E2E8F0';
    const normalized = colorName.trim().toLowerCase();
    
    if (COLOR_HEX_MAP[normalized]) {
        return COLOR_HEX_MAP[normalized];
    }

    // Busca por substring aproximada
    for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return hex;
        }
    }

    return '#CBD5E1';
}

/**
 * Gera automaticamente o título da nova variação de cor.
 * Ex: Se base for "Borboletas Rosé · Kit Manta" e nova cor for "Rosa Bebê",
 * gera "Borboletas Rosa Bebê · Kit Manta".
 */
export function generateVariationTitle(baseName: string, newColorName: string): string {
    if (!baseName || !newColorName) return baseName || '';
    const cleanColor = newColorName.trim();

    // Se o nome contiver "·", divide em [Tema e Cor] · [Tipo de Kit]
    if (baseName.includes('·')) {
        const parts = baseName.split('·').map(p => p.trim());
        const left = parts[0];
        const right = parts.slice(1).join(' · ');

        // Tenta substituir qualquer cor conhecida no lado esquerdo
        let replacedLeft = left;
        const commonColorNames = [
            'Rosé Claro', 'Rose Claro', 'Rosa Bebê', 'Rosa Bebe', 'Rosa Claro',
            'Rosa Chiclete', 'Azul Bebê', 'Azul Bebe', 'Azul Marinho', 'Verde Militar',
            'Verde Menta', 'Verde Claro', 'Rosé', 'Rose', 'Rosê', 'Rosa',
            'Lavanda', 'Lilás', 'Lilas', 'Celeste', 'Militar', 'Marinho',
            'Bege', 'Branco', 'Creme', 'Caramelo', 'Amarelo'
        ];

        let matched = false;
        for (const c of commonColorNames) {
            const regex = new RegExp(`\\b${c}\\b`, 'i');
            if (regex.test(replacedLeft)) {
                replacedLeft = replacedLeft.replace(regex, cleanColor);
                matched = true;
                break;
            }
        }

        if (!matched) {
            replacedLeft = `${left} ${cleanColor}`;
        }

        return `${replacedLeft} · ${right}`;
    }

    return `${baseName} - ${cleanColor}`;
}

/**
 * Gera descrição adaptada para a nova cor trocando referências da cor antiga pela nova.
 */
export function generateVariationDescription(baseDesc: string, newColorName: string, oldColorName?: string): string {
    if (!baseDesc) return '';
    if (!oldColorName || !newColorName) return baseDesc;

    const regex = new RegExp(oldColorName, 'gi');
    return baseDesc.replace(regex, newColorName);
}

/**
 * Detecta a cor de um produto a partir de seu SKU, nome ou campo color.
 */
export function detectColorFromProduct(product: { name?: string; color?: string; id?: string }): string {
    if (product.color) {
        const found = COLORS.find(c => c.value === product.color);
        if (found) return found.label;
    }

    // Tenta pelo SKU (ex: FEM-KIT-BOR-RSA-BAB...)
    if (product.id) {
        const parts = product.id.split('-');
        // Para KIT, a cor geralmente fica na 4ª posição (índice 3 ou 4)
        for (const p of parts) {
            const found = COLORS.find(c => c.value === p);
            if (found) return found.label;
        }
    }

    // Tenta pelo nome comercial
    if (product.name) {
        for (const c of COLORS) {
            const regex = new RegExp(`\\b${c.label}\\b`, 'i');
            if (regex.test(product.name)) {
                return c.label;
            }
        }
    }

    return 'Personalizada';
}

/**
 * Extrai o tema ou termo base do produto para busca de kits semelhantes.
 */
export function extractThemeKeyword(product: { name?: string; id?: string }): string {
    if (product.name) {
        const firstPart = product.name.split('·')[0].split('-')[0].trim();
        // Remove palavras comuns de cores para isolar o tema
        const words = firstPart.split(' ').filter(w => {
            const lower = w.toLowerCase();
            return !['rosa', 'rosé', 'rose', 'bebe', 'bebê', 'claro', 'marinho', 'militar', 'menta', 'kit', 'manta', 'fralda', 'de', 'em'].includes(lower);
        });
        if (words.length > 0) return words.join(' ');
    }

    if (product.id) {
        const parts = product.id.split('-');
        if (parts.length >= 3) {
            return parts[2]; // ex: BOR, SAF, JDE, MON, URS
        }
    }

    return '';
}

