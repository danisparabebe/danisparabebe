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
                creme: "#FFFFFF", // Pure White
                rosa: "#A68A6C",  // Gold/Bronze Accent (replacing rosa)
                azul: "#F5F5F5",  // Light Gray (replacing azul)
                text: "#1A1A1A",  // Near Black
                subtle: "#666666", // Gray Text
                border: "#E5E5E5", // Light Border
            },
            fontFamily: {
                playfair: ['"Playfair Display"', "serif"],
                nunito: ["Nunito", "sans-serif"],
                cursive: ['"Dancing Script"', "cursive"],
            },
            borderRadius: {
                'none': '0',
                'sm': '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                '3xl': '0',
                'full': '9999px', // Keep full for circular elements if needed
            },
            boxShadow: {
                'soft': 'none', // Removing soft shadow
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: [],
};

export default config;
