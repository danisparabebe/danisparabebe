'use client';

import { useState } from 'react';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';
import { StepNameAndDesign } from '@/components/configurator/step-name-design';
import { StepItems } from '@/components/configurator/step-items';
import { StepColors } from '@/components/configurator/step-colors';
import { StepReview } from '@/components/configurator/step-review';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function ConfiguratorPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [configData, setConfigData] = useState({
        babyName: '',
        theme: 'urso',
        items: [] as string[],
        finishingColor: 'rosa-bebe'
    });

    const updateData = (newData: Partial<typeof configData>) => {
        setConfigData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const canProceed = () => {
        if (currentStep === 1) return configData.babyName.trim().length > 0;
        if (currentStep === 2) return configData.items.length > 0;
        return true;
    };

    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <Header />
            <Navigation />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Bar */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-line -z-10" />
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-dusty-rose -z-10 transition-all duration-500`}
                                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                            />

                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step <= currentStep
                                            ? 'bg-dusty-rose text-white shadow-soft scale-110'
                                            : 'bg-white text-slate border border-line'
                                        }`}
                                >
                                    {step}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-medium text-slate px-2">
                            <span>Nome & Tema</span>
                            <span>Itens</span>
                            <span>Cores</span>
                            <span>Revisão</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="min-h-[400px]">
                        {currentStep === 1 && <StepNameAndDesign data={configData} onUpdate={updateData} />}
                        {currentStep === 2 && <StepItems data={configData} onUpdate={updateData} />}
                        {currentStep === 3 && <StepColors data={configData} onUpdate={updateData} />}
                        {currentStep === 4 && <StepReview data={configData} />}
                    </div>

                    {/* Navigation Buttons */}
                    {currentStep < 4 && (
                        <div className="flex justify-between mt-12 border-t border-line pt-8">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center px-6 py-3 rounded-full font-medium transition-colors ${currentStep === 1
                                        ? 'text-line cursor-not-allowed'
                                        : 'text-slate hover:bg-white hover:text-charcoal'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Anterior
                            </button>

                            <button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className={`flex items-center px-8 py-3 rounded-full font-bold shadow-soft transition-all transform hover:-translate-y-1 ${canProceed()
                                        ? 'bg-charcoal text-white hover:bg-dusty-rose'
                                        : 'bg-line text-slate cursor-not-allowed'
                                    }`}
                            >
                                Próximo
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer simple />
        </div>
    );
}
