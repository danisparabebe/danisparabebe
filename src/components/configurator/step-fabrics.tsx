'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { fabrics } from '@/data/configurator-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function StepFabrics() {
    const { selectedFabric, setFabric, nextStep, previousStep } = useConfiguratorStore();

    const handleSelect = (fabric: typeof fabrics[0]) => {
        setFabric(fabric);
    };

    const canProceed = selectedFabric !== null;

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-semibold text-charcoal">
                    Escolha o Tecido
                </h2>
                <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto">
                    Selecione o tecido premium para os itens do seu bebê
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {fabrics.map((fabric, index) => (
                    <motion.div
                        key={fabric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                    >
                        <Card
                            className={`cursor-pointer transition-all duration-300 overflow-hidden border-2 rounded-callisto ${selectedFabric?.id === fabric.id
                                    ? 'ring-2 ring-dusty-rose shadow-hover bg-surface-white border-dusty-rose'
                                    : 'hover:shadow-soft bg-surface-white border-line hover:border-dusty-rose/50'
                                }`}
                            onClick={() => handleSelect(fabric)}
                        >
                            {selectedFabric?.id === fabric.id && (
                                <div className="absolute top-4 right-4 bg-dusty-rose text-white rounded-full p-2 z-10 shadow-soft">
                                    <Check className="h-5 w-5" />
                                </div>
                            )}

                            <div className="aspect-[3/4] bg-gradient-to-br from-warm-stone to-dusty-rose/10 flex items-center justify-center">
                                <div className="text-7xl">🧵</div>
                            </div>

                            <div className="p-6 space-y-2">
                                <h3 className="font-semibold text-xl text-charcoal">{fabric.name}</h3>
                                <p className="text-base font-medium text-dusty-rose">
                                    {fabric.priceModifier > 0
                                        ? `+R$ ${fabric.priceModifier.toFixed(2)}`
                                        : 'Sem custo adicional'}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={previousStep}
                    className="px-14 py-7 text-base border-2 border-dusty-rose/30 hover:bg-dusty-rose/10 hover:border-dusty-rose text-charcoal rounded-callisto"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    onClick={nextStep}
                    disabled={!canProceed}
                    className="bg-dusty-rose hover:bg-deep-rose text-white px-16 py-7 text-lg rounded-full shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-105 disabled:opacity-50 font-medium uppercase tracking-wider"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
}
