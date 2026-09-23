'use client';

import { X, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { extractThemeAndColor } from '@/lib/product-helper';

const CLOTHING_TYPES = ['BDC', 'BDL', 'MIJ', 'SHO'];

interface ProductPersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        name: string;
        theme?: string;
        color?: string;
        observations: string;
        size?: string;
    }) => void;
    productName: string;
    productImage: string;
    features?: string[];
    productId?: string;
}

export function ProductPersonalizationModal({
    isOpen,
    onClose,
    onConfirm,
    productName,
    productImage,
    features = [],
    productId = '',
}: ProductPersonalizationModalProps) {
    const [name, setName] = useState('');
    const [observations, setObservations] = useState('');
    const [size, setSize] = useState('');

    // Extrai automaticamente o Tema e a Cor pré-configurados do produto
    const { theme, color } = useMemo(() => {
        return extractThemeAndColor(productId, productName);
    }, [productId, productName]);

    const needsSize = useMemo(() => {
        return features.some(f => {
            const match = f.match(/\d+x\s+(\w+)/);
            return match && CLOTHING_TYPES.includes(match[1]);
        });
    }, [features]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (needsSize && !size) return;
        onConfirm({
            name,
            theme,
            color,
            observations,
            ...(needsSize ? { size } : {})
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-line bg-warm-stone/50">
                    <h3 className="font-bold text-lg text-charcoal flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-dusty-rose" />
                        Personalize seu Produto
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Resumo do Produto */}
                    <div className="flex items-center gap-4 bg-warm-stone/30 p-3 rounded-xl border border-line/60">
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-line">
                            <Image src={productImage} alt={productName} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-charcoal leading-snug">{productName}</span>
                            <span className="text-[11px] text-slate mt-0.5">Produção sob encomenda com bordado personalizado</span>
                        </div>
                    </div>

                    {/* Informações Pré-configuradas de Tema e Cor */}
                    <div className="bg-[#FAF9F8] p-3.5 rounded-xl border border-line flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Tema do Bordado</span>
                            <span className="font-bold text-charcoal text-sm">{theme}</span>
                        </div>
                        <div className="h-7 w-px bg-line" />
                        <div>
                            <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Cor Principal do Kit</span>
                            <span className="font-bold text-charcoal text-sm">{color}</span>
                        </div>
                    </div>

                    {/* Inputs de Personalização */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-charcoal mb-1">
                                Nome para Bordar <span className="text-dusty-rose">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Maria Alice ou João Pedro"
                                className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-sage-green focus:border-sage-green outline-none transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Seletor de Tamanho para Roupinhas */}
                        {needsSize && (
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-1.5">
                                    Tamanho da Roupinha <span className="text-dusty-rose">*</span>
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'P', label: 'P', sub: '0-3 meses' },
                                        { value: 'M', label: 'M', sub: '3-6 meses' },
                                        { value: 'G', label: 'G', sub: '6-9 meses' },
                                    ].map(opt => (
                                        <button
                                            type="button"
                                            key={opt.value}
                                            onClick={() => setSize(opt.value)}
                                            className={`flex-1 py-2.5 rounded-xl border-2 text-center transition-all font-bold ${
                                                size === opt.value
                                                    ? 'border-sage-green-dark bg-sage-green/10 text-sage-green-dark shadow-sm'
                                                    : 'border-line bg-white text-slate hover:border-sage-green/40'
                                            }`}
                                        >
                                            <span className="text-base block">{opt.label}</span>
                                            <span className="text-[10px] font-normal block mt-0.5 opacity-70">{opt.sub}</span>
                                        </button>
                                    ))}
                                </div>
                                {!size && (
                                    <p className="text-[11px] text-dusty-rose mt-1 font-medium">Selecione o tamanho para continuar</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-charcoal mb-1">
                                Observações do Pedido (Opcional)
                            </label>
                            <textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Ex: Sem laços na fralda pequena..."
                                rows={2}
                                className="w-full px-4 py-2 rounded-xl border border-line focus:ring-2 focus:ring-sage-green outline-none transition-all resize-none text-xs"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={needsSize && !size}
                            className={`w-full py-3.5 rounded-xl font-extrabold shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                                needsSize && !size
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-sage-green hover:bg-[#9cbd9f] text-charcoal'
                            }`}
                        >
                            CONFIRMAR PERSONALIZAÇÃO
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
