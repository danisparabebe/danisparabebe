'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MagnifyingGlass, User, ShoppingBag, List } from '@phosphor-icons/react';
import { useState } from 'react';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="h-20 bg-neutral-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-primary-brand/20">
            <nav className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">

                {/* Esquerda: Menu (Mobile) / Links (Desktop) */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="lg:hidden"
                    >
                        <List size={24} weight="regular" />
                    </button>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex gap-6 text-sm font-medium text-neutral-textSub">
                        <Link href="/produtos" className="hover:text-primary-brand transition">
                            Produtos
                        </Link>
                        <Link href="/sobre" className="hover:text-primary-brand transition">
                            Sobre Nós
                        </Link>
                        <Link href="/blog" className="hover:text-primary-brand transition">
                            Blog
                        </Link>
                    </div>
                </div>

                {/* Centro: Logo */}
                <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
                    <h1 className="font-fraunces text-2xl font-bold text-neutral-text tracking-wide">
                        DANIS
                    </h1>
                </Link>

                {/* Direita: Ícones */}
                <div className="flex items-center gap-2">
                    <Button variant="icon" size="icon" className="rounded-full">
                        <MagnifyingGlass size={20} weight="regular" />
                    </Button>
                    <Button variant="icon" size="icon" className="rounded-full">
                        <User size={20} weight="regular" />
                    </Button>
                    <Button variant="icon" size="icon" className="rounded-full">
                        <ShoppingBag size={20} weight="regular" />
                    </Button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {menuOpen && (
                <div className="lg:hidden bg-neutral-white border-t border-neutral-border">
                    <div className="flex flex-col p-4 gap-4 text-sm font-medium text-neutral-textSub">
                        <Link href="/produtos" className="hover:text-primary-brand transition">
                            Produtos
                        </Link>
                        <Link href="/sobre" className="hover:text-primary-brand transition">
                            Sobre Nós
                        </Link>
                        <Link href="/blog" className="hover:text-primary-brand transition">
                            Blog
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
