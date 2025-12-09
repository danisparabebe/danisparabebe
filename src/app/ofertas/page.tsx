import { realProducts } from '@/data/homepage-data';
import { ProductGrid } from '@/components/homepage/product-grid';
import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';

export default function OfertasPage() {
    // Filter products that have originalPrice (showing they are on sale) or badge 'Oferta'
    const products = realProducts.filter(p => p.badge === 'Oferta' || p.originalPrice);

    return (
        <div className="min-h-screen bg-dots-texture">
            <TopBar />
            <Header />
            <Navigation />

            <main className="py-8">
                <ProductGrid title="Ofertas Especiais" products={products} />
            </main>

            <Footer simple />
        </div>
    );
}
