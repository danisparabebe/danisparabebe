import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');
    const url = req.nextUrl;

    // Protege todas as páginas dentro de /admin e todas as chamadas de API em /api/admin
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            
            try {
                // Decodifica o base64 vindo do Header Authorization
                const [user, pwd] = atob(authValue).split(':');

                // Valida a senha contra a variável de ambiente segura
                if (user === 'admin' && pwd === process.env.ADMIN_PASSWORD) {
                    // --- SECURITY: LOGGING BÁSICO BEM-SUCEDIDO ---
                    console.log(`[SEC-LOG ${new Date().toISOString()}] ✅ Admin Acessado. IP: ${req.headers.get('x-forwarded-for') || 'Unknown'} - Rota: ${url.pathname}`);
                    return NextResponse.next();
                } else {
                    // --- SECURITY: LOGGING BÁSICO FALHA DE SENHA ---
                    console.error(`[SEC-LOG ${new Date().toISOString()}] 🚨 Falha de Autenticação Admin. IP: ${req.headers.get('x-forwarded-for') || 'Unknown'} - Rota: ${url.pathname} (Credentials Rejected)`);
                }
            } catch (error) {
                // Falha silenciosa no decript ou parse
            }
        } else {
            console.warn(`[SEC-LOG ${new Date().toISOString()}] ⚠️ Tentativa de Acesso Admin Sem Credencial. IP: ${req.headers.get('x-forwarded-for') || 'Unknown'} - Rota: ${url.pathname}`);
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
    // Definimos explicitamente onde o middleware vai engatilhar
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
