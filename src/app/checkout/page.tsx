'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Trash2, ShieldCheck, Loader2, Lock, Truck, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { items, total, shipping, removeItem } = useCartStore();
    const router = useRouter();

    const [hydrated, setHydrated] = useState(false);
    const [formData, setFormData] = useState({
        name: '', phone: '', cpf: '', cep: '',
        street: '', number: '', complement: '',
        neighborhood: '', city: '', state: ''
    });
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => { setHydrated(true); }, []);

    // --- CACHE ON MOUNT ---
    useEffect(() => {
        const cached = localStorage.getItem('checkout_form');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                setFormData(data);
                if (data.street) setIsLoadingAddress(false); // just a flag, we already have it
                // Note: standard checkout doesn't compute shipping locally, so we don't need handleCepLookup
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (hydrated && items.length === 0) router.push('/');
    }, [hydrated, items, router]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        localStorage.setItem('checkout_form', JSON.stringify(newData));
    };

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length === 8) {
            setIsLoadingAddress(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    const addressAdd = {
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    };
                    setFormData(prev => {
                        const next = { ...prev, ...addressAdd };
                        localStorage.setItem('checkout_form', JSON.stringify(next));
                        return next;
                    });
                } else {
                    toast.error('CEP nao encontrado.');
                }
            } catch { /* silent */ } finally {
                setIsLoadingAddress(false);
            }
        }
    };

    const handleCheckout = async () => {
        if (!formData.name || !formData.phone || !formData.cpf || !formData.cep || !formData.street || !formData.number || !formData.city) {
            toast.error('Preencha todos os campos obrigatorios (incluindo CPF e CEP).');
            return;
        }
        setIsProcessing(true);
        const loadingToast = toast.loading('Preparando pagamento seguro...');
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, shipping, customer: formData, cancelPath: '/checkout' }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Falha ao iniciar pagamento');
            if (data.url) {
                toast.success('Redirecionando...', { id: loadingToast });
                localStorage.setItem('lastOrder', JSON.stringify({ items, customer: formData }));
                window.location.href = data.url;
            } else {
                throw new Error('URL de pagamento nao gerada.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao processar. Tente novamente.', { id: loadingToast });
            setIsProcessing(false);
        }
    };

    if (items.length === 0) return null;

    const subtotal = total() - shipping;
    const pixDiscount = subtotal * 0.05;
    const pixTotal = subtotal - pixDiscount + shipping;
    const installment6x = (total() / 6);

    const inputClass = "w-full px-3 py-2 text-xs rounded-lg border border-black/10 focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/30 outline-none transition-all bg-white placeholder:text-black/25";
    const labelClass = "text-[11px] font-semibold text-charcoal/70 uppercase tracking-wider";

    return (
        <div className="min-h-screen bg-[#faf9f7] flex flex-col">
            {/* Compact Header */}
            <header className="bg-white border-b border-black/5 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1 text-xs font-medium text-slate hover:text-dusty-rose transition-colors cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Voltar
                    </button>
                    <h1 className="text-sm font-bold text-charcoal tracking-wide uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Finalizar Pedido</h1>
                    <div className="w-14" /> {/* spacer */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ─── LEFT: Order Summary ─── */}
                    <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm">
                        <h2 className="text-[11px] font-black text-charcoal uppercase tracking-[0.2em] mb-3 pb-2 border-b border-black/5">
                            Resumo do Pedido
                        </h2>

                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 items-center group">
                                    {/* Image */}
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-black/5 bg-[#faf9f7]">
                                        <Image
                                            src={item.image || '/logomarca rose.png'}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold text-charcoal truncate">{item.name}</h3>
                                        {item.personalization?.name && (
                                            <p className="text-[10px] text-dusty-rose font-medium truncate">{item.personalization.name}</p>
                                        )}
                                        {item.personalization?.observations && (
                                            <p className="text-[10px] text-slate font-medium mt-0.5 line-clamp-2 leading-tight" title={item.personalization.observations}>
                                                <span className="font-semibold text-charcoal">Obs:</span> {item.personalization.observations}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate mt-0.5">Qtd: {item.quantity}</p>
                                        <p className="text-[9px] text-slate/80 mt-1.5 flex items-center gap-1 font-medium">
                                            <Clock className="w-3 h-3 text-dusty-rose/80" />
                                            Feito sob medida: Até 12 dias úteis
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <span className="text-xs font-bold text-charcoal whitespace-nowrap">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </span>

                                    {/* Trash */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 rounded-lg text-slate/40 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                        title="Remover item"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-black/5 mt-4 pt-3 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-slate">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate">
                                <span>Frete</span>
                                <span>{shipping > 0 ? `R$ ${shipping.toFixed(2)}` : 'A calcular'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-black/5">
                                <span className="text-xs font-bold text-charcoal">Total</span>
                                <span className="text-base font-black text-dusty-rose">R$ {total().toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] text-slate text-right space-y-0.5 pt-1">
                                <p>ou 6x de <strong className="text-charcoal">R$ {installment6x.toFixed(2)}</strong> no cartão</p>
                                <p>ou <strong className="text-green-700">R$ {pixTotal.toFixed(2)}</strong> no PIX <span className="text-green-600 font-bold">(5% off)</span></p>
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: Customer Data ─── */}
                    <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm space-y-4">
                        <h2 className="text-[11px] font-black text-charcoal uppercase tracking-[0.2em] pb-2 border-b border-black/5">
                            Dados para Entrega
                        </h2>

                        {/* Name + WhatsApp */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className={labelClass}>Nome Completo</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Nome e sobrenome" className={inputClass} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>WhatsApp</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInput} placeholder="(00) 00000-0000" className={inputClass} />
                            </div>
                        </div>

                        {/* CPF + CEP */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className={labelClass}>CPF <span className="font-normal text-slate/60">(Para Envio)</span></label>
                                <input type="text" name="cpf" value={formData.cpf} onChange={handleInput} placeholder="000.000.000-00" className={inputClass} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>CEP</label>
                                <input 
                                    type="text" name="cep" 
                                    value={formData.cep} 
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, '');
                                        if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5, 8)}`;
                                        const newData = { ...formData, cep: v };
                                        setFormData(newData);
                                        localStorage.setItem('checkout_form', JSON.stringify(newData));
                                    }} 
                                    onBlur={handleCepBlur} 
                                    maxLength={9} placeholder="00000-000" className={inputClass} 
                                />
                            </div>
                        </div>

                        {/* Street + Number */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-3 space-y-1">
                                <label className={labelClass}>Rua</label>
                                <input type="text" name="street" value={formData.street} onChange={handleInput} disabled={isLoadingAddress} className={`${inputClass} disabled:bg-gray-50`} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>N.</label>
                                <input type="text" name="number" value={formData.number} onChange={handleInput} className={inputClass} />
                            </div>
                        </div>

                        {/* Complement + Bairro */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className={labelClass}>Compl. <span className="font-normal text-slate/60">(opc.)</span></label>
                                <input type="text" name="complement" value={formData.complement} onChange={handleInput} placeholder="Apto, Bloco..." className={inputClass} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Bairro</label>
                                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInput} disabled={isLoadingAddress} className={`${inputClass} disabled:bg-gray-50`} />
                            </div>
                        </div>

                        {/* Cidade + Estado */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-3 space-y-1">
                                <label className={labelClass}>Cidade</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInput} disabled={isLoadingAddress} className={`${inputClass} disabled:bg-gray-50`} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>UF</label>
                                <input type="text" name="state" value={formData.state} onChange={handleInput} disabled={isLoadingAddress} maxLength={2} placeholder="SP" className={`${inputClass} uppercase disabled:bg-gray-50`} />
                            </div>
                        </div>

                        {/* Buy Button - matching product page green style */}
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className={`
                                w-full relative overflow-hidden group/buy bg-[#10B981] hover:bg-[#0EA5E9] text-white
                                py-3.5 px-6 rounded-xl
                                shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(14,165,233,0.4)]
                                transition-all duration-300 active:scale-[0.98] cursor-pointer
                                flex flex-col items-center justify-center
                                border border-[#059669]/20
                                ${isProcessing ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2 font-bold text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processando...
                                </span>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-0.5 relative z-10">
                                        <Lock className="w-3 h-3 text-white/90" />
                                        <span className="font-extrabold text-[9px] tracking-widest text-white/90 uppercase">Compra 100% Segura</span>
                                    </div>
                                    <span className="font-extrabold text-lg tracking-tight relative z-10">FINALIZAR PEDIDO</span>
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/buy:animate-shine" />
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-center text-slate/60 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-green-600" />
                            Pagamento 100% seguro via Stripe
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
