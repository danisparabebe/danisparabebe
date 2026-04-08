/**
 * 🎀 GERADOR DE DESCRIÇÕES AUTOMÁTICAS — Danis Para Bebê
 * ======================================================
 * Gera descrições ricas, únicas e personalizadas para cada produto,
 * usando dados reais de medidas, tecidos, temas e cores.
 * 
 * Formato de saída: string com marcadores de seção (§SECTION§) 
 * para renderização rica no PDP.
 */

import { PRODUCT_TAXONOMY, type ProductSizing } from '@/data/product-taxonomy';
import { TYPES, COLORS, THEMES_FEM, THEMES_MAS, DETAILS } from '@/data/admin-options';

// ─── TIPOS ─────────────────────────────────────────────────────────
export interface DescriptionInput {
    name: string;              // Nome comercial (ex: "Kit Manta Monograma Rosê")
    composition: { type: string; qty: number }[];  // Itens inclusos
    theme?: string;            // Código do tema (ex: "MON", "SAF")
    color?: string;            // Código da cor principal (ex: "RSE", "VDM")
    category?: string;         // FEM / MAS / UNI
    detail?: string;           // Código do acabamento (ex: "BAB", "POA")
    hasFrufru?: boolean;       // Se tem babado fru-fru
}

// ─── HELPERS DE LOOKUP ─────────────────────────────────────────────
function getThemeLabel(code: string, category?: string): string {
    const allThemes = [...THEMES_FEM, ...THEMES_MAS];
    return allThemes.find(t => t.value === code)?.label || code;
}

function getColorLabel(code: string): string {
    return COLORS.find(c => c.value === code)?.label || code;
}

function getTypeLabel(code: string): string {
    return TYPES.find(t => t.value === code)?.label || code;
}

function getDetailLabel(code: string): string {
    if (!code) return '';
    return DETAILS.find(d => d.value === code)?.label || '';
}

function getTaxonomy(code: string): ProductSizing | null {
    return PRODUCT_TAXONOMY[code] || null;
}

// ─── FRASES VARIADAS (BANCO DE TEMPLATES) ──────────────────────────

const INTRO_TEMPLATES_FEM = [
    (theme: string, color: string) => `Um encanto em cada detalhe! Este conjunto no tema ${theme}, em tons de ${color}, foi pensado para deixar o enxoval da sua princesinha ainda mais especial.`,
    (theme: string, color: string) => `Delicadeza pura! Com o tema ${theme} em ${color}, este kit traz o aconchego perfeito para os primeiros momentos da sua bebê.`,
    (theme: string, color: string) => `Apaixonante do primeiro ao último detalhe! O tema ${theme} em ${color} dá vida a este conjunto feito com todo o carinho do mundo.`,
    (theme: string, color: string) => `Sonho de princesa! Este kit ${theme} em ${color} é puro encanto — perfeito para receber sua bebê com muito amor e estilo.`,
    (theme: string, color: string) => `Ternura em cada bordado! O tema ${theme} combina perfeitamente com o tom ${color}, criando um conjunto único e cheio de personalidade.`,
];

const INTRO_TEMPLATES_MAS = [
    (theme: string, color: string) => `Aventura e charme! Este conjunto no tema ${theme}, em tons de ${color}, traz estilo e conforto para o enxoval do seu pequeno explorador.`,
    (theme: string, color: string) => `Lindo e cheio de personalidade! Com o tema ${theme} em ${color}, cada pecinha foi pensada para os momentos mais especiais do seu bebê.`,
    (theme: string, color: string) => `Estilo desde o primeiro dia! O tema ${theme} em ${color} dá um toque único a este conjunto feito com muito carinho e atenção.`,
    (theme: string, color: string) => `Para um pequeno príncipe! Este kit ${theme} em ${color} combina fofura e praticidade no enxoval do seu bebê.`,
];

const INTRO_TEMPLATES_UNI = [
    (theme: string, color: string) => `Encanto universal! Este conjunto no tema ${theme}, em tons de ${color}, é perfeito para receber qualquer bebê com muito amor.`,
    (theme: string, color: string) => `Delicadeza para todos! Com o tema ${theme} em ${color}, este kit é ideal tanto para meninas quanto para meninos.`,
    (theme: string, color: string) => `Neutro e encantador! O tema ${theme} em ${color} traz suavidade e elegância a este conjunto exclusivo.`,
];

const PERSONALIZATION_PHRASES = [
    'Cada pecinha é cuidadosamente bordada e personalizada com o nome do seu bebê, transformando o enxoval em algo verdadeiramente único.',
    'Todas as peças recebem bordado personalizado com o nome do seu bebê — um toque de exclusividade que torna cada item insubstituível.',
    'O nome do seu bebê é bordado com carinho em cada peça, garantindo que este kit seja tão especial e único quanto o seu pequeno(a).',
];

const QUALITY_PHRASES = [
    'Utilizamos apenas tecidos 100% algodão de alta qualidade, selecionados especialmente para o contato com a pele sensível do recém-nascido. Cada costura, cada detalhe e cada acabamento é pensado para oferecer o máximo de conforto e durabilidade.',
    'Todos os materiais são premium e 100% algodão, garantindo maciez extrema e segurança para a pele delicada do bebê. Nosso padrão de qualidade é rigoroso porque sabemos que seu bebê merece o melhor.',
    'A qualidade dos nossos tecidos é incomparável: 100% algodão, macios, hipoalergênicos e pensados para o conforto do seu bebê. Cada peça passa por um rigoroso controle de qualidade antes de chegar até você.',
];

const TIMEFRAME_PHRASES = [
    '⏱️ Prazo de confecção: 7 a 12 dias úteis. Como cada peça é feita sob encomenda e personalizada exclusivamente para o seu bebê, pedimos um tempinho especial de preparo.',
    '⏱️ Tempo de produção: 7 a 12 dias úteis. Cada kit é produzido artesanalmente sob encomenda, garantindo atenção total aos detalhes do seu pedido.',
    '⏱️ Confecção artesanal: 7 a 12 dias úteis. Seu kit é feito exclusivamente para você — nenhuma peça é produzida em série, por isso cada detalhe recebe atenção especial.',
];

const CLOSING_PHRASES = [
    '✨ Produção 100% artesanal e exclusiva. Cada kit é único, feito especialmente para o seu bebê. Não trabalhamos com estoque — tudo é criado sob medida, com amor e dedicação.',
    '✨ Este é um produto artesanal premium e exclusivo. Não existem duas peças iguais — cada kit é criado especialmente para você, do bordado ao acabamento final.',
    '✨ Exclusividade que você não encontra em nenhum outro lugar. Produção artesanal limitada, feita sob encomenda com os melhores materiais e todo o carinho que seu bebê merece.',
];

// ─── GERADOR PRINCIPAL ─────────────────────────────────────────────

function pickRandom<T>(arr: T[], seed: string): T {
    // Deterministic pick based on product name hash so descriptions are consistent
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return arr[Math.abs(hash) % arr.length];
}

export function generateProductDescription(input: DescriptionInput): string {
    const { name, composition, theme, color, category, detail, hasFrufru } = input;

    const themeLabel = theme ? getThemeLabel(theme, category) : '';
    const colorLabel = color ? getColorLabel(color) : '';
    const detailLabel = detail ? getDetailLabel(detail) : '';

    // ─── 1. INTRO ───────────────────────────────────────────
    let introTemplates = INTRO_TEMPLATES_UNI;
    if (category === 'FEM') introTemplates = INTRO_TEMPLATES_FEM;
    if (category === 'MAS') introTemplates = INTRO_TEMPLATES_MAS;

    const intro = pickRandom(introTemplates, name)(
        themeLabel || 'Exclusivo',
        colorLabel || 'tons suaves'
    );

    // ─── 2. PERSONALIZAÇÃO ──────────────────────────────────
    const personalization = pickRandom(PERSONALIZATION_PHRASES, name + 'p');

    // ─── 3. ITENS INCLUSOS ──────────────────────────────────
    const totalItems = composition.reduce((sum, c) => sum + c.qty, 0);
    const itemLines = composition.map(c => {
        const label = getTypeLabel(c.type);
        return `• ${c.qty}x ${label}`;
    }).join('\n');

    const itemsSection = `§ITEMS§\n📦 Este kit contém ${totalItems} ${totalItems === 1 ? 'peça' : 'peças'}:\n\n${itemLines}`;

    // ─── 4. MEDIDAS E TECIDOS ───────────────────────────────
    const sizeLines = composition.map(c => {
        const tax = getTaxonomy(c.type);
        const label = getTypeLabel(c.type);
        if (tax) {
            return `📐 ${label}: ${tax.dimensions} — ${tax.material}`;
        }
        return `📐 ${label}: Tamanho padrão`;
    }).join('\n');

    const sizesSection = `§SIZES§\n${sizeLines}`;

    // ─── 5. ACABAMENTOS ESPECIAIS ───────────────────────────
    let finishSection = '';
    const finishDetails: string[] = [];
    if (detailLabel) finishDetails.push(detailLabel);
    if (hasFrufru) finishDetails.push('Babado com Fru-fru dobrado');

    if (finishDetails.length > 0) {
        finishSection = `§FINISH§\n🎀 Acabamentos especiais: ${finishDetails.join(' + ')}`;
    }

    // ─── 6. QUALIDADE ───────────────────────────────────────
    const quality = pickRandom(QUALITY_PHRASES, name + 'q');

    // ─── 7. PRAZO ───────────────────────────────────────────
    const timeframe = pickRandom(TIMEFRAME_PHRASES, name + 't');

    // ─── 8. FECHAMENTO ──────────────────────────────────────
    const closing = pickRandom(CLOSING_PHRASES, name + 'c');

    // ─── MONTAGEM FINAL ─────────────────────────────────────
    const sections = [
        `§INTRO§\n${intro}`,
        `§PERSONAL§\n${personalization}`,
        itemsSection,
        sizesSection,
        finishSection,
        `§QUALITY§\n${quality}`,
        `§TIMEFRAME§\n${timeframe}`,
        `§CLOSING§\n${closing}`,
    ].filter(Boolean);

    return sections.join('\n\n');
}

/**
 * Gera uma descrição "plain text" simplificada (fallback)
 * para contextos onde não se usa o renderer rico.
 */
export function generatePlainDescription(input: DescriptionInput): string {
    const rich = generateProductDescription(input);
    // Strip section markers
    return rich.replace(/§[A-Z]+§\n?/g, '').trim();
}
