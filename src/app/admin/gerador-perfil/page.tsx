'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, SlidersHorizontal, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const LOGO_OPTIONS = [
    { label: "Símbolo 'D' - Sage Green", value: "/Logos/LOGO PURA VERDE.png" },
    { label: "Símbolo 'D' - Branco", value: "/Logos/LOGO PURA BRANCA.png" },
    { label: "Símbolo 'D' - Rosê", value: "/Logos/LOGO PURA ROSÊ.png" },
    { label: "Símbolo 'D' - Marinho", value: "/Logos/LOGO PURA MARINHO.png" },
    { label: "Texto 'Danis' - Sage Green", value: "/Logos/DANIS VERDE.png" },
    { label: "Texto 'Danis' - Branco", value: "/Logos/DANIS BRANCA.png" },
    { label: "Texto 'Danis' - Rosê", value: "/Logos/DANIS ROSÊ.png" },
    { label: "Texto 'Danis' - Marinho", value: "/Logos/DANIS MARINHO.png" },
    { label: "Logo Completa - Verde", value: "/Logos/Logomarca verde.png" },
    { label: "Logo Completa - Rosê", value: "/Logos/Logomarca Rose.png" },
];

export default function GeradorPerfil() {
    const [scale, setScale] = useState(100);
    const [posX, setPosX] = useState(50);
    const [posY, setPosY] = useState(50);
    const [ringSize, setRingSize] = useState(30);
    const [logoScale, setLogoScale] = useState(180);
    const [logoY, setLogoY] = useState(0);
    
    const [logoType, setLogoType] = useState('/Logos/LOGO PURA VERDE.png');
    const [bgRing, setBgRing] = useState('#ADCEB3'); 
    
    // Faixa inferior
    const [showWhiteBg, setShowWhiteBg] = useState(true);
    const [bandColor, setBandColor] = useState('none'); // 'none' ou hex
    const [bandOpacity, setBandOpacity] = useState(90);  // 0-100 opacidade da faixa
    const [bandBlur, setBandBlur] = useState(30);        // 0-100 desfoque da borda superior
    const [bandHeight, setBandHeight] = useState(35);    // 0-60 altura da faixa em %

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const logoRef = useRef<HTMLImageElement | null>(null);

    // Load Images
    useEffect(() => {
        const img = new window.Image();
        img.src = '/Logos/Foto nova.jpg';
        img.crossOrigin = "anonymous";
        img.onload = () => { imgRef.current = img; draw(); };
    }, []);

    useEffect(() => {
        const lImg = new window.Image();
        lImg.src = logoType;
        lImg.crossOrigin = "anonymous";
        lImg.onload = () => { logoRef.current = lImg; draw(); };
    }, [logoType]);

    // Redraw on interaction
    useEffect(() => {
        draw();
    }, [scale, posX, posY, ringSize, logoScale, logoY, bgRing, showWhiteBg, bandColor, bandOpacity, bandBlur, bandHeight]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imgRef.current || !logoRef.current) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // Limpar
        ctx.clearRect(0, 0, size, size);

        // --- 1. Clipping Mask para foto circular ---
        ctx.save();
        ctx.beginPath();
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = (size / 2) - ringSize;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();

        // --- 2. Desenhar a Foto Principal ---
        const img = imgRef.current;
        const s = scale / 100;
        const cx = (posX / 100);
        const cy = (posY / 100);
        
        // Calcular dimensoes e aspecto
        const imgAspect = img.width / img.height;
        let drawW = size * s;
        let drawH = size * s;
        if (imgAspect > 1) {
            drawW = drawH * imgAspect;
        } else {
            drawH = drawW / imgAspect;
        }

        const dx = centerX - (drawW / 2) + ((cx - 0.5) * size);
        const dy = centerY - (drawH / 2) + ((cy - 0.5) * size);
        
        ctx.fillStyle = '#FDFAF6';
        ctx.fillRect(-size, -size, size*3, size*3);

        ctx.drawImage(img, dx, dy, drawW, drawH);
        
        // --- FAIXA SÓLIDA inferior com opacidade + desfoque na borda de cima ---
        if (bandColor !== 'none') {
            let rgb = '255,255,255';
            if (bandColor === '#ADCEB3') rgb = '173, 206, 179';
            if (bandColor === '#D4A6A6') rgb = '212, 166, 166';
            if (bandColor === '#20283B') rgb = '32, 40, 59';
            if (bandColor === '#FFFFFF') rgb = '255, 255, 255';
            
            const opacity = bandOpacity / 100;          // opacidade da faixa sólida
            const blurFactor = bandBlur / 100;           // quanto desfoque na borda de cima
            const hPct = bandHeight / 100;               // altura da faixa
            
            const bandH = radius * 2 * hPct;             // altura em pixels
            const yBottom = centerY + radius;             // base do círculo
            const ySolid = yBottom - bandH;               // onde a faixa sólida começa
            const blurZone = bandH * blurFactor;          // altura da zona de desfoque
            const yBlurStart = ySolid - blurZone;         // onde o desfoque começa (acima da faixa)
            
            // 1) Zona de desfoque (gradiente: transparente → opacidade da faixa)
            if (blurZone > 0) {
                const grd = ctx.createLinearGradient(0, yBlurStart, 0, ySolid);
                grd.addColorStop(0, `rgba(${rgb}, 0)`);
                grd.addColorStop(1, `rgba(${rgb}, ${opacity})`);
                ctx.fillStyle = grd;
                ctx.fillRect(0, yBlurStart, size, blurZone);
            }
            
            // 2) Faixa sólida (retângulo puro, sem gradiente)
            ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
            ctx.fillRect(0, ySolid, size, bandH);
        }

        ctx.restore(); // Fecha o cliping mask para o anel poder desenhar por cima caso precise

        // --- 3. Desenhar a Borda Colorida (O Anel) ---
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.lineWidth = ringSize * 2; 
        ctx.strokeStyle = bgRing;
        ctx.stroke();

        // --- 4. Desenhar Fundo Branco (Se Ativado) ---
        // A proporção ideal para logos largas como "TEXTO DANIS" é um fundo oval ou sem fundo.
        // A bolinha só fica boa pro "D". Sem fundo é bom para letras.
        const seloRadius = logoScale / 2 + 15;
        const seloY = size - ringSize - 20 - (logoScale / 2) + logoY;
        
        if (showWhiteBg) {
            ctx.beginPath();
            ctx.arc(centerX, seloY, seloRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
        
        // --- 5. Desenhar a Logo por Cima ---
        const logoImg = logoRef.current;
        // Ajusta as dimensoes da logo para nao distorcer, mantendo a proporção.
        const logoAspect = logoImg.width / logoImg.height;
        let logoW = logoScale;
        let logoH = logoScale;
        
        if (logoAspect > 1) { // Imagem larga (Texto "DANIS")
            logoW = logoScale * 1.5; // textos geralmente precisam de mais largura
            logoH = logoW / logoAspect;
        } else {
            logoW = logoH * logoAspect;
        }

        const logoDrawX = centerX - (logoW/2);
        // O seloY aponta pro centro do badge
        const logoDrawY = seloY - (logoH/2);

        ctx.drawImage(logoImg, logoDrawX, logoDrawY, logoW, logoH);
    };

    const baixarImagem = () => {
        if (!canvasRef.current) return;
        const url = canvasRef.current.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Danis_Perfil_Oficial.png';
        a.click();
    };

    return (
        <div className="min-h-screen bg-[#FDFAF6] py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Lado Esquerdo: Ferramentas */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6 border border-sage-green/20 max-h-[90vh] overflow-y-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            <ImageIcon className="text-sage-green" /> Montador VIP
                        </h1>
                        <p className="text-slate/80 text-sm mt-1">
                            Ajuste exatamente como sua foto e o selo vão ficar para exportar em Qualidade Máxima.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* FOTO ADJUSTMENTS */}
                        <div className="p-4 bg-slate/5 rounded-xl space-y-4">
                            <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider">Ajuste da Foto</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-charcoal flex justify-between">Zoom <span>{scale}%</span></label>
                                <input type="range" min="30" max="300" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full accent-sage-green" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-charcoal">Câmera (Esq/Dir)</label>
                                    <input type="range" min="0" max="100" value={posX} onChange={e => setPosX(Number(e.target.value))} className="w-full accent-charcoal" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-charcoal">Câmera (Cima/Baixo)</label>
                                    <input type="range" min="0" max="100" value={posY} onChange={e => setPosY(Number(e.target.value))} className="w-full accent-charcoal" />
                                </div>
                            </div>
                        </div>

                        {/* RING ADJUSTMENTS */}
                        <div className="p-4 bg-slate/5 rounded-xl space-y-4">
                            <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider">Acabamentos</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-charcoal">Borda Redonda (Grossura)</label>
                                <input type="range" min="0" max="120" value={ringSize} onChange={e => setRingSize(Number(e.target.value))} className="w-full accent-sage-green" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-charcoal mb-2 block">Cor da Borda</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setBgRing('#ADCEB3')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bgRing === '#ADCEB3' ? 'bg-sage-green text-charcoal border-sage-green shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Sage Verde</button>
                                    <button onClick={() => setBgRing('#D4A6A6')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bgRing === '#D4A6A6' ? 'bg-[#D4A6A6] text-white border-[#D4A6A6] shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Rosê</button>
                                    <button onClick={() => setBgRing('#20283B')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bgRing === '#20283B' ? 'bg-charcoal text-white border-charcoal shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Marinho</button>
                                    <button onClick={() => setBgRing('#FFFFFF')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bgRing === '#FFFFFF' ? 'bg-white text-charcoal shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Branco</button>
                                </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-black/5">
                                <label className="text-xs font-bold text-charcoal mb-2 block">Faixa Colorida (Atrás do Logo)</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setBandColor('none')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bandColor === 'none' ? 'bg-slate/20 text-charcoal shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Desligado</button>
                                    <button onClick={() => setBandColor('#ADCEB3')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bandColor === '#ADCEB3' ? 'bg-sage-green text-charcoal border-sage-green shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Sage</button>
                                    <button onClick={() => setBandColor('#D4A6A6')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bandColor === '#D4A6A6' ? 'bg-[#D4A6A6] text-white border-[#D4A6A6] shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Rosê</button>
                                    <button onClick={() => setBandColor('#FFFFFF')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bandColor === '#FFFFFF' ? 'bg-charcoal text-white border-charcoal shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Branco</button>
                                    <button onClick={() => setBandColor('#20283B')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${bandColor === '#20283B' ? 'bg-charcoal text-white border-charcoal shadow-inner' : 'bg-white hover:bg-slate/5'}`}>Marinho</button>
                                </div>
                            </div>
                            
                            {bandColor !== 'none' && (
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-charcoal flex justify-between">Altura da Faixa <span>{bandHeight}%</span></label>
                                        <input type="range" min="10" max="60" value={bandHeight} onChange={e => setBandHeight(Number(e.target.value))} className="w-full accent-charcoal" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-charcoal flex justify-between">Opacidade <span>{bandOpacity}%</span></label>
                                        <input type="range" min="0" max="100" value={bandOpacity} onChange={e => setBandOpacity(Number(e.target.value))} className="w-full accent-sage-green" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-charcoal flex justify-between">Desfoque da Borda Superior <span>{bandBlur}%</span></label>
                                        <input type="range" min="0" max="100" value={bandBlur} onChange={e => setBandBlur(Number(e.target.value))} className="w-full accent-sage-green" />
                                        <p className="text-[10px] text-slate">0% = corte reto · 100% = transição suave</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LOGO ADJUSTMENTS */}
                        <div className="p-4 bg-sage-green/10 rounded-xl space-y-4 border border-sage-green/30">
                            <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider">Identidade Visual (Logo)</h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-charcoal">Escolher Versão da Logo</label>
                                <select 
                                    className="w-full rounded-lg border-black/10 text-sm p-2 bg-white"
                                    value={logoType}
                                    onChange={(e) => setLogoType(e.target.value)}
                                >
                                    {LOGO_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <input type="checkbox" id="whiteBg" checked={showWhiteBg} onChange={(e) => setShowWhiteBg(e.target.checked)} className="w-4 h-4 accent-sage-green" />
                                <label htmlFor="whiteBg" className="text-sm font-bold text-charcoal cursor-pointer">Colocar Bola Branca de Fundo na Logo</label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-charcoal">Tamanho da Logo</label>
                                    <input type="range" min="80" max="600" value={logoScale} onChange={e => setLogoScale(Number(e.target.value))} className="w-full accent-charcoal" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-charcoal">Subir/Descer Logo</label>
                                    <input type="range" min="-300" max="300" value={logoY} onChange={e => setLogoY(Number(e.target.value))} className="w-full accent-charcoal" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={baixarImagem}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-charcoal text-white py-4 rounded-xl font-bold hover:bg-black transition-colors transform hover:scale-[1.02] active:scale-95 shadow-2xl"
                    >
                        <Download className="w-5 h-5" />
                        BAIXAR PNG (Fundo Transparente)
                    </button>
                    <p className="text-xs text-center text-slate">Qualidade High-Res gerada direto no seu navegador.</p>
                </div>

                {/* Lado Direito: Preview (Canvas 1080x1080) */}
                <div className="flex items-center justify-center flex-col gap-6 lg:sticky lg:top-12">
                    <div className="relative w-[340px] h-[340px] md:w-[480px] md:h-[480px] lg:w-[500px] lg:h-[500px] rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-transparent p-1 mx-auto flex items-center justify-center">
                        <canvas 
                            ref={canvasRef} 
                            width={1080} 
                            height={1080} 
                            className="w-full h-full object-contain drop-shadow-md"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
