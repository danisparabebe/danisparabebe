import type { Metadata } from "next";
import "./globals.css";
import UtilityBar from "@/components/layout/utility-bar";
import MainHeader from "@/components/layout/main-header";

export const metadata: Metadata = {
    title: "Danis Para Bebê | Enxovais Personalizados",
    description: "Atelier de enxovais personalizados para bebês.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className="antialiased bg-creme text-text">
                <UtilityBar />
                <MainHeader />
                {children}
            </body>
        </html>
    );
}
