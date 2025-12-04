import { Button } from "@/components/ui/button";
import { ShoppingBag, Award, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen bg-warm-stone">
            {/* Hero Section */}
            <main className="relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
                    {/* Logo */}
                    <div className="flex justify-center mb-12">
                        <div className="relative w-64 h-64 md:w-80 md:h-80">
                            <Image
                                src="/logo-danis.png"
                                alt="Danis Para Bebê"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="text-center space-y-10">
                        <h1 className="text-5xl md:text-7xl font-semibold text-charcoal tracking-tight leading-tight">
                            Enxovais Personalizados<br />
                            <span className="text-dusty-rose">de Alto Padrão</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate max-w-3xl mx-auto leading-relaxed font-light">
                            Feito à mão com amor e exclusividade.
                            <br />
                            Para celebrar a chegada do seu bebê com todo o cuidado que ele merece.
                        </p>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6">
                            <div className="flex items-center gap-3 bg-surface-white px-6 py-4 rounded-callisto shadow-soft">
                                <Heart className="h-5 w-5 text-dusty-rose flex-shrink-0" />
                                <span className="text-sm md:text-base font-medium text-charcoal">Feito à Mão</span>
                            </div>
                            <div className="flex items-center gap-3 bg-surface-white px-6 py-4 rounded-callisto shadow-soft">
                                <Sparkles className="h-5 w-5 text-dusty-rose flex-shrink-0" />
                                <span className="text-sm md:text-base font-medium text-charcoal">Personalizado</span>
                            </div>
                            <div className="flex items-center gap-3 bg-sage-green/20 px-6 py-4 rounded-callisto shadow-soft border border-sage-green/30">
                                <Award className="h-5 w-5 text-sage-green flex-shrink-0" />
                                <span className="text-sm md:text-base font-medium text-charcoal">Premium</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-8">
                            <Button
                                size="lg"
                                className="bg-dusty-rose hover:bg-deep-rose text-white px-14 py-7 text-base md:text-lg rounded-full shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-105 font-medium uppercase tracking-wider"
                                asChild
                            >
                                <Link href="/configurador">
                                    <ShoppingBag className="mr-3 h-5 w-5" />
                                    Personalizar Agora
                                </Link>
                            </Button>
                        </div>

                        <p className="text-sm text-slate pt-6">
                            ✨ Cada peça é única e feita especialmente para você
                        </p>
                    </div>
                </div>
            </main>

            {/* How it Works Section */}
            <section className="bg-surface-white py-20 border-t border-line">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-semibold text-center text-charcoal mb-16">
                        Como Funciona
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-dusty-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl font-bold text-dusty-rose">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal">Escolha o Modelo</h3>
                            <p className="text-slate">
                                Selecione os itens que deseja para compor o enxoval do seu bebê
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-dusty-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl font-bold text-dusty-rose">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal">Personalize</h3>
                            <p className="text-slate">
                                Escolha tecidos premium e bordados feitos à mão com o nome do bebê
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-dusty-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl font-bold text-dusty-rose">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal">Receba em Casa</h3>
                            <p className="text-slate">
                                Seu enxoval exclusivo é confeccionado com carinho e entregue para você
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
