'use client';

import { X } from 'lucide-react';
import { useState, useMemo } from 'react';
import Image from 'next/image';

const CLOTHING_TYPES = ['BDC', 'BDL', 'MIJ', 'SHO'];

interface ProductPersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; color: string; observations: string; size?: string }) => void;
    productName: string;
    productImage: string;
    features?: string[];
}

export function ProductPersonalizationModal({
    isOpen,
    onClose,
    onConfirm,
    productName,
    productImage,
    features = []
}: ProductPersonalizationModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('Dourado');
    const [observations, setObservations] = useState('');
    const [size, setSize] = useState('');

    const needsSize = useMemo(() => {
        return features.some(f => {
            const match = f.match(/\d+x\s+(\w+)/);
            return match && CLOTHING_TYPES.includes(match[1]);
        });
    }, [features]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (needsSize && !size) return; // block submit without size
        onConfirm({ name, color, observations, ...(needsSize ? { size } : {}) });
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
                    <h3 className="font-bold text-lg text-charcoal">Personalize seu Produto</h3>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
                        <X className="h-5 w-5 text-slate" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Summary */}
                    <div className="flex items-center gap-4 bg-warm-stone/30 p-3 rounded-lg border border-line/50">
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                            <Image src={productImage} alt={productName} fill className="object-cover" />
                        </div>
                        <span className="font-medium text-sm text-charcoal">{productName}</span>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                                Nome para Bordar <span className="text-sage-green-dark">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Maria Alice"
                                className="w-full px-4 py-2 rounded-lg border border-line focus:ring-2 focus:ring-sage-green focus:border-sage-green outline-none transition-all"
                            />
                        </div>

                        {/* Size Selector — only for kits with clothing */}
                        {needsSize && (
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1.5">
                                    Tamanho da Roupinha <span className="text-sage-green-dark">*</span>
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
                                    <p className="text-[11px] text-sage-green-dark mt-1 font-medium">Selecione o tamanho para continuar</p>
                                )}
                            </div>
                        )}

                        {/* Hardcoded Information about Colors */}
                        <div className="bg-warm-stone/50 p-3 rounded-lg border border-line">
                            <span className="block text-sm font-bold text-charcoal mb-1">
                                Cores do Bordado e Tecido:
                            </span>
                            <span className="text-xs text-slate">
                                Por ser uma peça avulsa/kit pronto, manteremos o padrão de cores <b>idêntico ao da foto selecionada</b> para combinar perfeitamente.
                            </span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                                Observações (Opcional)
                            </label>
                            <textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Algum detalhe especial?"
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-line focus:ring-2 focus:ring-sage-green outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={needsSize && !size}
                            className={`w-full py-3 rounded-full font-extrabold shadow-soft flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                                needsSize && !size
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-sage-green hover:bg-[#9cbd9f] text-charcoal'
                            }`}
                        >
                            CONFIRMAR E FINALIZAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
