'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ShieldCheck, CreditCard, ShoppingBag, Heart, ZoomIn, X, Lock, Tag, ChevronDown, ChevronUp, Wand2, Info, Clock, Palette, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { ProductPersonalizationModal } from '@/components/product/personalization-modal';
import { formatCategoryName, getCategoryDetails } from '@/lib/utils';

import { ProductColorVariation } from '@/types/admin';
import { getColorHex } from '@/lib/color-variations';

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
    comingSoon?: boolean;
    colorVariations?: ProductColorVariation[];
    initialVariationId?: string;
}

export function ProductClientView({ product }: { product: ProductData }) {
    const router = useRouter();
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
        product.initialVariationId || null
    );
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
    const [buyMode, setBuyMode] = useState<'cart' | 'checkout'>('cart');
    const [descExpanded, setDescExpanded] = useState(false);
    const [panPos, setPanPos] = useState({ x: 0, y: 0 });
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0, moved: false });
    const { addItem, openCart, clearCart } = useCartStore();
    const { toggle, isFavorite } = useFavoritesStore();
    const { setSelectedProduct } = useConfiguratorStore();

    // Variação atualmente ativa (ou nula se produto base original)
    const activeVariation = product.colorVariations?.find(v => v.id === selectedVariationId) || null;

    // Dados dinâmicos de acordo com a variação selecionada
    const currentName = activeVariation?.title || product.name;
    const currentDescription = activeVariation?.description || product.description;
    const currentPixPrice = activeVariation?.pixPrice || product.pixPrice;
    const currentPriceFull = activeVariation?.priceFull || product.priceFull;
    const currentOriginalPrice = product.originalPrice;
    const currentMainImage = activeVariation ? activeVariation.image : (product.images[selectedImageIdx] || product.images[0]);
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { setHasMounted(true); }, []);
    
    const fav = hasMounted && isFavorite(product?.id);

    // Injeta o produto no store para que o personalizador saiba carregar os bordados dele
    useEffect(() => {
        if (product) {
            setSelectedProduct(activeVariation ? { ...product, ...activeVariation, name: currentName, images: [currentMainImage] } : product);
        }
    }, [product, activeVariation, currentName, currentMainImage, setSelectedProduct]);

    const handleActionClick = (mode: 'cart' | 'checkout') => {
        setBuyMode(mode);
        setIsPersonalizationOpen(true);
    };

    const handleConfirmPersonalization = (data: any) => {
        setIsPersonalizationOpen(false);

        // No modo "checkout direto", limpa o carrinho para mostrar apenas este produto
        if (buyMode === 'checkout') {
            clearCart();
        }

        addItem({
            id: `${activeVariation ? activeVariation.id : product.id}-personalized-${Date.now()}`,
            productId: activeVariation ? activeVariation.id : product.id,
            name: currentName,
            price: currentPixPrice,
            image: currentMainImage,
            quantity: 1,
            personalization: {
                ...data,
                color: activeVariation ? activeVariation.colorName : data.color,
                ...(activeVariation ? { colorVariation: activeVariation.colorName } : {})
            }
        });

        if (buyMode === 'checkout') {
            router.push('/checkout');
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
                    {/* Thumbnails Verticais à Esquerda: Foto Original + Todas as Cores (Sem barra de rolagem) */}
                    <div className="flex gap-2.5 md:flex-col shrink-0 overflow-x-auto md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {/* 1. Miniatura da Foto Original */}
                        {product.images[0] && (
                            <button
                                onClick={() => {
                                    setSelectedVariationId(null);
                                    setSelectedImageIdx(0);
                                }}
                                className={`relative h-18 w-18 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all group ${
                                    !selectedVariationId && selectedImageIdx === 0
                                        ? 'border-charcoal shadow-md scale-102 ring-2 ring-charcoal/20'
                                        : 'border-line hover:border-slate/60 hover:scale-102 opacity-80 hover:opacity-100'
                                }`}
                                title="Cor Original"
                            >
                                <Image
                                    src={product.images[0]}
                                    alt="Original"
                                    fill
                                    className="object-cover"
                                />
                                <span className="absolute bottom-1 right-1 text-[8px] font-black bg-black/60 text-white px-1 rounded backdrop-blur-xs">
                                    Base
                                </span>
                            </button>
                        )}

                        {/* 2. Miniaturas das Variações de Cores */}
                        {product.colorVariations?.map((variation) => {
                            const isSelected = selectedVariationId === variation.id;
                            const colorHex = variation.colorHex || getColorHex(variation.colorName);

                            return (
                                <button
                                    key={variation.id}
                                    onClick={() => {
                                        setSelectedVariationId(variation.id);
                                        setSelectedImageIdx(0);
                                    }}
                                    className={`relative h-18 w-18 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all group ${
                                        isSelected
                                            ? 'border-charcoal shadow-md scale-102 ring-2 ring-charcoal/20'
                                            : 'border-line hover:border-slate/60 hover:scale-102 opacity-80 hover:opacity-100'
                                    }`}
                                    title={`${variation.colorName} - ${variation.title}`}
                                >
                                    <Image
                                        src={variation.image || product.images[0]}
                                        alt={variation.colorName}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Indicador de Cor */}
                                    <span
                                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-xs"
                                        style={{ backgroundColor: colorHex }}
                                        title={variation.colorName}
                                    />
                                </button>
                            );
                        })}

                        {/* 3. Fotos adicionais do produto base (se houver mais de 1 foto) */}
                        {!selectedVariationId && product.images.slice(1).map((img, idx) => (
                            <button
                                key={`extra-${idx}`}
                                onClick={() => setSelectedImageIdx(idx + 1)}
                                className={`relative h-18 w-18 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                                    selectedImageIdx === idx + 1
                                        ? 'border-charcoal shadow-md scale-102'
                                        : 'border-line hover:border-slate/60 opacity-80 hover:opacity-100'
                                }`}
                                title={`Foto ${idx + 2}`}
                            >
                                <Image src={img} alt={`Foto ${idx + 2}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div
                        className="relative w-full overflow-hidden rounded-2xl bg-[#FAF9F8] shadow-sm border border-line cursor-zoom-in group"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <Image
                            src={currentMainImage}
                            alt={currentName}
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
                            {currentName}
                        </h1>
                    </div>

                    {/* Indicador da Cor Selecionada (as miniaturas das cores estão empilhadas à esquerda) */}
                    {product.colorVariations && product.colorVariations.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate">
                                Cor selecionada:
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-warm-stone/50 text-charcoal border border-line">
                                <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: getColorHex(activeVariation?.colorName || product.name) }}
                                />
                                {activeVariation?.colorName || 'Original'}
                            </span>
                        </div>
                    )}

                    {/* Pricing */}
                    <div className="flex flex-col gap-0.5 mb-2">
                        {currentOriginalPrice && (
                            <div className="text-sm text-slate line-through decoration-charcoal/30">
                                R$ {currentOriginalPrice.toFixed(2).replace('.', ',')}
                            </div>
                        )}
                        
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-charcoal tracking-tight">
                                R$ {currentPixPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-sm font-bold text-sage-green-dark">no PIX</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-sage-green-dark" />
                            <span className="text-[11px] font-medium text-slate uppercase tracking-wider">
                                ou 3x de R$ {((currentPixPrice * 1.0754) / 3).toFixed(2).replace('.', ',')} no cartão via InfinitePay
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
                                    const desc = currentDescription || '';
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
                    {product.comingSoon ? (
                        <div className="flex flex-col gap-3">
                            <div className="p-4 bg-warm-stone/40 border border-warm-stone-dark/20 rounded-2xl flex items-center gap-3 text-charcoal">
                                <Clock className="w-5 h-5 text-dusty-rose shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Disponível em Breve! ✨</p>
                                    <p className="text-xs text-charcoal/70">Este item fará parte dos próximos lançamentos do nosso ateliê. Acompanhe nossas novidades no Instagram!</p>
                                </div>
                            </div>

                            <button
                                disabled
                                className="w-full py-3.5 px-6 rounded-xl bg-charcoal/10 text-charcoal/40 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-charcoal/5"
                            >
                                <Clock className="w-4 h-4" />
                                Item em Breve
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleActionClick('checkout')}
                                className="w-full relative overflow-hidden group/buy bg-gradient-to-r from-[#215E39] via-[#1B5231] to-[#164327] hover:from-[#287044] hover:via-[#21613a] hover:to-[#1a5130] text-white py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(33,94,57,0.35)] hover:shadow-[0_12px_32px_rgba(33,94,57,0.48)] transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center border border-emerald-400/25"
                            >
                                <div className="flex items-center gap-1.5 mb-1 relative z-10 text-emerald-200">
                                    <Lock className="w-3.5 h-3.5 text-amber-300 drop-shadow-xs" />
                                    <span className="font-extrabold text-[10px] tracking-widest uppercase">Compra 100% Segura</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10">
                                    <span className="font-black text-lg sm:text-xl tracking-tight text-white drop-shadow-sm group-hover/buy:scale-[1.02] transition-transform duration-300 inline-block">
                                        QUERO PERSONALIZAR!
                                    </span>
                                    <Sparkles className="w-4 h-4 text-amber-300 group-hover/buy:rotate-12 transition-transform duration-300" />
                                </div>
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/buy:animate-shine pointer-events-none" />
                            </button>

                            <button
                                onClick={() => handleActionClick('cart')}
                                className="w-full relative overflow-hidden group/add bg-white border-2 border-slate-300 hover:border-charcoal text-charcoal hover:bg-slate-50 font-bold py-3.5 px-6 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-xs"
                            >
                                <ShoppingBag className="w-4 h-4 text-slate-500 group-hover/add:text-charcoal relative z-10 transition-colors" />
                                <span className="relative z-10 font-bold">Adicionar ao Carrinho</span>
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/add:animate-shine" />
                            </button>
                        </div>
                    )}

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

                    {/* Color Variation Disclaimer */}
                    <div className="flex items-start gap-2 p-3 mt-2 bg-amber-50/70 rounded-xl border border-amber-200/70 text-amber-900">
                        <Palette className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                        <p className="text-[10px] leading-relaxed">
                            <strong className="text-amber-950 block mb-0.5 font-bold">Aviso sobre tonalidades e cores:</strong>
                            As cores reais dos tecidos e bordados podem sofrer pequenas variações de tom em relação às fotos, dependendo do lote de fabricação da matéria-prima e da calibração de cor e brilho da tela do seu dispositivo (celular/computador).
                        </p>
                    </div>
                </div>
            </div>

            <ProductPersonalizationModal
                isOpen={isPersonalizationOpen}
                onClose={() => setIsPersonalizationOpen(false)}
                productName={currentName}
                productImage={currentMainImage}
                features={product.features}
                productId={activeVariation ? activeVariation.id : product.id}
                colorVariation={activeVariation?.colorName}
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
                                src={currentMainImage}
                                alt={currentName}
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
