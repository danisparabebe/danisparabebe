import { Product, Fabric, Embroidery } from '@/types';

export const mockProducts: Product[] = [
    {
        id: 'fralda-01',
        name: 'Fralda de Boca Premium',
        description: 'Fralda de boca 100% algodão com acabamento de luxo',
        basePrice: 45.00,
        imageUrl: '/products/fralda.jpg',
        category: 'fraldas',
    },
    {
        id: 'body-01',
        name: 'Body Personalizado',
        description: 'Body de algodão egípcio com personalização bordada',
        basePrice: 89.00,
        imageUrl: '/products/body.jpg',
        category: 'bodies',
    },
    {
        id: 'manta-01',
        name: 'Manta Soft Deluxe',
        description: 'Manta super macia em tecido fleece premium',
        basePrice: 165.00,
        imageUrl: '/products/manta.jpg',
        category: 'mantas',
    },
    {
        id: 'toalha-01',
        name: 'Toalha de Banho com Capuz',
        description: 'Toalha felpuda com capuz e bordado personalizado',
        basePrice: 125.00,
        imageUrl: '/products/toalha.jpg',
        category: 'toalhas',
    },
];

export const mockFabrics: Fabric[] = [
    {
        id: 'fabric-01',
        name: 'Poá Rosa',
        textureUrl: '/fabrics/poa-rosa.jpg',
        additionalPrice: 15.00,
    },
    {
        id: 'fabric-02',
        name: 'Estrelinhas Azul',
        textureUrl: '/fabrics/estrelas-azul.jpg',
        additionalPrice: 15.00,
    },
    {
        id: 'fabric-03',
        name: 'Floral Delicado',
        textureUrl: '/fabrics/floral.jpg',
        additionalPrice: 20.00,
    },
    {
        id: 'fabric-04',
        name: 'Listras Candy',
        textureUrl: '/fabrics/listras.jpg',
        additionalPrice: 15.00,
    },
    {
        id: 'fabric-05',
        name: 'Nuvens Brancas',
        textureUrl: '/fabrics/nuvens.jpg',
        additionalPrice: 18.00,
    },
    {
        id: 'fabric-06',
        name: 'Gatinhos Fofos',
        textureUrl: '/fabrics/gatinhos.jpg',
        additionalPrice: 22.00,
    },
];

export const mockEmbroideries: Embroidery[] = [
    {
        id: 'emb-01',
        name: 'Ursinho Clássico',
        designUrl: '/embroidery/ursinho.jpg',
        additionalPrice: 25.00,
    },
    {
        id: 'emb-02',
        name: 'Coroa Real',
        designUrl: '/embroidery/coroa.jpg',
        additionalPrice: 30.00,
    },
    {
        id: 'emb-03',
        name: 'Estrela Brilhante',
        designUrl: '/embroidery/estrela.jpg',
        additionalPrice: 25.00,
    },
    {
        id: 'emb-04',
        name: 'Coração Delicado',
        designUrl: '/embroidery/coracao.jpg',
        additionalPrice: 25.00,
    },
    {
        id: 'emb-05',
        name: 'Balão de Ar',
        designUrl: '/embroidery/balao.jpg',
        additionalPrice: 28.00,
    },
    {
        id: 'emb-06',
        name: 'Lua e Estrelas',
        designUrl: '/embroidery/lua-estrelas.jpg',
        additionalPrice: 32.00,
    },
];

export const getBestSellers = (): Product[] => {
    return mockProducts.slice(0, 3);
};
