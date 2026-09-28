'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClientOrderSheet } from '@/components/product/client-order-sheet';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

interface PedidoPageProps {
    params: Promise<{ id: string }>;
}

export default function PedidoPublicoPage({ params }: PedidoPageProps) {
    const resolvedParams = use(params);
    const orderId = resolvedParams.id;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        setLoading(true);
        fetch(`/api/pedidos/status?id=${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok && data.order) {
                    setOrder(data.order);
                } else {
                    setError(data.error || 'Pedido não localizado.');
                }
            })
            .catch(err => {
                console.error('Erro ao buscar pedido:', err);
                setError('Falha ao comunicar com o servidor.');
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf6f4] flex flex-col items-center justify-center p-4">
                <RefreshCw className="w-8 h-8 animate-spin text-dusty-rose mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-slate">
                    Localizando detalhes do enxoval...
                </p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#faf6f4] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 max-w-md w-full text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-dusty-rose mx-auto" />
                    <h2 className="text-xl font-serif font-black text-charcoal">Pedido não encontrado</h2>
                    <p className="text-xs text-slate font-medium">
                        Não encontramos nenhum registro com o código <strong>#{orderId}</strong>. Verifique o número digitado.
                    </p>
                    <Link 
                        href="/" 
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors w-full"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar à Loja
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fdf9f7] via-[#faf6f4] to-[#f4eeea] py-8 sm:py-12 px-4 selection:bg-dusty-rose selection:text-white">
            {/* Barra Superior Simples */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate hover:text-dusty-rose transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar à Loja
                </Link>

                <Image
                    src={encodeURI('/Logos/Logomarca Rose.png')}
                    alt="Danis Para Bebê"
                    width={100}
                    height={38}
                    className="object-contain"
                    unoptimized
                />
            </div>

            <ClientOrderSheet order={order} />
        </div>
    );
}
