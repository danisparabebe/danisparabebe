'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/pricing';
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_REGIONS_LABEL, isEligibleForFreeShipping } from '@/lib/shipping-rules';
import { productControl } from '@/data/product-control';
import { TYPES } from '@/data/admin-options';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const getItemLabel = (id: string) => TYPES.find(t => t.value === id)?.label || id;

export default function CheckoutRapidoPage() {
    const { items, removeItem } = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();

    const [hydrated, setHydrated] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [showSavedAddresses, setShowSavedAddresses] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', cpf: '', cep: '',
        street: '', number: '', complement: '',
        neighborhood: '', city: '', state: ''
    });
    const [addressLoaded, setAddressLoaded] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingOption, setShippingOption] = useState<any | null>(null);
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [showAllShipping, setShowAllShipping] = useState(false);

    useEffect(() => { setHydrated(true); }, []);

    // --- SYNC WITH AUTH ---
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.displayName || '',
                email: user.email || prev.email || '',
            }));

            // Busca endereços reais da nuvem
            const fetchAddresses = async () => {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    setSavedAddresses(snap.data().addresses || []);
                }
            };
            fetchAddresses();
        }
    }, [user]);

    // --- CACHE ON MOUNT ---
    useEffect(() => {
        const cached = localStorage.getItem('checkout_form');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                setFormData(prev => ({ ...prev, ...data }));
                if (data.street) setAddressLoaded(true);
                if (data.cep && data.cep.replace(/\D/g, '').length === 8) {
                    handleCepLookupCache(data.cep); 
                }
            } catch (e) {}
        }
    }, []); // Run only once on mount

    const handleCepLookupCache = async (cepStr: string) => {
        const raw = cepStr.replace(/\D/g, '');
        if (raw.length === 8 && quantity > 0) {
            try {
                const sRes = await fetch('/api/shipping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cep: raw, totalWeight: quantity * 0.3 })
                });
                const sData = await sRes.json();
                if (Array.isArray(sData) && sData.length > 0) {
                    setShippingOptions(sData);
                    const cheapest = [...sData].sort((a: any, b: any) => a.price - b.price)[0];
                    setShippingOption(cheapest);
                }
            } catch { /* silent */ }
        }
    };

    useEffect(() => {
        if (hydrated && items.length === 0) router.push('/');
    }, [hydrated, items, router]);

    const item = items.length > 0 ? items[items.length - 1] : null;
    const product = item?.productId ? productControl.find(p => p.id === item.productId) : null;
    const personalization = item?.personalization || {};
    const babyName = personalization.name || '';

    const parseFeatures = (features: string[]) => features.map(f => {
        const match = f.match(/^(\d+)x\s+(.+)$/);
        if (!match) return { qty: 1, code: f };
        return { qty: parseInt(match[1]), code: match[2].trim() };
    });
    const kitItems = product?.features ? parseFeatures(product.features) : [];
    const totalPieces = kitItems.reduce((sum, i) => sum + i.qty, 0);

    const unitPrice = item?.price || 0;
    const quantity = item?.quantity || 1;
    const subtotal = unitPrice * quantity;

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        localStorage.setItem('checkout_form', JSON.stringify(newData));
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5, 8)}`;
        
        const newData = { ...formData, cep: v };
        setFormData(newData);
        localStorage.setItem('checkout_form', JSON.stringify(newData));

        const raw = v.replace(/\D/g, '');
        if (raw.length === 8) {
            setIsLoadingAddress(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
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
                    setAddressLoaded(true);
                    try {
                        const sRes = await fetch('/api/shipping', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cep: raw, totalWeight: quantity * 0.3 })
                        });
                        const sData = await sRes.json();
                        if (Array.isArray(sData) && sData.length > 0) {
                            setShippingOptions(sData);
                            const cheapest = [...sData].sort((a: any, b: any) => a.price - b.price)[0];
                            setShippingOption(cheapest);
                        }
                    } catch { /* silent */ }
                } else {
                    toast.error('CEP não encontrado.');
                    setAddressLoaded(false);
                }
            } catch {
                toast.error('Erro ao buscar CEP.');
            } finally {
                setIsLoadingAddress(false);
            }
        } else {
            setAddressLoaded(false);
            setShippingOption(null);
            setShippingOptions([]);
        }
    };

    const selectSavedAddress = (addr: any) => {
        const newData = {
            ...formData,
            cep: addr.cep,
            street: addr.street,
            number: addr.number,
            complement: addr.complement || '',
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state
        };
        setFormData(newData);
        setAddressLoaded(true);
        setShowSavedAddresses(false);
        handleCepLookupCache(addr.cep);
        localStorage.setItem('checkout_form', JSON.stringify(newData));
    };

    const handleBuyNow = async () => {
        if (!formData.name || !formData.phone || !formData.cpf || !addressLoaded || !formData.number) {
            toast.error('Preencha os dados de entrega (incluindo CPF) antes de prosseguir.');
            return;
        }
        setIsProcessing(true);
        const loadingToast = toast.loading('Preparando pagamento seguro...');
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [item], 
                    shipping: actualShippingPrice,
                    customer: formData, 
                    userId: user?.uid,
                    cancelPath: '/checkout/rapido'
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Falha ao iniciar pagamento');
            if (data.url) {
                toast.success('Redirecionando...', { id: loadingToast });
                localStorage.setItem('lastOrder', JSON.stringify({ items: [item], customer: formData }));
                window.location.href = data.url;
            } else {
                throw new Error('URL não gerada.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro. Tente novamente.', { id: loadingToast });
            setIsProcessing(false);
        }
    };

    const handleCart = () => {
        toast.success('Produto adicionado ao carrinho!');
        useCartStore.getState().openCart();
        router.push('/');
    };

    if (!hydrated || !item) return null;

    const isStateEligible = isEligibleForFreeShipping(formData.state || '');
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && isStateEligible;
    const cheapestOptionId = [...shippingOptions].sort((a, b) => a.price - b.price)[0]?.id;
    const isCheapestSelected = shippingOption?.id === cheapestOptionId;
    const actualShippingPrice = (freeShipping && isCheapestSelected) ? 0 : (shippingOption?.price || 0);
    const finalTotal = subtotal + actualShippingPrice;

    return (
        <div className="min-h-screen bg-[#faf9f7] flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-black/5 px-4 py-2.5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate hover:text-dusty-rose transition-colors">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                    </button>
                    <h1 className="text-sm font-heading font-black text-[#1f2937] uppercase tracking-wider">Finalizar Compra</h1>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch">

                    {/* ─── LEFT COLUMN: PRODUCT DETAILS ─── */}
                    <div className="w-full md:w-1/2 flex flex-col bg-white border-2 border-[#1f2937] rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)]">

                        {/* Header */}
                        <div className="p-2.5 border-b border-black/10 bg-[#faf9f7] rounded-t-xl shrink-0">
                            <h2 className="text-base font-heading font-black text-[#1f2937] tracking-tight uppercase leading-none">
                                {product?.name || item.name}
                            </h2>
                            {(product?.shortCode || product?.technicalName) && (
                                <div className="flex items-center gap-2 mt-1 text-[10px]">
                                    <span className="font-bold text-slate uppercase tracking-widest">Ref:</span>
                                    <span className="font-black text-[#1f2937] truncate">{product?.shortCode || product?.technicalName}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar">
                            {/* Product Image */}
                            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center p-2 shrink-0">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                ) : (
                                    <span className="text-slate/50 font-bold uppercase text-[9px]">Sem foto</span>
                                )}
                                <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded shadow-sm border border-black/5 text-[9px] font-black uppercase tracking-widest text-[#1f2937]">
                                    Foto do Kit
                                </div>
                            </div>

                            {/* Baby Name Band */}
                            <div className="bg-white p-3 rounded-lg border-[3px] border-[#1f2937] relative overflow-hidden shrink-0 text-center shadow-sm">
                                <p className="text-[8px] font-bold text-[#1f2937] uppercase tracking-[0.25em] leading-none mb-1.5">Nome a Bordar</p>
                                <p className="text-3xl sm:text-4xl font-black text-[#1f2937] font-heading leading-none truncate tracking-tight">{babyName || 'SEM NOME'}</p>
                                {babyName && (
                                    <div className="absolute top-0 right-0 bg-[#1f2937] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-bl-lg tracking-widest shadow-sm">
                                        Confirmado
                                    </div>
                                )}
                            </div>

                            {/* Kit Items */}
                            {kitItems.length > 0 && (
                                <div className="border-t border-black/5 pt-2 shrink-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[9px] font-bold text-slate uppercase tracking-widest">Peças do Kit</p>
                                        <span className="bg-[#1f2937] text-white text-[9px] font-black px-1.5 py-0.5 rounded">{totalPieces}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                                        {kitItems.map((ki, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-[10px] py-0.5 border-b border-black/5">
                                                <span className="bg-slate-100 text-slate font-bold px-1 py-0.5 rounded">{ki.qty}x</span>
                                                <span className="font-semibold text-[#1f2937]">{getItemLabel(ki.code)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN: CHECKOUT & CTAs ─── */}
                    <div className="w-full md:w-1/2 flex flex-col bg-white border-2 border-[#1f2937] rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)]">

                        <div className="p-2.5 border-b border-black/10 bg-[#faf9f7] rounded-t-xl shrink-0 flex items-center justify-between">
                            <h2 className="text-base font-heading font-black text-[#1f2937] tracking-tight uppercase leading-none">Entrega & Pagamento</h2>
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col gap-2.5 justify-between">

                            {/* Form */}
                            <div className="space-y-2 shrink-0">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5">Nome Completo</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Seu nome" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-[#D6A6A6] outline-none placeholder:text-black/25" />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5">WhatsApp</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInput} placeholder="(00) 00000-0000" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-[#D6A6A6] outline-none placeholder:text-black/25" />
                                    </div>
                                </div>

                                <div className="w-1/2">
                                    <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5">CPF</label>
                                    <input type="text" name="cpf" value={formData.cpf} onChange={handleInput} placeholder="000.000.000-00" maxLength={14} className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-[#D6A6A6] outline-none placeholder:text-black/25" />
                                </div>

                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5">CEP</label>
                                        <input type="text" name="cep" value={formData.cep} onChange={handleCepChange} maxLength={9} placeholder="00000-000" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-[#D6A6A6] outline-none placeholder:text-black/25" />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5 opacity-0">s</label>
                                        <div className="min-h-[28px] flex items-center">
                                            {isLoadingAddress ? (
                                                <span className="text-[10px] text-dusty-rose font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Buscando...</span>
                                            ) : addressLoaded ? (
                                                <span className="text-[9px] leading-tight text-slate font-medium line-clamp-2">{formData.street}, {formData.neighborhood} - {formData.city}/{formData.state}</span>
                                            ) : (
                                                <span className="text-[10px] text-slate/50 font-medium">Digite o CEP para calcular</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {addressLoaded && (
                                    <div className="grid grid-cols-[80px_1fr] gap-2">
                                        <div>
                                            <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5">Nº</label>
                                            <input type="text" name="number" value={formData.number} onChange={handleInput} placeholder="Ex: 123" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-[#D6A6A6] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-0.5">Complemento</label>
                                            <input type="text" name="complement" value={formData.complement} onChange={handleInput} placeholder="Apto, Bloco (Opcional)" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-[#D6A6A6] outline-none" />
                                        </div>
                                    </div>
                                )}

                                {user && savedAddresses.length > 0 && (
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                                            className="text-[9px] font-bold text-sage-green-dark hover:text-sage-green uppercase tracking-widest transition-colors flex items-center gap-1"
                                        >
                                            {showSavedAddresses ? 'Fechar lista' : 'Usar um endereço salvo'}
                                        </button>
                                        
                                        {showSavedAddresses && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-xl z-50 p-2 max-h-40 overflow-y-auto custom-scrollbar animate-fadeIn">
                                                {savedAddresses.map((addr) => (
                                                    <button
                                                        key={addr.id}
                                                        type="button"
                                                        onClick={() => selectSavedAddress(addr)}
                                                        className="w-full text-left p-2 hover:bg-sage-green/5 rounded-lg border-b border-line last:border-0 transition-colors"
                                                    >
                                                        <p className="text-[10px] font-bold text-charcoal">{addr.street}, {addr.number}</p>
                                                        <p className="text-[9px] text-slate">{addr.neighborhood} — {addr.city}/{addr.state}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {addressLoaded && shippingOptions.length > 0 && (
                                    <div className="space-y-1 mt-1">
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">Opção de Envio</label>
                                        <div className="flex flex-col gap-1.5">
                                            {/* Render the selected or cheapest option as primary */}
                                            {(() => {
                                                const cheapestOption = [...shippingOptions].sort((a, b) => a.price - b.price)[0];
                                                const primaryOption = shippingOption || cheapestOption;
                                                const displayPrice = (freeShipping && primaryOption.id === cheapestOption.id) ? 0 : primaryOption.price;

                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => !showAllShipping ? setShowAllShipping(true) : null}
                                                        className={`relative w-full text-left flex flex-col justify-between p-2 rounded-lg border-2 transition-all ${
                                                            !showAllShipping ? 'border-[#1f2937] bg-[#f8fafc]' : 'border-black/5 bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-1.5 mb-1.5 w-full">
                                                            <div className={`shrink-0 w-3 h-3 rounded-full border-2 flex items-center justify-center border-[#1f2937]`}>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#1f2937]" />
                                                            </div>
                                                            <p className="text-[10px] font-bold text-[#1f2937] leading-none uppercase truncate pr-1">{primaryOption.name}</p>
                                                            {!showAllShipping && (
                                                                <div className="ml-auto flex items-center gap-1 text-[8px] text-slate font-bold uppercase transition-transform">
                                                                    Mais Opções <ChevronDown className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-end justify-between w-full mt-auto">
                                                            <p className="text-[8px] text-slate font-medium uppercase min-w-0 pr-1 truncate">Prazo: {primaryOption.days} dias úteis</p>
                                                            <span className={`text-[10px] font-black shrink-0 ${displayPrice === 0 ? 'text-green-600' : 'text-[#1f2937]'}`}>
                                                                {displayPrice === 0 ? 'GRÁTIS' : formatPrice(displayPrice)}
                                                            </span>
                                                        </div>
                                                    </button>
                                                )
                                            })()}

                                            {/* Render remaining options when expanded */}
                                            {showAllShipping && shippingOptions
                                                .filter(option => option.id !== (shippingOption?.id || [...shippingOptions].sort((a, b) => a.price - b.price)[0]?.id))
                                                .sort((a, b) => a.price - b.price)
                                                .map((option) => {
                                                    const displayPrice = (freeShipping && option.id === [...shippingOptions].sort((a, b) => a.price - b.price)[0]?.id) ? 0 : option.price;
                                                    
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setShippingOption(option);
                                                                setShowAllShipping(false);
                                                            }}
                                                            className={`relative w-full text-left flex flex-col justify-between p-2 rounded-lg border-2 border-black/5 bg-white hover:border-black/10 transition-all`}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-1.5 w-full">
                                                                <div className="shrink-0 w-3 h-3 rounded-full border-2 border-black/20 flex items-center justify-center">
                                                                </div>
                                                                <p className="text-[10px] font-bold text-[#1f2937] leading-none uppercase truncate pr-1">{option.name}</p>
                                                            </div>
                                                            
                                                            <div className="flex items-end justify-between w-full mt-auto">
                                                                <p className="text-[8px] text-slate font-medium uppercase min-w-0 pr-1 truncate">Prazo: {option.days} dias úteis</p>
                                                                <span className={`text-[10px] font-black shrink-0 ${displayPrice === 0 ? 'text-green-600' : 'text-[#1f2937]'}`}>
                                                                    {displayPrice === 0 ? 'GRÁTIS' : formatPrice(displayPrice)}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                            })}
                                            
                                            {/* Optional collapse button */}
                                            {showAllShipping && shippingOptions.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowAllShipping(false)}
                                                    className="w-full flex items-center justify-center gap-1 text-[8px] font-bold uppercase text-slate hover:text-charcoal mt-1 py-1"
                                                >
                                                    Ver Menos <ChevronUp className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Totals Box */}
                            <div className="bg-[#faf9f7] rounded-lg p-2.5 border border-black/5 mt-1 shrink-0">
                                {/* Produção Artesanal Aviso */}
                                <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2 flex items-start gap-1.5">
                                    <span className="text-amber-600 text-[10px] leading-none mt-0.5">⚠️</span>
                                    <p className="text-[8px] font-bold uppercase text-amber-800 leading-snug tracking-wider">
                                        Atenção: Por conter peças exclusivas e artesanais sob encomenda, 
                                        o envio será realizado somente após o prazo de produção de <span className="text-amber-950">até 12 dias úteis</span>.
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate mb-0.5">
                                        <span>Subtotal:</span>
                                        <span className="text-[#1f2937]">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-start text-[10px] font-bold uppercase text-slate">
                                        <span className="pt-0.5">Frete {shippingOption ? `(${shippingOption.name} - ${shippingOption.days}d)` : ''}:</span>
                                        <span className={shippingOption ? 'text-[#1f2937]' : 'text-slate/60'}>
                                            {shippingOption ? (actualShippingPrice === 0 ? 'GRÁTIS' : formatPrice(actualShippingPrice)) : (addressLoaded ? 'Indisponível' : 'A calcular')}
                                        </span>
                                    </div>
                                    {(() => {
                                        if (!isStateEligible && addressLoaded) {
                                            return (
                                                <div className="text-[8px] text-slate/70 font-bold uppercase mb-0.5">
                                                    Frete grátis apenas para {FREE_SHIPPING_REGIONS_LABEL}
                                                </div>
                                            );
                                        }
                                        if (subtotal > 0 && FREE_SHIPPING_THRESHOLD - subtotal > 0 && isStateEligible) {
                                            return (
                                                <div className="text-[8px] text-amber-600 font-bold uppercase mb-0.5">
                                                    Faltam apenas {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} para <span className="text-amber-700">Frete Grátis</span>!
                                                </div>
                                            );
                                        }
                                        if (freeShipping) {
                                            return (
                                                <div className="text-[8px] text-[#1a9e52] font-bold uppercase mb-0.5">
                                                    &#x2728; Você ganhou Frete Grátis!
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="border-t border-black/10 mt-2 pt-2 flex flex-col gap-2">
                                        <div className="bg-sage-green/10 border border-sage-green/30 rounded-lg p-2 flex justify-between items-center w-full shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/40 to-transparent blur-md transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                            <div className="flex flex-col text-left relative z-10">
                                                <span className="text-[10px] font-black text-sage-green-dark uppercase tracking-widest leading-none">Preço do Kit</span>
                                                <span className="text-[8.5px] font-black text-sage-green-dark uppercase bg-sage-green/20 px-1.5 py-0.5 mt-0.5 rounded shadow-sm inline-block w-max border border-sage-green/30">PAGAMENTO SEGURO</span>
                                            </div>
                                            <span className="text-xl font-black text-sage-green-dark leading-none tabular-nums tracking-tight relative z-10">
                                                {formatPrice(finalTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => router.back()}
                                    disabled={isProcessing}
                                    className="cursor-pointer w-11 h-11 flex items-center justify-center rounded-xl border-2 border-[#1f2937] text-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-all bg-white shadow-sm shrink-0 disabled:opacity-50"
                                    title="Voltar"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={isProcessing || !formData.name || !formData.phone || !addressLoaded || !formData.number}
                                    className="cursor-pointer flex-1 flex flex-col items-center justify-center gap-0.5
                                               bg-[#1a9e52] hover:bg-[#158043] text-white h-11 rounded-xl shadow-[0_4px_14px_rgba(26,158,82,0.3)]
                                               transition-all duration-200 uppercase tracking-widest
                                               disabled:opacity-60 disabled:cursor-not-allowed border border-[#158043]/50"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2 text-xs font-bold"><Loader2 className="w-4 h-4 animate-spin" /> PROCESSANDO...</span>
                                    ) : (
                                        <>
                                            <span className="font-black text-sm leading-none pt-0.5">PAGAR AGORA</span>
                                            <span className="text-[7.5px] text-white/90 normal-case tracking-normal">Ambiente Seguro InfinitePay</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleCart}
                                    disabled={isProcessing}
                                    className="cursor-pointer w-11 h-11 flex items-center justify-center rounded-xl bg-white border-2 border-dusty-rose text-dusty-rose hover:bg-dusty-rose hover:text-white transition-all shadow-sm shrink-0 disabled:opacity-50"
                                    title="Add ao Carrinho e Continuar"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
