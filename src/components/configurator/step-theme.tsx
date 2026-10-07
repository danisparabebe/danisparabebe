'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { THEMES_FEM, THEMES_MAS } from '@/data/admin-options';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, ChevronRight, X, Search, ZoomIn, Sparkles } from 'lucide-react';
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
    CAV: {
        photos: [
            '/produtos/conferidos/MAS-KIT-CAV-AZM-BAB-AZM_01.jpg',
            '/produtos/conferidos/MAS-KIT-CAV-VDM-BAB-VDM_01.jpeg',
        ],
        description: 'Cavalinhos e brasões equestres — elegância e personalidade para meninos.',
    },
    ALL: {
        photos: [
            '/temas/variados.png',
            '/temas/safari.png',
        ],
        description: 'Explore todos os 74 desenhos do nosso acervo completo e escolha o seu favorito com total liberdade.',
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
    BBZ: [
        '/temas/bebezinha.png',
    ],
    CAV: [
        '/produtos/conferidos/MAS-KIT-CAV-AZM-BAB-AZM_01.jpg',
        '/produtos/conferidos/MAS-KIT-CAV-VDM-BAB-VDM_01.jpeg',
    ],
    ALL: [
        '/produtos/conferidos/MAS-KIT-SAF-AZM-BAB-AZM_01.jpeg',
        '/produtos/conferidos/FEM-KIT-BOR-RSA-BAB-RSA_01.jpeg',
        '/produtos/conferidos/FEM-KIT-URS-RSA-BAB-RSA-R_01.JPG',
        '/produtos/conferidos/MAS-KIT-MON-AZM-BAB-AZM_01.jpeg',
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
    const [draftTheme, setDraftTheme] = useState(selectedTheme || 'ALL');
    const [draftThemeName, setDraftThemeName] = useState(
        selectedTheme === 'ALL' 
            ? 'Todos os Bordados'
            : ALL_THEMES.find(t => t.value === selectedTheme)?.label || 'Todos os Bordados'
    );
    const [examplesTheme, setExamplesTheme] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewBordado, setPreviewBordado] = useState<any | null>(null);

    // Dynamic Embroidery State
    const [linkedBordados, setLinkedBordados] = useState<any[]>([]);
    const [isLoadingBordados, setIsLoadingBordados] = useState(true);

    // Fetch the linked embroideries for all themes + products
    useEffect(() => {
        const fetchLinkedBordados = async () => {
            try {
                const res = await fetch('/api/bordados');
                const data = await res.json();
                if (data.success && data.relationships) {
                    const uniqueMap = new Map();

                    // 1) First pass: Manual THEME_ links (fontes oficiais dos temas, contêm 100% dos 74 bordados)
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

                    // 2) Second pass: Product-based links (fallback)
                    Object.entries(data.relationships).forEach(([productId, embroideries]) => {
                        if (!String(productId).startsWith('THEME_')) {
                            const parts = String(productId).split('-');
                            if (parts.length >= 3) {
                                let defaultThemeId = parts[2];
                                (embroideries as any[]).forEach(emb => {
                                    const embName = (emb.name || emb.id || '').toLowerCase();
                                    let finalThemeId = defaultThemeId;
                                    if (embName.includes('monograma')) finalThemeId = 'MON';
                                    else if (embName.includes('safari')) finalThemeId = 'SAF';
                                    else if (embName.includes('ursinho') || embName.includes('urso')) finalThemeId = 'URS';
                                    else if (embName.includes('borboleta')) finalThemeId = 'BOR';
                                    else if (embName.includes('floral') || embName.includes('flor')) finalThemeId = 'FLO';
                                    else if (embName.includes('bailarina')) finalThemeId = 'BAI';
                                    else if (embName.includes('coroa')) finalThemeId = 'COR';
                                    else if (embName.includes('nuvem')) finalThemeId = 'NUV';
                                    else if (embName.includes('cavalinho') || embName.includes('cavalo')) finalThemeId = 'CAV';

                                    const uniqueKey = `${emb.url || emb.id}-${finalThemeId}`;
                                    if (!uniqueMap.has(uniqueKey)) {
                                        uniqueMap.set(uniqueKey, { ...emb, themeId: finalThemeId, source: 'product' });
                                    }
                                });
                            }
                        }
                    });

                    setLinkedBordados(Array.from(uniqueMap.values()));
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
        setSearchQuery('');
        setLevel('drilldown');
    };

    const handleBack = () => {
        if (level === 'drilldown') {
            setLevel('gallery');
        } else {
            previousStep();
        }
    };

    const handleConfirm = (photo: string, item?: any) => {
        let finalTheme = draftTheme;
        let finalThemeName = draftThemeName;

        if (draftTheme === 'ALL' && item?.themeId) {
            finalTheme = item.themeId;
            finalThemeName = ALL_THEMES.find(t => t.value === item.themeId)?.label || item.themeId;
        }

        setTheme(finalTheme, finalThemeName);
        setEmbroideryPhoto(photo);
        nextStep();
    };

    // Derived Dynamic Photos for the Drilldown View
    const drillBordados = useMemo(() => {
        if (!draftTheme) return [];
        
        let list: any[] = [];
        if (draftTheme === 'ALL') {
            const unique = new Map<string, any>();
            linkedBordados.forEach(b => {
                const key = b.url || b.id;
                if (!unique.has(key)) {
                    unique.set(key, b);
                }
            });
            list = Array.from(unique.values());
        } else {
            list = linkedBordados.filter(b => b.themeId === draftTheme);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(b => (b.name || b.id || '').toLowerCase().includes(q));
        }

        return list;
    }, [linkedBordados, draftTheme, searchQuery]);

    const galleryData = THEME_GALLERY[draftTheme];

    // Quick theme pills in drilldown
    const themePills = useMemo(() => {
        return [
            { value: 'ALL', label: 'Todos os Bordados' },
            ...ALL_THEMES
        ];
    }, []);

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
                                Clique no tema desejado ou explore nosso acervo completo com todos os 74 desenhos do banco de dados.
                            </p>
                        </div>

                        {/* Banner: Ver Acervo Completo */}
                        <div className="bg-gradient-to-r from-[#1f2937] via-[#2f3e46] to-[#1f2937] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/50">
                            <div className="space-y-2 text-center md:text-left z-10">
                                <span className="inline-flex items-center gap-1.5 bg-[#ADCEB3] text-[#1f2937] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5" /> Acervo Completo Danis
                                </span>
                                <h3 className="text-2xl md:text-3xl font-heading font-black text-white">
                                    Todos os 74 Bordados Disponíveis
                                </h3>
                                <p className="text-white/80 text-sm md:text-base max-w-xl">
                                    Monte seu kit como quiser! Explore todos os desenhos do nosso banco de dados em um só lugar, com busca rápida por nome.
                                </p>
                            </div>
                            <button
                                onClick={() => handleThemeClick('ALL', 'Todos os Bordados')}
                                className="cursor-pointer shrink-0 z-10 bg-[#ADCEB3] hover:bg-[#9cbd9f] text-[#1f2937] font-black text-sm uppercase tracking-wider px-6 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
                            >
                                Ver Todos os Bordados <ChevronRight className="w-4 h-4" strokeWidth={3} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                            {ALL_THEMES.map((theme, i) => {
                                const data = THEME_GALLERY[theme.value];
                                const photos = data?.photos || [];
                                const count = linkedBordados.filter(b => b.themeId === theme.value).length;

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
                                        <div className="relative h-44 md:h-56 w-full overflow-hidden bg-[#faf9f7]">
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
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

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
                                                {count > 0 && (
                                                    <span className="text-white/80 text-xs font-semibold drop-shadow">
                                                        {count} {count === 1 ? 'desenho' : 'desenhos'}
                                                    </span>
                                                )}
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
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setLevel('gallery')}
                                className="flex items-center gap-1.5 text-sm font-bold text-slate hover:text-charcoal transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar para todos os temas
                            </button>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-heading font-black text-[#1f2937]">
                                        {draftThemeName}
                                    </h2>
                                    {galleryData?.description && (
                                        <p className="text-slate text-sm md:text-base mt-1">{galleryData.description}</p>
                                    )}
                                </div>

                                {/* Barra de busca */}
                                <div className="relative w-full md:w-80 shrink-0">
                                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar bordado por nome..."
                                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1f2937]/20 focus:border-[#1f2937]"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Pílulas de filtro rápido de temas */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
                                {themePills.map((pill) => {
                                    const active = draftTheme === pill.value;
                                    const count = pill.value === 'ALL' 
                                        ? new Set(linkedBordados.map(b => b.url || b.id)).size 
                                        : linkedBordados.filter(b => b.themeId === pill.value).length;

                                    return (
                                        <button
                                            key={pill.value}
                                            onClick={() => {
                                                setDraftTheme(pill.value);
                                                setDraftThemeName(pill.label);
                                                setSearchQuery('');
                                            }}
                                            className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                                active
                                                    ? 'bg-[#1f2937] text-white shadow-sm ring-2 ring-[#1f2937]/20'
                                                    : 'bg-white border border-black/10 text-slate-700 hover:border-black/30 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span>{pill.label}</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                <p className="font-medium">
                                    Exibindo <strong>{drillBordados.length}</strong> {drillBordados.length === 1 ? 'bordado disponível' : 'bordados disponíveis'}
                                </p>
                                <p className="text-sage-green-dark font-semibold">
                                    Clique no desenho desejado para confirmar e avançar.
                                </p>
                            </div>
                        </div>

                        {/* Photo/Embroidery grid */}
                        {isLoadingBordados ? (
                            <div className="py-20 flex justify-center w-full">
                                <div className="text-sm font-bold animate-pulse text-slate-400">Carregando Acervo de Bordados...</div>
                            </div>
                        ) : drillBordados.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center w-full text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-6">
                                <p className="text-slate-700 font-bold mb-1">Nenhum bordado encontrado com este filtro.</p>
                                <p className="text-slate-400 text-sm mb-4">Tente buscar por outro termo ou escolha outro tema acima.</p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-xs font-bold text-[#1f2937] underline"
                                    >
                                        Limpar busca "{searchQuery}"
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
                                {drillBordados.map((bordado, i) => {
                                    const chosen = selectedEmbroideryPhoto === bordado.url;
                                    return (
                                        <motion.div
                                            key={`${bordado.id}-${bordado.themeId || i}`}
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                                            className="flex flex-col justify-between bg-white rounded-2xl p-3 border border-black/8 shadow-sm hover:shadow-md transition-all gap-3"
                                        >
                                            {/* Image Container with Zoom Button */}
                                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#faf9f7] border border-black/5 group">
                                                <button
                                                    onClick={() => handleConfirm(bordado.url, bordado)}
                                                    className="w-full h-full relative"
                                                    title={`Selecionar ${bordado.name}`}
                                                >
                                                    <Image 
                                                        src={bordado.url} 
                                                        alt={bordado.name} 
                                                        fill 
                                                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" 
                                                    />
                                                </button>

                                                {/* Zoom Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewBordado(bordado);
                                                    }}
                                                    className="absolute top-2 left-2 p-1.5 rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-[#1f2937] hover:text-white transition-colors"
                                                    title="Ver ampliado"
                                                >
                                                    <ZoomIn className="w-3.5 h-3.5" />
                                                </button>

                                                {chosen && (
                                                    <div className="absolute top-2 right-2 bg-[#ADCEB3] text-[#1f2937] w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name and Select Button */}
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-center text-[#1f2937] line-clamp-1" title={bordado.name}>
                                                    {bordado.name}
                                                </p>
                                                <button
                                                    onClick={() => handleConfirm(bordado.url, bordado)}
                                                    className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                        chosen 
                                                            ? 'bg-[#ADCEB3] text-[#1f2937] shadow-sm' 
                                                            : 'bg-slate-100 text-slate-700 hover:bg-[#1f2937] hover:text-white'
                                                    }`}
                                                >
                                                    {chosen ? 'Selecionado' : 'Escolher este'}
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
            
            {/* Modal de Zoom do Bordado */}
            <AnimatePresence>
                {previewBordado && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                            onClick={() => setPreviewBordado(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-black/8 bg-white">
                                <div>
                                    <h3 className="text-xl font-heading font-black text-[#1f2937]">
                                        {previewBordado.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Visualização ampliada do bordado</p>
                                </div>
                                <button 
                                    onClick={() => setPreviewBordado(null)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative aspect-square w-full bg-[#faf9f7] p-8 flex items-center justify-center">
                                <Image
                                    src={previewBordado.url}
                                    alt={previewBordado.name}
                                    fill
                                    className="object-contain p-6"
                                />
                            </div>

                            <div className="p-5 border-t border-black/8 bg-white flex items-center gap-3">
                                <button
                                    onClick={() => setPreviewBordado(null)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-black/10 font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => {
                                        const b = previewBordado;
                                        setPreviewBordado(null);
                                        handleConfirm(b.url, b);
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl bg-[#ADCEB3] hover:bg-[#9cbd9f] text-[#1f2937] font-black text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    Escolher este <Check className="w-4 h-4" strokeWidth={3} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
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
                                        Exemplos: {ALL_THEMES.find(t => t.value === examplesTheme)?.label || 'Bordados'}
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
