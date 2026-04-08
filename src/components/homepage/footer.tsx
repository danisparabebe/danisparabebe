import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer({ simple = false }: { simple?: boolean }) {
    return (
        <footer className="bg-warm-stone border-t border-line">
            {/* USPs */}
            <div className="border-b border-line py-4">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center sm:gap-12 md:gap-24">
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-5 w-5 text-sage-green-dark" />
                        <span>Frete grátis acima de R$ 350 (SP, MG, RJ, PR, RS, GO e DF)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-5 w-5 text-sage-green-dark" />
                        <span>5% de desconto no PIX</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-5 w-5 text-sage-green-dark" />
                        <span>Produção artesanal em até 12 dias úteis</span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="border-b border-line py-6">
                <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-6 px-4">
                    <span className="text-sm font-medium">Formas de Pagamento:</span>
                    <div className="flex flex-wrap items-center gap-4">
                        {['Visa', 'Mastercard', 'Elo', 'PIX', 'Boleto'].map((method) => (
                            <div key={method} className="rounded border border-line bg-white px-3 py-1 text-xs">
                                {method}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Links - Only show if not simple */}
            {!simple && (
                <div className="py-12">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Column 1: About the Store */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Sobre a Loja</h3>
                            <ul className="space-y-3">
                                <li><Link href="/quem-somos" className="text-sm text-slate hover:text-dusty-rose transition-colors">Quem Somos</Link></li>
                                <li><Link href="/quem-somos" className="text-sm text-slate hover:text-dusty-rose transition-colors">Nossos Tecidos e Fios</Link></li>
                                <li><Link href="/quem-somos" className="text-sm text-slate hover:text-dusty-rose transition-colors">Sustentabilidade</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Categories */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Nossos Kits</h3>
                            <ul className="space-y-3">
                                <li><Link href="/monte-seu-kit" className="text-sm text-slate hover:text-dusty-rose transition-colors">Monte seu Kit</Link></li>
                                <li><Link href="/" className="text-sm text-slate hover:text-dusty-rose transition-colors">Kits Prontos</Link></li>
                                <li><Link href="/" className="text-sm text-slate hover:text-dusty-rose transition-colors">Presentes Maternidade</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Help */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Central de Ajuda</h3>
                            <ul className="space-y-3">
                                <li><Link href="/politicas" className="text-sm text-slate hover:text-dusty-rose transition-colors">Rastreie seu Pedido</Link></li>
                                <li><Link href="/politicas" className="text-sm text-slate hover:text-dusty-rose transition-colors">Trocas e Devoluções</Link></li>
                                <li><Link href="/politicas" className="text-sm text-slate hover:text-dusty-rose transition-colors">Prazos de Envio</Link></li>
                                <li><Link href="/politicas" className="text-sm text-slate hover:text-dusty-rose transition-colors">Perguntas Frequentes</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Social Media & Contact */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Fale Conosco</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm text-slate hover:text-dusty-rose transition-colors">WhatsApp: (11) 9999-9999</a></li>
                                <li><a href="#" className="text-sm text-slate hover:text-dusty-rose transition-colors">contato@danisparabebe.com</a></li>
                                <li className="pt-2 flex gap-4">
                                    <a href="#" className="text-sm text-slate hover:text-dusty-rose transition-colors">Instagram</a>
                                    <a href="#" className="text-sm text-slate hover:text-dusty-rose transition-colors">Pinterest</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Copyright */}
            <div className="border-t border-line py-8">
                <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 text-sm text-slate sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} Danis Para Bebê. CNPJ: 00.000.000/0001-00. Feito com amor no Brasil.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/politicas" className="hover:text-dusty-rose transition-colors">Privacidade</Link>
                        <span className="text-line">•</span>
                        <Link href="/politicas" className="hover:text-dusty-rose transition-colors">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
