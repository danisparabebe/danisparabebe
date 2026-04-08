'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, MapPin, ChevronDown, MessageCircle, ArrowLeft, FileText, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductTechnicalSheet } from '@/components/product/product-technical-sheet';

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
            className="flex-1 bg-white border border-black/5 rounded-xl p-2.5 text-center shadow-sm min-w-[90px]"
        >
            <Icon className="w-4 h-4 mx-auto text-dusty-rose mb-1" strokeWidth={2} />
            <p className="text-[8px] font-bold text-slate uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xs font-black text-charcoal leading-tight">{value}</p>
        </motion.div>
    );
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCartStore();
    const [orderData, setOrderData] = useState<any>(null);
    const [showFicha, setShowFicha] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('lastOrder');
            if (stored) {
                try {
                    setOrderData(JSON.parse(stored));
                } catch (e) {}
            }
        }
        if (sessionId) {
            clearCart();
        }
    }, [sessionId, clearCart]);

    const itemsWithPersonalization = orderData?.items?.filter((item: any) => item.personalization) || [];
    const totalPieces = orderData?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

    // Build shipping address
    const customerData = orderData?.customer;
    const shippingAddress = customerData ? {
        line1: [customerData.street, customerData.number].filter(Boolean).join(', '),
        line2: [customerData.complement, customerData.neighborhood].filter(Boolean).join(' - '),
        city: customerData.city,
        state: customerData.state,
        postal_code: customerData.cep,
    } : null;

    // Compute deadline (12 business days)
    const computeDeadline = () => {
        const d = new Date();
        let added = 0;
        while (added < 12) {
            d.setDate(d.getDate() + 1);
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) added++;
        }
        return d.toISOString();
    };
    const deadline = computeDeadline();
    const deadlineFormatted = new Date(deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Extract baby name from personalization
    const babyName = itemsWithPersonalization[0]?.personalization?.name;

    // Compute Total
    const itemsTotal = orderData?.items?.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0) || 0;
    const shippingCost = orderData?.shipping || 0;
    const orderTotalCents = (itemsTotal + shippingCost) * 100;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4">

            {/* === HERO CARD === */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[#fdf2f2] p-5 sm:p-7 rounded-3xl shadow-lg border border-dusty-rose/20 text-center max-w-lg mx-auto"
            >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                     style={{ backgroundImage: 'radial-gradient(circle, #D6A6A6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

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
                        width={100}
                        height={38}
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
                    <h1 className="text-lg sm:text-xl font-heading font-black text-charcoal mb-1 leading-tight flex items-center justify-center gap-2 flex-wrap px-4">
                        {babyName ? (
                            <>{babyName}, seu enxoval está sendo preparado!</>
                        ) : (
                            <>Seu enxoval está sendo preparado!</>
                        )}
                    </h1>
                    <p className="text-slate text-[11px] sm:text-xs max-w-xs mx-auto leading-relaxed">
                        Obrigado por escolher a <span className="font-bold text-dusty-rose">Danis Para Bebê</span>.
                        Cada detalhe será feito com muito carinho e dedicação.
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <div className="flex gap-2 mt-4 justify-center">
                    <SummaryCard icon={Package} label="Itens" value={`${totalPieces} ${totalPieces === 1 ? 'peça' : 'peças'}`} delay={0.9} />
                    <SummaryCard icon={Clock} label="Prazo" value={deadlineFormatted} delay={1.0} />
                    {shippingAddress?.city && (
                        <SummaryCard icon={MapPin} label="Envio" value={`${shippingAddress.city}/${shippingAddress.state}`} delay={1.1} />
                    )}
                </div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    className="flex flex-col sm:flex-row gap-2 justify-center mt-5 max-w-sm mx-auto"
                >
                    {(() => {
                        const hasCpf = !!customerData?.cpf;
                        const basePart = babyName
                            ? `Oi, Danis! Acabei de garantir o enxoval do meu bebê ${babyName} pelo site e estou apaixonada!`
                            : `Oi, Danis! Acabei de fazer um pedido no site e não vejo a hora de receber tudo!`;
                        const cpfPart = hasCpf ? '' : '\n\nMeu CPF para o envio é: ';
                        const waMessage = basePart + cpfPart;
                        const waUrl = `https://wa.me/5518997518078?text=${encodeURIComponent(waMessage)}`;
                        
                        return (
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold py-2.5 px-5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-[13px]"
                            >
                                <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
                            </a>
                        );
                    })()}

                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-charcoal/10 text-charcoal hover:bg-charcoal hover:text-white font-bold py-2.5 px-5 rounded-full transition-all active:scale-[0.98] text-[13px]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar à Loja
                    </Link>
                </motion.div>
            </motion.div>

            {/* === FICHA TÉCNICA TOGGLE === */}
            {itemsWithPersonalization.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.4 }}
                    className="w-full"
                >
                    <div className="max-w-lg mx-auto">
                        <button
                            onClick={() => setShowFicha(!showFicha)}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 bg-white border-2 border-charcoal/10 hover:border-dusty-rose hover:bg-dusty-rose/5 text-charcoal font-bold py-3 px-6 rounded-2xl transition-all shadow-sm group relative z-10"
                        >
                            <FileText className="w-4.5 h-4.5 text-dusty-rose" />
                            <span className="text-[11px] uppercase tracking-widest">
                                {showFicha ? 'Ocultar Ficha Técnica' : 'Ver Ficha Técnica'}
                            </span>
                            <motion.div
                                animate={{ rotate: showFicha ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ChevronDown className="w-4.5 h-4.5 text-slate" />
                            </motion.div>
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFicha && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="overflow-hidden w-full"
                            >
                                <div className="pt-4 pb-4 px-2 sm:px-0">
                                    <ProductTechnicalSheet
                                        productName="Kit Enxoval Personalizado"
                                        productImage={itemsWithPersonalization[0].image}
                                        productId={itemsWithPersonalization[0].productId}
                                        personalization={itemsWithPersonalization[0].personalization}
                                        customerName={customerData?.name}
                                        customerPhone={customerData?.phone}
                                        customerCpf={customerData?.cpf}
                                        orderId={sessionId ? sessionId.slice(-6).toUpperCase() : undefined}
                                        shippingAddress={shippingAddress}
                                        deadline={deadline}
                                        orderTotal={orderTotalCents}
                                        kitItems={itemsWithPersonalization.map((i: any) => ({
                                            qty: i.quantity || 1,
                                            code: i.productId?.replace('custom-', '') || i.productId
                                        }))}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fdf8f6] to-[#f5f0ee] py-6 sm:py-8 px-4 selection:bg-dusty-rose selection:text-white">
            <Suspense fallback={<div className="text-center py-20 text-slate font-medium">Carregando confirmação...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
