'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StepName() {
    const { babyName, setBabyName, nextStep, previousStep } = useConfiguratorStore();
    const [local, setLocal] = useState(babyName);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setLocal(v);
        setBabyName(v);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-4 pb-24 md:pb-0">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-warm-stone/50 rounded-full border border-line mb-0"
                >
                    <span className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-charcoal">O primeiro passo do seu enxoval</span>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1f2937] leading-tight mt-2">
                    Qual o nome do bebê?
                </h2>
                <p className="text-slate text-sm max-w-xl mx-auto">
                    Cada detalhe é pensado com carinho. O nome que você escolher será <strong className="text-charcoal font-black">bordado com capricho em cada peça</strong>, tornando o enxoval único e inesquecível.
                </p>
            </div>

            {/* Premium Input Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-white border-2 border-[#1f2937]/5 rounded-[1.5rem] p-4 md:p-6 shadow-xl shadow-black/5 overflow-hidden"
            >
                {/* Decorative background blur */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-sage-green/20 rounded-full blur-[50px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 space-y-4">
                    <div className="space-y-3">
                        <label htmlFor="baby-name" className="block text-xs font-black text-[#1f2937] uppercase tracking-widest">
                            Digite o nome para o bordado
                            <span className="ml-2 font-bold normal-case text-slate/40 tracking-normal">(opcional)</span>
                        </label>

                        <div className="relative">
                            <input
                                id="baby-name"
                                type="text"
                                autoFocus
                                placeholder="Ex: Maria Clara"
                                value={local}
                                onChange={handleChange}
                                maxLength={20}
                                className="w-full text-2xl md:text-4xl px-0 py-2 bg-transparent border-0 border-b-4 border-black/10 focus:border-sage-green focus:ring-0 outline-none transition-colors text-[#1f2937] placeholder:text-black/10 font-heading font-black"
                            />
                            {local.length > 0 && (
                                <p className="absolute right-0 bottom-2 text-xs font-bold text-slate/40">
                                    {local.length}/20
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Live cursive preview - Emotional Hook */}
                    <AnimatePresence>
                        {local.trim() && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 bg-gradient-to-br from-[#faf9f7] to-white rounded-xl p-4 md:p-6 border border-black/5 text-center relative shadow-inner">
                                    {/* Quote markings for aesthetics */}
                                    <span className="absolute top-2 left-3 text-3xl text-black/5 font-serif">"</span>
                                    <span className="absolute bottom-0 right-3 text-3xl text-black/5 font-serif leading-none">"</span>

                                    <p className="text-[9px] text-slate/50 uppercase tracking-[0.2em] font-black mb-2">
                                        Como ficará no bordado (Simulação)
                                    </p>
                                    <p
                                        className="text-4xl md:text-5xl text-[#1f2937] italic tracking-tight"
                                        style={{ fontFamily: 'Fraunces, serif' }}
                                    >
                                        {local}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Always visible Floating Next Button */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="fixed md:sticky bottom-0 left-0 right-0 md:bottom-auto z-40
                           bg-[#1f2937] text-white px-5 py-4 md:rounded-2xl
                           flex items-center justify-between
                           shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-xl gap-4 border border-[#1f2937]"
            >
                {/* Spacer instead of back button for step 1 */}
                <div className="w-12 h-12 hidden md:block"></div>

                <div className="flex-1 text-center md:text-left hidden md:block px-4">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        Passo 1 de 4 • Nome do Bebê
                    </p>
                </div>

                <button
                    onClick={nextStep}
                    className="cursor-pointer w-full md:w-auto bg-sage-green hover:bg-[#9cbd9f] text-charcoal px-8 py-3.5 h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(173,206,179,0.4)] hover:shadow-[0_6px_20px_rgba(173,206,179,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    Próximo Passo <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
}
