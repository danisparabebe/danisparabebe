'use client';

import { Check } from 'lucide-react';

interface StepItemsProps {
    data: {
        items: string[];
    };
    onUpdate: (data: Partial<{ items: string[] }>) => void;
}

const AVAILABLE_ITEMS = [
    { id: 'manta', name: 'Manta Bordada', price: 189.90, desc: 'Tamanho 90x90cm, forrada.' },
    { id: 'fralda-grande', name: 'Fralda Grande', price: 45.90, desc: '70x70cm, acabamento luxo.' },
    { id: 'fralda-pequena', name: 'Fralda de Boca', price: 25.90, desc: '35x35cm, kit com 3.' },
    { id: 'toalha', name: 'Toalha de Banho', price: 129.90, desc: 'Com capuz bordado, forrada.' },
    { id: 'body', name: 'Body Personalizado', price: 59.90, desc: '100% Algodão Pima.' },
    { id: 'touca', name: 'Touca', price: 39.90, desc: 'Malha macia para recém-nascido.' },
    { id: 'faixa', name: 'Faixa de Cabelo', price: 29.90, desc: 'Seda macia, não aperta.' },
];

export function StepItems({ data, onUpdate }: StepItemsProps) {
    const toggleItem = (id: string) => {
        const currentItems = data.items || [];
        if (currentItems.includes(id)) {
            onUpdate({ items: currentItems.filter(i => i !== id) });
        } else {
            onUpdate({ items: [...currentItems, id] });
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal mb-2 font-heading">
                    Monte seu Kit
                </h2>
                <p className="text-slate text-sm">
                    Selecione os itens que farão parte do enxoval.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_ITEMS.map((item) => {
                    const isSelected = data.items.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'border-dusty-rose bg-surface-white shadow-soft'
                                    : 'border-transparent bg-white shadow-sm hover:border-dusty-rose/30'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-heading font-medium text-lg text-charcoal">{item.name}</h3>
                                    <p className="text-sm text-slate mt-1">{item.desc}</p>
                                    <p className="text-dusty-rose font-bold mt-2">R$ {item.price.toFixed(2)}</p>
                                </div>
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${isSelected ? 'bg-dusty-rose border-dusty-rose' : 'border-line'
                                    }`}>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
