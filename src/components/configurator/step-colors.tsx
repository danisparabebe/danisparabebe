'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { Check, ArrowLeft, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { BABADOS, PASSA_FITAS } from '@/data/admin-options';

function ImageFinishGrid({
    label,
    selected,
    onSelect,
    options,
    cols = "grid-cols-4 sm:grid-cols-5 md:grid-cols-7",
    aspectClass = "aspect-square",
    objectFit = "object-cover",
}: {
    label: string;
    selected: string;
    onSelect: (v: string) => void;
    options: { id: string, label: string, img: string }[];
    cols?: string;
    aspectClass?: string;
    objectFit?: string;
}) {
    return (
        <div className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-black text-[#1f2937] uppercase tracking-widest">{label}</h3>
                {selected && (
                    <motion.span
                        key={selected}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase text-[#1f2937] bg-sage-green px-3 py-1 rounded-full tracking-wider"
                    >
                        <Check className="w-3 h-3" strokeWidth={3} />
                        SELECIONADO
                    </motion.span>
                )}
            </div>

            <div className={`grid ${cols} gap-2 mt-2`}>
                {options.map((opt) => {
                    const active = selected === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onSelect(opt.id)}
                            className="group flex flex-col items-center gap-1.5 outline-none"
                        >
                            <div className={`
                                w-full ${aspectClass} rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                                flex items-center justify-center
                                ${active
                                    ? 'border-[#1f2937] shadow-md scale-105 bg-white'
                                    : 'border-black/5 bg-[#faf9f7] group-hover:border-black/20 group-hover:shadow-sm'
                                }
                            `}>
                                <Image
                                    src={opt.img}
                                    alt={opt.label}
                                    fill
                                    className={objectFit}
                                    />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors text-center leading-[1.1]
                                ${active ? 'text-[#1f2937]' : 'text-slate group-hover:text-charcoal'}
                            `}>
                                {opt.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function StepColors() {
    const {
        acabamentoColor, setAcabamentoColor,
        passafitaColor, setPassafitaColor,
        nextStep, previousStep,
    } = useConfiguratorStore();

    // Passa-fita Branco é o padrão oficial de enxoval da Danis. Pré-seleciona se vazio.
    useEffect(() => {
        if (!passafitaColor) {
            setPassafitaColor('Branco');
        }
    }, [passafitaColor, setPassafitaColor]);

    const canProceed = Boolean(acabamentoColor && passafitaColor);

    const handleNext = () => {
        if (!acabamentoColor) {
            toast.error('Por favor, selecione a cor do Babado para continuar.');
            window.scrollTo({ top: 80, behavior: 'smooth' });
            return;
        }
        if (!passafitaColor) {
            toast.error('Por favor, selecione a cor do Passa-Fita para continuar.');
            return;
        }
        nextStep();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4 pb-32 md:pb-16 px-1">
            {/* Header */}
            <div className="text-center space-y-2 mb-2">
                <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1f2937]">
                    Acabamentos
                </h2>
                <p className="text-slate text-sm md:text-base max-w-xl mx-auto">
                    Selecione as cores e os tecidos exatos do seu enxoval.
                </p>
            </div>

            {/* Babado color */}
            <ImageFinishGrid
                label="Cor do Babado"
                selected={acabamentoColor}
                onSelect={setAcabamentoColor}
                options={BABADOS}
                cols="grid-cols-4 sm:grid-cols-5 md:grid-cols-7"
            />

            {/* Passa-fita color */}
            <ImageFinishGrid
                label="Cor do Passa-fita"
                selected={passafitaColor}
                onSelect={setPassafitaColor}
                options={PASSA_FITAS}
                cols="grid-cols-3 sm:grid-cols-3 md:grid-cols-3 max-w-md"
                aspectClass="aspect-[4/3]"
                objectFit="object-contain"
            />

            {/* Disclaimer Alert */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl shadow-sm text-xs md:text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <p>
                    <strong>Aviso importante:</strong> As fotos acima são dos Nossos tecidos originais. Podem ocorrer pequenas variações na tonalidade das cores de acordo com a mudança de lote do tecido da fábrica e a iluminação da tela.
                </p>
            </div>

            {/* Barra Inferior com Alto Contraste e Feedback Visual */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed md:sticky bottom-0 left-0 right-0 md:bottom-auto z-40
                           bg-[#1f2937] text-white px-5 py-4 md:rounded-2xl
                           flex items-center justify-between
                           shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:shadow-xl gap-4 border border-slate-700/80 mt-6"
            >
                <button
                    onClick={previousStep}
                    className="cursor-pointer flex items-center justify-center w-12 h-12 shrink-0 rounded-xl border-2 border-white/20 text-white hover:border-white hover:bg-white/10 transition-all active:scale-95"
                    title="Voltar ao passo anterior"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center md:text-left hidden sm:block">
                    {canProceed ? (
                        <p className="text-xs font-bold text-[#ADCEB3] uppercase tracking-widest flex items-center gap-1.5 md:ml-4">
                            <Check className="w-4 h-4 text-[#ADCEB3]" strokeWidth={3} /> Babado e Passa-Fita selecionados
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 md:ml-4">
                            <AlertTriangle className="w-4 h-4" />
                            {!acabamentoColor ? 'Escolha a cor do Babado acima' : 'Escolha a cor do Passa-Fita'}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    className={`cursor-pointer flex-1 sm:flex-initial md:w-auto px-8 py-3.5 h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                        canProceed
                            ? 'bg-[#ADCEB3] hover:bg-[#9cbd9f] text-[#1f2937] shadow-[#ADCEB3]/25 ring-2 ring-[#ADCEB3]/50'
                            : 'bg-white/20 hover:bg-white/30 text-white border-2 border-white/40'
                    }`}
                >
                    Próximo Passo <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
}
