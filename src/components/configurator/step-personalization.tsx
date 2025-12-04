'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export function StepPersonalization() {
    const { personalizationName, setPersonalizationName, nextStep, previousStep } = useConfiguratorStore();
    const [localName, setLocalName] = useState(personalizationName);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalName(value);
        setPersonalizationName(value);
    };

    const handleContinue = () => {
        nextStep();
    };

    return (
        <div className="space-y-12 max-w-3xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                    <Sparkles className="h-14 w-14 text-dusty-rose" />
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold text-charcoal">
                    Personalize com o Nome
                </h2>
                <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto">
                    Adicione o nome do bebê para bordá-lo em fonte cursiva delicada
                </p>
            </div>

            <Card className="p-10 md:p-12 space-y-6 shadow-soft bg-surface-white rounded-modal border-2 border-line">
                <div className="space-y-4">
                    <label htmlFor="baby-name" className="text-base font-semibold text-charcoal block">
                        Nome do Bebê (opcional)
                    </label>
                    <Input
                        id="baby-name"
                        type="text"
                        placeholder="Ex: Maria Clara"
                        value={localName}
                        onChange={handleNameChange}
                        className="text-lg py-7 px-5 border-2 border-line focus:border-dusty-rose focus:ring-dusty-rose rounded-callisto"
                        maxLength={20}
                    />
                    <p className="text-sm text-slate">
                        ✨ Máximo 20 caracteres • Bordado à mão
                    </p>
                </div>

                {localName && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-12 bg-gradient-to-br from-warm-stone to-dusty-rose/5 rounded-callisto border-2 border-dusty-rose/20"
                    >
                        <p className="text-sm text-slate mb-6 text-center font-medium uppercase tracking-wider">
                            ✨ Pré-visualização do bordado
                        </p>
                        <p className="text-6xl md:text-7xl text-center italic text-dusty-rose" style={{ fontFamily: 'Fraunces, serif' }}>
                            {localName}
                        </p>
                    </motion.div>
                )}
            </Card>

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
                    onClick={handleContinue}
                    className="bg-dusty-rose hover:bg-deep-rose text-white px-16 py-7 text-lg rounded-full shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-105 font-medium uppercase tracking-wider"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
}
