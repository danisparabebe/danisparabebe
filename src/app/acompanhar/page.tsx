'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/homepage/header';
import { Footer } from '@/components/homepage/footer';
import { TopBar } from '@/components/homepage/top-bar';
import { Package, ArrowRight, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AcompanharPage() {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = orderId.trim();
        if (!trimmed) {
            setError('Por favor, digite o número do pedido.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Validate if order exists first
            const res = await fetch(`/api/pedidos/status?id=${encodeURIComponent(trimmed)}`);
            const data = await res.json();

            if (data.ok && data.order) {
                // If it exists, navigate to the tracking page
                router.push(`/pedido/${data.order.id}`);
            } else {
                setError('Pedido não encontrado. Verifique o número e tente novamente.');
                setLoading(false);
            }
        } catch (err) {
            setError('Ocorreu um erro ao buscar o pedido. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9F9F9] font-sans">
            <TopBar />
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-black/5"
                >
                    <div className="w-16 h-16 bg-sage-green/15 text-[#245E3B] rounded-full flex items-center justify-center mx-auto mb-6 border border-sage-green/30">
                        <Package className="w-8 h-8" />
                    </div>

                    <h1 className="text-2xl font-bold font-heading text-center text-charcoal mb-2">
                        Acompanhe seu Pedido
                    </h1>
                    <p className="text-center text-slate text-sm mb-8">
                        Digite o número do seu pedido (ex: ORDER_12345) para ver o status atual da produção.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="orderId" className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                                Número do Pedido
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate/50" />
                                </div>
                                <input
                                    id="orderId"
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => {
                                        setOrderId(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="ex: ORDER_abc123"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-line/60 rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-sage-green/30 focus:border-[#245E3B] transition-all shadow-sm placeholder:text-slate/40"
                                    disabled={loading}
                                />
                            </div>
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1"
                                >
                                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#215E39] via-[#1B5231] to-[#164327] hover:from-[#287044] hover:via-[#21613a] hover:to-[#1a5130] text-white py-4 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#215E39]/25 hover:shadow-lg hover:shadow-[#215E39]/35 mt-6 cursor-pointer active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Buscando...
                                </>
                            ) : (
                                <>
                                    Rastrear Pedido
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-line/40 text-center">
                        <p className="text-xs text-slate">
                            Não sabe o número do pedido?{' '}
                            <Link href="/conta?aba=pedidos" className="text-[#245E3B] font-bold hover:underline">
                                Acesse sua conta
                            </Link>{' '}
                            ou verifique seu e-mail de confirmação.
                        </p>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
