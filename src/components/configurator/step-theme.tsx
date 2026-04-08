'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { THEMES_FEM, THEMES_MAS } from '@/data/admin-options';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';

// Merge + dedupe themes, keeping insertion order, and REMOVE "TIM" (Times)
const ALL_THEMES = Array.from(
    new Map([...THEMES_FEM, ...THEMES_MAS].map((t) => [t.value, t])).values()
).filter(t => t.value !== 'TIM');

// Representative photos for the theme gallery (two photos per theme where possible)
const THEME_GALLERY: Record<string, { photos: string[]; description: string }> = {
    SAF: {
        photos: [
            '/temas/safari.png',
            '/produtos/conferidos/MAS-KIT-SAF-AZM-BAB-AZM_01.jpeg',
        ],
        description: 'Leões, girafas e elefantes em traços delicados — perfeito para meninos aventureiros.',
    },
    URS: {
        photos: [
            '/temas/ursinho.png',
            '/produtos/conferidos/FEM-KIT-URS-RSA-BAB-RSA-R_01.JPG',
        ],
        description: 'O clássico ursinho encantador, disponível em versões feminina e masculina.',
    },
    BOR: {
        photos: [
            '/temas/borboletas.png',
            '/produtos/conferidos/FEM-KIT-BOR-RSA-BAB-RSA_01.jpeg',
        ],
        description: 'Borboletas delicadas e graciosas em variadas combinações de cores.',
    },
    FLO: {
        photos: [
            '/temas/floral.png',
            '/produtos/conferidos/FEM-KIT-FLO-RSA-BAB-RSA_01.jpeg',
        ],
        description: 'Flores bordadas com elegância e feminilidade.',
    },
    JDE: {
        photos: [
            '/temas/jardim_encantado.png',
            '/produtos/conferidos/FEM-KIT-JDE-RSA-BAB-RSA_01.jpeg',
        ],
        description: 'Um jardim encantado cheio de flores, borboletas e cores vibrantes.',
    },
    COR: {
        photos: [
            '/temas/coroa.png',
            '/produtos/conferidos/FEM-KIT-COR-RSE-BAB-RSE_01.jpeg',
        ],
        description: 'A realeza do berço — coroas bordadas com requinte para futuros reis e rainhas.',
    },
    MON: {
        photos: [
            '/temas/monograma.png',
            '/produtos/conferidos/MAS-KIT-MON-AZM-BAB-AZM_01.jpeg',
        ],
        description: 'O monograma com a inicial do bebê — minimalista e atemporal.',
    },
    BAI: {
        photos: [
            '/temas/bailarina.png',
            '/produtos/conferidos/FEM-KIT-BAI-MAR-BAB-MAR_01.jpeg',
        ],
        description: 'A graciosidade da bailarina — ideal para meninas que irão dançar pela vida.',
    },
    NUV: {
        photos: [
            '/temas/nuvens.png',
            '/produtos/conferidos/MAS-KIT-NUV-ABB-BAB-ABB_01.jpeg',
        ],
        description: 'Nuvens fofinhas e sonhadoras para um enxoval suave e delicado.',
    },
    PER: {
        photos: [
            '/temas/personagens.png',
            '/produtos/conferidos/MAS-KIT-PER-AZM-BAB-AZM_01.jpeg',
        ],
        description: 'Personagens especiais bordados com carinho — solicite o personagem desejado nas observações.',
    },
    VAR: {
        photos: [
            '/temas/variados.png',
            '/produtos/conferidos/MAS-KIT-VAR-BGE-BAB-BCO_01.jpeg',
        ],
        description: 'Combinação de vários desenhos — peças variadas com bordados diferentes.',
    },
    BBZ: {
        photos: [
            '/temas/bebezinha.png',
        ],
        description: 'Desenhos fofos e carinhas de bebê — doçura pura.',
    },
};

// All photos available for a theme (for drill-down second level)
const ALL_THEME_PHOTOS: Record<string, string[]> = {
    SAF: [
        '/produtos/conferidos/MAS-KIT-SAF-AZM-BAB-AZM_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-ABB-BAB-ABB-R_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-ABB-BAB-AZM-ABB_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-ABB-TCB-ABB-BCO_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-AZM-BAB-ABB-R_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-AZM-BAB-BCO_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-AZM-TCB-BCO-AZM_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-CRE-BAB-CRE-BGE_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-VDC-BAB-VDC_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-VDM-BAB-BCO-BGE_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-VDM-BAB-VDM-BCO_01.jpeg',
        '/produtos/conferidos/MAS-KIT-SAF-VDM-BAB-VDM_01.jpeg',
    ],
    URS: [
        '/produtos/conferidos/FEM-KIT-URS-RSA-BAB-RSA-R_01.JPG',
        '/produtos/conferidos/FEM-KIT-URS-CRE-BAB-CRE_01.jpeg',
        '/produtos/conferidos/FEM-KIT-URS-MAR-BAB-MAR_01.jpeg',
        '/produtos/conferidos/FEM-KIT-URS-PNK-TCB-RSA-R_01.jpeg',
        '/produtos/conferidos/FEM-KIT-URS-RSE-BAB-RSE_01.jpeg',
        '/produtos/conferidos/MAS-KIT-URS-AZM-BAB-AZM_01.jpeg',
        '/produtos/conferidos/MAS-KIT-URS-ABB-BAB-ABB_01.jpeg',
        '/produtos/conferidos/MAS-KIT-URS-VDC-BAB-VDC_01.jpeg',
        '/produtos/conferidos/MAS-KIT-URS-BGE-BAB-BCO_01.jpeg',
    ],
    BOR: [
        '/produtos/conferidos/FEM-KIT-BOR-RSA-BAB-RSA_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BOR-RLC-BAB-BCO-RLC_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BOR-RLC-BAB-RLC_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BOR-RSA-BAB-RSA-R_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BOR-RSE-BAB-RSE_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BOR-VRM-BAB-VRM_01.jpeg',
    ],
    FLO: [
        '/produtos/conferidos/FEM-KIT-FLO-RSA-BAB-RSA_01.jpeg',
        '/produtos/conferidos/FEM-KIT-FLO-LIL-BAB-BCO_01.jpeg',
        '/produtos/conferidos/FEM-KIT-FLO-LIL-BAB-LIL_01.jpeg',
        '/produtos/conferidos/FEM-KIT-FLO-RLC-BAB-BCO_01.jpeg',
        '/produtos/conferidos/FEM-KIT-FLO-RSE-BAB-RSE_01.jpeg',
        '/produtos/conferidos/FEM-KIT-FLO-VRM-BAB-VRM_01.jpeg',
    ],
    JDE: [
        '/produtos/conferidos/FEM-KIT-JDE-RSA-BAB-RSA_01.jpeg',
        '/produtos/conferidos/FEM-KIT-JDE-LIL-BAB-LIL_01.jpeg',
        '/produtos/conferidos/FEM-KIT-JDE-ABB-BAB-PNK-BCO_01.jpeg',
        '/produtos/conferidos/FEM-KIT-JDE-AMA-BAB-LIL-VDC_01.jpeg',
    ],
    COR: [
        '/produtos/conferidos/FEM-KIT-COR-RSE-BAB-RSE_01.jpeg',
        '/produtos/conferidos/MAS-KIT-COR-VDC-BAB-VDC_01.jpeg',
    ],
    MON: [
        '/produtos/conferidos/FEM-KIT-MON-RSA-BAB-RSA_01.jpeg',
        '/produtos/conferidos/FEM-KIT-MON-RSE-BAB-RSE_01.jpeg',
        '/produtos/conferidos/FEM-KIT-MON-CRE-BAB-CRE_01.jpeg',
        '/produtos/conferidos/FEM-KIT-MON-VRM-BAB-VRM_01.jpeg',
        '/produtos/conferidos/MAS-KIT-MON-AZM-BAB-AZM_01.jpeg',
        '/produtos/conferidos/MAS-KIT-MON-BGE-BAB-BGE_01.jpeg',
        '/produtos/conferidos/MAS-KIT-MON-VDM-BAB-VDM_01.jpeg',
    ],
    BAI: [
        '/produtos/conferidos/FEM-KIT-BAI-RSA-BAB-RSA_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BAI-MAR-BAB-MAR_01.jpeg',
    ],
    NUV: [
        '/produtos/conferidos/FEM-KIT-NUV-RSA-BAB-RSA-R_01.jpeg',
        '/produtos/conferidos/MAS-KIT-NUV-ABB-BAB-ABB_01.jpeg',
    ],
    PER: [
        '/produtos/conferidos/FEM-KIT-PER-RSE-BAB-RSE_01.jpeg',
        '/produtos/conferidos/MAS-KIT-PER-AZM-BAB-AZM_01.jpeg',
    ],
    VAR: [
        '/produtos/conferidos/MAS-KIT-VAR-AZM-BAB-AZM_01.jpeg',
        '/produtos/conferidos/MAS-KIT-VAR-BGE-BAB-BCO_01.jpeg',
        '/produtos/conferidos/MAS-KIT-VAR-VDC-BAB-VDC_01.jpeg',
        '/produtos/conferidos/MAS-KIT-VAR-AZT-BAB-AZT_01.jpeg',
        '/produtos/conferidos/MAS-KIT-VAR-LRJ-BAB-LRJ_01.jpeg',
    ],
};

export function StepTheme() {
    const { 
        selectedProduct, 
        selectedTheme, 
        selectedEmbroideryPhoto, 
        setTheme, 
        setEmbroideryPhoto, 
        nextStep, 
        previousStep 
    } = useConfiguratorStore();

    // level: 'gallery' = theme list, 'drilldown' = specific photos of chosen theme
    const [level, setLevel] = useState<'gallery' | 'drilldown'>(selectedTheme ? 'drilldown' : 'gallery');
    const [draftTheme, setDraftTheme] = useState(selectedTheme);
    const [draftThemeName, setDraftThemeName] = useState(
        ALL_THEMES.find(t => t.value === selectedTheme)?.label || ''
    );
    const [examplesTheme, setExamplesTheme] = useState<string | null>(null);

    // Dynamic Embroidery State
    const [linkedBordados, setLinkedBordados] = useState<any[]>([]);
    const [isLoadingBordados, setIsLoadingBordados] = useState(true);

    // Fetch the linked embroideries for the selected product (or all products if none is selected)
    useEffect(() => {
        const fetchLinkedBordados = async () => {
            try {
                const res = await fetch('/api/admin/bordados');
                const data = await res.json();
                if (data.success && data.relationships) {
                    if (selectedProduct?.id) {
                        // In product page personalization flow
                        const productLinks = data.relationships[selectedProduct.id] || [];
                        
                        if (productLinks.length === 0) {
                            // Automatically fallback to the Theme embroideries if product has no specific explicit links
                            const parts = String(selectedProduct.id).split('-');
                            if (parts.length >= 3) {
                                const themeId = parts[2];
                                const themeLinks = data.relationships[`THEME_${themeId}`] || [];
                                setLinkedBordados(themeLinks.map((emb: any) => ({ ...emb, themeId })));
                            } else {
                                setLinkedBordados([]);
                            }
                        } else {
                            setLinkedBordados(productLinks);
                        }
                    } else {
                        // In global configurator flow: Merge THEME_ manual links + product-based links.
                        // THEME_ links have priority over product-based ones in deduplication.
                        const uniqueMap = new Map();

                        // 1) First pass: Manual THEME_ links (highest priority)
                        Object.entries(data.relationships).forEach(([productId, embroideries]) => {
                            if (String(productId).startsWith('THEME_')) {
                                const themeId = String(productId).replace('THEME_', '');
                                (embroideries as any[]).forEach(emb => {
                                    const uniqueKey = `${emb.url || emb.id}-${themeId}`;
                                    if (!uniqueMap.has(uniqueKey)) {
                                        uniqueMap.set(uniqueKey, { ...emb, themeId, source: 'manual' });
                                    }
                                });
                            }
                        });

                        // 2) Second pass: Product-based links (fallback, won't overwrite manual)
                        Object.entries(data.relationships).forEach(([productId, embroideries]) => {
                            if (!String(productId).startsWith('THEME_')) {
                                const parts = String(productId).split('-');
                                if (parts.length >= 3) {
                                    const themeId = parts[2];
                                    (embroideries as any[]).forEach(emb => {
                                        const uniqueKey = `${emb.url || emb.id}-${themeId}`;
                                        if (!uniqueMap.has(uniqueKey)) {
                                            uniqueMap.set(uniqueKey, { ...emb, themeId, source: 'product' });
                                        }
                                    });
                                }
                            }
                        });

                        setLinkedBordados(Array.from(uniqueMap.values()));
                    }
                }
            } catch (error) {
                console.error("Erro ao puxar bordados dinâmicos:", error);
            } finally {
                setIsLoadingBordados(false);
            }
        };

        fetchLinkedBordados();
    }, [selectedProduct?.id]);

    const handleThemeClick = (id: string, name: string) => {
        setDraftTheme(id);
        setDraftThemeName(name);
        setLevel('drilldown');
    };

    const handleBack = () => {
        if (level === 'drilldown') {
            setLevel('gallery');
        } else {
            previousStep();
        }
    };

    const handleConfirm = (photo: string) => {
        setTheme(draftTheme, draftThemeName);
        setEmbroideryPhoto(photo);
        nextStep();
    };

    // Derived Dynamic Photos for the Drilldown View
    // Filter the product's linked embroideries to match the chosen draftTheme category.
    const drillBordados = useMemo(() => {
        if (!draftTheme) return [];
        
        // If we have selectedProduct, we just display the ones linked directly to it
        if (selectedProduct?.id) {
            return linkedBordados;
        }

        // If we are aggregating, filter by the themeId we injected from the product ID
        return linkedBordados.filter(b => b.themeId === draftTheme);
    }, [linkedBordados, draftTheme, selectedProduct?.id]);

    const galleryData = THEME_GALLERY[draftTheme];

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">

                {/* ── LEVEL 1: Theme Gallery ── */}
                {level === 'gallery' && (
                    <motion.div
                        key="gallery"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1f2937]">
                                Escolha o tema do bordado
                            </h2>
                            <p className="text-slate text-base md:text-lg max-w-xl mx-auto">
                                Clique no tema desejado para ver todos os bordados disponíveis dentro dessa opção.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                            {ALL_THEMES.map((theme, i) => {
                                const data = THEME_GALLERY[theme.value];
                                const photos = data?.photos || [];
                                return (
                                    <motion.button
                                        key={theme.value}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => handleThemeClick(theme.value, theme.label)}
                                        className="cursor-pointer group relative rounded-3xl overflow-hidden border-2 border-transparent
                                                   hover:border-[#1f2937] shadow-sm hover:shadow-xl
                                                   transition-all duration-300 text-left bg-white"
                                    >
                                        {/* Single Photo Container */}
                                        <div className="relative h-40 md:h-52 w-full overflow-hidden bg-[#faf9f7]">
                                            {photos.length > 0 ? (
                                                <Image
                                                    src={photos[0]}
                                                    alt={theme.label}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <span className="text-slate/30 text-xs font-bold uppercase tracking-widest">Sem Capa</span>
                                                </div>
                                            )}

                                            {/* Subdued gradient overlay for text readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

                                            {/* Centered 'Ver bordados' pill */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <span className="bg-white/95 text-[#1f2937] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                    Ver bordados <ChevronRight className="w-4 h-4" strokeWidth={3} />
                                                </span>
                                            </div>

                                            {/* Label overlaying the image at the bottom */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <p className="text-white text-lg font-black uppercase tracking-widest leading-tight drop-shadow-md">
                                                    {theme.label}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Back */}
                        <div className="hidden md:flex justify-start pt-2">
                            <button
                                onClick={previousStep}
                                className="flex items-center gap-2 text-sm font-semibold text-slate hover:text-charcoal transition-colors border border-black/10 px-5 py-3 rounded-full hover:bg-warm-stone/50"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── LEVEL 2: Drill-down (specific embroidery photos) ── */}
                {level === 'drilldown' && (
                    <motion.div
                        key="drilldown"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setLevel('gallery')}
                                className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-charcoal transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Todos os temas
                            </button>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-charcoal">
                                {draftThemeName}
                            </h2>
                            {galleryData?.description && (
                                <p className="text-slate text-base">{galleryData.description}</p>
                            )}
                            <p className="text-sm text-sage-green-dark font-medium">
                                Clique na foto que mais combina com o seu projeto.
                            </p>
                        </div>

                        {/* Photo/Embroidery grid */}
                        {isLoadingBordados ? (
                            <div className="py-20 flex justify-center w-full">
                                <div className="text-sm font-bold animate-pulse text-slate-400">Carregando Acervo de Bordados...</div>
                            </div>
                        ) : drillBordados.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center w-full text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-500 font-bold mb-1">Nenhum bordado atrelado a este tema neste kit.</p>
                                <p className="text-slate-400 text-sm">Acesse o painel "Gestão de Bordados" para atrelar novos arquivos a este produto.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {drillBordados.map((bordado, i) => {
                                    const chosen = selectedEmbroideryPhoto === bordado.url && selectedTheme === draftTheme;
                                    return (
                                        <motion.div
                                            key={bordado.id}
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex flex-col gap-3"
                                        >
                                            {/* Image Container */}
                                            <button
                                                onClick={() => handleConfirm(bordado.url)}
                                                className={`relative w-full aspect-square rounded-2xl overflow-hidden border-3 transition-all duration-200 bg-white
                                                    ${chosen
                                                        ? 'border-sage-green-dark ring-4 ring-sage-green/20 shadow-md'
                                                        : 'border-transparent border-slate-200 hover:border-sage-green-dark/50 hover:shadow-md'
                                                    }`}
                                            >
                                                <Image src={bordado.url} alt={bordado.name} fill className="object-contain p-2" unoptimized />
                                                {chosen && (
                                                    <div className="absolute top-3 right-3 bg-sage-green text-[#1f2937] w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleConfirm(bordado.url)}
                                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                                        chosen 
                                                        ? 'bg-[#ADCEB3] text-[#1f2937] shadow-sm' 
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {chosen ? 'Selecionado' : 'Escolher este'}
                                                </button>
                                                
                                                <button
                                                    className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors border-2 border-transparent hover:border-slate-200"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setExamplesTheme(draftTheme);
                                                    }}
                                                >
                                                    Ver exemplos
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Examples Modal */}
            <AnimatePresence>
                {examplesTheme && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setExamplesTheme(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#faf9f7] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-line bg-white shrink-0">
                                <div>
                                    <h3 className="text-xl font-heading font-black text-charcoal">
                                        Exemplos: {ALL_THEMES.find(t => t.value === examplesTheme)?.label}
                                    </h3>
                                    <p className="text-sm text-slate mt-0.5">Kits reais bordados com este estilo para você se inspirar.</p>
                                </div>
                                <button 
                                    onClick={() => setExamplesTheme(null)}
                                    className="p-2.5 bg-warm-stone/50 hover:bg-line rounded-full transition-colors text-charcoal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Scrollable grid */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {(ALL_THEME_PHOTOS[examplesTheme] || []).map((photo, j) => (
                                        <div key={j} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-line bg-white group">
                                            <Image 
                                                src={photo} 
                                                alt="Exemplo" 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                    ))}
                                    
                                    {(ALL_THEME_PHOTOS[examplesTheme] || []).length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-500">
                                            Ainda não temos fotos de exemplos adicionadas para este tema.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="p-4 border-t border-line bg-white shrink-0 flex justify-center">
                                <button 
                                    onClick={() => setExamplesTheme(null)}
                                    className="px-8 py-2.5 bg-[#ADCEB3] text-charcoal text-sm font-bold rounded-full hover:bg-[#9cbd9f] transition-colors shadow-sm"
                                >
                                    Voltar aos Bordados
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
