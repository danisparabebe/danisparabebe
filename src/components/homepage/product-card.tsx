'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock, Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { toast } from 'sonner';
import { ProductPersonalizationModal } from '@/components/product/personalization-modal';

interface ProductCardProps {
    id: string;
    shortCode?: string;
    name: string;
    category?: string;
    price: number;
    originalPrice?: number;
    installmentPrice?: number;
    installments?: number;
    image: string;
    badge?: string;
    features?: string[];
    isHot?: boolean;
    comingSoon?: boolean;
}

export function ProductCard({ id, shortCode, name, category, price, originalPrice, installmentPrice, installments = 3, image, badge, features = [], isHot, comingSoon }: ProductCardProps) {
    const { addItem, openCart } = useCartStore();
    const { toggle, isFavorite } = useFavoritesStore();
    const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => { setHasMounted(true); }, []);
    
    const fav = hasMounted && isFavorite(id);

    const handleConfirmPersonalization = (data: any) => {
        setIsPersonalizationOpen(false);
        addItem({
            id: `${id}-personalized-${Date.now()}`,
            productId: id,
            name: name,
            price: price,
            image: image,
            quantity: 1,
            personalization: data
        });
        toast.success(`${name} adicionado ao carrinho! ✨`);
        openCart();
    };

    const linkHref = `/produto/${shortCode || id}`;

    // --- COMING SOON VARIANT ---
    if (comingSoon) {
        return (
            <div className="group relative flex flex-col h-full">
                <div className="block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#FAF9F8] shadow-sm border border-black/5">
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover grayscale-[30%] opacity-70"
                        />
                        {/* Overlay suave */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent" />
                        
                        {/* Badge "Em Breve" */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                            <div className="bg-charcoal/80 backdrop-blur-sm text-white border border-white/20 px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-semibold shadow-md flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                Em Breve
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex flex-col flex-1 px-1 text-center">
                    <div className="min-h-[1rem]">
                        {category && <p className="text-[10px] sm:text-[11px] text-slate uppercase tracking-wider font-medium leading-tight">{category}</p>}
                    </div>
                    <h3 className="text-[13px] sm:text-sm font-semibold text-charcoal/60 line-clamp-2 min-h-[2.375rem] sm:min-h-[2.5rem] mt-1 leading-snug">{name}</h3>
                    <div className="space-y-1.5 mt-auto pt-3 w-full">
                        <div className="text-xs sm:text-sm text-charcoal/40 min-h-[2.375rem] flex items-center justify-center">
                            <span className="font-medium text-[12px]">Preço disponível em breve</span>
                        </div>
                    </div>
                    <button
                        disabled
                        className="mt-3 sm:mt-4 w-full h-10 bg-charcoal/10 text-charcoal/40 rounded-full text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase cursor-not-allowed border border-charcoal/5 flex items-center justify-center gap-1.5"
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Em Breve
                    </button>
                </div>
            </div>
        );
    }

    // --- NORMAL VARIANT (unchanged) ---
    return (
        <div className="group relative flex flex-col h-full">
            <Link href={linkHref} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#FAF9F8] shadow-sm border border-black/5">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {/* Top Left Container (Badges & Fire) */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">

                        {badge && (
                            <div className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold shadow-sm ${
                                badge.toLowerCase().includes('black baby')
                                    ? 'bg-charcoal text-amber-300 border border-amber-400/40'
                                    : 'bg-white/80 backdrop-blur-sm text-charcoal border border-white/40'
                            }`}>
                                {badge}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 z-20 cursor-pointer group/heart"
            >
                <Heart className={`h-4 w-4 transition-colors duration-300 ${fav ? 'fill-dusty-rose text-dusty-rose' : 'text-slate group-hover/heart:text-dusty-rose'}`} />
            </button>

            <div className="mt-3 flex flex-col flex-1 px-1 text-center">
                <Link href={linkHref} className="block group/title">
                    <div className="min-h-[1rem]">
                        {category && <p className="text-[10px] sm:text-[11px] text-slate uppercase tracking-wider font-medium leading-tight group-hover/title:text-sage-green-dark transition-colors">{category}</p>}
                    </div>
                    <h3 className="text-[13px] sm:text-sm font-semibold text-charcoal line-clamp-2 min-h-[2.375rem] sm:min-h-[2.5rem] mt-1 leading-snug group-hover/title:text-sage-green-dark transition-colors">{name}</h3>
                </Link>
                <div className="space-y-1.5 mt-auto pt-3 w-full">
                    {installmentPrice ? (
                        <div className="min-h-[1.75rem] flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0.5 text-charcoal leading-tight">
                            {Boolean(originalPrice) && (
                                <span className="text-[10px] sm:text-[11px] text-slate line-through whitespace-nowrap">
                                    De R$ {originalPrice!.toFixed(2)}
                                </span>
                            )}
                            <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
                                {Boolean(originalPrice) && (
                                    <span className="font-medium text-charcoal/80 mr-1">por</span>
                                )}
                                {installments}x R$ {installmentPrice.toFixed(2)}
                            </span>
                        </div>
                    ) : null}
                    <div className={`w-full flex items-center justify-center whitespace-nowrap pt-1 ${
                        badge?.toLowerCase().includes('black baby')
                            ? 'bg-charcoal rounded-lg py-1.5 px-3'
                            : ''
                    }`}>
                        <span className="text-sm sm:text-base font-black text-emerald-400">R$ {price.toFixed(2)}</span>
                        <span className={`text-[11px] sm:text-xs font-medium ml-1.5 ${
                            badge?.toLowerCase().includes('black baby')
                                ? 'text-white/60'
                                : 'text-charcoal/60'
                        }`}>no PIX</span>
                    </div>
                </div>
                <div className="mt-3 sm:mt-4 w-full flex items-center gap-1.5">
                    <Link
                        href={linkHref}
                        className="flex-1 h-10 relative overflow-hidden group/buy bg-sage-green text-charcoal hover:bg-[#9CBD9F] rounded-full text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase transition-all duration-300 cursor-pointer hover:shadow-md active:scale-[0.98] border border-charcoal/5 flex items-center justify-center text-center px-2"
                    >
                        <span className="relative z-10">Comprar</span>
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/buy:animate-shine" />
                    </Link>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsPersonalizationOpen(true);
                        }}
                        className="w-12 sm:w-14 shrink-0 h-10 relative overflow-hidden group/cart bg-charcoal/5 hover:bg-charcoal text-charcoal hover:text-white rounded-full transition-all duration-300 cursor-pointer hover:shadow-md active:scale-[0.98] border border-charcoal/10 flex items-center justify-center gap-0.5"
                        title="Adicionar ao carrinho"
                        aria-label="Adicionar ao carrinho"
                    >
                        <Plus className="w-3.5 h-3.5 relative z-10 shrink-0" />
                        <ShoppingCart className="w-4 h-4 relative z-10 shrink-0" />
                    </button>
                </div>
            </div>

            <ProductPersonalizationModal
                isOpen={isPersonalizationOpen}
                onClose={() => setIsPersonalizationOpen(false)}
                productName={name}
                productImage={image}
                productId={id}
                onConfirm={handleConfirmPersonalization}
                features={features}
            />
        </div>
    );
}
