import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { PromoBanner } from '@/components/homepage/promo-banner';
import { HeroGrid } from '@/components/homepage/hero-grid';
import { ProductGrid } from '@/components/homepage/product-grid';
import { BrandGrid } from '@/components/homepage/brand-grid';
import { Newsletter } from '@/components/homepage/newsletter';
import { Footer } from '@/components/homepage/footer';
import { heroItems, featuredProducts, categoryShowcase, brands } from '@/data/homepage-data';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-warm-stone">
            <TopBar />
            <Header />
            <Navigation />
            <PromoBanner />

            <main>
                {/* Hero Section */}
                <HeroGrid items={heroItems} />

                {/* Featured Products */}
                <ProductGrid title="Produtos em Destaque" products={featuredProducts} />

                {/* Category Showcase */}
                <HeroGrid items={categoryShowcase} />

                {/* Brand Grid */}
                <BrandGrid title="Marcas Especiais" brands={brands} />

                {/* Newsletter */}
                <Newsletter />
            </main>

            <Footer />
        </div>
    );
}
