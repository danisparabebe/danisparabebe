import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';

export default function TrocasPage() {
    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <Header />
            <Navigation />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-line">
                    <h1 className="text-3xl font-heading font-bold text-charcoal mb-6">Política de Trocas e Devoluções</h1>

                    <div className="prose prose-pink text-slate">
                        <p>
                            Na Danis Para Bebê, queremos que você e seu bebê fiquem completamente apaixonados por nossos produtos.
                            Se por algum motivo você precisar trocar ou devolver, estamos aqui para ajudar.
                        </p>

                        <h3>1. Condições Gerais</h3>
                        <p>
                            Aceitamos trocas e devoluções em até 7 (sete) dias corridos após o recebimento do produto, conforme o Código de Defesa do Consumidor.
                            O produto deve estar sem uso, em sua embalagem original e com todas as etiquetas.
                        </p>

                        <h3>2. Produtos Personalizados</h3>
                        <p className="font-bold text-charcoal">
                            Atenção: Produtos personalizados com o nome do bebê não podem ser trocados ou devolvidos, exceto em caso de defeito de fabricação ou erro nosso na personalização.
                        </p>
                        <p>
                            Por isso, pedimos que verifique com atenção a grafia do nome e as cores escolhidas no momento da compra.
                        </p>

                        <h3>3. Defeito de Fabricação</h3>
                        <p>
                            Se o produto apresentar algum defeito, entre em contato conosco imediatamente. Faremos a troca sem custos adicionais para você.
                        </p>

                        <h3>4. Como Solicitar</h3>
                        <p>
                            Entre em contato através do nosso WhatsApp ou e-mail informando o número do pedido e o motivo da troca.
                        </p>
                    </div>
                </div>
            </main>

            <Footer simple />
        </div>
    );
}
