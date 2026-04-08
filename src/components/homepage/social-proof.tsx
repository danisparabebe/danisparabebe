'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Heart, MessageCircle, Star, X } from 'lucide-react';
import Image from 'next/image';

// Imagens de feedbacks já tratadas abaixo

const FEEDBACKS = [
    '/feedbacks/01.jpeg',
    '/feedbacks/02.jpeg',
    '/feedbacks/03.jpeg',
    '/feedbacks/04.jpeg',
    '/feedbacks/05.jpeg',
    '/feedbacks/06.jpeg',
    '/feedbacks/07.jpeg',
    '/feedbacks/08.jpeg',
    '/feedbacks/09.jpeg',
    '/feedbacks/10.jpeg',
    '/feedbacks/11.jpeg',
    '/feedbacks/12.jpeg',
];

export function SocialProof() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const row1 = FEEDBACKS.slice(0, 6);
    const row2 = FEEDBACKS.slice(6, 12);

    return (
        <div className="w-full bg-sage-green/10 pt-16 md:pt-24 pb-16 overflow-hidden relative border-t border-black/5">
            {/* Background elements */}
            <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-sage-green/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-white/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="max-w-2xl text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-sage-green/40 text-sage-green-dark text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2 shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-sage-green-dark" />
                            Família Danis Oficial
                        </div>
                        <h2 className="text-3xl md:text-5xl font-heading font-black text-charcoal leading-tight">
                            Junte-se a <span className="text-sage-green-dark">quase 50.000</span> mamães apaixonadas.
                        </h2>
                        <p className="text-charcoal/80 md:text-lg max-w-xl font-medium">
                            Acompanhe nosso dia a dia, veja pedidos saindo para entrega e faça parte de uma comunidade que escolhe o melhor para seus bebês.
                        </p>
                    </div>

                    <a 
                        href="https://instagram.com/danisparabebe" 
                        target="_blank" 
                        rel="noreferrer"
                        className="group shrink-0 inline-flex items-center p-2 pr-6 bg-white rounded-full border-2 border-sage-green-dark shadow-[4px_4px_0px_rgba(43,76,63,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(43,76,63,1)] transition-all cursor-pointer"
                    >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sage-green/20 bg-white mr-3 shrink-0 p-1.5 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                <Image 
                                    src="/Logos/logo simples verde.png" 
                                    alt="Dani" 
                                    fill 
                                    className="object-contain" 
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col mr-6">
                            <div className="flex items-center gap-1">
                                <span className="font-heading font-black text-[#1f2937] leading-none text-sm">@danisparabebe</span>
                                <Instagram className="w-3 h-3 text-charcoal/40" />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-slate mt-0.5">47.4k Seguidores</span>
                        </div>

                        <div className="bg-sage-green-dark text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full group-hover:bg-[#1f2937] transition-colors">
                            Seguir
                        </div>
                    </a>
                </div>
            </div>

            {/* Testimonials Double Marquee */}
            <div className="mt-16 w-full relative z-10 flex flex-col gap-6 md:gap-8 overflow-hidden">
                {/* Edge Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-64 bg-gradient-to-r from-[#eef2f0] to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-64 bg-gradient-to-l from-[#eef2f0] to-transparent z-20 pointer-events-none" />
                
                {/* Row 1 (Right to Left) */}
                <motion.div 
                    className="flex gap-4 md:gap-8 w-max pl-4 md:pl-8"
                    animate={{ x: [0, "-50%"] }}
                    transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                >
                    {[...row1, ...row1, ...row1].map((src, i) => (
                        <div 
                            key={`r1-${i}`} 
                            onClick={() => setSelectedImage(src)}
                            className="w-[180px] md:w-[260px] h-[320px] md:h-[460px] relative rounded-2xl overflow-hidden shadow-[0_12px_40px_rgb(0,0,0,0.12)] border-[6px] md:border-[8px] border-white shrink-0 bg-white group hover:z-30 hover:-translate-y-4 hover:scale-105 hover:rotate-1 transition-all duration-300 origin-bottom cursor-zoom-in"
                        >
                            <Image src={src} alt="Feedback" fill className="object-cover align-top" unoptimized />
                            <div className="absolute inset-0 bg-sage-green-dark/0 group-hover:bg-sage-green-dark/10 transition-colors duration-300" />
                        </div>
                    ))}
                </motion.div>

                {/* Row 2 (Left to Right) */}
                <motion.div 
                    className="flex gap-4 md:gap-8 w-max pl-4 md:pl-8"
                    animate={{ x: ["-50%", 0] }}
                    transition={{ repeat: Infinity, duration: 75, ease: "linear" }}
                >
                    {[...row2, ...row2, ...row2].map((src, i) => (
                        <div 
                            key={`r2-${i}`} 
                            onClick={() => setSelectedImage(src)}
                            className="w-[180px] md:w-[260px] h-[320px] md:h-[460px] relative rounded-2xl overflow-hidden shadow-[0_12px_40px_rgb(0,0,0,0.12)] border-[6px] md:border-[8px] border-white shrink-0 bg-white group hover:z-30 hover:-translate-y-4 hover:scale-105 hover:-rotate-1 transition-all duration-300 origin-bottom cursor-zoom-in"
                        >
                            <Image src={src} alt="Feedback" fill className="object-cover align-top" unoptimized />
                            <div className="absolute inset-0 bg-sage-green-dark/0 group-hover:bg-sage-green-dark/10 transition-colors duration-300" />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Lightbox Modal para Leitura */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Overlay Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-zoom-out"
                            onClick={() => setSelectedImage(null)}
                        />

                        {/* Imagem Expandida */}
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-lg h-[80vh] md:h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
                        >
                            <Image 
                                src={selectedImage} 
                                alt="Feedback em tela cheia" 
                                fill 
                                className="object-contain bg-black/5" 
                                unoptimized 
                            />
                            
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
