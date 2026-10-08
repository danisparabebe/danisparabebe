import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- SECURITY: BRUTE-FORCE DEFENSE FOR ADMIN AUTH ---
const failedAttemptsMap = new Map<string, { attempts: number; blockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 10 * 60 * 1000; // Bloqueio de 10 minutos após 5 erros seguidos

const PROTECTED_PREFIXES = [
    '/admin',
    '/api/admin',
    '/ficha',
    '/selecionar-produtos',
    '/api/mvp',
];

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const pathname = url.pathname;

    const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

    if (isProtected) {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
        const now = Date.now();

        // 1. Verifica se o IP está sob bloqueio por brute-force
        const blockInfo = failedAttemptsMap.get(ip);
        if (blockInfo && blockInfo.blockedUntil > now) {
            const remainingSec = Math.ceil((blockInfo.blockedUntil - now) / 1000);
            console.error(`[SEC-BRUTEFORCE] 🚨 IP ${ip} bloqueado temporariamente. Tentativa em ${pathname} barrada.`);
            return new NextResponse(
                `Acesso bloqueado por segurança devido a repetidas tentativas inválidas. Tente novamente em ${remainingSec} segundos.`,
                { status: 429 }
            );
        }

        const basicAuth = req.headers.get('authorization');

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            
            try {
                const [user, pwd] = atob(authValue).split(':');
                const adminUser = process.env.ADMIN_USER || 'admin';
                const adminPwd = process.env.ADMIN_PASSWORD;

                if (user === adminUser && adminPwd && pwd === adminPwd) {
                    // Login com sucesso: reseta qualquer contador de falhas do IP
                    failedAttemptsMap.delete(ip);
                    console.log(`[SEC-LOG ${new Date().toISOString()}] ✅ Admin Acessado. IP: ${ip} - Rota: ${pathname}`);
                    return NextResponse.next();
                } else {
                    // Credenciais inválidas: incrementa contador de falhas
                    const current = failedAttemptsMap.get(ip) || { attempts: 0, blockedUntil: 0 };
                    current.attempts++;
                    if (current.attempts >= MAX_FAILED_ATTEMPTS) {
                        current.blockedUntil = now + BLOCK_DURATION_MS;
                        console.error(`[SEC-BRUTEFORCE] 🚨 IP ${ip} atingiu limite de falhas e foi BLOQUEADO por 10 minutos.`);
                    }
                    failedAttemptsMap.set(ip, current);

                    console.error(`[SEC-LOG ${new Date().toISOString()}] 🚨 Falha de Autenticação Admin (${current.attempts}/${MAX_FAILED_ATTEMPTS}). IP: ${ip} - Rota: ${pathname}`);
                }
            } catch {
                // Erro ao decodificar Base64
            }
        } else {
            console.warn(`[SEC-LOG ${new Date().toISOString()}] ⚠️ Tentativa de Acesso Admin Sem Credencial. IP: ${ip} - Rota: ${pathname}`);
        }
        
        // Bloqueia com popup nativo do navegador requisitando senha (status 401)
        return new NextResponse('Autenticação é requerida para acessar a área administrativa.', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Danis Admin Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/ficha/:path*',
        '/selecionar-produtos/:path*',
        '/api/mvp/:path*',
    ],
};
