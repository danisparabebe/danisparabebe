import { EMBROIDERY_THEME_PRICE } from '@/lib/pricing';

export const baseItems = [
    {
        id: 'item-1',
        name: 'Body Manga Curta',
        price: 89.90,
    },
    {
        id: 'item-2',
        name: 'Body Manga Longa',
        price: 99.90,
    },
    {
        id: 'item-3',
        name: 'Mijão',
        price: 79.90,
    },
    {
        id: 'item-4',
        name: 'Manta',
        price: 149.90,
    },
    {
        id: 'item-5',
        name: 'Touca',
        price: 49.90,
    },
    {
        id: 'item-6',
        name: 'Luvas',
        price: 39.90,
    },
];

export const fabrics = [
    {
        id: 'fabric-1',
        name: 'Algodão Pima',
        priceModifier: 0,
    },
    {
        id: 'fabric-2',
        name: 'Algodão Orgânico',
        priceModifier: 29.90,
    },
    {
        id: 'fabric-3',
        name: 'Suedine Premium',
        priceModifier: 39.90,
    },
];

export const embroideries = [
    {
        id: 'embroidery-1',
        name: 'Sem Bordado Tático',
        priceModifier: 0,
    },
    {
        id: 'embroidery-2',
        name: 'Bordado Tema Padrão',
        priceModifier: EMBROIDERY_THEME_PRICE,
    },
    {
        id: 'embroidery-3',
        name: 'Bordado Tema Super Preenchido',
        priceModifier: EMBROIDERY_THEME_PRICE + 20,
    },
];
