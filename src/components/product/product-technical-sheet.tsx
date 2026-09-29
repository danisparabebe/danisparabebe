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
    kitItems?: { qty: number; code: string }[];
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

function extractPassaFitaColor(id: string): string {
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
    let items: { qty: number; code: string }[] = [];
    if (kitItems && kitItems.length > 0) {
        items = kitItems;
    } else if (product && features.length > 0) {
        items = parseFeatures(features);
    } else {
        // Para itens customizados ou avulsos (ex: Monte seu kit com 1 peça)
        const deducedCode = resolveItemCode(productId, productName);
        items = [{ qty: 1, code: deducedCode }];
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
        ? extractPassaFitaColor(product.id) 
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
            <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-purple-600 print:bg-slate-900 print:text-white">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-widest uppercase bg-purple-600 text-white px-2 py-0.5 rounded">
                            DANIS PARA BEBÊ
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Ficha de Produção & Controle Local
                        </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight mt-1 text-white">
                        {product ? product.name : productName}
                    </h1>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                        Ref. Técnica: <strong className="text-amber-400">{technicalRef}</strong>
                    </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                    {orderId && (
                        <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Número do Pedido</p>
                            <p className="text-base font-black text-white font-mono">#{orderId.replace('ORDER_', '')}</p>
                        </div>
                    )}
                    {deadline && (
                        <div className={`px-3 py-1 rounded-md text-xs font-black uppercase flex items-center gap-1.5 ${
                            isUrgent() ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                            <Clock className="w-3.5 h-3.5" />
                            Prazo Máx: {new Date(deadline).toLocaleDateString('pt-BR')}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ CORPO PRINCIPAL EM 2 COLUNAS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                
                {/* ── COLUNA ESQUERDA: FOTO, BORDADO E ACABAMENTOS (7 colunas) ── */}
                <div className="lg:col-span-7 space-y-6">

                    {/* BLOCO 1: NOME A BORDAR (IMPOSSÍVEL NÃO VER) */}
                    <div className="bg-amber-50 border-3 border-amber-500 rounded-2xl p-4 text-center relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-widest">
                            Bordado Oficial
                        </div>
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.25em] mb-1">
                            Nome da Criança a Bordar
                        </p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight font-serif py-1">
                            {babyName || 'SEM NOME'}
                        </p>
                        {babyName && (
                            <p className="text-xs font-bold text-amber-900/80 uppercase tracking-wider mt-1">
                                (Grafia em caixa mista: <span className="font-normal capitalize">{babyName}</span>)
                            </p>
                        )}
                        <p className="text-[10px] font-bold text-amber-700 mt-2 bg-amber-100/70 py-1 rounded inline-block px-3">
                            ⚠️ ATENÇÃO: Conferir grafia e acentuação antes de programar o bastidor da máquina.
                        </p>
                    </div>

                    {/* BLOCO 2: FOTO DO PEDIDO & REFERÊNCIA VISUAL */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                Referência Visual do Modelo
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                                Tema: <strong className="text-slate-800">{theme || 'Padrão'}</strong>
                            </span>
                        </div>

                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center shadow-inner">
                            {resolvedImage ? (
                                <Image 
                                    src={resolvedImage} 
                                    alt={productName} 
                                    fill 
                                    className="object-contain p-2"
                                    unoptimized
                                />
                            ) : (
                                <div className="text-center p-6 text-slate-400">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-bold uppercase tracking-wider">Foto de referência não anexada</p>
                                    <p className="text-[10px] mt-1">Conferir modelo pelo código de catálogo {technicalRef}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BLOCO 3: GUIA COMPLETO DE ACABAMENTOS (O QUE A COSTUREIRA PRECISA SABER) */}
                    <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 space-y-4">
                        <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Scissors className="w-4 h-4 text-purple-600" />
                                Guia de Acabamentos & Aviamentos
                            </h3>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">
                                Costura & Montagem
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Babado */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 items-center">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0">
                                    {babadoImg ? (
                                        <Image src={babadoImg} alt={babadoColor} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase text-center p-1">
                                            Sem Amostra
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Babado (Bordado Inglês)</p>
                                    <p className="text-sm font-black text-slate-800 truncate">{babadoColor}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">100% Algodão Premium</p>
                                </div>
                            </div>

                            {/* Passa-fita */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 items-center">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0">
                                    {passafitaImg ? (
                                        <Image src={passafitaImg} alt={passaFitaLabel} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase text-center p-1">
                                            Sem Amostra
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Passa-Fita / Fita Cetim</p>
                                    <p className="text-sm font-black text-slate-800 truncate">{passaFitaLabel}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Fita de Cetim Embutida</p>
                                </div>
                            </div>

                        </div>

                        {/* Detalhes de Tecido Base e Linha */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-100/70 p-3 rounded-xl text-xs">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tecido Base</p>
                                <p className="font-bold text-slate-800">100% Algodão Branco</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tema do Bordado</p>
                                <p className="font-bold text-slate-800">{theme || 'Padrão'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Padrão da Vira</p>
                                <p className="font-bold text-slate-800">Bordado + Babado</p>
                            </div>
                        </div>

                        {/* Observações do Cliente */}
                        {displayObs && (
                            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 flex gap-2.5 items-start">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                                        Observação Especial do Cliente
                                    </p>
                                    <p className="text-xs font-bold text-amber-950 mt-0.5 whitespace-pre-wrap">
                                        {displayObs}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* ── COLUNA DIREITA: PEÇAS, MEDIDAS, CHECKLIST E EXPEDIÇÃO (5 colunas) ── */}
                <div className="lg:col-span-5 space-y-6">

                    {/* BLOCO 4: PEÇAS A CONFECCIONAR COM MEDIDAS DE CORTE EXATAS */}
                    <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                    Peças do Enxoval & Corte
                                </h3>
                                <p className="text-[10px] text-slate-500 font-medium">Tabela oficial de medidas Danis</p>
                            </div>
                            <span className="text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase">
                                {totalPieces} {totalPieces === 1 ? 'Peça' : 'Peças'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, idx) => {
                                const tax = PRODUCT_TAXONOMY[item.code];
                                const label = tax?.type || getItemLabel(item.code);
                                const dimensions = tax?.dimensions || 'Conforme padrão';
                                const material = tax?.material || '100% Algodão';

                                return (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
                                        <span className="bg-slate-900 text-white text-xs font-black px-2 py-1 rounded-md shrink-0 mt-0.5">
                                            {item.qty}x
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-900 uppercase leading-snug">
                                                {label}
                                            </p>
                                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px]">
                                                <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                                    📐 Medida: {dimensions}
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
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="border-b border-slate-200 pb-1.5 flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                Checklist de Oficina (Visto Físico)
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Controle Local</span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-700">
                            {[
                                { step: '1. Separação de tecidos e corte nas medidas exatas', icon: '✂️' },
                                { step: `2. Programação do bordado (${babyName || 'Sem nome'}) e tema`, icon: '🧵' },
                                { step: `3. Aplicação do babado (${babadoColor}) e passa-fita (${passaFitaLabel})`, icon: '🎀' },
                                { step: '4. Costura, embainhamento e limpeza de pontas de linha', icon: '🪡' },
                                { step: '5. Passadoria a vapor e conferência rigorosa de medidas', icon: '💨' },
                                { step: '6. Dobra técnica, cheirinho de bebê e embalagem final', icon: '📦' },
                            ].map((task, i) => (
                                <div key={i} className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-slate-200/80">
                                    <div className="w-4 h-4 border-2 border-slate-400 rounded shrink-0 print:border-slate-800" />
                                    <span className="text-sm shrink-0">{task.icon}</span>
                                    <span className="font-semibold text-slate-800 text-[11px] leading-tight flex-1">
                                        {task.step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOCO 6: EXPEDIÇÃO & DESTINATÁRIO */}
                    <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 space-y-3">
                        <div className="border-b border-slate-200 pb-1.5 flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-700" />
                                Dados de Envio & Destinatário
                            </h3>
                            {formattedTotal && (
                                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {formattedTotal}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 text-xs">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cliente Destinatário</p>
                                <p className="font-bold text-slate-900 text-sm">{customerName || 'Cliente não identificado'}</p>
                            </div>

                            {/* Telefone / WhatsApp */}
                            {customerPhone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {waUrl ? (
                                        <a 
                                            href={waUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                        >
                                            {customerPhone}
                                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded uppercase font-black">WhatsApp</span>
                                        </a>
                                    ) : (
                                        <span className="font-bold text-slate-800">{customerPhone}</span>
                                    )}
                                </div>
                            )}

                            {/* CPF */}
                            {customerCpf && (
                                <p className="text-[11px] font-semibold text-slate-600">
                                    <span className="font-bold uppercase text-[10px] text-slate-400 mr-1">CPF (Envio):</span>
                                    {customerCpf}
                                </p>
                            )}

                            {/* Endereço */}
                            {hasAddress ? (
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5 text-[11px]">
                                    <p className="font-bold text-slate-800">
                                        {street}{number ? `, nº ${number}` : ''} {complement ? `(${complement})` : ''}
                                    </p>
                                    {neighborhood && (
                                        <p className="text-slate-600 font-medium">Bairro: {neighborhood}</p>
                                    )}
                                    <p className="font-bold text-slate-800 uppercase mt-1">
                                        {city} - {state} <span className="font-mono text-slate-500 font-normal ml-1">CEP: {cep}</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-400 italic">Endereço de entrega não disponível no registro.</p>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* ═══ RODAPÉ DA FICHA ═══ */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-medium gap-2">
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
