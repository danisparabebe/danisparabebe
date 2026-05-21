'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { TYPES } from '@/data/admin-options';
import { BASE_PRICES, formatPrice, PERSONALIZATION_PRICE } from '@/lib/pricing';
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_REGIONS_LABEL } from '@/lib/shipping-rules';
import { Minus, Plus, ArrowLeft, Truck, Baby, Shirt, Gem, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

// Only items with defined pricing
const AVAILABLE_ITEMS = TYPES.filter((t) => BASE_PRICES[t.value] !== undefined);

// Grouped by category with Lucide icon components
const CATEGORIES: { label: string; icon: ReactNode; ids: string[] }[] = [
    { label: 'Essenciais', icon: <Baby className="w-5 h-5 text-charcoal/70" />, ids: ['FRP', 'FRM', 'FRG', 'TOB', 'MNT'] },
    { label: 'Roupas', icon: <Shirt className="w-5 h-5 text-charcoal/70" />, ids: ['BDC', 'BDL', 'MIJ', 'SHO'] },
    { label: 'Acessórios', icon: <Gem className="w-5 h-5 text-charcoal/70" />, ids: ['FAI', 'TOF', 'TOU'] },
];

export function StepItems() {
    const { itemQuantities, setItemQuantity, nextStep, previousStep, getTotalPrice, getDiscountPercentage, getItemCount, babyName } = useConfiguratorStore();

    const count = getItemCount();
    const discount = getDiscountPercentage();
    const finalTotal = getTotalPrice();

    const originalItemsTotal = Object.entries(itemQuantities).reduce((acc, [id, qty]) => acc + (BASE_PRICES[id] || 0) * qty, 0);
    const originalTotal = originalItemsTotal + (babyName.trim() ? PERSONALIZATION_PRICE : 0);
    const isFreeShipping = finalTotal >= FREE_SHIPPING_THRESHOLD;

    // Gamification Progress Calculation (Max 6 pieces for 8% OFF)
    const MAX_PIECES = 6;
    const progressPercentage = Math.min((count / MAX_PIECES) * 100, 100);

    const ProductCard = ({ id }: { id: string }) => {
        const qty = itemQuantities[id] || 0;
        const originalPrice = BASE_PRICES[id];
        const currentPrice = originalPrice * (1 - discount / 100);
        const active = qty > 0;
        const label = AVAILABLE_ITEMS.find(i => i.value === id)?.label || id;

        return (
            <motion.div
                layout
                className={`
                    relative overflow-hidden flex flex-col justify-between p-4 rounded-2xl transition-all duration-300
                    ${active
                        ? 'bg-sage-green/10 border-2 border-sage-green shadow-sm'
                        : 'bg-white border-2 border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]'
                    }
                `}
            >
                {/* Header: Title and Price */}
                <div className="mb-6">
                    <h3 className={`font-fraunces font-bold text-lg leading-tight mb-1 ${active ? 'text-charcoal' : 'text-charcoal/80'}`}>
                        {label}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`font-bold tabular-nums ${active ? 'text-sage-green text-lg' : 'text-slate'}`}>
                            {formatPrice(currentPrice)}
                        </span>
                        {discount > 0 && (
                            <span className="text-xs text-slate/50 line-through tabular-nums">
                                {formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stepper Footer */}
                <div className="flex items-center justify-between mt-auto">
                    {/* Total for this item (if active) */}
                    <div className="flex-1">
                        {active ? (
                            <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-widest">
                                Total: <span className="text-charcoal">{formatPrice(currentPrice * qty)}</span>
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold text-slate/40 uppercase tracking-widest">
                                Adicionar
                            </span>
                        )}
                    </div>

                    {/* Stepper Buttons (Bigger Touch Targets) */}
                    <div className="flex items-center gap-3 bg-warm-stone rounded-full p-1 border border-black/5">
                        <button
                            onClick={() => setItemQuantity(id, qty - 1)}
                            disabled={!active}
                            className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90
                                ${active
                                    ? 'bg-white text-charcoal shadow-sm hover:bg-slate/10'
                                    : 'opacity-50 text-slate cursor-not-allowed'
                                }`}
                        >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                        </button>

                        <span className={`w-4 text-center font-black tabular-nums select-none ${active ? 'text-charcoal' : 'text-slate/50'}`}>
                            {qty}
                        </span>

                        <button
                            onClick={() => setItemQuantity(id, qty + 1)}
                            className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-charcoal text-white hover:bg-sage-green transition-all shadow-sm active:scale-90"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8 pb-40 md:pb-32 max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="text-center space-y-2 mt-4">
                <h2 className="text-3xl md:text-4xl font-fraunces text-charcoal">
                    Monte seu enxoval
                </h2>
                <p className="text-slate text-sm font-dmSans px-4">
                    Adicione peças à sua maleta e desbloqueie descontos progressivos.
                </p>
            </div>

            {/* Discount Gamification Thermometer */}
            <div className="bg-white rounded-3xl p-5 md:p-6 mx-2 md:mx-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] border border-black/[0.03]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Gift className={`w-5 h-5 ${count >= MAX_PIECES ? 'text-sage-green' : 'text-charcoal/40'}`} />
                        <span className="font-bold text-sm text-charcoal uppercase tracking-wider">Progresso</span>
                    </div>
                    {discount > 0 ? (
                        <span className="bg-sage-green text-white px-2 py-1 rounded-md text-xs font-black shadow-sm">
                            {discount}% OFF Ativo
                        </span>
                    ) : (
                        <span className="bg-warm-stone text-slate px-2 py-1 rounded-md text-xs font-bold">
                            0% OFF
                        </span>
                    )}
                </div>

                {/* Progress Track */}
                <div className="relative h-4 bg-warm-stone rounded-full overflow-hidden border border-black/5 shadow-inner">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-sage-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Markers */}
                <div className="flex justify-between mt-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate/60">
                    <span className={count >= 2 ? 'text-sage-green' : ''}>2 un. (3%)</span>
                    <span className={count >= 4 ? 'text-sage-green' : ''}>4 un. (5%)</span>
                    <span className={count >= 6 ? 'text-sage-green' : ''}>6+ un. (8%)</span>
                </div>

                {/* Motivational Text */}
                {count > 0 && count < MAX_PIECES && (
                    <p className="text-center text-xs text-charcoal/70 mt-4 font-medium">
                        Faltam apenas <span className="font-bold text-charcoal">{count < 2 ? 2 - count : count < 4 ? 4 - count : 6 - count} peças</span> para o próximo nível de desconto!
                    </p>
                )}
                {count >= MAX_PIECES && (
                    <p className="text-center text-xs text-sage-green mt-4 font-black uppercase tracking-wider">
                        Desconto Máximo Alcançado! 🎉
                    </p>
                )}
            </div>

            {/* Continuous List of Products Grid */}
            <div className="space-y-10 px-2 md:px-0">
                {CATEGORIES.map((cat) => {
                    const catItems = cat.ids.filter(id => AVAILABLE_ITEMS.find(i => i.value === id));
                    if (!catItems.length) return null;

                    return (
                        <div key={cat.label} className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-black/5 pb-2">
                                {cat.icon}
                                <h3 className="font-fraunces text-xl text-charcoal">{cat.label}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {catItems.map(id => <ProductCard key={id} id={id} />)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Summary Bar (Redesigned) */}
            <AnimatePresence>
                {count > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-4 py-4 md:px-8 md:py-5"
                    >
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                            
                            {/* Left: Totals */}
                            <div className="flex items-center justify-between w-full md:w-auto gap-6">
                                <div>
                                    <p className="text-slate text-[10px] uppercase tracking-widest font-bold mb-0.5">
                                        Total ({count} {count === 1 ? 'peça' : 'peças'})
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-2xl md:text-3xl font-black text-charcoal tabular-nums leading-none">
                                            {formatPrice(finalTotal)}
                                        </p>
                                        {discount > 0 && (
                                            <p className="text-sm md:text-base text-slate line-through tabular-nums pb-0.5">
                                                {formatPrice(originalTotal)}
                                            </p>
                                        )}
                                    </div>
                                    {isFreeShipping && (
                                        <div className="flex items-center gap-1 mt-1.5 text-sage-green font-bold text-[10px] uppercase tracking-wider">
                                            <Truck className="w-3.5 h-3.5" />
                                            Frete Grátis ({FREE_SHIPPING_REGIONS_LABEL})
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={previousStep}
                                    className="cursor-pointer flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl bg-warm-stone text-charcoal hover:bg-slate/10 border border-black/5 transition-all active:scale-95"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="cursor-pointer flex-1 md:w-[220px] bg-charcoal hover:bg-black text-white h-14 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
                                >
                                    Revisar Pedido
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back (desktop, no items yet) */}
            {count === 0 && (
                <div className="hidden md:flex justify-start px-2 md:px-0">
                    <button
                        onClick={previousStep}
                        className="cursor-pointer flex items-center gap-2 text-xs font-bold text-slate hover:text-charcoal bg-white border border-slate/20 hover:border-charcoal/40 px-6 py-3.5 rounded-2xl transition-all uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                </div>
            )}
        </div>
    );
}
