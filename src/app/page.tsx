import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { HeroGrid } from '@/components/homepage/hero-grid';
import { ProductGrid } from '@/components/homepage/product-grid';
import { SocialProof } from '@/components/homepage/social-proof';
import { Footer } from '@/components/homepage/footer';
import { productControl } from '@/data/product-control';
import { getFinalPrice } from '@/lib/utils';
import { Heart, Gift, Flame, Gem } from 'lucide-react';

// Helper function to create the Zipper pattern (Fem/Mas alternated continuously)
function getZippedProducts(products: any[], targetLength: number) {
    if (!products || products.length === 0) return [];
    
    // Split by gender identifier
    const fem = products.filter(p => p.id.startsWith('FEM') || p.category === 'FEM');
    const mas = products.filter(p => p.id.startsWith('MAS') || p.category === 'MAS');
    
    // If we only have one type or neither, just return standard slice
    if (fem.length === 0 || mas.length === 0) return products.slice(0, targetLength);
    
    const result = [];
    let idx = 0;
    while (result.length < targetLength) {
        // Grab FEM
        result.push(fem[idx % fem.length]);
        if (result.length >= targetLength) break;
        // Grab MAS
        result.push(mas[idx % mas.length]);
        if (result.length >= targetLength) break;
        idx++;
    }
    return result;
}

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

    // Build the arrays safely dynamically from User Tags
    const allProductsArray = [...managedProducts];
    
    const maisVendidos = allProductsArray.filter(p => p.tags?.some(t => t.toLowerCase().includes('vendid') || t.toLowerCase().includes('bestseller')));
    const presentes = allProductsArray.filter(p => p.tags?.some(t => t.toLowerCase().includes('present') || t.toLowerCase().includes('benef') || t.toLowerCase().includes('custo')));
    const luxos = allProductsArray.filter(p => p.tags?.some(t => t.toLowerCase().includes('luxo') || t.toLowerCase().includes('premium')) || p.price > 250); 
    const favoritos = allProductsArray.filter(p => p.tags?.some(t => Math.abs(t.toLowerCase().localeCompare('dia a dia')) < 2 || t.toLowerCase().includes('mãe') || t.toLowerCase().includes('favorit')) || topzeraIds.includes(p.id));

    // Replace 6 with 12 to double the capacity
    const heroLeftSource = maisVendidos.length > 0 ? maisVendidos : supremos.slice(0, 8); 
    let heroRightSource = presentes.length > 0 ? presentes : supremos.slice(4, 12);
    
    // De-duplication: Ensure Hero 2 doesn't show identical first items as Hero 1 just because they share tags
    const leftIds = new Set(heroLeftSource.map((p: any) => p.id));
    const distinctRight = heroRightSource.filter((p: any) => !leftIds.has(p.id));
    if (distinctRight.length >= 2) { 
        heroRightSource = distinctRight; 
    }
    
    // Split supremos for the Dual Carousel Hero applying the ZIpper Logic with limit 12
    const heroLeftSlides = getZippedProducts(heroLeftSource, 12).map((p, idx) => ({
        name: p.name,
        image: p.image,
        link: `/produto/${p.shortCode || p.id}`,
        isHot: p.isHot || false
    }));

    const heroRightSlides = getZippedProducts(heroRightSource, 12).map((p, idx) => ({
        name: p.name,
        image: p.image,
        link: `/produto/${p.shortCode || p.id}`,
        isHot: p.isHot || false
    }));

    return (
        <div className="min-h-screen bg-warm-stone">
            <TopBar />
            <Header />
            <Navigation />

            <main className="pb-20">
                {/* Hero Section — Dual Carousel with Supremos */}
                <HeroGrid
                    leftSlides={heroLeftSlides}
                    rightSlides={heroRightSlides}
                    leftTitle="Mais Vendidos"
                    rightTitle="Presentes Perfeitos"
                />

                {/* --- Grid 1: Luxo e Exclusividade --- */}
                {luxos.length > 0 && (
                    <div className="mt-20">
                        <ProductGrid
                            title={
                                <span className="flex items-center justify-center gap-2">
                                    <Gem className="w-6 h-6 sm:w-8 sm:h-8 text-charcoal/80" />
                                    Luxo e Exclusividade
                                </span>
                            }
                            products={luxos.slice(0, 8)}
                        />
                    </div>
                )}

                {/* --- Grid 2: Os Favoritos das Mamães --- */}
                {favoritos.length > 0 && (
                    <div className="mt-16 sm:mt-24">
                        <ProductGrid
                            title={
                                <span className="flex items-center justify-center gap-2">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-charcoal/80" />
                                    Os Favoritos das Mamães
                                </span>
                            }
                            products={favoritos.slice(0, 8)} 
                        />
                    </div>
                )}

                {/* --- INTEGRAÇÃO PROVA SOCIAL INSTAGRAM 50K --- */}
                <div className="mt-16 sm:mt-24 relative">
                     <div className="absolute inset-0 bg-gradient-to-b from-warm-stone/30 to-transparent -z-10 h-[500px]" />
                     <SocialProof />
                </div>

            </main>

            <Footer />
        </div>
    );
}
