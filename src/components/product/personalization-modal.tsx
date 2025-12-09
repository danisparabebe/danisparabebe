'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ProductPersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; color: string; observations: string }) => void;
    productName: string;
    productImage: string;
}

export function ProductPersonalizationModal({
    isOpen,
    onClose,
    onConfirm,
    productName,
    productImage
}: ProductPersonalizationModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('Dourado');
    const [observations, setObservations] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ name, color, observations });
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
                                Nome para Bordar <span className="text-dusty-rose">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Maria Alice"
                                className="w-full px-4 py-2 rounded-lg border border-line focus:ring-2 focus:ring-dusty-rose focus:border-dusty-rose outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                                Cor do Bordado
                            </label>
                            <select
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-line focus:ring-2 focus:ring-dusty-rose outline-none bg-white"
                            >
                                <option value="Dourado">Dourado (Padrão Luxo)</option>
                                <option value="Rosa Bebê">Rosa Bebê</option>
                                <option value="Rosa Antigo">Rosa Antigo</option>
                                <option value="Azul Marinho">Azul Marinho</option>
                                <option value="Azul Bebê">Azul Bebê</option>
                                <option value="Cinza Prata">Cinza Prata</option>
                                <option value="Branco">Branco</option>
                            </select>
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
                                className="w-full px-4 py-2 rounded-lg border border-line focus:ring-2 focus:ring-dusty-rose outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-dusty-rose hover:bg-deep-rose text-white py-3 rounded-full font-bold shadow-soft flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            CONFIRMAR E FINALIZAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
