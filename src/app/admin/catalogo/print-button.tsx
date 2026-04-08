"use client";

import React from "react";

export function PrintButton() {
    return (
        <button
            onClick={() => typeof window !== "undefined" && window.print()}
            className="bg-charcoal text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-black transition-colors flex items-center gap-2"
        >
            <span>Gerar PDF</span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Ctrl+P</span>
        </button>
    );
}
