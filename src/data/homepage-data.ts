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
    // Mock Products for Grid Population
    {
        id: 'kit-manta-luxo',
        name: 'Kit Manta Luxo Bordada',
        category: 'Kit Manta',
        description: 'Manta em piquet com acabamento de luxo.',
        price: 210.00,
        installmentPrice: 70.00,
        installments: 3,
        image: '', // Placeholder
        includes: ['1 manta luxo', '1 fralda grande']
    },
    {
        id: 'kit-fraldas-simples',
        name: 'Kit Fraldas Passeio',
        category: 'Kit Fraldas',
        description: 'Kit com 3 fraldas de boca.',
        price: 65.00,
        installmentPrice: 21.66,
        installments: 3,
        image: '',
        includes: ['3 fraldas de boca']
    },
    {
        id: 'toalha-fralda',
        name: 'Toalha Fralda Bordada',
        category: 'Toalhas',
        description: 'Toalha fralda macia para recém nascido.',
        price: 89.90,
        installmentPrice: 29.96,
        installments: 3,
        image: '',
        includes: ['1 toalha fralda']
    },
    {
        id: 'body-manga-longa',
        name: 'Body Manga Longa Bordado',
        category: 'Body',
        description: 'Body manga longa suedine 100% algodão.',
        price: 62.00,
        installmentPrice: 20.66,
        installments: 3,
        image: '',
        includes: ['1 body manga longa']
    },
    {
        id: 'body-oferta',
        name: 'Body Básico (Oferta)',
        category: 'Body',
        description: 'Body básico para dia a dia.',
        price: 39.90,
        installmentPrice: 13.30,
        installments: 3,
        originalPrice: 59.90,
        image: '',
        badge: 'Oferta',
        includes: ['1 body básico']
    },
    {
        id: 'kit-manta-oferta',
        name: 'Kit Manta Promocional',
        category: 'Kit Manta',
        description: 'Kit manta com valor especial.',
        price: 159.90,
        installmentPrice: 53.30,
        installments: 3,
        originalPrice: 199.90,
        image: '',
        badge: 'Oferta',
        includes: ['1 manta', '1 fralda']
    }
];

export const heroItems = [
    {
        title: 'Kit Manta Bordada',
        subtitle: 'Personalizado com muito carinho',
        image: '/produtos/Kit manta - produto campeão 2.jpeg',
        link: '/produto/kit-manta-bordada',
        ctaText: 'COMPRAR AGORA'
    },
    {
        title: 'Presentes Especiais',
        subtitle: 'Kit Fraldas Bordadas',
        image: '/produtos/Kit fraldas - produto campeão 1.jpeg',
        link: '/produto/kit-fraldas-bordadas',
        ctaText: 'COMPRAR AGORA'
    }
];

export const categoryShowcase = [
    {
        title: 'Body Bordado',
        subtitle: 'Personalizado para seu bebê',
        image: '/produtos/Body personalizado.jpeg',
        link: '/produto/body-bordado',
        ctaText: 'DESCOBRIR'
    },
    {
        title: 'Baby Essentials',
        subtitle: 'Touca Bordada Personalizada',
        image: '/produtos/Touca.jpeg',
        link: '/produto/touca-personalizada',
        ctaText: 'COMPRAR AGORA'
    }
];
