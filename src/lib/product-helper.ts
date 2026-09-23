import { THEMES_FEM, THEMES_MAS, COLORS } from '@/data/admin-options';

/**
 * Extrai o Tema do bordado e a Cor principal pré-configurada de um kit/produto
 * usando o SKU técnico (ex: FEM-KIT-BOR-RLC-BAB-RLC_02) e o nome do produto (ex: Borboletas Rosa Claro · Kit Fraldas).
 */
export function extractThemeAndColor(productId: string = '', productName: string = ''): { theme: string; color: string } {
    const allThemes = [...THEMES_FEM, ...THEMES_MAS];

    // 1. Tenta extrair pelo SKU técnico
    const parts = productId.split('-');
    let themeFromSku = '';
    let colorFromSku = '';

    if (parts.length >= 4) {
        const themeCode = parts[2];
        const colorCode = parts[3];

        const matchTheme = allThemes.find(t => t.value === themeCode);
        if (matchTheme) themeFromSku = matchTheme.label;

        const matchColor = COLORS.find(c => c.value === colorCode);
        if (matchColor) colorFromSku = matchColor.label;
    }

    // 2. Tenta extrair pelo nome amigável do produto
    // Ex: "Borboletas Rosa Claro · Kit Fraldas" -> parte antes de " · " é "Borboletas Rosa Claro"
    const namePart = (productName || '').split('·')[0].trim();

    const knownThemes = [
        'Jardim Encantado',
        'Borboletas',
        'Safari',
        'Astronauta',
        'Ursinho',
        'Ursinha',
        'Monograma',
        'Bailarina',
        'Floral',
        'Coroa',
        'Nuvens',
        'Bebezinha',
        'Times'
    ];

    let themeFromName = '';
    let colorFromName = '';

    for (const kt of knownThemes) {
        if (namePart.toLowerCase().startsWith(kt.toLowerCase())) {
            themeFromName = kt;
            const remaining = namePart.substring(kt.length).trim();
            if (remaining) {
                // Remove preposições se houver (ex: "em Rosê" -> "Rosê")
                colorFromName = remaining.replace(/^(em|de|na|no)\s+/i, '');
            }
            break;
        }
    }

    const finalTheme = themeFromName || themeFromSku || 'Padrão da Foto';
    const finalColor = colorFromName || colorFromSku || 'Padrão da Foto';

    return {
        theme: finalTheme,
        color: finalColor
    };
}
