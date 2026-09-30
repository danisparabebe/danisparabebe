'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    CheckCircle2, 
    Clock, 
    Package, 
    MapPin, 
    Sparkles, 
    Heart, 
    MessageCircle, 
    Printer, 
    ArrowLeft, 
    ShieldCheck, 
    Scissors,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { BABADOS, PASSA_FITAS, TYPES } from '@/data/admin-options';
import { PRODUCT_TAXONOMY } from '@/data/product-taxonomy';

interface ClientOrderSheetProps {
    order: {
        id: string;
        customerName: string;
        customerPhone?: string;
        status?: string;
        createdAt?: string;
        deadlineDate?: string;
        totalAmount?: number;
        shippingAmount?: number;
        address?: {
            street?: string;
            number?: string;
            complement?: string;
            neighborhood?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            cep?: string;
            line1?: string;
            line2?: string;
        } | null;
        items: Array<{
            id: string;
            productId?: string;
            name: string;
            price?: number;
            quantity: number;
            image?: string;
            personalization?: {
                name?: string;
                theme?: string;
                color?: string;
                finishDetail?: string;
                finishColor?: string;
                size?: string;
                observations?: string;
            };
        }>;
    };
}

function findBabadoImage(colorName?: string): string | undefined {
    if (!colorName || colorName === '—') return undefined;
    const clean = colorName.trim().toLowerCase();
    const found = BABADOS.find(b => 
        b.id.toLowerCase() === clean || 
        b.label.toLowerCase() === clean ||
        clean.includes(b.label.toLowerCase()) ||
        b.label.toLowerCase().includes(clean)
    );
    return found?.img;
}

function findPassafitaImage(colorName?: string): string | undefined {
    if (!colorName || colorName === '—') return undefined;
    const clean = colorName.trim().toLowerCase();
    const found = PASSA_FITAS.find(p => 
        p.id.toLowerCase() === clean || 
        p.label.toLowerCase() === clean ||
        clean.includes(p.label.toLowerCase()) ||
        p.label.toLowerCase().includes(clean)
    );
    return found?.img;
}

const getItemLabel = (id: string) => TYPES.find(t => t.value === id)?.label || PRODUCT_TAXONOMY[id]?.type || id;

export function ClientOrderSheet({ order }: ClientOrderSheetProps) {
    const { id, customerName, customerPhone, items = [], address, deadlineDate, totalAmount, status } = order;

    // Get the baby's name from the first item with personalization
    const personalizedItem = items.find(it => it.personalization?.name);
    const babyName = personalizedItem?.personalization?.name || '';
    const mainTheme = personalizedItem?.personalization?.theme || '';

    // Deadline formatted
    const deadlineFormatted = deadlineDate 
        ? new Date(deadlineDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    // Safe address values
    const street = address?.street || address?.line1 || '';
    const number = address?.number || '';
    const complement = address?.complement || '';
    const neighborhood = address?.neighborhood || address?.line2 || '';
    const city = address?.city || '';
    const state = address?.state || '';
    const cep = address?.postal_code || address?.cep || '';
    const hasAddress = Boolean(street || city || cep);

    // Total
    const formattedTotal = totalAmount !== undefined && totalAmount !== null
        ? (totalAmount > 1000 ? totalAmount / 100 : totalAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : null;

    // WhatsApp URL
    const cleanOrderId = id.replace('ORDER_', '');
    const waText = babyName
        ? `Olá, Danis! Gostaria de falar sobre o pedido #${cleanOrderId} do enxoval de ${babyName}.`
        : `Olá, Danis! Gostaria de falar sobre o pedido #${cleanOrderId}.`;
    const waUrl = `https://wa.me/5518997518078?text=${encodeURIComponent(waText)}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-slate-800 font-sans print:max-w-none print:m-0">
            
            {/* ═══ CABEÇALHO HERO COM IDENTIDADE DANIS ═══ */}
            <div className="bg-gradient-to-br from-[#ffffff] via-[#fffcfb] to-[#fbf2f2] border-2 border-dusty-rose/25 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden print:border-none print:shadow-none print:p-4">
                {/* Detalhe de fundo */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-dusty-rose/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-dusty-rose/20 rounded-full text-[11px] font-black tracking-widest uppercase text-dusty-rose shadow-xs mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Confirmação Oficial do Enxoval
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-black text-charcoal font-serif tracking-tight mt-1">
                        {babyName ? (
                            <>O Enxoval do(a) <span className="text-dusty-rose">{babyName}</span> está confirmado!</>
                        ) : (
                            <>Seu Enxoval foi confirmado com sucesso!</>
                        )}
                    </h1>

                    <p className="text-slate text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed font-medium">
                        Estamos muito felizes em vestir esse momento tão mágico! Cada pecinha será confeccionada fio a fio, com tecidos 100% algodão e carinho de mãe.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-5 text-xs">
                        <span className="bg-white/80 border border-black/5 px-3 py-1.5 rounded-xl font-mono text-slate-600 font-bold">
                            Pedido #{cleanOrderId}
                        </span>
                        {deadlineFormatted && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                Previsão de Envio: {deadlineFormatted}
                            </span>
                        )}
                        {formattedTotal && (
                            <span className="bg-white/80 border border-black/5 px-3 py-1.5 rounded-xl font-bold text-slate-800">
                                Total: {formattedTotal}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ LINHA DO TEMPO DA PRODUÇÃO (TIMELINE INTERATIVA) ═══ */}
            <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                    Etapas do Seu Pedido
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
                    {[
                        { title: '1. Pedido Confirmado', subtitle: 'Pagamento recebido', done: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                        { title: '2. Confecção & Bordado', subtitle: 'Bordado fio a fio', done: status !== 'pendente', icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
                        { title: '3. Controle de Qualidade', subtitle: 'Passadoria & laço', done: status === 'conferencia' || status === 'enviado', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                        { title: '4. Envio & Rastreio', subtitle: 'A caminho do seu lar', done: status === 'enviado', icon: Package, color: 'text-dusty-rose', bg: 'bg-rose-50 border-dusty-rose/30' },
                    ].map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div 
                                key={idx} 
                                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                                    step.done ? step.bg : 'bg-slate-50/70 border-slate-100 opacity-60'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${step.done ? step.color : 'text-slate-400'}`} />
                                <p className="text-[11px] font-black text-slate-900 leading-tight">{step.title}</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-none">{step.subtitle}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══ DETALHES DE CADA ITEM DO ENXOVAL ═══ */}
            <div className="space-y-6">
                {items.map((item, idx) => {
                    const pers = item.personalization || {};
                    const babadoColor = pers.color || 'Branco';
                    const passaFitaColor = pers.finishDetail || 'Branco';
                    const babadoImg = findBabadoImage(babadoColor);
                    const passafitaImg = findPassafitaImage(passaFitaColor);

                    return (
                        <div key={idx} className="bg-white border border-black/5 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                            
                            {/* Topo do Produto com Foto */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-black/5">
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 border border-black/5 shrink-0 shadow-xs">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-2" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                            Danis Para Bebê
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center sm:text-left min-w-0">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-dusty-rose px-2.5 py-0.5 rounded-full border border-dusty-rose/20">
                                            {item.quantity}x {item.quantity === 1 ? 'Unidade' : 'Unidades'}
                                        </span>
                                        {pers.theme && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                                Tema: {pers.theme}
                                            </span>
                                        )}
                                        {pers.size && (
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">
                                                Tamanho: {pers.size}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-charcoal font-serif tracking-tight">
                                        {item.name}
                                    </h2>
                                    <p className="text-xs text-slate mt-1 font-medium leading-relaxed">
                                        Confeccionado artesanalmente sob encomenda em percal e fralda 100% algodão de toque ultra macio.
                                    </p>
                                </div>
                            </div>

                            {/* Destaque do Bordado (Nome do Bebê) */}
                            {pers.name && (
                                <div className="bg-gradient-to-r from-[#fdf6f6] via-[#faf8f5] to-[#fbf4f0] border-2 border-dusty-rose/30 rounded-2xl p-5 text-center relative overflow-hidden">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-dusty-rose bg-white px-3 py-1 rounded-full shadow-xs border border-dusty-rose/15 inline-block">
                                        Bordado Personalizado no Enxoval
                                    </span>
                                    <p className="text-3xl sm:text-4xl font-black text-charcoal font-serif tracking-tight mt-2.5 capitalize">
                                        {pers.name}
                                    </p>
                                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                                        Tema: <strong className="text-charcoal">{pers.theme || 'Clássico'}</strong>
                                    </p>
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-white/70 px-3 py-1 rounded-lg border border-black/5">
                                        <span>💡</span>
                                        <span>Confira a grafia do nome. Se desejar alterar qualquer detalhe, avise-nos pelo WhatsApp!</span>
                                    </div>
                                </div>
                            )}

                            {/* Acabamentos Escolhidos (Babado e Passa-fita) */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Acabamentos & Aviamentos do Kit
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Babado */}
                                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3.5">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 bg-white shrink-0 shadow-xs">
                                            {babadoImg ? (
                                                <Image src={babadoImg} alt={babadoColor} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                                    Amostra
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Babado Escolhido</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{babadoColor}</p>
                                            <p className="text-[11px] text-slate-500 font-medium">Bordado Inglês 100% Algodão</p>
                                        </div>
                                    </div>

                                    {/* Passa-fita */}
                                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3.5">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 bg-white shrink-0 shadow-xs">
                                            {passafitaImg ? (
                                                <Image src={passafitaImg} alt={passaFitaColor} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                                    Amostra
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passa-Fita / Fita</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{passaFitaColor}</p>
                                            <p className="text-[11px] text-slate-500 font-medium">Fita de Cetim de Toque Delicado</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Observação do Cliente (se houver) */}
                            {pers.observations && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start text-xs">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                                            Sua Observação Registrada
                                        </p>
                                        <p className="text-amber-950 mt-0.5 font-medium leading-relaxed">
                                            "{pers.observations}"
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* ═══ ENDEREÇO DE ENTREGA & CONFERÊNCIA ═══ */}
            <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-dusty-rose" />
                        Endereço de Entrega Cadastrado
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Envio Seguro
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destinatário</p>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{customerName || 'Cliente'}</p>
                        {customerPhone && (
                            <p className="text-slate-500 mt-0.5">Telefone: {customerPhone}</p>
                        )}
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local de Entrega</p>
                        {hasAddress ? (
                            <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">
                                <strong className="text-slate-900">{street}{number ? `, nº ${number}` : ''}</strong>
                                {complement ? ` (${complement})` : ''}
                                <br />
                                {neighborhood && <span>Bairro: {neighborhood} — </span>}
                                {city} - {state}
                                <br />
                                <span className="font-mono text-slate-500">CEP: {cep}</span>
                            </p>
                        ) : (
                            <p className="text-slate-400 italic mt-0.5">Endereço registrado no pedido.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ BOTÕES DE AÇÃO E SUPORTE ═══ */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
                <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar à Loja
                </Link>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                    >
                        <Printer className="w-4 h-4" /> Salvar / Imprimir
                    </button>

                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 hover:shadow-md"
                    >
                        <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
                    </a>
                </div>
            </div>

            {/* ═══ MENSAGEM FINAL DE AFETO ═══ */}
            <div className="text-center pt-4 pb-6 text-slate-400 text-xs">
                <p className="flex items-center justify-center gap-1 font-serif text-dusty-rose text-sm font-bold">
                    Feito com muito amor pela Danis Para Bebê <Heart className="w-3.5 h-3.5 fill-dusty-rose" />
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                    Dúvidas? Entre em contato pelo WhatsApp (18) 99751-8078
                </p>
            </div>

        </div>
    );
}
