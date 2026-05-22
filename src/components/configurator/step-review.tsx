'use client';

import { useCartStore } from '@/store/cart-store';
import { useConfiguratorStore } from '@/store/configurator-store';
import { COLORS, TYPES, BABADOS, PASSA_FITAS, RIBBON_COLORS } from '@/data/admin-options';
import { BASE_PRICES, formatPrice } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Zap, ShieldCheck, Loader2, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import Image from 'next/image';
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_REGIONS_LABEL, isEligibleForFreeShipping } from '@/lib/shipping-rules';

const getItemLabel = (id: string) => TYPES.find(t => t.value === id)?.label || id;
const getColorLabel = (id: string) => COLORS.find(c => c.value === id)?.label || id;

export function StepReview() {
    const store = useConfiguratorStore();
    const { addItem, openCart } = useCartStore();
    const router = useRouter();

    const {
        babyName, selectedThemeName, selectedEmbroideryPhoto,
        acabamentoColor, passafitaColor, observations,
        itemQuantities, getTotalPrice, previousStep, reset, getDiscountPercentage,
    } = store;

    const total = getTotalPrice();
    const discountPct = getDiscountPercentage();
    const items = Object.entries(itemQuantities).filter(([, q]) => q > 0);
    const colorLabel = getColorLabel(acabamentoColor);

    const babadoImg = BABADOS.find(b => b.id === acabamentoColor)?.img;
    const passafitaImg = PASSA_FITAS.find(p => p.id === passafitaColor)?.img;
    const passafitaCode = RIBBON_COLORS.find(r => r.label === passafitaColor)?.value;

    const [formData, setFormData] = useState({
        name: '', phone: '', cpf: '', cep: '',
        street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
    });
    const [addressLoaded, setAddressLoaded] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingOption, setShippingOption] = useState<any | null>(null);
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [showAllShipping, setShowAllShipping] = useState(false);

    // --- CACHE ON MOUNT ---
    useEffect(() => {
        const cached = localStorage.getItem('checkout_form');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                setFormData(data);
                if (data.street) setAddressLoaded(true);
                if (data.cep && data.cep.replace(/\D/g, '').length === 8) {
                    handleCepLookup(data.cep); // Auto-fetch shipping
                }
            } catch (e) {}
        }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        localStorage.setItem('checkout_form', JSON.stringify(newData));
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
        
        const newData = { ...formData, cep: v };
        setFormData(newData);
        localStorage.setItem('checkout_form', JSON.stringify(newData));

        if (v.replace(/\D/g, '').length === 8) {
            handleCepLookup(v);
        }
    };

    const handleCepLookup = async (cepStr: string) => {
        const clean = cepStr.replace(/\D/g, '');
        if (clean.length !== 8) return;
        
        setIsLoadingAddress(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
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
                
                // Fetch shipping naturally
                const shipRes = await fetch('/api/shipping', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cep: clean }) 
                });
                if (shipRes.ok) {
                    const shipData = await shipRes.json();
                    if (Array.isArray(shipData) && shipData.length > 0) {
                        setShippingOptions(shipData);
                        const cheapest = [...shipData].sort((a: any, b: any) => a.price - b.price)[0];
                        setShippingOption(cheapest);
                    } else {
                        setShippingOption(null);
                        setShippingOptions([]);
                        toast.info('Frete não disponível para este CEP.');
                    }
                }
            } else {
                toast.error('CEP não encontrado.');
                setAddressLoaded(false);
                setShippingOption(null);
            }
        } catch { 
            /* silent */ 
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const passafitaLabel = PASSA_FITAS.find(p => p.id === passafitaColor)?.label || passafitaColor;

    const buildCartItems = () => {
        // Build all items first, then set them all at once (atomic update)
        const newCartItems = items.map(([id, qty]) => {
            const basePrice = BASE_PRICES[id];
            const discountedPrice = basePrice * (1 - discountPct / 100);

            return {
                id: `kit-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                productId: `custom-${id}`,
                name: `${getItemLabel(id)} — Personalizado`,
                price: discountedPrice,
                image: selectedEmbroideryPhoto || '/Logos/Logomarca%20Rose.png',
                quantity: qty,
                personalization: {
                    name: babyName || undefined,
                    theme: selectedThemeName || undefined,
                    color: colorLabel,
                    finishDetail: passafitaLabel || undefined,
                    observations: observations || undefined,
                },
            };
        });

        useCartStore.setState({ items: newCartItems });
    };

    const handleCart = () => {
        buildCartItems();
        toast.success('Kit adicionado ao carrinho!');
        reset(); openCart(); router.push('/');
    };

    const handleBuyNow = async () => {
        if (!formData.name || !formData.phone || !addressLoaded || !formData.number) {
            toast.error('Preencha os dados de entrega antes de prosseguir.');
            return;
        }

        buildCartItems();
        const { items } = useCartStore.getState();

        setIsProcessing(true);
        const loadingToast = toast.loading('Preparando pagamento seguro...');
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items,
                    shipping: shippingOption ? shippingOption.price : 0,
                    customer: formData,
                    cancelPath: '/monte-seu-kit'
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Falha ao iniciar pagamento');
            if (data.url) {
                toast.success('Redirecionando...', { id: loadingToast });
                localStorage.setItem('lastOrder', JSON.stringify({ items, customer: formData }));
                window.location.href = data.url;
            } else {
                throw new Error('URL nao gerada.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro. Tente novamente.', { id: loadingToast });
            setIsProcessing(false);
        }
    };

    // Format Observation
    const detailObs = observations;

    return (
        <div className="max-w-5xl mx-auto space-y-4 pb-4">
            {/* Split Layout Container */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">

                {/* ─── LEFT COLUMN: PRODUCT DETAILS ─── */}
                <div className="w-full md:w-1/2 flex flex-col bg-white border-2 border-[#1f2937] rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)]">
                    
                    {/* Header */}
                    <div className="p-3 border-b border-black/10 bg-[#faf9f7] rounded-t-xl shrink-0">
                        <h2 className="text-lg font-heading font-black text-[#1f2937] tracking-tight uppercase leading-none">Seu Kit</h2>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                            <span className="font-bold text-slate uppercase tracking-widest">Tema:</span>
                            <span className="font-black text-[#1f2937]">{selectedThemeName || '—'}</span>
                            <span className="text-slate/30 mx-0.5">|</span>
                            <span className="font-bold text-slate uppercase tracking-widest">Ref. Bordado:</span>
                            <span className="font-black text-[#1f2937] truncate">
                                {(() => {
                                    if (!selectedEmbroideryPhoto) return 'SEM BORDADO';
                                    try {
                                        const urlObj = new URL(selectedEmbroideryPhoto, 'http://localhost');
                                        const fileParam = urlObj.searchParams.get('file') || selectedEmbroideryPhoto.split('/').pop() || '';
                                        const cleanName = decodeURIComponent(fileParam).replace(/_01\.(jpeg|jpg|png|webp)$/i, '').replace(/\.(jpeg|jpg|png|webp|JPG|PNG)$/i, '').trim().toUpperCase();
                                        return passafitaCode ? `${cleanName}-${passafitaCode}` : cleanName;
                                    } catch (e) {
                                        const fallback = selectedEmbroideryPhoto.split('/').pop()?.replace(/\.[^/.]+$/, '').toUpperCase() || 'ERRO';
                                        return passafitaCode ? `${fallback}-${passafitaCode}` : fallback;
                                    }
                                })()}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                        {/* Images Row */}
                        <div className="flex gap-2 shrink-0 h-44 sm:h-52">
                            {/* Foto do Bordado */}
                            <div className="relative flex-1 rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center p-2">
                                {selectedEmbroideryPhoto ? (
                                    <Image src={selectedEmbroideryPhoto} alt="Bordado Principal" fill className="object-contain p-2" />
                                ) : (
                                    <span className="text-slate/50 font-bold uppercase text-[9px]">Sem bordado</span>
                                )}
                            </div>
                            {/* Babado & Passa-Fita (Detalhes com labels) */}
                            <div className="w-[95px] flex flex-col gap-2 shrink-0">
                                <div className="flex flex-col flex-1 gap-0.5">
                                    <p className="text-[8px] font-black text-[#1f2937] uppercase tracking-wider text-center leading-none">Babado<br/><span className="text-sage-green-dark">{colorLabel}</span></p>
                                    <div className="relative w-full flex-1 rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center">
                                        {babadoImg ? (
                                            <Image src={babadoImg} alt="Babado" fill className="object-contain" />
                                        ) : (
                                            <span className="text-slate/40 text-[8px] font-bold uppercase">S/ Foto</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 gap-0.5">
                                    <p className="text-[8px] font-black text-[#1f2937] uppercase tracking-wider text-center leading-none">Passa-Fita<br/><span className="text-dusty-rose">{passafitaLabel}</span></p>
                                    <div className="relative w-full flex-1 rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center">
                                        {passafitaImg ? (
                                            <Image src={passafitaImg} alt="Passa-Fita" fill className="object-contain" />
                                        ) : (
                                            <span className="text-slate/40 text-[8px] font-bold uppercase">S/ Foto</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nome do Bebê — FULL WIDTH BAND */}
                        <div className="bg-white p-4 rounded-lg border-[3px] border-[#1f2937] relative overflow-hidden shrink-0 text-center shadow-sm">
                            <p className="text-[8px] font-bold text-[#1f2937] uppercase tracking-[0.25em] leading-none mb-2">Nome a Bordar</p>
                            <p className="text-4xl sm:text-5xl font-black text-[#1f2937] font-heading leading-none truncate tracking-tight">{babyName || 'SEM NOME'}</p>
                            {babyName && (
                                <div className="absolute top-0 right-0 bg-[#1f2937] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-bl-lg tracking-widest shadow-sm">
                                    Confirmado
                                </div>
                            )}
                        </div>

                        {/* Obs Placeholder */}
                        <div className="shrink-0 bg-white">
                            <p className="text-[9px] font-bold text-slate uppercase tracking-widest leading-none mb-1">Observações do Cliente</p>
                            {detailObs && (
                                <div className="bg-amber-50 border border-amber-300 p-2 rounded mb-1 flex items-start gap-1.5">
                                    <span className="text-amber-800 text-xs">⚠</span>
                                    <p className="text-[10px] font-bold text-amber-950 uppercase leading-snug">{detailObs}</p>
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Clique para adicionar ou alterar observações..."
                                value={observations}
                                onChange={(e) => store.setObservations(e.target.value)}
                                className="w-full border border-black/10 rounded-lg px-2 py-1.5 text-[10px] text-[#1f2937] focus:border-sage-green focus:ring-1 focus:ring-sage-green/30 outline-none placeholder:text-black/30"
                            />
                        </div>

                        {/* Items Table */}
                        <div className="flex-1 min-h-[100px] border-t border-black/5 pt-2">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[9px] font-bold text-slate uppercase tracking-widest">Peças Selecionadas</p>
                                <span className="bg-[#1f2937] text-white text-[9px] font-black px-1.5 py-0.5 rounded">{items.reduce((s, [, q]) => s + q, 0)}</span>
                            </div>
                            <div className="overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                                <table className="w-full text-[10px]">
                                    <tbody>
                                        {items.map(([id, qty]) => {
                                            const unPrice = BASE_PRICES[id] * (1 - discountPct / 100);
                                            return (
                                                <tr key={id} className="border-b border-black/5 last:border-0">
                                                    <td className="py-1 w-6"><span className="bg-slate-100 text-slate font-bold px-1 py-0.5 rounded">{qty}x</span></td>
                                                    <td className="py-1 font-semibold text-[#1f2937]">{getItemLabel(id)}</td>
                                                    <td className="py-1 text-right font-bold text-[#1f2937] w-16">{formatPrice(unPrice * qty)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: CHECKOUT & CTAs ─── */}
                <div className="w-full md:w-1/2 flex flex-col bg-white border-2 border-[#1f2937] rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)]">
                    
                    {/* Header */}
                    <div className="p-3 border-b border-black/10 bg-[#faf9f7] rounded-t-xl shrink-0 flex items-center justify-between">
                        <h2 className="text-lg font-heading font-black text-[#1f2937] tracking-tight uppercase leading-none">Entrega & Pagamento</h2>
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>

                    <div className="p-3 flex-1 flex flex-col gap-3 justify-between">
                        
                        {/* Form Area */}

                        <div className="flex flex-col gap-4">
                            <h3 className="font-fraunces text-xl text-[#1f2937] border-b-2 border-black/5 pb-2">Entrega & Contato</h3>

                            <div className="grid grid-cols-1 gap-3">
                                <input type="text" name="name" value={formData.name || ''} onChange={handleInput} placeholder="Nome Completo" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937] placeholder:text-slate/40 shadow-sm" />
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInput} placeholder="WhatsApp" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937] placeholder:text-slate/40 shadow-sm" />
                                    <input type="text" name="cpf" value={formData.cpf || ''} onChange={handleInput} placeholder="CPF" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937] placeholder:text-slate/40 shadow-sm" />
                                </div>

                                <div className="relative">
                                    <input 
                                        type="text" name="cep" value={formData.cep || ''} onChange={handleCepChange} 
                                        maxLength={9} placeholder="CEP" 
                                        className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937] placeholder:text-slate/40 shadow-sm" 
                                    />
                                    {isLoadingAddress && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 text-sage-green animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {addressLoaded && (
                                    <div className="grid grid-cols-1 gap-3">
                                        <input type="text" name="street" value={formData.street || ''} onChange={handleInput} placeholder="Rua" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937]" />
                                        <div className="grid grid-cols-3 gap-3">
                                            <input type="text" name="number" value={formData.number || ''} onChange={handleInput} placeholder="Número" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937]" />
                                            <input type="text" name="complement" value={formData.complement || ''} onChange={handleInput} placeholder="Complemento" className="col-span-2 w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" name="neighborhood" value={formData.neighborhood || ''} onChange={handleInput} placeholder="Bairro" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937]" />
                                            <div className="flex gap-2">
                                                <input type="text" name="city" value={formData.city || ''} onChange={handleInput} placeholder="Cidade" className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937]" />
                                                <input type="text" name="state" value={formData.state || ''} onChange={handleInput} placeholder="UF" maxLength={2} className="w-16 text-sm bg-white border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 transition-all font-medium text-[#1f2937] uppercase text-center" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {addressLoaded && shippingOptions.length > 0 && (
                            <div className="bg-white border-2 border-black/5 rounded-xl p-3 md:p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Truck className="w-4 h-4 text-sage-green" />
                                    <span className="font-bold text-xs text-[#1f2937] uppercase tracking-widest">Opções de Envio</span>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    {(() => {
                                        const cheapestOption = [...shippingOptions].sort((a, b) => (a.price || 0) - (b.price || 0))[0];
                                        const primaryOption = shippingOption || cheapestOption;
                                        if (!primaryOption) return null;
                                        
                                        const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                        const isCheapestPrimary = primaryOption.id === cheapestOption?.id;
                                        const primaryDisplayPrice = ((total >= (FREE_SHIPPING_THRESHOLD || 99999)) && isCheapestPrimary && isStateEligible) ? 0 : (primaryOption.price || 0);

                                        return (
                                            <button
                                                type="button"
                                                onClick={() => !showAllShipping ? setShowAllShipping(true) : null}
                                                className={`relative w-full text-left flex flex-col justify-between p-3 rounded-lg border-2 transition-all ${
                                                    !showAllShipping ? 'border-sage-green bg-sage-green/5 shadow-sm' : 'border-black/5 bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center border-sage-green`}>
                                                        <div className="w-2 h-2 rounded-full bg-sage-green" />
                                                    </div>
                                                    <p className="font-bold text-[#1f2937] uppercase truncate">{primaryOption.name || 'Envio'}</p>
                                                    {primaryDisplayPrice === 0 && (
                                                        <span className="ml-2 bg-[#1a9e52] text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider shadow-sm uppercase">Grátis</span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-end pl-6">
                                                    <p className="text-[10px] font-medium text-slate uppercase pr-1">Prazo: {primaryOption.days || '-'} dias úteis</p>
                                                    <span className={`text-xs font-black shrink-0 ${primaryDisplayPrice === 0 ? 'text-[#1a9e52]' : 'text-[#1f2937]'}`}>
                                                        {primaryDisplayPrice === 0 ? 'GRÁTIS' : formatPrice(primaryDisplayPrice)}
                                                    </span>
                                                </div>
                                                {!showAllShipping && shippingOptions.length > 1 && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white rounded-full shadow-sm border border-black/5">
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })()}

                                    {showAllShipping && shippingOptions
                                        .filter(option => option !== shippingOption && option !== [...shippingOptions].sort((a, b) => (a.price||0) - (b.price||0))[0])
                                        .sort((a, b) => (a.price || 0) - (b.price || 0))
                                        .map((option, idx) => {
                                            const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                            const isCheapest = option === [...shippingOptions].sort((a, b) => (a.price||0) - (b.price||0))[0];
                                            const displayPrice = ((total >= (FREE_SHIPPING_THRESHOLD || 99999)) && isCheapest && isStateEligible) ? 0 : (option.price || 0);

                                            return (
                                                <button
                                                    key={option.id || `ship-${idx}`}
                                                    type="button"
                                                    onClick={() => { setShippingOption(option); setShowAllShipping(false); }}
                                                    className="w-full text-left flex flex-col justify-between p-3 rounded-lg border-2 border-black/5 bg-white hover:border-sage-green/50 hover:bg-sage-green/5 transition-all"
                                                >
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="shrink-0 w-4 h-4 rounded-full border-2 border-slate-300" />
                                                        <p className="font-bold text-[#1f2937] uppercase truncate">{option.name || 'Envio'}</p>
                                                    </div>
                                                    <div className="flex justify-between items-end pl-6">
                                                        <p className="text-[10px] font-medium text-slate uppercase pr-1">Prazo: {option.days || '-'} dias úteis</p>
                                                        <span className="text-xs font-black text-[#1f2937] shrink-0">
                                                            {formatPrice(displayPrice)}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t-2 border-black/5 flex flex-col gap-3">
                        <div className="bg-[#1f2937] rounded-xl p-4 shadow-md text-white">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-white/80">
                                <span>Subtotal Enxoval</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            
                            {shippingOption && (
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-white/80">
                                    <span>Frete</span>
                                    <span>{(() => {
                                        const cheapestOption = [...shippingOptions].sort((a, b) => (a.price||0) - (b.price||0))[0];
                                        const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                        const isCheapestPrimary = shippingOption.id === cheapestOption?.id;
                                        if ((total >= (FREE_SHIPPING_THRESHOLD || 99999)) && isCheapestPrimary && isStateEligible) return 'GRÁTIS';
                                        return formatPrice(shippingOption.price || 0);
                                    })()}</span>
                                </div>
                            )}

                            <div className="h-px bg-white/20 w-full my-3" />
                            
                            <div className="flex justify-between items-end">
                                <span className="font-black text-sm uppercase tracking-widest text-sage-green">Total</span>
                                <span className="text-2xl font-black tabular-nums tracking-tight">
                                    {(() => {
                                        let finalShipping = 0;
                                        if (shippingOption) {
                                            const cheapestOption = [...shippingOptions].sort((a, b) => (a.price||0) - (b.price||0))[0];
                                            const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                            const isCheapestPrimary = shippingOption.id === cheapestOption?.id;
                                            if (!((total >= (FREE_SHIPPING_THRESHOLD || 99999)) && isCheapestPrimary && isStateEligible)) {
                                                finalShipping = shippingOption.price || 0;
                                            }
                                        }
                                        return formatPrice(total + finalShipping);
                                    })()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={previousStep}
                                disabled={isProcessing}
                                className="cursor-pointer shrink-0 w-14 h-14 bg-white border-2 border-black/5 hover:bg-slate-50 text-slate rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isProcessing || !formData.name || !formData.phone || !addressLoaded || !formData.number}
                                className="cursor-pointer flex-1 flex flex-col items-center justify-center gap-0.5 bg-[#1a9e52] hover:bg-[#158043] text-white h-14 rounded-xl shadow-[0_4px_14px_rgba(26,158,82,0.3)] transition-all duration-200 uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed border border-[#158043]/50"
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
                                className="cursor-pointer w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-sage-green-dark text-sage-green-dark hover:bg-sage-green hover:text-charcoal transition-all shadow-sm shrink-0 disabled:opacity-50"
                                title="Add ao Carrinho e Continuar"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
