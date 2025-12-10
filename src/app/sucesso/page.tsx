'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCartStore();

    useEffect(() => {
        if (sessionId) {
            clearCart();
        }
    }, [sessionId, clearCart]);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-soft max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">
                Pedido Confirmado!
            </h1>

            <p className="text-slate mb-8">
                Obrigado por escolher a Danis Para Bebê.
                Seu pedido foi recebido com sucesso e já vamos começar a preparar tudo com muito carinho.
            </p>

            <div className="space-y-4">
                <a
                    href="https://wa.me/5511999999999?text=Olá, acabei de fazer o pedido pelo site!"
                    target="_blank"
                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full transition-colors"
                >
                    Confirmar no WhatsApp
                </a>

                <Link
                    href="/"
                    className="block w-full bg-line text-slate hover:bg-slate/20 font-medium py-3 rounded-full transition-colors"
                >
                    Voltar para a Loja
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-dots-texture flex flex-col items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Carregando confirmação...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
