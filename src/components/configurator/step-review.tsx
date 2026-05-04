'use client';

import { useCartStore } from '@/store/cart-store';
import { useConfiguratorStore } from '@/store/configurator-store';
import { COLORS, TYPES, BABADOS, PASSA_FITAS, RIBBON_COLORS } from '@/data/admin-options';
import { BASE_PRICES, formatPrice } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Zap, ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
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
                        <div className="space-y-2.5 shrink-0">
                            {/* Nomes */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">Nome Completo</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Seu nome" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-sage-green outline-none placeholder:text-black/25" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">WhatsApp</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInput} placeholder="(00) 00000-0000" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-sage-green outline-none placeholder:text-black/25" />
                                </div>
                            </div>

                            {/* CPF */}
                            <div className="w-1/2">
                                <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">CPF (Obrigatório p/ Nota Fiscal)</label>
                                <input type="text" name="cpf" value={formData.cpf} onChange={handleInput} placeholder="000.000.000-00" maxLength={14} className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-sage-green outline-none placeholder:text-black/25" />
                            </div>

                            {/* Endereço */}
                            <div className="grid grid-cols-[80px_1fr] gap-2">
                                <div>
                                    <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">CEP</label>
                                    <input type="text" name="cep" value={formData.cep} onChange={handleCepChange} maxLength={9} placeholder="00000-000" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-sage-green outline-none placeholder:text-black/25" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1 opacity-0">Status</label>
                                    <div className="min-h-[30px] flex items-center">
                                        {isLoadingAddress ? (
                                            <span className="text-[10px] text-sage-green-dark font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Buscando...</span>
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
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">Nº</label>
                                        <input type="text" name="number" value={formData.number} onChange={handleInput} placeholder="Ex: 123" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-sage-green outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">Complemento</label>
                                        <input type="text" name="complement" value={formData.complement} onChange={handleInput} placeholder="Apto, Bloco (Opcional)" className="w-full border border-black/15 rounded-lg px-2 py-1.5 text-xs focus:border-sage-green outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Totals Box */}
                        <div className="bg-[#faf9f7] rounded-lg p-3 border border-black/5 mt-2 shrink-0">
                            {addressLoaded && shippingOptions.length > 0 && (
                                <div className="space-y-1 mt-1 mb-2 border-b border-black/5 pb-2">
                                    <label className="block text-[8px] font-bold text-slate uppercase tracking-widest mb-1">Opções de Envio</label>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        {/* Render the selected or cheapest option as primary */}
                                        {(() => {
                                            const cheapestOption = [...shippingOptions].sort((a, b) => a.price - b.price)[0];
                                            const primaryOption = shippingOption || cheapestOption;
                                            const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                            const primaryDisplayPrice = ((total >= FREE_SHIPPING_THRESHOLD) && (primaryOption.id === cheapestOption.id) && isStateEligible) ? 0 : primaryOption.price;

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
                                                        <span className={`text-[10px] font-black shrink-0 ${primaryDisplayPrice === 0 ? 'text-green-600' : 'text-[#1f2937]'}`}>
                                                            {primaryDisplayPrice === 0 ? 'GRÁTIS' : formatPrice(primaryDisplayPrice)}
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
                                                const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                                // Grátis logic technically only applies to cheapest, but just in case we map it:
                                                const isCheapest = option.id === [...shippingOptions].sort((a, b) => a.price - b.price)[0]?.id;
                                                const displayPrice = ((total >= FREE_SHIPPING_THRESHOLD) && isCheapest && isStateEligible) ? 0 : option.price;
                                                
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
                                    <span className="text-[#1f2937]">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-start text-[10px] font-bold uppercase text-slate">
                                    <span className="pt-0.5">Frete {shippingOption ? `(${shippingOption.name} - ${shippingOption.days}d)` : ''}:</span>
                                    <div className="flex flex-col items-end">
                                        <span className={shippingOption ? 'text-[#1f2937]' : 'text-slate/60'}>
                                            {(() => {
                                                if (!shippingOption) return addressLoaded ? 'Indisponível' : 'A calcular';
                                                const isCheapest = shippingOption.id === [...shippingOptions].sort((a, b) => a.price - b.price)[0]?.id;
                                                const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                                const actualPrice = (total >= FREE_SHIPPING_THRESHOLD && isCheapest && isStateEligible) ? 0 : shippingOption.price;
                                                return actualPrice === 0 ? 'GRÁTIS' : formatPrice(actualPrice);
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                {(() => {
                                    const isStateEligible = isEligibleForFreeShipping(formData.state || '');
                                    if (!isStateEligible && addressLoaded) {
                                        return (
                                            <div className="text-[8px] text-slate/70 font-bold uppercase mb-1">
                                                Frete grátis disponível apenas para {FREE_SHIPPING_REGIONS_LABEL}
                                            </div>
                                        );
                                    }
                                    if (FREE_SHIPPING_THRESHOLD - total > 0 && isStateEligible) {
                                        return (
                                            <div className="text-[8px] text-amber-600 font-bold uppercase mb-1">
                                                Faltam apenas {formatPrice(FREE_SHIPPING_THRESHOLD - total)} para <span className="text-amber-700">Frete Grátis</span>!
                                            </div>
                                        );
                                    }
                                    if (total >= FREE_SHIPPING_THRESHOLD && isStateEligible) {
                                        return (
                                            <div className="text-[8px] text-[#1a9e52] font-bold uppercase mb-1">
                                                ✨ Você ganhou Frete Grátis!
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {discountPct > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold uppercase text-[#1a9e52]">
                                        <span>Desconto Kit:</span>
                                        <span>-{discountPct}% OFF</span>
                                    </div>
                                )}
                                <div className="border-t border-black/10 mt-2.5 pt-2.5 flex flex-col gap-2.5">
                                    <div className="bg-sage-green/10 border border-sage-green/30 rounded-lg p-2.5 flex justify-between items-center w-full shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/40 to-transparent blur-md transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                        
                                        <div className="flex flex-col text-left relative z-10">
                                            <span className="text-[10px] font-black text-sage-green-dark uppercase tracking-widest leading-none">Preço do Enxoval</span>
                                            <span className="text-[8.5px] font-black text-sage-green-dark uppercase bg-sage-green/20 px-1.5 py-0.5 mt-1 rounded shadow-sm inline-block w-max border border-sage-green/30">PAGAMENTO SEGURO</span>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <span className="text-xl font-black text-sage-green-dark leading-none tabular-nums tracking-tight">
                                                {formatPrice(total + (shippingOption ? shippingOption.price : 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-2 pt-1 shrink-0">
                            <button
                                onClick={previousStep}
                                disabled={isProcessing}
                                className="cursor-pointer w-12 h-12 flex items-center justify-center rounded-xl border-2 border-[#1f2937] text-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-all bg-white shadow-sm shrink-0 disabled:opacity-50"
                                title="Voltar"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={isProcessing || !formData.name || !formData.phone || !addressLoaded || !formData.number}
                                className="cursor-pointer flex-1 flex flex-col items-center justify-center gap-0.5
                                           bg-[#1a9e52] hover:bg-[#158043] text-white h-12 rounded-xl shadow-[0_4px_14px_rgba(26,158,82,0.3)]
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
