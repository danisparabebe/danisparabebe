import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { Mail, Instagram, MessageCircle } from "lucide-react";
import { PrintButton } from "./print-button";

interface CatalogoProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoProps) {
    const params = await searchParams;
    const rawGender = params.gender;
    const gender = rawGender === "menina" ? "Meninas" : "Meninos";
    const title = gender === "Meninas" ? "Coleção Meninas" : "Coleção Meninos";

    const baseDir = path.join(process.cwd(), "Catálogo", gender);
    let images: string[] = [];

    try {
        if (fs.existsSync(baseDir)) {
            const files = await fs.promises.readdir(baseDir);
            images = files.filter(f => {
                const ext = path.extname(f).toLowerCase();
                return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
            });
            // Sort to ensure consistent order
            images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        }
    } catch (e) {
        console.error("Failed to read images", e);
    }

    // Determine branding color
    const themeColor = gender === "Meninas" ? "bg-dusty-rose" : "bg-sage-green";
    const themeTextColor = gender === "Meninas" ? "text-dusty-rose" : "text-sage-green";
    const themeGradient = gender === "Meninas"
        ? "from-dusty-rose/20 to-dusty-rose/5"
        : "from-sage-green/20 to-sage-green/5";
    const brandPatternColor = gender === "Meninas" ? "rgba(214,166,166,0.15)" : "rgba(174,206,179,0.15)";

    // Use specific "logomarca" for the Cover, and "logo" for the watermark
    const coverLogoSrc = gender === "Meninas"
        ? `/api/local-image?path=${encodeURIComponent("Logos/Logomarca Rose.png")}`
        : `/api/local-image?path=${encodeURIComponent("Logos/Logomarca verde.png")}`;

    const watermarkLogoSrc = gender === "Meninas"
        ? `/api/local-image?path=${encodeURIComponent("Logos/logo simples rose.png")}`
        : `/api/local-image?path=${encodeURIComponent("Logos/logo simples verde.png")}`;

    return (
        <div id="catalogo-root" className="min-h-screen bg-warm-stone font-dmSans text-charcoal">
            {/* Global Print Styles just for this page */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: portrait;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    /* Ensure backgrounds and images inside absolutely positioned elements are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Hides cart sidebar and other absolute UI elements from root layout */
                    nav, header, footer, [role="navigation"], [data-radix-popper-content-wrapper], #sonner-toaster {
                        display: none !important;
                    }
                    .print-hide {
                        display: none !important;
                    }
                    /* Chromium PDF generator chokes on backdrop-filter and renders elements completely blank. We must reset it for print. */
                    .glass-card {
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                        background: rgba(255, 255, 255, 0.95) !important;
                        box-shadow: none !important;
                        border: 1px solid rgba(0,0,0,0.05) !important;
                    }
                    /* Heavy CSS filters (like 100px blur radii) on full-page elements cause the Chrome Print Spooler to freeze for minutes. */
                    .blur-\\[80px\\], .blur-\\[100px\\] {
                        filter: none !important;
                        opacity: 0.03 !important; /* Keep a faint shape so the background isn't entirely bare, but don't crash the spooler */
                    }
                }
                
                
                
                .bg-luxury-texture {
                    background-color: #fafaf9;
                    background-image: 
                        linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%),
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.65);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
                }
            `}} />

            {/* Admin Header (Hidden in Print) */}
            <div className="print-hide sticky top-0 z-50 flex items-center justify-between bg-white border-b border-border px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-fraunces font-bold text-charcoal">Gerador de Catálogo PDF</h1>
                    <div className="flex bg-gray-100 rounded-full p-1 border border-border">
                        <Link
                            href="?gender=menino"
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${gender === "Meninos" ? "bg-white text-sage-green shadow-sm" : "text-slate hover:text-charcoal"}`}
                        >
                            Meninos
                        </Link>
                        <Link
                            href="?gender=menina"
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${gender === "Meninas" ? "bg-white text-dusty-rose shadow-sm" : "text-slate hover:text-charcoal"}`}
                        >
                            Meninas
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-sm text-slate">{images.length} fotos carregadas</p>
                    <PrintButton />
                </div>
            </div>

            {/* CATALOG CONTENT */}
            <div className="w-full max-w-[500px] mx-auto bg-white print:max-w-none print:w-full">

                {/* 1. COVER PAGE */}
                <div className="relative w-full h-[100svh] print:h-[100vh] flex flex-col justify-between items-center overflow-hidden page-break-after bg-luxury-texture">
                    {/* Background Elements - Extremely delicate */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${themeGradient} opacity-80 z-0`}></div>

                    {/* Soft watercolor-like glowing orbs */}
                    <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full ${themeColor} opacity-[0.15] blur-[80px] z-0 -translate-x-1/2 -translate-y-1/2`}></div>
                    <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full ${themeColor} opacity-[0.12] blur-[100px] z-0 translate-x-1/3 translate-y-1/3`}></div>
                    <div className={`absolute top-1/2 left-1/2 w-[800px] h-[300px] rounded-full ${themeColor} opacity-[0.08] blur-[100px] z-0 -translate-x-1/2 -translate-y-1/2 rotate-45`}></div>

                    <div className="relative z-10 flex flex-col items-center flex-1 w-full pt-[20vh] px-8">
                        <div className="w-64 h-64 relative mb-12">
                            <img src={coverLogoSrc} alt="Danis Para Bebê" className="object-contain w-full h-full drop-shadow-sm" />
                        </div>

                        <div className="text-center space-y-5">
                            <h1 className="font-fraunces text-3xl sm:text-4xl text-charcoal/80 tracking-widest uppercase">
                                CATÁLOGO
                            </h1>
                            <h2 className={`font-fraunces text-4xl sm:text-5xl ${themeTextColor} tracking-tight`}>
                                {title}
                            </h2>
                            <div className="w-16 h-[1px] bg-charcoal/30 mx-auto mt-8 mb-8"></div>
                            <p className="text-lg text-slate text-center max-w-[300px] font-fraunces italic leading-relaxed mx-auto">
                                "O mais puro capricho em formato de enxoval para o seu bebê."
                            </p>
                        </div>
                    </div>

                    {/* Footer Cover / Contacts */}
                    <div className="relative z-10 w-full bg-white/80 backdrop-blur-md pb-12 pt-8 px-8 border-t border-white/50 shadow-[0_-10px_40px_-5px_flex]">
                        <div className="space-y-4 max-w-sm mx-auto">
                            <a href="https://wa.me/5518997518078" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-3.5 rounded-full font-medium hover:bg-[#20bd5a] transition-colors shadow-soft">
                                <MessageCircle size={20} />
                                <span>(18) 99751-8078</span>
                            </a>
                            <a href="https://www.instagram.com/danisparabebe/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-charcoal text-white py-3.5 rounded-full font-medium hover:bg-black transition-colors shadow-soft">
                                <Instagram size={20} />
                                <span>@danisparabebe</span>
                            </a>
                            <a href="mailto:danisparabebe@gmail.com" target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-3 w-full ${themeColor} text-white py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity shadow-soft`}>
                                <Mail size={20} />
                                <span>danisparabebe@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 2. PRODUCT PAGES */}
                {images.length === 0 ? (
                    <div className="p-8 text-center text-slate">
                        Nenhuma imagem encontrada na pasta <code className="text-charcoal">Catálogo/{gender}/</code>.
                    </div>
                ) : (
                    images.map((image, index) => (
                        <div key={index} className="relative w-full h-[100svh] print:h-[100vh] flex flex-col justify-center items-center overflow-hidden page-break-after bg-luxury-texture">

                            {/* Product Background - Delicate and airy */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${themeGradient} opacity-60 z-0`}></div>
                            <div className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full ${themeColor} opacity-[0.1] blur-[80px] z-0`}></div>
                            <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full ${themeColor} opacity-[0.12] blur-[80px] z-0`}></div>

                            {/* Product Image Container */}
                            <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center py-12 px-8">
                                {/* The actual image, using exact dimensions with object-contain to never zoom forcefully */}
                                <div className="relative w-full h-full max-h-[80vh] rounded-[2rem] overflow-hidden glass-card p-2">
                                    <img
                                        src={`/api/local-image?path=${encodeURIComponent(`Catálogo/${gender}/${image}`)}`}
                                        alt={`Produto ${index + 1}`}
                                        className="w-full h-full object-contain"
                                        loading="eager"
                                        decoding="sync"
                                    />
                                </div>
                            </div>

                            {/* Watermark (Bottom Right) */}
                            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3 glass-card px-5 py-3 rounded-full shadow-soft border border-white/60">
                                <img src={watermarkLogoSrc} alt="Logo" className="w-[24px] h-[24px] object-contain" />
                                <div className="w-px h-5 bg-charcoal/15"></div>
                                <span className="font-fraunces tracking-wide text-[15px] text-charcoal/80">@danisparabebe</span>
                            </div>

                            {/* Page Indicator (Visible in print) */}
                            <div className="absolute bottom-8 left-8 z-20">
                                <span className="glass-card text-charcoal/60 font-dmSans text-[13px] font-medium px-4 py-2 rounded-full shadow-soft border border-white/60">
                                    Página {index + 1}
                                </span>
                            </div>
                        </div>
                    ))
                )}

            </div>
            {/* Some CSS rules to break pages correctly for printing */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .page-break-after {
                    page-break-after: always;
                    break-after: page;
                }
            `}} />
        </div>
    );
}
