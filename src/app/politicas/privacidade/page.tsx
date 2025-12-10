import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <Header />
            <Navigation />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-line">
                    <h1 className="text-3xl font-heading font-bold text-charcoal mb-6">Política de Privacidade</h1>

                    <div className="prose prose-pink text-slate">
                        <p>
                            A sua privacidade é importante para nós. É política da Danis Para Bebê respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site.
                        </p>

                        <h3>1. Informações que Coletamos</h3>
                        <p>
                            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço (como processar seu pedido e entregar).
                            Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.
                        </p>

                        <h3>2. Uso das Informações</h3>
                        <p>
                            Usamos seus dados para:
                            <ul className="list-disc pl-5">
                                <li>Processar e entregar seus pedidos;</li>
                                <li>Comunicar sobre o status da compra;</li>
                                <li>Melhorar sua experiência em nossa loja.</li>
                            </ul>
                        </p>

                        <h3>3. Compartilhamento de Dados</h3>
                        <p>
                            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou para processar o pagamento e entrega (ex: Correios, Gateway de Pagamento).
                        </p>

                        <h3>4. Segurança</h3>
                        <p>
                            Armazenamos os dados coletados pelo tempo necessário para fornecer o serviço solicitado.
                            Quando armazenamos dados, os protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                        </p>
                    </div>
                </div>
            </main>

            <Footer simple />
        </div>
    );
}
