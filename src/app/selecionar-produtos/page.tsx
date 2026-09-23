'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, X, Search, Sparkles, ArrowLeft, Save, Copy, Eye, Filter } from 'lucide-react';
import { productControl } from '@/data/product-control';
import { MVP_PRODUCT_SELECTION } from '@/data/mvp-config';

export default function SelecionarProdutosPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState<'TODOS' | 'FEM' | 'MAS'>('TODOS');
    const [onlySelectedFilter, setOnlySelectedFilter] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Carrega a seleção salva atual ao abrir a página
    useEffect(() => {
        async function loadCurrent() {
            try {
                const res = await fetch('/api/mvp/save');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.selected)) {
                        setSelectedIds(data.selected.filter((id: string) => id && id.trim() !== ''));
                    }
                } else {
                    // Fallback para a constante importada
                    setSelectedIds(MVP_PRODUCT_SELECTION.filter(id => id && id.trim() !== ''));
                }
            } catch {
                setSelectedIds(MVP_PRODUCT_SELECTION.filter(id => id && id.trim() !== ''));
            } finally {
                setIsLoaded(true);
            }
        }
        loadCurrent();
    }, []);

    // Alterna a seleção de um produto
    const handleToggle = (id: string, shortCode?: string, name?: string) => {
        const identifier = shortCode || id;
        const isSelected = selectedIds.includes(identifier) || selectedIds.includes(id);

        if (isSelected) {
            setSelectedIds(prev => prev.filter(item => item !== identifier && item !== id));
            toast.info(`"${name || identifier}" removido da seleção.`);
        } else {
            if (selectedIds.length >= 10) {
                toast.error('Você já selecionou 10 produtos! Remova um antes de adicionar outro.');
                return;
            }
            setSelectedIds(prev => [...prev, identifier]);
            toast.success(`"${name || identifier}" adicionado ao MVP! (${selectedIds.length + 1} de 10)`);
        }
    };

    // Salva a seleção no arquivo do projeto
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/mvp/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedIds })
            });

            if (res.ok) {
                toast.success('🎉 Produtos do MVP salvos com sucesso! O site oficial já foi atualizado.', {
                    duration: 5000,
                });
            } else {
                toast.error('Erro ao salvar. Tente novamente.');
            }
        } catch {
            toast.error('Erro de conexão ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    // Copia a lista para mandar no chat
    const handleCopyList = () => {
        if (selectedIds.length === 0) {
            toast.info('Nenhum produto selecionado ainda.');
            return;
        }

        const lines = selectedIds.map((id, index) => {
            const prod = productControl.find(p => p.id === id || p.shortCode === id);
            return `${index + 1}. [${prod?.shortCode || id}] ${prod?.name || id}`;
        });

        const text = `Lista dos produtos para o MVP (${selectedIds.length}/10):\n\n` + lines.join('\n');
        navigator.clipboard.writeText(text);
        toast.success('📋 Lista copiada para a área de transferência! Só colar aqui no chat.');
    };

    // Filtros de produtos
    const filteredProducts = useMemo(() => {
        return productControl.filter(product => {
            const isSelected = selectedIds.includes(product.shortCode || '') || selectedIds.includes(product.id);

            // Filtro "Apenas selecionados"
            if (onlySelectedFilter && !isSelected) return false;

            // Filtro de gênero
            if (genderFilter === 'FEM' && !product.id.startsWith('FEM')) return false;
            if (genderFilter === 'MAS' && !product.id.startsWith('MAS')) return false;

            // Busca por texto
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchName = product.name.toLowerCase().includes(term);
                const matchCode = (product.shortCode || '').toLowerCase().includes(term);
                const matchTag = product.tags?.some(t => t.toLowerCase().includes(term));
                if (!matchName && !matchCode && !matchTag) return false;
            }

            return true;
        });
    }, [searchTerm, genderFilter, onlySelectedFilter, selectedIds]);

    return (
        <div className="min-h-screen bg-[#FAF9F8] text-charcoal font-dmSans pb-32">
            {/* Topbar de Navegação */}
            <header className="bg-white border-b border-line sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 rounded-xl hover:bg-warm-stone/20 text-slate hover:text-charcoal transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar ao Site</span>
                        </Link>
                        <div className="h-5 w-px bg-line hidden sm:block" />
                        <div>
                            <h1 className="text-base sm:text-lg font-bold font-heading text-charcoal flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-dusty-rose" />
                                Escolha dos Produtos do MVP
                            </h1>
                            <p className="text-[11px] text-slate">Clique nos produtos que deseja ativar para inaugurar o site</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyList}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line text-xs font-bold text-charcoal hover:bg-warm-stone/20 transition-colors"
                            title="Copiar lista para mandar no chat"
                        >
                            <Copy className="w-3.5 h-3.5 text-slate" />
                            <span>Copiar Lista</span>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-green hover:bg-[#9CBD9F] text-charcoal font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Salvando...' : 'Salvar no Site'}</span>
                        </button>
                    </div>
                </div>

                {/* Barra de Progresso Flutuante */}
                <div className="bg-warm-stone/30 border-t border-line px-4 py-2">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-xs font-bold text-charcoal">
                                Selecionados: <span className="text-dusty-rose text-sm font-extrabold">{selectedIds.length}</span> / 10
                            </span>
                            <div className="flex-1 sm:w-48 bg-white rounded-full h-2 overflow-hidden border border-line">
                                <div
                                    className="bg-sage-green-dark h-full transition-all duration-300"
                                    style={{ width: `${(selectedIds.length / 10) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Miniaturas dos Selecionados */}
                        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
                            {selectedIds.map((id, index) => {
                                const prod = productControl.find(p => p.id === id || p.shortCode === id);
                                return (
                                    <div
                                        key={id}
                                        onClick={() => handleToggle(id, prod?.shortCode, prod?.name)}
                                        className="relative group shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-sage-green-dark cursor-pointer shadow-xs"
                                        title={`#${index + 1}: ${prod?.name || id} (clique para remover)`}
                                    >
                                        <Image
                                            src={prod?.images?.[0] ? encodeURI(prod.images[0]) : '/Logos/Logomarca%20Rose.png'}
                                            alt={prod?.name || id}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                            ✕
                                        </div>
                                    </div>
                                );
                            })}
                            {Array.from({ length: Math.max(0, 10 - selectedIds.length) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-lg border border-dashed border-charcoal/20 flex items-center justify-center text-[10px] text-charcoal/30 font-bold shrink-0 bg-white/50"
                                >
                                    {selectedIds.length + i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-4 pt-6">
                {/* Filtros e Busca */}
                <div className="bg-white p-4 rounded-2xl border border-line shadow-xs mb-6 flex flex-col md:flex-row items-center gap-4 justify-between">
                    {/* Barra de Pesquisa */}
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome, tema (Safari, Borboleta...) ou código"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F8] border border-line rounded-xl text-xs text-charcoal placeholder:text-slate/60 focus:outline-none focus:border-sage-green focus:ring-2 focus:ring-sage-green/20"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Botões de Filtro */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <div className="flex items-center bg-[#FAF9F8] border border-line rounded-xl p-1 shrink-0">
                            <button
                                onClick={() => setGenderFilter('TODOS')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${genderFilter === 'TODOS' ? 'bg-white shadow-xs text-charcoal' : 'text-slate hover:text-charcoal'}`}
                            >
                                Todos ({productControl.length})
                            </button>
                            <button
                                onClick={() => setGenderFilter('FEM')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${genderFilter === 'FEM' ? 'bg-dusty-rose text-white shadow-xs' : 'text-slate hover:text-charcoal'}`}
                            >
                                Meninas
                            </button>
                            <button
                                onClick={() => setGenderFilter('MAS')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${genderFilter === 'MAS' ? 'bg-sage-green-dark text-white shadow-xs' : 'text-slate hover:text-charcoal'}`}
                            >
                                Meninos
                            </button>
                        </div>

                        <button
                            onClick={() => setOnlySelectedFilter(prev => !prev)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 ${onlySelectedFilter ? 'bg-charcoal text-white border-charcoal' : 'bg-white border-line text-charcoal hover:bg-warm-stone/20'}`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Ver Selecionados ({selectedIds.length})</span>
                        </button>
                    </div>
                </div>

                {/* Grade de Produtos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredProducts.map(product => {
                        const identifier = product.shortCode || product.id;
                        const isSelected = selectedIds.includes(identifier) || selectedIds.includes(product.id);
                        const selectionIndex = selectedIds.findIndex(id => id === identifier || id === product.id);

                        return (
                            <div
                                key={product.id}
                                onClick={() => handleToggle(product.id, product.shortCode, product.name)}
                                className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
                                    isSelected
                                        ? 'border-sage-green-dark ring-4 ring-sage-green/20 shadow-md'
                                        : 'border-line hover:border-charcoal/30 hover:shadow-sm'
                                }`}
                            >
                                {/* Imagem com overlay de seleção */}
                                <div className="relative aspect-[3/4] bg-[#FAF9F8] overflow-hidden">
                                    <Image
                                        src={product.images?.[0] ? encodeURI(product.images[0]) : '/Logos/Logomarca%20Rose.png'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Indicador de Seleção no Canto Superior */}
                                    <div className="absolute top-2.5 right-2.5 z-10">
                                        {isSelected ? (
                                            <div className="w-7 h-7 rounded-full bg-sage-green-dark text-white flex items-center justify-center font-bold text-xs shadow-md">
                                                ✓
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-white/80 border border-charcoal/20 group-hover:border-charcoal/40 flex items-center justify-center text-xs font-bold text-charcoal/40 transition-colors">
                                                +
                                            </div>
                                        )}
                                    </div>

                                    {/* Badge do Código Curto */}
                                    <div className="absolute top-2.5 left-2.5 z-10">
                                        <span className="bg-white/90 backdrop-blur-xs text-charcoal text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/5 shadow-xs">
                                            {product.shortCode || 'SKU'}
                                        </span>
                                    </div>

                                    {/* Faixa quando selecionado */}
                                    {isSelected && (
                                        <div className="absolute bottom-0 inset-x-0 bg-sage-green-dark text-white text-[11px] font-bold py-1 text-center shadow-xs flex items-center justify-center gap-1">
                                            <Check className="w-3 h-3" />
                                            <span>Selecionado #{selectionIndex + 1}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Dados do Produto */}
                                <div className="p-3 flex flex-col flex-1">
                                    <span className="text-[10px] uppercase font-bold text-slate tracking-wider">
                                        {product.category || 'Kit'}
                                    </span>
                                    <h3 className="text-xs font-bold text-charcoal line-clamp-2 mt-0.5 leading-snug">
                                        {product.name}
                                    </h3>

                                    <div className="mt-auto pt-2 flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-charcoal">
                                            R$ {product.pixPrice ? product.pixPrice.toFixed(2) : product.priceFull.toFixed(2)}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-sage-green text-charcoal' : 'bg-warm-stone/20 text-slate group-hover:text-charcoal'}`}>
                                            {isSelected ? 'No MVP' : '+ Adicionar'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-line">
                        <p className="text-sm font-bold text-charcoal">Nenhum produto encontrado com essa busca.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setGenderFilter('TODOS'); setOnlySelectedFilter(false); }}
                            className="mt-2 text-xs font-bold text-dusty-rose hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </main>

            {/* Barra Fixa Inferior de Ação */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-line p-3 shadow-lg z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-charcoal">
                            Total Selecionado: <span className="text-dusty-rose font-extrabold">{selectedIds.length}</span> de 10 produtos
                        </p>
                        <p className="text-[11px] text-slate hidden sm:block">
                            {selectedIds.length === 10
                                ? '✨ Perfeito! Seus 10 produtos estão prontos para inaugurar o site.'
                                : `Faltam ${10 - selectedIds.length} produtos para completar os 10.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyList}
                            className="px-3 py-2 rounded-xl border border-line text-xs font-bold text-charcoal hover:bg-warm-stone/20 transition-colors flex items-center gap-1.5"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copiar Lista</span>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-xl bg-sage-green hover:bg-[#9CBD9F] text-charcoal font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Salvando...' : 'Salvar e Publicar no Site'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
