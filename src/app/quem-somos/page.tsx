import { ChevronLeft, Heart, Sparkles, Scissors } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Nossa História | Danis Para Bebê',
    description: 'Conheça a história e o carinho por trás de cada enxoval personalizado da Danis Para Bebê.',
};

export default function QuemSomosPage() {
    return (
        <div className="min-h-screen bg-surface-white pt-6 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate hover:text-sage-green transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar para a loja
                </Link>

                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-5xl font-heading font-bold text-charcoal mb-4">A Doçura do Primeiro Enxoval</h1>
                    <p className="text-xl text-slate max-w-2xl mx-auto italic">
                        Na Danis Para Bebê, cada fio bordado carrega o sonho de uma nova vida.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    {/* Placeholder for a beautiful studio/embroidery image later */}
                    <div className="bg-sage-green/5 rounded-2xl aspect-square w-full flex items-center justify-center p-8 overflow-hidden relative border border-line">
                        <div className="absolute inset-0 bg-gradient-to-tr from-warm-stone/40 to-transparent"></div>
                        <img src="/Logos/DANIS VERDE-BRANCO.png" alt="Danis Para Bebê" className="w-[70%] h-auto relative z-10 object-contain drop-shadow-sm opacity-90" />
                    </div>

                    <div className="space-y-6 text-charcoal/80 leading-relaxed text-lg">
                        <p>
                            Nascemos da paixão por eternizar o momento mais mágico da vida de uma família: a chegada de um bebê.
                        </p>
                        <p>
                            Sabemos que a gestação é uma jornada repleta de escolhas e que o enxoval é uma das etapas mais especiais. Por isso, a <strong>Danis Para Bebê</strong> não é apenas uma loja, mas um ateliê dedicado a transformar tecidos macios e linhas coloridas em memórias palpáveis.
                        </p>
                        <p>
                            Acreditamos no poder do toque, do artesanal e, acima de tudo, na personalização. Nenhuma peça da Danis é igual a outra, porque <em>nenhum bebê é igual a outro</em>.
                        </p>
                    </div>
                </div>

                {/* Values Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-line text-center group hover:border-sage-green transition-colors">
                        <div className="bg-warm-stone/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Scissors className="w-8 h-8 text-charcoal" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-sage-green-dark mb-3">Produção Artesanal</h3>
                        <p className="text-slate text-sm">
                            Feito à mão, com riqueza de detalhes e atenção a cada milímetro do bordado.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-line text-center group hover:border-sage-green transition-colors">
                        <div className="bg-warm-stone/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-8 h-8 text-charcoal" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-sage-green-dark mb-3">Fios Premium</h3>
                        <p className="text-slate text-sm">
                            Tecidos de algodão macio, pensados exclusivamente para não irritar a pele sensível do recém-nascido.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-line text-center group hover:border-sage-green transition-colors">
                        <div className="bg-warm-stone/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Heart className="w-8 h-8 text-charcoal" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-sage-green-dark mb-3">Muito Amor</h3>
                        <p className="text-slate text-sm">
                            Seu bebê merece ser recebido no mundo com um carinho que ele pode vestir e sentir.
                        </p>
                    </div>
                </div>

                <div className="bg-sage-green/5 p-8 md:p-12 rounded-2xl text-center border border-sage-green/20">
                    <p className="text-xl md:text-2xl font-heading text-charcoal italic mb-6">
                        "Preparamos o ninho do seu bebê para ser tão acolhedor quanto o seu abraço."
                    </p>
                    <Link href="/monte-seu-kit" className="inline-block bg-sage-green hover:bg-sage-green-dark text-charcoal px-8 py-3 rounded-full font-bold transition-all transform active:scale-95 shadow-md">
                        Comece a montar o seu enxoval
                    </Link>
                </div>

            </div>
        </div>
    );
}
