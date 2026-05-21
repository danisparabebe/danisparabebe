import Image from "next/image";
import { Instagram } from "lucide-react";
import type { Metadata } from "next";
import catalogManifest from "@/data/catalog-manifest.json";

interface CatalogoProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: CatalogoProps): Promise<Metadata> {
    const params = await searchParams;
    const rawGender = params.gender;
    const gender = rawGender === "menina" ? "Meninas" : "Meninos";
    const title = gender === "Meninas" ? "Coleção Meninas" : "Coleção Meninos";

    return {
        title: `Danis Para Bebê · ${title}`,
        description: `Conheça nossa ${title}. O mais puro capricho em formato de enxoval para o seu bebê. Bordados personalizados com o nome do seu bebê.`,
        openGraph: {
            title: `Danis Para Bebê · ${title}`,
            description: `Conheça nossa ${title}. Bordados personalizados com o nome do seu bebê.`,
            type: "website",
        },
    };
}

export default async function CatalogoPublicoPage({ searchParams }: CatalogoProps) {
    const params = await searchParams;
    const rawGender = params.gender;
    const gender = rawGender === "menina" ? "Meninas" : "Meninos";
    const title = gender === "Meninas" ? "Coleção Meninas" : "Coleção Meninos";

    // Read from pre-generated manifest instead of filesystem
    const images: string[] = gender === "Meninas"
        ? catalogManifest.Meninas
        : catalogManifest.Meninos;

    // Determine branding color
    const themeColor = gender === "Meninas" ? "bg-dusty-rose" : "bg-sage-green";
    const themeTextColor = gender === "Meninas" ? "text-dusty-rose" : "text-sage-green";
    const themeGradient = gender === "Meninas"
        ? "from-dusty-rose/20 to-dusty-rose/5"
        : "from-sage-green/20 to-sage-green/5";

    const coverLogoSrc = gender === "Meninas"
        ? `/Logos/DANIS ROSÊ.png`
        : `/Logos/DANIS VERDE.png`;

    const watermarkLogoSrc = gender === "Meninas"
        ? `/Logos/logo simples rose.png`
        : `/Logos/logo simples verde.png`;

    return (
        <div className="min-h-screen bg-warm-stone font-dmSans text-charcoal">
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Hide the site's global navigation, header, footer, cart sidebar */
                nav, header, footer, [role="navigation"], [data-radix-popper-content-wrapper], #sonner-toaster {
                    display: none !important;
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

            {/* CATALOG CONTENT */}
            <div className="w-full max-w-[500px] mx-auto bg-white">

                {/* 1. COVER PAGE */}
                <div className="relative w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-white">
                    
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-8 pt-20">
                        <div className="w-80 h-80 relative mb-16">
                            <img src={coverLogoSrc} alt="Danis Para Bebê" className="object-contain w-full h-full" />
                        </div>

                        <div className="text-center space-y-6">
                            <h1 className="font-fraunces text-3xl sm:text-4xl text-charcoal/80 tracking-[0.3em] uppercase">
                                CATÁLOGO
                            </h1>
                            <h2 className={`font-fraunces text-5xl sm:text-6xl ${themeTextColor} tracking-tight`}>
                                {title}
                            </h2>
                            <div className="w-20 h-[1px] bg-charcoal/20 mx-auto mt-10 mb-10"></div>
                            <p className="text-xl text-slate font-fraunces italic leading-relaxed max-w-[350px] mx-auto">
                                &quot;O mais puro capricho em formato de enxoval para o seu bebê.&quot;
                            </p>
                        </div>
                    </div>

                    {/* Minimalist Contact Info */}
                    <div className="relative z-10 w-full pb-12 pt-8">
                        <div className="flex items-center justify-center gap-8 font-dmSans text-charcoal/80 text-sm tracking-wide">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className={themeTextColor}>
                                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                                <span>(18) 99751-8078</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-charcoal/20"></div>
                            <div className="flex items-center gap-2">
                                <Instagram size={18} className={themeTextColor} />
                                <span>@danisparabebe</span>
                            </div>
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
                        <div key={index} className="relative w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-luxury-texture">

                            {/* Product Background - Delicate and airy */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${themeGradient} opacity-60 z-0`}></div>
                            <div className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full ${themeColor} opacity-[0.1] blur-[80px] z-0`}></div>
                            <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full ${themeColor} opacity-[0.12] blur-[80px] z-0`}></div>

                            {/* Product Image Container — served directly from public/ via CDN */}
                            <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center py-12 px-8">
                                <div className="relative w-full h-full max-h-[80vh] rounded-[2rem] overflow-hidden glass-card p-2 flex items-center justify-center">
                                    <Image
                                        src={`/Catálogo/${gender}/${image}`}
                                        alt={`Produto ${index + 1}`}
                                        fill
                                        quality={75}
                                        sizes="500px"
                                        className="object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            {/* Watermark (Bottom Right) */}
                            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3 glass-card px-5 py-3 rounded-full shadow-soft border border-white/60">
                                <img src={watermarkLogoSrc} alt="Logo" className="w-[24px] h-[24px] object-contain" />
                                <div className="w-px h-5 bg-charcoal/15"></div>
                                <span className="font-fraunces tracking-wide text-[15px] text-charcoal/80">@danisparabebe</span>
                            </div>

                            {/* Page Indicator */}
                            <div className="absolute bottom-8 left-8 z-20">
                                <span className="glass-card text-charcoal/60 font-dmSans text-[13px] font-medium px-4 py-2 rounded-full shadow-soft border border-white/60">
                                    {index + 1} / {images.length}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {/* 3. BACK COVER / CTA */}
                <div className="relative w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-white">
                    <div className="text-center space-y-8 px-8">
                        <div className="w-40 h-40 relative mx-auto mb-8">
                            <img src={coverLogoSrc} alt="Danis Para Bebê" className="object-contain w-full h-full" />
                        </div>
                        <p className="text-xl text-charcoal/70 font-fraunces italic leading-relaxed max-w-[350px] mx-auto">
                            Gostou de algum modelo?
                        </p>
                        <a
                            href="https://wa.me/5518997518078?text=Ol%C3%A1!%20Vi%20o%20cat%C3%A1logo%20e%20gostei%20de%20um%20modelo!"
                            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#20bd5a] transition-colors shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                            </svg>
                            Fale Conosco no WhatsApp
                        </a>
                        <div className="flex items-center justify-center gap-2 text-charcoal/50 text-sm mt-6">
                            <Instagram size={16} />
                            <span>@danisparabebe</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
