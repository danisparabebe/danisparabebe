'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/app/actions/checkout';
import { Icon } from '@/components/ui/icon';
import { ShieldCheck, ShoppingBag } from 'lucide-react';

export default function TestProductPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hardcoded MVP Product Data
    const product = {
        id: 'mvp-product-001',
        name: 'Kit Maternidade MVP',
        fabricId: 'fabric-001',
        fabricName: 'Algodão Egípcio Branco',
        embroideryId: 'embroidery-001',
        embroideryName: 'Urso Real',
        babyName: 'DANI',
        totalPrice: 10.00, // Low price for testing
    };

    const handleBuy = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const result = await createCheckoutSession({
                productId: product.id,
                productName: product.name,
                fabricId: product.fabricId,
                fabricName: product.fabricName,
                embroideryId: product.embroideryId,
                embroideryName: product.embroideryName,
                babyName: product.babyName,
                totalPrice: product.totalPrice,
            });

            if (result.error) {
                setError(result.error);
                setIsProcessing(false);
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full border border-gray-200 p-8 text-center space-y-8">

                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito">
                        MVP Test
                    </span>
                    <h1 className="text-3xl font-playfair text-text">
                        {product.name}
                    </h1>
                </div>

                <div className="aspect-square bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Icon icon={ShoppingBag} className="w-16 h-16 text-subtle/20" />
                </div>

                <div className="space-y-4 text-left bg-gray-50 p-6 text-sm font-nunito text-subtle">
                    <div className="flex justify-between">
                        <span>Produto:</span>
                        <span className="font-bold text-text">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cor/Tecido:</span>
                        <span className="font-bold text-text">{product.fabricName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Preço:</span>
                        <span className="font-bold text-text">R$ {product.totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-xs border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        onClick={handleBuy}
                        disabled={isProcessing}
                        className="w-full rounded-none bg-text text-white hover:bg-black uppercase tracking-widest h-14"
                    >
                        {isProcessing ? 'Processando...' : `Comprar Agora - R$ ${product.totalPrice.toFixed(2)}`}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-subtle uppercase tracking-widest font-nunito">
                        <Icon icon={ShieldCheck} className="w-3 h-3" />
                        Teste Seguro Stripe
                    </div>
                </div>

            </div>
        </div>
    );
}
