'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { baseItems } from '@/data/configurator-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function StepItems() {
    const { selectedItems, toggleItem, nextStep } = useConfiguratorStore();

    const isSelected = (itemId: string) => {
        return selectedItems.some(item => item.id === itemId);
    };

    const canProceed = selectedItems.length > 0;

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-semibold text-charcoal">
                    Escolha os Itens do Enxoval
                </h2>
                <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto">
                    Selecione um ou mais itens para compor o enxoval personalizado do seu bebê
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {baseItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                    >
                        <Card
                            className={`cursor-pointer transition-all duration-300 overflow-hidden border-2 rounded-callisto ${isSelected(item.id)
                                    ? 'ring-2 ring-dusty-rose shadow-hover bg-surface-white border-dusty-rose'
                                    : 'hover:shadow-soft bg-surface-white border-line hover:border-dusty-rose/50'
                                }`}
                            onClick={() => toggleItem(item)}
                        >
                            {isSelected(item.id) && (
                                <div className="absolute top-4 right-4 bg-dusty-rose text-white rounded-full p-2 z-10 shadow-soft">
                                    <Check className="h-5 w-5" />
                                </div>
                            )}

                            <div className="aspect-[3/4] bg-warm-stone flex items-center justify-center">
                                <div className="text-7xl">👶</div>
                            </div>

                            <div className="p-6 space-y-2">
                                <h3 className="font-semibold text-xl text-charcoal">{item.name}</h3>
                                <p className="text-2xl font-bold text-dusty-rose">
                                    R$ {item.price.toFixed(2)}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Button
                    size="lg"
                    onClick={nextStep}
                    disabled={!canProceed}
                    className="bg-dusty-rose hover:bg-deep-rose text-white px-16 py-7 text-lg rounded-full shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium uppercase tracking-wider"
                >
                    Continuar
                </Button>
            </div>

            {!canProceed && (
                <p className="text-center text-sm text-slate">
                    Selecione pelo menos um item para continuar
                </p>
            )}
        </div>
    );
}
