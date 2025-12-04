'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ShoppingBag, Edit2, Check } from 'lucide-react';
import Link from 'next/link';

export function StepReview() {
    const { selectedItems, selectedFabric, selectedEmbroidery, personalizationName, getTotalPrice, setStep } = useConfiguratorStore();
    const totalPrice = getTotalPrice();

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-sage-green/20 rounded-full flex items-center justify-center">
                        <Check className="h-10 w-10 text-sage-green" />
                    </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold text-charcoal">
                    Revise seu Pedido
                </h2>
                <p className="text-lg md:text-xl text-slate">
                    Confira todos os detalhes antes de finalizar
                </p>
            </div>

            <div className="space-y-6">
                {/* Selected Items */}
                <Card className="p-8 md:p-10 shadow-soft bg-surface-white rounded-callisto border-2 border-line">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-charcoal">Itens Selecionados</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('items')}
                            className="text-dusty-rose hover:bg-dusty-rose/10"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {selectedItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-3 border-b border-line last:border-0">
                                <span className="text-charcoal font-medium text-lg">{item.name}</span>
                                <span className="font-bold text-dusty-rose text-lg">R$ {item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Selected Fabric */}
                <Card className="p-8 md:p-10 shadow-soft bg-surface-white rounded-callisto border-2 border-line">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-charcoal">Tecido</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('fabrics')}
                            className="text-dusty-rose hover:bg-dusty-rose/10"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-charcoal font-medium text-lg">{selectedFabric?.name}</span>
                        <span className="font-bold text-dusty-rose text-lg">
                            {selectedFabric?.priceModifier && selectedFabric.priceModifier > 0
                                ? `+R$ ${selectedFabric.priceModifier.toFixed(2)}`
                                : 'Incluído'}
                        </span>
                    </div>
                </Card>

                {/* Selected Embroidery */}
                <Card className="p-8 md:p-10 shadow-soft bg-surface-white rounded-callisto border-2 border-line">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-charcoal">Bordado</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('embroidery')}
                            className="text-dusty-rose hover:bg-dusty-rose/10"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-charcoal font-medium text-lg">{selectedEmbroidery?.name}</span>
                        <span className="font-bold text-dusty-rose text-lg">
                            {selectedEmbroidery?.priceModifier && selectedEmbroidery.priceModifier > 0
                                ? `+R$ ${selectedEmbroidery.priceModifier.toFixed(2)}`
                                : 'Incluído'}
                        </span>
                    </div>
                </Card>

                {/* Personalization */}
                <Card className="p-8 md:p-10 shadow-soft bg-surface-white rounded-callisto border-2 border-line">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-charcoal">Personalização</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep('personalization')}
                            className="text-dusty-rose hover:bg-dusty-rose/10"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                    <div>
                        {personalizationName ? (
                            <>
                                <p className="text-sm text-slate mb-4 uppercase tracking-wider">Nome bordado:</p>
                                <p className="text-5xl md:text-6xl italic text-dusty-rose" style={{ fontFamily: 'Fraunces, serif' }}>
                                    {personalizationName}
                                </p>
                            </>
                        ) : (
                            <p className="text-slate italic">Sem personalização de nome</p>
                        )}
                    </div>
                </Card>

                {/* Total */}
                <Card className="p-10 md:p-12 bg-gradient-to-br from-dusty-rose/10 to-warm-stone border-2 border-dusty-rose shadow-hover rounded-modal">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl md:text-4xl font-semibold text-charcoal">Total</h3>
                        <p className="text-5xl md:text-6xl font-bold text-dusty-rose">
                            R$ {totalPrice.toFixed(2)}
                        </p>
                    </div>
                    <p className="text-sm text-slate mt-4 text-center">
                        ✨ Preço final incluindo personalização
                    </p>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setStep('personalization')}
                    className="px-14 py-7 text-base border-2 border-dusty-rose/30 hover:bg-dusty-rose/10 hover:border-dusty-rose text-charcoal rounded-callisto"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    className="bg-dusty-rose hover:bg-deep-rose text-white px-16 py-8 text-xl rounded-full shadow-hover transition-all duration-300 hover:scale-105 font-medium uppercase tracking-wider"
                    asChild
                >
                    <Link href="/">
                        <ShoppingBag className="mr-3 h-6 w-6" />
                        Finalizar Pedido
                    </Link>
                </Button>
            </div>

            <p className="text-center text-sm text-slate bg-sage-green/10 py-4 px-6 rounded-full border border-sage-green/30">
                💝 Em breve: Pagamento via Stripe ou contato via WhatsApp
            </p>
        </div>
    );
}
