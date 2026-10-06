'use client';

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
    ArrowLeft, 
    ShoppingCart, 
    ShieldCheck, 
    Loader2, 
    ChevronDown, 
    ChevronUp, 
    Trash2, 
    Check, 
    AlertCircle,
    Truck,
    Package,
    Lock,
    Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/pricing';
import { 
    FREE_SHIPPING_THRESHOLD, 
    FREE_SHIPPING_REGIONS_LABEL, 
    isEligibleForFreeShipping 
} from '@/lib/shipping-rules';
import { productControl } from '@/data/product-control';
import { TYPES } from '@/data/admin-options';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const getItemLabel = (codeOrId: string) => TYPES.find(t => t.value === codeOrId)?.label || codeOrId;

const parseFeatures = (features: string[]) => features.map(f => {
    const match = f.match(/^(\d+)x\s+(.+)$/);
    if (!match) return { qty: 1, code: f };
    return { qty: parseInt(match[1]), code: match[2].trim() };
});

export default function UnifiedCheckoutPage() {
    const { items, removeItem, total, setShipping } = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();

    const [hydrated, setHydrated] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [showSavedAddresses, setShowSavedAddresses] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        phone: '', 
        cpf: '', 
        cep: '',
        street: '', 
        number: '', 
        complement: '',
        neighborhood: '', 
        city: '', 
        state: ''
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [showManualAddress, setShowManualAddress] = useState(false);
    const [addressLoaded, setAddressLoaded] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Shipping State
    const [shippingOption, setShippingOption] = useState<any | null>(null);
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [showAllShipping, setShowAllShipping] = useState(false);

    // Refs for scrolling to errors
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const cpfRef = useRef<HTMLInputElement>(null);
    const cepRef = useRef<HTMLInputElement>(null);
    const numberRef = useRef<HTMLInputElement>(null);
    const streetRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setHydrated(true); 
    }, []);

    // Redirect to home if cart is empty after hydration
    useEffect(() => {
        if (hydrated && items.length === 0) {
            router.push('/');
        }
    }, [hydrated, items, router]);

    // Sync with Auth user
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.displayName || '',
                email: user.email || prev.email || '',
            }));

            const fetchAddresses = async () => {
                try {
                    const snap = await getDoc(doc(db, 'users', user.uid));
                    if (snap.exists()) {
                        setSavedAddresses(snap.data().addresses || []);
                    }
                } catch (e) {
                    // silent
                }
            };
            fetchAddresses();
        }
    }, [user]);

    // Cache on Mount
    useEffect(() => {
        const cached = localStorage.getItem('checkout_form');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                setFormData(prev => ({ ...prev, ...data }));
                if (data.street) setAddressLoaded(true);
                if (data.cep && data.cep.replace(/\D/g, '').length === 8) {
                    fetchShippingRates(data.cep);
                }
            } catch (e) {}
        }
    }, []);

    // Calculate weight & fetch shipping
    const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

    const fetchShippingRates = async (cepStr: string) => {
        const raw = cepStr.replace(/\D/g, '');
        if (raw.length === 8) {
            try {
                const sRes = await fetch('/api/shipping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        cep: raw, 
                        totalWeight: Math.max(0.3, totalItemsCount * 0.35) 
                    })
                });
                if (sRes.ok) {
                    const sData = await sRes.json();
                    if (Array.isArray(sData) && sData.length > 0) {
                        setShippingOptions(sData);
                        const cheapest = [...sData].sort((a: any, b: any) => a.price - b.price)[0];
                        setShippingOption(cheapest);
                        setShipping(cheapest.price);
                    }
                }
            } catch { 
                /* silent */ 
            }
        }
    };

    // CEP Change & Lookup
    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);
        const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;

        const newData = { ...formData, cep: formatted };
        setFormData(newData);
        setErrors(prev => ({ ...prev, cep: false }));
        localStorage.setItem('checkout_form', JSON.stringify(newData));

        if (v.length === 8) {
            setIsLoadingAddress(true);
            try {
                let data: any = null;
                try {
                    const res = await fetch(`/api/viacep?cep=${v}`);
                    if (res.ok) data = await res.json();
                } catch {
                    const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
                    if (res.ok) data = await res.json();
                }

                if (data && !data.erro) {
                    const updated = {
                        ...formData,
                        cep: formatted,
                        street: data.logradouro || '',
                        neighborhood: data.bairro || '',
                        city: data.localidade || '',
                        state: data.uf || ''
                    };
                    setFormData(updated);
                    setAddressLoaded(true);
                    setErrors(prev => ({ ...prev, street: false, city: false }));
                    localStorage.setItem('checkout_form', JSON.stringify(updated));
                    
                    fetchShippingRates(v);

                    setTimeout(() => {
                        numberRef.current?.focus();
                    }, 100);
                } else {
                    toast.error('CEP não encontrado. Por favor, confira os números ou preencha o endereço abaixo.');
                    setShowManualAddress(true);
                    setAddressLoaded(true);
                }
            } catch {
                toast.error('Erro ao consultar CEP. Você pode preencher o endereço manualmente abaixo.');
                setShowManualAddress(true);
                setAddressLoaded(true);
            } finally {
                setIsLoadingAddress(false);
            }
        } else {
            setShippingOption(null);
            setShippingOptions([]);
        }
    };

    // Input Handlers with Auto-Masks
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        let formatted = v;
        if (v.length > 6) {
            formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
            formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        }
        setFormData(prev => ({ ...prev, phone: formatted }));
        setErrors(prev => ({ ...prev, phone: false }));
        localStorage.setItem('checkout_form', JSON.stringify({ ...formData, phone: formatted }));
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        let formatted = v;
        if (v.length > 9) {
            formatted = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
        } else if (v.length > 6) {
            formatted = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
        } else if (v.length > 3) {
            formatted = `${v.slice(0, 3)}.${v.slice(3)}`;
        }
        setFormData(prev => ({ ...prev, cpf: formatted }));
        setErrors(prev => ({ ...prev, cpf: false }));
        localStorage.setItem('checkout_form', JSON.stringify({ ...formData, cpf: formatted }));
    };

    const handleGenericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        setErrors(prev => ({ ...prev, [name]: false }));
        localStorage.setItem('checkout_form', JSON.stringify(updated));
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
        fetchShippingRates(addr.cep);
        localStorage.setItem('checkout_form', JSON.stringify(newData));
    };

    // Calculation & Free Shipping
    const subtotal = items.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);
    const isStateEligible = isEligibleForFreeShipping(formData.state || '');
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && isStateEligible;
    const cheapestOptionId = [...shippingOptions].sort((a, b) => a.price - b.price)[0]?.id;
    const isCheapestSelected = shippingOption?.id === cheapestOptionId;
    const actualShippingPrice = (freeShipping && isCheapestSelected) ? 0 : (shippingOption?.price || 0);
    const finalTotal = subtotal + actualShippingPrice;

    // Validation & Submit Handler
    const handleBuyNow = async () => {
        const newErrors: Record<string, boolean> = {};

        if (!formData.name || formData.name.trim().length < 3) {
            newErrors.name = true;
        }

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (!formData.phone || phoneDigits.length < 10) {
            newErrors.phone = true;
        }

        const cpfDigits = formData.cpf.replace(/\D/g, '');
        if (!formData.cpf || cpfDigits.length !== 11) {
            newErrors.cpf = true;
        }

        const cepDigits = formData.cep.replace(/\D/g, '');
        if (!formData.cep || cepDigits.length !== 8) {
            newErrors.cep = true;
        }

        if (!formData.street || formData.street.trim() === '') {
            newErrors.street = true;
        }

        if (!formData.number || formData.number.trim() === '') {
            newErrors.number = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            // Specific user-friendly toast feedback
            if (newErrors.name) {
                toast.error('Por favor, informe seu nome completo.');
                nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                nameRef.current?.focus();
            } else if (newErrors.phone) {
                toast.error('Por favor, informe seu WhatsApp com DDD.');
                phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                phoneRef.current?.focus();
            } else if (newErrors.cpf) {
                toast.error('Por favor, informe um CPF válido (11 dígitos).');
                cpfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cpfRef.current?.focus();
            } else if (newErrors.cep) {
                toast.error('Por favor, digite seu CEP completo.');
                cepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cepRef.current?.focus();
            } else if (newErrors.street) {
                toast.error('Por favor, informe o nome da sua rua.');
                setShowManualAddress(true);
                streetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                streetRef.current?.focus();
            } else if (newErrors.number) {
                toast.error('Ops! Faltou preencher o Número da casa/apartamento.', { icon: '🏠' });
                numberRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                numberRef.current?.focus();
            }
            return;
        }

        setIsProcessing(true);
        const loadingToast = toast.loading('Preparando pagamento seguro...');
        
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items, 
                    shipping: actualShippingPrice,
                    customer: formData, 
                    userId: user?.uid,
                    cancelPath: '/checkout'
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Falha ao iniciar pagamento');

            if (data.url) {
                toast.success('Redirecionando para pagamento seguro...', { id: loadingToast });
                localStorage.setItem('lastOrder', JSON.stringify({ items, customer: formData }));
                window.location.href = data.url;
            } else {
                throw new Error('Link de pagamento não gerado.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao conectar ao checkout. Tente novamente.', { id: loadingToast });
            setIsProcessing(false);
        }
    };

    if (!hydrated || items.length === 0) {
        return (
            <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-dusty-rose" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf9f7] flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-black/5 px-4 py-3 sticky top-0 z-30 shadow-xs">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center text-xs sm:text-sm font-semibold text-slate hover:text-charcoal transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
                    </button>
                    <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-green-700" />
                        <h1 className="text-xs sm:text-sm font-black text-charcoal uppercase tracking-wider">
                            Finalizar Compra
                        </h1>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Ambiente Seguro</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 md:py-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">

                    {/* ─── LEFT COLUMN: PRODUTO(S), FOTOS E DESCRIÇÃO ─── */}
                    <div className="w-full md:w-1/2 flex flex-col bg-white border-2 border-[#1f2937] rounded-2xl shadow-[4px_4px_0px_rgba(31,41,55,1)] overflow-hidden">
                        
                        {/* Header da Coluna */}
                        <div className="p-3.5 border-b border-black/10 bg-[#faf9f7] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-charcoal" />
                                <h2 className="text-sm font-black text-[#1f2937] tracking-tight uppercase">
                                    Resumo do Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate bg-white px-2 py-0.5 rounded-full border border-black/10">
                                Total: {formatPrice(subtotal)}
                            </span>
                        </div>

                        {/* Lista de Itens com Visualização Rica */}
                        <div className="p-3.5 divide-y divide-black/10 space-y-4 overflow-y-auto max-h-[75vh]">
                            {items.map((item, idx) => {
                                const product = item.productId 
                                    ? (productControl.find(p => p.id === item.productId) || 
                                       productControl.find(p => p.colorVariations?.some(v => v.id === item.productId)))
                                    : null;
                                
                                const variation = product?.colorVariations?.find(v => v.id === item.productId);
                                const itemFeatures = product?.features ? parseFeatures(product.features) : [];
                                const totalPieces = itemFeatures.reduce((sum, i) => sum + i.qty, 0);
                                const personalization = item.personalization || {};
                                const babyName = personalization.name || '';
                                const photoSrc = variation?.image || item.image || product?.images[0];

                                return (
                                    <div key={item.id || idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-3`}>
                                        
                                        {/* Título & Referência */}
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-base sm:text-lg font-black text-[#1f2937] leading-snug">
                                                    {item.name}
                                                </h3>
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                                        title="Remover item"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] flex-wrap">
                                                {(product?.shortCode || variation?.id || product?.technicalName) && (
                                                    <span className="font-mono text-slate font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                                        REF: {product?.shortCode || variation?.id || product?.technicalName}
                                                    </span>
                                                )}
                                                {(variation?.colorName || personalization?.colorVariation || personalization?.color) && (
                                                    <span className="font-bold text-dusty-rose bg-dusty-rose/10 px-1.5 py-0.5 rounded">
                                                        Cor: {variation?.colorName || personalization?.colorVariation || personalization?.color}
                                                    </span>
                                                )}
                                                <span className="font-bold text-slate ml-auto">
                                                    Qtd: {item.quantity || 1}x
                                                </span>
                                            </div>
                                        </div>

                                        {/* Foto do Produto */}
                                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center p-2 shadow-xs group">
                                            {photoSrc ? (
                                                <Image 
                                                    src={photoSrc} 
                                                    alt={item.name} 
                                                    fill 
                                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
                                                />
                                            ) : (
                                                <span className="text-slate/50 font-bold uppercase text-xs">Sem foto</span>
                                            )}
                                            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-sm border border-black/5 text-[9px] font-black uppercase tracking-widest text-[#1f2937]">
                                                Foto Real do Kit
                                            </div>
                                        </div>

                                        {/* Faixa em Destaque: NOME A BORDAR */}
                                        <div className="bg-white p-3 sm:p-4 rounded-xl border-[3px] border-[#1f2937] relative overflow-hidden text-center shadow-xs">
                                            <p className="text-[9px] font-bold text-[#1f2937] uppercase tracking-[0.25em] leading-none mb-1.5">
                                                Nome a Bordar
                                            </p>
                                            <p className="text-2xl sm:text-3xl font-black text-[#1f2937] font-heading leading-tight truncate tracking-tight">
                                                {babyName || 'SEM NOME ESPECIFICADO'}
                                            </p>
                                            {babyName && (
                                                <div className="absolute top-0 right-0 bg-[#1f2937] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-widest shadow-xs">
                                                    ✓ Confirmado
                                                </div>
                                            )}
                                        </div>

                                        {/* Peças Inclusas do Kit */}
                                        {itemFeatures.length > 0 && (
                                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                                        Peças Inclusas no Kit
                                                    </p>
                                                    <span className="bg-[#1f2937] text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                                                        {totalPieces} {totalPieces === 1 ? 'peça' : 'peças'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {itemFeatures.map((ki, kIdx) => (
                                                        <div key={kIdx} className="flex items-center gap-1.5 text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                            <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                                                {ki.qty}x
                                                            </span>
                                                            <span className="font-bold text-[#1f2937] truncate">
                                                                {getItemLabel(ki.code)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Preço do Item */}
                                        <div className="flex justify-between items-center text-xs font-bold pt-1">
                                            <span className="text-slate-500 uppercase">Preço deste item:</span>
                                            <span className="text-sm font-black text-emerald-700">
                                                {formatPrice(item.price * (item.quantity || 1))}
                                            </span>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                        {/* Aviso sobre Tonalidades e Variação de Cores na Ficha do Checkout */}
                        <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-amber-900 flex items-start gap-2.5 shadow-2xs">
                            <Palette className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-[11px] leading-relaxed">
                                <p className="font-bold text-amber-950 mb-0.5">Aviso sobre tonalidades e cores:</p>
                                <p className="text-amber-900/90">
                                    As cores reais dos tecidos, acabamentos e bordados podem apresentar pequenas variações sutis de tom em relação às fotos exibidas na tela, de acordo com o lote da matéria-prima e a calibração de cor e iluminação do visor do seu celular ou computador.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN: ENTREGA & PAGAMENTO ─── */}
                    <div className="w-full md:w-1/2 flex flex-col bg-white border-2 border-[#1f2937] rounded-2xl shadow-[4px_4px_0px_rgba(31,41,55,1)] overflow-hidden">
                        
                        {/* Header da Coluna */}
                        <div className="p-3.5 border-b border-black/10 bg-[#faf9f7] flex items-center justify-between">
                            <h2 className="text-sm font-black text-[#1f2937] tracking-tight uppercase leading-none">
                                Entrega & Pagamento
                            </h2>
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                                Checkout Seguro
                            </span>
                        </div>

                        <div className="p-3.5 sm:p-5 flex flex-col gap-4">

                            {/* 1. DADOS DO COMPRADOR */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1">
                                    1. Dados do Comprador
                                </p>

                                <div className="space-y-2.5">
                                    {/* Nome */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Nome Completo *
                                        </label>
                                        <input 
                                            ref={nameRef}
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleGenericInput} 
                                            placeholder="Ex: Daniele Silva" 
                                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                                                errors.name 
                                                    ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' 
                                                    : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                                            }`} 
                                        />
                                        {errors.name && (
                                            <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Informe seu nome completo
                                            </p>
                                        )}
                                    </div>

                                    {/* WhatsApp & CPF */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                WhatsApp (com DDD) *
                                            </label>
                                            <input 
                                                ref={phoneRef}
                                                type="tel" 
                                                name="phone" 
                                                inputMode="tel"
                                                value={formData.phone} 
                                                onChange={handlePhoneChange} 
                                                placeholder="(00) 00000-0000" 
                                                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                                                    errors.phone 
                                                        ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' 
                                                        : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                                                }`} 
                                            />
                                            {errors.phone && (
                                                <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> WhatsApp obrigatório
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                CPF (para emissão e envio) *
                                            </label>
                                            <input 
                                                ref={cpfRef}
                                                type="text" 
                                                name="cpf" 
                                                inputMode="numeric"
                                                value={formData.cpf} 
                                                onChange={handleCpfChange} 
                                                placeholder="000.000.000-00" 
                                                maxLength={14} 
                                                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                                                    errors.cpf 
                                                        ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' 
                                                        : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                                                }`} 
                                            />
                                            {errors.cpf && (
                                                <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> CPF obrigatório (11 dígitos)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. ENDEREÇO DE ENTREGA */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        2. Endereço de Entrega
                                    </p>
                                    {user && savedAddresses.length > 0 && (
                                        <button 
                                            type="button"
                                            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider cursor-pointer"
                                        >
                                            {showSavedAddresses ? 'Fechar' : 'Endereço salvo'}
                                        </button>
                                    )}
                                </div>

                                {/* Seletor de Endereço Salvo */}
                                {showSavedAddresses && savedAddresses.length > 0 && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                                        {savedAddresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => selectSavedAddress(addr)}
                                                className="w-full text-left p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-xs transition-colors"
                                            >
                                                <p className="font-bold text-[#1f2937]">{addr.street}, {addr.number}</p>
                                                <p className="text-[10px] text-slate-500">{addr.neighborhood} — {addr.city}/{addr.state} (CEP: {addr.cep})</p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Campo de CEP com Busca Automática */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        CEP *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            ref={cepRef}
                                            type="text" 
                                            name="cep" 
                                            inputMode="numeric"
                                            value={formData.cep} 
                                            onChange={handleCepChange} 
                                            maxLength={9} 
                                            placeholder="00000-000" 
                                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                                                errors.cep 
                                                    ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' 
                                                    : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                                            }`} 
                                        />
                                        {isLoadingAddress && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...
                                            </div>
                                        )}
                                    </div>
                                    {errors.cep && (
                                        <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Informe o CEP com 8 dígitos
                                        </p>
                                    )}
                                </div>

                                {/* Preview do Endereço Localizado */}
                                {addressLoaded && !showManualAddress && (
                                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex items-start justify-between gap-2">
                                        <div className="text-xs">
                                            <p className="font-bold text-emerald-950">
                                                {formData.street}, {formData.neighborhood}
                                            </p>
                                            <p className="text-[11px] text-emerald-800">
                                                {formData.city} - {formData.state}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowManualAddress(true)}
                                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
                                        >
                                            Editar rua
                                        </button>
                                    </div>
                                )}

                                {/* Campos de Rua / Bairro Manuais caso precise */}
                                {showManualAddress && (
                                    <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Rua / Avenida *
                                            </label>
                                            <input 
                                                ref={streetRef}
                                                type="text" 
                                                name="street" 
                                                value={formData.street} 
                                                onChange={handleGenericInput} 
                                                placeholder="Nome da sua rua" 
                                                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none bg-white ${
                                                    errors.street ? 'border-red-500' : 'border-slate-300'
                                                }`} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bairro</label>
                                                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleGenericInput} placeholder="Bairro" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Cidade / UF</label>
                                                <input type="text" name="city" value={`${formData.city} - ${formData.state}`} onChange={handleGenericInput} placeholder="Cidade - UF" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none bg-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Número e Complemento — SEMPRE VISÍVEIS E ACESSÍVEIS */}
                                <div className="grid grid-cols-[100px_1fr] gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Número *
                                        </label>
                                        <input 
                                            ref={numberRef}
                                            id="number-input"
                                            type="text" 
                                            name="number" 
                                            value={formData.number} 
                                            onChange={handleGenericInput} 
                                            placeholder="Ex: 123" 
                                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                                                errors.number 
                                                    ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' 
                                                    : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                                            }`} 
                                        />
                                        {errors.number && (
                                            <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-0.5">
                                                <AlertCircle className="w-3 h-3" /> Obrigatório
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Complemento (opcional)
                                        </label>
                                        <input 
                                            type="text" 
                                            name="complement" 
                                            value={formData.complement} 
                                            onChange={handleGenericInput} 
                                            placeholder="Apto, Bloco, Casa 2..." 
                                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. OPÇÃO DE FRETE */}
                            {shippingOptions.length > 0 && (
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">
                                            Forma de Envio
                                        </label>
                                        {shippingOptions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllShipping(!showAllShipping)}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                            >
                                                {showAllShipping ? 'Recolher' : 'Outras opções'}
                                                {showAllShipping ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        )}
                                    </div>

                                    {/* Opção Selecionada */}
                                    {(() => {
                                        const cheapestOption = [...shippingOptions].sort((a, b) => a.price - b.price)[0];
                                        const primaryOption = shippingOption || cheapestOption;
                                        const displayPrice = (freeShipping && primaryOption.id === cheapestOption.id) ? 0 : primaryOption.price;

                                        return (
                                            <div className="p-3 rounded-xl border-2 border-slate-900 bg-slate-50 flex items-center justify-between shadow-xs">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 uppercase">
                                                            {primaryOption.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                            Prazo de entrega: {primaryOption.days} dias úteis
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-black ${displayPrice === 0 ? 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md' : 'text-slate-900'}`}>
                                                    {displayPrice === 0 ? 'GRÁTIS' : formatPrice(displayPrice)}
                                                </span>
                                            </div>
                                        );
                                    })()}

                                    {/* Opções Alternativas */}
                                    {showAllShipping && shippingOptions
                                        .filter(opt => opt.id !== shippingOption?.id)
                                        .map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    setShippingOption(opt);
                                                    setShipping(opt.price);
                                                    setShowAllShipping(false);
                                                }}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between text-left text-xs transition-colors"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-800 uppercase">{opt.name}</p>
                                                    <p className="text-[10px] text-slate-500">{opt.days} dias úteis</p>
                                                </div>
                                                <span className="font-black text-slate-700">
                                                    {formatPrice(opt.price)}
                                                </span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}

                            {/* 4. TOTAIS & PRAZO ARTESANAL */}
                            <div className="bg-[#faf9f7] rounded-xl p-3 border border-slate-200 space-y-2.5">
                                
                                {/* Aviso do Prazo Artesanal */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                                    <span className="text-amber-700 text-xs mt-0.5">⏱️</span>
                                    <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
                                        <strong className="uppercase">Atenção:</strong> Peças sob encomenda com bordado artesanal exclusivo. O envio é realizado após o prazo de confecção de <strong>até 12 dias úteis</strong>.
                                    </p>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between items-center text-slate-600 font-bold">
                                        <span>Subtotal:</span>
                                        <span className="text-slate-900">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600 font-bold">
                                        <span>Frete:</span>
                                        <span className={shippingOption ? 'text-slate-900' : 'text-slate-400'}>
                                            {shippingOption 
                                                ? (actualShippingPrice === 0 ? 'GRÁTIS' : formatPrice(actualShippingPrice)) 
                                                : (formData.cep.length >= 8 ? 'Calculando...' : 'Digite o CEP')}
                                        </span>
                                    </div>

                                    {/* Dica de Frete Grátis */}
                                    {(() => {
                                        if (formData.state && !isStateEligible) {
                                            return (
                                                <p className="text-[10px] text-slate-500 font-semibold pt-1">
                                                    * Frete grátis acima de R$ 400 disponível para {FREE_SHIPPING_REGIONS_LABEL}.
                                                </p>
                                            );
                                        }
                                        if (isStateEligible && subtotal < FREE_SHIPPING_THRESHOLD) {
                                            const missing = FREE_SHIPPING_THRESHOLD - subtotal;
                                            return (
                                                <p className="text-[10px] text-amber-700 font-bold pt-1">
                                                    Faltam {formatPrice(missing)} para você ganhar Frete Grátis!
                                                </p>
                                            );
                                        }
                                        if (freeShipping) {
                                            return (
                                                <p className="text-[10px] text-emerald-700 font-bold pt-1 flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5" /> Você ganhou Frete Grátis para {formData.state}!
                                                </p>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="border-t border-slate-200 pt-2.5 mt-2 flex justify-between items-baseline">
                                        <div>
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                                                Valor Total
                                            </span>
                                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                                                Ambiente Seguro
                                            </span>
                                        </div>
                                        <span className="text-2xl font-black text-emerald-700 tracking-tight">
                                            {formatPrice(finalTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 5. BOTÃO PRINCIPAL DE PAGAMENTO — SEMPRE CLICÁVEL & RESPONSIVO NO CELULAR */}
                            <div className="space-y-2 pt-1">
                                {/* Aviso Legal / Termo de Tonalidade */}
                                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 flex items-start gap-2 text-[10px] leading-snug">
                                    <Palette className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                    <p>
                                        <strong className="text-amber-950 font-bold">Importante:</strong> Pequenas variações de tonalidade nas cores de tecidos e bordados podem ocorrer devido ao lote da matéria-prima e à tela de cada celular/computador.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={isProcessing}
                                    className="w-full bg-[#1a9e52] hover:bg-[#158043] active:scale-[0.98] text-white py-4 px-6 rounded-xl font-black text-base uppercase tracking-wider shadow-[0_4px_16px_rgba(26,158,82,0.35)] transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border border-[#158043]"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>PROCESSANDO PEDIDO...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="leading-none">PAGAR AGORA</span>
                                            <span className="text-[10px] text-white/90 font-medium normal-case tracking-normal">
                                                Pagamento Direto e Seguro via InfinitePay
                                            </span>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Seus dados estão protegidos com criptografia</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
