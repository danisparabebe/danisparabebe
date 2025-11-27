'use client';

import Link from 'next/link';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

export default function MainHeader() {
    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left Actions */}
                <div className="flex items-center gap-6 w-1/3">
                    <button className="p-2 -ml-2 hover:bg-gray-50 transition-colors">
                        <Icon icon={Menu} className="w-5 h-5 text-text" />
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-subtle hover:text-text transition-colors cursor-pointer">
                        <Icon icon={Search} className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-nunito">Buscar</span>
                    </div>
                </div>

                {/* Center Logo */}
                <div className="w-1/3 flex justify-center">
                    <Link href="/" className="text-3xl md:text-4xl font-playfair font-medium text-text tracking-wide">
                        TROUSSEAU
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-6 w-1/3">
                    <div className="hidden md:flex items-center gap-2 text-subtle hover:text-text transition-colors cursor-pointer">
                        <Icon icon={User} className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-nunito">Entrar</span>
                    </div>
                    <button className="p-2 -mr-2 hover:bg-gray-50 transition-colors relative">
                        <Icon icon={ShoppingBag} className="w-5 h-5 text-text" />
                        <span className="absolute top-1 right-0 w-2 h-2 bg-rosa rounded-full" />
                    </button>
                </div>
            </div>

            {/* Sub Navigation */}
            <nav className="hidden md:flex justify-center gap-12 py-4 border-t border-gray-50">
                {['Cama', 'Mesa', 'Banho', 'Essências', 'Everywear', 'Petit', 'Outlet'].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="text-xs uppercase tracking-[0.2em] text-subtle hover:text-text transition-colors font-nunito font-medium"
                    >
                        {item}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
