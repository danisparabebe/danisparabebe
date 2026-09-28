'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, MapPin, ChevronDown, MessageCircle, ArrowLeft, FileText, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOrderSheet } from '@/components/product/client-order-sheet';

function AnimatedCheck() {
    return (
        <motion.svg
            className="w-14 h-14 mx-auto"
            viewBox="0 0 80 80"
            initial="hidden"
            animate="visible"
        >
            <motion.circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="#D6A6A6"
                strokeWidth="3"
                variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
                }}
            />
            <motion.path
                d="M24 42 L34 52 L56 30"
                fill="none"
                stroke="#1a9e52"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: { pathLength: 1, opacity: 1, transition: { delay: 0.5, duration: 0.4, ease: 'easeOut' } },
                }}
            />
        </motion.svg>
    );
}

function SummaryCard({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            className="flex-1 bg-white border border-black/5 rounded-xl p-2.5 text-center shadow-xs min-w-[90px]"
        >
            <Icon className="w-4 h-4 mx-auto text-dusty-rose mb-1" strokeWidth={2} />
            <p className="text-[8px] font-bold text-slate uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xs font-black text-charcoal leading-tight">{value}</p>
        </motion.div>
    );
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id') || searchParams.get('id');
    const { clearCart } = useCartStore();
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            clearCart();
            // Busca o pedido real no backend
            fetch(`/api/pedidos/status?id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.ok && data.order) {
                        setOrderData(data.order);
                    } else {
                        // Fallback se API falhar: tenta localStorage
                        const stored = localStorage.getItem('lastOrder');
                        if (stored) {
                            try {
                                const parsed = JSON.parse(stored);
                                setOrderData({
                                    id: sessionId,
                                    customerName: parsed.customer?.name || 'Cliente',
                                    customerPhone: parsed.customer?.phone || '',
                                    address: parsed.customer,
                                    items: parsed.items || [],
                                    status: 'pago',
                                    totalAmount: parsed.items?.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0) + (parsed.shipping || 0),
                                    deadlineDate: new Date(Date.now() + 15 * 86400000).toISOString()
                                });
                            } catch (e) {}
                        }
                    }
                })
                .catch(err => {
                    console.error("Erro ao carregar pedido:", err);
                    const stored = localStorage.getItem('lastOrder');
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            setOrderData({
                                id: sessionId,
                                customerName: parsed.customer?.name || 'Cliente',
                                customerPhone: parsed.customer?.phone || '',
                                address: parsed.customer,
                                items: parsed.items || [],
                                status: 'pago',
                                totalAmount: parsed.items?.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0) + (parsed.shipping || 0),
                                deadlineDate: new Date(Date.now() + 15 * 86400000).toISOString()
                            });
                        } catch (e) {}
                    }
                })
                .finally(() => setLoading(false));
        } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('lastOrder');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setOrderData({
                        id: 'RECÉM-FINALIZADO',
                        customerName: parsed.customer?.name || 'Cliente',
                        customerPhone: parsed.customer?.phone || '',
                        address: parsed.customer,
                        items: parsed.items || [],
                        status: 'pago',
                        totalAmount: parsed.items?.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0) + (parsed.shipping || 0),
                        deadlineDate: new Date(Date.now() + 15 * 86400000).toISOString()
                    });
                } catch (e) {}
            }
            setLoading(false);
        }
    }, [sessionId, clearCart]);

    const totalPieces = orderData?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
    const personalizedItem = orderData?.items?.find((item: any) => item.personalization?.name);
    const babyName = personalizedItem?.personalization?.name || '';

    // Deadline formatted
    const deadlineFormatted = orderData?.deadlineDate
        ? new Date(orderData.deadlineDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '12 dias úteis';

    const cityState = orderData?.address?.city 
        ? `${orderData.address.city}/${orderData.address.state || ''}`
        : null;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

            {/* === HERO CARD PRINCIPAL === */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[#fdf4f4] p-6 sm:p-8 rounded-3xl shadow-sm border border-dusty-rose/25 text-center max-w-xl mx-auto"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="relative mb-3"
                >
                    <Image
                        src={encodeURI('/Logos/Logomarca Rose.png')}
                        alt="Danis Para Bebê"
                        width={120}
                        height={45}
                        className="mx-auto object-contain"
                        unoptimized
                    />
                </motion.div>

                {/* Animated Check */}
                <div className="mb-3">
                    <AnimatedCheck />
                </div>

                {/* Personalized Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                    <h1 className="text-xl sm:text-2xl font-serif font-black text-charcoal mb-1 leading-tight px-4">
                        {babyName ? (
                            <>O Enxoval do(a) <span className="text-dusty-rose">{babyName}</span> está confirmado!</>
                        ) : (
                            <>Seu Pedido foi confirmado com sucesso!</>
                        )}
                    </h1>
                    <p className="text-slate text-xs sm:text-sm max-w-md mx-auto leading-relaxed mt-2 font-medium">
                        Obrigado por confiar na <strong className="text-dusty-rose">Danis Para Bebê</strong>.
                        Cada detalhe será bordado com todo o carinho e dedicação que seu bebê merece.
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <div className="flex gap-2.5 mt-5 justify-center">
                    <SummaryCard icon={Package} label="Peças" value={`${totalPieces} ${totalPieces === 1 ? 'peça' : 'peças'}`} delay={0.9} />
                    <SummaryCard icon={Clock} label="Prazo Envio" value={deadlineFormatted} delay={1.0} />
                    {cityState && (
                        <SummaryCard icon={MapPin} label="Destino" value={cityState} delay={1.1} />
                    )}
                </div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    className="flex flex-col sm:flex-row gap-2.5 justify-center mt-6 max-w-sm mx-auto"
                >
                    {(() => {
                        const cleanId = (orderData?.id || sessionId || '').replace('ORDER_', '');
                        const waMessage = babyName
                            ? `Oi, Danis! Acabei de garantir o enxoval do meu bebê ${babyName} pelo site (Pedido #${cleanId}) e estou apaixonada!`
                            : `Oi, Danis! Acabei de fazer o pedido #${cleanId} no site e gostaria de acompanhar o processo!`;
                        const waUrl = `https://wa.me/5518997518078?text=${encodeURIComponent(waMessage)}`;
                        
                        return (
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold py-3 px-5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 text-xs uppercase tracking-wider"
                            >
                                <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
                            </a>
                        );
                    })()}

                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-charcoal/10 text-charcoal hover:bg-charcoal hover:text-white font-bold py-3 px-5 rounded-full transition-all active:scale-95 text-xs uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar à Loja
                    </Link>
                </motion.div>
            </motion.div>

            {/* === FICHA PÚBLICA DE CONFERÊNCIA DO ENXOVAL === */}
            {orderData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    className="w-full pt-2"
                >
                    <ClientOrderSheet order={orderData} />
                </motion.div>
            )}

        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fdf9f7] via-[#faf6f4] to-[#f4eeea] py-8 sm:py-12 px-4 selection:bg-dusty-rose selection:text-white">
            <Suspense fallback={
                <div className="text-center py-20 text-slate font-bold uppercase tracking-wider text-xs">
                    Carregando detalhes do enxoval...
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
