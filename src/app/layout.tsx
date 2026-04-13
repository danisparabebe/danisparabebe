import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { AuthInitializer } from "@/components/auth/auth-initializer";

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
    title: "Danis Para Bebê - Enxovais Personalizados Premium",
    description: "Enxovais personalizados de alto padrão. Feito à mão com amor e exclusividade para o seu bebê.",
    verification: {
        google: "google28ab37d3c9f67d0e",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning className={`${fontFraunces.variable} ${fontDmSans.variable}`}>
            <body className="antialiased">
                {children}
                <AuthInitializer />
                <CartSidebar />
                <Toaster position="top-center" />
                <CookieBanner />
            </body>
        </html>
    );
}
