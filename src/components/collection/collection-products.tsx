'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/homepage/product-card';
import { ChevronDown, Filter } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category?: string;
    price: number;
    installmentPrice?: number;
    installments?: number;
    image: string;
    badge?: string;
    gender?: 'Menina' | 'Menino' | 'Unissex';
    isHot?: boolean;
}

interface CollectionProductsProps {
    title: string;
    products: Product[];
}

export function CollectionProducts({ title, products }: CollectionProductsProps) {
    const [sortBy, setSortBy] = useState('mais-vendidos');
    const [genderFilter, setGenderFilter] = useState('todos');
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Apply Gender Filter
        if (genderFilter !== 'todos') {
            result = result.filter(p => p.gender === genderFilter);
        }

        // Apply Sorting
        switch (sortBy) {
            case 'menor-preco':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'maior-preco':
                result.sort((a, b) => b.price - a.price);
                break;
            // 'mais-vendidos' could just be default order or randomly shuffled for MVP, 
            // since we don't have real sales data yet. Let's leave it as is.
            default:
                break;
        }

        return result;
    }, [products, sortBy, genderFilter]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-heading font-bold text-charcoal md:text-center md:text-4xl">
                {title}
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 space-y-6">
                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden w-full flex items-center justify-between bg-white border border-line p-3 rounded-xl shadow-sm text-charcoal font-medium"
                        onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="w-5 h-5" /> Filtros e Ordenação
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showFiltersMobile ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`space-y-8 ${showFiltersMobile ? 'block' : 'hidden'} lg:block`}>
                        {/* Sort */}
                        <div>
                            <h3 className="text-lg font-heading font-bold text-charcoal border-b border-line pb-2 mb-4">
                                Ordenar por
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { id: 'mais-vendidos', label: 'Mais Vendidos' },
                                    { id: 'menor-preco', label: 'Menor Preço' },
                                    { id: 'maior-preco', label: 'Maior Preço' },
                                ].map((option) => (
                                    <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value={option.id}
                                            checked={sortBy === option.id}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="text-dusty-rose focus:ring-dusty-rose h-4 w-4"
                                        />
                                        <span className={`text-sm ${sortBy === option.id ? 'font-semibold text-dusty-rose' : 'text-slate'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Gender Filter */}
                        <div>
                            <h3 className="text-lg font-heading font-bold text-charcoal border-b border-line pb-2 mb-4">
                                Gênero
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { id: 'todos', label: 'Todos os gêneros' },
                                    { id: 'Menino', label: 'Para Menino' },
                                    { id: 'Menina', label: 'Para Menina' },
                                    { id: 'Unissex', label: 'Unissex / Neutro' },
                                ].map((option) => (
                                    <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option.id}
                                            checked={genderFilter === option.id}
                                            onChange={(e) => setGenderFilter(e.target.value)}
                                            className="text-dusty-rose focus:ring-dusty-rose h-4 w-4"
                                        />
                                        <span className={`text-sm ${genderFilter === option.id ? 'font-semibold text-dusty-rose' : 'text-slate'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="mb-6 text-sm text-slate">
                        Mostrando {filteredAndSortedProducts.length} produtos
                    </div>

                    {filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {filteredAndSortedProducts.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-surface-white rounded-2xl border border-line border-dashed">
                            <p className="text-xl text-slate">Nenhum produto encontrado com esses filtros.</p>
                            <button
                                onClick={() => { setSortBy('mais-vendidos'); setGenderFilter('todos'); }}
                                className="mt-4 text-dusty-rose font-medium hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
