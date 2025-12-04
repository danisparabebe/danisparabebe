'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, ShoppingCart, Menu } from 'lucide-react';

export function Header() {
    return (
        <header className="sticky top-0 z-30 bg-warm-stone pt-1">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Mobile Menu */}
                    <button className="lg:hidden p-2">
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="h-16 w-40 relative">
                            <Image
                                src="/logo-rosa.png"
                                alt="Danis Para Bebê"
                                fill
                                className="object-contain"
                                priority
                                unoptimized
                            />
                        </div>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden lg:flex flex-1 mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                className="w-full rounded-full border border-line px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-dusty-rose"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-dusty-rose p-1.5 text-white">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:text-dusty-rose">
                            <Heart className="h-6 w-6" />
                        </button>
                        <button className="p-2 hover:text-dusty-rose relative">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 bg-dusty-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                0
                            </span>
                        </button>
                    </div>
                </div>

                {/* Search - Mobile */}
                <div className="lg:hidden pb-2">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full rounded-full border border-line px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-dusty-rose"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-dusty-rose p-1 text-white">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
