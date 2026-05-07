"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export function PrintButton() {
    const [isPreparing, setIsPreparing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePrint = async () => {
        if (isPreparing) return;
        setIsPreparing(true);
        setProgress(0);

        try {
            // Give React a tick to update state
            await new Promise(r => setTimeout(r, 100));

            const images = Array.from(document.querySelectorAll('img'));
            
            if (images.length === 0) {
                window.print();
                setIsPreparing(false);
                return;
            }

            let loadedCount = 0;
            
            const promises = images.map((img) => {
                if (img.complete) {
                    loadedCount++;
                    setProgress(Math.round((loadedCount / images.length) * 100));
                    return Promise.resolve();
                }
                
                return new Promise<void>((resolve) => {
                    const onLoad = () => {
                        loadedCount++;
                        setProgress(Math.round((loadedCount / images.length) * 100));
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        resolve();
                    };
                    const onError = () => {
                        loadedCount++; // Count as loaded even if error, so we don't block forever
                        setProgress(Math.round((loadedCount / images.length) * 100));
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        resolve();
                    };
                    
                    img.addEventListener('load', onLoad);
                    img.addEventListener('error', onError);
                });
            });

            await Promise.all(promises);
            
            // Give the browser a small moment to flush decoded images to memory
            await new Promise(r => setTimeout(r, 500));
            
            window.print();
        } catch (e) {
            console.error("Failed to preload images for print", e);
            window.print(); // Fallback
        } finally {
            setIsPreparing(false);
            setProgress(0);
        }
    };

    return (
        <button
            onClick={handlePrint}
            disabled={isPreparing}
            className="bg-charcoal text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isPreparing ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Carregando ({progress}%)</span>
                </>
            ) : (
                <>
                    <span>Gerar PDF</span>
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Ctrl+P</span>
                </>
            )}
        </button>
    );
}
