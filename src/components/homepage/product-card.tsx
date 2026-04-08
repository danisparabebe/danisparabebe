'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

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
    isHot?: boolean;
}

export function ProductCard({ id, shortCode, name, category, price, originalPrice, installmentPrice, installments = 3, image, badge, isHot }: ProductCardProps) {
    const { addItem, openCart } = useCartStore();

    const handleAddToCart = () => {
        addItem({
            id: `${id}-${Date.now()}`,
            productId: id,
            name: name,
            price: price,
            image: image,
            quantity: 1,
        });
        toast.success(`${name} adicionado ao carrinho! ✨`);
        openCart();
    };

    const linkHref = `/produto/${shortCode || id}`;

    return (
        <div className="group relative flex flex-col h-full">
            <Link href={linkHref} className="block" target="_blank">
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
                            <div className="bg-white/80 backdrop-blur-sm text-charcoal border border-white/40 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold shadow-sm">
                                {badge}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 z-10 cursor-pointer group/heart">
                <Heart className="h-4 w-4 text-slate group-hover/heart:text-dusty-rose transition-colors duration-300" />
            </button>

            <div className="mt-3 flex flex-col flex-1 px-1">
                {category && <p className="text-[11px] text-slate uppercase tracking-wider font-medium">{category}</p>}
                <h3 className="text-sm font-semibold text-charcoal line-clamp-2 min-h-[2.5rem] mt-1 pr-8 leading-snug">{name}</h3>
                <div className="space-y-1 mt-auto pt-3">
                    {installmentPrice && (
                        <div className="text-sm text-charcoal">
                            {originalPrice && (
                                <span className="text-[10px] text-slate line-through mr-1.5 block mb-0.5">De R$ {originalPrice.toFixed(2)}</span>
                            )}
                            <span className="font-bold">{installments}x R$ {installmentPrice.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="text-[11px] text-slate flex items-center gap-1 mt-0.5">
                        ou <span className="font-black text-charcoal bg-sage-green/40 px-1.5 py-0.5 rounded-md text-[12px]">R$ {price.toFixed(2)} no PIX</span>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                    className="mt-4 w-full relative overflow-hidden group/add bg-sage-green text-charcoal hover:bg-[#9CBD9F] py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer hover:shadow-md active:scale-[0.98] border border-charcoal/5"
                >
                    <span className="relative z-10">Adicionar</span>
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/add:animate-shine" />
                </button>
            </div>
        </div>
    );
}
