import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-warm-stone border-t border-line">
            {/* USPs */}
            <div className="border-b border-line py-4">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center sm:gap-12 md:gap-24">
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-5 w-5 text-dusty-rose" />
                        <span>Frete grátis acima de R$ 200</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-5 w-5 text-dusty-rose" />
                        <span>Entrega em até 10 dias após a compra</span>
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

            {/* Footer Links */}
            <div className="py-8">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
                    <div>
                        <h4 className="mb-4 font-semibold text-charcoal">Institucional</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/sobre" className="hover:text-dusty-rose">Sobre Nós</Link></li>
                            <li><Link href="/contato" className="hover:text-dusty-rose">Contato</Link></li>
                            <li><Link href="/lojas" className="hover:text-dusty-rose">Nossas Lojas</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-charcoal">Atendimento</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/faq" className="hover:text-dusty-rose">FAQ</Link></li>
                            <li><Link href="/entrega" className="hover:text-dusty-rose">Entrega</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-charcoal">Categorias</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/roupas" className="hover:text-dusty-rose">Roupas</Link></li>
                            <li><Link href="/sapatos" className="hover:text-dusty-rose">Sapatos</Link></li>
                            <li><Link href="/enxovais" className="hover:text-dusty-rose">Enxovais</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-charcoal">Siga-nos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-dusty-rose">Instagram</Link></li>
                            <li><Link href="#" className="hover:text-dusty-rose">Facebook</Link></li>
                            <li><Link href="#" className="hover:text-dusty-rose">Pinterest</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-line py-4">
                <p className="text-center text-xs text-slate">
                    © {new Date().getFullYear()} Danis Para Bebê. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
