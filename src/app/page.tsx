import HeroSection from '@/components/hero-section';
import LifestyleSection from '@/components/lifestyle-section';
import ProductGallery from '@/components/product-gallery';
import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            <HeroSection />
            <LifestyleSection />
            <ProductGallery />

            {/* Minimalist Footer - Trousseau Style */}
            <footer className="bg-white py-20 px-6 border-t border-gray-100">
                <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <h4 className="text-sm uppercase tracking-widest font-nunito font-bold text-text">Sobre</h4>
                        <ul className="space-y-3 text-xs uppercase tracking-wider text-subtle font-nunito">
                            <li><Link href="#" className="hover:text-text transition-colors">A Marca</Link></li>
                            <li><Link href="#" className="hover:text-text transition-colors">Lojas</Link></li>
                            <li><Link href="#" className="hover:text-text transition-colors">Trabalhe Conosco</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm uppercase tracking-widest font-nunito font-bold text-text">Ajuda</h4>
                        <ul className="space-y-3 text-xs uppercase tracking-wider text-subtle font-nunito">
                            <li><Link href="#" className="hover:text-text transition-colors">Fale Conosco</Link></li>
                            <li><Link href="#" className="hover:text-text transition-colors">Entregas</Link></li>
                            <li><Link href="#" className="hover:text-text transition-colors">Trocas e Devoluções</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6 md:col-span-2 text-center md:text-right">
                        <h3 className="text-2xl font-playfair text-text mb-4">TROUSSEAU</h3>
                        <p className="text-xs text-subtle font-nunito uppercase tracking-widest">
                            Cadastre-se para receber novidades
                        </p>
                        {/* Newsletter Input Placeholder */}
                        <div className="flex border-b border-gray-300 max-w-xs ml-auto mt-4">
                            <input type="email" placeholder="SEU E-MAIL" className="w-full py-2 bg-transparent text-xs outline-none placeholder:text-gray-400 font-nunito uppercase" />
                            <button className="text-xs uppercase font-bold text-text">Enviar</button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-gray-50 text-center text-[10px] uppercase tracking-widest text-gray-400 font-nunito">
                    © 2024 Danis Para Bebê. Todos os direitos reservados.
                </div>
            </footer>
        </main>
    );
}
