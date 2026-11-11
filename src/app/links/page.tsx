import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Sparkles, 
    MessageCircle, 
    ShoppingBag, 
    ChevronRight, 
    ShieldCheck, 
    Heart, 
    Instagram,
    Truck
} from 'lucide-react';
import { CatalogoButton } from './catalogo-button';

export const metadata: Metadata = {
    title: "Links Oficiais | Dani's Para Bebê",
    description: "Acesse nossos canais oficiais, conheça nossa loja online, monte seu enxoval personalizado ou fale direto com a Dani no WhatsApp.",
    openGraph: {
        title: "Dani's Para Bebê | Links Oficiais",
        description: "Enxovais de bebê bordados com carinho e exclusividade. Acesse nossos canais oficiais.",
        url: "https://danisparabebe.com.br/links",
        siteName: "Dani's Para Bebê",
        images: [
            {
                url: "https://danisparabebe.com.br/Logos/DANIS%20VERDE.png",
                width: 500,
                height: 500,
                alt: "Dani's Para Bebê - Logo Oficial",
            },
        ],
        locale: "pt_BR",
        type: "website",
    },
};

const WHATSAPP_PHONE = '5518997518078';
const WHATSAPP_MSG = 'Olá Dani! Vim pelo Instagram e gostaria de tirar uma dúvida sobre os enxovais personalizados 💕';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

interface LinkItem {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    badge?: string;
    badgeColor?: string;
    icon: any;
    iconBg: string;
    isExternal?: boolean;
    isPrimary?: boolean;
}

const LINKS: LinkItem[] = [
    {
        id: 'loja',
        title: 'Conhecer a Loja Online',
        subtitle: 'Enxovais bordados, toalhas, mantas e bodies',
        href: '/',
        badge: 'Loja Oficial',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: ShoppingBag,
        iconBg: 'bg-[#245E3B] text-white',
    },
    {
        id: 'whatsapp',
        title: 'Falar com a Dani no WhatsApp',
        subtitle: 'Atendimento direto, carinhoso e tire qualquer dúvida',
        href: WHATSAPP_URL,
        badge: 'Online Agora',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: MessageCircle,
        iconBg: 'bg-[#25D366] text-white',
        isExternal: true,
    },
    {
        id: 'monte-seu-kit',
        title: 'Monte seu Enxoval Personalizado',
        subtitle: 'Escolha temas, cores e o nome bordado em cada peça',
        href: '/monte-seu-kit',
        badge: 'O Mais Amado',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: Sparkles,
        iconBg: 'bg-emerald-600 text-white',
        isPrimary: true,
    },
];

export default function LinksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] via-[#f7f4ee] to-[#f0ece1] flex flex-col items-center justify-between px-4 py-8 sm:py-12 text-[#1f2937] selection:bg-[#ADCEB3]/40">
            
            {/* Top Container */}
            <main className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
                
                {/* Profile Header */}
                <header className="flex flex-col items-center text-center space-y-3 pt-2">
                    
                    {/* Avatar with Real Green Logo */}
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-[#ADCEB3] to-[#245E3B] opacity-60 blur-xs transition-opacity group-hover:opacity-80" />
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center p-3">
                            <Image
                                src="/Logos/DANIS VERDE.png"
                                alt="Dani's Para Bebê"
                                width={100}
                                height={100}
                                priority
                                sizes="(max-width: 640px) 96px, 112px"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Brand Name & Handle */}
                    <div className="space-y-1">
                        <h1 className="font-fraunces font-bold text-2xl sm:text-3xl text-charcoal flex items-center justify-center gap-1.5 leading-tight">
                            Dani's Para Bebê
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#245E3B] text-white text-[11px]" title="Loja Oficial">
                                ✓
                            </span>
                        </h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            @danisparabebe
                        </p>
                    </div>

                    {/* Bio Description */}
                    <p className="text-xs sm:text-sm text-slate-600 max-w-xs leading-relaxed font-medium">
                        Enxovais de bebê bordados com carinho e exclusividade 🌿<br />
                        <span className="text-[11px] text-slate-500">100% Algodão • Feito à Mão • Enviamos para todo o Brasil</span>
                    </p>

                    {/* Quick highlights pill */}
                    <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                            <Truck className="w-3 h-3 text-emerald-600" /> Frete Grátis acima de R$ 250
                        </span>
                    </div>
                </header>

                {/* Links Stack */}
                <div className="w-full space-y-3 pt-2">
                    {LINKS.map((link) => {
                        const Icon = link.icon;
                        const isExternal = link.isExternal;

                        return (
                            <Link
                                key={link.id}
                                href={link.href}
                                target={isExternal ? '_blank' : undefined}
                                rel={isExternal ? 'noopener noreferrer' : undefined}
                                className={`
                                    group relative w-full flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl transition-all duration-200
                                    border-2 text-left shadow-xs hover:shadow-md active:scale-[0.98]
                                    ${link.isPrimary
                                        ? 'bg-white border-emerald-500/40 hover:border-emerald-600 ring-2 ring-emerald-500/10'
                                        : 'bg-white border-black/5 hover:border-black/15'
                                    }
                                `}
                            >
                                {/* Left Icon Badge */}
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${link.iconBg}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Texts */}
                                <div className="flex-1 min-w-0 pr-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h2 className="font-bold text-sm sm:text-base text-charcoal group-hover:text-black leading-snug truncate">
                                            {link.title}
                                        </h2>
                                        {link.badge && (
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${link.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {link.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-slate-500 leading-tight line-clamp-1">
                                        {link.subtitle}
                                    </p>
                                </div>

                                {/* Right Arrow */}
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-charcoal group-hover:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                        );
                    })}

                    {/* Catálogo com seletor Meninos/Meninas */}
                    <CatalogoButton />
                </div>

                {/* Trust Badges */}
                <div className="w-full pt-4 border-t border-black/5 flex items-center justify-center gap-4 text-slate-500 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Pagamento Seguro InfinitePay</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                        <span>Feito com Amor</span>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full max-w-md mx-auto pt-8 pb-4 text-center space-y-2">
                <Link
                    href="https://instagram.com/danisparabebe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-charcoal transition-colors"
                >
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span>Siga-nos no Instagram</span>
                </Link>
                <p className="text-[10px] text-slate-400">
                    © {new Date().getFullYear()} Dani's Para Bebê • danisparabebe.com.br
                </p>
            </footer>

        </div>
    );
}
