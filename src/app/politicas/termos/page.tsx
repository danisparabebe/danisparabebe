import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <Header />
            <Navigation />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-line">
                    <h1 className="text-3xl font-heading font-bold text-charcoal mb-6">Termos de Uso</h1>

                    <div className="prose prose-pink text-slate">
                        <h3>1. Termos</h3>
                        <p>
                            Ao acessar ao site Danis Para Bebê, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis.
                        </p>

                        <h3>2. Uso de Licença</h3>
                        <p>
                            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Danis Para Bebê, apenas para visualização transitória pessoal e não comercial.
                        </p>

                        <h3>3. Isenção de responsabilidade</h3>
                        <p>
                            Os materiais no site da Danis Para Bebê são fornecidos 'como estão'. Danis Para Bebê não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                        </p>

                        <h3>4. Limitações</h3>
                        <p>
                            Em nenhum caso o Danis Para Bebê ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Danis Para Bebê.
                        </p>
                    </div>
                </div>
            </main>

            <Footer simple />
        </div>
    );
}
