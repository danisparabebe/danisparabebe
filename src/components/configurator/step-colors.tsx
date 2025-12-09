'use client';

interface StepColorsProps {
    data: {
        finishingColor: string;
    };
    onUpdate: (data: Partial<{ finishingColor: string }>) => void;
}

const COLORS = [
    { id: 'rosa-bebe', name: 'Rosa Bebê', hex: '#FFC0CB' },
    { id: 'rosa-antigo', name: 'Rosa Antigo', hex: '#D6A6A6' },
    { id: 'azul-bebe', name: 'Azul Bebê', hex: '#ADD8E6' },
    { id: 'azul-marinho', name: 'Azul Marinho', hex: '#000080' },
    { id: 'bege', name: 'Bege Clássico', hex: '#F5F5DC' },
    { id: 'verde-agua', name: 'Verde Água', hex: '#90EE90' },
    { id: 'cinza', name: 'Cinza', hex: '#808080' },
    { id: 'dourado', name: 'Detalhes Dourados', hex: '#FFD700' },
];

export function StepColors({ data, onUpdate }: StepColorsProps) {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal mb-2 font-heading">
                    O Toque Final
                </h2>
                <p className="text-slate text-sm">
                    Escolha a cor principal para os acabamentos, laços e bordados.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
                {COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => onUpdate({ finishingColor: color.id })}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${data.finishingColor === color.id
                                ? 'bg-white shadow-soft ring-2 ring-dusty-rose scale-105'
                                : 'hover:bg-white/50'
                            }`}
                    >
                        <div
                            className="w-16 h-16 rounded-full shadow-sm border-2 border-white ring-1 ring-line group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.hex }}
                        />
                        <span className={`text-sm font-medium ${data.finishingColor === color.id ? 'text-dusty-rose' : 'text-slate'
                            }`}>
                            {color.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
