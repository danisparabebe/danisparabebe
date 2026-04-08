import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    brand: '#D6A6A6',      // Dusty Rose
                    hover: '#C48F8F',       // Deep Rose
                },
                secondary: {
                    brand: '#AECeb3',       // Sage Green
                },
                neutral: {
                    bg: '#FAFAF9',          // Warm Stone
                    white: '#FFFFFF',       // Cards
                    text: '#1F2937',        // Charcoal
                    textSub: '#64748B',     // Slate
                    border: '#E2E8F0',      // Cool Gray
                },
                status: {
                    success: '#10B981',
                    error: '#EF4444',
                },
                accent: {
                    gold: '#D4AF37',
                },
                // Flattened explicit brand colors for configurator use
                'charcoal': '#1F2937',
                'dusty-rose': '#D6A6A6',
                'deep-rose': '#C48F8F',
                'warm-stone': '#FAFAF9',
                'slate': '#64748B',
                'sage-green': '#AECeb3',
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fadeIn": "fadeIn 0.3s ease-in-out",
                "shine": "shine 2s linear infinite",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fadeIn": {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "shine": {
                    "0%": { transform: "translateX(-150%) skewX(-12deg)" },
                    "100%": { transform: "translateX(250%) skewX(-12deg)" },
                }
            },
            fontFamily: {
                fraunces: ['var(--font-fraunces)', 'serif'],
                dmSans: ['var(--font-dm-sans)', 'sans-serif'],
            },
            borderRadius: {
                sm: '8px',
                md: '16px',
                lg: '24px',
                full: '9999px',
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                hover: '0 10px 25px -5px rgba(214, 166, 166, 0.25)',
            },
        },
    },
    plugins: [],
};

export default config;
