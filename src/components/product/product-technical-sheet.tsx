'use client';

import React from 'react';
import Image from 'next/image';
import { productControl } from '@/data/product-control';
import { PRODUCT_TAXONOMY } from '@/data/product-taxonomy';
import { TYPES, COLORS, RIBBON_COLORS, BABADOS, PASSA_FITAS } from '@/data/admin-options';
import { Calendar, Clock, MapPin, Phone, User, CheckSquare, AlertTriangle, FileText, Scissors, Sparkles } from 'lucide-react';

interface TechnicalSheetProps {
    productName: string;
    productImage?: string;
    productId?: string;
    personalization: {
        name?: string;
        theme?: string;
        color?: string;
        finishDetail?: string;
        finishColor?: string;
        size?: string;
        observations?: string;
    };
    orderId?: string;
    customerName?: string;
    customerPhone?: string;
    customerCpf?: string;
    customerEmail?: string;
    orderTotal?: number;
    shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        cep?: string;
    } | null;
    deadline?: string;
    createdAt?: string;
    kitItems?: { qty: number; code: string; size?: string }[];
}

const getItemLabel = (id: string) => TYPES.find(t => t.value === id)?.label || PRODUCT_TAXONOMY[id]?.type || id;
const getColorLabel = (id: string) => COLORS.find(c => c.value === id)?.label || id;

/** Parse features like ['1x FRG', '2x FRP'] into structured items */
function parseFeatures(features: string[]) {
    return features.map(f => {
        const match = f.match(/^(\d+)x\s+(.+)$/);
        if (!match) return { qty: 1, code: f };
        return { qty: parseInt(match[1]), code: match[2].trim() };
    });
}

function extractBabadoColorFromId(id: string): string {
    const parts = id.split('-');
    const babIdx = parts.indexOf('BAB');
    
    if (babIdx >= 0) {
        const babadoColors = [];
        for (let i = babIdx + 1; i < parts.length; i++) {
            const part = parts[i];
            if (part.startsWith('R_') || part === 'R') break;
            const colorCode = part.split('_')[0];
            if (colorCode.match(/^[A-Z]{3}$/)) {
                babadoColors.push(getColorLabel(colorCode));
            }
        }
        if (babadoColors.length > 0) {
            return babadoColors.join(' e ');
        }
    }
    return '—';
}

function extractPassaFitaColor(id: string, product?: any): string {
    if (product?.passaFitaColor) return product.passaFitaColor;
    if (product?.ribbonColor) return product.ribbonColor;
    if (product?.shortCode === 'DPB-0133' || id === 'FEM-KIT-BOR-RSA-BAB-RSA_02') {
        return 'Rosa';
    }

    const parts = id.split('-');
    const ribbonPart = parts.find(p => p.startsWith('R_'));
    if (ribbonPart) {
        const color = RIBBON_COLORS.find(r => ribbonPart.startsWith(r.value));
        return color ? color.label.replace('Padrão (', '').replace(')', '') : 'Branco';
    }
    if (parts.some(p => p === 'R') || parts.includes('BAB')) {
        return 'Branco';
    }
    return '—';
}

function extractThemeFromName(name: string): string {
    const parts = name.split('·');
    if (parts.length > 1) return parts[0].trim();
    return name;
}

function normalizeText(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function findBabadoImage(colorName: string): string | undefined {
    if (!colorName || colorName === '—') return undefined;
    const clean = colorName.trim();
    const cleanNorm = normalizeText(clean);

    // 1. Caso especial Rosé / Rosê: deve sempre pegar o Rosê exato, NUNCA o Rosê Claro
    if (cleanNorm === 'rose') {
        const roseExact = BABADOS.find(b => normalizeText(b.id) === 'rose' || normalizeText(b.label) === 'rose');
        if (roseExact) return roseExact.img;
    }

    // 2. Caso especial Rosê Claro: deve pegar Rosê Claro
    if (cleanNorm.includes('rose') && cleanNorm.includes('claro')) {
        const roseClaro = BABADOS.find(b => normalizeText(b.id).includes('claro') || normalizeText(b.label).includes('claro'));
        if (roseClaro) return roseClaro.img;
    }

    // 3. Match EXATO (com ou sem acentos)
    const exact = BABADOS.find(b => 
        normalizeText(b.id) === cleanNorm || 
        normalizeText(b.label) === cleanNorm
    );
    if (exact) return exact.img;

    // 4. Match parcial ordenado (priorizando menor diferença de tamanho de string)
    const sorted = [...BABADOS].sort((a, b) => a.label.length - b.label.length);
    const partial = sorted.find(b => {
        const bNorm = normalizeText(b.label);
        return bNorm.includes(cleanNorm) || cleanNorm.includes(bNorm);
    });
    return partial?.img;
}

function findPassafitaImage(colorName: string): string | undefined {
    if (!colorName || colorName === '—') return undefined;
    const cleanNorm = normalizeText(colorName.trim());
    const found = PASSA_FITAS.find(p => 
        normalizeText(p.id) === cleanNorm || 
        normalizeText(p.label) === cleanNorm ||
        cleanNorm.includes(normalizeText(p.label)) ||
        normalizeText(p.label).includes(cleanNorm)
    );
    return found?.img;
}

function resolveItemCode(productId?: string, productName?: string): string {
    const id = (productId || '').toUpperCase();
    const nm = normalizeText(productName || '');

    if (id.includes('FRG') || nm.includes('fralda grande')) return 'FRG';
    if (id.includes('FRP') || nm.includes('fralda pequena')) return 'FRP';
    if (id.includes('FRM') || nm.includes('fralda media')) return 'FRM';
    if (id.includes('MNT') || nm.includes('manta')) return 'MNT';
    if (id.includes('TOB') || nm.includes('toalha de banho')) return 'TOB';
    if (id.includes('TOF') || nm.includes('toalha fralda')) return 'TOF';
    if (id.includes('BDL') || nm.includes('body manga longa')) return 'BDL';
    if (id.includes('BDC') || nm.includes('body')) return 'BDC';
    if (id.includes('MIJ') || nm.includes('mijao')) return 'MIJ';
    if (id.includes('SHO') || nm.includes('short')) return 'SHO';
    if (id.includes('TOU') || nm.includes('touca')) return 'TOU';
    if (id.includes('FAI') || nm.includes('faixa')) return 'FAI';

    return 'FRP';
}

export function ProductTechnicalSheet({
    productName,
    productImage,
    productId,
    personalization,
    orderId,
    customerName,
    customerPhone,
    customerCpf,
    customerEmail,
    orderTotal,
    shippingAddress,
    deadline,
    createdAt,
    kitItems
}: TechnicalSheetProps) {
    // Lookup product in database
    const product = productId ? productControl.find(p => p.id === productId || p.technicalName === productId) : null;
    const features = product?.features || [];
    
    // Items to produce
    let items: { qty: number; code: string; size?: string }[] = [];
    if (kitItems && kitItems.length > 0) {
        items = kitItems;
    } else if (product && features.length > 0) {
        items = parseFeatures(features);
    } else {
        // Para itens customizados ou avulsos (ex: Monte seu kit com 1 peça)
        const deducedCode = resolveItemCode(productId, productName);
        items = [{ qty: 1, code: deducedCode, size: personalization?.size }];
    }
    
    // Resolve final product image
    const resolvedImage = productImage || product?.images?.[0] || '';

    // Technical Code / Ref
    const technicalRef = product?.shortCode || product?.technicalName || productId || 'PERSONALIZADO';
    const totalPieces = items.reduce((sum, i) => sum + i.qty, 0);

    // Theme & Name
    const theme = personalization?.theme || extractThemeFromName(productName);
    const babyName = personalization?.name ? personalization.name.trim() : '';

    // Finishes (Acabamentos)
    const babadoColor = product 
        ? extractBabadoColorFromId(product.id) 
        : (personalization?.color || 'Branco');
    
    let passaFitaLabel = product 
        ? extractPassaFitaColor(product.id, product) 
        : (personalization?.finishDetail || 'Branco');

    let displayObs = personalization?.observations || '';
    if (displayObs.startsWith('[Passa-fita:')) {
        const match = displayObs.match(/\[Passa-fita: ([^\]]+)\]/);
        if (match) {
            passaFitaLabel = match[1];
            displayObs = displayObs.replace(`[Passa-fita: ${passaFitaLabel}]`, '').trim();
        }
    }

    const babadoImg = findBabadoImage(babadoColor);
    const passafitaImg = findPassafitaImage(passaFitaLabel);

    // Format Phone for WhatsApp
    const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, '') : '';
    const formattedPhone = cleanPhone.length >= 10 
        ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`)
        : '';
    const waUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : null;

    // Address formatting
    const street = shippingAddress?.street || shippingAddress?.line1 || '';
    const number = shippingAddress?.number || '';
    const complement = shippingAddress?.complement || '';
    const neighborhood = shippingAddress?.neighborhood || shippingAddress?.line2 || '';
    const city = shippingAddress?.city || '';
    const state = shippingAddress?.state || '';
    const cep = shippingAddress?.postal_code || shippingAddress?.cep || '';
    const hasAddress = Boolean(street || city || cep);

    // Total formatting
    const formattedTotal = orderTotal !== undefined && orderTotal !== null
        ? (orderTotal > 1000 ? orderTotal / 100 : orderTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : null;

    // Urgent deadline check
    const isUrgent = () => {
        if (!deadline) return false;
        const today = new Date();
        const maxDate = new Date(deadline);
        const diffDays = Math.ceil((maxDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 3;
    };

    return (
        <div className="max-w-5xl mx-auto bg-white border-2 border-slate-800 rounded-2xl shadow-md overflow-hidden text-slate-900 font-sans print:border-none print:shadow-none print:max-w-none print:m-0">
            
            {/* ═══ CABEÇALHO DA FICHA ═══ */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 print:p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-purple-600 print:bg-slate-900 print:text-white">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs print:text-[9px] font-black tracking-widest uppercase bg-purple-600 text-white px-2 py-0.5 rounded">
                            DANIS PARA BEBÊ
                        </span>
                        <span className="text-xs print:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Ficha de Produção & Controle Local
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl print:text-lg font-black tracking-tight mt-0.5 text-white">
                        {product ? product.name : productName}
                    </h1>
                    <p className="text-xs print:text-[10px] text-slate-300 font-mono mt-0.5">
                        Ref. Técnica: <strong className="text-amber-400">{technicalRef}</strong>
                    </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                    {orderId && (
                        <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 text-right">
                            <p className="text-[9px] print:text-[8px] font-bold text-slate-400 uppercase tracking-wider">Número do Pedido</p>
                            <p className="text-sm print:text-xs font-black text-white font-mono">#{orderId.replace('ORDER_', '')}</p>
                        </div>
                    )}
                    {deadline && (
                        <div className={`px-2.5 py-0.5 rounded-md text-[11px] print:text-[9px] font-black uppercase flex items-center gap-1.5 ${
                            isUrgent() ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                            <Clock className="w-3 print:w-2.5 h-3 print:h-2.5" />
                            Prazo Máx: {new Date(deadline).toLocaleDateString('pt-BR')}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ CORPO PRINCIPAL EM 2 COLUNAS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-5 print:gap-3 p-5 print:p-2.5">
                
                {/* ── COLUNA ESQUERDA: FOTO, BORDADO E ACABAMENTOS (7 colunas) ── */}
                <div className="lg:col-span-7 print:col-span-7 space-y-4 print:space-y-2">

                    {/* BLOCO 1: NOME A BORDAR (DESTAQUE MÁXIMO) */}
                    <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-3 print:p-2 text-center relative overflow-hidden shadow-xs">
                        <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-md tracking-wider">
                            Bordado Oficial
                        </div>
                        <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-0.5">
                            Nome da Criança a Bordar
                        </p>
                        <p className="text-3xl lg:text-4xl print:text-2xl font-black text-slate-900 tracking-tight font-serif py-0.5">
                            {babyName || 'SEM NOME'}
                        </p>
                    </div>

                    {/* BLOCO 2: FOTO DO PEDIDO & REFERÊNCIA VISUAL */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 print:p-2 space-y-2 print:space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs print:text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                Referência Visual do Modelo
                            </span>
                            <span className="text-[11px] print:text-[9px] font-bold text-slate-500">
                                Tema: <strong className="text-slate-800">{theme || 'Padrão'}</strong>
                            </span>
                        </div>

                        <div className="relative w-full aspect-[4/3] print:aspect-auto print:h-[155px] rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center shadow-inner">
                            {resolvedImage ? (
                                <Image 
                                    src={resolvedImage} 
                                    alt={productName} 
                                    fill 
                                    className="object-contain p-1.5"
                                    unoptimized
                                />
                            ) : (
                                <div className="text-center p-4 text-slate-400">
                                    <FileText className="w-8 h-8 mx-auto mb-1 opacity-30" />
                                    <p className="text-xs font-bold uppercase tracking-wider">Foto de referência não anexada</p>
                                    <p className="text-[10px] mt-0.5">Conferir modelo pelo código de catálogo {technicalRef}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BLOCO 3: GUIA COMPLETO DE ACABAMENTOS */}
                    <div className="bg-white border-2 border-slate-300 rounded-xl p-3 print:p-2 space-y-3 print:space-y-1.5">
                        <div className="border-b border-slate-200 pb-1.5 print:pb-1 flex justify-between items-center">
                            <h3 className="text-xs print:text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-purple-600" />
                                Guia de Acabamentos & Aviamentos
                            </h3>
                            <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">
                                Costura & Montagem
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 print:gap-2">
                            
                            {/* Babado */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 print:p-1.5 flex gap-2.5 items-center">
                                <div className="relative w-14 h-14 print:w-10 print:h-10 rounded-md overflow-hidden border border-slate-300 bg-white shrink-0">
                                    {babadoImg ? (
                                        <Image src={babadoImg} alt={babadoColor} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase text-center p-0.5">
                                            Sem Amostra
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] print:text-[8px] font-black text-slate-400 uppercase tracking-wider">Babado (Bordado Inglês)</p>
                                    <p className="text-xs print:text-[11px] font-black text-slate-800 truncate">{babadoColor}</p>
                                    <p className="text-[9px] print:text-[8px] text-slate-500">100% Algodão Premium</p>
                                </div>
                            </div>

                            {/* Passa-fita */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 print:p-1.5 flex gap-2.5 items-center">
                                <div className="relative w-14 h-14 print:w-10 print:h-10 rounded-md overflow-hidden border border-slate-300 bg-white shrink-0">
                                    {passafitaImg ? (
                                        <Image src={passafitaImg} alt={passaFitaLabel} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase text-center p-0.5">
                                            Sem Amostra
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] print:text-[8px] font-black text-slate-400 uppercase tracking-wider">Passa-Fita / Fita Cetim</p>
                                    <p className="text-xs print:text-[11px] font-black text-slate-800 truncate">{passaFitaLabel}</p>
                                    <p className="text-[9px] print:text-[8px] text-slate-500">Fita de Cetim Embutida</p>
                                </div>
                            </div>

                        </div>

                        {/* Detalhes de Tecido Base e Linha */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 print:gap-1 bg-slate-100/70 p-2 print:p-1.5 rounded-lg text-xs print:text-[9px]">
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tecido Base</p>
                                <p className="font-bold text-slate-800">100% Algodão Branco</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tema do Bordado</p>
                                <p className="font-bold text-slate-800">{theme || 'Padrão'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Padrão da Vira</p>
                                <p className="font-bold text-slate-800">Bordado + Babado</p>
                            </div>
                            {personalization?.size && (
                                <div className="col-span-2 sm:col-span-3 bg-rose-50 border border-rose-200 p-1.5 rounded flex items-center justify-between">
                                    <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">Tamanho Roupinha / Body</span>
                                    <span className="text-[10px] font-black text-rose-900 bg-white px-1.5 py-0.5 rounded border border-rose-300">
                                        TAMANHO {personalization.size}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Observações do Cliente */}
                        {displayObs && (
                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 print:p-1.5 flex gap-2 items-start">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-amber-900 uppercase tracking-wider">
                                        Observação Especial do Cliente
                                    </p>
                                    <p className="text-xs print:text-[9px] font-bold text-amber-950 whitespace-pre-wrap">
                                        {displayObs}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* ── COLUNA DIREITA: PEÇAS, MEDIDAS, CHECKLIST E EXPEDIÇÃO (5 colunas) ── */}
                <div className="lg:col-span-5 print:col-span-5 space-y-4 print:space-y-2">

                    {/* BLOCO 4: PEÇAS A CONFECCIONAR COM MEDIDAS DE CORTE EXATAS */}
                    <div className="bg-white border-2 border-slate-300 rounded-xl p-3 print:p-2 space-y-2 print:space-y-1">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 print:pb-1">
                            <div>
                                <h3 className="text-xs print:text-[10px] font-black text-slate-900 uppercase tracking-wider">
                                    Peças do Enxoval & Corte
                                </h3>
                                <p className="text-[9px] text-slate-500 font-medium">Tabela oficial de medidas Danis</p>
                            </div>
                            <span className="text-[10px] print:text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase">
                                {totalPieces} {totalPieces === 1 ? 'Peça' : 'Peças'}
                            </span>
                        </div>

                        <div className="space-y-1.5 print:space-y-1">
                            {items.map((item, idx) => {
                                const tax = PRODUCT_TAXONOMY[item.code];
                                const label = tax?.type || getItemLabel(item.code);
                                const dimensions = tax?.dimensions || 'Conforme padrão';
                                const material = tax?.material || '100% Algodão';
                                const pieceSize = item.size || (['BDC', 'BDL', 'MIJ', 'SHO'].includes(item.code) ? personalization?.size : undefined);

                                return (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2 print:p-1 flex items-start gap-2">
                                        <span className="bg-slate-900 text-white text-[10px] print:text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                            {item.qty}x
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="text-[11px] print:text-[10px] font-black text-slate-900 uppercase leading-snug">
                                                    {label}
                                                </p>
                                                {pieceSize && (
                                                    <span className="font-black text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-300 text-[9px] uppercase tracking-wide">
                                                        👕 {pieceSize}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-2 gap-y-0 mt-0.5 text-[10px] print:text-[8px]">
                                                <span className="font-bold text-purple-700 bg-purple-50 px-1 py-0 rounded border border-purple-200">
                                                    📐 {dimensions}
                                                </span>
                                                <span className="text-slate-500">
                                                    🧵 {material}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* BLOCO 5: ROTEIRO DE PRODUÇÃO / CHECKLIST DE OFICINA */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 print:p-2 space-y-2 print:space-y-1">
                        <div className="border-b border-slate-200 pb-1 flex justify-between items-center">
                            <h3 className="text-xs print:text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                Checklist de Oficina
                            </h3>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Controle Físico</span>
                        </div>

                        <div className="space-y-1 print:space-y-0.5 text-xs">
                            {[
                                { step: '1. Separação de tecidos e corte nas medidas', icon: '✂️' },
                                { step: `2. Programação do bordado (${babyName || 'Sem nome'})`, icon: '🧵' },
                                { step: `3. Aplicação babado (${babadoColor}) e passa-fita (${passaFitaLabel})`, icon: '🎀' },
                                { step: '4. Costura, embainhamento e limpeza de pontas', icon: '🪡' },
                                { step: '5. Passadoria a vapor e conferência de medidas', icon: '💨' },
                                { step: '6. Dobra técnica, cheirinho e embalagem final', icon: '📦' },
                            ].map((task, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white p-1.5 print:p-1 rounded-md border border-slate-200/80">
                                    <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded shrink-0 print:border-slate-800" />
                                    <span className="text-xs shrink-0">{task.icon}</span>
                                    <span className="font-semibold text-slate-800 text-[10px] print:text-[8px] leading-tight flex-1">
                                        {task.step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOCO 6: EXPEDIÇÃO & DESTINATÁRIO */}
                    <div className="bg-white border-2 border-slate-300 rounded-xl p-3 print:p-2 space-y-2 print:space-y-1">
                        <div className="border-b border-slate-200 pb-1 flex justify-between items-center">
                            <h3 className="text-xs print:text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                                Dados de Envio & Destinatário
                            </h3>
                            {formattedTotal && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    {formattedTotal}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5 print:space-y-1 text-xs">
                            <div>
                                <p className="text-[9px] print:text-[8px] font-black text-slate-400 uppercase tracking-wider">Cliente Destinatário</p>
                                <p className="font-bold text-slate-900 text-xs print:text-[10px]">{customerName || 'Cliente não identificado'}</p>
                            </div>

                            {/* Telefone / WhatsApp */}
                            {customerPhone && (
                                <div className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="font-bold text-slate-800 text-[11px] print:text-[9px]">{customerPhone}</span>
                                </div>
                            )}

                            {/* Endereço */}
                            {hasAddress ? (
                                <div className="bg-slate-50 p-2 print:p-1.5 rounded-md border border-slate-200 space-y-0.5 text-[10px] print:text-[8px]">
                                    <p className="font-bold text-slate-800">
                                        {street}{number ? `, nº ${number}` : ''} {complement ? `(${complement})` : ''}
                                    </p>
                                    {neighborhood && (
                                        <p className="text-slate-600 font-medium">Bairro: {neighborhood}</p>
                                    )}
                                    <p className="font-bold text-slate-800 uppercase mt-0.5">
                                        {city} - {state} <span className="font-mono text-slate-500 font-normal ml-1">CEP: {cep}</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">Endereço não disponível.</p>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* ═══ RODAPÉ DA FICHA ═══ */}
            <div className="bg-slate-100 border-t border-slate-200 px-5 print:px-3 py-2 print:py-1 flex flex-col sm:flex-row justify-between items-center text-[10px] print:text-[8px] text-slate-500 font-medium gap-1">
                <span>
                    Documento de Controle Interno — Danis Para Bebê Confecções Artesanais
                </span>
                <span>
                    {createdAt ? `Emissão: ${new Date(createdAt).toLocaleString('pt-BR')}` : `Data: ${new Date().toLocaleDateString('pt-BR')}`}
                </span>
            </div>

        </div>
    );
}
