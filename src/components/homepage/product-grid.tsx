import React from 'react';
import { ProductCard } from './product-card';

interface Product {
    id: string;
    shortCode?: string;
    name: string;
    category?: string;
    price: number;
    installmentPrice?: number;
    installments?: number;
    image: string;
    badge?: string;
    isHot?: boolean;
    comingSoon?: boolean;
}

interface ProductGridProps {
    title: React.ReactNode;
    products: Product[];
    columns?: 4 | 5 | 6;
}

export function ProductGrid({ title, products, columns = 6 }: ProductGridProps) {
    const gridColsClass = columns === 5
        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        : "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

    return (
        <section className="px-4 py-10 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-bold text-charcoal md:text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    {title}
                </h2>
                <div className={gridColsClass}>
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
