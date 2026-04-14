import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Perguntas Frequentes | Danis Para Bebê',
    description: 'Tire suas dúvidas sobre prazos, produção e materiais dos enxovais Danis Para Bebê.',
};

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-surface-white pt-6 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate hover:text-sage-green transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar para a loja
                </Link>

                <h1 className="text-4xl font-heading font-bold text-charcoal mb-4">Perguntas Frequentes</h1>
                <p className="text-lg text-slate mb-12">
                    Nossa equipe separou respostas para as dúvidas mais comuns.
                </p>

                <div className="space-y-6">
                    {/* Placeholder for future FAQ items */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-line">
                        <p className="text-slate text-center italic">Em breve, adicionaremos todas as perguntas e respostas mais frequentes aqui.</p>
                    </div>
                </div>

                <div className="mt-16 bg-sage-green/5 p-8 rounded-2xl border border-sage-green/20 text-center">
                    <h3 className="font-heading font-bold text-lg text-charcoal mb-2">Ainda com dúvidas?</h3>
                    <p className="text-slate mb-6">Nossa equipe está pronta para te atender com todo o carinho.</p>
                    <a target="_blank" href="https://wa.me/5518997518078" className="inline-block bg-sage-green hover:bg-sage-green-dark text-white font-bold px-8 py-3 rounded-full uppercase tracking-widest text-xs transition-colors shadow-sm">
                        Chamar no WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
