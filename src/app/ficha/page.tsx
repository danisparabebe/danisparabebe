'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductTechnicalSheet } from '@/components/product/product-technical-sheet';
import { ShoppingBag } from 'lucide-react';

function FichaContent() {
    const searchParams = useSearchParams();
    const dataHash = searchParams.get('data');
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (dataHash) {
            try {
                // Decode base64 URL safe
                const jsonString = decodeURIComponent(escape(atob(dataHash)));
                const parsed = JSON.parse(jsonString);
                setOrderData(parsed);
            } catch (err) {
                console.error("Failed to parse technical sheet data:", err);
                setError(true);
            }
        }
    }, [dataHash]);

    if (!dataHash) {
        return <div className="p-10 text-center text-slate">Nenhum dado fornecido.</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-500 font-bold">Erro ao carregar Ficha Técnica. O link pode ser inválido.</div>;
    }

    if (!orderData) {
        return <div className="p-10 text-center text-slate animate-pulse">Carregando ficha detalhada...</div>;
    }

    const { items, customer, orderId } = orderData;
    const itemsToProduce = items || [];

    return (
        <div className="min-h-screen bg-dots-texture py-10 px-4">
            <div className="max-w-3xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-line flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-heading font-black text-charcoal flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-dusty-rose" />
                        Portal de Produção
                    </h1>
                    <p className="text-sm text-slate mt-1 font-medium">
                        Cliente: <span className="text-charcoal font-bold">{customer?.name || 'Não informado'}</span>
                    </p>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="bg-dusty-rose text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-soft hover:bg-deep-rose transition-colors print:hidden"
                >
                    Imprimir Fichas
                </button>
            </div>

            {itemsToProduce.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-line max-w-3xl mx-auto">
                    Nenhum item encontrado neste pedido.
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                    {itemsToProduce.map((item: any, idx: number) => (
                        <div key={idx} className="print:break-inside-avoid shadow-sm rounded-xl overflow-hidden border border-black/10">
                            <ProductTechnicalSheet
                                productName={item.name}
                                productImage={item.image}
                                productId={item.productId || item.id}
                                personalization={item.personalization || {}}
                                customerName={customer?.name}
                                orderId={orderId}
                                shippingAddress={customer?.address}
                                deadline={customer?.deadline}
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate font-medium">Carregando sistema...</div>}>
            <FichaContent />
        </Suspense>
    );
}
