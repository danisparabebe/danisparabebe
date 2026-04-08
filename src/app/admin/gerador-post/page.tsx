'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, LayoutGrid, Upload, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

const THEMES = [
    { name: 'Sage', bg: '#ADCEB3', text: '#20283B', accent: '#FDFAF6', dotColor: 'rgba(255,255,255,0.08)' },
    { name: 'Charcoal', bg: '#20283B', text: '#FDFAF6', accent: '#ADCEB3', dotColor: 'rgba(255,255,255,0.04)' },
    { name: 'Stone', bg: '#FDFAF6', text: '#20283B', accent: '#ADCEB3', dotColor: 'rgba(173,206,179,0.12)' },
    { name: 'Rosê', bg: '#D4A6A6', text: '#20283B', accent: '#FDFAF6', dotColor: 'rgba(255,255,255,0.08)' },
];

const LOGO_OPTIONS = [
    { label: "D - Branco", value: "/Logos/LOGO PURA BRANCA.png" },
    { label: "D - Verde", value: "/Logos/LOGO PURA VERDE.png" },
    { label: "D - Rosê", value: "/Logos/LOGO PURA ROSÊ.png" },
    { label: "D - Marinho", value: "/Logos/LOGO PURA MARINHO.png" },
    { label: "Danis - Branco", value: "/Logos/DANIS BRANCA.png" },
    { label: "Danis - Verde", value: "/Logos/DANIS VERDE.png" },
    { label: "Danis - Rosê", value: "/Logos/DANIS ROSÊ.png" },
    { label: "Danis - Marinho", value: "/Logos/DANIS MARINHO.png" },
    { label: "Completa - Verde", value: "/Logos/Logomarca verde.png" },
    { label: "Completa - Rosê", value: "/Logos/Logomarca Rose.png" },
];

interface Layer {
    id: string;
    name: string;
    type: 'photo' | 'logo';
    src: string;
    img: HTMLImageElement | null;
    opacity: number;
    x: number;
    y: number;
    size: number;
    visible: boolean;
}

let layerCounter = 0;

export default function GeradorPost() {
    const [theme, setTheme] = useState(0);
    const [layers, setLayers] = useState<Layer[]>([
        { id: 'wm', name: 'Marca d\'água', type: 'logo', src: '/Logos/LOGO PURA BRANCA.png', img: null, opacity: 6, x: 50, y: 50, size: 500, visible: true },
        { id: 'footer', name: 'Logo Rodapé', type: 'logo', src: '/Logos/DANIS BRANCA.png', img: null, opacity: 35, x: 50, y: 90, size: 45, visible: true },
    ]);
    const [selectedLayer, setSelectedLayer] = useState<string | null>('wm');

    const [titleText, setTitleText] = useState('Novidade\na caminho! ✨');
    const [bodyText, setBodyText] = useState('Estamos repaginando\nnosso visual para combinar\ncom algo especial que\nestá chegando 👀');
    const [footerText, setFooterText] = useState('Novas cores. Mesma essência.\nMesmo amor. Mesmo carinho.');
    const [ctaText, setCtaText] = useState('Fique de olho! 💚');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        layers.forEach((layer, idx) => {
            if (layer.src && !layer.img) {
                const img = new window.Image();
                img.src = layer.src;
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    setLayers(prev => prev.map((l, i) => i === idx ? { ...l, img } : l));
                };
            }
        });
    }, [layers.map(l => l.src).join(',')]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const S = 1080;
        canvas.width = S; canvas.height = S;
        const t = THEMES[theme];
        const margin = 100;

        ctx.fillStyle = t.bg;
        ctx.fillRect(0, 0, S, S);

        ctx.fillStyle = t.dotColor;
        for (let x = 0; x < S; x += 28) {
            for (let y = 0; y < S; y += 28) {
                ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Draw all layers
        for (const layer of layers) {
            if (!layer.visible || !layer.img) continue;
            const logo = layer.img;
            const logoAspect = logo.width / logo.height;
            let lW = layer.size, lH = layer.size;
            if (logoAspect > 1) lH = lW / logoAspect;
            else lW = lH * logoAspect;
            const dx = (layer.x / 100) * S - lW / 2;
            const dy = (layer.y / 100) * S - lH / 2;
            ctx.globalAlpha = layer.opacity / 100;
            ctx.drawImage(logo, dx, dy, lW, lH);
            ctx.globalAlpha = 1;
        }

        // Corner accents
        ctx.strokeStyle = t.accent; ctx.lineWidth = 3;
        const cL = 60;
        ctx.beginPath(); ctx.moveTo(margin, margin + cL); ctx.lineTo(margin, margin); ctx.lineTo(margin + cL, margin); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(S - margin - cL, margin); ctx.lineTo(S - margin, margin); ctx.lineTo(S - margin, margin + cL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(margin, S - margin - cL); ctx.lineTo(margin, S - margin); ctx.lineTo(margin + cL, S - margin); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(S - margin - cL, S - margin); ctx.lineTo(S - margin, S - margin); ctx.lineTo(S - margin, S - margin - cL); ctx.stroke();

        // Title
        ctx.fillStyle = t.text; ctx.font = '700 72px Fraunces, serif'; ctx.textAlign = 'center';
        let yT = 260;
        for (const p of titleText.split('\n')) { ctx.fillText(p, S / 2, yT); yT += 90; }

        ctx.fillStyle = t.accent;
        ctx.beginPath(); ctx.roundRect((S - 100) / 2, yT + 5, 100, 5, 3); ctx.fill();

        ctx.fillStyle = t.text; ctx.font = '400 42px "DM Sans", sans-serif';
        let yB = yT + 80;
        for (const p of bodyText.split('\n')) { ctx.fillText(p, S / 2, yB); yB += 56; }

        ctx.fillStyle = t.text; ctx.globalAlpha = 0.6; ctx.font = 'italic 34px "DM Sans", sans-serif';
        let yF = yB + 40;
        for (const p of footerText.split('\n')) { ctx.fillText(p, S / 2, yF); yF += 46; }
        ctx.globalAlpha = 1;

        ctx.fillStyle = t.accent; ctx.font = '700 50px Fraunces, serif';
        ctx.fillText(ctaText, S / 2, yF + 50);
    }, [theme, layers, titleText, bodyText, footerText, ctaText]);

    useEffect(() => { draw(); }, [draw]);

    const uploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                const newLayer: Layer = {
                    id: `photo_${++layerCounter}`,
                    name: file.name.split('.')[0].substring(0, 20),
                    type: 'photo', src, img,
                    opacity: 100, x: 50, y: 50, size: 400, visible: true,
                };
                setLayers(prev => [...prev, newLayer]);
                setSelectedLayer(newLayer.id);
            };
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const updateLayer = (id: string, updates: Partial<Layer>) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const removeLayer = (id: string) => {
        setLayers(prev => prev.filter(l => l.id !== id));
        if (selectedLayer === id) setSelectedLayer(null);
    };

    const moveLayer = (id: string, dir: -1 | 1) => {
        setLayers(prev => {
            const idx = prev.findIndex(l => l.id === id);
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= prev.length) return prev;
            const arr = [...prev];
            [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
            return arr;
        });
    };

    const changeLayerSrc = (id: string, newSrc: string) => {
        const img = new window.Image();
        img.src = newSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => { updateLayer(id, { src: newSrc, img }); };
    };

    const sel = layers.find(l => l.id === selectedLayer);

    return (
        <div className="min-h-screen bg-[#FDFAF6] py-8 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
                <div className="flex justify-center">
                    <div className="shadow-2xl rounded-3xl overflow-hidden" style={{ maxWidth: 500 }}>
                        <canvas ref={canvasRef} width={1080} height={1080} className="w-full h-auto" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xl border border-sage-green/20 space-y-4 lg:sticky lg:top-4 max-h-[95vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold text-charcoal flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            <LayoutGrid className="text-sage-green w-5 h-5" /> Post
                        </h1>
                        <span className="text-[10px] text-slate bg-slate/10 px-2 py-1 rounded-full">1080×1080</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {THEMES.map((t, i) => (
                            <button key={i} onClick={() => setTheme(i)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${theme === i ? 'ring-2 ring-sage-green shadow-sm' : 'hover:bg-slate/5'}`}>
                                <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: t.bg }} />
                                {t.name}
                            </button>
                        ))}
                    </div>

                    {/* CAMADAS */}
                    <div className="p-3 bg-slate/5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-charcoal text-xs uppercase tracking-wider">Camadas</h3>
                            <div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-sage-green text-charcoal rounded-lg hover:bg-sage-green/80 transition-all">
                                    <Upload className="w-3 h-3" /> Subir Foto
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1 max-h-[180px] overflow-y-auto">
                            {layers.map((layer, idx) => (
                                <div key={layer.id}
                                    onClick={() => setSelectedLayer(layer.id)}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${selectedLayer === layer.id ? 'bg-sage-green/30 ring-1 ring-sage-green' : 'bg-white hover:bg-slate/5'}`}>
                                    <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                                        className="text-slate hover:text-charcoal">
                                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
                                    </button>
                                    <span className={`flex-1 truncate ${!layer.visible ? 'opacity-40 line-through' : ''}`}>
                                        {layer.type === 'photo' ? '📷' : '🏷️'} {layer.name}
                                    </span>
                                    <div className="flex gap-0.5">
                                        <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1); }} className="p-0.5 hover:bg-white rounded"><ChevronDown className="w-3 h-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 1); }} className="p-0.5 hover:bg-white rounded"><ChevronUp className="w-3 h-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="p-0.5 hover:bg-red-100 text-red-400 rounded"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate">⬇ Trás &nbsp;&nbsp; ⬆ Frente &nbsp;|&nbsp; Clique para editar</p>
                    </div>

                    {sel && (
                        <div className="p-3 bg-sage-green/10 rounded-xl space-y-3 border border-sage-green/20">
                            <h3 className="font-bold text-charcoal text-xs uppercase tracking-wider">Editando: {sel.name}</h3>
                            {sel.type === 'logo' && (
                                <select className="w-full text-sm p-2 rounded-lg border bg-white" value={sel.src}
                                    onChange={e => changeLayerSrc(sel.id, e.target.value)}>
                                    {LOGO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] font-bold text-charcoal flex justify-between">Opacidade <span>{sel.opacity}%</span></label>
                                    <input type="range" min="0" max="100" value={sel.opacity} onChange={e => updateLayer(sel.id, { opacity: Number(e.target.value) })} className="w-full accent-sage-green" /></div>
                                <div><label className="text-[10px] font-bold text-charcoal flex justify-between">Tamanho <span>{sel.size}px</span></label>
                                    <input type="range" min="30" max="1000" value={sel.size} onChange={e => updateLayer(sel.id, { size: Number(e.target.value) })} className="w-full accent-charcoal" /></div>
                                <div><label className="text-[10px] font-bold text-charcoal">Horizontal</label>
                                    <input type="range" min="0" max="100" value={sel.x} onChange={e => updateLayer(sel.id, { x: Number(e.target.value) })} className="w-full accent-charcoal" /></div>
                                <div><label className="text-[10px] font-bold text-charcoal">Vertical</label>
                                    <input type="range" min="0" max="100" value={sel.y} onChange={e => updateLayer(sel.id, { y: Number(e.target.value) })} className="w-full accent-charcoal" /></div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-black/5">
                        <h3 className="font-bold text-charcoal text-xs uppercase tracking-wider">Textos</h3>
                        <div><span className="text-[10px] text-slate">Título</span>
                            <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={titleText} onChange={e => setTitleText(e.target.value)} /></div>
                        <div><span className="text-[10px] text-slate">Corpo</span>
                            <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={bodyText} onChange={e => setBodyText(e.target.value)} /></div>
                        <div><span className="text-[10px] text-slate">Sub-texto</span>
                            <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={footerText} onChange={e => setFooterText(e.target.value)} /></div>
                        <div><span className="text-[10px] text-slate">Chamada</span>
                            <input className="w-full text-sm p-2 rounded-lg border" value={ctaText} onChange={e => setCtaText(e.target.value)} /></div>
                    </div>

                    <button onClick={() => {
                        if (!canvasRef.current) return;
                        const a = document.createElement('a');
                        a.href = canvasRef.current.toDataURL('image/jpeg', 1.0);
                        a.download = 'Danis_Post.jpg'; a.click();
                    }} className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-xl">
                        <Download className="w-5 h-5" /> BAIXAR POST
                    </button>
                </div>
            </div>
        </div>
    );
}
