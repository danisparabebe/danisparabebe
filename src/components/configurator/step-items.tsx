'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { TYPES } from '@/data/admin-options';
import { BASE_PRICES, formatPrice, PERSONALIZATION_PRICE } from '@/lib/pricing';
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_REGIONS_LABEL } from '@/lib/shipping-rules';
import { Minus, Plus, ArrowLeft, ChevronDown, Truck, Baby, Shirt, Gem, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, type ReactNode } from 'react';

// Only items with defined pricing
const AVAILABLE_ITEMS = TYPES.filter((t) => BASE_PRICES[t.value] !== undefined);

// Grouped by category with Lucide icon components
const CATEGORIES: { label: string; icon: ReactNode; ids: string[] }[] = [
    { label: 'Essenciais', icon: <Baby className="w-4 h-4 text-[#D6A6A6]" />, ids: ['FRP', 'FRM', 'FRG', 'TOB', 'MNT'] },
    { label: 'Roupas', icon: <Shirt className="w-4 h-4 text-[#D6A6A6]" />, ids: ['BDC', 'BDL', 'MIJ', 'SHO'] },
    { label: 'Acessórios', icon: <Gem className="w-4 h-4 text-[#D6A6A6]" />, ids: ['FAI', 'TOF', 'TOU'] },
];

export function StepItems() {
    const { itemQuantities, setItemQuantity, nextStep, previousStep, getTotalPrice, getDiscountPercentage, getItemCount, babyName } = useConfiguratorStore();

    const count = getItemCount();
    const discount = getDiscountPercentage();
    const finalTotal = getTotalPrice();

    const originalItemsTotal = Object.entries(itemQuantities).reduce((acc, [id, qty]) => acc + (BASE_PRICES[id] || 0) * qty, 0);
    const originalTotal = originalItemsTotal + (babyName.trim() ? PERSONALIZATION_PRICE : 0);
    const isFreeShipping = finalTotal >= FREE_SHIPPING_THRESHOLD;

    // Accordion state: essenciais open by default
    const [openCategories, setOpenCategories] = useState<string[]>(['Essenciais']);

    const toggleCategory = (label: string) => {
        setOpenCategories(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    // Next tier text
    let nextTierText = '';
    if (count < 2) { nextTierText = 'Leve 2 peças → 5% OFF'; }
    else if (count < 4) { nextTierText = `Faltam ${4 - count} peças → 10% OFF`; }
    else if (count < 6) { nextTierText = `Faltam ${6 - count} peças → 15% OFF`; }
    else if (count < 10) { nextTierText = `Faltam ${10 - count} peças → 20% OFF`; }
    else { nextTierText = 'Desconto máximo de 20% atingido!'; }

    // Count items selected per category
    const getCategoryCount = (ids: string[]) =>
        ids.reduce((sum, id) => sum + (itemQuantities[id] || 0), 0);

    // Product Row Component
    const ProductRow = ({ id }: { id: string }) => {
        const qty = itemQuantities[id] || 0;
        const originalPrice = BASE_PRICES[id];
        const currentPrice = originalPrice * (1 - discount / 100);
        const active = qty > 0;
        const label = AVAILABLE_ITEMS.find(i => i.value === id)?.label || id;

        return (
            <motion.div
                layout
                className={`
                    flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active
                        ? 'bg-[#D6A6A6]/10 border border-[#D6A6A6]/30'
                        : 'bg-white border border-black/[0.06] hover:border-black/10'
                    }
                `}
            >
                {/* Left: Name */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight truncate ${active ? 'text-[#1f2937]' : 'text-[#6b6460]'}`}>
                        {label}
                    </p>
                    <p className="text-[11px] text-[#6b6460]/60 font-semibold mt-0.5 tabular-nums">
                        {discount > 0 && <span className="line-through opacity-50 mr-1">{formatPrice(originalPrice)}</span>}
                        {formatPrice(currentPrice)}
                        {active && <span className="text-[#D6A6A6] font-black ml-1.5">= {formatPrice(currentPrice * qty)}</span>}
                    </p>
                </div>

                {/* Right: Stepper */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setItemQuantity(id, qty - 1)}
                        disabled={!active}
                        className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg border transition-all active:scale-90
                            ${active
                                ? 'border-[#1f2937]/20 text-[#1f2937] hover:bg-[#1f2937] hover:text-white hover:border-[#1f2937]'
                                : 'border-black/8 text-black/15 cursor-not-allowed'
                            }`}
                    >
                        <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>

                    <span className={`w-7 text-center text-base font-black tabular-nums select-none ${active ? 'text-[#1f2937]' : 'text-black/20'}`}>
                        {qty}
                    </span>

                    <button
                        onClick={() => setItemQuantity(id, qty + 1)}
                        className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg bg-[#1f2937] text-white hover:bg-[#D6A6A6] active:scale-90 transition-all shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-4 pb-32 md:pb-16 max-w-xl mx-auto">

            {/* Minimal Header */}
            <div className="text-center space-y-1.5">
                <h2 className="text-2xl md:text-3xl font-heading font-black text-charcoal">
                    Monte seu enxoval
                </h2>
                <p className="text-slate text-xs md:text-sm">
                    Quanto mais peças, maior o seu desconto.
                </p>
            </div>

            {/* Discount Pill + Shipping Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                    discount > 0
                        ? 'bg-[#1a9e52]/10 text-[#158043] border border-[#1a9e52]/20'
                        : 'bg-black/[0.03] text-[#6b6460] border border-black/5'
                }`}>
                    <Tag className="w-3.5 h-3.5" />
                    <span>{nextTierText}</span>
                    {discount > 0 && (
                        <span className="bg-[#1a9e52] text-white px-1.5 py-0.5 rounded text-[10px] font-black ml-0.5">
                            -{discount}%
                        </span>
                    )}
                </div>

                <AnimatePresence>
                    {isFreeShipping && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-[#1a9e52]/10 text-[#158043] border border-[#1a9e52]/20"
                        >
                            <Truck className="w-3.5 h-3.5" />
                            Frete Grátis*
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {isFreeShipping && (
                <p className="text-[9px] text-center text-slate font-medium -mt-1">
                    *Válido para {FREE_SHIPPING_REGIONS_LABEL}
                </p>
            )}

            {/* Categories Accordion */}
            <div className="space-y-2">
                {CATEGORIES.map((cat) => {
                    const catItems = cat.ids.filter(id => AVAILABLE_ITEMS.find(i => i.value === id));
                    if (!catItems.length) return null;

                    const isOpen = openCategories.includes(cat.label);
                    const catCount = getCategoryCount(cat.ids);

                    return (
                        <div key={cat.label} className="rounded-2xl border border-black/[0.06] bg-[#faf9f7] overflow-hidden">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(cat.label)}
                                className="cursor-pointer w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-2.5">
                                    {cat.icon}
                                    <span className="text-sm font-black uppercase tracking-wider text-[#1f2937]">
                                        {cat.label}
                                    </span>
                                    {catCount > 0 && (
                                        <span className="bg-[#D6A6A6] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                            {catCount}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-[#6b6460] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Category Items */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-3 space-y-1.5">
                                            {catItems.map(id => <ProductRow key={id} id={id} />)}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Floating Summary Bar */}
            <AnimatePresence>
                {count > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed md:sticky bottom-0 left-0 right-0 md:bottom-auto z-40
                                   bg-[#1f2937] text-white px-5 py-3.5 md:rounded-2xl
                                   flex items-center justify-between
                                   shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-xl border border-[#1f2937]"
                    >
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold leading-none mb-1">
                                    {count} {count === 1 ? 'peça' : 'peças'}
                                </p>
                                <div className="flex items-end gap-1.5">
                                    <p className="text-xl font-black tabular-nums leading-none">
                                        {formatPrice(finalTotal)}
                                    </p>
                                    {discount > 0 && (
                                        <p className="text-xs text-white/40 line-through tabular-nums pb-0.5">
                                            {formatPrice(originalTotal)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {discount > 0 && (
                                <div className="bg-[#1a9e52] text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                    -{discount}%
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={previousStep}
                                className="cursor-pointer flex items-center justify-center w-11 h-11 shrink-0 rounded-xl border border-white/20 text-white hover:border-white hover:bg-white/10 transition-all active:scale-95"
                            >
                                <ArrowLeft className="w-4.5 h-4.5" />
                            </button>
                            <button
                                onClick={nextStep}
                                className="cursor-pointer bg-[#1a9e52] hover:bg-[#158043] text-white px-6 py-3 h-11 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(26,158,82,0.39)] hover:shadow-[0_6px_20px_rgba(26,158,82,0.5)] active:scale-[0.98]"
                            >
                                Revisar Pedido
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back (desktop, no items yet) */}
            {count === 0 && (
                <div className="hidden md:flex justify-start pt-2">
                    <button
                        onClick={previousStep}
                        className="cursor-pointer flex items-center gap-2 text-xs font-black text-[#1f2937] hover:text-white hover:bg-[#1f2937] border-2 border-[#1f2937] px-6 py-3.5 rounded-xl transition-all uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                </div>
            )}
        </div>
    );
}
