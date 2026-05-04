import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer({ simple = false }: { simple?: boolean }) {
    return (
        <footer className="bg-[#F7FAF7] border-t border-line">
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



            {/* Footer Links - Only show if not simple */}
            {!simple && (
                <div className="py-12">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Column 1: About the Store */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Sobre a Loja</h3>
                            <ul className="space-y-3">
                                <li><Link href="/quem-somos" className="text-sm text-slate hover:text-sage-green transition-colors">Quem Somos</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Help */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Central de Ajuda</h3>
                            <ul className="space-y-3">
                                <li><Link href="/conta?aba=pedidos" className="text-sm text-slate hover:text-sage-green transition-colors">Rastreie seu Pedido</Link></li>
                                <li><Link href="/politicas" className="text-sm text-slate hover:text-sage-green transition-colors">Trocas e Devoluções</Link></li>
                                <li><Link href="/politicas" className="text-sm text-slate hover:text-sage-green transition-colors">Prazos de Envio</Link></li>
                                <li><Link href="/perguntas-frequentes" className="text-sm text-slate hover:text-sage-green transition-colors">Perguntas Frequentes</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Contact */}
                        <div>
                            <h3 className="font-heading font-bold text-lg mb-6 text-charcoal">Fale Conosco</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a target="_blank" href="https://wa.me/5518997518078" className="flex items-center gap-3 text-sm text-slate hover:text-[#25D366] transition-colors">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> 
                                        <span>(18) 99751-8078 - WhatsApp</span>
                                    </a>
                                </li>
                                <li>
                                    <a target="_blank" href="https://www.instagram.com/danisparabebe/" className="flex items-center gap-3 text-sm text-slate hover:text-[#bc1888] transition-colors">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.20 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> 
                                        <span>@danisparabebe</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:contato@danisparabebe.com.br" className="flex items-center gap-3 text-sm text-slate hover:text-sage-green transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>contato@danisparabebe.com.br</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Copyright */}
            <div className="border-t border-line py-8">
                <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 text-sm text-slate sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} Danis Para Bebê. CNPJ: 53.193.487/0001-32. Feito com amor no Brasil.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/politicas/privacidade" className="hover:text-sage-green transition-colors">Privacidade</Link>
                        <span className="text-line">•</span>
                        <Link href="/politicas/termos" className="hover:text-sage-green transition-colors">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
