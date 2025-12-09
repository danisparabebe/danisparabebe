'use client';

import { useState } from 'react';
import { Pencil, Play, Wand2 } from 'lucide-react';

interface StepNameAndDesignProps {
    data: {
        babyName: string;
        theme: string;
    };
    onUpdate: (data: Partial<{ babyName: string; theme: string }>) => void;
}

const THEMES = [
    { id: 'urso', name: 'Urso Clássico', icon: '🐻' },
    { id: 'leao', name: 'Leãozinho', icon: '🦁' },
    { id: 'jardim', name: 'Jardim Encantado', icon: '🌸' },
    { id: 'nuvem', name: 'Chuva de Amor', icon: '☁️' },
    { id: 'coroa', name: 'Prícipe/Princesa', icon: '👑' },
    { id: 'safari', name: 'Safari', icon: '🦒' },
];

export function StepNameAndDesign({ data, onUpdate }: StepNameAndDesignProps) {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-charcoal mb-2 font-heading">
                    Vamos começar pelo mais especial
                </h2>
                <p className="text-slate text-sm">
                    Escolha o tema e digite o nome do bebê com carinho.
                    <br />
                    <span className="text-dusty-rose font-bold">Atenção: Verifique a grafia, não realizamos trocas por erro de digitação.</span>
                </p>
            </div>

            <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-soft border border-line">
                <label className="block text-sm font-medium text-charcoal mb-2">
                    Nome do Bebê
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={data.babyName}
                        onChange={(e) => onUpdate({ babyName: e.target.value })}
                        placeholder="Ex: Maria Alice"
                        className="w-full px-4 py-3 rounded-lg border border-line focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose outline-none transition-all pl-10 font-heading text-lg"
                    />
                    <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate/50" />
                </div>
                {data.babyName && (
                    <div className="mt-4 p-4 bg-dusty-rose/10 rounded-lg text-center">
                        <p className="text-sm text-slate mb-1">Prévia do Bordado</p>
                        <p className="font-heading text-3xl text-dusty-rose italic">
                            {data.babyName}
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-center text-lg font-medium text-charcoal">Escolha um Tema</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => onUpdate({ theme: theme.id })}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${data.theme === theme.id
                                    ? 'border-dusty-rose bg-dusty-rose text-white shadow-lg scale-105'
                                    : 'border-line bg-white hover:border-dusty-rose hover:scale-105'
                                }`}
                        >
                            <span className="text-3xl">{theme.icon}</span>
                            <span className={`text-sm font-medium ${data.theme === theme.id ? 'text-white' : 'text-slate'}`}>
                                {theme.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
