'use client';

import { useBuilderStore } from '@/store/builder-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

export default function StepPersonalization() {
    const { babyName, setBabyName, nextStep } = useBuilderStore();

    const handleContinue = () => {
        if (babyName.trim()) {
            nextStep();
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center md:text-left border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito block mb-2">
                    Passo 4
                </span>
                <h3 className="text-2xl font-playfair text-text">
                    PERSONALIZAÇÃO
                </h3>
            </div>

            <div className="max-w-md mx-auto md:mx-0 space-y-12">
                <div className="relative">
                    <Input
                        value={babyName}
                        onChange={(e) => setBabyName(e.target.value)}
                        placeholder="NOME DO BEBÊ"
                        maxLength={15}
                        className="text-center md:text-left text-4xl h-24 border-b border-gray-200 focus:border-text placeholder:text-gray-200 font-playfair uppercase tracking-wide rounded-none"
                        autoFocus
                    />
                    <div className="absolute right-0 bottom-4 text-[10px] text-subtle font-nunito tracking-widest">
                        {babyName.length}/15
                    </div>
                </div>

                <div className="flex justify-center md:justify-start">
                    <Button
                        onClick={handleContinue}
                        disabled={!babyName.trim()}
                        variant="outline"
                        className="w-full md:w-auto min-w-[200px] rounded-none border-text text-text hover:bg-text hover:text-white uppercase tracking-widest text-xs h-12"
                    >
                        Revisar Pedido <Icon icon={ArrowRight} className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
