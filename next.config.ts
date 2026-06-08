import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    // 2 anos, incluindo subdomínios, e recusa downgrade para HTTP
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    // Previne que o site seja aberto dentro de um iframe em outro site (Clickjacking)
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    // Previne mime-sniffing
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    // Protege metadados na navegação
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    // Bloqueia permissões invasivas de navegadores (como geolocalização e microfone não usados)
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://www.gstatic.com https://*.infinitepay.io https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.googleapis.com https://firebasestorage.googleapis.com https://*.googleusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://*.infinitepay.io https://accounts.google.com; frame-src 'self' https://*.firebaseapp.com https://apis.google.com https://*.infinitepay.io https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
  }
];

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    '*': ['./Catálogo/**', './Bordados/**', './public/Catálogo/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplica os headers de segurança em todas as rotas
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
