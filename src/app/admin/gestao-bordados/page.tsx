'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2, Link as LinkIcon, Check, Plus, Upload, Search, X, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { productControl } from '@/data/product-control';
import { ManagedProduct } from '@/types/admin';
import { THEMES_FEM, THEMES_MAS } from '@/data/admin-options';

type Bordado = {
    id: string;
    name: string;
    filename: string;
    url: string;
};

const ALL_THEMES = Array.from(
    new Map([...THEMES_FEM, ...THEMES_MAS].map((t) => [t.value, t])).values()
).filter(t => t.value !== 'TIM');

export default function GestaoBordadosPage() {
    const [products, setProducts] = useState<ManagedProduct[]>([]);
    const [bordados, setBordados] = useState<Bordado[]>([]);
    const [relationships, setRelationships] = useState<Record<string, Bordado[]>>({});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    // UI States
    const [viewMode, setViewMode] = useState<'products' | 'themes'>('products');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTarget, setSelectedTarget] = useState<{ id: string, name: string, technicalName?: string, isTheme?: boolean, images?: string[] } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setProducts(productControl);
        fetchBordadosData();
    }, []);

    const fetchBordadosData = async () => {
        try {
            const res = await fetch('/api/admin/bordados');
            const data = await res.json();
            
            if (data.success) {
                setBordados(data.bordados || []);
                setRelationships(data.relationships || {});
            } else {
                toast.error('Erro ao carregar dados dos bordados.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Erro de conexão ao carregar bordados.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        toast.loading(`Subindo ${file.name}...`, { id: 'upload-bordado' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/bordados/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            
            if (data.success) {
                toast.success('Bordado salvo com sucesso!', { id: 'upload-bordado' });
                // Refresh list
                await fetchBordadosData();
            } else {
                toast.error(data.error || 'Erro ao subir arquivo.', { id: 'upload-bordado' });
            }
        } catch (error) {
            toast.error('Erro de conexão ao fazer upload.', { id: 'upload-bordado' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleBordadoLink = async (bordado: Bordado) => {
        if (!selectedTarget) return;

        const targetId = selectedTarget.isTheme ? `THEME_${selectedTarget.id}` : selectedTarget.id;
        const currentLinks = relationships[targetId] || [];
        const isLinked = currentLinks.some(b => b.id === bordado.id);
        
        let newLinks;
        if (isLinked) {
            newLinks = currentLinks.filter(b => b.id !== bordado.id);
        } else {
            newLinks = [...currentLinks, bordado];
        }

        // Optimistic UI update
        setRelationships(prev => ({
            ...prev,
            [targetId]: newLinks
        }));

        // Persist
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/bordados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: targetId,
                    linkedBordados: newLinks
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            
            toast.success(`Bordados atualizados para ${selectedTarget.name}`);
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar vínculo.');
            // Revert
            setRelationships(prev => ({
                ...prev,
                [targetId]: currentLinks
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const term = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(term) || (p.technicalName || '').toLowerCase().includes(term);
    });

    const filteredThemes = ALL_THEMES.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase()));

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium tracking-widest text-sm uppercase">Carregando Acervo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans flex flex-col overflow-hidden h-screen">
            
            {/* Elegant Header */}
            <div className="bg-white border-b border-black/5 px-8 shrink-0 flex items-center h-20 shadow-sm z-30">
                <div className="flex-1 flex items-center gap-4">
                     <div className="p-3 bg-fuchsia-50 rounded-xl">
                         <LinkIcon className="w-6 h-6 text-fuchsia-600" />
                     </div>
                     <div>
                         <h1 className="text-xl font-black text-slate-900 tracking-tight">Gestão de Bordados</h1>
                         <p className="text-sm text-slate-500">
                             Atrele os arquivos de imagem de bordados aos produtos do catálogo ou vincule-os diretamente a um Tema específico.
                         </p>
                     </div>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 p-1 mx-4 rounded-xl border border-slate-200">
                    <button 
                        onClick={() => { setViewMode('products'); setSelectedTarget(null); setSearchTerm(''); }}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'products' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Kits e Produtos
                    </button>
                    <button 
                        onClick={() => { setViewMode('themes'); setSelectedTarget(null); setSearchTerm(''); }}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'themes' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Temas e Categorias
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Salva Localmente</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Products List */}
                <div className="w-1/3 min-w-[350px] border-r border-slate-200 bg-white flex flex-col h-full shadow-sm z-20">
                    <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder={viewMode === 'products' ? "Buscar Produto ou SKU..." : "Buscar Tema..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm font-medium transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                        {viewMode === 'products' ? (
                            <>
                                {filteredProducts.map(product => {
                                    const linkedCount = relationships[product.id]?.length || 0;
                                    const isSelected = selectedTarget?.id === product.id;
                                    
                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => setSelectedTarget(product)}
                                            className={`w-full text-left p-3 rounded-2xl flex flex-col gap-3 transition-all border ${
                                                isSelected 
                                                ? 'bg-indigo-50 border-indigo-300 shadow-md ring-2 ring-indigo-500/20 ring-offset-1' 
                                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="w-full aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0]} alt={product.name} fill className="object-cover hover:scale-105 transition-transform duration-500" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold text-center p-4">Sem Foto</div>
                                                )}
                                                
                                                <div className={`absolute top-3 right-3 shrink-0 text-xs font-black px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md ${linkedCount > 0 ? 'bg-fuchsia-600/90 text-white border border-fuchsia-400/50' : 'bg-white/80 text-slate-500 border border-slate-200/50'}`}>
                                                    {linkedCount} {linkedCount === 1 ? 'Bordado' : 'Bordados'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 w-full px-1">
                                                <p className={`text-[15px] font-black leading-tight flex items-start truncate w-full ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                                                    {product.name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-mono truncate w-full mt-1.5 uppercase tracking-wide">
                                                    {product.technicalName}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredProducts.length === 0 && (
                                    <div className="p-8 text-center text-sm text-slate-500">Nenhum produto encontrado.</div>
                                )}
                            </>
                        ) : (
                            <>
                                {filteredThemes.map(theme => {
                                    const themeKey = `THEME_${theme.value}`;
                                    const linkedCount = relationships[themeKey]?.length || 0;
                                    const isSelected = selectedTarget?.id === theme.value;
                                    
                                    return (
                                        <button
                                            key={theme.value}
                                            onClick={() => setSelectedTarget({ id: theme.value, name: theme.label, isTheme: true })}
                                            className={`w-full text-left p-4 rounded-2xl flex flex-col gap-3 transition-all border ${
                                                isSelected 
                                                ? 'bg-fuchsia-50 border-fuchsia-300 shadow-md ring-2 ring-fuchsia-500/20 ring-offset-1' 
                                                : 'bg-white border-slate-200 hover:border-fuchsia-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <p className={`text-lg font-black font-fraunces leading-tight ${isSelected ? 'text-fuchsia-950' : 'text-slate-800'}`}>
                                                    {theme.label}
                                                </p>
                                                <div className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-md shadow-sm ${linkedCount > 0 ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {linkedCount}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">CÓD: {theme.value}</p>
                                        </button>
                                    );
                                })}
                                {filteredThemes.length === 0 && (
                                    <div className="p-8 text-center text-sm text-slate-500">Nenhum tema encontrado.</div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel: Embroideries Selector */}
                <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
                    {!selectedTarget ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50/50">
                            <div className="w-24 h-24 mb-6 rounded-3xl bg-white shadow-sm border border-slate-200 flex items-center justify-center rotate-3 scale-110">
                                <LinkIcon className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-xl font-black text-slate-700 mb-2 font-fraunces">
                                {viewMode === 'products' ? 'Selecione um Produto' : 'Selecione um Tema'}
                            </p>
                            <p className="text-sm max-w-sm text-center">
                                {viewMode === 'products' 
                                 ? 'Escolha um produto na lista à esquerda para gerenciar os bordados associados a ele.'
                                 : 'Escolha um tema genérico à esquerda para atrelar bordados que aparecerão diretamente nele.'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Selected Target Header */}
                            <div className="p-6 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
                                <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${selectedTarget.isTheme ? 'text-fuchsia-600' : 'text-indigo-600'}`}>
                                    Gerenciando Vínculos de Bordados — {selectedTarget.isTheme ? 'TEMA GERAL' : 'KIT'}
                                </p>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight font-fraunces break-words">
                                    {selectedTarget.name}
                                </h2>
                                {!selectedTarget.isTheme && selectedTarget.technicalName && (
                                    <p className="text-xs font-mono text-slate-500 mt-1">{selectedTarget.technicalName}</p>
                                )}
                            </div>

                            {/* Embedroideries Grid */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 border-x border-slate-200 bg-slate-50/80 shadow-[inset_0_2px_10px_-5px_rgba(0,0,0,0.1)]">
                                
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                                        Acervo de Bordados ({bordados.length})
                                    </h3>
                                    
                                    <div className="flex gap-3">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-900/10 active:scale-[0.98]"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            Subir Novo Bordado
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {bordados.map(bordado => {
                                        const targetId = selectedTarget.isTheme ? `THEME_${selectedTarget.id}` : selectedTarget.id;
                                        const isLinked = (relationships[targetId] || []).some(b => b.id === bordado.id);
                                        
                                        return (
                                            <div 
                                                key={bordado.id}
                                                onClick={() => !isSaving && toggleBordadoLink(bordado)}
                                                className={`
                                                    relative rounded-2xl border p-3 flex flex-col items-center transition-all cursor-pointer group bg-white hover:shadow-lg
                                                    ${isLinked 
                                                        ? 'border-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]'
                                                        : 'border-slate-200 hover:border-indigo-200'
                                                    }
                                                    ${isSaving ? 'opacity-50 pointer-events-none' : ''}
                                                `}
                                            >
                                                <div className="w-full aspect-square relative mb-3 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 mt-1">
                                                    <Image 
                                                        src={bordado.url} 
                                                        alt={bordado.name} 
                                                        fill 
                                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                                                        unoptimized
                                                    />
                                                    
                                                    {/* Checkbox Overlay */}
                                                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm backdrop-blur-sm ${isLinked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/80 border-slate-300 text-transparent group-hover:border-indigo-400'}`}>
                                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                    </div>
                                                </div>
                                                
                                                <p className="text-xs font-bold text-center text-slate-800 line-clamp-2 leading-snug w-full px-1">
                                                    {bordado.name}
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {bordados.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                                            Nenhum bordado encontrado no servidor. Suba um novo.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
