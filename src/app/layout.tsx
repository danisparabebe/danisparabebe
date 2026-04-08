import type { Metadata } from "next";
import "./globals.css";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/ui/cookie-banner";

export const metadata: Metadata = {
    title: "Danis Para Bebê - Enxovais Personalizados Premium",
    description: "Enxovais personalizados de alto padrão. Feito à mão com amor e exclusividade para o seu bebê.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className="antialiased">
                {children}
                <CartSidebar />
                <Toaster position="top-center" />
                <CookieBanner />
            </body>
        </html>
    );
}
