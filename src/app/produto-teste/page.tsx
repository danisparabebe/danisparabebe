'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function TestProductPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
        console.log(msg);
    };

    // Hardcoded MVP Product Data
    const product = {
        id: 'mvp-product-001',
        name: 'Kit Maternidade MVP',
        fabricId: 'fabric-001',
        fabricName: 'Algodão Egípcio Branco',
        embroideryId: 'embroidery-001',
        embroideryName: 'Urso Real',
        babyName: 'DANI',
        totalPrice: 10.00,
    };

    const handleBuy = async () => {
        setIsProcessing(true);
        setError(null);
        setLogs([]); // Clear previous logs
        addLog('Iniciando processo de compra...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            addLog('Chamando API /api/debug-checkout...');

            const response = await fetch('/api/debug-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: product.name,
                    price: product.totalPrice
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            addLog(`Resposta recebida. Status: ${response.status}`);

            const data = await response.json();
            addLog(`Dados: ${JSON.stringify(data)}`);

            if (!response.ok) {
                throw new Error(data.error || `HTTP Error: ${response.status}`);
            }

            if (data.url) {
                addLog('Redirecionando para Stripe...');
                window.location.href = data.url;
            } else {
                throw new Error('URL do Stripe não retornada');
            }

        } catch (err: any) {
            clearTimeout(timeoutId);
            const errorMsg = err.name === 'AbortError' ? 'Timeout: O servidor demorou demais.' : (err.message || 'Erro desconhecido');
            addLog(`ERRO: ${errorMsg}`);
            setError(errorMsg);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full border border-gray-200 p-8 text-center space-y-8">

                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito">
                        MVP Test v3.1 (FIXED)
                    </span>
                    <h1 className="text-3xl font-playfair text-text">
                        {product.name}
                    </h1>
                </div>

                {/* Debug Log Box */}
                <div className="bg-black text-green-400 p-4 text-left text-xs font-mono h-40 overflow-y-auto rounded-sm border border-gray-300">
                    <div className="border-b border-gray-700 pb-2 mb-2 text-gray-500 uppercase">Debug Log</div>
                    {logs.length === 0 ? <span className="text-gray-600">Aguardando ação...</span> : logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
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
