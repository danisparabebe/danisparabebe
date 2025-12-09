import { realProducts } from '@/data/homepage-data';
import { ProductGrid } from '@/components/homepage/product-grid';
import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';
import { notFound } from 'next/navigation';

interface PageProps {
    params: {
        slug: string;
    }
}

// Map slugs to category names in data
const categoryMap: Record<string, string> = {
    'kit-manta': 'Kit Manta',
    'kit-fraldas': 'Kit Fraldas',
    'toalhas': 'Toalhas',
    'body': 'Body',
    'touca': 'Touca',
    'faixa': 'Faixa de Cabelo'
};

export function generateStaticParams() {
    return Object.keys(categoryMap).map((slug) => ({
        slug,
    }));
}

export default function CategoryPage({ params }: PageProps) {
    const categoryName = categoryMap[params.slug];

    if (!categoryName) {
        notFound();
    }

    const products = realProducts.filter(p => p.category === categoryName);

    return (
        <div className="min-h-screen bg-dots-texture">
            <TopBar />
            <Header />
            <Navigation />

            <main className="py-8">
                <ProductGrid title={categoryName} products={products} />
            </main>

            <Footer simple />
        </div>
    );
}
