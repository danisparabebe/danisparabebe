
'use client';

import { realProducts } from '@/data/homepage-data';
import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { useState, use } from 'react';

interface PageProps {
    params: Promise<{
        id: string;
    }>
}

import { useCartStore } from '@/store/cart-store';
import { ProductPersonalizationModal } from '@/components/product/personalization-modal';

export default function ProductPage({ params }: PageProps) {
    const router = useRouter();
    const { id } = use(params);
    const product = realProducts.find(p => p.id === id);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
    const { addItem, openCart } = useCartStore();

    if (!product) {
        return <div className="p-10 text-center">Produto não encontrado</div>;
    }

    const images = product.image ? [product.image] : ['/api/placeholder/600/800'];
    // Mock additional images for thumbnail view
    const allImages = [...images, ...images, ...images].slice(0, 4);

    return (
        <div className="min-h-screen bg-dots-texture">
            <TopBar />
            <Header />
            <Navigation />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center text-sm font-medium text-slate hover:text-dusty-rose transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Voltar
                </button>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
                    {/* Left Column: Images */}
                    <div className="flex flex-col-reverse gap-4 md:flex-row">
                        {/* Thumbnails */}
                        <div className="flex gap-4 md:flex-col overflow-x-auto md:w-24">
                            {allImages.map((img, idx) => (
                                <button key={idx} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-line hover:border-dusty-rose">
                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${idx}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="relative aspect-[3/4] w-full flex-1 overflow-hidden rounded-lg bg-white shadow-sm border border-line">
                            <Image
                                src={images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Column: Info */}
                    <div className="flex flex-col">
                        <span className="text-sm text-dusty-rose font-medium mb-2">{product.category}</span>
                        <h1 className="text-2xl font-bold text-charcoal sm:text-3xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                            {product.name}
                        </h1>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-charcoal">R$ {product.price.toFixed(2)}</span>
                                {product.originalPrice && (
                                    <span className="text-lg text-slate line-through">R$ {product.originalPrice.toFixed(2)}</span>
                                )}
                            </div>
                            <p className="text-sm text-slate mt-1">
                                ou {product.installments}x de R$ {(product.price / product.installments!).toFixed(2)} sem juros
                            </p>
                        </div>

                        {/* Description */}
                        <div className="mb-8 border-t border-line pt-6">
                            <h3 className="text-sm font-medium text-charcoal mb-2">Descrição</h3>
                            <p className="text-sm text-slate leading-relaxed mb-4">
                                {product.description}
                            </p>
                            {product.includes && (
                                <ul className="list-disc list-inside text-sm text-slate space-y-1">
                                    {product.includes.map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Colors / Customization Mock */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-charcoal mb-3">Opções de Cor do Bordado</h3>
                            <div className="flex gap-3">
                                {['Rosa', 'Azul', 'Bege', 'Verde', 'Cinza'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-4 py-2 rounded-full text-sm border ${selectedColor === color
                                            ? 'border-dusty-rose bg-dusty-rose/10 text-dusty-rose font-medium'
                                            : 'border-line text-slate hover:border-dusty-rose'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-auto">
                            <button
                                onClick={() => setIsPersonalizationOpen(true)}
                                className="w-full bg-dusty-rose hover:bg-deep-rose text-white py-4 rounded-full font-bold text-lg shadow-soft transition-colors flex items-center justify-center gap-2"
                            >
                                COMPRAR AGORA
                            </button>
                            <button
                                onClick={() => {
                                    if (!product) return;
                                    addItem({
                                        id: `${product.id}-default`,
                                        productId: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.image,
                                        quantity: 1
                                    });
                                    openCart();
                                }}
                                className="w-full bg-white border border-dusty-rose text-dusty-rose hover:bg-dusty-rose/5 py-4 rounded-full font-bold text-lg transition-colors"
                            >
                                Adicionar ao Carrinho
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-line">
                            <div className="flex flex-col items-center text-center">
                                <Truck className="h-6 w-6 text-dusty-rose mb-2" />
                                <span className="text-xs text-charcoal font-medium">Entrega em 10 dias</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ShieldCheck className="h-6 w-6 text-dusty-rose mb-2" />
                                <span className="text-xs text-charcoal font-medium">Garantia Danis</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <CreditCard className="h-6 w-6 text-dusty-rose mb-2" />
                                <span className="text-xs text-charcoal font-medium">3x sem juros</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ProductPersonalizationModal
                isOpen={isPersonalizationOpen}
                onClose={() => setIsPersonalizationOpen(false)}
                productName={product.name}
                productImage={images[0]}
                onConfirm={(data) => {
                    if (!product) return;
                    addItem({
                        id: `${product.id}-personalized-${Date.now()}`,
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                        personalization: data
                    });
                    setIsPersonalizationOpen(false);
                    openCart();
                }}
            />

            <Footer simple />
        </div>
    );
}
