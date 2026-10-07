'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { TYPES } from '@/data/admin-options';
import { BASE_PRICES, formatPrice, PERSONALIZATION_PRICE } from '@/lib/pricing';
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_REGIONS_LABEL } from '@/lib/shipping-rules';
import { Minus, Plus, ArrowLeft, Truck, Baby, Shirt, Gem, Gift, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

import { toast } from 'sonner';

// Only items with defined pricing (Toalha Fralda TOF removida do Monte Seu Kit conforme solicitado)
const AVAILABLE_ITEMS = TYPES.filter((t) => BASE_PRICES[t.value] !== undefined && t.value !== 'TOF');

// Grouped by category with Lucide icon components
const CATEGORIES: { label: string; icon: ReactNode; ids: string[] }[] = [
    { label: 'Essenciais', icon: <Baby className="w-5 h-5 text-charcoal/70" />, ids: ['FRP', 'FRM', 'FRG', 'TOB', 'MNT'] },
    { label: 'Roupas', icon: <Shirt className="w-5 h-5 text-charcoal/70" />, ids: ['BDC', 'BDL'] },
    { label: 'Acessórios', icon: <Gem className="w-5 h-5 text-charcoal/70" />, ids: ['FAI', 'TOU'] },
];

const CLOTHING_IDS = ['BDC', 'BDL'];

export function StepItems() {
    const { 
        itemQuantities, 
        itemSizes, 
        setItemQuantity, 
        setItemSize, 
        nextStep, 
        previousStep, 
        getTotalPrice, 
        getDiscountPercentage, 
        getItemCount, 
        babyName 
    } = useConfiguratorStore();

    const count = getItemCount();
    const discount = getDiscountPercentage();
    const finalTotal = getTotalPrice();

    const originalItemsTotal = Object.entries(itemQuantities).reduce((acc, [id, qty]) => acc + (BASE_PRICES[id] || 0) * qty, 0);
    const originalTotal = originalItemsTotal + (babyName.trim() ? PERSONALIZATION_PRICE : 0);
    const discountAmount = Math.max(0, originalItemsTotal - finalTotal);
    const isFreeShipping = finalTotal >= FREE_SHIPPING_THRESHOLD;

    // Gamification Progress Calculation (Max 6 pieces for 8% OFF)
    const MAX_PIECES = 6;
    const progressPercentage = Math.min((count / MAX_PIECES) * 100, 100);

    // Mensagens dinâmicas e divertidas para engajar o cliente a adicionar mais peças
    let nextLevelMsg = '';
    let nextPiecesNeeded = 0;

    if (count === 0) {
        nextPiecesNeeded = 2;
        nextLevelMsg = 'Adicione 2 peças para desbloquear 3% OFF no seu kit!';
    } else if (count < 2) {
        nextPiecesNeeded = 2 - count;
        nextLevelMsg = `Adicione mais ${nextPiecesNeeded} peça para liberar seu primeiro desconto de 3% OFF! 🎁`;
    } else if (count < 4) {
        nextPiecesNeeded = 4 - count;
        nextLevelMsg = `Falta só mais ${nextPiecesNeeded} ${nextPiecesNeeded === 1 ? 'peça' : 'peças'} para subir seu desconto para 5% OFF! 🚀`;
    } else if (count < 6) {
        nextPiecesNeeded = 6 - count;
        nextLevelMsg = `Falta só mais ${nextPiecesNeeded} ${nextPiecesNeeded === 1 ? 'peça' : 'peças'} para atingir o DESCONTO MÁXIMO de 8% OFF! 🔥`;
    } else {
        nextLevelMsg = '🏆 Incrível! Você desbloqueou o DESCONTO MÁXIMO de 8% OFF no seu kit personalizado!';
    }

    const handleNext = () => {
        // Validate that all active clothing items have a size chosen or typed
        const missingClothing = Object.entries(itemQuantities).find(([id, qty]) => {
            return qty > 0 && CLOTHING_IDS.includes(id) && (!itemSizes[id] || !itemSizes[id].trim());
        });

        if (missingClothing) {
            const label = AVAILABLE_ITEMS.find(i => i.value === missingClothing[0])?.label || missingClothing[0];
            toast.error(`Por favor, selecione ou digite o tamanho para: ${label}`, {
                duration: 4000,
            });
            return;
        }

        nextStep();
    };

    const ProductCard = ({ id }: { id: string }) => {
        const qty = itemQuantities[id] || 0;
        const originalPrice = BASE_PRICES[id];
        const active = qty > 0;
        const label = AVAILABLE_ITEMS.find(i => i.value === id)?.label || id;
        const isClothing = CLOTHING_IDS.includes(id);
        const currentSize = itemSizes[id] || '';

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
                {/* Header: Title and Price (Preço original SEMPRE fixo e transparente) */}
                <div className="mb-4">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-fraunces font-bold text-lg leading-tight mb-1 ${active ? 'text-charcoal' : 'text-charcoal/80'}`}>
                            {label}
                        </h3>
                        {active && (
                            <span className="shrink-0 bg-[#ADCEB3] text-[#1f2937] text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                                {qty} no kit
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-bold tabular-nums text-charcoal text-lg">
                            {formatPrice(originalPrice)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/ peça</span>
                    </div>
                </div>

                {/* Seletor de Tamanho Obrigatório para Roupas / Body */}
                {active && isClothing && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 pt-3 pb-2 border-t border-black/5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
                                Tamanho da Peça <span className="text-dusty-rose font-black">*</span>
                            </span>
                            {!currentSize && (
                                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    Obrigatório
                                </span>
                            )}
                        </div>

                        {/* Botões Rápidos de Tamanho */}
                        <div className="flex gap-1.5 mb-2">
                            {[
                                { val: 'RN', sub: 'Recém-nascido' },
                                { val: 'P', sub: '0-3m' },
                                { val: 'M', sub: '3-6m' },
                                { val: 'G', sub: '6-9m' },
                            ].map(opt => (
                                <button
                                    type="button"
                                    key={opt.val}
                                    onClick={() => setItemSize(id, opt.val)}
                                    className={`flex-1 py-1.5 rounded-xl border-2 text-center transition-all cursor-pointer font-bold ${
                                        currentSize === opt.val
                                            ? 'border-sage-green-dark bg-white text-charcoal shadow-xs scale-102 ring-2 ring-sage-green/20'
                                            : 'border-black/5 bg-white/70 text-slate hover:bg-white hover:border-black/15'
                                    }`}
                                >
                                    <span className="text-xs block leading-none">{opt.val}</span>
                                    <span className="text-[8px] font-normal block opacity-60 mt-0.5 leading-none">{opt.sub}</span>
                                </button>
                            ))}
                        </div>

                        {/* Campo de Texto para Digitar Tamanho */}
                        <input
                            type="text"
                            placeholder="Ou digite o tamanho desejado (ex: RN, P, M, G...)"
                            value={currentSize}
                            onChange={(e) => setItemSize(id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-line text-xs font-semibold text-charcoal placeholder:text-slate/40 focus:ring-2 focus:ring-sage-green focus:border-sage-green outline-none bg-white transition-all"
                        />
                    </motion.div>
                )}

                {/* Stepper Footer */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Total for this item (if active) */}
                    <div className="flex-1">
                        {active ? (
                            <span className="text-[11px] font-bold text-charcoal/70 uppercase tracking-wider">
                                Subtotal: <span className="text-charcoal font-black">{formatPrice(originalPrice * qty)}</span>
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold text-slate/40 uppercase tracking-widest">
                                Adicionar ao kit
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
                            onClick={() => {
                                setItemQuantity(id, qty + 1);
                                if (isClothing && !currentSize) {
                                    setItemSize(id, 'P'); // Sugere tamanho P como padrão amigável
                                }
                            }}
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
                    Adicione peças ao seu kit e veja seu desconto crescer a cada escolha!
                </p>
            </div>

            {/* Discount Gamification Thermometer (Redesenhado, Divertido e Vencedor) */}
            <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-3xl p-5 md:p-6 mx-2 md:mx-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.07)] border border-black/[0.05] relative overflow-hidden">
                
                {/* Decoração de fundo suave */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ADCEB3]/15 rounded-full blur-2xl pointer-events-none" />

                {/* Header com Ícone e Status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                            discount > 0 ? 'bg-[#ADCEB3] text-[#1f2937] shadow-sm' : 'bg-warm-stone text-slate-500'
                        }`}>
                            <Gift className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-heading font-black text-sm md:text-base text-charcoal block leading-none">
                                Desconto Progressivo por Peças
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                Quanto mais peças você escolhe, maior é o desconto!
                            </span>
                        </div>
                    </div>

                    {/* Badge do Desconto Atual */}
                    {discount > 0 ? (
                        <motion.div
                            key={discount}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 shrink-0"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            {discount}% OFF ATIVO
                        </motion.div>
                    ) : (
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold shrink-0">
                            0% OFF
                        </span>
                    )}
                </div>

                {/* Barra de Progresso com Marco Visual */}
                <div className="relative pt-2 pb-1">
                    {/* Track de fundo */}
                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-black/5 shadow-inner">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ADCEB3] via-emerald-500 to-emerald-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>

                    {/* Marcadores / Milestones */}
                    <div className="relative flex justify-between mt-3 px-1">
                        {/* Meta 1: 2 peças (3%) */}
                        <div className={`flex flex-col items-center transition-colors ${count >= 2 ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all mb-1 ${
                                count >= 2 ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                                {count >= 2 ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : '2'}
                            </div>
                            <span className="text-[11px] leading-tight">2 peças</span>
                            <span className={`text-[10px] font-black uppercase ${count >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>3% OFF</span>
                        </div>

                        {/* Meta 2: 4 peças (5%) */}
                        <div className={`flex flex-col items-center transition-colors ${count >= 4 ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all mb-1 ${
                                count >= 4 ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                                {count >= 4 ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : '4'}
                            </div>
                            <span className="text-[11px] leading-tight">4 peças</span>
                            <span className={`text-[10px] font-black uppercase ${count >= 4 ? 'text-emerald-700' : 'text-slate-400'}`}>5% OFF</span>
                        </div>

                        {/* Meta 3: 6+ peças (8% Máximo) */}
                        <div className={`flex flex-col items-center transition-colors ${count >= 6 ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all mb-1 ${
                                count >= 6 ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-sm' : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                                {count >= 6 ? '🏆' : '6'}
                            </div>
                            <span className="text-[11px] leading-tight">6+ peças</span>
                            <span className={`text-[10px] font-black uppercase ${count >= 6 ? 'text-emerald-700' : 'text-slate-400'}`}>8% OFF 🔥</span>
                        </div>
                    </div>
                </div>

                {/* Faixa Divertida de Economia em Reais quando o desconto está ativo */}
                {discount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💰</span>
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                                    Economia no seu kit:
                                </span>
                                <span className="text-base md:text-lg font-black text-emerald-700 leading-none">
                                    Você está economizando {formatPrice(discountAmount)} ({discount}% OFF)!
                                </span>
                            </div>
                        </div>
                        {count < MAX_PIECES && (
                            <span className="text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0 shadow-2xs">
                                + Peças = + Desconto 🚀
                            </span>
                        )}
                    </motion.div>
                )}

                {/* Mensagem Motivacional Divertida */}
                <div className="mt-3 text-center">
                    <p className="text-xs text-charcoal/80 font-medium">
                        {nextLevelMsg}
                    </p>
                </div>
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

            {/* Floating Summary Bar (Redesigned with Clear Savings) */}
            <AnimatePresence>
                {count > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-4 py-3.5 md:px-8 md:py-4"
                    >
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                            
                            {/* Left: Totals & Discount highlight */}
                            <div className="flex items-center justify-between w-full md:w-auto gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                                            Total ({count} {count === 1 ? 'peça' : 'peças'})
                                        </span>
                                        {discount > 0 && (
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                                                {discount}% OFF aplicado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2.5">
                                        <span className="text-2xl md:text-3xl font-black text-charcoal tabular-nums leading-none">
                                            {formatPrice(finalTotal)}
                                        </span>
                                        {discount > 0 && (
                                            <span className="text-sm md:text-base text-slate-400 line-through tabular-nums font-semibold">
                                                {formatPrice(originalTotal)}
                                            </span>
                                        )}
                                        {discount > 0 && (
                                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                                Economia: {formatPrice(discountAmount)}
                                            </span>
                                        )}
                                    </div>
                                    {isFreeShipping && (
                                        <div className="flex items-center gap-1 mt-1 text-sage-green font-bold text-[10px] uppercase tracking-wider">
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
                                    className="cursor-pointer flex items-center justify-center w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-warm-stone text-charcoal hover:bg-slate/10 border border-black/5 transition-all active:scale-95"
                                    title="Voltar"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="cursor-pointer flex-1 md:w-[220px] bg-charcoal hover:bg-black text-white h-12 md:h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Revisar Pedido <Sparkles className="w-4 h-4 text-[#ADCEB3]" />
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
