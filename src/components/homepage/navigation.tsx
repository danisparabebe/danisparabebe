'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Wand2, ArrowRight } from 'lucide-react';

const leftLinks = [
    { name: 'Kits Prontos', href: '/categoria/kits' },
    { name: 'Bestsellers', href: '/colecao/bestsellers' },
];

const rightLinks = [
    { name: 'Saida de Maternidade', href: '/colecao/saida-de-maternidade' },
    { name: 'Para Presentear', href: '/colecao/para-presentear' },
    { name: 'Linha Premium', href: '/colecao/linha-premium' },
];

const allCategories = [
    { name: 'Mantas Bordadas', href: '/categoria/manta' },
    { name: 'Fraldas de Boca', href: '/categoria/fralda-boca' },
    { name: 'Fraldas de Ombro', href: '/categoria/fralda-ombro' },
    { name: 'Toalhas Fralda', href: '/categoria/toalha' },
    { name: 'Bodys Personalizados', href: '/categoria/body' },
    { name: 'Toucas', href: '/categoria/touca' },
    { name: 'Faixas de Cabelo', href: '/categoria/faixa' },
    { name: 'Ver Todos os Produtos', href: '/colecao/todos' },
];

const NavLink = ({ name, href }: { name: string; href: string }) => (
    <a
        href={href}
        className="group relative whitespace-nowrap text-[11px] xl:text-[12px] font-semibold text-charcoal/80 hover:text-sage-green transition-colors"
    >
        <span>{name}</span>
        <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-sage-green transition-all group-hover:w-full rounded-full" />
    </a>
);

export function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-warm-stone border-b border-black/5 shadow-sm sticky top-0 z-50">
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

                    {/* Mobile: centered CTA */}
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

                    {/* Desktop: 3-column layout — [left links] [CTA center] [right links + dropdown] */}
                    <div className="hidden lg:flex w-full h-full items-center">

                        {/* Left links — push towards center */}
                        <div className="flex-1 flex justify-end items-center gap-6 xl:gap-8 pr-6 xl:pr-10">
                            {leftLinks.map((link) => (
                                <NavLink key={link.name} {...link} />
                            ))}
                        </div>

                        {/* Center: MONTE SEU KIT — always dead center */}
                        <div className="shrink-0">
                            <Link
                                href="/monte-seu-kit"
                                className="group flex items-center gap-2 px-6 py-2 bg-sage-green hover:bg-[#9cbd9f] text-charcoal text-[11px] xl:text-[12px] font-black tracking-[0.1em] rounded-full transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap outline-none cursor-pointer shadow-[0_2px_12px_rgba(173,206,179,0.4)] hover:shadow-[0_6px_20px_rgba(173,206,179,0.55)] border border-charcoal/10"
                            >
                                <Wand2 className="w-4 h-4 text-charcoal/70 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
                                <span>MONTE SEU KIT</span>
                                <ArrowRight className="w-3.5 h-3.5 text-charcoal/50 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                            </Link>
                        </div>

                        {/* Right links + dropdown — push towards center */}
                        <div className="flex-1 flex justify-start items-center gap-6 xl:gap-8 pl-6 xl:pl-10">
                            {rightLinks.map((link) => (
                                <NavLink key={link.name} {...link} />
                            ))}

                            {/* Dropdown: Todas as Categorias */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`group flex items-center gap-1 whitespace-nowrap text-[11px] xl:text-[12px] font-semibold transition-colors ${isDropdownOpen ? 'text-sage-green' : 'text-charcoal/80 hover:text-sage-green'}`}
                                >
                                    Todas as Categorias
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-sage-green' : 'text-slate group-hover:text-sage-green'}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-4 w-56 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden animate-fadeIn pb-2 pt-2 z-50">
                                        {allCategories.map((cat, idx) => (
                                            <a
                                                key={cat.name}
                                                href={cat.href}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className={`block px-5 py-2.5 text-sm text-charcoal/80 hover:text-charcoal hover:bg-sage-green/10 transition-colors ${idx === allCategories.length - 1 ? 'border-t border-black/5 font-bold mt-1 pt-3' : ''}`}
                                            >
                                                {cat.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-warm-stone border-b border-black/5 shadow-xl z-50 lg:hidden animate-fadeIn">
                    <div className="flex flex-col p-4 space-y-1">
                        {[...leftLinks, ...rightLinks].map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-bold text-charcoal py-3 px-2 border-b border-black/5"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="py-2 px-2 text-xs font-bold text-slate uppercase tracking-wider mt-2">
                            Todas as Categorias
                        </div>
                        {allCategories.map((cat) => (
                            <a
                                key={cat.name}
                                href={cat.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-medium text-charcoal/80 py-2.5 px-4 hover:text-dusty-rose hover:bg-black/5 rounded-md"
                            >
                                {cat.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
