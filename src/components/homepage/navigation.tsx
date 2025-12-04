'use client';

import Link from 'next/link';

const categories = [
    { name: 'Ofertas', href: '/ofertas' },
    { name: 'Roupas', href: '/roupas' },
    { name: 'Sapatos', href: '/sapatos' },
    { name: 'Baby', href: '/baby' },
    { name: 'Enxovais', href: '/enxovais' },
    { name: 'Brinquedos', href: '/brinquedos' },
    { name: 'Decoração', href: '/decoracao' },
    { name: 'Novo', href: '/novo' },
];

export function Navigation() {
    return (
        <nav className="border-b border-line bg-warm-stone">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-12 items-center justify-between">
                    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:space-x-8">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="group relative whitespace-nowrap text-sm font-medium text-charcoal hover:text-dusty-rose transition-colors"
                            >
                                <span>{category.name}</span>
                                <span className="absolute -bottom-3 left-0 h-0.5 w-0 bg-dusty-rose transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>
                    <Link
                        href="/marcas"
                        className="text-sm font-medium text-charcoal hover:text-dusty-rose"
                    >
                        Marcas
                    </Link>
                </div>
            </div>
        </nav>
    );
}
