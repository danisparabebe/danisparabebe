'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
    currentStep: number;
    steps: string[];
}

export default function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
    return (
        <div className="w-full py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Mobile: Compact Progress Bar */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                            Passo {currentStep + 1} de {steps.length}
                        </span>
                        <span className="text-sm text-gray-600">{steps[currentStep]}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="bg-rosa h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Desktop: Full Stepper */}
                <div className="hidden md:flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isUpcoming = index > currentStep;

                        return (
                            <div key={index} className="flex items-center flex-1">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isCurrent ? 1.1 : 1,
                                            backgroundColor: isCompleted || isCurrent ? '#F082A3' : '#E5E7EB',
                                        }}
                                        className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}
                      font-bold shadow-lg transition-all duration-300
                    `}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <span>{index + 1}</span>
                                        )}
                                    </motion.div>

                                    {/* Step Label */}
                                    <span
                                        className={`
                      mt-2 text-sm font-medium text-center
                      ${isCurrent ? 'text-rosa font-semibold' : ''}
                      ${isCompleted ? 'text-gray-700' : ''}
                      ${isUpcoming ? 'text-gray-400' : ''}
                    `}
                                    >
                                        {step}
                                    </span>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-rosa"
                                            initial={{ width: '0%' }}
                                            animate={{ width: isCompleted ? '100%' : '0%' }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
