'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Sparkles, Plus, Trash2, ArrowUp, ArrowDown, Save, Eye,
    Palette, Upload, ExternalLink, Check, Copy, RefreshCw,
    Search, X, Edit3, Image as ImageIcon, ChevronDown, ChevronUp,
    Star, ArrowLeftRight, CheckCircle2, Clock
} from 'lucide-react';
import { ManagedProduct, ProductColorVariation } from '@/types/admin';
import { getColorHex, detectColorFromProduct, extractThemeKeyword } from '@/lib/color-variations';
import { getFinalPrice } from '@/lib/utils';
import { KIT_RECIPES } from '@/data/admin-options';
import { getProductPricing } from '@/data/pricing';
import { generateProductDescription } from '@/lib/description-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Lista dos 25 modelos recém-conferidos e nomeados manualmente pelo usuário
export const RECENT_BATCH_25_IDS = [
    'FEM-KIT-BOR-LIL-BAB-LIL_01',
    'FEM-KIT-BOR-RSA-BAB-RSA_01',
    'FEM-KIT-BOR-RSA-BAB-RSA_02',
    'FEM-KIT-BOR-RSA-BAB-RSA_03',
    'FEM-KIT-FLO-RSA-BAB-RSA_01',
    'FEM-KIT-FLO-RSE-BAB-RSE_01',
    'FEM-KIT-MON-RSA-BAB-RSA_03',
    'FEM-KIT-MON-RSE-BAB-RSE_01',
    'FEM-KIT-MON-RSE-BAB-RSE_02',
    'FEM-KIT-PER-RSA-BAB-RSE-RSA_01',
    'FEM-KIT-URS-RSA-BAB-RSA_01',
    'FEM-KIT-URS-RSE-BAB-RSE_01',
    'MAS-KIT-CAV-AZM-BAB-AZM_01',
    'MAS-KIT-CAV-VDM-BAB-VDM_01',
    'MAS-KIT-JDE-VDM-BAB-VDM_01',
    'MAS-KIT-JDE-VDM-BAB-VDM_03',
    'MAS-KIT-JDE-VDM-BAB-VDM_04',
    'MAS-KIT-MON-AZM-BAB-AZM_02',
    'MAS-KIT-MON-CNZ-BAB-BCO_01',
    'MAS-KIT-URS-ABB-BAB-ABB_05',
    'MAS-KIT-URS-AZM-BAB-AZM_01',
    'MAS-KIT-URS-AZM-BAB-AZM_02',
    'MAS-KIT-URS-AZM-BAB-AZM_03',
    'MAS-KIT-URS-VDC-BAB-VDC_01',
    'MAS-KIT-URS-VDC-BAB-VDC_02'
];
const RECENT_SET = new Set(RECENT_BATCH_25_IDS);

interface MvpLaunchPanelProps {
    products: ManagedProduct[];
    setProducts: React.Dispatch<React.SetStateAction<ManagedProduct[]>>;
    library: any[];
    onSaveMvp: (customProducts?: ManagedProduct[]) => Promise<void>;
    isSaving: boolean;
}

export function MvpLaunchPanel({
    products,
    setProducts,
    library,
    onSaveMvp,
    isSaving
}: MvpLaunchPanelProps) {
    // Lista dos produtos ativos no lançamento
    const mvpProducts = products.filter(p => p.mvpEnabled === true);

    // Modal: Adicionar Produto ao Lançamento (inicia já nos 25 para facilitar a vida do usuário)
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'ALL' | 'Kits' | 'Geral' | 'RECENT' | 'RECEM_CADASTRADOS'>('RECEM_CADASTRADOS');

    // Modal: Importar Kit Existente como Variação de Cor
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [targetProductId, setTargetProductId] = useState<string | null>(null);
    const [importSearchTerm, setImportSearchTerm] = useState('');
    const [isManualVariationOpen, setIsManualVariationOpen] = useState(false);

    // Modal: Trocar / Substituir Capa / Foto Original
    const [coverModalOpen, setCoverModalOpen] = useState(false);
    const [coverTargetProduct, setCoverTargetProduct] = useState<ManagedProduct | null>(null);
    const [coverLibrarySearch, setCoverLibrarySearch] = useState('');

    // Formulário de Edição / Adição de Variação
    const [editingVariationId, setEditingVariationId] = useState<string | null>(null);
    const [varColorName, setVarColorName] = useState('');
    const [varTitle, setVarTitle] = useState('');
    const [varDescription, setVarDescription] = useState('');
    const [varImage, setVarImage] = useState('');
    const [varPrice, setVarPrice] = useState<number | undefined>(undefined);
    const [varOriginalSku, setVarOriginalSku] = useState<string | undefined>(undefined);

    // Estado para expandir descrições
    const [expandedDescMap, setExpandedDescMap] = useState<Record<string, boolean>>({});

    const targetProduct = products.find(p => p.id === targetProductId);

    const totalVariationsCount = mvpProducts.reduce(
        (acc, p) => acc + (p.colorVariations?.length || 0), 0
    );

    // ========================================================
    // CONVERSÃO E UNIFICAÇÃO DO ACERVO RECÉM CADASTRADO
    // ========================================================

    const convertLibItemToProduct = (libItem: any): ManagedProduct => {
        const techName = libItem.id;
        let rawComp = libItem.raw?.composition;

        if (!rawComp || !Array.isArray(rawComp) || rawComp.length === 0) {
            if (libItem.type === 'KIT') {
                const kitMatch = KIT_RECIPES.find(r => r.name.toLowerCase() === (libItem.name || '').trim().toLowerCase());
                if (kitMatch) {
                    rawComp = Object.entries(kitMatch.items).map(([k, v]) => ({ type: k, qty: v }));
                }
            } else if (libItem.type && libItem.type !== 'Geral') {
                rawComp = [{ type: libItem.type, qty: 1 }];
            }
        }

        const productComp = (rawComp && Array.isArray(rawComp)) ? rawComp.map((c: any) => ({ type: c.type, qty: Number(c.qty || 1) })) : [];
        const hasFrufruFlag = libItem.raw?.hasFrufru || false;
        const totalItens = productComp.reduce((sum: number, c: any) => sum + Number(c.qty || 1), 0);

        const compositionFeatures = productComp.length > 0
            ? productComp.map((c: any) => {
                let code = c.type;
                if (hasFrufruFlag && code === 'FRP') code = 'FRP_FRU';
                if (hasFrufruFlag && code === 'FRG') code = 'FRG_FRU';
                return `${c.qty}x ${code}`;
            })
            : [totalItens === 1 ? '1 Peça' : `${totalItens} Peças`];

        const pricing = getProductPricing(productComp, libItem.name, hasFrufruFlag);
        const autoDesc = generateProductDescription({
            name: libItem.name || techName,
            composition: productComp,
            theme: libItem.theme,
            color: libItem.color,
            category: libItem.category || (techName.startsWith('FEM') ? 'FEM' : techName.startsWith('MAS') ? 'MAS' : 'UNI'),
            detail: libItem.raw?.filters?.detail,
            hasFrufru: libItem.raw?.hasFrufru,
        });

        const imagePath = libItem.images?.[0] || libItem.image || (libItem.filename ? `/produtos/conferidos/${libItem.filename}` : '');

        return {
            id: libItem.id,
            name: libItem.name,
            technicalName: techName,
            description: autoDesc,
            features: compositionFeatures,
            priceFull: pricing.priceFull || 0,
            originalPriceFull: pricing.originalPriceFull || pricing.priceFull || 0,
            pixPrice: pricing.pixPrice || pricing.priceFull || 0,
            discountPct: pricing.discountPct || 0,
            images: [imagePath],
            gridPosition: 'FEATURED',
            category: libItem.type === 'KIT' ? 'Kits' : (libItem.type || 'Geral'),
            tags: ['novidade', (libItem.theme || '').toLowerCase()],
            published: true,
            publishedAt: libItem.raw?.publishedAt || null,
            updatedAt: libItem.updatedAt || libItem.raw?.updatedAt || libItem.raw?.mtime || null,
            mvpEnabled: false
        };
    };

    // Unifica produtos do catálogo com novos produtos salvos no acervo (library)
    const existingProductIds = new Set(products.map(p => p.id));
    const seenLibraryIds = new Set<string>();

    const convertedLibraryProducts: ManagedProduct[] = [];
    for (const libItem of library) {
        if (existingProductIds.has(libItem.id)) continue;
        if (seenLibraryIds.has(libItem.id)) continue;
        seenLibraryIds.add(libItem.id);
        convertedLibraryProducts.push(convertLibItemToProduct(libItem));
    }

    const allCatalogProducts = [...products, ...convertedLibraryProducts];

    // ========================================================
    // AÇÕES DE PRODUTO
    // ========================================================

    const addProductToMvp = (id: string) => {
        setProducts(prev => {
            const exists = prev.some(p => p.id === id);
            if (exists) {
                return prev.map(p => p.id === id ? { ...p, mvpEnabled: true } : p);
            }
            // Se veio do acervo recém cadastrado
            const candidate = convertedLibraryProducts.find(p => p.id === id);
            if (candidate) {
                return [{ ...candidate, mvpEnabled: true }, ...prev];
            }
            return prev;
        });
        toast.success("Produto adicionado ao Lançamento MVP!");
    };

    const removeProductFromMvp = (id: string, name: string) => {
        if (confirm(`Remover "${name}" do Lançamento MVP?`)) {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, mvpEnabled: false } : p));
            toast.info(`"${name}" removido do lançamento.`);
        }
    };

    const moveMvpProduct = (id: string, direction: 'up' | 'down') => {
        setProducts(prev => {
            const mvpList = prev.filter(p => p.mvpEnabled === true);
            const index = mvpList.findIndex(p => p.id === id);
            if (index === -1) return prev;

            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= mvpList.length) return prev;

            const itemA = mvpList[index];
            const itemB = mvpList[targetIndex];

            const newArr = [...prev];
            const idxA = newArr.findIndex(p => p.id === itemA.id);
            const idxB = newArr.findIndex(p => p.id === itemB.id);

            newArr[idxA] = itemB;
            newArr[idxB] = itemA;

            return newArr;
        });
    };

    const updateProductField = (id: string, field: keyof ManagedProduct, value: any) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    // ========================================================
    // TROCAR A CAPA / SUBSTITUIR FOTO ORIGINAL
    // ========================================================

    const setVariationAsCover = (productId: string, variation: ProductColorVariation) => {
        setProducts(prev => prev.map(p => {
            if (p.id !== productId) return p;

            const oldCover = p.images[0];
            const newCover = variation.image;

            // Coloca a imagem da variação na posição 0
            const updatedImages = [newCover, ...p.images.filter(img => img !== newCover)];

            // Atualiza a variação para que fique com a imagem antiga ou se mantenha
            const updatedVars = (p.colorVariations || []).map(v => {
                if (v.id === variation.id) {
                    return { ...v, image: oldCover };
                }
                return v;
            });

            return {
                ...p,
                images: updatedImages,
                colorVariations: updatedVars
            };
        }));

        toast.success(`Foto de capa alterada para a cor "${variation.colorName}"! 🌟`);
    };

    const handleReplaceMainCover = (newImageUrl: string) => {
        if (!coverTargetProduct) return;

        setProducts(prev => prev.map(p => {
            if (p.id !== coverTargetProduct.id) return p;
            const updatedImages = [...p.images];
            updatedImages[0] = newImageUrl;
            return { ...p, images: updatedImages };
        }));

        toast.success("Foto de capa substituída com sucesso!");
        setCoverModalOpen(false);
    };

    const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !coverTargetProduct) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            toast.loading("Enviando nova foto...", { id: 'upload-cover' });
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url || data.filePath) {
                const finalUrl = data.url || data.filePath;
                handleReplaceMainCover(finalUrl);
                toast.success("Foto original atualizada!", { id: 'upload-cover' });
            } else {
                toast.error("Erro no upload", { id: 'upload-cover' });
            }
        } catch {
            toast.error("Erro ao enviar imagem", { id: 'upload-cover' });
        }
    };

    // ========================================================
    // IMPORTAR KIT EXISTENTE DE OUTRA COR
    // ========================================================

    // Multi-select: IDs dos kits marcados para importar de uma vez
    const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set());

    const openImportVariationModal = (product: ManagedProduct) => {
        setTargetProductId(product.id);
        setEditingVariationId(null);
        setIsManualVariationOpen(false);
        setImportSearchTerm('');
        setSelectedImportIds(new Set());
        setImportModalOpen(true);
    };

    const toggleImportSelection = (kitId: string) => {
        setSelectedImportIds(prev => {
            const next = new Set(prev);
            if (next.has(kitId)) {
                next.delete(kitId);
            } else {
                next.add(kitId);
            }
            return next;
        });
    };

    const selectAllSuggested = () => {
        if (!suggestedKits || suggestedKits.length === 0) return;
        setSelectedImportIds(new Set(suggestedKits.map(k => k.id)));
        toast.info(`${suggestedKits.length} kits sugeridos selecionados!`);
    };

    const clearSelection = () => {
        setSelectedImportIds(new Set());
    };

    const handleConfirmBatchImport = () => {
        if (!targetProduct) return;
        if (selectedImportIds.size === 0) {
            toast.info("Nenhum kit selecionado. Marque os kits que deseja importar.");
            return;
        }

        const kitsToImport = products.filter(p => selectedImportIds.has(p.id));

        const newVariations: ProductColorVariation[] = kitsToImport.map(kit => {
            const detectedColor = detectColorFromProduct(kit);
            const autoTitle = kit.name || `${targetProduct.name} - ${detectedColor}`;
            const autoDesc = kit.description || targetProduct.description || '';
            const autoImg = kit.images?.[0] || targetProduct.images[0];
            const autoPrice = kit.pixPrice || getFinalPrice(kit) || targetProduct.pixPrice;

            return {
                id: kit.id || `${targetProduct.id}-var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                colorName: detectedColor,
                colorHex: getColorHex(detectedColor),
                title: autoTitle,
                description: autoDesc,
                image: autoImg,
                pixPrice: autoPrice,
                priceFull: kit.priceFull || targetProduct.priceFull
            };
        });

        setProducts(prev => prev.map(p => {
            if (p.id !== targetProduct.id) return p;

            const existingVars = p.colorVariations || [];
            // Remove variações que tenham o mesmo ID dos novos importados para evitar duplicidade
            const filtered = existingVars.filter(v => !selectedImportIds.has(v.id));

            return {
                ...p,
                colorVariations: [...filtered, ...newVariations]
            };
        }));

        toast.success(`🎉 ${newVariations.length} jogos de cores importados com sucesso!`);
        setImportModalOpen(false);

        // Previne voltar ao topo: rola suavemente até o produto que estava sendo editado
        setTimeout(() => {
            const el = document.getElementById(`product-card-${targetProduct.id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const openEditVariationModal = (product: ManagedProduct, variation: ProductColorVariation) => {
        setTargetProductId(product.id);
        setEditingVariationId(variation.id);
        setVarColorName(variation.colorName);
        setVarTitle(variation.title);
        setVarDescription(variation.description);
        setVarImage(variation.image);
        setVarPrice(variation.pixPrice);
        setVarOriginalSku(variation.id);
        setIsManualVariationOpen(true);
        setImportModalOpen(true);
    };

    const handleSaveManualVariation = () => {
        if (!targetProductId) return;
        if (!varColorName.trim()) {
            toast.error("Informe o nome da cor (ex: Rosa Bebê)");
            return;
        }
        if (!varTitle.trim()) {
            toast.error("Informe o título para este jogo de cor");
            return;
        }

        const variationId = editingVariationId || `${targetProductId}-var-${Date.now()}`;
        const newVariation: ProductColorVariation = {
            id: variationId,
            colorName: varColorName.trim(),
            colorHex: getColorHex(varColorName.trim()),
            title: varTitle.trim(),
            description: varDescription.trim(),
            image: varImage || (targetProduct?.images?.[0] || ''),
            pixPrice: varPrice,
            priceFull: targetProduct?.priceFull,
        };

        setProducts(prev => prev.map(p => {
            if (p.id !== targetProductId) return p;

            const currentVars = p.colorVariations || [];
            let updatedVars: ProductColorVariation[];

            if (editingVariationId) {
                updatedVars = currentVars.map(v => v.id === editingVariationId ? newVariation : v);
            } else {
                updatedVars = [...currentVars, newVariation];
            }

            return { ...p, colorVariations: updatedVars };
        }));

        toast.success(
            editingVariationId
                ? `Variação "${newVariation.colorName}" atualizada!`
                : `Jogo de cor "${newVariation.colorName}" adicionado com sucesso! 🎉`
        );
        setImportModalOpen(false);
    };

    const handleDeleteVariation = (productId: string, variationId: string, colorName: string) => {
        if (confirm(`Excluir o jogo de cor "${colorName}"?`)) {
            setProducts(prev => prev.map(p => {
                if (p.id !== productId) return p;
                const filtered = (p.colorVariations || []).filter(v => v.id !== variationId);
                return { ...p, colorVariations: filtered };
            }));
            toast.info(`Variação "${colorName}" removida.`);
        }
    };

    // ========================================================
    // KITS SUGERIDOS DO MESMO TEMA (PARA IMPORTAÇÃO)
    // ========================================================
    const getSuggestedKits = (currentProd?: ManagedProduct) => {
        if (!currentProd) return [];
        const themeTerm = extractThemeKeyword(currentProd).toLowerCase();

        return products.filter(p => {
            if (p.id === currentProd.id) return false; // Não é ele mesmo
            const pTheme = extractThemeKeyword(p).toLowerCase();
            const matchesTheme = themeTerm && (pTheme.includes(themeTerm) || themeTerm.includes(pTheme));
            const isKit = (p.category === 'Kits' || p.name.toLowerCase().includes('kit'));
            return matchesTheme && isKit;
        });
    };

    const suggestedKits = targetProduct ? getSuggestedKits(targetProduct) : [];

    // Todos os outros kits disponíveis no catálogo para importação
    const allSearchableKits = allCatalogProducts.filter(p => {
        if (targetProduct && p.id === targetProduct.id) return false;
        if (!importSearchTerm.trim()) return true;
        const term = importSearchTerm.toLowerCase();
        return p.name.toLowerCase().includes(term) ||
            p.id.toLowerCase().includes(term) ||
            (p.shortCode && p.shortCode.toLowerCase().includes(term));
    });

    const getProductTimestamp = (p: ManagedProduct): number => {
        // 1. updatedAt direto no produto
        if (p.updatedAt) {
            const t = new Date(p.updatedAt).getTime();
            if (!isNaN(t)) return t;
        }

        // 2. publishedAt
        if (p.publishedAt) {
            const t = new Date(p.publishedAt).getTime();
            if (!isNaN(t)) return t;
        }

        // 3. mtime do acervo (library)
        const libItem = library.find(item => item.id === p.id);
        const libDate = libItem?.updatedAt || libItem?.raw?.updatedAt || libItem?.raw?.mtime;
        if (libDate) {
            const t = new Date(libDate).getTime();
            if (!isNaN(t)) return t;
        }

        // 4. Timestamp no nome da imagem (ex: 1790892423162-...)
        const firstImg = p.images?.[0] || '';
        const tsMatch = firstImg.match(/(\d{13})/);
        if (tsMatch) {
            const t = parseInt(tsMatch[1], 10);
            if (!isNaN(t) && t > 1600000000000) return t;
        }

        return 0;
    };

    const availableRecent25Count = allCatalogProducts.filter(p => RECENT_SET.has(p.id) && !p.mvpEnabled).length;

    const handleAddAll25Recent = () => {
        const toAdd = allCatalogProducts.filter(p => RECENT_SET.has(p.id) && !p.mvpEnabled);
        if (toAdd.length === 0) {
            toast.info("Todos os 25 modelos já foram adicionados ao Lançamento MVP!");
            return;
        }

        setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const updated = prev.map(p => RECENT_SET.has(p.id) ? { ...p, mvpEnabled: true } : p);
            const brandNew = toAdd.filter(p => !existingIds.has(p.id)).map(p => ({ ...p, mvpEnabled: true }));
            return [...brandNew, ...updated];
        });

        toast.success(`🎉 Sucesso! ${toAdd.length} modelos foram adicionados ao Lançamento MVP de uma vez!`);
    };

    const availableToAdd = allCatalogProducts.filter(p => {
        if (p.mvpEnabled === true) return false;
        const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            (p.shortCode && p.shortCode.toLowerCase().includes(productSearchTerm.toLowerCase()));

        if (selectedCategoryFilter === 'RECEM_CADASTRADOS') {
            return matchesSearch && RECENT_SET.has(p.id);
        }

        const matchesCategory = selectedCategoryFilter === 'ALL' ||
            selectedCategoryFilter === 'RECENT' ||
            (p.category || 'Geral').toLowerCase() === selectedCategoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    // Se estiver no filtro "Recém Adicionados" ou "Recém Cadastrados", ordena do mais recente para o mais antigo
    if (selectedCategoryFilter === 'RECENT' || selectedCategoryFilter === 'RECEM_CADASTRADOS') {
        availableToAdd.sort((a, b) => {
            const timeA = getProductTimestamp(a);
            const timeB = getProductTimestamp(b);
            return timeB - timeA;
        });
    }

    return (
        <div className="font-sans space-y-5 pb-16">
            {/* ─── BANNER SUPERIOR ─── */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-gradient-to-r from-amber-400 to-amber-200 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-slate-950" />
                                Vitrine Oficial · Lançamento do Site
                            </span>
                            <span className="text-xs text-indigo-300 font-medium">
                                MVP Definitivo
                            </span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                            Painel de Lançamento MVP & Jogos de Cores
                        </h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                            Organize os produtos da inauguração, veja os <strong>nomes originais</strong> do banco de dados,
                            <strong> importe kits existentes de outras cores</strong>, troque capas e sincronize tudo diretamente com o banco de dados oficial.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <Link
                            href="/"
                            target="_blank"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold h-9 px-3.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm"
                        >
                            <Eye className="w-3.5 h-3.5 text-indigo-300" />
                            Ver Loja ao Vivo
                        </Link>

                        <Button
                            onClick={() => setIsAddProductModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            + Adicionar Produto
                        </Button>

                        <Button
                            onClick={() => onSaveMvp()}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black h-9 px-5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar & Sincronizar Tudo
                        </Button>
                    </div>
                </div>

                {/* Métricas Rápidas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
                    <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Produtos Ativos no MVP</span>
                        <span className="text-xl font-black text-white">{mvpProducts.length} itens</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jogos de Cores Vinculados</span>
                        <span className="text-xl font-black text-amber-300">{totalVariationsCount} cores</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Banco de Dados Original</span>
                        <span className="text-xl font-black text-emerald-400">Sincronizado</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Limite de Produtos</span>
                        <span className="text-xl font-black text-indigo-300">Livre (Qtd Ilimitada)</span>
                    </div>
                </div>
            </div>

            {/* ─── LISTA DE CARDS DO LANÇAMENTO MVP ─── */}
            {mvpProducts.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-300 bg-white/70 rounded-2xl">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Nenhum produto selecionado para o Lançamento MVP</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                        Adicione os kits oficiais do lançamento clicando no botão abaixo.
                    </p>
                    <Button
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-6 rounded-xl"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Escolher Produtos para o Lançamento
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {mvpProducts.map((product, idx) => {
                        const variations = product.colorVariations || [];
                        const pixPrice = product.pixPrice || getFinalPrice(product);
                        const isDescExpanded = !!expandedDescMap[product.id];
                        const originalName = product.technicalName || product.id;

                        return (
                            <Card
                                id={`product-card-${product.id}`}
                                key={product.id}
                                className="bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden group scroll-mt-24"
                            >
                                {/* TOPO DO CARD: PRODUTO PRINCIPAL */}
                                <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">
                                    {/* Mini Foto Principal / Capa */}
                                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group/img shadow-xs">
                                        <Image
                                            src={product.images[0] || '/api/placeholder/150/150'}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                                        />
                                        <Badge className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0 border-none">
                                            #{idx + 1}
                                        </Badge>
                                        
                                        {/* Botão de Trocar Capa / Foto Original no Hover */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCoverTargetProduct(product);
                                                setCoverModalOpen(true);
                                            }}
                                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                                            title="Trocar Capa ou Substituir Foto Original"
                                        >
                                            <ArrowLeftRight className="w-4 h-4 text-amber-300" />
                                            <span>Trocar Capa</span>
                                        </button>
                                    </div>

                                    {/* Informações Principais */}
                                    <div className="flex-1 min-w-0 space-y-3 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                        {product.category || 'Kits'}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                                                        {product.shortCode || product.id}
                                                    </span>
                                                </div>

                                                {/* NOME COMERCIAL — Editável inline */}
                                                <input
                                                    type="text"
                                                    value={product.name}
                                                    onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                                                    className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-snug bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:px-2 focus:rounded-lg outline-none transition-all w-full"
                                                    title="Clique para renomear este produto"
                                                />

                                                {/* REQUISITO: VER O NOME ORIGINAL */}
                                                <div className="flex items-center gap-1.5 mt-1.5 bg-amber-50/70 border border-amber-200/80 px-2.5 py-1 rounded-lg text-amber-900">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                                                        Nome Original:
                                                    </span>
                                                    <span className="text-[11px] font-mono font-bold truncate max-w-md" title={originalName}>
                                                        {originalName}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(originalName);
                                                            toast.success("Nome original copiado!");
                                                        }}
                                                        className="text-amber-600 hover:text-amber-800 ml-auto p-0.5"
                                                        title="Copiar nome original"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Ações Rápidas de Link & Capa */}
                                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setCoverTargetProduct(product);
                                                        setCoverModalOpen(true);
                                                    }}
                                                    className="h-7 text-[11px] font-bold border-amber-300 text-amber-700 hover:bg-amber-50"
                                                >
                                                    <ArrowLeftRight className="w-3 h-3 mr-1" />
                                                    Trocar Capa
                                                </Button>

                                                <Link
                                                    href={`/produto/${product.shortCode || product.id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Ver na Loja
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Barra de Preços & Posição — Editável inline */}
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <div>
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">PIX (Cliente)</label>
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-xs font-bold text-emerald-700">R$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={product.pixPrice ?? pixPrice}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                updateProductField(product.id, 'pixPrice', val);
                                                            }
                                                        }}
                                                        className="text-sm font-black text-emerald-700 bg-transparent border-b-2 border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all w-20"
                                                        title="Preço PIX — valor que o cliente paga à vista"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Cartão (Até 3x)</label>
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-xs font-bold text-slate-500">R$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={product.priceFull || 0}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                updateProductField(product.id, 'priceFull', val);
                                                            }
                                                        }}
                                                        className="text-xs font-bold text-slate-700 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white outline-none transition-all w-20"
                                                        title="Preço no Cartão — valor cheio parcelável"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">De (Riscado)</label>
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-xs font-bold text-red-400">R$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={product.originalPriceFull || product.priceFull || 0}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                updateProductField(product.id, 'originalPriceFull', val);
                                                                // Auto-calcula desconto
                                                                const currentPix = product.pixPrice || pixPrice;
                                                                if (val > 0) {
                                                                    const disc = Math.round(((val - currentPix) / val) * 100);
                                                                    updateProductField(product.id, 'discountPct', Math.max(0, disc));
                                                                }
                                                            }
                                                        }}
                                                        className="text-xs font-bold text-red-500 line-through bg-transparent border-b-2 border-transparent hover:border-red-300 focus:border-red-500 focus:bg-white outline-none transition-all w-20"
                                                        title="Preço original 'De' — aparece riscado no site"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Posição no Site</span>
                                                <select
                                                    value={product.gridPosition}
                                                    onChange={(e) => updateProductField(product.id, 'gridPosition', e.target.value)}
                                                    className="text-[11px] font-bold bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 w-full outline-none focus:ring-1 focus:ring-indigo-400"
                                                >
                                                    <option value="HERO_LEFT">Lado Esq (Carrossel)</option>
                                                    <option value="HERO_RIGHT">Lado Dir (Carrossel)</option>
                                                    <option value="FEATURED">Destaque na Grade</option>
                                                    <option value="BESTSELLER">Top Vendas</option>
                                                    <option value="OFFERS">Ofertas</option>
                                                </select>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Organização</span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveMvpProduct(product.id, 'up')}
                                                        disabled={idx === 0}
                                                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                                                        title="Mover para cima"
                                                    >
                                                        <ArrowUp className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveMvpProduct(product.id, 'down')}
                                                        disabled={idx === mvpProducts.length - 1}
                                                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                                                        title="Mover para baixo"
                                                    >
                                                        <ArrowDown className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeProductFromMvp(product.id, product.name)}
                                                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 ml-auto"
                                                        title="Remover do Lançamento MVP"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descrição Base Recolhível */}
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedDescMap(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                                                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                                            >
                                                {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                {isDescExpanded ? "Ocultar Descrição Base" : "Ver Descrição Base do Produto"}
                                            </button>
                                            {isDescExpanded && (
                                                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                    {product.description || "Nenhuma descrição base configurada."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ─── SEÇÃO DE JOGOS DE CORES (IMPORTAÇÃO E VARIAÇÕES) ─── */}
                                <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-purple-600" />
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                Jogos de Cores Vinculados
                                            </h4>
                                            <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[10px] px-2 py-0">
                                                {variations.length} {variations.length === 1 ? 'cor' : 'cores'}
                                            </Badge>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => openImportVariationModal(product)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-7 px-3 rounded-lg shadow-sm flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Importar Kit de Outra Cor
                                        </Button>
                                    </div>

                                    {/* Lista de Variações */}
                                    {variations.length === 0 ? (
                                        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                                            <p className="text-xs text-slate-400">
                                                Nenhum jogo de cor vinculado ainda. Clique em <strong>&quot;Importar Kit de Outra Cor&quot;</strong> para trazer um kit já existente do acervo (ex: Borboletas Rosa, Borboletas Rosa Claro) com sua própria foto e descrição!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {variations.map((v) => {
                                                const colorHex = v.colorHex || getColorHex(v.colorName);
                                                return (
                                                    <div
                                                        key={v.id}
                                                        className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-start gap-3">
                                                                {/* Mini Thumbnail */}
                                                                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                                    <Image
                                                                        src={v.image || product.images[0] || '/api/placeholder/60/60'}
                                                                        alt={v.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>

                                                                {/* Detalhes da Cor */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                                        <span
                                                                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                                                            style={{ backgroundColor: colorHex }}
                                                                        />
                                                                        <span className="text-[11px] font-black text-slate-800 truncate">
                                                                            {v.colorName}
                                                                        </span>
                                                                    </div>
                                                                    <h5 className="text-xs font-bold text-slate-700 leading-snug line-clamp-1" title={v.title}>
                                                                        {v.title}
                                                                    </h5>
                                                                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                                                                        {v.description ? v.description.replace(/§[A-Z]+§/g, ' ').substring(0, 80) + '...' : 'Sem descrição'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Ações da Variação: Definir como Capa, Editar, Excluir */}
                                                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                                                            <button
                                                                type="button"
                                                                onClick={() => setVariationAsCover(product.id, v)}
                                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors"
                                                                title="Tornar esta foto a capa do produto na loja"
                                                            >
                                                                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                                                Definir Capa
                                                            </button>

                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditVariationModal(product, v)}
                                                                    className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50"
                                                                >
                                                                    <Edit3 className="w-3 h-3 mr-1" /> Editar
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteVariation(product.id, v.id, v.colorName)}
                                                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                    title="Excluir Variação"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* MODAL: IMPORTAR KIT EXISTENTE DE OUTRA COR              */}
            {/* ══════════════════════════════════════════════════════════ */}
            {importModalOpen && targetProduct && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        {/* 1. TOPO FIXO DO MODAL */}
                        <div className="shrink-0 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                        Importar Kits de Outras Cores
                                        <Badge className="bg-purple-100 text-purple-700 font-black text-[10px] px-2 py-0 border-none">
                                            Seleção Múltipla
                                        </Badge>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Produto Base: <strong>{targetProduct.name}</strong> · <span className="font-mono text-[11px] text-slate-500">{targetProduct.technicalName || targetProduct.id}</span>
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setImportModalOpen(false)}
                                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {!isManualVariationOpen ? (
                            <>
                                {/* 2. BARRA DE PESQUISA CENTRALIZADA E FIXA NO TOPO */}
                                <div className="shrink-0 bg-white/95 backdrop-blur-md z-20 px-6 py-3 border-b border-slate-100 shadow-2xs space-y-2.5">
                                    {/* Busca Centralizada */}
                                    <div className="w-full max-w-xl mx-auto relative">
                                        <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-3" />
                                        <Input
                                            placeholder="Buscar por cor (ex: Rosa, Bege, Marinho), tema ou SKU..."
                                            value={importSearchTerm}
                                            onChange={(e) => setImportSearchTerm(e.target.value)}
                                            className="pl-10 h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200 focus:border-purple-500 bg-slate-50 focus:bg-white transition-all shadow-2xs"
                                        />
                                        {importSearchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => setImportSearchTerm('')}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                    </div>

                                    {/* Ações Rápidas de Seleção */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            {suggestedKits.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={selectAllSuggested}
                                                    className="h-7 text-[11px] font-bold border-purple-200 text-purple-700 hover:bg-purple-50"
                                                >
                                                    <Check className="w-3 h-3 mr-1 text-purple-600" />
                                                    Marcar Todos os Sugeridos ({suggestedKits.length})
                                                </Button>
                                            )}

                                            {selectedImportIds.size > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={clearSelection}
                                                    className="h-7 text-[11px] font-bold text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    Desmarcar Todos
                                                </Button>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingVariationId(null);
                                                setVarColorName('');
                                                setVarTitle(targetProduct.name);
                                                setVarDescription(targetProduct.description || '');
                                                setVarImage(targetProduct.images[0]);
                                                setVarPrice(targetProduct.pixPrice);
                                                setIsManualVariationOpen(true);
                                            }}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-auto"
                                        >
                                            + Cadastrar cor manualmente (com foto nova)
                                        </button>
                                    </div>
                                </div>

                                {/* 3. ÁREA DE LISTA ROLÁVEL GRANDE */}
                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
                                    {/* SEÇÃO 1: KITS SUGERIDOS DO MESMO MODELO */}
                                    {suggestedKits.length > 0 && !importSearchTerm && (
                                        <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                                                        Kits Sugeridos do Mesmo Modelo (Cores Diferentes Encontradas)
                                                    </h4>
                                                </div>
                                                <span className="text-[11px] text-purple-700 font-bold">
                                                    {suggestedKits.length} kits encontrados
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {suggestedKits.map(kit => {
                                                    const isChecked = selectedImportIds.has(kit.id);
                                                    const detectedColor = detectColorFromProduct(kit);
                                                    const colorHex = getColorHex(detectedColor);

                                                    return (
                                                        <div
                                                            key={kit.id}
                                                            onClick={() => toggleImportSelection(kit.id)}
                                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                                                                isChecked
                                                                    ? 'bg-purple-100/70 border-purple-600 ring-2 ring-purple-600/30 shadow-xs'
                                                                    : 'bg-white border-purple-200/70 hover:border-purple-400 hover:shadow-xs'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                {/* Checkbox Visual */}
                                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                                                    isChecked
                                                                        ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                                                                        : 'border-slate-300 bg-white'
                                                                }`}>
                                                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                                                </div>

                                                                {/* Foto Grande e Nítida do Kit */}
                                                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                                                    <Image
                                                                        src={kit.images?.[0] || '/api/placeholder/80/80'}
                                                                        alt={kit.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>

                                                                {/* Informações da Cor e do Kit */}
                                                                <div className="min-w-0 space-y-0.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span
                                                                            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                                                            style={{ backgroundColor: colorHex }}
                                                                        />
                                                                        <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 truncate">
                                                                            {detectedColor}
                                                                        </span>
                                                                    </div>
                                                                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={kit.name}>
                                                                        {kit.name}
                                                                    </h5>
                                                                    <span className="text-[10px] font-mono text-slate-400 block truncate" title={kit.id}>
                                                                        {kit.id}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Preço e Status */}
                                                            <div className="text-right shrink-0">
                                                                <span className="text-xs font-black text-emerald-700 block">
                                                                    R$ {(kit.pixPrice || getFinalPrice(kit)).toFixed(2)}
                                                                </span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
                                                                    isChecked ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                    {isChecked ? '✓ Marcado' : 'Selecionar'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* SEÇÃO 2: TODOS OS KITS DO CATÁLOGO */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                {importSearchTerm ? "Resultados da Busca" : "Outros Kits do Catálogo"}
                                            </h4>
                                            <span className="text-xs text-slate-400">
                                                {allSearchableKits.length} kits disponíveis
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {allSearchableKits.slice(0, 80).map(kit => {
                                                const isChecked = selectedImportIds.has(kit.id);
                                                const detectedColor = detectColorFromProduct(kit);
                                                const colorHex = getColorHex(detectedColor);

                                                return (
                                                    <div
                                                        key={kit.id}
                                                        onClick={() => toggleImportSelection(kit.id)}
                                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                                                            isChecked
                                                                ? 'bg-purple-100/70 border-purple-600 ring-2 ring-purple-600/30 shadow-xs'
                                                                : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {/* Checkbox Visual */}
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                                                isChecked
                                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                                                                    : 'border-slate-300 bg-white'
                                                            }`}>
                                                                {isChecked && <Check className="w-3.5 h-3.5" />}
                                                            </div>

                                                            {/* Foto Grande e Nítida do Kit */}
                                                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                                                <Image
                                                                    src={kit.images?.[0] || '/api/placeholder/70/70'}
                                                                    alt={kit.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>

                                                            {/* Informações da Cor e do Kit */}
                                                            <div className="min-w-0 space-y-0.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                                                        style={{ backgroundColor: colorHex }}
                                                                    />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 truncate">
                                                                        {detectedColor}
                                                                    </span>
                                                                </div>
                                                                <h5 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={kit.name}>
                                                                    {kit.name}
                                                                </h5>
                                                                <span className="text-[10px] font-mono text-slate-400 block truncate" title={kit.id}>
                                                                    {kit.id}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Preço e Status */}
                                                        <div className="text-right shrink-0">
                                                            <span className="text-xs font-black text-emerald-700 block">
                                                                R$ {(kit.pixPrice || getFinalPrice(kit)).toFixed(2)}
                                                            </span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
                                                                isChecked ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {isChecked ? '✓ Marcado' : 'Selecionar'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. RODAPÉ FIXO DE CONFIRMAÇÃO (OK) */}
                                <div className="shrink-0 bg-white border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <Badge className={`text-xs font-bold px-3 py-1 border-none ${
                                            selectedImportIds.size > 0
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {selectedImportIds.size} {selectedImportIds.size === 1 ? 'kit selecionado' : 'kits selecionados'}
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                            {selectedImportIds.size === 0
                                                ? 'Marque os kits acima para importar'
                                                : 'Clique em OK para confirmar a importação'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => setImportModalOpen(false)}
                                            className="h-10 text-xs font-bold px-4"
                                        >
                                            Cancelar
                                        </Button>

                                        <Button
                                            onClick={handleConfirmBatchImport}
                                            disabled={selectedImportIds.size === 0}
                                            className={`h-10 text-xs font-black px-6 rounded-xl shadow-md transition-all flex items-center gap-2 ${
                                                selectedImportIds.size > 0
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/30'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Confirmar e Importar ({selectedImportIds.size}) [OK]
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* FORMULÁRIO MANUAL OU EDIÇÃO DE VARIAÇÃO */
                            <div className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <span className="text-xs text-slate-700 font-bold">
                                        Cadastrando / Editando Jogo de Cor Manualmente
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsManualVariationOpen(false)}
                                        className="text-xs font-bold text-indigo-600 hover:underline"
                                    >
                                        ← Voltar para seleção múltipla de kits
                                    </button>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Nome da Cor
                                    </Label>
                                    <Input
                                        placeholder="Ex: Rosa Bebê, Rosé, Verde Militar, etc..."
                                        value={varColorName}
                                        onChange={(e) => setVarColorName(e.target.value)}
                                        className="h-9 text-xs font-bold border-slate-200"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Foto da Variação (URL)
                                    </Label>
                                    <Input
                                        placeholder="URL da imagem (ex: /produtos/conferidos/FEM-KIT...jpeg)"
                                        value={varImage}
                                        onChange={(e) => setVarImage(e.target.value)}
                                        className="h-8 text-xs font-mono border-slate-200"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Título Próprio da Variação
                                    </Label>
                                    <Input
                                        placeholder="Ex: Borboletas Rosa Bebê · Kit Manta"
                                        value={varTitle}
                                        onChange={(e) => setVarTitle(e.target.value)}
                                        className="h-9 text-xs font-bold border-slate-200"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-xs font-bold text-slate-700 uppercase">
                                            Descrição Própria
                                        </Label>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setVarDescription(targetProduct.description || '');
                                                toast.info("Descrição base copiada!");
                                            }}
                                            className="h-6 text-[10px] font-bold text-purple-600 hover:bg-purple-50"
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copiar Descrição Base
                                        </Button>
                                    </div>
                                    <Textarea
                                        rows={5}
                                        value={varDescription}
                                        onChange={(e) => setVarDescription(e.target.value)}
                                        className="text-xs leading-relaxed font-sans border-slate-200 resize-y"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsManualVariationOpen(false)}
                                        className="h-9 text-xs font-bold"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSaveManualVariation}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs h-9 px-5 rounded-xl"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Salvar Variação
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* MODAL: TROCAR CAPA / SUBSTITUIR FOTO ORIGINAL           */}
            {/* ══════════════════════════════════════════════════════════ */}
            {coverModalOpen && coverTargetProduct && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-800">
                                    Trocar Foto de Capa / Substituir Foto Original
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Produto: <strong>{coverTargetProduct.name}</strong>
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCoverModalOpen(false)}
                                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                            {/* Capa Atual */}
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-xs">
                                    <Image
                                        src={coverTargetProduct.images[0] || '/api/placeholder/80/80'}
                                        alt="Capa Atual"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                        Foto de Capa Atual
                                    </span>
                                    <h4 className="text-xs font-bold text-slate-800">
                                        {coverTargetProduct.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-400 truncate block max-w-sm mt-0.5">
                                        {coverTargetProduct.images[0]}
                                    </span>
                                </div>
                            </div>

                            {/* OPÇÃO 1: ESCOLHER UMA DAS VARIAÇÕES DE CORES PARA VIRAR CAPA */}
                            {coverTargetProduct.colorVariations && coverTargetProduct.colorVariations.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 uppercase block">
                                        Definir uma Variação de Cor como Nova Capa:
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {coverTargetProduct.colorVariations.map(v => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => {
                                                    setVariationAsCover(coverTargetProduct.id, v);
                                                    setCoverModalOpen(false);
                                                }}
                                                className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all flex items-center gap-2.5 text-left group/var cursor-pointer"
                                            >
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                    <Image
                                                        src={v.image || '/api/placeholder/40/40'}
                                                        alt={v.colorName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[11px] font-black text-slate-800 block truncate group-hover/var:text-amber-700">
                                                        {v.colorName}
                                                    </span>
                                                    <span className="text-[9px] text-amber-600 font-bold block">
                                                        Usar como Capa
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OPÇÃO 2: SUBIR NOVA FOTO DO COMPUTADOR */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 uppercase block">
                                    Substituir com Nova Foto do Computador:
                                </Label>
                                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 transition-all text-xs font-bold text-slate-600">
                                    <Upload className="w-4 h-4 text-indigo-600" />
                                    <span>Clique aqui para selecionar uma foto do seu computador</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUploadCoverFile}
                                    />
                                </label>
                            </div>

                            {/* OPÇÃO 3: ESCOLHER DO ACERVO DE FOTOS EXISTENTES */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-700 uppercase">
                                        Ou Escolher Foto do Acervo da Loja:
                                    </Label>
                                    <Input
                                        placeholder="Filtrar fotos..."
                                        value={coverLibrarySearch}
                                        onChange={(e) => setCoverLibrarySearch(e.target.value)}
                                        className="h-6 w-36 text-[10px]"
                                    />
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                                    {library
                                        .filter(item => !coverLibrarySearch || item.name.toLowerCase().includes(coverLibrarySearch.toLowerCase()))
                                        .slice(0, 36)
                                        .map(item => (
                                            <div
                                                key={item.filename}
                                                onClick={() => handleReplaceMainCover(item.image)}
                                                className="cursor-pointer group/thumb text-center"
                                                title={`Usar: ${item.name}`}
                                            >
                                                <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group-hover/thumb:border-indigo-500 group-hover/thumb:scale-105 transition-all shadow-xs">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-600 truncate block mt-0.5">
                                                    {item.name}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* MODAL: ADICIONAR PRODUTO AO LANÇAMENTO MVP              */}
            {/* ══════════════════════════════════════════════════════════ */}
            {isAddProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-800">
                                    Adicionar Produtos ao Lançamento MVP
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Selecione produtos do acervo para fazerem parte da vitrine de inauguração.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAddProductModalOpen(false)}
                                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Banner Destaque: 25 Novos Modelos Recém-Cadastrados */}
                        {availableRecent25Count > 0 && (
                            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border-2 border-amber-400/60 rounded-xl p-3.5 mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                            {availableRecent25Count} Novos Modelos Encontrados!
                                            <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold border-none px-1.5 py-0">
                                                Prontos
                                            </Badge>
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Os 25 kits conferidos e salvos recentemente estão prontos para entrar no MVP.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedCategoryFilter('RECEM_CADASTRADOS')}
                                        className={`h-8 text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-100/60 ${selectedCategoryFilter === 'RECEM_CADASTRADOS' ? 'bg-amber-200/60 font-black' : ''}`}
                                    >
                                        Ver os {availableRecent25Count}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleAddAll25Recent}
                                        className="h-8 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Adicionar Todos ({availableRecent25Count}) ao MVP
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Barra de Filtros */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <Input
                                    placeholder="Buscar produto por nome ou SKU..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-xs border-slate-200"
                                />
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                <Button
                                    size="sm"
                                    variant={selectedCategoryFilter === 'RECEM_CADASTRADOS' ? 'primary' : 'outline'}
                                    onClick={() => setSelectedCategoryFilter('RECEM_CADASTRADOS')}
                                    className={`h-9 text-xs font-bold flex items-center gap-1.5 transition-all ${
                                        selectedCategoryFilter === 'RECEM_CADASTRADOS'
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm ring-1 ring-amber-400 font-black'
                                            : 'border-amber-300 text-amber-800 hover:bg-amber-50'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    ⭐ 25 Recém Cadastrados {availableRecent25Count > 0 ? `(${availableRecent25Count})` : ''}
                                </Button>
                                <Button
                                    size="sm"
                                    variant={selectedCategoryFilter === 'ALL' ? 'primary' : 'outline'}
                                    onClick={() => setSelectedCategoryFilter('ALL')}
                                    className={`h-9 text-xs font-bold ${selectedCategoryFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'border-slate-200'}`}
                                >
                                    Todos
                                </Button>
                                <Button
                                    size="sm"
                                    variant={selectedCategoryFilter === 'Kits' ? 'primary' : 'outline'}
                                    onClick={() => setSelectedCategoryFilter('Kits')}
                                    className={`h-9 text-xs font-bold ${selectedCategoryFilter === 'Kits' ? 'bg-indigo-600 text-white' : 'border-slate-200'}`}
                                >
                                    Kits
                                </Button>
                                <Button
                                    size="sm"
                                    variant={selectedCategoryFilter === 'Geral' ? 'primary' : 'outline'}
                                    onClick={() => setSelectedCategoryFilter('Geral')}
                                    className={`h-9 text-xs font-bold ${selectedCategoryFilter === 'Geral' ? 'bg-indigo-600 text-white' : 'border-slate-200'}`}
                                >
                                    Geral
                                </Button>
                                <Button
                                    size="sm"
                                    variant={selectedCategoryFilter === 'RECENT' ? 'primary' : 'outline'}
                                    onClick={() => setSelectedCategoryFilter('RECENT')}
                                    className={`h-9 text-xs font-bold flex items-center gap-1.5 transition-all ${
                                        selectedCategoryFilter === 'RECENT'
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm ring-1 ring-purple-400'
                                            : 'border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700'
                                    }`}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    Mais Recentes
                                </Button>
                            </div>
                        </div>

                        {/* Grade de Produtos Disponíveis */}
                        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-2">
                            {availableToAdd.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    Nenhum produto encontrado com os filtros atuais.
                                </div>
                            ) : (
                                availableToAdd.map((p, idx) => (
                                    <div
                                        key={`${p.id}-${idx}`}
                                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                                                <Image
                                                    src={p.images?.[0] || '/api/placeholder/50/50'}
                                                    alt={p.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="text-[9px] font-bold text-indigo-600 uppercase">
                                                        {p.category || 'Kits'} · {p.shortCode || p.id}
                                                    </span>
                                                    {RECENT_SET.has(p.id) && (
                                                        <Badge className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0 border border-amber-300">
                                                            ⭐ Novo do Acervo
                                                        </Badge>
                                                    )}
                                                    {selectedCategoryFilter === 'RECENT' && idx < 5 && !RECENT_SET.has(p.id) && (
                                                        <Badge className="bg-purple-100 text-purple-700 text-[8px] font-black px-1.5 py-0 border-none">
                                                            Recente
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="text-xs font-black text-slate-800">
                                                    {p.name}
                                                </h4>
                                                <span className="text-[11px] font-bold text-emerald-600">
                                                    R$ {(p.pixPrice || getFinalPrice(p)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => addProductToMvp(p.id)}
                                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 rounded-lg shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Adicionar ao MVP
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                            <Button
                                onClick={() => setIsAddProductModalOpen(false)}
                                className="bg-slate-800 text-white text-xs font-bold h-9 px-5 rounded-xl"
                            >
                                Concluir
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
