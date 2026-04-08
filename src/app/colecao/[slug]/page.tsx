import { productControl } from '@/data/product-control';
import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';
import { CollectionProducts } from '@/components/collection/collection-products';

export const dynamic = 'force-dynamic';

async function getCategoryProducts(slug: string) {
    const products: any[] = [];

    productControl.forEach(metadata => {
        // Determine Gender from filename prefix if possible, or from tags
        let gender: 'Menina' | 'Menino' | 'Unissex' = 'Unissex';
        if (metadata.id.startsWith('FEM-') || metadata.tags?.includes('feminino') || metadata.tags?.includes('menina')) gender = 'Menina';
        if (metadata.id.startsWith('MAS-') || metadata.tags?.includes('masculino') || metadata.tags?.includes('menino')) gender = 'Menino';

        // Filter logic based on slug
        let isMatch = false;
        
        // Match exact tags based on slug
        if (slug === 'bestsellers' && metadata.tags?.includes('Bestsellers')) isMatch = true;
        if (slug === 'saida-de-maternidade' && metadata.tags?.includes('Saída de Maternidade')) isMatch = true;
        if (slug === 'para-presentear' && metadata.tags?.includes('Para Presentear')) isMatch = true;
        if (slug === 'linha-premium' && metadata.tags?.includes('Linha Premium')) isMatch = true;
        if (slug === 'essenciais' && metadata.tags?.includes('Essenciais')) isMatch = true;
        if (slug === 'cha-de-bebe' && metadata.tags?.includes('Chá de Bebê')) isMatch = true;
        if (slug === 'custo-beneficio' && metadata.tags?.includes('Custo-Benefício')) isMatch = true;

        if (slug === 'todos') isMatch = true;

        if (isMatch) {
            const pixPrice = metadata.pixPrice || metadata.priceFull * (1 - (metadata.discountPct || 0) / 100);
            const cardPrice = metadata.priceFull;

            products.push({
                id: metadata.id,
                name: metadata.name,
                category: metadata.category,
                price: pixPrice,
                originalPrice: metadata.originalPriceFull && metadata.originalPriceFull > cardPrice ? metadata.originalPriceFull : undefined,
                installmentPrice: cardPrice / 3,
                installments: 3,
                image: metadata.images?.[0] ? encodeURI(metadata.images[0]) : '/Logos/Logomarca%20Rose.png',
                badge: metadata.badge || (metadata.tags?.includes('oferta') ? 'Oferta' : undefined),
                isHot: metadata.isHot || false,
                gender
            });
        }
    });

    return products;
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const products = await getCategoryProducts(slug);

    const titles: Record<string, string> = {
        'bestsellers': 'Mais Amados / Bestsellers',
        'saida-de-maternidade': 'Coleção Especial Saída de Maternidade',
        'para-presentear': 'Seleção Perfeita Para Presentear',
        'linha-premium': 'Coleção Linha Premium',
        'essenciais': 'Peças Essenciais para o Dia a Dia',
        'cha-de-bebe': 'Mimos para Chá de Bebê',
        'custo-beneficio': 'Custo-Benefício Imbatível',
        'todos': 'Todos os Produtos',
    };

    // Capitalize generic slug if not found in titles
    const title = titles[slug] || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <TopBar />
            <Header />
            <Navigation />

            <main className="flex-grow">
                <CollectionProducts title={title} products={products} />
            </main>

            <Footer />
        </div>
    );
}
