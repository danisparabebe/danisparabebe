'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const priorityLinks = [
    { name: 'Kits Prontos', href: '/categoria/kits' },
    { name: 'Bestsellers', href: '/colecao/bestsellers' },
    { name: 'Saída de Maternidade', href: '/colecao/saida-de-maternidade' },
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

                    {/* Mobile Menu Button - unchanged */}
                    <div className="lg:hidden flex items-center h-full">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors z-20 relative -ml-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Desktop Navigation Layout */}
                    <div className="hidden lg:flex w-full h-full items-center justify-center">

                        {/* Desktop Priority Links (Centered in remaining space) */}
                        <div className="flex-1 flex justify-center items-center space-x-6 xl:space-x-10">
                            {priorityLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="group relative whitespace-nowrap text-[11px] xl:text-[12px] font-semibold text-charcoal/80 hover:text-sage-green transition-colors"
                                >
                                    <span>{link.name}</span>
                                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-sage-green transition-all group-hover:w-full rounded-full" />
                                </a>
                            ))}
                        </div>

                        {/* Dropdown: Todas as Categorias (Right Aligned to balance the Personalize button) */}
                        <div className="flex shrink-0 w-[200px] xl:w-[240px] justify-end relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`group flex items-center gap-1 whitespace-nowrap text-[12px] xl:text-[13px] font-semibold transition-colors ${isDropdownOpen ? 'text-sage-green' : 'text-charcoal/80 hover:text-sage-green'}`}
                            >
                                Todas as Categorias
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-sage-green' : 'text-slate group-hover:text-sage-green'}`} />
                            </button>

                            {/* Dropdown Menu */}
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

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-warm-stone border-b border-black/5 shadow-xl z-50 lg:hidden animate-fadeIn">
                    <div className="flex flex-col p-4 space-y-1">
                        {priorityLinks.map((link) => (
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
