'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TYPES, COLORS, DETAILS, THEMES_FEM, THEMES_MAS, RIBBON_COLORS, KIT_RECIPES } from '@/data/admin-options';
import { toast } from 'sonner';
import { productControl } from '@/data/product-control';
import { getFinalPrice } from '@/lib/utils';
import { ManagedProduct } from '@/types/admin';
import { getProductPricing } from '@/data/pricing';
import { generateProductDescription } from '@/lib/description-generator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Tag, Grid, Layout, Image as ImageIcon, Trash2, Plus, Upload, Link as LinkIcon, FileText, Hash, Package, Microscope, Search, Filter, ArrowUp, ArrowDown, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const ALL_THEMES = [...THEMES_FEM, ...THEMES_MAS].filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);

type PhotoData = {
    filename: string;
    folder: string;
    status: 'upload' | 'pendente' | 'conferido' | 'publicado';
    published: boolean;
    composition?: { type: string; qty: number }[];
    customName?: string;
    hasFrufru?: boolean;
    category?: string;
    type?: string;
    theme?: string;
    color?: string;
    // other metadata from sidecar might exist
};

// Helper to reverse engineer SKU
const parseFilename = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split('_')[0].split('-');

    if (parts.length < 4) return null;

    const extraParts = parts.slice(4);
    const detail = extraParts.find(p => DETAILS.some(d => d.value === p));
    const ribbonColor = extraParts.find(p => p.startsWith('R_'));
    const detailColors = extraParts.filter(p => p !== detail && p !== ribbonColor);

    return {
        category: parts[0] as 'FEM' | 'MAS' | 'UNI',
        type: parts[1],
        theme: parts[2],
        color: parts[3],
        detail: detail || '',
        detailColor: detailColors[0] || 'PAD',
        detailColor2: detailColors[1] || 'PAD',
        detailColor3: detailColors[2] || 'PAD',
        detailColor4: detailColors[3] || 'PAD',
        detailColor5: detailColors[4] || 'PAD',
        ribbonColor: ribbonColor || 'PAD',
    };
};

export default function GestaoFotosPage() {
    const [activeTab, setActiveTab] = useState<'adicionar' | 'conferir' | 'publicados' | 'lista' | 'mvp' | 'precificacao'>('adicionar');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // ==========================================
    // ESTADOS: FOTOS & PUBLICAÇÃO
    // ==========================================
    const [allPhotos, setAllPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingPhoto, setEditingPhoto] = useState<PhotoData | null>(null);
    const [editorIndex, setEditorIndex] = useState(0);

    const [category, setCategory] = useState<'FEM' | 'MAS' | 'UNI'>('FEM');
    const [type, setType] = useState('FRP');
    const [theme, setTheme] = useState('JDE');
    const [color, setColor] = useState('RSA');
    const [detail, setDetail] = useState('');
    const [detailColor, setDetailColor] = useState('PAD');
    const [detailColor2, setDetailColor2] = useState('PAD');
    const [detailColor3, setDetailColor3] = useState('PAD');
    const [detailColor4, setDetailColor4] = useState('PAD');
    const [detailColor5, setDetailColor5] = useState('PAD');
    const [ribbonColor, setRibbonColor] = useState('PAD');
    const [hasFrufru, setHasFrufru] = useState(false);
    const [customName, setCustomName] = useState('');
    const [composition, setComposition] = useState<{ type: string, qty: number }[]>([]);
    const [compType, setCompType] = useState('FRP');
    const [compQty, setCompQty] = useState(1);

    const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
    const [publicadosSearch, setPublicadosSearch] = useState('');
    const [pubFilterCategory, setPubFilterCategory] = useState('ALL');
    const [pubFilterColor, setPubFilterColor] = useState('ALL');
    const [pubFilterTheme, setPubFilterTheme] = useState('ALL');
    const [pubFilterType, setPubFilterType] = useState('ALL');

    // ==========================================
    // ESTADOS: MVP (CENTRAL DE PRODUTOS)
    // ==========================================
    const [products, setProducts] = useState<ManagedProduct[]>(productControl);
    const [library, setLibrary] = useState<any[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    // Product Filters State (Bottom List)
    const [searchTerm, setSearchTerm] = useState('');

    // ==========================================
    // ESTADOS: PRECIFICACAO UNITÁRIA
    // ==========================================
    const [unitPrices, setUnitPrices] = useState<Record<string, number>>({});
    const [kitPrices, setKitPrices] = useState<Record<string, number>>({});
    const [isSavingPricing, setIsSavingPricing] = useState(false);

    useEffect(() => {
        // Fetch raw initial data directly (we can just import them on server load, but since this is 'use client', we'll simulate an api call or just use the static imports as seed state)
        import('@/data/pricing-data').then((mod) => {
            setUnitPrices(mod.UNIT_PRICES_NET);
            setKitPrices(mod.KIT_PRICES_NET);
        });
    }, []);

    const handleSavePricing = async () => {
        setIsSavingPricing(true);
        toast.loading("Salvando tabela e recalibrando catálogo...", { id: 'save-prices' });
        try {
            const res = await fetch('/api/admin/save-pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unitPrices, kitPrices })
            });
            if (!res.ok) throw new Error("Erro no servidor");
            toast.success("Custos atualizados e kits reprocessados com sucesso! 🚀", { id: 'save-prices' });
        } catch (e: any) {
            toast.error("Falha ao salvar. Tente novamente.", { id: 'save-prices' });
        } finally {
            setIsSavingPricing(false);
        }
    };
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [filterGrid, setFilterGrid] = useState('ALL');

    // Library Filters State (Top List)
    const [libSearchTerm, setLibSearchTerm] = useState('');
    const [libFilterCategory, setLibFilterCategory] = useState('ALL');
    const [libFilterColor, setLibFilterColor] = useState('ALL');
    const [libFilterTheme, setLibFilterTheme] = useState('ALL');
    const [libFilterType, setLibFilterType] = useState('ALL');

    // Filter Logic for MVP
    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesGrid = filterGrid === 'ALL' || p.gridPosition === filterGrid;
        const pCat = p.category || 'Geral';
        const matchesCategory = filterCategory === 'ALL' || pCat.toLowerCase() === filterCategory.toLowerCase();

        return matchesSearch && matchesCategory && matchesGrid;
    });

    useEffect(() => {
        fetchPhotos();
    }, []);

    useEffect(() => {
        if (activeTab === 'mvp') {
            buildLibraryFromAllPhotos();
        }
    }, [activeTab, allPhotos]);

    const buildLibraryFromAllPhotos = () => {
        setIsLoadingLibrary(true);
        try {
            const parsedLibrary = [];

            for (const f of allPhotos) {
                const skuBase = f.filename.replace(/\.[^/.]+$/, '').replace(/_\d+$/, '');
                const parts = skuBase.split('-');
                const typeCode = f.type || parts[1] || 'Geral';
                const themeCode = f.theme || (parts[2] === 'KIT' && parts[3] ? parts[3] : parts[2] || 'Geral');
                const colorCode = f.color || (parts[2] === 'KIT' && parts[4] ? parts[4] : parts[3]);

                // folder comes from api/admin/photos as 'uploads/products', 'produtos', 'produtos/conferidos'
                const folderPath = f.folder.includes('uploads') ? '/uploads/products' : (f.folder.includes('conferidos') ? '/produtos/conferidos' : '/produtos');

                // Extract category robustly from parsed metadata or fallback
                const resolvedCategory = f.category || parts[0] || 'Geral';

                parsedLibrary.push({
                    id: f.filename.replace(/\.[^/.]+$/, ''), // Use the exact filename without extension as the ID to avoid grouping
                    filename: f.filename,
                    name: f.customName || `${typeCode} ${themeCode} ${parts[3] || ''}`.trim() || skuBase,
                    image: `${folderPath}/${f.filename}`,
                    images: [`${folderPath}/${f.filename}`],
                    category: resolvedCategory,
                    type: typeCode,
                    theme: themeCode,
                    color: colorCode,
                    raw: f
                });
            }
            setLibrary(parsedLibrary.reverse());
        } catch (error) {
            toast.error("Erro ao sincronizar acervo");
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = () => {
        setLoading(true);
        fetch('/api/admin/photos')
            .then(res => res.json())
            .then(data => {
                setAllPhotos(data.files || []);
                setLoading(false);
            })
            .catch(() => {
                toast?.error('Erro ao carregar fotos');
                setLoading(false);
            });
    };

    // Auto-name based on composition
    useEffect(() => {
        if (!editingPhoto) return;
        if (composition.length === 0) return;

        const currentItems: Record<string, number> = {};
        composition.forEach(item => {
            currentItems[item.type] = (currentItems[item.type] || 0) + item.qty;
        });

        const match = KIT_RECIPES.find(recipe => {
            const recipeEntries = Object.entries(recipe.items);
            if (Object.keys(currentItems).length !== recipeEntries.length && Object.keys(currentItems).length !== recipeEntries.length + 1) return false;

            // Loose matching to allow custom features but we'll stick to exact count for now
            let matches = true;
            for (const [key, qty] of recipeEntries) {
                if (key === 'BOD') {
                    const bodies = (currentItems['BDC'] || 0) + (currentItems['BDL'] || 0);
                    if (bodies !== qty) matches = false;
                } else if (currentItems[key] !== qty) {
                    matches = false;
                }
            }
            return matches;
        });

        if (match) {
            setCustomName(match.name);
        } else {
            const wasRecipe = KIT_RECIPES.some(r => r.name === customName);
            if (wasRecipe) setCustomName('');
        }
    }, [composition, editingPhoto]);

    const loadPhotoToEditor = (photo: PhotoData, index: number) => {
        setEditingPhoto(photo);
        setEditorIndex(index);

        const parsed = parseFilename(photo.filename);
        if (parsed) {
            setCategory(parsed.category);
            setType(parsed.type);
            setTheme(parsed.theme);
            setColor(parsed.color);
            setDetail(parsed.detail);
            setDetailColor(parsed.detailColor);
            setDetailColor2(parsed.detailColor2);
            setDetailColor3(parsed.detailColor3);
            setDetailColor4(parsed.detailColor4);
            setDetailColor5(parsed.detailColor5);
            setRibbonColor(parsed.ribbonColor);
        } else {
            // Defaults
            setCategory('FEM');
            setType('KIT'); // Kit
            setTheme('JDE');
            setColor('RSA');
            setDetail('BAB'); // Bordado Inglês
            setDetailColor('PAD');
            setDetailColor2('PAD');
            setDetailColor3('PAD');
            setDetailColor4('PAD');
            setDetailColor5('PAD');
            setRibbonColor('PAD');
        }

        setCustomName(photo.customName || '');
        setComposition(photo.composition || []);
        setHasFrufru(!!photo.hasFrufru);

        // If it's a known kit type without composition, auto fill somewhat
        if (parsed?.type === 'KIT' && (!photo.composition || photo.composition.length === 0)) {
            // Keep empty to let user fill
        } else if (!photo.composition || photo.composition.length === 0) {
            if (parsed?.type && parsed.type !== 'KIT') {
                setComposition([{ type: parsed.type, qty: 1 }]);
            }
        }
    };

    const handleCustomNameChange = (val: string) => {
        setCustomName(val);

        // Auto-fill composition if the typed name matches a known predefined kit recipe perfectly
        const kitMatch = KIT_RECIPES.find(r => r.name.toLowerCase() === val.trim().toLowerCase());
        if (kitMatch) {
            const newComp = Object.entries(kitMatch.items).map(([k, v]) => ({ type: k, qty: v as number }));

            // Basic check to prevent repetitive loops/feedback if already set
            const isDifferent = newComp.length !== composition.length || newComp.some(item => !composition.find(c => c.type === item.type && c.qty === item.qty));

            if (isDifferent) {
                setComposition(newComp);
                toast.success(`Itens preenchidos automaticamente para: ${kitMatch.name}`);
            }
        }
    };

    const addCompositionItem = () => {
        setComposition([...composition, { type: compType, qty: compQty }]);
    };

    const removeCompositionItem = (index: number) => {
        setComposition(composition.filter((_, i) => i !== index));
    };

    const runAction = async (action: 'save_rename' | 'save_metadata' | 'publish' | 'unpublish' | 'delete', customPhoto?: PhotoData) => {
        const photo = customPhoto || editingPhoto;
        if (!photo) return;

        if (action === 'delete') {
            if (!confirm('Tem certeza que deseja EXCLUIR permanentemente?')) return;
            try {
                const res = await fetch('/api/admin/delete', {
                    method: 'POST',
                    body: JSON.stringify({ filename: photo.filename })
                });
                if (res.ok) {
                    toast?.success('Excluído com sucesso');
                    fetchPhotos();
                    if (editingPhoto && editingPhoto.filename === photo.filename) advanceEditor(1);
                } else toast?.error('Erro ao excluir');
            } catch { toast?.error('Erro na rede'); }
            return;
        }

        if (action === 'publish' || action === 'unpublish') {
            try {
                const res = await fetch('/api/admin/publish', {
                    method: 'POST',
                    body: JSON.stringify({ filename: photo.filename, action })
                });
                if (res.ok) {
                    toast?.success(action === 'publish' ? 'Publicado!' : 'Removido do Ar');
                    fetchPhotos();
                } else toast?.error('Erro ao mudar status de publicação');
            } catch { toast?.error('Erro na rede'); }
            return;
        }

        let newSKU = `${category}-${type}-${theme}-${color}`;
        if (detail) newSKU += `-${detail}`;
        if (detailColor && detailColor !== 'PAD') newSKU += `-${detailColor}`;
        if (detailColor2 && detailColor2 !== 'PAD') newSKU += `-${detailColor2}`;
        if (detailColor3 && detailColor3 !== 'PAD') newSKU += `-${detailColor3}`;
        if (detailColor4 && detailColor4 !== 'PAD') newSKU += `-${detailColor4}`;
        if (detailColor5 && detailColor5 !== 'PAD') newSKU += `-${detailColor5}`;
        if (ribbonColor && ribbonColor !== 'PAD') newSKU += `-${ribbonColor}`;

        const payload = {
            oldFilename: photo.filename,
            newSKU,
            sourceDir: photo.folder,
            folder: photo.folder,
            filename: photo.filename,
            composition,
            customName,
            filters: {
                category, type, theme, color, detail, detailColor, detailColor2, detailColor3, detailColor4, detailColor5, ribbonColor, hasFrufru
            }
        };

        const endpoint = action === 'save_rename' ? '/api/admin/rename' : '/api/admin/save-metadata';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.renamed && data.newFilename) {
                    toast?.success(`Dados salvos e arquivo renomeado → ${data.newFilename}`);
                } else {
                    toast?.success('Dados salvos');
                }
                fetchPhotos();
                if (action === 'save_rename') advanceEditor(1);
            } else {
                toast?.error('Erro ao salvar os dados');
            }
        } catch {
            toast?.error('Erro de rede ao salvar');
        }
    };

    const getFilteredPhotos = () => {
        if (activeTab === 'adicionar') return allPhotos.filter(p => p.status === 'pendente' || p.status === 'upload');
        if (activeTab === 'conferir') return allPhotos.filter(p => p.status === 'conferido');
        if (activeTab === 'publicados') return allPhotos.filter(p => p.status === 'publicado');
        return allPhotos; // lista tools
    };

    const currentList = getFilteredPhotos();

    const openEditor = (photo: PhotoData) => {
        const idx = currentList.findIndex(p => p.filename === photo.filename);
        loadPhotoToEditor(photo, idx >= 0 ? idx : 0);
    };

    const advanceEditor = (step: number) => {
        if (currentList.length === 0) {
            setEditingPhoto(null);
            return;
        }
        let nextIndex = editorIndex + step;
        if (nextIndex >= currentList.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = currentList.length - 1;
        loadPhotoToEditor(currentList[nextIndex], nextIndex);
    };

    // ==========================================
    // FUNÇÕES: MVP (CENTRAL DE PRODUTOS)
    // ==========================================
    const handleUpload = async (productId: string, index: number, file: File) => {
        const uploadKey = `${productId}-${index}`;
        setIsUploading(uploadKey);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.url) {
                updateImage(productId, index, data.url);
                toast.success("Imagem enviada!");
            } else {
                toast.error(data.error || "Erro no upload");
            }
        } catch (error) {
            toast.error("Erro na conexão com servidor");
        } finally {
            setIsUploading(null);
        }
    };

    const updateProduct = (id: string, field: keyof ManagedProduct, value: any) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const toggleHotAndSave = async (id: string, currentHot: boolean | undefined) => {
        const newHot = !currentHot;
        
        // Optimistic UI update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isHot: newHot } : p));
        
        // Background silent save
        try {
            // Need to get the fresh products list, but since setState is async, 
            // we build the expected array right here for the API call:
            const expectedProductsToSave = products.map(p => p.id === id ? { ...p, isHot: newHot } : p);
            
            await fetch('/api/admin/save-mvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: expectedProductsToSave })
            });
            
            toast.success(newHot ? "Produto em destaque! 🔥" : "Destaque removido.");
        } catch (error) {
            console.error("Erro ao salvar fire badge", error);
            // Revert state on failure
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isHot: currentHot } : p));
            toast.error("Erro interno ao salvar destaque.");
        }
    };

    const handlePricingChange = (id: string, field: 'originalPriceFull' | 'netValue' | 'priceFull' | 'discountPct', value: number | '') => {
        if (value === '') {
            updateProduct(id, field, '');
            return;
        }

        setProducts(prev => prev.map(p => {
            if (p.id !== id) return p;
            
            let newP = { ...p, [field]: value };
            
            const IP_CARD_PCT = 0.0315;
            const IP_PIX_PCT = 0;
            const IP_FIXED = 0;
            
            const gross = field === 'originalPriceFull' ? value : (newP.originalPriceFull || newP.priceFull || 0);

            if (field === 'netValue') {
                newP.priceFull = Math.ceil((value / (1 - IP_CARD_PCT)) + IP_FIXED);
                newP.pixPrice = Math.ceil(value / (1 - IP_PIX_PCT || 1));
                newP.discountPct = gross > 0 ? Math.round(((gross - newP.priceFull) / gross) * 100) : 0;
            } 
            else if (field === 'priceFull') { 
                newP.netValue = (value - IP_FIXED) * (1 - IP_CARD_PCT);
                newP.pixPrice = Math.ceil((newP.netValue > 0 ? newP.netValue : 0) / (1 - IP_PIX_PCT || 1));
                newP.discountPct = gross > 0 ? Math.round(((gross - value) / gross) * 100) : 0;
            }
            else if (field === 'discountPct') {
                newP.priceFull = Math.ceil(gross * (1 - (value / 100)));
                newP.netValue = (newP.priceFull - IP_FIXED) * (1 - IP_CARD_PCT);
                newP.pixPrice = Math.ceil((newP.netValue > 0 ? newP.netValue : 0) / (1 - IP_PIX_PCT || 1));
            }
            else if (field === 'originalPriceFull') {
                newP.discountPct = value > 0 ? Math.round(((value - newP.priceFull) / value) * 100) : 0;
            }
            
            newP.pixDiscountPct = newP.priceFull > 0 ? Math.round(((newP.priceFull - (newP.pixPrice || 0)) / newP.priceFull) * 100) : 0;

            return newP;
        }));
    };

    const updateImage = (productId: string, index: number, value: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                const newImages = [...p.images];
                newImages[index] = value;
                return { ...p, images: newImages };
            }
            return p;
        }));
    };

    const moveProduct = (productId: string, direction: 'up' | 'down') => {
        setProducts(prev => {
            const arr = [...prev];

            // Recalculate filtered array based on current prev state to avoid stale closure issues
            const currentFiltered = arr.filter(p => {
                const term = searchTerm.toLowerCase();
                const matchesSearch = p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
                const matchesGrid = filterGrid === 'ALL' || p.gridPosition === filterGrid;
                const pCat = p.category || 'Geral';
                const matchesCategory = filterCategory === 'ALL' || pCat.toLowerCase() === filterCategory.toLowerCase();
                return matchesSearch && matchesCategory && matchesGrid;
            });

            const filteredIndex = currentFiltered.findIndex(p => p.id === productId);
            if (filteredIndex < 0) return arr;

            const targetIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1;
            if (targetIndex < 0 || targetIndex >= currentFiltered.length) return arr;

            const adjacentProductId = currentFiltered[targetIndex].id;

            const mainCurrentIndex = arr.findIndex(p => p.id === productId);

            if (mainCurrentIndex !== -1) {
                // Remove the product temporarily
                const [movedItem] = arr.splice(mainCurrentIndex, 1);

                // Find adjacent item's new index after removal
                const newAdjacentIndex = arr.findIndex(p => p.id === adjacentProductId);
                if (newAdjacentIndex !== -1) {
                    // Insert before (if moving up) or after (if moving down) the adjacent item
                    const insertPos = direction === 'down' ? newAdjacentIndex + 1 : newAdjacentIndex;
                    arr.splice(insertPos, 0, movedItem);
                } else {
                    // Fallback
                    arr.splice(mainCurrentIndex, 0, movedItem);
                }
            }
            return arr;
        });
    };


    const importFromLibrary = (libProduct: any) => {
        const exists = products.find(p => p.id === libProduct.id);
        if (exists) {
            toast.error("Produto já está na lista do MVP");
            return;
        }

        const techName = libProduct.id;

        // ─── Resolve composition ───
        let rawComp = libProduct.raw?.composition;

        if (!rawComp || !Array.isArray(rawComp) || rawComp.length === 0) {
            if (libProduct.type === 'KIT') {
                const kitMatch = KIT_RECIPES.find(r => r.name.toLowerCase() === (libProduct.name || '').trim().toLowerCase());
                if (kitMatch) {
                    rawComp = Object.entries(kitMatch.items).map(([k, v]) => ({ type: k, qty: v }));
                }
            } else if (libProduct.type && libProduct.type !== 'Geral') {
                rawComp = [{ type: libProduct.type, qty: 1 }];
            }
        }

        const productComp = (rawComp && Array.isArray(rawComp)) ? rawComp.map((c: any) => ({ type: c.type, qty: Number(c.qty || 1) })) : [];

        // ─── Generate rich description automatically ───
        const autoDesc = generateProductDescription({
            name: libProduct.name || techName,
            composition: productComp,
            theme: libProduct.theme,
            color: libProduct.color,
            category: libProduct.category || (techName.startsWith('FEM') ? 'FEM' : techName.startsWith('MAS') ? 'MAS' : 'UNI'),
            detail: libProduct.raw?.filters?.detail,
            hasFrufru: libProduct.raw?.hasFrufru,
        });

        const totalItens = productComp.reduce((sum: number, c: any) => sum + Number(c.qty || 1), 0);
        
        const hasFrufruFlag = libProduct.raw?.hasFrufru || false;
        
        // Store actual composition codes so reprice can always resolve them
        // If the item has fru-fru, save the exact fru-fru codes so the reprice script catches them
        const compositionFeatures = productComp.length > 0
            ? productComp.map((c: any) => {
                let code = c.type;
                if (hasFrufruFlag && code === 'FRP') code = 'FRP_FRU';
                if (hasFrufruFlag && code === 'FRG') code = 'FRG_FRU';
                return `${c.qty}x ${code}`;
            })
            : [totalItens === 1 ? '1 Peça' : `${totalItens} Peças`];

        // ─── Auto-calculate pricing ───
        const pricing = getProductPricing(productComp, libProduct.name, hasFrufruFlag);

        const newManaged: ManagedProduct = {
            id: libProduct.id,
            name: libProduct.name,
            technicalName: techName,
            description: autoDesc,
            features: compositionFeatures, // Stores parseable composition codes
            priceFull: pricing.priceFull || 0,
            discountPct: pricing.discountPct || 0,
            images: libProduct.images || [libProduct.image],
            gridPosition: 'FEATURED',
            category: libProduct.type === 'KIT' ? 'Kits' : (libProduct.type || 'Geral'),
            tags: ['novidade', (libProduct.theme || '').toLowerCase()]
        };

        setProducts(prev => [...prev, newManaged]);
        toast.success(`Importado: ${libProduct.name}`);
    };
    const publicarMvp = async () => {
        try {
            toast.loading("Publicando no site principal...", { id: 'pub-mvp' });
            const response = await fetch('/api/admin/save-mvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Sucesso! ${data.count} produtos publicados no MVP.`, { id: 'pub-mvp' });
            } else {
                toast.error("Erro ao publicar: " + data.error, { id: 'pub-mvp' });
            }
        } catch (error) {
            console.error('Save MVP error:', error);
            toast.error("Erro interno ao publicar no MVP.", { id: 'pub-mvp' });
        }
    };


    if (loading && allPhotos.length === 0) return <div className="p-8 text-center text-slate font-bold animate-pulse">Carregando painel de gestão...</div>;

    const currentThemes = category === 'MAS' ? THEMES_MAS : THEMES_FEM;

    const getTypeLabel = (c: string) => TYPES.find(x => x.value === c)?.label || c;
    const getColorLabel = (c: string) => COLORS.find(x => x.value === c)?.label || c;

    return (
        <div className="flex h-screen bg-slate-50 w-full font-sans overflow-hidden">
            {/* SIDEBAR (ESQUERDA) */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} shrink-0 bg-slate-900 text-white flex flex-col shadow-xl z-20 transition-all duration-300 relative`}>
                <div className={`p-4 border-b border-slate-800 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} min-h-[72px]`}>
                    {isSidebarOpen ? (
                        <div>
                            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Grid className="w-5 h-5 text-indigo-400" />
                                Admin Store
                            </h1>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{allPhotos.length} Itens Logados</p>
                        </div>
                    ) : (
                        <Grid className="w-6 h-6 text-indigo-400 shrink-0" />
                    )}

                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className={`p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors outline-none shrink-0 ${!isSidebarOpen && 'absolute -right-3 top-6 bg-slate-800 border border-slate-700 rounded-full shadow-md z-50'}`}
                        title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                <nav className={`flex-1 overflow-y-auto py-4 ${isSidebarOpen ? 'px-3' : 'px-2'} flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-700 overflow-x-hidden`}>
                    <button
                        onClick={() => setActiveTab('adicionar')}
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'justify-between px-3' : 'justify-center px-0'} group ${activeTab === 'adicionar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={!isSidebarOpen ? "Caixa de Entrada" : undefined}
                    >
                        <span className={`flex items-center ${isSidebarOpen ? 'gap-2.5' : 'justify-center'}`}>
                            <Upload className={`w-4 h-4 shrink-0 ${activeTab === 'adicionar' ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
                            {isSidebarOpen && "Caixa de Entrada"}
                        </span>
                        {isSidebarOpen && (
                            <Badge className={`px-1.5 py-0 min-w-[20px] text-center text-[9px] border-none shrink-0 ${activeTab === 'adicionar' ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                {allPhotos.filter(p => p.status === 'pendente' || p.status === 'upload').length}
                            </Badge>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('conferir')}
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'justify-between px-3' : 'justify-center px-0'} group ${activeTab === 'conferir' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={!isSidebarOpen ? "Conferência" : undefined}
                    >
                        <span className={`flex items-center ${isSidebarOpen ? 'gap-2.5' : 'justify-center'}`}>
                            <Microscope className={`w-4 h-4 shrink-0 ${activeTab === 'conferir' ? 'text-orange-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
                            {isSidebarOpen && "Conferência"}
                        </span>
                        {isSidebarOpen && (
                            <Badge className={`px-1.5 py-0 min-w-[20px] text-center text-[9px] border-none shrink-0 ${activeTab === 'conferir' ? 'bg-orange-800/80 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                {allPhotos.filter(p => p.status === 'conferido').length}
                            </Badge>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('publicados')}
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'justify-between px-3' : 'justify-center px-0'} group ${activeTab === 'publicados' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={!isSidebarOpen ? "Acervo Publicado" : undefined}
                    >
                        <span className={`flex items-center ${isSidebarOpen ? 'gap-2.5' : 'justify-center'}`}>
                            <Package className={`w-4 h-4 shrink-0 ${activeTab === 'publicados' ? 'text-emerald-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
                            {isSidebarOpen && "Acervo Publicado"}
                        </span>
                        {isSidebarOpen && (
                            <Badge className={`px-1.5 py-0 min-w-[20px] text-center text-[9px] border-none shrink-0 ${activeTab === 'publicados' ? 'bg-emerald-800/80 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                {allPhotos.filter(p => p.status === 'publicado').length}
                            </Badge>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('lista')}
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} group ${activeTab === 'lista' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={!isSidebarOpen ? "Lista / Tabelas" : undefined}
                    >
                        <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'lista' ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'}`} />
                        {isSidebarOpen && "Lista / Tabelas"}
                    </button>

                    {isSidebarOpen ? (
                        <div className="mt-6 mb-2">
                            <p className="px-3 text-[10px] font-black tracking-widest uppercase text-slate-600 truncate">Loja & Website</p>
                        </div>
                    ) : (
                        <div className="h-px w-full bg-slate-800 my-4" />
                    )}

                    <button
                        onClick={() => setActiveTab('mvp')}
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} group ${activeTab === 'mvp' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={!isSidebarOpen ? "Painel MVP (Vendas)" : undefined}
                    >
                        <Layout className={`w-4 h-4 shrink-0 ${activeTab === 'mvp' ? 'text-purple-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
                        {isSidebarOpen && "Painel MVP (Vendas)"}
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('precificacao')}
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} group ${activeTab === 'precificacao' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={!isSidebarOpen ? "Precificação Unitária" : undefined}
                    >
                        <Tag className={`w-4 h-4 shrink-0 ${activeTab === 'precificacao' ? 'text-pink-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
                        {isSidebarOpen && "Precificação Unitária"}
                    </button>
                    
                    <div className="h-px w-full bg-slate-800 my-2" />

                    <div className="mt-2 mb-2">
                        <p className="px-3 text-[10px] font-black tracking-widest uppercase text-slate-600 truncate">Vendas (Pós-Checkout)</p>
                    </div>

                    <Link
                        href="/admin/pedidos"
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} group text-amber-500 hover:bg-slate-800 hover:text-amber-400`}
                        title={!isSidebarOpen ? "Pedidos dos Clientes" : undefined}
                    >
                        <FileText className={`w-4 h-4 shrink-0 text-amber-500 group-hover:text-amber-400`} />
                        {isSidebarOpen && "Pedidos & Prazos"}
                    </Link>
                    
                    <Link
                        href="/admin/gestao-tags"
                        className={`w-full text-left py-2.5 rounded-lg text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} group text-slate-400 hover:bg-slate-800 hover:text-white`}
                        title={!isSidebarOpen ? "Gestão de Coleções" : undefined}
                    >
                        <Tag className="w-4 h-4 shrink-0 text-pink-400 group-hover:text-pink-300 transition-colors" />
                        {isSidebarOpen && "Gestão de Coleções"}
                    </Link>

                    <Link
                        href="/admin/gestao-bordados"
                        className={`w-full text-left py-2.5 rounded-lg mt-2 text-xs font-bold transition-all flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} group text-slate-400 hover:bg-slate-800 hover:text-white`}
                        title={!isSidebarOpen ? "Gestão de Bordados" : undefined}
                    >
                        <LinkIcon className="w-4 h-4 shrink-0 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" />
                        {isSidebarOpen && "Gestão de Bordados"}
                    </Link>
                </nav>

                <div className={`p-4 border-t border-slate-800 text-[9px] text-slate-600 font-mono text-center ${!isSidebarOpen && 'hidden'}`}>
                    Sistema Danis v2.0
                </div>
            </aside>

            {/* MAIN CONTENT (DIREITA) */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* GLOBAL TOPBAR (dentro do main) */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                    <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                        {activeTab === 'adicionar' && <><Upload className="w-4 h-4 text-indigo-500" /> Entrada de Fotos</>}
                        {activeTab === 'conferir' && <><Microscope className="w-4 h-4 text-orange-500" /> Conferência de Dados</>}
                        {activeTab === 'publicados' && <><Package className="w-4 h-4 text-emerald-500" /> Acervo Publicado</>}
                        {activeTab === 'lista' && <><FileText className="w-4 h-4 text-slate-500" /> Visão de Tabela</>}
                        {activeTab === 'mvp' && <><Layout className="w-4 h-4 text-purple-500" /> Distribuição Site (MVP)</>}
                        {activeTab === 'precificacao' && <><Tag className="w-4 h-4 text-pink-500" /> Precificação Unitária (Custos)</>}
                    </h2>

                    {activeTab === 'mvp' && (
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 border-amber-300 text-amber-600 hover:bg-amber-50 gap-1.5 text-[10px] font-bold px-3 uppercase tracking-wider" onClick={async () => {
                                toast.loading("Regenerando descrições...", { id: 'regen-desc' });
                                try {
                                    const res = await fetch('/api/admin/regenerate-descriptions', { method: 'POST' });
                                    const data = await res.json();
                                    if (data.success) {
                                        toast.success(`${data.updated}/${data.total} descrições atualizadas!`, { id: 'regen-desc' });
                                    } else {
                                        toast.error("Erro: " + data.error, { id: 'regen-desc' });
                                    }
                                } catch { toast.error("Erro de rede", { id: 'regen-desc' }); }
                            }}>
                                <RefreshCw className="w-3 h-3" /> Regenerar Descrições
                            </Button>
                            <Button size="sm" onClick={publicarMvp} className="h-8 bg-purple-600 hover:bg-purple-700 text-white gap-2 transition-all shadow text-[11px] font-bold px-4 uppercase tracking-wider">
                                <Save className="w-3.5 h-3.5" /> Salvar App & Publicar
                            </Button>
                        </div>
                    )}
                </header>

                {/* SCROLLABLE VIEWPORT */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 relative scrollbar-thin scrollbar-thumb-slate-300">
                    <div className="p-6 max-w-[1600px] mx-auto w-full">

                        {activeTab === 'adicionar' && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h2 className="text-2xl font-bold mb-4">Fotos Pendentes / Novas</h2>
                                <p className="text-gray-500 mb-6">Estas fotos precisam ser organizadas, nomeadas e ter sua composição definida. Ao salvar, elas serão renomeadas e os dados serão salvos num arquivo JSON.</p>

                                {currentList.length === 0 ? (
                                    <p className="text-green-600 font-bold p-8 text-center bg-green-50 rounded-xl">Tudo organizado! Nenhuma foto pendente.</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {currentList.map(photo => (
                                            <div key={photo.filename} className="group relative aspect-square border overflow-hidden rounded-xl bg-gray-100 hover:border-blue-500 hover:shadow-lg transition-all">
                                                <div className="absolute inset-0 cursor-pointer" onClick={() => openEditor(photo)}>
                                                    <Image loading="lazy" src={`/${photo.folder}/${photo.filename}`} alt="Thumb" fill className="object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); runAction('delete', photo); }} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow cursor-pointer" title="Excluir (Mover para Lixeira)">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] p-2 truncate pointer-events-none">{photo.filename}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'conferir' && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h2 className="text-2xl font-bold mb-4">Conferência (Redundância)</h2>
                                <p className="text-gray-500 mb-6">Confira os dados destas fotos. Elas já foram organizadas mas ainda não estão visíveis no site principal até você publicar.</p>

                                {currentList.length === 0 ? (
                                    <p className="text-gray-400 font-bold p-8 text-center">Nenhum item pendente de conferência.</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {currentList.map(photo => (
                                            <div key={photo.filename} className="group relative aspect-square border overflow-hidden rounded-xl bg-gray-100 hover:border-orange-400 hover:shadow-lg transition-all">
                                                <div className="absolute inset-0 cursor-pointer" onClick={() => openEditor(photo)}>
                                                    <Image loading="lazy" src={`/${photo.folder}/${photo.filename}`} alt="Thumb" fill className="object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold pointer-events-none">CONFERIR</div>
                                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); runAction('delete', photo); }} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow cursor-pointer" title="Excluir (Mover para Lixeira)">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 w-full bg-black/60 text-white p-2 pointer-events-none">
                                                    <p className="text-xs font-bold truncate">{photo.customName || photo.filename}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'publicados' && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-green-700">Produtos no Ar</h2>
                                        <p className="text-gray-500 mt-1">Estas fotos já estão sendo listadas no site e disponíveis para montar o catálogo ou adicionar à vitrine.</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Buscar produto, ID ou termo..."
                                            className="pl-9 h-9 border-slate-200 bg-white"
                                            value={publicadosSearch}
                                            onChange={(e) => setPublicadosSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={pubFilterCategory} onValueChange={setPubFilterCategory}>
                                        <SelectTrigger className="w-[120px] h-9 bg-white border-slate-200"><SelectValue placeholder="Sexo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Gênero (Todos)</SelectItem>
                                            <SelectItem value="FEM">Feminino</SelectItem>
                                            <SelectItem value="MAS">Masculino</SelectItem>
                                            <SelectItem value="UNI">Unissex</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={pubFilterType} onValueChange={setPubFilterType}>
                                        <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200"><SelectValue placeholder="Tipo" /></SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="ALL">Todos Tipos</SelectItem>
                                            {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={pubFilterTheme} onValueChange={setPubFilterTheme}>
                                        <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200"><SelectValue placeholder="Tema" /></SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="ALL">Todos Temas</SelectItem>
                                            {ALL_THEMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={pubFilterColor} onValueChange={setPubFilterColor}>
                                        <SelectTrigger className="w-[130px] h-9 bg-white border-slate-200"><SelectValue placeholder="Cor" /></SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="ALL">Todas Cores</SelectItem>
                                            {COLORS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {currentList.filter(photo => {
                                        const parsed = parseFilename(photo.filename);
                                        const pCat = photo.category || parsed?.category || 'UNI';
                                        const pType = photo.type || parsed?.type || '';
                                        const pTheme = photo.theme || parsed?.theme || '';
                                        const pColor = photo.color || parsed?.color || '';

                                        const matchesSearch = !publicadosSearch || 
                                            (photo.customName || '').toLowerCase().includes(publicadosSearch.toLowerCase()) || 
                                            photo.filename.toLowerCase().includes(publicadosSearch.toLowerCase());
                                        
                                        const matchesCat = pubFilterCategory === 'ALL' || pCat === pubFilterCategory;
                                        const matchesType = pubFilterType === 'ALL' || pType === pubFilterType;
                                        const matchesTheme = pubFilterTheme === 'ALL' || pTheme === pubFilterTheme;
                                        const matchesColor = pubFilterColor === 'ALL' || pColor === pubFilterColor;

                                        return matchesSearch && matchesCat && matchesType && matchesTheme && matchesColor;
                                    }).map(photo => (
                                        <div key={photo.filename} className="border rounded-2xl overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition-all">
                                            <div className="aspect-square relative flex items-center justify-center bg-white cursor-pointer" onClick={() => openEditor(photo)}>
                                                <Image loading="lazy" src={`/${photo.folder}/${photo.filename}`} alt="Thumb" fill className="object-contain" />
                                            </div>
                                            <div className="p-4">
                                                <p className="font-bold text-gray-800 text-sm truncate" title={photo.customName}>{photo.customName || 'Sem nome'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono truncate">{photo.filename}</p>

                                                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                                    <button onClick={() => openEditor(photo)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 rounded text-xs font-bold transition-colors">Editar</button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const baseId = photo.filename.replace(/\.[^/.]+$/, '');
                                                        const parts = baseId.split('-');
                                                        const libProduct = {
                                                            id: baseId,
                                                            name: photo.customName || baseId,
                                                            type: parts[1] || 'KIT',
                                                            theme: parts[2] || '',
                                                            color: parts[3] || '',
                                                            category: parts[0] || 'UNI',
                                                            raw: photo,
                                                            images: [`/${photo.folder}/${photo.filename}`],
                                                            image: `/${photo.folder}/${photo.filename}`,
                                                        };
                                                        importFromLibrary(libProduct);
                                                    }} className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1" title="Adicionar ao MVP">
                                                        <Plus className="w-3 h-3" /> MVP
                                                    </button>
                                                    <button onClick={() => runAction('unpublish', photo)} className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-1.5 rounded text-xs font-bold transition-colors">Tirar do Ar</button>
                                                    <button onClick={() => runAction('delete', photo)} className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded text-xs font-bold transition-colors" title="Excluir">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'lista' && (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
                                <div className="p-4 flex justify-end bg-gray-50 border-b">
                                    <div className="flex bg-white p-1 rounded-lg border">
                                        <button onClick={() => setDisplayMode('grid')} className={`px-3 py-1 text-xs font-bold rounded ${displayMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Grid</button>
                                        <button onClick={() => setDisplayMode('table')} className={`px-3 py-1 text-xs font-bold rounded ${displayMode === 'table' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Tabela</button>
                                    </div>
                                </div>

                                {displayMode === 'table' ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b text-xs font-bold uppercase text-gray-500 tracking-wider">
                                                <th className="px-6 py-4">Foto</th>
                                                <th className="px-6 py-4">Arquivo / Info</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {allPhotos.map(photo => (
                                                <tr key={photo.filename} className="hover:bg-blue-50 transition-colors">
                                                    <td className="px-6 py-3" onClick={() => openEditor(photo)}>
                                                        <div className="w-16 h-16 rounded overflow-hidden relative border bg-white cursor-pointer">
                                                            <Image loading="lazy" src={`/${photo.folder}/${photo.filename}`} alt="Thumb" fill className="object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <p className="text-sm font-bold text-gray-800">{photo.customName || '-'}</p>
                                                        <p className="text-xs text-gray-400 font-mono">{photo.filename}</p>
                                                        <div className="flex gap-1 mt-1">
                                                            {photo.composition?.map((itm, i) => (
                                                                <span key={i} className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 rounded">{itm.qty}x {getTypeLabel(itm.type)}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {photo.status === 'pendente' || photo.status === 'upload' ? <span className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-700">Nova</span> : null}
                                                        {photo.status === 'conferido' ? <span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-100 text-orange-700">Conferida</span> : null}
                                                        {photo.status === 'publicado' ? <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700">Publicada</span> : null}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button onClick={() => openEditor(photo)} className="text-blue-500 hover:underline text-xs font-bold mr-4">Editar</button>
                                                        <button onClick={() => runAction('delete', photo)} className="text-red-500 hover:underline text-xs font-bold">Excluir</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 p-4 gap-4">
                                        {allPhotos.map((photo) => (
                                            <div key={photo.filename} onClick={() => openEditor(photo)} className="border rounded-xl aspect-[3/4] relative bg-white cursor-pointer hover:shadow-lg transition-all group overflow-hidden">
                                                <Image loading="lazy" src={`/${photo.folder}/${photo.filename}`} alt="T" fill className="object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                    {photo.status === 'pendente' || photo.status === 'upload' ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shadow bg-yellow-500 text-white">NOVO</span> : null}
                                                    {photo.status === 'conferido' ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shadow bg-orange-500 text-white">CONFERIDO</span> : null}
                                                    {photo.status === 'publicado' ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shadow bg-green-500 text-white">NO AR</span> : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ABA 5: MVP (CENTRAL DE PRODUTOS) */}
                        {activeTab === 'mvp' && (
                            <div className="font-sans">
                                {/* Library Importer */}
                                <section id="library-section" className="mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Layout className="w-3.5 h-3.5 text-indigo-400" /> Acervo Disponível <span className="text-[8px] text-slate-400 font-normal normal-case ml-2">(DB: libs:{library.length} all:{allPhotos.length} pub:{allPhotos.filter(p => p.status === 'publicado').length})</span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => fetchPhotos()} className="h-6 text-[10px] text-slate-400 hover:text-indigo-500 px-2">
                                                Atualizar
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-6 border-indigo-300 text-indigo-500 hover:bg-indigo-50 font-bold text-[10px] px-2" onClick={() => {
                                                document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' });
                                                toast.info('Selecione uma foto da biblioteca abaixo para adicionar ao MVP.');
                                            }}>
                                                <Plus className="w-3 h-3 mr-1" /> Importar
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Compact filters row */}
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <div className="flex-1 min-w-[120px] relative">
                                            <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-300" />
                                            <Input placeholder="Buscar..." className="pl-7 h-6 text-[10px] border-slate-200 bg-slate-50" value={libSearchTerm} onChange={(e) => setLibSearchTerm(e.target.value)} />
                                        </div>
                                        <Select value={libFilterCategory} onValueChange={setLibFilterCategory}>
                                            <SelectTrigger className="w-[85px] h-6 text-[10px] bg-white border-slate-200"><SelectValue placeholder="Sexo" /></SelectTrigger>
                                            <SelectContent className="text-xs max-h-[250px] overflow-y-auto">
                                                <SelectItem value="ALL">Gen. (Todos)</SelectItem>
                                                <SelectItem value="FEM">Feminino</SelectItem>
                                                <SelectItem value="MAS">Masculino</SelectItem>
                                                <SelectItem value="UNI">Unissex</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={libFilterType} onValueChange={setLibFilterType}>
                                            <SelectTrigger className="w-[100px] h-6 text-[10px] bg-white border-slate-200"><SelectValue placeholder="Tipo" /></SelectTrigger>
                                            <SelectContent className="text-xs max-h-[250px] overflow-y-auto">
                                                <SelectItem value="ALL">Todos Tipos</SelectItem>
                                                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={libFilterTheme} onValueChange={setLibFilterTheme}>
                                            <SelectTrigger className="w-[100px] h-6 text-[10px] bg-white border-slate-200"><SelectValue placeholder="Tema" /></SelectTrigger>
                                            <SelectContent className="text-xs max-h-[250px] overflow-y-auto">
                                                <SelectItem value="ALL">Todos Temas</SelectItem>
                                                {ALL_THEMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={libFilterColor} onValueChange={setLibFilterColor}>
                                            <SelectTrigger className="w-[100px] h-6 text-[10px] bg-white border-slate-200"><SelectValue placeholder="Cor" /></SelectTrigger>
                                            <SelectContent className="text-xs max-h-[250px] overflow-y-auto">
                                                <SelectItem value="ALL">Todas Cores</SelectItem>
                                                {COLORS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide px-0.5">
                                        {(() => {
                                            const filteredLibrary = library.filter(libItem => {
                                                const matchesSearch = libItem.name.toLowerCase().includes(libSearchTerm.toLowerCase()) || libItem.id.toLowerCase().includes(libSearchTerm.toLowerCase());
                                                const matchesCat = libFilterCategory === 'ALL' || libItem.category === libFilterCategory || (libItem.id && libItem.id.startsWith(libFilterCategory));
                                                const matchesType = libFilterType === 'ALL' || libItem.type === libFilterType || (libItem.id && libItem.id.includes(libFilterType));
                                                const matchesTheme = libFilterTheme === 'ALL' || libItem.theme === libFilterTheme || (libItem.id && libItem.id.includes(libFilterTheme));
                                                const matchesColor = libFilterColor === 'ALL' || libItem.color === libFilterColor || (libItem.id && libItem.id.includes(libFilterColor));
                                                return matchesSearch && matchesCat && matchesType && matchesTheme && matchesColor;
                                            });

                                            if (filteredLibrary.length === 0 && !isLoadingLibrary) {
                                                return <p className="text-slate-400 text-[10px] italic">Nenhum produto pendente com esse filtro.</p>;
                                            }

                                            return (
                                                <>
                                                    {filteredLibrary.map((libItem) => (
                                                        <div key={libItem.filename} onClick={() => importFromLibrary(libItem)} className="flex-shrink-0 w-20 group cursor-pointer">
                                                            <div className="relative aspect-[3/4] rounded-md overflow-hidden mb-1 border border-transparent group-hover:border-indigo-400 shadow-sm group-hover:shadow-md transition-all bg-white">
                                                                <Image loading="lazy" src={libItem.image || '/api/placeholder/80/100'} alt={libItem.name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform" />
                                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-0.5">
                                                                    <Plus className="text-white w-4 h-4 transform group-hover:rotate-90 transition-transform" />
                                                                    <span className="text-white text-[8px] font-bold uppercase tracking-widest">Add</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-700 truncate px-0.5 group-hover:text-indigo-500 transition-colors">{libItem.name}</p>
                                                        </div>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </section>

                                {/* Product Grid Filter Bar */}
                                <div className="mb-3 flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px] uppercase tracking-widest pl-1">
                                        <Filter className="w-3 h-3 text-indigo-400" /> Grid
                                    </div>
                                    <div className="flex-1 min-w-[120px] relative">
                                        <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-300" />
                                        <Input placeholder="Buscar..." className="pl-7 h-6 text-[10px] border-slate-200 bg-slate-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant={filterCategory === 'ALL' ? 'primary' : 'outline'} className={`h-6 text-[10px] px-2 ${filterCategory === 'ALL' ? 'bg-indigo-500 text-white' : 'text-slate-500 border-slate-200 bg-white'}`} onClick={() => setFilterCategory('ALL')}>Todas</Button>
                                        <Button size="sm" variant={filterCategory === 'Kits' ? 'primary' : 'outline'} className={`h-6 text-[10px] px-2 ${filterCategory === 'Kits' ? 'bg-indigo-500 text-white' : 'text-slate-500 border-slate-200 bg-white'}`} onClick={() => setFilterCategory('Kits')}>Kits</Button>
                                        <Button size="sm" variant={filterCategory === 'Geral' ? 'primary' : 'outline'} className={`h-6 text-[10px] px-2 ${filterCategory === 'Geral' ? 'bg-indigo-500 text-white' : 'text-slate-500 border-slate-200 bg-white'}`} onClick={() => setFilterCategory('Geral')}>Geral</Button>
                                    </div>
                                    <select className="h-6 px-1.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 outline-none focus:ring-1 focus:ring-indigo-400" value={filterGrid} onChange={(e) => setFilterGrid(e.target.value)}>
                                        <option value="ALL">Todo Site</option>
                                        <option value="HERO_LEFT">Lado Esq</option>
                                        <option value="HERO_RIGHT">Lado Dir</option>
                                        <option value="FEATURED">Destaque</option>
                                        <option value="BESTSELLER">Top Venda</option>
                                        <option value="OFFERS">Ofertas</option>
                                    </select>
                                </div>

                                <div className="grid gap-3">
                                    {filteredProducts.map((product, idx) => (
                                        <MemoizedProductCard
                                            key={product.id}
                                            product={product}
                                            index={idx}
                                            totalFiltered={filteredProducts.length}
                                            updateProduct={updateProduct}
                                            handlePricingChange={handlePricingChange}
                                            handleUpload={handleUpload}
                                            isUploading={isUploading}
                                            moveProduct={moveProduct}
                                            onRemove={(id) => {
                                                if (confirm("Remover deste painel?")) {
                                                    setProducts(prev => prev.filter(p => p.id !== id));
                                                }
                                            }}
                                            getFinalPrice={getFinalPrice}
                                            toggleHotAndSave={toggleHotAndSave}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── TAB: PRECIFICACAO ─── */}
                        {activeTab === 'precificacao' && (
                            <div className="max-w-4xl mx-auto space-y-6 font-sans">
                                <div className="flex items-center justify-between shrink-0 bg-transparent mb-2">
                                    <div className="flex gap-4 items-center">
                                        <div className="p-2 bg-pink-100 rounded-lg">
                                            <Tag className="w-5 h-5 text-pink-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">Adequar Preços Unitários</h2>
                                            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">
                                                Defina o valor base (LÍQUIDO) que deseja receber.
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleSavePricing} 
                                        disabled={isSavingPricing}
                                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold h-9 px-6 rounded-lg shadow-md shadow-pink-600/20 active:scale-95 transition-all text-sm gap-2 whitespace-nowrap"
                                    >
                                        {isSavingPricing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Salvar & Sincronizar Kits
                                    </Button>
                                </div>
                                
                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 shadow-sm">
                                    <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                                    <div className="text-sm font-medium leading-relaxed">
                                        <strong>Inteligência Automática:</strong> Altere os valores na coluna &quot;Valor Líquido Desejado&quot;. O sistema calcula as taxas da InfinitePay na hora (Pix 0% · Cartão 3,15%) e mostra quanto ficará o valor Bruto final para o cliente. 
                                        Ao salvar, todos os Kits compostos por estas peças serão reajustados instantaneamente.
                                    </div>
                                </div>

                                <Card className="border-gray-200/60 shadow-sm overflow-hidden bg-white">
                                    <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr] gap-4 bg-gray-50 border-b border-gray-100 p-4 shrink-0 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                        <div>Tipo da Peça</div>
                                        <div>Líquido Desejado</div>
                                        <div className="text-indigo-600 text-center">Cliente no PIX</div>
                                        <div className="text-purple-600 text-center">Cliente Cartão</div>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {Object.entries(unitPrices).map(([key, netValue]) => {
                                            const typeLabel = TYPES.find(t => t.value === key)?.label || key;
                                            
                                            // Realtime Math — InfinitePay (faixa até R$20k/mês)
                                            const IP_CARD_PCT = 0.0315;
                                            const IP_PIX_PCT = 0;
                                            const IP_FIXED = 0;
                                            
                                            const pPix = IP_PIX_PCT > 0 ? Math.ceil(netValue / (1 - IP_PIX_PCT)) : netValue;
                                            const pCard = Math.ceil((netValue / (1 - IP_CARD_PCT)) + IP_FIXED);

                                            return (
                                                <div key={key} className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors">
                                                    <div>
                                                        <div className="font-bold text-gray-800 text-sm tracking-tight">{typeLabel}</div>
                                                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">{key}</div>
                                                    </div>
                                                    
                                                    <div className="relative flex items-center">
                                                        <span className="absolute left-3 text-gray-400 font-bold text-[11px]">R$</span>
                                                        <input
                                                            type="number"
                                                            value={netValue || ''}
                                                            onChange={(e) => setUnitPrices(prev => ({...prev, [key]: Number(e.target.value)}))}
                                                            className="w-full pl-8 pr-2 h-9 font-black text-sm text-gray-900 bg-white border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 outline-none rounded-lg shadow-sm transition-all text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                    </div>

                                                    <div className="flex justify-center">
                                                        <div className="font-black text-indigo-700 tabular-nums bg-indigo-50/50 border border-indigo-100/50 px-3 py-1.5 rounded-md text-sm shadow-sm">
                                                            R$ {pPix.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-center">
                                                        <div className="font-black text-purple-700 tabular-nums bg-purple-50/50 border border-purple-100/50 px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center gap-1.5">
                                                            R$ {pCard.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* FULL SCREEN FOCUS MODE (EDIÇÃO/CONFERÊNCIA) */}
                    {editingPhoto && (
                        <div className="fixed inset-0 bg-gray-900 z-50 flex">
                            {/* LEFT: IMAGE & NAVIGATION */}
                            <div className="w-2/3 h-full relative flex items-center justify-center p-4 bg-gray-100 shadow-inner">
                                <Image loading="lazy"
                                    src={`/${editingPhoto.folder}/${editingPhoto.filename}`}
                                    alt="Preview"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                />
                                <button onClick={() => advanceEditor(-1)} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-800 rounded-full p-4 shadow-xl transition-all">
                                    <span className="text-3xl font-black">‹</span>
                                </button>
                                <button onClick={() => advanceEditor(1)} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-800 rounded-full p-4 shadow-xl transition-all">
                                    <span className="text-3xl font-black">›</span>
                                </button>

                                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-mono shadow-xl backdrop-blur-md">
                                    {editorIndex + 1} / {currentList.length}
                                </div>
                                <div className="absolute bottom-4 left-4 bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-mono text-xs shadow-xl backdrop-blur-md font-bold">
                                    Arquivo: {editingPhoto.filename} ({editingPhoto.status})
                                </div>
                            </div>

                            {/* RIGHT: CONTROLS */}
                            <div className="w-1/3 bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
                                <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
                                    <h2 className="text-xl font-bold text-gray-800 text-shadow-sm">Painel de Edição</h2>
                                    <button onClick={() => setEditingPhoto(null)} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 p-2 rounded-full font-bold transition-colors">
                                        ✕ Fechar
                                    </button>
                                </div>

                                <div className="flex-1 p-6 space-y-6">

                                    {/* CATEGORY & BASE INFO */}
                                    <div>
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="h-px bg-gray-200 flex-1" /> Classificação Base <div className="h-px bg-gray-200 flex-1" />
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-xl border">
                                                {['FEM', 'MAS', 'UNI'].map(c => (
                                                    <button
                                                        key={c} onClick={() => setCategory(c as any)}
                                                        className={`py-2 rounded-lg font-bold text-xs transition-colors shadow-sm ${category === c ? 'bg-white text-gray-900 border border-gray-200 ring-2 ring-gray-900/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                                    >{c}</button>
                                                ))}
                                            </div>
                                            <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-sm">
                                                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-sm">
                                                {currentThemes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <select value={color} onChange={e => setColor(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-sm">
                                                {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* DETAILS */}
                                    <div>
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 mt-8">
                                            <div className="h-px bg-gray-200 flex-1" /> Acabamentos Especiais <div className="h-px bg-gray-200 flex-1" />
                                        </h3>
                                        <div className="space-y-3">
                                            <select value={detail} onChange={e => setDetail(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl text-sm font-bold text-gray-700 outline-none transition-all shadow-sm">
                                                <option value="">Sem Detalhe Extra</option>
                                                {DETAILS.filter(d => d.value).map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                            </select>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select value={detailColor} onChange={e => setDetailColor(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg text-xs font-semibold text-gray-600 outline-none">
                                                    <option value="PAD">Cor Babado 1</option>
                                                    {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <select value={detailColor2} onChange={e => setDetailColor2(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg text-xs font-semibold text-gray-600 outline-none">
                                                    <option value="PAD">Cor Babado 2</option>
                                                    {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <select value={detailColor3} onChange={e => setDetailColor3(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg text-xs font-semibold text-gray-600 outline-none">
                                                    <option value="PAD">Cor Babado 3</option>
                                                    {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <select value={detailColor4} onChange={e => setDetailColor4(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg text-xs font-semibold text-gray-600 outline-none">
                                                    <option value="PAD">Cor Babado 4</option>
                                                    {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <select value={detailColor5} onChange={e => setDetailColor5(e.target.value)} className="p-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-lg text-xs font-semibold text-gray-600 outline-none">
                                                    <option value="PAD">Cor Babado 5</option>
                                                    {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                            </div>
                                            <select value={ribbonColor} onChange={e => setRibbonColor(e.target.value)} className="w-full p-2.5 bg-rose-50 border-2 border-rose-100 focus:border-rose-300 rounded-xl text-xs font-bold text-rose-800 outline-none transition-all shadow-sm">
                                                <option value="PAD">Cor Passa Fita: Padrão (Branco)</option>
                                                {RIBBON_COLORS.filter(c => c.value !== 'PAD').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                            <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="frufru"
                                                    checked={hasFrufru}
                                                    onChange={(e) => setHasFrufru(e.target.checked)}
                                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                />
                                                <label htmlFor="frufru" className="text-sm font-bold text-gray-700 cursor-pointer flex-1 user-select-none">
                                                    Babado com Fru-fru (dobrado)
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RICH INFO */}
                                    <div>
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 mt-8">
                                            <div className="h-px bg-gray-200 flex-1" /> Textos e Composição <div className="h-px bg-gray-200 flex-1" />
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Nome Específico / Comercial</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: Kit Luxo Ursinha"
                                                    value={customName}
                                                    onChange={(e) => handleCustomNameChange(e.target.value)}
                                                    className="w-full p-3 bg-yellow-50/50 focus:bg-white border-2 border-yellow-200 focus:border-yellow-400 rounded-xl font-bold text-base text-gray-800 shadow-sm outline-none transition-all placeholder:text-yellow-400/50"
                                                />
                                            </div>

                                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-inner">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Itens Inclusos na Foto</label>

                                                <div className="space-y-2 mb-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {composition.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                                                            <span className="text-xs font-bold text-gray-700">{item.qty}x {TYPES.find(t => t.value === item.type)?.label}</span>
                                                            <button onClick={() => removeCompositionItem(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors text-lg leadin-none h-6 w-6 flex items-center justify-center">×</button>
                                                        </div>
                                                    ))}
                                                    {composition.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-100/50 rounded-lg">Lista de itens vazia</p>}
                                                </div>

                                                <div className="flex gap-2">
                                                    <select value={compType} onChange={(e) => setCompType(e.target.value)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none">
                                                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                    </select>
                                                    <input type="number" min="1" max="99" value={compQty} onChange={(e) => setCompQty(parseInt(e.target.value))} className="w-16 p-2 bg-white border border-gray-200 rounded-lg text-center text-sm font-bold outline-none" />
                                                    <button onClick={addCompositionItem} className="bg-gray-800 hover:bg-gray-900 text-white w-10 flex items-center justify-center rounded-lg font-bold shadow-sm transition-colors">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Quick Header Based on Status */}
                                    <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-inner mt-8">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-blue-800 opacity-60">Ações de Status</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(editingPhoto.status === 'pendente' || editingPhoto.status === 'upload') && (
                                                <button onClick={() => runAction('save_rename')} className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all">
                                                    Salvar, Organizar e Avançar
                                                </button>
                                            )}

                                            {(editingPhoto.status === 'conferido' || editingPhoto.status === 'publicado') && (
                                                <button onClick={() => runAction('save_metadata')} className="col-span-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all">
                                                    Apenas Salvar Dados (Mantém Status)
                                                </button>
                                            )}

                                            {editingPhoto.status === 'conferido' && (
                                                <button onClick={() => runAction('publish')} className="col-span-2 mt-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all ring-4 ring-green-500/20">
                                                    ✅ PUBLICAR NO CATÁLOGO
                                                </button>
                                            )}

                                            {editingPhoto.status === 'publicado' && (
                                                <button onClick={() => runAction('unpublish')} className="bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold py-2.5 rounded-xl shadow-sm transition-all focus:ring-2 ring-orange-400">
                                                    Despublicar
                                                </button>
                                            )}

                                            <button onClick={() => runAction('delete')} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2.5 rounded-xl transition-colors border border-red-100">
                                                Excluir Foto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// ==========================================
// PURE COMPONENT FOR PERFORMANCE (React.memo)
// ==========================================
interface MemoizedCardProps {
    product: any;
    index: number;
    totalFiltered: number;
    updateProduct: (id: string, field: any, value: any) => void;
    handlePricingChange: (id: string, field: 'originalPriceFull' | 'netValue' | 'priceFull' | 'discountPct', value: number | '') => void;
    handleUpload: (id: string, index: number, file: File) => void;
    isUploading: string | null;
    moveProduct: (id: string, dir: 'up' | 'down') => void;
    onRemove: (id: string) => void;
    getFinalPrice: (p: any) => number;
    toggleHotAndSave: (id: string, currentHot: boolean | undefined) => void;
}

const MemoizedProductCard = React.memo(function MemoizedProductCard({ product, index, totalFiltered, updateProduct, handlePricingChange, handleUpload, isUploading, moveProduct, onRemove, getFinalPrice, toggleHotAndSave }: MemoizedCardProps) {
    return (
        <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg bg-white group select-none">
            <div className="flex flex-col md:flex-row p-3 gap-3">

            {/* Left: compact image + grid position + Hot toggle */}
                <div className="flex-1 min-w-[150px] relative flex flex-col gap-1.5 justify-center">
                    <div 
                        className="relative w-full aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hover:border-indigo-400 group/img flex items-center justify-center max-w-full mx-auto"
                        onClick={() => document.getElementById(`upload-${product.id}-0`)?.click()}
                    >
                        <Image loading="lazy" src={product.images[0] || '/api/placeholder/400/400'} alt={product.name} fill sizes="400px" className="object-cover opacity-90 group-hover/img:opacity-100 transition-opacity" />
                        <Badge className="absolute top-1.5 left-1.5 bg-slate-900 shadow-md text-white text-[9px] px-1.5 py-0 z-10 font-bold border-none">{product.gridPosition}</Badge>
                        
                        {/* Hover Overlay for Upload */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        
                        {isUploading === `${product.id}-0` && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30"><div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>}
                        <input type="file" accept="image/*" className="hidden" id={`upload-${product.id}-0`} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(product.id, 0, f); }} />
                    </div>

                    {/* Hot / Fire Toggle - Moved OUTSIDE the image wrapper to prevent click conflicts */}
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHotAndSave(product.id, product.isHot); }}
                        className={`absolute top-1.5 right-1.5 z-40 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            product.isHot 
                                ? 'bg-orange-500 shadow-lg shadow-orange-500/50 scale-110' 
                                : 'bg-slate-800/80 hover:bg-slate-700 opacity-60 hover:opacity-100 backdrop-blur-sm'
                        }`}
                        title={product.isHot ? 'Desativar destaque 🔥' : 'Ativar destaque 🔥'}
                    >
                        <span className={`text-base drop-shadow-sm ${product.isHot ? 'animate-pulse' : ''}`}>🔥</span>
                    </button>
                </div>

                {/* Middle: Name, SKU, Price (Now Fixed Max Width) */}
                <div className="shrink-0 w-full md:w-[750px] grid grid-cols-1 lg:grid-cols-3 gap-3">

                    {/* Col 1 */}
                    <div className="flex flex-col gap-2">
                        <div>
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Nome Comercial</Label>
                            <Input className="h-7 text-xs font-bold border-slate-200 bg-slate-50 focus:bg-white" value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">SKU / ID</Label>
                            <div className="flex gap-1.5">
                                <Input className="h-7 text-[11px] font-mono border-slate-200 bg-slate-100" value={product.id} readOnly onClick={e => (e.target as HTMLInputElement).select()} />
                                <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-slate-200" onClick={() => { navigator.clipboard.writeText(product.id); toast.success('ID Copiado!'); }} title="Copiar ID"><LinkIcon className="w-3.5 h-3.5 text-slate-400" /></Button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 mb-0.5">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Ajuste Rápido (Líquido)</Label>
                            <div className="flex gap-1.5">
                                <Badge variant="outline" className="text-[9px] cursor-pointer bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 px-1.5 py-0" onClick={() => handlePricingChange(product.id, 'netValue', 87)}>Kit Fralda</Badge>
                                <Badge variant="outline" className="text-[9px] cursor-pointer bg-white border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 px-1.5 py-0" onClick={() => handlePricingChange(product.id, 'netValue', 193)}>Kit Manta</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                            <div className="flex flex-col">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase overflow-hidden whitespace-nowrap text-ellipsis" title="Preço Bruto Original (Riscado)">Bruto (De)</Label>
                                <Input type="number" value={product.originalPriceFull ?? ''} onChange={(e) => handlePricingChange(product.id, 'originalPriceFull', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))} className="h-7 font-bold font-mono border-slate-300 bg-white text-xs text-slate-500 line-through [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                            </div>
                            <div className="flex flex-col">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase overflow-hidden whitespace-nowrap text-ellipsis" title="Valor Líquido Desejado">Líquido (Você)</Label>
                                <Input type="number" value={product.netValue === '' ? '' : (product.netValue ? Math.round(product.netValue as number) : '')} onChange={(e) => handlePricingChange(product.id, 'netValue', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))} className="h-7 font-bold font-mono border-indigo-200 bg-indigo-50 text-indigo-700 focus:bg-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                            </div>
                            <div className="flex flex-col">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase overflow-hidden whitespace-nowrap text-ellipsis" title="Preço Venda Cartão">Cartão (Por)</Label>
                                <Input type="number" value={product.priceFull === '' ? '' : (product.priceFull ?? '')} onChange={(e) => handlePricingChange(product.id, 'priceFull', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))} className="h-7 font-bold font-mono border-purple-200 bg-purple-50 text-purple-700 focus:bg-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                            </div>
                            <div className="flex flex-col">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase overflow-hidden whitespace-nowrap text-ellipsis" title="Porcentagem de Desconto">% Desc.</Label>
                                <Input type="number" value={product.discountPct === '' ? '' : (product.discountPct ?? '')} onChange={(e) => handlePricingChange(product.id, 'discountPct', e.target.value === '' ? '' : (parseInt(e.target.value) || 0))} className="h-7 font-black font-mono text-emerald-600 border-emerald-200 bg-emerald-50 focus:bg-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Description */}
                    <div className="flex flex-col gap-1 h-full">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase">Descrição</Label>
                        <Textarea value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} className="min-h-[120px] h-full text-xs leading-relaxed border-slate-200 bg-slate-50 focus:bg-white p-2.5 resize-y" />
                    </div>

                    {/* Col 3: Grid + Price + Remove */}
                    <div className="flex flex-col gap-2">
                        <div>
                            <Label className="text-[11px] font-bold text-slate-400 uppercase">Visibilidade</Label>
                            <Select value={product.gridPosition} onValueChange={(val) => updateProduct(product.id, 'gridPosition', val)}>
                                <SelectTrigger className="h-8 text-[11px] font-bold bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="text-sm">
                                    <SelectItem value="HERO_LEFT">Lado Esq</SelectItem>
                                    <SelectItem value="HERO_RIGHT">Lado Dir</SelectItem>
                                    <SelectItem value="FEATURED">Destaque</SelectItem>
                                    <SelectItem value="BESTSELLER">Top Venda</SelectItem>
                                    <SelectItem value="OFFERS">Ofertas</SelectItem>
                                    <SelectItem value="NONE">Escondido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">Tags</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {['Bestsellers', 'Essenciais', 'Linha Premium', 'Para Presentear', 'Chá de Bebê', 'Custo-Benefício', 'Saída de Maternidade'].map(tag => {
                                    const isActive = (product.tags || []).includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                const current = product.tags || [];
                                                const newTags = isActive ? current.filter((t: string) => t !== tag) : [...current, tag];
                                                updateProduct(product.id, 'tags', newTags);
                                            }}
                                            className={`text-[9.5px] px-2 py-1 rounded-full font-bold border transition-colors ${
                                                isActive
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 bg-indigo-50 border border-indigo-100 rounded p-2 px-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-indigo-400">PIX (Cliente):</span>
                                <span className="text-sm font-black text-indigo-700 tabular-nums">R$ {(product.pixPrice || getFinalPrice(product)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-indigo-400">Cartão (Cliente):</span>
                                <span className="text-xs font-bold text-indigo-600 tabular-nums">R$ {(product.priceFull || 0).toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-indigo-200/50 my-1" />
                            <div className="flex justify-between items-center" title="Valor líquido exato programado na aba de Precificação.">
                                <span className="text-[10px] font-bold uppercase text-emerald-600">VOCÊ RECEBE (-):</span>
                                {/* User explicitly requests to use the calculated precise netValue instead of localized inaccurate math */}
                                <span className="text-[13px] font-black text-emerald-700 tabular-nums">R$ {(product.netValue || ((product.pixPrice || 0) * (1 - 0.0199))).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Button variant="outline" className="flex-1 h-8 text-[11px] px-0 border-slate-200 hover:bg-slate-100" onClick={() => moveProduct(product.id, 'up')} disabled={index === 0}>
                                <ArrowUp className="w-3.5 h-3.5 mr-1.5" /> Subir
                            </Button>
                            <Button variant="outline" className="flex-1 h-8 text-[11px] px-0 border-slate-200 hover:bg-slate-100" onClick={() => moveProduct(product.id, 'down')} disabled={index === totalFiltered - 1}>
                                <ArrowDown className="w-3.5 h-3.5 mr-1.5" /> Descer
                            </Button>
                        </div>

                        <Button variant="ghost" className="h-8 w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-[11px] px-2 rounded font-bold" onClick={() => onRemove(product.id)}>
                            <Trash2 className="w-4 h-4 mr-1.5" /> Excluir
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}, (prevProps, nextProps) => {
    // Custom deep equality to prevent re-renders when other products change
    return prevProps.product === nextProps.product && prevProps.isUploading === nextProps.isUploading;
});

