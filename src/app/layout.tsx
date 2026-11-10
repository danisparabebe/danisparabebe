import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity";

const fontFraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
});

const fontDmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://danisparabebe.com.br"),
    title: "Dani's Para Bebê - Enxovais Personalizados Premium",
    description: "Enxovais personalizados de alto padrão. Peças 100% algodão bordadas artesanalmente com o nome do seu bebê.",
    verification: {
        google: "google28ab37d3c9f67d0e",
        other: {
            "facebook-domain-verification": "yucv64e1adxb039fkf7a13gaxi4j8q",
        },
    },
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "https://danisparabebe.com.br",
        siteName: "Dani's Para Bebê",
        title: "Dani's Para Bebê - Enxovais Personalizados Premium",
        description: "Enxovais de bebê bordados com exclusividade. 100% algodão, maciez e sofisticação para o seu pequeno.",
        images: [
            {
                url: "/produtos/conferidos/MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01.jpeg",
                width: 800,
                height: 800,
                alt: "Dani's Para Bebê - Enxovais Bordados Personalizados",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Dani's Para Bebê - Enxovais Personalizados Premium",
        description: "Enxovais de bebê bordados com exclusividade. Peças 100% algodão feitas com amor.",
        images: ["/produtos/conferidos/MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01.jpeg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning className={`${fontFraunces.variable} ${fontDmSans.variable}`}>
            <head>
                <meta name="facebook-domain-verification" content="yucv64e1adxb039fkf7a13gaxi4j8q" />
                <script
                    type="text/javascript"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(c,l,a,r,i,t,y){
                                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                            })(window, document, "clarity", "script", "yx95m224xe");
                        `,
                    }}
                />
            </head>
            <body className="antialiased">
                {children}
                <MicrosoftClarity />
                <AuthInitializer />
                <CartSidebar />
                <Toaster position="top-center" />
                <CookieBanner />
                <WhatsAppButton />
            </body>
        </html>
    );
}
