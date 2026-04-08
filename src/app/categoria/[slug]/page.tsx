import { productControl } from '@/data/product-control';
import { CollectionProducts } from '@/components/collection/collection-products';
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

// Map slugs to display titles
const typeTitles: Record<string, string> = {
    'kits': 'Kits Prontos',
    'manta': 'Mantas Bordadas',
    'fralda-boca': 'Fraldas de Boca',
    'fralda-ombro': 'Fraldas de Ombro',
    'toalha': 'Toalhas e Toalhas Fralda',
    'body': 'Bodys Personalizados',
    'touca': 'Toucas',
    'faixa': 'Faixas de Cabelo'
};

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const displayTitle = typeTitles[slug] || slug;

    // Filter logic based on the slug representing a type of product
    const mvpProducts = productControl.filter(p => {
        const cat = p.category?.toLowerCase() || '';
        const name = p.name.toLowerCase();

        if (slug === 'kits' && cat.includes('kit')) return true;
        if (slug === 'manta' && name.includes('manta')) return true;
        if (slug === 'fralda-boca' && (name.includes('fralda pequena') || name.includes('boca') || name.includes('kit fraldas'))) return true;
        if (slug === 'fralda-ombro' && (name.includes('fralda média') || name.includes('ombro'))) return true;
        if (slug === 'toalha' && (name.includes('toalha') || name.includes('banho'))) return true;
        if (slug === 'body' && (name.includes('body') || name.includes('roupa'))) return true;
        if (slug === 'touca' && name.includes('touca')) return true;
        if (slug === 'faixa' && (name.includes('faixa') || name.includes('cabelo') || name.includes('laço'))) return true;

        return false;
    });

    if (mvpProducts.length === 0) {
        // We still render the page but pass empty products so the user sees a friendly message
    }

    const products = mvpProducts.map(p => {
        const finalPrice = p.priceFull * (1 - (p.discountPct || 0) / 100);

        let gender: 'Menina' | 'Menino' | 'Unissex' = 'Unissex';
        if (p.id.startsWith('FEM-') || p.tags?.includes('feminino') || p.tags?.includes('menina')) gender = 'Menina';
        if (p.id.startsWith('MAS-') || p.tags?.includes('masculino') || p.tags?.includes('menino')) gender = 'Menino';

        return {
            id: p.id,
            name: p.name,
            category: p.category,
            price: finalPrice,
            installmentPrice: finalPrice / 3,
            installments: 3,
            image: p.images?.[0] ? encodeURI(p.images[0]) : '/Logos/Logomarca%20Rose.png',
            badge: p.tags?.includes('oferta') ? 'Oferta' : undefined,
            gender
        };
    });

    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <TopBar />
            <Header />
            <Navigation />

            <main className="flex-grow py-8">
                <CollectionProducts title={displayTitle} products={products} />
                {products.length === 0 && (
                     <div className="text-center py-20 text-slate-500 font-medium">
                         Nenhum produto encontrado nesta categoria no momento.
                     </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
