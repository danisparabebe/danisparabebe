'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const categories = [
    { name: 'Ofertas', href: '/ofertas' },
    { name: 'Kit Manta Bordada', href: '/categoria/kit-manta' },
    { name: 'Kit Fraldas Bordadas', href: '/categoria/kit-fraldas' },
    { name: 'Toalhas Bordadas', href: '/categoria/toalhas' },
    { name: 'Body', href: '/categoria/body' },
    { name: 'Touca Bordada', href: '/categoria/touca' },
    { name: 'Faixa de Cabelo', href: '/categoria/faixa' },
];

export function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="border-b border-line bg-warm-stone shadow-sm relative z-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative h-14 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden absolute left-0 z-30">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-charcoal hover:bg-black/5 rounded-full"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Desktop Left Links */}
                    <div className="hidden lg:flex flex-1 justify-end pr-8 space-x-6">
                        {categories.slice(0, 4).map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="group relative whitespace-nowrap text-sm font-medium text-charcoal hover:text-dusty-rose transition-colors"
                            >
                                <span>{category.name}</span>
                                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-dusty-rose transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Center Button (Absolutely Positioned) - Visible on Mobile too but smaller */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <Link
                            href="/monte-seu-kit"
                            className="pointer-events-auto px-4 py-1.5 lg:px-6 lg:py-2 bg-dusty-rose text-white text-xs lg:text-sm font-bold tracking-wide rounded-full shadow-soft hover:bg-deep-rose hover:shadow-hover transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            PERSONALIZE SEU KIT
                        </Link>
                    </div>

                    {/* Desktop Right Links */}
                    <div className="hidden lg:flex flex-1 justify-start pl-8 space-x-6">
                        {categories.slice(4).map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="group relative whitespace-nowrap text-sm font-medium text-charcoal hover:text-dusty-rose transition-colors"
                            >
                                <span>{category.name}</span>
                                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-dusty-rose transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-line shadow-xl z-50 lg:hidden animate-slideDown">
                    <div className="flex flex-col p-4 space-y-4">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-base font-medium text-charcoal py-2 border-b border-line/30 last:border-0"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
