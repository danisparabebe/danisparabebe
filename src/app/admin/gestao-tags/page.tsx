'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Tag, Check, X, ShieldCheck, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { productControl } from '@/data/product-control';
import { ManagedProduct } from '@/types/admin';

// The officially approved collections/tags
const AVAILABLE_TAGS = [
    'Bestsellers',
    'Essenciais',
    'Linha Premium',
    'Para Presentear',
    'Chá de Bebê',
    'Custo-Benefício',
    'Saída de Maternidade',
];

export default function GestaoTagsPage() {
    const [products, setProducts] = useState<ManagedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Filter states
    const [selectedTag, setSelectedTag] = useState<string | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load products exactly as they are in the control file
        setProducts(productControl);
        setIsLoading(false);
    }, []);

    const handleToggleTag = async (product: ManagedProduct, tagToToggle: string) => {
        setSavingId(product.id);
        
        let newTags = [...(product.tags || [])];
        if (newTags.includes(tagToToggle)) {
             newTags = newTags.filter(t => t !== tagToToggle);
        } else {
             newTags.push(tagToToggle);
        }

        try {
             // Optimistically update UI
             setProducts(prev => prev.map(p => 
                  p.id === product.id ? { ...p, tags: newTags } : p
             ));

             const response = await fetch('/api/admin/tags', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                       productId: product.id,
                       tags: newTags
                  })
             });

             const data = await response.json();
             
             if (!response.ok) {
                  throw new Error(data.error || 'Erro ao salvar tags.');
             }
             
             toast.success(`Coleções salvas para ${product.name}`);
        } catch (error: any) {
             console.error(error);
             toast.error(error.message || 'Erro ao se conectar ao servidor.');
             // Revert optimistic update
             setProducts(prev => prev.map(p => 
                  p.id === product.id ? { ...p, tags: product.tags } : p
             ));
        } finally {
             setSavingId(null);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesTag = selectedTag === 'ALL' || (p.tags && p.tags.includes(selectedTag));
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (p.technicalName || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTag && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[#10B981] animate-spin" />
                    <p className="text-gray-500 font-medium font-dmSans tracking-widest text-sm uppercase">Carregando acervo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-dmSans">
            
            {/* Elegant Header */}
            <div className="bg-white border-b border-black/5 px-8 flex items-center h-20 shadow-sm sticky top-0 z-30">
                <div className="flex-1 flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 rounded-xl">
                         <Tag className="w-6 h-6 text-indigo-600" />
                     </div>
                     <div>
                         <h1 className="text-xl font-black text-gray-900 font-fraunces tracking-tight">Gestão de Coleções (1 Clique)</h1>
                         <p className="text-sm text-gray-500">
                             Nesta tela você agrupa os produtos em categorias emocionais. Sem digitar código algum.
                         </p>
                     </div>
                </div>
                 <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                     <ShieldCheck className="w-5 h-5 text-green-600" />
                     <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Salva Direto no Código</span>
                 </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
                
                {/* Filters */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscar Produto</label>
                        <input 
                            type="text" 
                            placeholder="Nome ou SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm font-medium transition-all"
                        />
                    </div>
                    
                    <div className="flex-1 min-w-[300px] max-w-xl">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrar por Coleção</label>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm font-medium transition-all cursor-pointer"
                        >
                            <option value="ALL">Todas as Coleções ({products.length} produtos)</option>
                            {AVAILABLE_TAGS.map(tag => (
                                <option key={tag} value={tag}>{tag} ({products.filter(p => p.tags?.includes(tag)).length})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Info Text */}
                <div className="flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 text-sm">
                    <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                    <p>
                        Para associar um produto a uma coleção (ex: mostrar na página 'Saída de Maternidade'), basta <strong>clicar no botão cinza</strong> referente à coleção abaixo dele. 
                        Ele ficará <strong>Verde (Ativo)</strong>. 
                        A mudança será salva imediatamente e já estará listada no site oficial.
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xlg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-200 hover:shadow-md transition-all">
                             {/* Product Summary */}
                             <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50">
                                 <div className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden bg-white border border-gray-200">
                                      {product.images?.[0] ? (
                                           <Image 
                                               src={product.images[0]} 
                                               alt={product.name}
                                               fill
                                               className="object-cover"
                                               />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-300">Sem Foto</div>
                                      )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                      <p className="text-xs text-gray-500 font-mono mt-1 w-full truncate" title={product.id}>{product.id}</p>
                                      <div className="flex justify-between items-center mt-3">
                                          <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-700">{product.category}</span>
                                          <span className="text-sm font-black text-gray-900">R$ {product.priceFull.toFixed(2)}</span>
                                      </div>
                                 </div>
                             </div>

                             {/* Tags Container */}
                             <div className="p-5 flex-1 flex flex-col">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PERTENCE ÀS COLEÇÕES:</p>
                                 <div className="flex flex-wrap gap-2">
                                      {AVAILABLE_TAGS.map(tag => {
                                          const isSelected = product.tags?.includes(tag);
                                          const isSavingThisProduct = savingId === product.id;
                                          
                                          return (
                                              <button
                                                  key={tag}
                                                  disabled={isSavingThisProduct}
                                                  onClick={() => handleToggleTag(product, tag)}
                                                  className={`
                                                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                                      ${isSelected 
                                                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300' 
                                                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                                      }
                                                      ${isSavingThisProduct ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
                                                  `}
                                              >
                                                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                                                  {tag}
                                              </button>
                                          );
                                      })}
                                 </div>
                             </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                             Nenhum produto encontrado para estes filtros.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
