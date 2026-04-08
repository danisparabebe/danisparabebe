import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { HeroGrid } from '@/components/homepage/hero-grid';
import { ProductGrid } from '@/components/homepage/product-grid';
import { Newsletter } from '@/components/homepage/newsletter';
import { Footer } from '@/components/homepage/footer';
import { productControl } from '@/data/product-control';
import { getFinalPrice } from '@/lib/utils';
import { Heart, Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // 1. Prepare all products with calculated pricing
    const managedProducts = productControl.map(p => {
        const pixPrice = p.pixPrice || getFinalPrice(p);
        const cardPrice = p.priceFull;
        return {
            id: p.id,
            shortCode: p.shortCode,
            name: p.name,
            category: p.category || 'Geral',
            price: pixPrice,
            originalPrice: p.originalPriceFull && p.originalPriceFull > p.priceFull ? p.originalPriceFull : undefined,
            installmentPrice: cardPrice / 3,
            installments: 3,
            image: p.images?.[0] ? encodeURI(p.images[0]) : '/Logos/Logomarca%20Rose.png',
            badge: p.badge || (p.tags?.includes('oferta') ? 'Oferta' : undefined),
            gridPosition: p.gridPosition,
            tags: p.tags || [],
            isHot: p.isHot || false
        };
    });

    // Helper map for quick ID lookup
    const productMap = new Map(managedProducts.map(p => [p.id, p]));

    // --- USER CURATED LISTS ---
    const supremoIds = [
        "FEM-KIT-BOR-RSA-BAB-RSA-R_RSA_01",
        "FEM-KIT-JDE-LIL-BAB-LIL-R_01",
        "FEM-FRP-BOR-RSE-BAB-RSE_01",
        "FEM-FRP-BOR-RSA-BAB-RSA-R_01",
        "FEM-KIT-BAI-LIL-BAB-LIL-R_01",
        "MAS-KIT-SAF-VDM-BAB-VDM_01",
        "FEM-KIT-MON-RSE-BAB-RSE-R-R_BCO"
    ];

    const topzeraIds = [
        "FEM-KIT-MON-LIL-BAB-LIL_01",
        "MAS-KIT-URS-ABB-BAB-ABB_03",
        "MAS-KIT-URS-ABB-BAB-ABB_04",
        "MAS-KIT-SAF-AZM-BAB-AZM_01",
        "FEM-KIT-JDE-AMA-BAB-LIL-VDC_01",
        "FEM-KIT-FLO-RSA-BAB-RSA_03",
        "FEM-KIT-BOR-RLC-BAB-BCO-RLC_01",
        "FEM-KIT-FLO-RSA-BAB-RSA_02",
        "FEM-KIT-MON-RSA-BAB-RSA-R_RSA_02"
    ];

    const presentesIds = [
        "MAS-KIT-JDE-VDM-BAB-VDM_01",
        "MAS-KIT-JDE-ABB-BAB-ABB-R_ABB_01",
        "FEM-KIT-JDE-LIL-BAB-LIL_02",
        "FEM-KIT-BOR-RLC-BAB-RLC_02",
        "FEM-KIT-BAI-VRM-BAB-VRM_02",
        "FEM-KIT-FLO-LIL-BAB-LIL_06",
        "FEM-KIT-FLO-RSA-BAB-RSA_02",
        "FEM-KIT-MON-RSA-BAB-RSA-R_RSA_02"
    ];

    // Build the arrays safely (filter out any undefined if ID mismatched)
    const supremos = supremoIds.map(id => productMap.get(id)).filter(Boolean) as typeof managedProducts;
    const topzeras = topzeraIds.map(id => productMap.get(id)).filter(Boolean) as typeof managedProducts;
    const presentes = presentesIds.map(id => productMap.get(id)).filter(Boolean) as typeof managedProducts;

    // Split supremos for the Dual Carousel Hero (4 left, 3 right)
    const heroLeftSlides = supremos.slice(0, 4).map(p => ({
        name: p.name,
        image: p.image,
        link: `/produto/${p.shortCode || p.id}`,
        isHot: p.isHot
    }));

    const heroRightSlides = supremos.slice(4).map(p => ({
        name: p.name,
        image: p.image,
        link: `/produto/${p.shortCode || p.id}`,
        isHot: p.isHot
    }));

    return (
        <div className="min-h-screen bg-[#faf9f7]">
            <TopBar />
            <Header />
            <Navigation />

            <main className="pb-20">
                {/* Hero Section — Dual Carousel with Supremos */}
                <HeroGrid
                    leftSlides={heroLeftSlides}
                    rightSlides={heroRightSlides}
                    leftTitle="Destaques Absolutos"
                    rightTitle="Luxo e Exclusividade"
                />

                {/* Destaque Topzera - The absolute best sellers for moms */}
                {topzeras.length > 0 && (
                    <div className="mt-16 sm:mt-24">
                        <ProductGrid
                            title={
                                <span className="flex items-center justify-center gap-2">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-dusty-rose fill-dusty-rose/20" />
                                    Os Favoritos das Mamães
                                </span>
                            }
                            products={topzeras} 
                        />
                    </div>
                )}

                {/* Presentes Perfeitos (Custo-Benefício) */}
                {presentes.length > 0 && (
                    <div className="mt-16 sm:mt-24 relative">
                        {/* Decorative background shape for presents section */}
                        <div className="absolute inset-0 bg-gradient-to-b from-warm-stone/30 to-transparent -z-10 h-[500px]" />
                        <ProductGrid
                            title={
                                <span className="flex items-center justify-center gap-2">
                                    <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-charcoal" />
                                    Presentes Perfeitos e Acessíveis
                                </span>
                            }
                            products={presentes}
                        />
                    </div>
                )}

                {/* Newsletter */}
                <div className="mt-20">
                    <Newsletter />
                </div>
            </main>

            <Footer />
        </div>
    );
}
