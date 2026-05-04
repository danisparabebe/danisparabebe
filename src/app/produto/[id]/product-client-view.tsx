'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ShieldCheck, CreditCard, ShoppingBag, Heart, ZoomIn, X, Lock, Tag, ChevronDown, ChevronUp, Wand2, Info } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { ProductPersonalizationModal } from '@/components/product/personalization-modal';
import { formatCategoryName, getCategoryDetails } from '@/lib/utils';

interface ProductData {
    id: string;
    name: string;
    category: string;
    priceFull: number;
    originalPrice?: number;
    pixPrice: number;
    installments: number;
    images: string[];
    description: string;
    discountPct: number;
    features?: string[];
    metadata: any;
}

export function ProductClientView({ product }: { product: ProductData }) {
    const router = useRouter();
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
    const [buyMode, setBuyMode] = useState<'cart' | 'checkout'>('cart');
    const [descExpanded, setDescExpanded] = useState(false);
    const [panPos, setPanPos] = useState({ x: 0, y: 0 });
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0, moved: false });
    const { addItem, openCart } = useCartStore();
    const { toggle, isFavorite } = useFavoritesStore();
    const { setSelectedProduct } = useConfiguratorStore();
    
    const fav = isFavorite(product?.id);

    // Injeta o produto no store para que o personalizador saiba carregar os bordados dele
    useEffect(() => {
        if (product) setSelectedProduct(product);
    }, [product, setSelectedProduct]);

    const handleActionClick = (mode: 'cart' | 'checkout') => {
        setBuyMode(mode);
        setIsPersonalizationOpen(true);
    };

    const handleConfirmPersonalization = (data: any) => {
        setIsPersonalizationOpen(false);
        addItem({
            id: `${product.id}-personalized-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.pixPrice,
            image: product.images[0],
            quantity: 1,
            personalization: data
        });

        if (buyMode === 'checkout') {
            router.push('/checkout/rapido');
        } else {
            openCart();
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Breadcrumb / Back Navigation */}
            <button
                onClick={() => router.push('/')}
                className="mb-4 flex items-center text-sm font-medium text-slate hover:text-sage-green-dark transition-colors"
            >
                <ChevronLeft className="mr-1 h-5 w-5" />
                Voltar para a loja
            </button>

            {/* Main 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Image Gallery — sticky on desktop */}
                <div className="flex flex-col-reverse gap-3 md:flex-row items-start lg:sticky lg:top-6 lg:self-start">
                    {/* Thumbnails */}
                    <div className="flex gap-3 md:flex-col overflow-x-auto md:w-20 pb-2 md:pb-0 scrollbar-hide flex-shrink-0 custom-scrollbar">
                        {product.images.filter(img => img && img.trim() !== '').map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImageIdx(idx)}
                                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${selectedImageIdx === idx ? 'border-sage-green-dark shadow-md' : 'border-transparent hover:border-line'}`}
                            >
                                <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div
                        className="relative w-full overflow-hidden rounded-2xl bg-[#FAF9F8] shadow-sm border border-line cursor-zoom-in group"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <Image
                            src={product.images[selectedImageIdx]}
                            alt={product.name}
                            width={800}
                            height={800}
                            className="w-full h-auto p-1 transition-transform duration-500 group-hover:scale-[1.02]"
                            priority
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-charcoal px-4 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                            <ZoomIn className="w-3.5 h-3.5 text-sage-green-dark" />
                            Ampliar
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggle(product.id); }} className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm z-20 cursor-pointer hover:scale-110 active:scale-95 transition-all outline-none">
                            <Heart className={`w-4 h-4 transition-colors duration-300 ${fav ? 'fill-dusty-rose text-dusty-rose' : 'text-slate hover:text-dusty-rose'}`} />
                        </button>
                    </div>
                </div>

                {/* Right Column: Product Info — grows freely, page scrolls naturally */}
                <div className="flex flex-col space-y-4 pb-8">
                    <div>
                        <span className="inline-block text-xs font-bold tracking-wider uppercase text-sage-green-dark mb-1">{product.category}</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-charcoal leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            {product.name}
                        </h1>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-col gap-0.5 mb-2">
                        {product.originalPrice && (
                            <div className="text-sm text-slate line-through decoration-charcoal/30">
                                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                            </div>
                        )}
                        
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-charcoal tracking-tight">
                                R$ {product.pixPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-sm font-bold text-sage-green-dark">no PIX</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-sage-green-dark" />
                            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">
                                ou 3x de R$ {((product.pixPrice * 1.0754) / 3).toFixed(2).replace('.', ',')} no cartão via InfinitePay
                            </span>
                        </div>
                    </div>

                    {/* Collapsible Description — Rich Renderer */}
                    <div className="border border-line rounded-xl overflow-hidden">
                        <button
                            onClick={() => setDescExpanded(!descExpanded)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold tracking-widest uppercase text-charcoal bg-warm-stone/20 hover:bg-warm-stone/40 transition-colors cursor-pointer"
                        >
                            Detalhes do Produto
                            {descExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {descExpanded && (
                            <div className="px-4 py-4 space-y-3">
                                {(() => {
                                    const desc = product.description || '';
                                    const hasRichSections = desc.includes('§');

                                    if (!hasRichSections) {
                                        // Legacy fallback — render plain text with line breaks
                                        return (
                                            <div className="space-y-2">
                                                {desc.split('\n').filter(Boolean).map((line: string, i: number) => (
                                                    <p key={i} className="text-[13px] text-slate leading-relaxed">{line}</p>
                                                ))}
                                            </div>
                                        );
                                    }

                                    // Rich section renderer
                                    const sections = desc.split(/§([A-Z]+)§/).filter(Boolean);
                                    const rendered: React.ReactNode[] = [];

                                    for (let i = 0; i < sections.length; i += 2) {
                                        const sectionType = sections[i];
                                        const content = (sections[i + 1] || '').trim();
                                        if (!content) continue;

                                        if (sectionType === 'INTRO') {
                                            rendered.push(
                                                <p key="intro" className="text-[13px] text-charcoal/80 leading-relaxed italic">
                                                    {content}
                                                </p>
                                            );
                                        } else if (sectionType === 'PERSONAL') {
                                            rendered.push(
                                                <div key="personal" className="flex items-start gap-2 bg-sage-green/10 p-3 rounded-lg border border-sage-green/20">
                                                    <Wand2 className="w-3.5 h-3.5 text-sage-green-dark mt-0.5 flex-shrink-0" />
                                                    <p className="text-[12px] text-charcoal/70 leading-relaxed">{content}</p>
                                                </div>
                                            );
                                        } else if (sectionType === 'ITEMS') {
                                            const lines = content.split('\n').filter(Boolean);
                                            const header = lines[0] || '';
                                            const items = lines.slice(1).filter(l => l.startsWith('•'));
                                            rendered.push(
                                                <div key="items" className="bg-warm-stone/30 p-3 rounded-xl border border-line">
                                                    <p className="font-bold text-charcoal text-[12px] uppercase tracking-wider mb-2">{header}</p>
                                                    <ul className="space-y-1">
                                                        {items.map((item, idx) => (
                                                            <li key={idx} className="flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-sage-green-dark flex-shrink-0" />
                                                                <span className="text-[12px] font-semibold text-charcoal">
                                                                    {item.replace('• ', '')}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        } else if (sectionType === 'SIZES') {
                                            const lines = content.split('\n').filter(Boolean);
                                            rendered.push(
                                                <div key="sizes" className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                                    <p className="font-bold text-charcoal text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                        <Info className="w-3 h-3 text-blue-400" /> Medidas e Tecidos
                                                    </p>
                                                    <div className="space-y-1">
                                                        {lines.map((line, idx) => (
                                                            <p key={idx} className="text-[11px] text-charcoal/70 leading-relaxed">{line.replace('📐 ', '')}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        } else if (sectionType === 'FINISH') {
                                            rendered.push(
                                                <p key="finish" className="text-[12px] text-charcoal/60 leading-relaxed">{content}</p>
                                            );
                                        } else if (sectionType === 'QUALITY') {
                                            rendered.push(
                                                <p key="quality" className="text-[12px] text-charcoal/60 leading-relaxed">{content}</p>
                                            );
                                        } else if (sectionType === 'TIMEFRAME') {
                                            rendered.push(
                                                <div key="timeframe" className="bg-amber-50/60 p-3 rounded-lg border border-amber-100/50">
                                                    <p className="text-[12px] text-amber-800/70 leading-relaxed font-medium">{content}</p>
                                                </div>
                                            );
                                        }
                                    }
                                    return <>{rendered}</>;
                                })()}
                            </div>
                        )}
                    </div>


                    {/* Buy Actions — directly below description */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleActionClick('checkout')}
                            className="w-full relative overflow-hidden group/buy bg-sage-green hover:bg-[#9cbd9f] text-charcoal py-3.5 px-6 rounded-xl shadow-[0_6px_20px_rgba(173,206,179,0.4)] hover:shadow-[0_6px_25px_rgba(173,206,179,0.5)] transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center border border-charcoal/5"
                        >
                            <div className="flex items-center gap-2 mb-0.5 relative z-10">
                                <Lock className="w-3 h-3 text-charcoal/80" />
                                <span className="font-extrabold text-[9px] tracking-widest text-charcoal/80 uppercase">Compra 100% Segura</span>
                            </div>
                            <span className="font-extrabold text-lg tracking-tight relative z-10 text-charcoal group-hover/buy:scale-105 transition-transform duration-300 inline-block">QUERO PERSONALIZAR!</span>
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-30 group-hover/buy:animate-shine" />
                        </button>

                        <button
                            onClick={() => handleActionClick('cart')}
                            className="w-full relative overflow-hidden group/add bg-white border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-bold py-3 px-6 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-sm"
                        >
                            <ShoppingBag className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Adicionar ao Carrinho</span>
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/add:animate-shine" />
                        </button>
                    </div>

                    {/* Trust Badges — below buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {[
                            { icon: Wand2, title: 'Feito à Mão', sub: 'Até 12 dias úteis' },
                            { icon: ShieldCheck, title: 'Garantia Danis', sub: 'Qualidade total' },
                            { icon: CreditCard, title: 'Pag. Seguro', sub: 'Via InfinitePay' },
                        ].map(({ icon: Icon, title, sub }) => (
                            <div key={title} className="flex flex-col items-center text-center p-2 rounded-xl bg-warm-stone/10 border border-line">
                                <Icon className="h-4 w-4 text-sage-green-dark mb-1" />
                                <span className="text-[10px] text-charcoal font-bold leading-tight">{title}</span>
                                <span className="text-[9px] text-slate mt-0.5">{sub}</span>
                            </div>
                        ))}
                    </div>

                    {/* Production Time Notice */}
                    <div className="flex items-start gap-2 p-3 mt-3 bg-warm-stone/20 rounded-xl border border-line">
                        <Info className="w-4 h-4 text-sage-green-dark mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate leading-relaxed">
                            <strong className="text-charcoal block mb-0.5">Prazo de Produção: Máximo 12 dias úteis</strong>
                            Cada peça é feita sob medida com carinho. Se o seu pedido ficar pronto antes, enviaremos imediatamente!
                        </p>
                    </div>
                </div>
            </div>

            <ProductPersonalizationModal
                isOpen={isPersonalizationOpen}
                onClose={() => setIsPersonalizationOpen(false)}
                productName={product.name}
                productImage={product.images[0]}
                features={product.features}
                onConfirm={handleConfirmPersonalization}
            />

            {/* Lightbox / Zoom Overlay */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
                    <button
                        onClick={() => { setIsLightboxOpen(false); setZoomLevel(1); setPanPos({ x: 0, y: 0 }); }}
                        className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
                        style={{ cursor: zoomLevel > 1 ? (dragRef.current.isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
                        onMouseDown={(e) => {
                            if (zoomLevel <= 1) return;
                            e.preventDefault();
                            dragRef.current = { isDragging: true, startX: e.clientX - panPos.x, startY: e.clientY - panPos.y, lastX: panPos.x, lastY: panPos.y, moved: false };
                        }}
                        onMouseMove={(e) => {
                            if (!dragRef.current.isDragging) return;
                            const dx = e.clientX - dragRef.current.startX;
                            const dy = e.clientY - dragRef.current.startY;
                            if (Math.abs(dx - dragRef.current.lastX) > 3 || Math.abs(dy - dragRef.current.lastY) > 3) {
                                dragRef.current.moved = true;
                            }
                            setPanPos({ x: dx, y: dy });
                        }}
                        onMouseUp={() => {
                            if (!dragRef.current.moved && dragRef.current.isDragging) {
                                // It was a click, not a drag — cycle zoom
                                const nextZoom = zoomLevel >= 2.8 ? 1 : zoomLevel === 1 ? 1.8 : 2.8;
                                setZoomLevel(nextZoom);
                                if (nextZoom === 1) setPanPos({ x: 0, y: 0 });
                            }
                            dragRef.current.isDragging = false;
                            dragRef.current.moved = false;
                        }}
                        onMouseLeave={() => {
                            dragRef.current.isDragging = false;
                            dragRef.current.moved = false;
                        }}
                        onClick={(e) => {
                            if (zoomLevel <= 1) {
                                setZoomLevel(1.8);
                            }
                        }}
                        onTouchStart={(e) => {
                            if (zoomLevel <= 1) return;
                            const touch = e.touches[0];
                            dragRef.current = { isDragging: true, startX: touch.clientX - panPos.x, startY: touch.clientY - panPos.y, lastX: panPos.x, lastY: panPos.y, moved: false };
                        }}
                        onTouchMove={(e) => {
                            if (!dragRef.current.isDragging) return;
                            const touch = e.touches[0];
                            const dx = touch.clientX - dragRef.current.startX;
                            const dy = touch.clientY - dragRef.current.startY;
                            dragRef.current.moved = true;
                            setPanPos({ x: dx, y: dy });
                        }}
                        onTouchEnd={() => {
                            if (!dragRef.current.moved && dragRef.current.isDragging) {
                                const nextZoom = zoomLevel >= 2.8 ? 1 : zoomLevel === 1 ? 1.8 : 2.8;
                                setZoomLevel(nextZoom);
                                if (nextZoom === 1) setPanPos({ x: 0, y: 0 });
                            }
                            dragRef.current.isDragging = false;
                            dragRef.current.moved = false;
                        }}
                    >
                        <div
                            className="relative w-full h-full max-w-5xl max-h-[85vh] transition-transform duration-300 ease-out transform-gpu"
                            style={{
                                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomLevel})`,
                                transition: dragRef.current.isDragging ? 'none' : 'transform 0.3s ease-out',
                            }}
                        >
                            <Image
                                src={product.images[selectedImageIdx]}
                                alt={product.name}
                                fill
                                className="object-contain pointer-events-none"
                                quality={100}
                                />
                        </div>

                        {/* Zoom Level Indicator Badges */}
                        {zoomLevel === 1 && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-sm flex items-center gap-2 bg-black/50 px-5 py-3 rounded-full backdrop-blur-md pointer-events-none">
                                <ZoomIn className="w-5 h-5 text-white" />
                                Clique para dar zoom
                            </div>
                        )}
                        {zoomLevel > 1 && zoomLevel < 2.8 && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-sm flex items-center gap-2 bg-black/50 px-5 py-3 rounded-full backdrop-blur-md pointer-events-none opacity-60">
                                <ZoomIn className="w-5 h-5 text-white" />
                                Arraste para mover · Clique para + zoom
                            </div>
                        )}
                        {zoomLevel >= 2.8 && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-sm flex items-center gap-2 bg-black/50 px-5 py-3 rounded-full backdrop-blur-md pointer-events-none opacity-40">
                                Arraste para mover · Clique para sair do zoom
                            </div>
                        )}
                    </div>

                    {/* Thumbnails in Lightbox */}
                    {product.images.length > 1 && zoomLevel === 1 && (
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 max-w-[95vw] overflow-x-auto pb-4 scrollbar-hide px-4 z-50">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setSelectedImageIdx(idx); }}
                                    className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${selectedImageIdx === idx ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/20 hover:border-white/50 opacity-50 hover:opacity-100'}`}
                                >
                                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
