'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function CartSidebar() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erro ao criar sessão de checkout');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Erro ao processar checkout:', error);
            setIsLoading(false);
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
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={closeCart}
            />

            {/* Sidebar */}
            <div className="relative w-full max-w-md bg-white shadow-xl h-full flex flex-col animate-slideInRight">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-line bg-warm-stone/50">
                    <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-dusty-rose" />
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate space-y-4">
                            <ShoppingBag className="h-16 w-16 text-slate/20" />
                            <p>Seu carrinho está vazio.</p>
                            <button
                                onClick={closeCart}
                                className="text-dusty-rose font-medium hover:underline"
                            >
                                Continuar comprando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-white border border-line rounded-lg shadow-sm">
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-line">
                                    <Image
                                        src={item.image || '/placeholder.png'}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-charcoal text-sm">{item.name}</h3>
                                        {item.personalization?.name && (
                                            <p className="text-xs text-dusty-rose mt-1">
                                                Bordado: {item.personalization.name} ({item.personalization.color})
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-line rounded-md">
                                            <button
                                                onClick={() => {
                                                    const newQuantity = Math.max(1, item.quantity - 1);
                                                    updateQuantity(item.id, newQuantity);
                                                }}
                                                className="p-1 hover:bg-gray-100 text-slate"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-xs w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-100 text-slate"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-charcoal">
                                                R$ {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Shipping Calculator */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-line bg-warm-stone/20">
                        <p className="text-sm font-medium text-charcoal mb-2">Calcular Frete</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Seu CEP"
                                className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:border-dusty-rose outline-none"
                                maxLength={9}
                                onChange={(e) => {
                                    // Mask 00000-000
                                    let v = e.target.value.replace(/\D/g, '');
                                    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
                                    e.target.value = v;
                                }}
                                onBlur={async (e) => {
                                    const cep = e.target.value.replace(/\D/g, '');
                                    if (cep.length === 8) {
                                        try {
                                            const res = await fetch('/api/shipping', {
                                                method: 'POST',
                                                body: JSON.stringify({ cep })
                                            });
                                            const options = await res.json();
                                            // Auto-select first option for now or show list
                                            // For simplicity in this step, let's just pick the first one and show it
                                            if (options && options.length > 0) {
                                                const cheapest = options[0]; // Assuming sorted or picking first
                                                // Ideally show a selector, but let's effectively set it
                                                useCartStore.getState().setShipping(cheapest.price);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }
                                }}
                            />
                            <button className="text-xs font-bold text-dusty-rose uppercase">Calcular</button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-line bg-warm-stone/30">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate">Total</span>
                            <span className="text-xl font-bold text-charcoal">R$ {total().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className={`w-full bg-dusty-rose hover:bg-deep-rose text-white py-3 rounded-full font-bold shadow-soft transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-wait' : ''
                                }`}
                        >
                            {isLoading ? 'PROCESSANDO...' : 'FINALIZAR COMPRA'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
