'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-gray-100">
            {/* Full Bleed Background Image */}
            <div className="absolute inset-0">
                {/* Placeholder for Lifestyle Image */}
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale-[20%] contrast-[0.9]" />
                <div className="absolute inset-0 bg-black/10" /> {/* Subtle overlay */}
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <span className="inline-block text-sm md:text-base tracking-[0.3em] uppercase font-nunito font-medium text-white/90">
                        New In
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-normal tracking-wide leading-tight">
                        Living Al Fresco
                    </h1>

                    <div className="pt-8">
                        <Link href="/montar-enxoval">
                            <Button
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-text rounded-none h-14 px-12 text-sm tracking-[0.2em] uppercase transition-all duration-500"
                            >
                                White Luxury
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
