'use client';

import { useState } from 'react';
import { Truck, Check, Loader2, AlertCircle } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_REGIONS_LABEL, isEligibleForFreeShipping } from '@/lib/shipping-rules';

interface ShippingOption {
    id: number | string;
    name: string;
    price: number;
    days: number;
    carrier?: string;
}

interface ProductShippingCalculatorProps {
    productPrice: number;
}

export function ProductShippingCalculator({ productPrice }: ProductShippingCalculatorProps) {
    const [cep, setCep] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<ShippingOption[] | null>(null);
    const [userState, setUserState] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);
        if (val.length > 5) {
            val = `${val.slice(0, 5)}-${val.slice(5)}`;
        }
        setCep(val);
        setError(null);
        if (val.replace(/\D/g, '').length < 8) {
            setOptions(null);
        }
    };

    const calculateShipping = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const rawCep = cep.replace(/\D/g, '');
        if (rawCep.length !== 8) {
            setError('Digite o CEP completo com 8 números');
            return;
        }

        setLoading(true);
        setError(null);
        setOptions(null);

        try {
            // 1. Busca estado para verificação de frete grátis
            try {
                const cepRes = await fetch(`/api/viacep?cep=${rawCep}`);
                if (cepRes.ok) {
                    const cepData = await cepRes.json();
                    if (cepData?.uf) {
                        setUserState(cepData.uf.toUpperCase());
                    }
                }
            } catch {}

            // 2. Calcula opções de frete
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cep: rawCep, totalWeight: 0.8 })
            });

            if (!res.ok) throw new Error('Não foi possível calcular o frete para este CEP.');
            const data: ShippingOption[] = await res.json();
            setOptions(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao calcular frete. Verifique o CEP.');
        } finally {
            setLoading(false);
        }
    };

    const eligibleForFree = userState ? isEligibleForFreeShipping(userState) : false;
    const hasFreeShipping = eligibleForFree && productPrice >= FREE_SHIPPING_THRESHOLD;

    return (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf9f7] border border-line shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-charcoal uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-sage-green-dark shrink-0" />
                    Simular Frete e Prazo de Entrega
                </span>
                <a
                    href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 hover:text-charcoal underline"
                >
                    Não sei meu CEP
                </a>
            </div>

            <form onSubmit={calculateShipping} className="flex gap-2">
                <input
                    type="text"
                    inputMode="numeric"
                    value={cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-line rounded-xl outline-none focus:border-sage-green-dark focus:ring-1 focus:ring-sage-green-dark"
                />
                <button
                    type="submit"
                    disabled={loading || cep.replace(/\D/g, '').length !== 8}
                    className="px-4 py-2 bg-charcoal text-white hover:bg-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[80px]"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calcular'}
                </button>
            </form>

            {error && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                </p>
            )}

            {options && options.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-line/60">
                    {/* Selo de Frete Grátis se elegível */}
                    {hasFreeShipping ? (
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Parabéns! Este produto tem <strong>Frete Grátis</strong> para o seu CEP.</span>
                        </div>
                    ) : eligibleForFree && productPrice < FREE_SHIPPING_THRESHOLD ? (
                        <div className="text-[10px] text-amber-800 font-semibold bg-amber-50/70 p-2 rounded-lg border border-amber-200/50">
                            💡 Frete grátis em compras a partir de R$ 400 para {userState}!
                        </div>
                    ) : null}

                    <div className="space-y-1.5">
                        {options.map((opt) => {
                            const isCheapest = options.sort((a, b) => a.price - b.price)[0]?.id === opt.id;
                            const isFree = hasFreeShipping && isCheapest;
                            return (
                                <div
                                    key={opt.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-line/80 text-xs"
                                >
                                    <div>
                                        <p className="font-bold text-charcoal">{opt.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            Entrega em até {opt.days} dias úteis (após confecção)
                                        </p>
                                    </div>
                                    <span className="font-extrabold text-charcoal">
                                        {isFree ? (
                                            <span className="text-emerald-700 font-black uppercase bg-emerald-100 px-2 py-0.5 rounded">
                                                Grátis
                                            </span>
                                        ) : (
                                            `R$ ${opt.price.toFixed(2).replace('.', ',')}`
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
