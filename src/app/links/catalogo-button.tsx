'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronDown, Baby } from 'lucide-react';

export function CatalogoButton() {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="w-full">
            {/* Main button */}
            <button
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className={`
                    group relative w-full flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl transition-all duration-200
                    border-2 text-left shadow-xs hover:shadow-md active:scale-[0.98]
                    bg-white border-black/5 hover:border-black/15
                    ${expanded ? 'border-[#245E3B]/20 shadow-sm' : ''}
                `}
            >
                {/* Left Icon — custom image, square with rounded corners */}
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <Image
                        src="/Icons link do insta/Icon Catálogo.jpg"
                        alt="Catálogo"
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        sizes="44px"
                    />
                </div>

                {/* Texts */}
                <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="font-bold text-sm sm:text-base text-charcoal group-hover:text-black leading-snug truncate">
                            Ver Catálogo Completo
                        </h2>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 bg-slate-100 text-slate-700 border-slate-200">
                            Lookbook
                        </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">
                        {expanded ? 'Escolha a coleção' : 'Confira todas as fotos e temas das nossas coleções'}
                    </p>
                </div>

                {/* Right toggle arrow */}
                {expanded
                    ? <ChevronDown className="w-4 h-4 text-[#245E3B] transition-all shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-charcoal group-hover:translate-x-0.5 transition-all shrink-0" />
                }
            </button>

            {/* Expanded sub-options */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                }`}
            >
                <div className="grid grid-cols-2 gap-2 px-1">
                    {/* Meninas */}
                    <Link
                        href="/catalogo?gender=menina"
                        className="group flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 border-pink-100 bg-pink-50/60 hover:bg-pink-50 hover:border-pink-200 hover:shadow-sm active:scale-[0.97] transition-all duration-150"
                    >
                        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Baby className="w-5 h-5 text-pink-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-sm text-pink-700 leading-tight">Meninas</p>
                            <p className="text-[10px] text-pink-400 font-medium">Coleção Rosê</p>
                        </div>
                    </Link>

                    {/* Meninos */}
                    <Link
                        href="/catalogo?gender=menino"
                        className="group flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 border-[#ADCEB3]/40 bg-[#ADCEB3]/10 hover:bg-[#ADCEB3]/20 hover:border-[#ADCEB3]/70 hover:shadow-sm active:scale-[0.97] transition-all duration-150"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#ADCEB3]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Baby className="w-5 h-5 text-[#245E3B]" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-sm text-[#245E3B] leading-tight">Meninos</p>
                            <p className="text-[10px] text-[#245E3B]/60 font-medium">Coleção Verde</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
