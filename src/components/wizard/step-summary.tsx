'use client';

import { useBuilderStore } from '@/store/builder-store';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function StepSummary() {
    const { selectedProduct, selectedFabric, selectedEmbroidery, babyName, totalPrice } = useBuilderStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = async () => {
        if (!selectedProduct || !selectedFabric || !selectedEmbroidery || !babyName) return;

        setIsProcessing(true);

        // Timeout safety
        const timeout = setTimeout(() => {
            setIsProcessing(false);
            alert('O servidor demorou muito para responder. Verifique se as chaves do Stripe estão configuradas na Vercel.');
        }, 15000); // 15 seconds timeout

        try {
            const { createCheckoutSession } = await import('@/app/actions/checkout');
            const result = await createCheckoutSession({
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                fabricId: selectedFabric.id,
                fabricName: selectedFabric.name,
                embroideryId: selectedEmbroidery.id,
                embroideryName: selectedEmbroidery.name,
                babyName,
                totalPrice,
            });

            clearTimeout(timeout);

            if (result.error) {
                console.error('Checkout Error:', result.error);
                alert(`Erro: ${result.error}`);
                setIsProcessing(false);
                return;
            }

            if (result.url) window.location.href = result.url;
        } catch (error) {
            clearTimeout(timeout);
            console.error('Unexpected error:', error);
            alert('Ocorreu um erro inesperado. Tente novamente.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center md:text-left border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito block mb-2">
                    Passo 5 (v1.2 Debug)
                </span>
                <h3 className="text-2xl font-playfair text-text">
                    RESUMO DO PEDIDO
                </h3>
            </div>

            <div className="bg-gray-50 p-10 space-y-8 border border-gray-100">
                {/* Line Items */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-text font-playfair uppercase tracking-wide text-sm">{selectedProduct?.name}</span>
                        <span className="font-nunito text-xs font-bold text-subtle">R$ {selectedProduct?.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-text font-playfair uppercase tracking-wide text-sm">Tecido: {selectedFabric?.name}</span>
                        <span className="font-nunito text-xs font-bold text-subtle">+ R$ {selectedFabric?.additionalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-text font-playfair uppercase tracking-wide text-sm">Bordado: {selectedEmbroidery?.name}</span>
                        <span className="font-nunito text-xs font-bold text-subtle">+ R$ {selectedEmbroidery?.additionalPrice.toFixed(2)}</span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-6">
                    <span className="text-lg font-playfair text-text uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-playfair text-text">R$ {totalPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-6">
                <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full rounded-none bg-text text-white hover:bg-black uppercase tracking-widest text-xs h-14"
                >
                    {isProcessing ? 'Processando...' : 'Finalizar Compra'}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-subtle uppercase tracking-widest font-nunito">
                    <Icon icon={ShieldCheck} className="w-3 h-3" />
                    Pagamento Seguro via Stripe
                </div>
            </div>
        </div>
    );
}
