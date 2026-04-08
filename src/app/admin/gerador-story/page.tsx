'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Smartphone, Upload, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

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

export default function GeradorStory() {
    const [theme, setTheme] = useState(0);
    const [layers, setLayers] = useState<Layer[]>([
        { id: 'wm', name: 'Marca d\'água', type: 'logo', src: '/Logos/LOGO PURA BRANCA.png', img: null, opacity: 8, x: 50, y: 45, size: 600, visible: true },
        { id: 'footer', name: 'Logo Rodapé', type: 'logo', src: '/Logos/DANIS BRANCA.png', img: null, opacity: 50, x: 50, y: 90, size: 70, visible: true },
    ]);
    const [selectedLayer, setSelectedLayer] = useState<string | null>('wm');

    const [line1, setLine1] = useState('Ei, mamãe! 💚');
    const [line2, setLine2] = useState('Você vai notar algo\ndiferente por aqui\nnos próximos dias...');
    const [line3, setLine3] = useState('Estamos repaginando\nnosso visual!');
    const [line4, setLine4] = useState('Novas cores, nova identidade —\ntudo pra combinar com uma\nnovidade especial que\nestá chegando 👀');
    const [line5, setLine5] = useState('A essência continua a mesma:\nenxovais feitos com amor e\nexclusividade para o seu bebê. ✨');
    const [line6, setLine6] = useState('Fique de olho!');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load images for all layers
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

        const W = 1080, H = 1920;
        canvas.width = W; canvas.height = H;
        const t = THEMES[theme];
        const margin = 90;

        // Background
        ctx.fillStyle = t.bg;
        ctx.fillRect(0, 0, W, H);

        // Dots
        ctx.fillStyle = t.dotColor;
        for (let x = 0; x < W; x += 28) {
            for (let y = 0; y < H; y += 28) {
                ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Draw all layers in order
        for (const layer of layers) {
            if (!layer.visible || !layer.img) continue;
            const logo = layer.img;
            const logoAspect = logo.width / logo.height;
            let lW = layer.size, lH = layer.size;
            if (logoAspect > 1) lH = lW / logoAspect;
            else lW = lH * logoAspect;
            const dx = (layer.x / 100) * W - lW / 2;
            const dy = (layer.y / 100) * H - lH / 2;
            ctx.globalAlpha = layer.opacity / 100;
            ctx.drawImage(logo, dx, dy, lW, lH);
            ctx.globalAlpha = 1;
        }

        // Text
        const lineY = 220;
        ctx.strokeStyle = t.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(margin, lineY); ctx.lineTo(W - margin, lineY); ctx.stroke();

        ctx.fillStyle = t.accent; ctx.font = 'italic 52px Fraunces, serif'; ctx.textAlign = 'center';
        ctx.fillText(line1, W / 2, 190);

        ctx.fillStyle = t.text; ctx.font = '600 56px Fraunces, serif';
        let y2 = 340;
        for (const p of line2.split('\n')) { ctx.fillText(p, W / 2, y2); y2 += 72; }

        ctx.fillStyle = t.accent; ctx.font = '700 62px Fraunces, serif';
        let y3 = y2 + 40;
        for (const p of line3.split('\n')) { ctx.fillText(p, W / 2, y3); y3 += 78; }

        ctx.fillStyle = t.accent;
        ctx.beginPath(); ctx.roundRect((W - 120) / 2, y3 + 10, 120, 5, 3); ctx.fill();

        ctx.fillStyle = t.text; ctx.font = '400 42px "DM Sans", sans-serif';
        let y4 = y3 + 90;
        for (const p of line4.split('\n')) { ctx.fillText(p, W / 2, y4); y4 += 56; }

        ctx.fillStyle = t.text; ctx.globalAlpha = 0.75; ctx.font = 'italic 38px "DM Sans", sans-serif';
        let y5 = y4 + 50;
        for (const p of line5.split('\n')) { ctx.fillText(p, W / 2, y5); y5 += 50; }
        ctx.globalAlpha = 1;

        ctx.fillStyle = t.accent; ctx.font = '800 58px Fraunces, serif';
        ctx.fillText(line6, W / 2, y5 + 60);

        ctx.strokeStyle = t.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(margin, H - 250); ctx.lineTo(W - margin, H - 250); ctx.stroke();

        ctx.fillStyle = t.text; ctx.globalAlpha = 0.4; ctx.font = '400 28px "DM Sans", sans-serif';
        ctx.fillText('@danisparabebe', W / 2, H - 100); ctx.globalAlpha = 1;
    }, [theme, layers, line1, line2, line3, line4, line5, line6]);

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
                    type: 'photo',
                    src, img,
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
        img.onload = () => {
            updateLayer(id, { src: newSrc, img });
        };
    };

    const sel = layers.find(l => l.id === selectedLayer);

    return (
        <div className="min-h-screen bg-[#FDFAF6] py-8 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
                <div className="flex justify-center">
                    <div className="shadow-2xl rounded-3xl overflow-hidden" style={{ maxWidth: 400 }}>
                        <canvas ref={canvasRef} width={1080} height={1920} className="w-full h-auto" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xl border border-sage-green/20 space-y-4 lg:sticky lg:top-4 max-h-[95vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold text-charcoal flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            <Smartphone className="text-sage-green w-5 h-5" /> Story
                        </h1>
                        <span className="text-[10px] text-slate bg-slate/10 px-2 py-1 rounded-full">1080×1920</span>
                    </div>

                    {/* Tema */}
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
                                        <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1); }} className="p-0.5 hover:bg-white rounded" title="Mover para trás"><ChevronDown className="w-3 h-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 1); }} className="p-0.5 hover:bg-white rounded" title="Mover para frente"><ChevronUp className="w-3 h-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="p-0.5 hover:bg-red-100 text-red-400 rounded"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate">⬇ Trás &nbsp;&nbsp; ⬆ Frente &nbsp;|&nbsp; Clique para editar</p>
                    </div>

                    {/* Editor da camada selecionada */}
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
                                    <input type="range" min="30" max="1200" value={sel.size} onChange={e => updateLayer(sel.id, { size: Number(e.target.value) })} className="w-full accent-charcoal" /></div>
                                <div><label className="text-[10px] font-bold text-charcoal">Horizontal</label>
                                    <input type="range" min="0" max="100" value={sel.x} onChange={e => updateLayer(sel.id, { x: Number(e.target.value) })} className="w-full accent-charcoal" /></div>
                                <div><label className="text-[10px] font-bold text-charcoal">Vertical</label>
                                    <input type="range" min="0" max="100" value={sel.y} onChange={e => updateLayer(sel.id, { y: Number(e.target.value) })} className="w-full accent-charcoal" /></div>
                            </div>
                        </div>
                    )}

                    {/* Textos */}
                    <div className="space-y-2 pt-2 border-t border-black/5">
                        <h3 className="font-bold text-charcoal text-xs uppercase tracking-wider">Textos</h3>
                        <input className="w-full text-sm p-2 rounded-lg border" value={line1} onChange={e => setLine1(e.target.value)} placeholder="Saudação" />
                        <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={line2} onChange={e => setLine2(e.target.value)} />
                        <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={line3} onChange={e => setLine3(e.target.value)} />
                        <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={line4} onChange={e => setLine4(e.target.value)} />
                        <textarea className="w-full text-sm p-2 rounded-lg border" rows={2} value={line5} onChange={e => setLine5(e.target.value)} />
                        <input className="w-full text-sm p-2 rounded-lg border" value={line6} onChange={e => setLine6(e.target.value)} />
                    </div>

                    <button onClick={() => {
                        if (!canvasRef.current) return;
                        const a = document.createElement('a');
                        a.href = canvasRef.current.toDataURL('image/jpeg', 1.0);
                        a.download = 'Danis_Story.jpg'; a.click();
                    }} className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-xl">
                        <Download className="w-5 h-5" /> BAIXAR STORY
                    </button>
                </div>
            </div>
        </div>
    );
}
