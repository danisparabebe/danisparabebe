'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductTechnicalSheet } from '@/components/product/product-technical-sheet';
import { ShoppingBag, ArrowLeft, Printer, AlertCircle, RefreshCw } from 'lucide-react';

function FichaContent() {
    const searchParams = useSearchParams();
    const dataHash = searchParams.get('data');
    const orderIdParam = searchParams.get('id') || searchParams.get('orderId');

    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // 1. Tenta carregar via base64 dataHash
        if (dataHash) {
            try {
                const jsonString = decodeURIComponent(escape(atob(dataHash)));
                const parsed = JSON.parse(jsonString);
                setOrderData(parsed);
                setLoading(false);
                return;
            } catch (err) {
                console.error("Failed to parse technical sheet data from hash:", err);
                setError("Link de ficha técnica inválido ou corrompido.");
                setLoading(false);
                return;
            }
        }

        // 2. Se não tiver hash mas tiver ID do pedido, busca diretamente na API
        if (orderIdParam) {
            fetch('/api/admin/pedidos')
                .then(res => res.json())
                .then(data => {
                    if (data.ok && Array.isArray(data.orders)) {
                        const target = data.orders.find((o: any) => 
                            o.id === orderIdParam || 
                            o.id === `ORDER_${orderIdParam}` ||
                            o.id.endsWith(orderIdParam)
                        );
                        if (target) {
                            setOrderData({
                                items: target.items || [],
                                customer: {
                                    name: target.customerName || 'Cliente',
                                    phone: target.customerPhone || '',
                                    email: target.customerEmail || '',
                                    cpf: target.customerCpf || target.address?.cpf || '',
                                    address: target.address || null,
                                    deadline: target.deadlineDate,
                                    createdAt: target.createdAt
                                },
                                orderTotal: target.totalAmount,
                                orderId: target.id,
                                createdAt: target.createdAt
                            });
                        } else {
                            setError(`Pedido #${orderIdParam} não foi encontrado.`);
                        }
                    } else {
                        setError('Falha ao comunicar com o banco de pedidos.');
                    }
                })
                .catch(err => {
                    console.error('Erro ao buscar pedido por ID:', err);
                    setError('Erro ao carregar dados do pedido no servidor.');
                })
                .finally(() => setLoading(false));
            return;
        }

        setError('Nenhum dado ou código de pedido foi fornecido.');
        setLoading(false);
    }, [dataHash, orderIdParam]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-600">
                    Carregando Ficha Técnica de Produção...
                </p>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-lg font-black text-slate-800 uppercase">Não foi possível abrir a ficha</h2>
                    <p className="text-sm text-slate-500 font-medium">{error || 'Dados insuficientes.'}</p>
                    <Link 
                        href="/admin/pedidos" 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition-colors w-full"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar aos Pedidos
                    </Link>
                </div>
            </div>
        );
    }

    const { items, customer, orderId, orderTotal, createdAt } = orderData;
    const itemsToProduce = items || [];

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
            {/* Barra Superior de Ações */}
            <div className="max-w-5xl mx-auto mb-6 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/pedidos" 
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase"
                        title="Voltar ao Painel"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                            <ShoppingBag className="w-5 h-5 text-purple-600" />
                            Portal de Produção & Ficha Técnica
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Cliente: <strong className="text-slate-800">{customer?.name || 'Não informado'}</strong>
                            {customer?.phone && ` • WhatsApp: ${customer.phone}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button 
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir Ficha (A4)
                    </button>
                </div>
            </div>

            {/* Lista de Fichas dos Itens */}
            {itemsToProduce.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-5xl mx-auto">
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Nenhum item encontrado neste pedido.
                    </p>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-8">
                    {itemsToProduce.map((item: any, idx: number) => (
                        <div key={idx} className="print:break-inside-avoid print:mb-8">
                            <ProductTechnicalSheet
                                productName={item.name}
                                productImage={item.image}
                                productId={item.productId || item.id}
                                personalization={item.personalization || {}}
                                customerName={customer?.name}
                                customerPhone={customer?.phone}
                                customerCpf={customer?.cpf}
                                customerEmail={customer?.email}
                                shippingAddress={customer?.address}
                                deadline={customer?.deadline}
                                orderId={orderId}
                                orderTotal={orderTotal}
                                createdAt={createdAt || customer?.createdAt}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FichaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-xs tracking-wider">
                Carregando sistema de produção...
            </div>
        }>
            <FichaContent />
        </Suspense>
    );
}
