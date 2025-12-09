import type { Metadata } from "next";
import "./globals.css";
import { CartSidebar } from "@/components/cart/cart-sidebar";

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
        <html lang="pt-BR">
            <body className="antialiased">
                {children}
                <CartSidebar />
            </body>
        </html>
    );
}
