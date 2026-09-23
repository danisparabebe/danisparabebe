import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { HeroGrid } from '@/components/homepage/hero-grid';
import { ProductGrid } from '@/components/homepage/product-grid';
import { SocialProof } from '@/components/homepage/social-proof';
import { Footer } from '@/components/homepage/footer';
import { productControl } from '@/data/product-control';
import { getFinalPrice } from '@/lib/utils';
import { MVP_PRODUCT_SELECTION } from '@/data/mvp-config';
import { resolveProductId } from '@/lib/short-codes';
import { isProductAvailable } from '@/lib/mvp';
import { Sparkles } from 'lucide-react';

// Helper function to alternate Fem and Mas products
function getZippedProducts(products: any[], targetLength: number) {
    if (!products || products.length === 0) return [];
    
    const fem = products.filter(p => p.id.startsWith('FEM') || p.category === 'FEM');
    const mas = products.filter(p => p.id.startsWith('MAS') || p.category === 'MAS');
    
    if (fem.length === 0 || mas.length === 0) return products.slice(0, targetLength);
    
    const result = [];
    let idx = 0;
    while (result.length < targetLength) {
        if (idx < fem.length) result.push(fem[idx]);
        if (result.length >= targetLength) break;
        if (idx < mas.length) result.push(mas[idx]);
        if (result.length >= targetLength) break;
        idx++;
    }
    return result;
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // 1. Prepara todos os produtos com os preços e parcelamentos calculados
    const managedProducts = productControl.map(p => {
        const pixPrice = p.pixPrice || getFinalPrice(p);
        
        // Taxa InfinitePay 3x
        const realInstallment3x = (pixPrice * 1.0754) / 3;
        const available = isProductAvailable(p.id) || isProductAvailable(p.shortCode || '');

        return {
            id: p.id,
            shortCode: p.shortCode,
            name: p.name,
            category: p.category || 'Geral',
            price: pixPrice,
            originalPrice: p.originalPriceFull && p.originalPriceFull > p.priceFull ? p.originalPriceFull : undefined,
            installmentPrice: realInstallment3x,
            installments: 3,
            image: p.images?.[0] ? encodeURI(p.images[0]) : '/Logos/Logomarca%20Rose.png',
            badge: available ? (p.badge || (p.tags?.includes('oferta') ? 'Oferta' : undefined)) : 'Em Breve',
            gridPosition: p.gridPosition,
            tags: p.tags || [],
            isHot: p.isHot || false,
            comingSoon: !available,
        };
    });

    const productMap = new Map(managedProducts.map(p => [p.id, p]));
    const productByCodeMap = new Map(managedProducts.map(p => [p.shortCode || '', p]));

    // 2. Extrai exatamente os 10 produtos selecionados do MVP
    const mvpProducts = MVP_PRODUCT_SELECTION.map((code) => {
        const trimmed = code.trim();
        const resolvedId = resolveProductId(trimmed);
        const found = productMap.get(resolvedId) || productMap.get(trimmed) || productByCodeMap.get(trimmed);
        if (found) {
            return {
                ...found,
                comingSoon: false, // 100% disponível no MVP
                badge: found.badge || 'Destaque',
            };
        }
        return null;
    }).filter(Boolean) as typeof managedProducts;

    // 3. HERO ESQUERDO ("Mais Vendidos"): Filtra os Kits Manta dentre os 10 produtos do MVP
    const kitMantaProducts = mvpProducts.filter(p => p.name.toLowerCase().includes('manta'));
    const heroLeftSlides = getZippedProducts(kitMantaProducts, kitMantaProducts.length).map((p) => ({
        name: p.name,
        image: p.image,
        link: `/produto/${p.shortCode || p.id}`,
        isHot: p.isHot || false
    }));

    // 4. HERO DIREITO ("Ideal para Presentes"): Filtra os Kits Fraldas dentre os 10 produtos do MVP
    const kitFraldasProducts = mvpProducts.filter(p => p.name.toLowerCase().includes('fralda'));
    const heroRightSlides = getZippedProducts(kitFraldasProducts, kitFraldasProducts.length).map((p) => ({
        name: p.name,
        image: p.image,
        link: `/produto/${p.shortCode || p.id}`,
        isHot: p.isHot || false
    }));

    // 5. GRADE INFERIOR: Exatamente os 10 produtos do MVP ordenados do MENOR para o MAIOR preço (5 em cima e 5 embaixo)
    const sortedMvpProducts = [...mvpProducts].sort((a, b) => a.price - b.price);

    return (
        <div className="min-h-screen">
            <TopBar />
            <Header />
            <Navigation />

            <main className="pb-20">
                {/* Hero Section — Carrosséis Duplos com os produtos dos 10 kits MVP */}
                <HeroGrid
                    leftSlides={heroLeftSlides}
                    rightSlides={heroRightSlides}
                    leftTitle="Mais Vendidos"
                    rightTitle="Ideal para Presentes"
                />

                {/* Grade com os 10 produtos do MVP (5 em cima e 5 embaixo, do menor para o maior valor) */}
                <div className="mt-14 sm:mt-18">
                    <ProductGrid
                        title={
                            <span className="flex items-center justify-center gap-2">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-dusty-rose" />
                                Coleção de Inauguração · Os Escolhidos
                            </span>
                        }
                        products={sortedMvpProducts}
                        columns={5}
                    />
                </div>

                {/* Seção de Prova Social com Instagram 50K mantida intacta */}
                <div className="mt-16 sm:mt-24 relative">
                     <div className="absolute inset-0 bg-gradient-to-b from-warm-stone/30 to-transparent -z-10 h-[500px]" />
                     <SocialProof />
                </div>

            </main>

            <Footer />
        </div>
    );
}
