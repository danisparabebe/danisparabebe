import React from 'react';
import Image from 'next/image';
import { productControl } from '@/data/product-control';
import { PRODUCT_TAXONOMY } from '@/data/product-taxonomy';
import { TYPES, COLORS, RIBBON_COLORS, BABADOS, PASSA_FITAS } from '@/data/admin-options';

interface TechnicalSheetProps {
    productName: string;
    productImage: string;
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
    orderTotal?: number;
    shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
    } | null;
    deadline?: string;
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

/** Extract finish info from the structured description */
function extractFinishFromDescription(description: string): string | null {
    const finishMatch = description.match(/§FINISH§\s*\n([\s\S]*?)(?=\n§|$)/);
    if (finishMatch) {
        return finishMatch[1].replace(/🎀\s*/g, '').replace(/Acabamentos especiais:\s*/i, '').trim();
    }
    return null;
}

function extractBabadoColorFromId(id: string): string {
    // The babado color is the segment(s) right after BAB
    const parts = id.split('-');
    const babIdx = parts.indexOf('BAB');
    
    if (babIdx >= 0) {
        const babadoColors = [];
        
        // Read all parts after BAB until we hit a passa-fita ('R_') or the end
        for (let i = babIdx + 1; i < parts.length; i++) {
            const part = parts[i];
            
            // Break if we reach ribbon code or standalone 'R'
            if (part.startsWith('R_') || part === 'R') break;
            
            // Strip any trailing _01 sequence
            const colorCode = part.split('_')[0];
            
            // Validate: it must be a 3-letter code like LIL, VDM or COL (Colorido)
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

/** Extract passa-fita color from product ID (based on catalog config) */
function extractPassaFitaColor(id: string): string {
    const parts = id.split('-');
    
    // Look for R_BCO, R_RSA, R_ABB
    const ribbonPart = parts.find(p => p.startsWith('R_'));
    if (ribbonPart) {
        // Fix for suffixes like R_RSA_01 -> match by start
        const color = RIBBON_COLORS.find(r => ribbonPart.startsWith(r.value));
        // Clean up "Branco" safely from "Padrão (Branco)" or "Branco"
        return color ? color.label.replace('Padrão (', '').replace(')', '') : 'Branco';
    }
    
    // Legacy mapping: standalone 'R' meant Passa-fita existed
    if (parts.some(p => p === 'R')) {
        return 'Branco';
    }
    
    // If it has babado but didn't specify 'R_', it defaults to Padrão (Branco)
    if (parts.includes('BAB')) {
        return 'Branco';
    }

    return '—';
}

/** Extract theme from product name (the part before the · separator) */
function extractThemeFromName(name: string): string {
    const parts = name.split('·');
    if (parts.length > 1) return parts[0].trim();
    return name;
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
    orderTotal,
    shippingAddress,
    deadline,
    kitItems
}: TechnicalSheetProps) {
    // Lookup full product data
    const product = productId ? productControl.find(p => p.id === productId) : null;
    const features = product?.features || [];
    
    // If we have a product with features, show its breakdown components.
    // Otherwise (e.g. personalize configurator), use the passed kitItems.
    const items = (product && features.length > 0)
        ? parseFeatures(features)
        : (kitItems && kitItems.length > 0 ? kitItems : parseFeatures(features));
    
    // Extract a custom ref if no product was found but we have an image URL
    let customRef = productId || '—';
    if (!product && productImage) {
        try {
            const urlObj = new URL(productImage, 'http://localhost');
            const fileParam = urlObj.searchParams.get('file') || productImage.split('/').pop() || '';
            const cleanName = decodeURIComponent(fileParam).replace(/_01\.(jpeg|jpg|png|webp)$/i, '').replace(/\.(jpeg|jpg|png|webp|JPG|PNG)$/i, '').trim().toUpperCase();
            
            // If we have passafita info, try appending it to replicate Step 5 behavior
            const pCode = RIBBON_COLORS.find(r => r.label === personalization?.finishDetail)?.value;
            if (pCode && !cleanName.includes(`-${pCode}`)) {
                 customRef = `${cleanName}-${pCode}`;
            } else {
                 customRef = cleanName;
            }
        } catch(e) { /* ignore and use fallback */ }
    }

    const technicalRefBase = product?.shortCode || product?.technicalName || customRef;
    const totalPieces = items.reduce((sum, i) => sum + i.qty, 0);

    // Mapear combos de itens para nomes de Kits automáticos
    let technicalRef = technicalRefBase;
    if (items.length > 0) {
        const sigMap: Record<string, number> = {};
        items.forEach(i => { sigMap[i.code] = (sigMap[i.code] || 0) + i.qty; });
        const sigKeys = Object.keys(sigMap).sort();
        const sigObj: Record<string, number> = {};
        sigKeys.forEach(k => sigObj[k] = sigMap[k]);
        const sigString = JSON.stringify(sigObj);

        let kitPrefix = '';
        if (sigString === JSON.stringify({"FRG": 1, "FRM": 1, "FRP": 1, "TOA": 1})) kitPrefix = "Kit Completo";
        else if (sigString === JSON.stringify({"FRG": 1, "FRP": 1, "MNT": 1})) kitPrefix = "Kit Manta";
        else if (sigString === JSON.stringify({"FRG": 1, "FRP": 1})) kitPrefix = "Kit Fraldas";
        else if (sigString === JSON.stringify({"BDL": 1, "FAI": 1, "FRG": 1, "FRP": 2, "MIJ": 1, "MNT": 1})) kitPrefix = "Kit Luxinho";
        else if (sigString === JSON.stringify({"FRG": 2, "MNT": 1})) kitPrefix = "Kit 3 Peças";
        
        if (kitPrefix && !technicalRef.includes('KIT')) {
            technicalRef = `${kitPrefix} - ${technicalRef}`;
        }
    }

    // Theme — from personalization, or from the product name
    const theme = personalization.theme || extractThemeFromName(productName);

    // Babado — from product ID or personalization
    const babadoColor = product ? extractBabadoColorFromId(product.id) : (personalization.color || '—');

    // Passa-fita — from observations, product ID or personalization
    let passaFitaLabel = product ? extractPassaFitaColor(product.id) : (personalization.finishDetail || '—');
    let displayObs = personalization.observations || '';

    // Clean up observation in case the passafita is embedded inside
    if (displayObs.startsWith('[Passa-fita:')) {
        const match = displayObs.match(/\[Passa-fita: ([^\]]+)\]/);
        if (match) {
            passaFitaLabel = match[1];
            displayObs = displayObs.replace(`[Passa-fita: ${passaFitaLabel}]`, '').trim();
        }
    }

    const babadoImg = BABADOS.find(b => b.id === babadoColor || b.label === babadoColor)?.img;
    const passafitaImg = PASSA_FITAS.find(p => p.id === passaFitaLabel || p.label === passaFitaLabel)?.img;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">

                {/* ═══ LEFT COLUMN: PRODUCTION FICHA ═══ */}
                <div className="w-full md:w-[420px] shrink-0 bg-white border-2 border-[#1f2937] rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)] p-4 flex flex-col justify-between">
                    <div>
                        <h2 className="text-[17px] font-heading font-black text-[#1f2937] tracking-tight py-1 bg-dusty-rose/20 text-center rounded mb-1 uppercase leading-none">
                            Ficha de Produção<br/>
                            <span className="text-sm text-dusty-rose">{product ? product.name : 'Kit Personalizado'}</span>
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3 relative mt-3">

                        {product ? (
                            /* ── PRE-CONFIGURED KIT: single large product photo ── */
                            <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center p-2">
                                {productImage ? (
                                    <Image src={productImage} alt={productName} fill className="object-contain p-2" unoptimized />
                                ) : (
                                    <span className="text-slate/50 font-bold uppercase text-[10px]">Sem foto</span>
                                )}
                                <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded shadow-sm border border-black/5 text-[9px] font-black uppercase tracking-widest text-[#1f2937]">
                                    Foto do Kit
                                </div>
                            </div>
                        ) : (
                            /* ── CUSTOM KIT: embroidery photo + babado/passa-fita sidebar ── */
                            <>
                                <div className="flex gap-2">
                                    {/* Embroidery Photo (Large) */}
                                    <div className="relative flex-1 aspect-square sm:aspect-[4/3] rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center p-2">
                                        {productImage ? (
                                            <Image src={productImage} alt={productName} fill className="object-contain p-2" unoptimized />
                                        ) : (
                                            <span className="text-slate/50 font-bold uppercase text-[10px]">Sem bordado</span>
                                        )}
                                        <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded shadow-sm border border-black/5 text-[9px] font-black uppercase tracking-widest text-[#1f2937]">
                                            Foto do Bordado
                                        </div>
                                    </div>

                                    {/* Babado & Passa-Fita sidebar */}
                                    <div className="w-[95px] flex flex-col gap-2 shrink-0">
                                        <div className="flex flex-col flex-1 gap-0.5">
                                            <p className="text-[8px] font-black text-[#1f2937] uppercase tracking-wider text-center leading-none">Babado<br/><span className="text-dusty-rose">{babadoColor}</span></p>
                                            <div className="relative w-full flex-1 rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center">
                                                {babadoImg ? (
                                                    <Image src={babadoImg} alt="Babado" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <span className="text-slate/40 text-[8px] font-bold uppercase">S/ Foto</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1 gap-0.5">
                                            <p className="text-[8px] font-black text-[#1f2937] uppercase tracking-wider text-center leading-none">Passa-Fita<br/><span className="text-dusty-rose">{passaFitaLabel}</span></p>
                                            <div className="relative w-full flex-1 rounded-lg overflow-hidden border border-black/10 bg-[#faf9f7] flex items-center justify-center">
                                                {passafitaImg ? (
                                                    <Image src={passafitaImg} alt="Passa-Fita" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <span className="text-slate/40 text-[8px] font-bold uppercase">S/ Foto</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Nome a bordar + Tema — shared by both types */}
                        <div className="bg-white p-3 rounded-lg border-[3px] border-[#1f2937] relative overflow-hidden text-center">
                            <p className="text-[8px] font-bold text-[#1f2937] uppercase tracking-[0.25em] leading-none mb-1.5">Nome a Bordar</p>
                            <p className={`text-3xl font-black ${personalization.name ? 'text-[#1f2937]' : 'text-slate'} font-heading leading-none truncate tracking-tight`}>
                                {personalization.name || 'SEM NOME'}
                            </p>
                            {personalization.name && (
                                <div className="absolute top-0 right-0 bg-[#1f2937] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-bl-lg tracking-widest shadow-sm">
                                    Confirmado
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                            <div>
                                <p className="text-[9px] font-bold text-slate uppercase tracking-widest leading-none mb-1.5 opacity-80">Tema</p>
                                <p className="text-base font-bold text-[#1f2937] leading-none mt-1">{theme || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate uppercase tracking-widest leading-none mb-1.5 opacity-80">{product ? 'Cores' : 'Babado / Fita'}</p>
                                <p className="text-[11px] font-bold text-[#1f2937] leading-tight mt-1">
                                    {(() => {
                                        const babadoName = BABADOS.find(b => b.id === babadoColor || b.label === babadoColor)?.label || babadoColor;
                                        const fitaName = PASSA_FITAS.find(p => p.id === passaFitaLabel || p.label === passaFitaLabel)?.label || passaFitaLabel;
                                        return `${babadoName} / ${fitaName}`;
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 text-center bg-[#1f2937] py-2 rounded">
                        <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Ref. Produção Final</p>
                        <p className="font-black text-white text-[15px] break-all px-2">{technicalRef}</p>
                    </div>
                </div>

                {/* ═══ RIGHT COLUMN: EXPEDIÇÃO & PEDIDO ═══ */}
                <div className="flex-1 bg-white border-2 border-[#1f2937] rounded-xl shadow-[4px_4px_0px_rgba(31,41,55,1)] flex flex-col">

                    {/* Header: Expedição */}
                    <div className="p-4 border-b border-black/10 flex justify-between items-center bg-[#faf9f7] rounded-t-xl gap-4">
                        <h2 className="text-xl font-heading font-black text-[#1f2937] tracking-tight uppercase leading-none">Expedição & Pedido</h2>
                        {orderId && (
                            <span className="bg-[#1f2937] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shrink-0">
                                Pedido #{orderId.slice(-6).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="p-4 space-y-4 flex-1 flex flex-col">

                        {/* Cliente Destaque (Nome + Celular) */}
                        <div className="bg-[#1f2937]/5 p-3 rounded-lg border border-black/10 flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate uppercase tracking-widest">Cliente</p>
                            <p className="text-xl font-black text-[#1f2937] leading-tight">{customerName || 'NÃO INFORMADO'}</p>
                            {customerPhone && (
                                <p className="text-sm font-bold text-[#1f2937] flex items-center gap-1.5 mt-0.5">
                                    <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    {customerPhone}
                                </p>
                            )}
                        </div>

                        {/* Dados de Frete / Endereço (Focus on completeness for label generation) */}
                        <div className="border-l-4 border-[#1f2937] pl-3 py-1">
                            <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-1.5">Ficha de Frete</p>
                            {customerCpf ? (
                                <p className="text-xs font-semibold text-charcoal mb-0.5">
                                    <span className="opacity-60 uppercase font-bold text-[10px] mr-1">CPF:</span> {customerCpf}
                                </p>
                            ) : (
                                <div className="bg-amber-50 border border-amber-300 rounded-md px-2 py-1.5 mb-1.5 flex items-center gap-1.5">
                                    <span className="text-amber-700 text-[10px] font-black uppercase tracking-wider">CPF Pendente</span>
                                    <span className="text-amber-600 text-[9px]">— Solicitar ao cliente via WhatsApp</span>
                                </div>
                            )}
                            {shippingAddress && (
                                <>
                                    <p className="text-xs font-semibold text-charcoal mb-0.5">
                                        <span className="opacity-60 uppercase font-bold text-[10px] mr-1">Rua:</span> {shippingAddress.line1}
                                    </p>
                                    {shippingAddress.line2 && (
                                        <p className="text-xs font-semibold text-charcoal mb-0.5">
                                            <span className="opacity-60 uppercase font-bold text-[10px] mr-1">Compl/Bairro:</span> {shippingAddress.line2}
                                        </p>
                                    )}
                                    <p className="text-xs font-bold text-[#1f2937] uppercase mt-1">
                                        {shippingAddress.city} - {shippingAddress.state} <span className="text-slate font-medium ml-1">/ CEP: {shippingAddress.postal_code}</span>
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Deadline Box (Highly Emphasized) */}
                        {deadline && (
                            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none mb-1">
                                    MÁXIMO LIMITE PARA ENVIO
                                </p>
                                <p className="text-2xl font-black text-red-600 leading-none">
                                    {new Date(deadline).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        )}

                        {/* Items Table */}
                        {items.length > 0 && (
                            <div className="pt-3 border-t border-black/5 flex-1">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Itens a Separar</p>
                                    <span className="text-[10px] font-black text-[#1f2937] px-2 py-0.5 bg-black/5 rounded uppercase">{totalPieces} Peças</span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex items-center py-1.5 border-b border-black/5">
                                            <span className="bg-[#1f2937] text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded mr-2 shrink-0">{item.qty}x</span>
                                            <span className="font-bold text-[#1f2937] uppercase text-[10px] sm:text-[11px] leading-tight flex-1">
                                                {getItemLabel(item.code)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Total Paid */}
                        {orderTotal !== undefined && (
                            <div className="mt-auto pt-3 border-t-2 border-dashed border-black/20 flex justify-between items-center bg-emerald-50 p-3 rounded shadow-inner">
                                <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Total Geral Pago</p>
                                <p className="text-xl font-black text-emerald-600">
                                    {(orderTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        )}

                        {/* Client Observations (Warning) */}
                        {displayObs && (
                            <div className="bg-amber-50 border border-amber-300 p-2.5 rounded flex gap-2.5 items-center mt-2">
                                <p className="text-amber-800 text-lg leading-none">⚠</p>
                                <div>
                                    <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest leading-none mb-0.5">Nota de Produção Adicional</p>
                                    <p className="text-xs font-bold text-amber-950 uppercase leading-none">{displayObs}</p>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>

            </div>
        </div>
    );
}
