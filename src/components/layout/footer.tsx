'use client';

import { Button } from '@/components/ui/button';
import { InstagramLogo, FacebookLogo, WhatsappLogo, EnvelopeSimple } from '@phosphor-icons/react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-neutral-white border-t border-neutral-border">
            <div className="max-w-7xl mx-auto px-4 py-16">

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Sobre */}
                    <div>
                        <h4 className="font-fraunces text-lg font-bold text-neutral-text mb-4">
                            Sobre Nós
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-textSub">
                            <li><Link href="/sobre" className="hover:text-primary-brand transition">Nossa História</Link></li>
                            <li><Link href="/como-funciona" className="hover:text-primary-brand transition">Como Funciona</Link></li>
                            <li><Link href="/certificacoes" className="hover:text-primary-brand transition">Certificações</Link></li>
                        </ul>
                    </div>

                    {/* Ajuda */}
                    <div>
                        <h4 className="font-fraunces text-lg font-bold text-neutral-text mb-4">
                            Ajuda
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-textSub">
                            <li><Link href="/faq" className="hover:text-primary-brand transition">Perguntas Frequentes</Link></li>
                            <li><Link href="/envio" className="hover:text-primary-brand transition">Envio e Entrega</Link></li>
                            <li><Link href="/trocas" className="hover:text-primary-brand transition">Trocas e Devolucoes</Link></li>
                            <li><Link href="/contato" className="hover:text-primary-brand transition">Contato</Link></li>
                        </ul>
                    </div>

                    {/* Redes Sociais */}
                    <div>
                        <h4 className="font-fraunces text-lg font-bold text-neutral-text mb-4">
                            Redes Sociais
                        </h4>
                        <div className="flex gap-3">
                            <Button variant="icon" size="icon" className="rounded-full">
                                <InstagramLogo size={20} weight="regular" />
                            </Button>
                            <Button variant="icon" size="icon" className="rounded-full">
                                <FacebookLogo size={20} weight="regular" />
                            </Button>
                            <Button variant="icon" size="icon" className="rounded-full">
                                <WhatsappLogo size={20} weight="regular" />
                            </Button>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-fraunces text-lg font-bold text-neutral-text mb-4">
                            Newsletter
                        </h4>
                        <p className="text-sm text-neutral-textSub mb-4">
                            Receba novidades e 10% OFF na primeira compra
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Seu e-mail"
                                className="flex-1 px-4 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:border-primary-brand"
                            />
                            <Button uppercase={false} size="sm">
                                <EnvelopeSimple size={18} weight="regular" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-neutral-border text-center text-sm text-neutral-textSub">
                    <p>© 2025 Danis Para Bebê. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
