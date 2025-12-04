'use client';

import { useState } from 'react';

export function Newsletter() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement newsletter signup
        console.log('Newsletter signup:', email);
    };

    return (
        <section className="bg-sage-green/20 py-12 mt-6">
            <div className="mx-auto max-w-2xl px-4 text-center">
                <h3 className="mb-2 text-xl tracking-wide md:text-2xl text-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
                    Ganhe 15% na sua primeira compra!*
                </h3>
                <p className="mb-6 text-charcoal">
                    Inscreva-se na nossa newsletter e receba 15% de desconto! Seja o primeiro a descobrir ofertas exclusivas e as últimas tendências em moda bebê.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:flex-row md:gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Seu e-mail"
                        required
                        className="h-12 flex-1 rounded-md border-none px-4 focus:outline-none focus:ring-2 focus:ring-dusty-rose"
                    />
                    <button
                        type="submit"
                        className="h-12 rounded-md bg-charcoal px-8 text-white uppercase font-medium hover:bg-charcoal/90 transition-colors"
                    >
                        Inscrever-se
                    </button>
                </form>
                <p className="mt-4 text-xs text-slate">
                    *Aplicável apenas na primeira compra. Consulte termos e condições.
                </p>
            </div>
        </section>
    );
}
