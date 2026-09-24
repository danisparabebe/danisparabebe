'use client';

import { X, Minus, Plus, Trash2, ShoppingBag, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const AnimatedEmptyCart = () => (
    <div className="flex flex-col items-center justify-center space-y-6 my-auto pt-10">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            className="relative w-32 h-32"
        >
            <svg viewBox="0 0 200 200" className="w-full h-full text-dusty-rose/20 drop-shadow-sm">
                <motion.path
                    d="M40 50 L160 50 L140 130 L60 130 Z"
                    fill="currentColor"
                    stroke="var(--dusty-rose)"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />
                <motion.circle
                    cx="80" cy="160" r="12"
                    fill="var(--dusty-rose)"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                />
                <motion.circle
                    cx="120" cy="160" r="12"
                    fill="var(--dusty-rose)"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                />
                <motion.path
                    d="M20 30 L40 50"
                    stroke="var(--dusty-rose)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                />
                {/* Floating sparkle elements */}
                <motion.path
                    d="M100 20 L100 0 M90 10 L110 10"
                    stroke="var(--dusty-rose)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.5] }}
                    transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                />
            </svg>
        </motion.div>
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3"
        >
            <p className="text-lg font-heading text-charcoal">Seu carrinho está vazio</p>
            <p className="text-sm text-slate">Que tal adicionar alguns itens fofos?</p>
        </motion.div>
    </div>
);

export function CartSidebar() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, total, shipping, setShipping } = useCartStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [shippingCep, setShippingCep] = useState('');
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [shippingSuccess, setShippingSuccess] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    const handleCheckout = () => {
        closeCart();
        router.push('/checkout');
    };

    // Auto-carrega CEP do cache se o usuário já tiver digitado no checkout ou anteriormente
    useEffect(() => {
        if (isOpen) {
            try {
                const cachedForm = localStorage.getItem('checkout_form');
                if (cachedForm) {
                    const parsed = JSON.parse(cachedForm);
                    if (parsed.cep && !shippingCep) {
                        setShippingCep(parsed.cep);
                        const raw = parsed.cep.replace(/\D/g, '');
                        if (raw.length === 8 && shipping === 0) {
                            calculateShipping(raw);
                        }
                    }
                }
            } catch {}
        }
    }, [isOpen]);

    const calculateShipping = async (customCep?: string) => {
        const rawCep = (customCep || shippingCep).replace(/\D/g, '');
        if (rawCep.length !== 8) {
            return;
        }

        setIsCalculatingShipping(true);
        setShippingError(null);
        try {
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cep: rawCep })
            });

            if (!res.ok) {
                throw new Error('Falha ao calcular frete');
            }

            const options = await res.json();

            if (options && options.length > 0) {
                const cheapest = options[0];
                setShipping(cheapest.price);
                setShippingOptions(options);
                setShippingSuccess(true);

                // Salva CEP no checkout_form para agilizar o checkout
                try {
                    const cached = localStorage.getItem('checkout_form');
                    const prev = cached ? JSON.parse(cached) : {};
                    const formattedCep = rawCep.length > 5 ? `${rawCep.slice(0, 5)}-${rawCep.slice(5, 8)}` : rawCep;
                    localStorage.setItem('checkout_form', JSON.stringify({ ...prev, cep: formattedCep }));
                } catch {}
            } else {
                setShippingError('Nenhuma opção de frete encontrada para este CEP.');
                setShipping(0);
                setShippingOptions([]);
            }
        } catch (err) {
            console.error('Erro ao calcular frete:', err);
            setShippingError('Erro ao calcular frete. Verifique os números digitados.');
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const handleShippingCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5, 8)}`;
        setShippingCep(v);
        setShippingError(null);

        const raw = v.replace(/\D/g, '');
        if (raw.length === 8) {
            // Calcula automaticamente sem precisar clicar
            calculateShipping(raw);
        } else if (raw.length === 0) {
            setShipping(0);
            setShippingOptions([]);
            setShippingSuccess(false);
        }
    };

    // Prevent scrolling when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={closeCart}
            />

            {/* Sidebar */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-line bg-surface-white">
                    <h2 className="text-xl font-heading font-bold text-charcoal flex items-center gap-3">
                        <ShoppingBag className="h-6 w-6 text-dusty-rose" />
                        Seu Carrinho
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 text-slate hover:text-charcoal hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <AnimatedEmptyCart />
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => {
                                const productSlug = item.productId || (item.id ? item.id.split('-personalized-')[0] : '');
                                const productUrl = productSlug ? `/produto/${productSlug}` : null;

                                return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                                    transition={{ type: "spring", bounce: 0.3 }}
                                    key={item.id}
                                    className="flex gap-4 p-4 bg-white border border-line rounded-xl shadow-sm hover:shadow-soft transition-shadow hover:border-dusty-rose/30"
                                >
                                    {productUrl ? (
                                        <Link
                                            href={productUrl}
                                            onClick={closeCart}
                                            className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-warm-stone/20 group/img cursor-pointer"
                                            title="Ver detalhes do produto"
                                        >
                                            <Image
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-warm-stone/20">
                                            <Image
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            {productUrl ? (
                                                <Link
                                                    href={productUrl}
                                                    onClick={closeCart}
                                                    className="font-medium text-charcoal text-sm leading-tight hover:text-dusty-rose transition-colors cursor-pointer block"
                                                >
                                                    {item.name}
                                                </Link>
                                            ) : (
                                                <h3 className="font-medium text-charcoal text-sm leading-tight">{item.name}</h3>
                                            )}

                                            {/* Render Personalization Meta Data */}
                                            {item.personalization && (
                                                <div className="mt-2 flex flex-col gap-1 border-l-2 border-dusty-rose/30 pl-2">
                                                    {item.personalization.name && (
                                                        <p className="text-xs font-semibold text-dusty-rose flex items-center gap-1">
                                                            <span className="text-sm leading-none">✨</span> {item.personalization.name}
                                                        </p>
                                                    )}
                                                    {item.personalization.theme && item.personalization.theme !== 'Nenhum' && (
                                                        <p className="text-[10px] text-slate uppercase leading-tight">
                                                            Tema: <span className="font-bold text-charcoal">{item.personalization.theme}</span>
                                                        </p>
                                                    )}
                                                    {item.personalization.color && item.personalization.color.toLowerCase() !== 'dourado' && (
                                                        <p className="text-[10px] text-slate uppercase leading-tight">
                                                            Cor: <span className="font-bold text-charcoal">{item.personalization.color}</span>
                                                        </p>
                                                    )}
                                                    {item.personalization.finishDetail && item.personalization.finishDetail !== 'Nenhum' && (
                                                        <p className="text-[10px] text-slate uppercase leading-tight">
                                                            Acabamento: <span className="font-medium text-charcoal">{item.personalization.finishDetail}</span>
                                                            {item.personalization.finishColor ? ` (${item.personalization.finishColor})` : ''}
                                                        </p>
                                                    )}
                                                    {item.personalization.observations && (
                                                        <p className="text-[10px] text-slate leading-tight mt-1 line-clamp-2" title={item.personalization.observations}>
                                                            <span className="font-semibold text-charcoal">Obs:</span> {item.personalization.observations}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Botão Ver mais detalhes */}
                                            {productUrl && (
                                                <Link
                                                    href={productUrl}
                                                    onClick={closeCart}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-dusty-rose hover:text-charcoal bg-dusty-rose/10 hover:bg-dusty-rose/20 px-2 py-0.5 rounded-md mt-2 transition-all w-fit cursor-pointer border border-dusty-rose/20 group/btn"
                                                    title="Ver mais detalhes do produto"
                                                >
                                                    <span>Ver mais detalhes</span>
                                                    <ExternalLink className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </Link>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-line rounded-lg bg-surface-white">
                                                <button
                                                    onClick={() => {
                                                        const newQuantity = Math.max(1, item.quantity - 1);
                                                        updateQuantity(item.id, newQuantity);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 text-slate rounded-l-lg transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="text-xs w-8 text-center font-bold text-charcoal">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1.5 hover:bg-gray-100 text-slate rounded-r-lg transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-charcoal">
                                                    R$ {(item.price * item.quantity).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-slate hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Shipping Calculator */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-line bg-warm-stone/20">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-charcoal uppercase tracking-wider">Calcular Frete</p>
                            {shippingSuccess && shipping > 0 && (
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-fadeIn">
                                    <Check className="w-3.5 h-3.5" /> Frete calculado
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Digite seu CEP (00000-000)"
                                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:border-dusty-rose outline-none bg-white placeholder:text-black/30"
                                    maxLength={9}
                                    value={shippingCep}
                                    onChange={handleShippingCepChange}
                                />
                                {isCalculatingShipping && (
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-dusty-rose" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => calculateShipping()}
                                disabled={isCalculatingShipping}
                                className="text-xs font-bold text-sage-green-dark uppercase px-3 py-2 hover:bg-sage-green/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isCalculatingShipping ? '...' : 'Calcular'}
                            </button>
                        </div>

                        {shippingError && (
                            <p className="text-[11px] text-red-500 mt-1.5">{shippingError}</p>
                        )}

                        {shippingOptions.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-line/60 space-y-1 animate-fadeIn">
                                {shippingOptions.slice(0, 2).map((opt, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs text-charcoal/80">
                                        <span className="font-medium">{opt.name} ({opt.days} dias úteis)</span>
                                        <span className="font-bold text-charcoal">R$ {opt.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-line bg-warm-stone/30">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-sm text-slate">
                                <span>Subtotal</span>
                                <span>R$ {(total() - shipping).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate">
                                <span>Frete</span>
                                <span className={shipping > 0 ? 'text-charcoal font-semibold' : 'text-slate/60'}>
                                    {isCalculatingShipping ? 'Calculando...' : (shipping > 0 ? `R$ ${shipping.toFixed(2)}` : 'A calcular')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-line">
                                <span className="font-bold text-charcoal">Total</span>
                                <span className="text-xl font-extrabold text-charcoal">R$ {total().toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className={`w-full bg-sage-green hover:bg-[#9cbd9f] text-charcoal py-3 rounded-full font-extrabold shadow-soft transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-wait' : ''
                                }`}
                        >
                            {isLoading ? 'PROCESSANDO...' : 'FINALIZAR COMPRA'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
