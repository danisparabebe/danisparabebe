'use client';

import Link from 'next/link';

export default function UtilityBar() {
    return (
        <div className="bg-white border-b border-gray-100 py-2 px-6 flex justify-between items-center text-[10px] uppercase tracking-widest font-nunito text-subtle">
            <div className="flex gap-4">
                <Link href="#" className="hover:text-text transition-colors">Sobre Nós</Link>
                <Link href="#" className="hover:text-text transition-colors">Nossas Lojas</Link>
            </div>

            <div className="text-center flex-1 hidden md:block">
                <span>Conheça nosso Outlet Online</span>
            </div>

            <div className="flex gap-4">
                <Link href="#" className="hover:text-text transition-colors">Blog</Link>
                <Link href="#" className="hover:text-text transition-colors">Ajuda</Link>
            </div>
        </div>
    );
}
