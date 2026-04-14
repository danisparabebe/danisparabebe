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



            {/* Footer Links - Only show if not simple */}
            {!simple && (
                <div className="py-12">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                    <a target="_blank" href="https://wa.me/5518997518078" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-bold shadow-sm hover:scale-105 transition-transform">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.393.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/></svg> 
                                        Chamar no WhatsApp
                                    </a>
                                </li>
                                <li>
                                    <a target="_blank" href="https://www.instagram.com/danisparabebe/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-sm font-bold shadow-sm hover:scale-105 transition-transform">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.20 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> 
                                        Nosso Instagram
                                    </a>
                                </li>
                                <li><a href="mailto:contato@danisparabebe.com" className="text-sm text-slate hover:text-sage-green transition-colors mt-2 block">contato@danisparabebe.com</a></li>
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
                        <Link href="/politicas/privacidade" className="hover:text-sage-green transition-colors">Privacidade</Link>
                        <span className="text-line">•</span>
                        <Link href="/politicas/termos" className="hover:text-sage-green transition-colors">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
