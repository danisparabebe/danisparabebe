'use client';

import Link from 'next/link';

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
    return (
        <nav className="border-b border-line bg-warm-stone shadow-sm relative z-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-center space-x-6">
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

                    <Link
                        href="/monte-seu-kit"
                        className="px-6 py-2 bg-dusty-rose text-white text-sm font-bold tracking-wide rounded-full shadow-soft hover:bg-deep-rose hover:shadow-hover transition-all transform hover:-translate-y-0.5"
                    >
                        PERSONALIZE SEU KIT
                    </Link>

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
        </nav>
    );
}
