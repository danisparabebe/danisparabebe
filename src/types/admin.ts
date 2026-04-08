export interface ManagedProduct {
    id: string;
    shortCode?: string;
    name: string;
    technicalName?: string;
    description: string;
    priceFull: number;
    originalPriceFull?: number;
    pixPrice?: number;
    discountPct: number;
    pixDiscountPct?: number;
    netValue?: number;
    images: string[];
    gridPosition: string;
    category?: string;
    badge?: string;
    tags?: string[];
    features?: string[];
    theme?: string;
    type?: string;
    color?: string;
    published?: boolean;
    publishedAt?: string | null;
    isHot?: boolean;
}
