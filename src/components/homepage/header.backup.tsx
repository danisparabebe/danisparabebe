'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Header() {
    const { openCart, items } = useCartStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
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
        <header className="bg-[#FAF9F8] pt-2 pb-1 relative z-[60]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">

                <div className="flex h-16 items-center justify-between">
                    {/* Mobile Menu */}
                    <button className="lg:hidden p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors shrink-0 mr-2">
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Desktop Logo - Perfect symmetrical left wing */}
                    <div className="hidden lg:flex shrink-0 w-[200px] xl:w-[240px] items-center justify-center">
                        <Link href="/" className="block">
                            <img
                                src="/Logos/Logomarca%20Rose.png"
                                alt="Danis Para Bebê"
                                className="h-[56px] xl:h-[64px] w-auto object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>

                    {/* Mobile Logo */}
                    <div className="flex-1 flex justify-center lg:hidden h-full">
                        <Link href="/" className="flex items-center justify-center h-full">
                            <img
                                src="/Logos/Logomarca%20Rose.png"
                                alt="Danis Para Bebê"
                                className="h-[42px] w-auto object-contain hover:opacity-90 transition-opacity"
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
                                className="w-full rounded-full border border-black/5 px-5 py-2 pr-10 text-xs text-charcoal placeholder:text-slate focus:outline-none focus:border-dusty-rose/30 focus:ring-4 focus:ring-dusty-rose/10 bg-white/70 hover:bg-white focus:bg-white transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]"
                            />
                            {searchQuery ? (
                                <button type="button" onClick={handleClearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-slate hover:text-charcoal transition-colors cursor-pointer">
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-dusty-rose/10 group-hover/search:bg-dusty-rose p-2 text-dusty-rose group-hover/search:text-white transition-all duration-300 cursor-pointer">
                                <Search className="h-[18px] w-[18px]" />
                            </button>
                        </form>
                        <DropdownContent />
                    </div>

                    {/* Icons - Perfect symmetrical right wing */}
                    <div className="hidden lg:flex shrink-0 w-[200px] xl:w-[240px] items-center justify-end space-x-4">
                        <button className="p-2 text-charcoal hover:text-dusty-rose transition-all duration-300 relative cursor-pointer group/header-heart hover:scale-110 active:scale-95">
                            <Heart className="h-5 w-5 group-hover/header-heart:fill-dusty-rose/20" />
                        </button>
                        <button onClick={openCart} className="p-2 text-charcoal hover:text-dusty-rose relative transition-all duration-300 cursor-pointer group/cart hover:scale-110 active:scale-95">
                            <ShoppingCart className="h-5 w-5" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-dusty-rose text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-warm-stone group-hover/cart:scale-110 transition-transform duration-300 shadow-sm">
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
                            className="w-full rounded-full border border-line px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-dusty-rose bg-white/80 backdrop-blur-sm"
                        />
                        {searchQuery ? (
                            <button type="button" onClick={handleClearSearch} className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate hover:text-charcoal transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-dusty-rose p-1.5 text-white">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                    <DropdownContent />
                </div>
            </div>
        </header>
    );
}
