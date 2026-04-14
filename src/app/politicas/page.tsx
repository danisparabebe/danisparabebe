import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Políticas e Prazos | Danis Para Bebê',
    description: 'Conheça nossas políticas de troca, devolução e prazos de produção artesanal.',
};

export default function PoliticasPage() {
    return (
        <div className="min-h-screen bg-surface-white pt-6 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate hover:text-sage-green transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar para a loja
                </Link>

                <h1 className="text-4xl font-heading font-bold text-charcoal mb-4">Políticas e Prazos</h1>
                <p className="text-lg text-slate mb-12">
                    Garantimos a qualidade e o carinho em cada peça do enxoval do seu bebê.
                </p>

                <div className="space-y-12">
                    {/* Section 1 */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-line">
                        <h2 className="text-2xl font-heading font-bold text-sage-green-dark mb-4">Prazos de Produção Artesanal</h2>
                        <div className="space-y-4 text-charcoal/80 leading-relaxed">
                            <p>
                                Todas as nossas peças são feitas sob encomenda e personalizadas com o nome e as cores escolhidas por você. Por se tratar de um processo 100% artesanal, feito com muito cuidado e dedicação para o seu bebê, <strong>nosso prazo de produção é de 7 a 12 dias úteis</strong> após a confirmação do pagamento.
                            </p>
                            <p>
                                Este prazo não inclui o tempo de trânsito dos Correios/Transportadora. O seu código de rastreio será enviado por e-mail e WhatsApp assim que a caixinha for despachada.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-line">
                        <h2 className="text-2xl font-heading font-bold text-sage-green-dark mb-4">Trocas e Devoluções</h2>
                        <div className="space-y-4 text-charcoal/80 leading-relaxed">
                            <h3 className="text-lg font-bold text-charcoal mt-6">Produtos Personalizados</h3>
                            <p>
                                Como nossos produtos são personalizados com as iniciais ou o nome do bebê escolhido pela cliente, <strong>não efetuamos trocas ou devoluções por arrependimento</strong> de peças personalizadas, visto que não poderão ser revendidas para outro cliente (Código de Defesa do Consumidor, Art. 49).
                            </p>
                            <p>
                                Por favor, confira atentamente a grafia do nome e as escolhas de cores no momento do fechamento do pedido.
                            </p>

                            <h3 className="text-lg font-bold text-charcoal mt-6">Defeitos de Fabricação</h3>
                            <p>
                                Caso a peça chegue com algum defeito de fabricação ou erro na personalização (diferente do que foi aprovado no pedido), a troca é garantida! Você tem até 7 (sete) dias corridos após o recebimento para nos notificar via WhatsApp junto com fotos evidenciando o problema. Faremos a substituição da peça no menor prazo possível, sem custos adicionais.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-line">
                        <h2 className="text-2xl font-heading font-bold text-sage-green-dark mb-4">Envio e Entrega</h2>
                        <div className="space-y-4 text-charcoal/80 leading-relaxed">
                            <p>
                                O frete é calculado no momento da compra, com base no CEP de destino. Enviamos para todo o Brasil. Não nos responsabilizamos por atrasos decorrentes de greves ou problemas logísticos exclusivos das transportadoras/Correios, mas estaremos sempre à disposição para auxiliar na cobrança de prazos.
                            </p>
                            <p>
                                Em caso de retorno da caixa por endereço incorreto fornecido no momento do preenchimento ou destinatário ausente (após o limite de tentativas de entrega), um novo frete será cobrado para o reenvio.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
