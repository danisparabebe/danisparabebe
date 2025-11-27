'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LifestyleSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1800px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content - Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="lg:pl-24 space-y-8 text-center lg:text-left order-2 lg:order-1"
                    >
                        <span className="text-xs tracking-[0.3em] uppercase text-subtle font-nunito">
                            Coleção 2024
                        </span>
                        <h2 className="text-4xl md:text-5xl font-playfair text-text leading-tight">
                            O ETERNO <br /> SE RENOVA
                        </h2>
                        <p className="text-subtle font-nunito leading-relaxed max-w-md mx-auto lg:mx-0 text-sm md:text-base tracking-wide">
                            É verão quando a luz se espalha e os dias parecem infinitos.
                            Cada instante sob o sol traz a promessa de tranquilidade,
                            como se o mundo desacelerasse, permitindo que tudo fosse vivido com mais presença.
                        </p>
                        <div className="pt-4">
                            <Link href="/montar-enxoval">
                                <span className="inline-block border-b border-text pb-1 text-xs uppercase tracking-[0.2em] text-text hover:text-rosa hover:border-rosa transition-colors cursor-pointer">
                                    Conheça a Coleção
                                </span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Image - Right */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="relative aspect-[4/5] bg-gray-100 overflow-hidden order-1 lg:order-2"
                    >
                        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center hover:scale-105 transition-transform duration-[2s]" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
