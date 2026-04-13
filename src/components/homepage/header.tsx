'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingCart, Menu, X, User as UserIcon, LogOut, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Header() {
    const { openCart, items } = useCartStore();
    const { user, login, logout } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLoginMenu, setShowLoginMenu] = useState(false);

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Open cart handler

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
                setShowLoginMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions as user types
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length < 2) {
                setSuggestions([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300); // 300ms debounce
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowDropdown(false);
            router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowDropdown(false);
    };

    const handleSelectSuggestion = (id: string, shortCode?: string) => {
        setShowDropdown(false);
        setSearchQuery('');
        router.push(`/produto/${shortCode || id}`);
    };

    // Render dropdown content
    const DropdownContent = () => {
        if (!showDropdown || searchQuery.trim().length < 2) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-line overflow-hidden z-50">
                {isSearching ? (
                    <div className="p-4 text-center text-slate text-sm">Buscando...</div>
                ) : suggestions.length > 0 ? (
                    <ul>
                        {suggestions.map((item) => (
                            <li key={item.id} className="border-b border-line last:border-0">
                                <button
                                    onClick={() => handleSelectSuggestion(item.id, item.shortCode)}
                                    className="w-full text-left p-3 hover:bg-dusty-rose/5 flex items-center gap-3 transition-colors"
                                >
                                    <div className="h-12 w-12 bg-surface-white rounded-md overflow-hidden relative flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-charcoal line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-slate">{item.category} • R$ {item.price.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                        <li className="bg-surface-white p-2">
                            <button
                                onClick={(e) => handleSearch(e as any)}
                                className="w-full text-center text-sm font-semibold text-dusty-rose hover:text-deep-rose"
                            >
                                Ver todos os resultados para "{searchQuery}"
                            </button>
                        </li>
                    </ul>
                ) : (
                    <div className="p-4 text-center text-slate text-sm">
                        Nenhum produto encontrado. Tente "Manta", "Fralda"...
                    </div>
                )}
            </div>
        );
    };

    return (
        <header className="bg-warm-stone pt-2 pb-1 relative z-[60]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">

                <div className="flex h-16 items-center justify-between w-full relative">

                    {/* Desktop Logo - Perfect symmetrical left wing */}
                    <div className="hidden lg:flex shrink-0 w-[200px] xl:w-[240px] items-center justify-center">
                        <Link href="/" className="block">
                            <img
                                src="/Logos/DANIS VERDE.png"
                                alt="Danis Para Bebê"
                                className="h-[56px] xl:h-[64px] w-auto object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>

                    {/* Mobile Logo (Absolute perfect horizontally center) */}
                    <div className="flex lg:hidden justify-center items-center h-full absolute inset-0 pointer-events-none z-10 w-full">
                        <Link href="/" className="flex items-center justify-center h-full pointer-events-auto mt-1">
                            <img
                                src="/Logos/DANIS VERDE.png"
                                alt="Danis Para Bebê"
                                className="h-[44px] sm:h-[48px] w-auto object-contain hover:opacity-90 transition-opacity"
                            />
                        </Link>
                    </div>

                    {/* Search - Desktop (Perfectly Centered) */}
                    <div className="hidden lg:flex flex-1 max-w-2xl px-8 relative justify-center" ref={dropdownRef}>
                        <form onSubmit={handleSearch} className="relative w-full group/search">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="O que você está procurando para o seu bebê?"
                                className="w-full rounded-full border border-black/5 px-5 py-2 pr-10 text-xs text-charcoal placeholder:text-slate focus:outline-none focus:border-sage-green/30 focus:ring-4 focus:ring-sage-green/10 bg-white/70 hover:bg-white focus:bg-white transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]"
                            />
                            {searchQuery ? (
                                <button type="button" onClick={handleClearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-slate hover:text-charcoal transition-colors cursor-pointer">
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-charcoal/5 group-hover/search:bg-charcoal p-2 text-charcoal/80 group-hover/search:text-white transition-all duration-300 cursor-pointer">
                                <Search className="h-[18px] w-[18px]" />
                            </button>
                        </form>
                        <DropdownContent />
                    </div>

                    {/* Icons - Right wing (Desktop & Mobile) */}
                    <div className="flex shrink-0 lg:w-[200px] xl:w-[240px] items-center justify-end space-x-1 sm:space-x-3 relative z-[70]">
                        
                        {/* ─── CONTAS & LOGIN ─── */}
                        <div className="relative group/auth" ref={userMenuRef}>
                            {!user ? (
                                <>
                                    <button onClick={() => setShowLoginMenu(!showLoginMenu)} className="p-2 flex items-center justify-center gap-1.5 text-charcoal hover:text-sage-green transition-all duration-300 outline-none">
                                        <UserIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                                        <span className="hidden xl:block text-[10px] font-bold font-heading py-0.5 uppercase tracking-widest mt-0.5">Entrar</span>
                                    </button>
                                    
                                    {showLoginMenu && (
                                        <div className="absolute right-0 top-[110%] w-[240px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-line/50 p-2 z-50">
                                            <div className="text-center mb-2 mt-1">
                                                <p className="text-[11px] font-bold text-slate uppercase tracking-wider">Acesse sua conta</p>
                                            </div>
                                            <button 
                                                onClick={() => { login(); setShowLoginMenu(false); }} 
                                                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-charcoal text-[13px] font-bold rounded-lg transition-colors border border-[#E5E5E5]"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 48 48">
                                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                                    <path fill="none" d="M0 0h48v48H0z"/>
                                                </svg>
                                                Entrar com Google
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-1 sm:p-2 flex items-center gap-2 hover:scale-105 transition-all outline-none">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Minha Conta" className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-sage-green/20 shadow-sm" />
                                        ) : (
                                            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-sage-green text-white flex items-center justify-center font-bold text-xs">
                                                {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </button>
                                        
                                    {/* Menu Dropdown Logado */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 top-[110%] mt-1 w-[220px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-line/50 overflow-hidden z-50">
                                            <div className="px-4 py-3 bg-sage-green/5 border-b border-line/40">
                                                <p className="text-[13px] font-bold text-charcoal truncate" style={{ fontFamily: 'var(--font-heading)' }}>{user.displayName}</p>
                                                <p className="text-[11px] text-slate truncate">{user.email}</p>
                                            </div>
                                            <ul className="py-1.5">
                                                <li>
                                                    <Link href="/conta?aba=pedidos" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-charcoal hover:bg-sage-green/10 transition-colors">
                                                        <Package className="w-4 h-4 text-sage-green-dark" /> Meus Pedidos
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/conta?aba=favoritos" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-charcoal hover:bg-sage-green/10 transition-colors">
                                                        <Heart className="w-4 h-4 text-dusty-rose" /> Favoritos
                                                    </Link>
                                                </li>
                                                <div className="h-px w-full bg-line/30 my-1"></div>
                                                <li>
                                                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                        <LogOut className="w-4 h-4" /> Sair da Conta
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Only show pure heart on desktop when not logged inside menu */}
                        {!user && (
                           <button className="hidden lg:block p-2 text-charcoal hover:text-dusty-rose transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95">
                               <Heart className="h-5 w-5" />
                           </button>
                        )}
                        <button onClick={openCart} className="p-2 text-charcoal hover:text-sage-green relative transition-all duration-300 cursor-pointer group/cart hover:scale-110 active:scale-95">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#1f2937] text-white text-[10px] sm:text-[11px] font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border-2 border-warm-stone group-hover/cart:scale-110 transition-transform duration-300 shadow-sm">
                                    {items.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search - Mobile */}
                <div className="lg:hidden pb-3 relative" ref={mobileDropdownRef}>
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar produtos, temas, gênero..."
                            className="w-full rounded-full border border-line px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sage-green/50 bg-white/80 backdrop-blur-sm"
                        />
                        {searchQuery ? (
                            <button type="button" onClick={handleClearSearch} className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate hover:text-charcoal transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-charcoal p-1.5 text-white">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                    <DropdownContent />
                </div>
            </div>
        </header>
    );
}
