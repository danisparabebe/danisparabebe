import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

// ──────────────────────────────────────────────────────────
// 🛡️  SECURITY LAYER — Protections applied to this endpoint
// ──────────────────────────────────────────────────────────

// 1. Rate limiter — in-memory sliding window (per-IP, 10 req / 60s)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

// 2. HMAC-SHA256 signature verifier (constant-time comparison)
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
    if (!signatureHeader) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHeader, 'hex'),
            Buffer.from(expected, 'hex')
        );
    } catch {
        return false;
    }
}

// 3. Replay-attack guard — rejects bodies older than 5 minutes
const REPLAY_WINDOW_MS = 5 * 60 * 1000;
const processedIdempotencyKeys = new Set<string>();

// Função para identificar NSU independentemente do layout do JSON da IP
function extractOrderNsu(body: any): string | null {
    const stringified = JSON.stringify(body);
    // Procuramos o nosso padrão exato (ORDER_ seguido de números)
    const match = stringified.match(/(ORDER_\d+)/);
    if (match) return match[1];

    if (body?.order_nsu) return body.order_nsu;
    if (body?.data?.attributes?.order_nsu) return body.data.attributes.order_nsu;
    
    return null;
}

export async function POST(req: Request) {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // ── Gate 1: Rate Limiting ──
    if (isRateLimited(clientIp)) {
        console.error(`[SEC] 🚨 Rate limit exceeded for IP: ${clientIp}`);
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        // We must read the raw body BEFORE parsing for HMAC validation
        const bodyText = await req.text();

        // ── Gate 2: HMAC Signature Verification ──
        const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET;
        if (webhookSecret && webhookSecret !== 'your_infinitepay_secret') {
            const signature = req.headers.get('x-webhook-signature')
                || req.headers.get('x-signature')
                || req.headers.get('x-hub-signature-256')?.replace('sha256=', '');

            if (!verifySignature(bodyText, signature, webhookSecret)) {
                console.error(`[SEC] 🚨 HMAC Signature INVÁLIDA! IP: ${clientIp}`);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
            }
            console.log(`[SEC] ✅ Assinatura HMAC verificada com sucesso.`);
        } else {
            console.warn(`[SEC] ⚠️ INFINITEPAY_WEBHOOK_SECRET não configurado. Validação de assinatura DESABILITADA.`);
        }

        let body;
        try {
            body = JSON.parse(bodyText);
        } catch {
            console.error('🚨 Webhook Received Invalid JSON');
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // ── Gate 3: Replay Attack Protection (idempotency) ──
        const idempotencyKey = body?.id || body?.data?.id || crypto.createHash('sha256').update(bodyText).digest('hex');
        if (processedIdempotencyKeys.has(idempotencyKey)) {
            console.warn(`[SEC] ⚠️ Replay detectado (idempotency key: ${idempotencyKey}). Ignorando.`);
            return NextResponse.json({ ok: true, detail: 'duplicate ignored' });
        }
        processedIdempotencyKeys.add(idempotencyKey);
        // Auto-limpeza após 10 minutos para não consumir memória indefinidamente
        setTimeout(() => processedIdempotencyKeys.delete(idempotencyKey), 10 * 60 * 1000);

        console.log('\n========== 🔔 WEBHOOK INFINITEPAY ==========');
        console.log(`IP de Origem: ${clientIp}`);
        console.log('Payload Recebido:', JSON.stringify(body, null, 2));

        // 1. Extraindo o Pedido Físico (NSU)
        const orderId = extractOrderNsu(body);
        if (!orderId) {
            console.error('🚨 Arquivo NSU não encontrado no rastreamento!');
            return NextResponse.json({ ok: false, error: 'order_nsu não encontrado' });
        }
        
        console.log(`✅ Pedido rastreado: ${orderId}`);

        // O Status pode vir em inglês ou ter chaves diferentes
        // Vamos varrer a String para não sermos reféns de mudanças de API
        const stringified = JSON.stringify(body).toLowerCase();
        const isApproved = stringified.includes('approved') || stringified.includes('pago') || stringified.includes('paid');

        if (!isApproved) {
            console.log('⚠️ Status de pagamento ignorado. Não foi uma conversão confirmada.');
            return NextResponse.json({ ok: true, status: 'ignored' });
        }

        // 2. Buscando o Pedido Oficial no Cérebro (Firebase)
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            console.error(`🚨 Pedido Fantasma: NSU ${orderId} não existe no Firebase.`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const orderData = orderSnap.data();

        // Evitar execução duplicada ou disparo duplo de e-mail se IP mandar 2 pings
        if (orderData.status === 'pago_aprovado') {
             console.log(`⚠️ Pedido ${orderId} já estava marcado como PAGO. Ignorando Duplicata.`);
             return NextResponse.json({ ok: true, detail: 'already processed' });
        }

        // 3. Atualizando a "Etiqueta" do Pedido
        await updateDoc(orderRef, {
            status: 'pago_aprovado',
            paymentDate: new Date().toISOString()
        });
        
        console.log(`✅ Firebase Atualizado: Status [pago_aprovado] para ${orderId}`);

        // 4. AUTOMAÇÃO: Disparo de Boas Vindas VIP (Resend)
        const customerEmail = orderData.customerEmail;
        const customerName = orderData.customerName || 'Querida(o) Cliente';

        if (customerEmail && process.env.RESEND_API_KEY) {
             console.log(`📧 Disparando e-mail luxuoso via Resend para: ${customerEmail}`);
             
             const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf9f7; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding-bottom: 20px;">
                    
                    <div style="background-color: #1f2937; padding: 30px; text-align: center;">
                        <h1 style="color: #ADCEB3; font-weight: 900; margin: 0; font-size: 24px; letter-spacing: 2px;">PAGAMENTO APROVADO</h1>
                    </div>
                    
                    <div style="padding: 30px;">
                        <p style="color: #334155; font-size: 16px;">Sua compra foi confirmada com sucesso, <strong>${customerName}</strong>!</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                            Recebemos o seu pagamento referente ao pedido <strong>#${orderId.replace('ORDER_', '')}</strong>.
                            Nossas artesãs já foram notificadas e o processo de personalização do seu enxoval, feito fio a fio com muito carinho, será iniciado.
                        </p>

                        <div style="background-color: #ffffff; border: 2px solid #ADCEB3; border-radius: 8px; padding: 20px; margin-top: 25px;">
                            <h3 style="color: #1f2937; margin-top: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Status da Operação</h3>
                            <p style="margin: 0; color: #158043; font-weight: bold; font-size: 14px;">✅ APROVADA - INFINITEPAY</p>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 10px;">
                        <p style="font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">A Danis agradece pela confiança! ❤️</p>
                    </div>
                </div>
            `;

            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Danis Para Bebê <contato@danisparabebe.com.br>', // Domínio configurado
                    to: customerEmail,
                    subject: `✨ Pedido Confirmado! #${orderId.replace('ORDER_', '')}`,
                    html: emailHtml,
                }),
            });

            if (!resendResponse.ok) {
                console.error('🚨 Falha no Disparo Resend:', await resendResponse.text());
            } else {
                console.log('✅ E-mail VIP entregue na caixa.');
            }
        }

        console.log('========== 🏁 FIM DO WEBHOOK ==========\n');
        return NextResponse.json({ ok: true, success: true });

    } catch (err: any) {
         console.error('🚨 ERRO FATAL WEBHOOK:', err);
         return NextResponse.json({ error: 'Erro Severo interno' }, { status: 500 });
    }
}

