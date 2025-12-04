import { ProductCard } from './product-card';

interface Product {
    id: string;
    name: string;
    category?: string;
    price: number;
    installmentPrice?: number;
    installments?: number;
    image: string;
    badge?: string;
}

interface ProductGridProps {
    title: string;
    products: Product[];
}

export function ProductGrid({ title, products }: ProductGridProps) {
    return (
        <section className="px-4 py-10 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-bold text-charcoal md:text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    {title}
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
