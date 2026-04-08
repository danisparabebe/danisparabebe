export const realProducts = [
    // ... products existing ...
    {
        id: 'kit-manta-bordada',
        name: 'Kit Manta Bordada Personalizada',
        category: 'Kit Manta',
        description: 'Kit completo com manta flanelada, fralda grande e fralda de boca, tudo personalizado com bordado.',
        price: 189.00,
        installmentPrice: 67.00,
        installments: 3,
        image: '/produtos/Kit manta - produto campeão 2.jpeg',
        badge: 'Produto Campeão',
        includes: ['1 manta flanelada', '1 fralda grande', '1 fralda de boca']
    },
    {
        id: 'kit-fraldas-bordadas',
        name: 'Kit Fraldas Bordadas Personalizadas',
        category: 'Kit Fraldas',
        description: 'Kit essencial com fralda grande e fralda de boca personalizadas com bordado.',
        price: 87.00,
        installmentPrice: 31.00,
        installments: 3,
        image: '/produtos/Kit fraldas - produto campeão 1.jpeg',
        badge: 'Produto Campeão',
        includes: ['1 fralda grande', '1 fralda de boca']
    },
    {
        id: 'body-bordado',
        name: 'Body Bordado Personalizado',
        category: 'Body',
        description: 'Body personalizado com bordado do nome do bebê.',
        price: 57.00,
        installmentPrice: 19.00,
        installments: 3,
        image: '/produtos/Body personalizado.jpeg',
        includes: ['1 body personalizado']
    },
    {
        id: 'toalha-banho-bordada',
        name: 'Toalha de Banho Forrada Bordada',
        category: 'Toalhas',
        description: 'Toalha de banho com capuz personalizada com bordado.',
        price: 138.00,
        installmentPrice: 46.00,
        installments: 3,
        image: '/produtos/Toalha de banho.jpeg',
        includes: ['1 toalha de banho com capuz personalizada']
    },
    {
        id: 'touca-personalizada',
        name: 'Touca Bordada Personalizada',
        category: 'Touca',
        description: 'Touca bordada personalizada para bebê.',
        price: 34.00,
        installmentPrice: 11.50,
        installments: 3,
        image: '/produtos/Touca.jpeg',
        includes: ['1 touca bordada personalizada']
    },
    {
        id: 'faixa-cabelo',
        name: 'Faixa de Cabelo Bordada',
        category: 'Faixa de Cabelo',
        description: 'Faixa de cabelo bordada personalizada.',
        price: 24.00,
        installmentPrice: 8.00,
        installments: 3,
        image: '/produtos/Faixa de cabelo.jpeg',
        includes: ['1 faixa de cabelo bordada personalizada']
    },
    // Mock Products for Grid Population (Using actual existing images as requested)
    {
        id: 'kit-manta-luxo',
        name: 'Kit Manta Luxo Bordada',
        category: 'Kit Manta',
        description: 'Manta em piquet com acabamento de luxo.',
        price: 210.00,
        installmentPrice: 70.00,
        installments: 3,
        image: '/produtos/conferidos/FEM-MNT-BOR-RSA-BAB-RSA_01.jpeg',
        includes: ['1 manta luxo', '1 fralda grande']
    },
    {
        id: 'kit-fraldas-simples',
        name: 'Kit Fraldas Menino',
        category: 'Kit Fraldas',
        description: 'Kit com fraldas para o dia a dia.',
        price: 65.00,
        installmentPrice: 21.66,
        installments: 3,
        image: '/produtos/conferidos/MAS-FRP-SAF-AZM-BAB-AZM-BCO_01.jpeg',
        includes: ['3 fraldas de boca']
    },
    {
        id: 'toalha-fralda',
        name: 'Toalha de Banho Bordada',
        category: 'Toalhas',
        description: 'Toalha macia para recém nascido.',
        price: 189.90,
        installmentPrice: 63.30,
        installments: 3,
        image: '/produtos/conferidos/FEM-TOB-BOR-RSA-RSA_01.jpeg',
        includes: ['1 toalha forrada']
    },
    {
        id: 'body-manga-longa',
        name: 'Body Manga Longa Bordado Menina',
        category: 'Body',
        description: 'Body manga longa suedine 100% algodão.',
        price: 62.00,
        installmentPrice: 20.66,
        installments: 3,
        image: '/produtos/conferidos/FEM-BDL-BOR-LIL-BAB-LIL_01.jpeg',
        includes: ['1 body manga longa']
    },
    {
        id: 'body-oferta',
        name: 'Body Personalizado (Oferta)',
        category: 'Body',
        description: 'Body personalizado para dia a dia.',
        price: 39.90,
        installmentPrice: 13.30,
        installments: 3,
        originalPrice: 59.90,
        image: '/produtos/conferidos/Body personalizado.jpeg',
        badge: 'Oferta',
        includes: ['1 body básico']
    },
    {
        id: 'kit-manta-oferta',
        name: 'Kit Completo Sonho',
        category: 'Kits',
        description: 'Kit completo com valor especial para Menino.',
        price: 259.90,
        installmentPrice: 86.63,
        installments: 3,
        originalPrice: 299.90,
        image: '/produtos/conferidos/MAS-KIT-MON-BGE-BAB-BCO_01.jpeg',
        badge: 'Oferta',
        includes: ['1 manta', '1 fralda']
    }
];

export const heroItems = [
    {
        title: 'Kit Manta Borboleta',
        subtitle: 'Personalizado à beira de luxo',
        image: '/produtos/conferidos/FEM-KIT-BAI-MAR-BAB-MAR_01.jpeg',
        link: '/produto/FEM-KIT-BAI-MAR-BAB-MAR_01',
        ctaText: 'QUERO ESSE',
        badge: 'MAIS VENDIDO',
        urgencyText: 'Em Alta'
    },
    {
        title: 'Kit Fraldas Ninho Safari',
        subtitle: 'O presente inesquecível',
        image: '/produtos/conferidos/MAS-KIT-MON-ABB-TCB-BCO-ABB_01.jpeg',
        link: '/produto/MAS-KIT-MON-ABB-TCB-BCO-ABB_01',
        ctaText: 'QUERO ESSE',
        badge: 'IDEAL PARA PRESENTES'
    }
];

export const categoryShowcase = [
    {
        title: 'Body Bordado',
        subtitle: 'Personalizado para seu bebê',
        image: '/produtos/conferidos/FEM-BDL-BOR-LIL-BAB-LIL_01.jpeg',
        link: '/produto/FEM-BDL-BOR-LIL-BAB-LIL_01',
        ctaText: 'DESCOBRIR'
    },
    {
        title: 'Baby Essentials',
        subtitle: 'Touca Bordada Personalizada',
        image: '/produtos/conferidos/MAS-TOU-VAR-VDC_01.jpeg',
        link: '/produto/MAS-TOU-VAR-VDC_01',
        ctaText: 'QUERO ESSE'
    }
];
