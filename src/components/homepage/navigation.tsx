'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown, Wand2, ArrowRight } from 'lucide-react';

const leftLinks = [
    { name: 'Kits Prontos' },
    { name: 'Bestsellers' },
    { name: 'Saída de Maternidade' },
];

const rightLinks = [
    { name: 'Para Presentear' },
    { name: 'Linha Premium' },
];

// Link com marcação de "Em Breve" e desabilitado para clique
const NavLinkDisabled = ({ name }: { name: string }) => (
    <div
        className="group relative flex items-center gap-1.5 whitespace-nowrap text-[11px] xl:text-[12px] font-semibold text-charcoal/60 cursor-not-allowed select-none py-1"
        title={`${name} estará disponível em breve!`}
    >
        <span>{name}</span>
        <span className="text-[8px] xl:text-[9px] font-extrabold uppercase tracking-tight bg-dusty-rose/20 text-dusty-rose px-1.5 py-0.5 rounded-md border border-dusty-rose/40">
            Em Breve
        </span>
    </div>
);

export function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-[#F7FAF7] border-b border-black/5 shadow-sm sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-11 items-center justify-between w-full relative">

                    {/* Mobile: hamburger left */}
                    <div className="lg:hidden flex items-center h-full">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors z-20 relative -ml-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile: centered CTA - MONTE SEU KIT mantido 100% ativo */}
                    <div className="flex lg:hidden justify-center items-center h-full absolute inset-0 pointer-events-none z-10 w-full">
                        <Link
                            href="/monte-seu-kit"
                            className="group flex items-center gap-2 px-5 py-2 bg-sage-green hover:bg-[#9cbd9f] text-charcoal text-[10px] sm:text-[11px] font-black tracking-[0.1em] rounded-full shadow-[0_2px_12px_rgba(173,206,179,0.4)] transition-all outline-none border border-charcoal/10 pointer-events-auto active:scale-95"
                        >
                            <Wand2 className="w-3.5 h-3.5 text-charcoal/70" strokeWidth={2.5} />
                            <span>MONTE SEU KIT</span>
                            <ArrowRight className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={2.5} />
                        </Link>
                    </div>

                    {/* Desktop: Links com tag "Em Breve" e Monte Seu Kit ativo no centro */}
                    <div className="hidden lg:flex w-full h-full items-center justify-between gap-1 xl:gap-3">
                        
                        {leftLinks.map((link) => (
                            <NavLinkDisabled key={link.name} name={link.name} />
                        ))}

                        {/* Botão Central: MONTE SEU KIT (Ativo) */}
                        <div className="shrink-0 px-2 lg:scale-95 xl:scale-100">
                            <Link
                                href="/monte-seu-kit"
                                className="group relative overflow-hidden flex items-center gap-2 px-5 xl:px-6 py-2 bg-gradient-to-r from-sage-green to-[#7fac84] text-white text-[11px] xl:text-[12px] font-black tracking-[0.1em] rounded-full transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap outline-none cursor-pointer shadow-[0_4px_15px_rgba(136,179,140,0.5)] hover:shadow-[0_8px_25px_rgba(136,179,140,0.6)] border border-white/20"
                            >
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine pointer-events-none" />
                                <Wand2 className="w-4 h-4 text-white/90 group-hover:rotate-12 transition-transform duration-300 relative z-10" strokeWidth={2.5} />
                                <span className="relative z-10 drop-shadow-sm">MONTE SEU KIT</span>
                                <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform duration-300 relative z-10" strokeWidth={2.5} />
                            </Link>
                        </div>

                        {rightLinks.map((link) => (
                            <NavLinkDisabled key={link.name} name={link.name} />
                        ))}

                        {/* Todas Categorias com tag "Em Breve" */}
                        <div className="relative shrink-0 flex items-center gap-1.5 text-[11px] xl:text-[12px] font-semibold text-charcoal/60 cursor-not-allowed select-none py-1">
                            <span>Todas Categorias</span>
                            <span className="text-[8px] xl:text-[9px] font-extrabold uppercase tracking-tight bg-dusty-rose/20 text-dusty-rose px-1.5 py-0.5 rounded-md border border-dusty-rose/40">
                                Em Breve
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate/40" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-warm-stone border-b border-black/5 shadow-xl z-50 lg:hidden animate-fadeIn">
                    <div className="flex flex-col p-4 space-y-1">
                        {[...leftLinks, ...rightLinks].map((link) => (
                            <div
                                key={link.name}
                                className="flex items-center justify-between text-sm font-bold text-charcoal/60 py-3 px-2 border-b border-black/5 cursor-not-allowed"
                            >
                                <span>{link.name}</span>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-dusty-rose/20 text-dusty-rose px-2 py-0.5 rounded-md border border-dusty-rose/40">
                                    Em Breve
                                </span>
                            </div>
                        ))}

                        <div className="flex items-center justify-between text-sm font-bold text-charcoal/60 py-3 px-2 border-b border-black/5 cursor-not-allowed">
                            <span>Todas as Categorias</span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-dusty-rose/20 text-dusty-rose px-2 py-0.5 rounded-md border border-dusty-rose/40">
                                Em Breve
                            </span>
                        </div>

                        <div className="pt-3">
                            <Link
                                href="/monte-seu-kit"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-sage-green text-charcoal text-xs font-black tracking-wider uppercase rounded-xl shadow-sm"
                            >
                                <Wand2 className="w-4 h-4" />
                                <span>Monte Seu Kit Personalizado</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
