'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useEffect } from 'react';
import { useBuilderStore } from '@/store/builder-store';

export default function SuccessPage() {
    const resetBuilder = useBuilderStore((state) => state.resetBuilder);

    useEffect(() => {
        resetBuilder();
    }, [resetBuilder]);

    return (
        <div className="min-h-screen bg-creme flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-rosa to-rosa/80 text-white px-8 py-12 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="flex justify-center mb-6"
                        >
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-rosa" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
                            Pagamento Confirmado!
                        </h1>
                        <p className="text-lg opacity-90">
                            Seu pedido foi recebido com sucesso
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-rosa/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Package className="w-6 h-6 text-rosa" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        O que acontece agora?
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Você receberá um e-mail de confirmação com todos os detalhes do seu pedido.
                                        Nossa equipe já começou a preparar seu enxoval personalizado com todo carinho.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-azul/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">📱</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        Fique de olho no WhatsApp
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Entraremos em contato via WhatsApp para acompanhar o andamento
                                        da produção e combinar a entrega.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-3xl font-semibold transition-all"
                            >
                                <Home className="w-5 h-5" />
                                Voltar ao Início
                            </Link>
                            <Link
                                href="/montar-enxoval"
                                className="flex items-center justify-center gap-2 bg-rosa hover:bg-rosa/90 text-white py-3 px-6 rounded-3xl font-semibold transition-all shadow-lg hover:shadow-xl"
                            >
                                <Package className="w-5 h-5" />
                                Criar Outro Enxoval
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-white/60 backdrop-blur rounded-2xl text-center">
                    <p className="text-sm text-gray-600">
                        Restou alguma dúvida? Entre em contato conosco pelo WhatsApp
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
