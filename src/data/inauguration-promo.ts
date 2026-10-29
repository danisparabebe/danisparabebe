/**
 * CONFIGURAÇÃO DO BANNER & KITS DE INAUGURAÇÃO
 * ============================================
 * Campanha de inauguração: "Leve 4, Pague 3"
 * Válida EXCLUSIVAMENTE para 2 modelos específicos:
 * 1. Kit Manta Borboletas Rosa (Menina) — 5 unidades
 * 2. Kit Manta Safari Verde Militar (Menino) — 5 unidades
 * Os demais produtos do site continuam com seus preços e composições regulares.
 */

export interface InaugurationPromoConfig {
    enabled: boolean;
    badgeText: string;
    headline: string;
    highlightWord: string;
    subheadline: string;
    scarcityText: string;
    exclusiveNotice: string;
    totalUnits: number;
    remainingUnits: number;
    unitsPerGender: number;
    savingsText: string;
    gift: {
        title: string;
        highlight: string;
        valueOriginal: number;
        description: string;
        tag: string;
    };
    kits: {
        fem: {
            id: string;
            shortCode: string;
            badge: string;
            tag: string;
            name: string;
            themeName: string;
            colorName: string;
            subtitle: string;
            composition: string;
            image: string;
            giftImage: string;
            priceFull: number;         // R$ 249,00 (De)
            pixPrice: number;          // R$ 197,00 (Por no PIX)
            installmentCount: number;  // 3x
            installmentValue: number;  // R$ 70,62
            cardTotal: number;         // R$ 211,85
            link: string;
            cta: string;
            unitsAvailable: number;    // 5
        };
        mas: {
            id: string;
            shortCode: string;
            badge: string;
            tag: string;
            name: string;
            themeName: string;
            colorName: string;
            subtitle: string;
            composition: string;
            image: string;
            giftImage: string;
            priceFull: number;         // R$ 249,00 (De)
            pixPrice: number;          // R$ 197,00 (Por no PIX)
            installmentCount: number;  // 3x
            installmentValue: number;  // R$ 70,62
            cardTotal: number;         // R$ 211,85
            link: string;
            cta: string;
            unitsAvailable: number;    // 5
        };
    };
}

export const INAUGURATION_PROMO_CONFIG: InaugurationPromoConfig = {
    enabled: true,
    badgeText: "Inauguração Oficial · Leve 4, Pague 3",
    headline: "Na compra do Kit Manta com 3 peças,",
    highlightWord: "Ganhe 1 Fralda de Boca de Presente",
    subheadline: "Apenas 5 unidades de cada modelo. Somente para os bordados abaixo.",
    scarcityText: "Apenas 5 unidades de cada modelo na promoção",
    exclusiveNotice: "Promoção restrita exclusivamente a estes 2 bordados. Os demais produtos do site seguem o valor normal.",
    totalUnits: 10,
    remainingUnits: 10,
    unitsPerGender: 5,
    savingsText: "R$ 52 de desconto + 1 Fralda de Boca de brinde",
    gift: {
        title: "Brinde Especial",
        highlight: "1x Fralda de Boca 100% Algodão",
        valueOriginal: 39.00,
        description: "Bordada com o mesmo tema e o nome do seu bebê.",
        tag: "4ª PEÇA GRÁTIS"
    },
    kits: {
        fem: {
            id: "FEM-KIT-MAN-BOR-RSE-PROMO-INAU_01",
            shortCode: "DPB-INAU-FEM",
            badge: "Menina",
            tag: "Opção Menina · Borboletas Rosa",
            name: "Kit Manta Borboletas Rosa",
            themeName: "Borboletas",
            colorName: "Rosa",
            subtitle: "Manta Forrada + Fralda Grande + Fralda Pequena",
            composition: "1 Manta + 1 Fralda Grande + 1 Fralda Pequena + 1 Fralda de Boca (Brinde)",
            image: "/produtos/conferidos/FEM-KIT-MAN-BOR-RSE-PROMO-INAU_01.jpeg",
            giftImage: "/produtos/conferidos/FEM-KIT-MAN-BOR-RSE-PROMO-INAU_01.jpeg",
            priceFull: 249,
            pixPrice: 197,
            installmentCount: 3,
            installmentValue: 70.62,
            cardTotal: 211.85,
            link: "/produto/DPB-INAU-FEM",
            cta: "Personalizar Kit Menina",
            unitsAvailable: 5
        },
        mas: {
            id: "MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01",
            shortCode: "DPB-INAU-MAS",
            badge: "Menino",
            tag: "Opção Menino · Safari Verde Militar",
            name: "Kit Manta Safari Verde Militar",
            themeName: "Safari",
            colorName: "Verde Militar",
            subtitle: "Manta Forrada + Fralda Grande + Fralda Pequena",
            composition: "1 Manta + 1 Fralda Grande + 1 Fralda Pequena + 1 Fralda de Boca (Brinde)",
            image: "/produtos/conferidos/MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01.jpeg",
            giftImage: "/produtos/conferidos/MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01.jpeg",
            priceFull: 249,
            pixPrice: 197,
            installmentCount: 3,
            installmentValue: 70.62,
            cardTotal: 211.85,
            link: "/produto/DPB-INAU-MAS",
            cta: "Personalizar Kit Menino",
            unitsAvailable: 5
        }
    }
};
