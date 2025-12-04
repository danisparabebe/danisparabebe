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
