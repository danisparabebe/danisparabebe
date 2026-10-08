import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { productControl } from '@/data/product-control';

export const dynamic = 'force-dynamic';

// --- SECURITY: ANTI-SCRAPING RATE LIMITER (LGPD Protection) ---
const statusRateLimitMap = new Map<string, { count: number; timestamp: number }>();
const STATUS_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_STATUS_REQUESTS = 25; // Limite por IP para impedir enumeração e scraping de pedidos

// --- SECURITY: LGPD DATA MASKING ---
function maskCustomerName(name: string): string {
    if (!name) return 'Cliente';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first} ${lastInitial}.`;
}

function maskPhone(phone: string): string {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 3)}****-${clean.slice(7)}`;
    }
    if (clean.length === 10) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 3)}***-${clean.slice(6)}`;
    }
    return phone.length > 4 ? phone.slice(0, 4) + '****' + phone.slice(-2) : '****';
}

function maskAddress(addr: any) {
    if (!addr || typeof addr !== 'object') return null;
    const cep = (addr.postal_code || addr.cep || '').replace(/\D/g, '');
    const maskedCep = cep.length === 8 ? `${cep.slice(0, 5)}-***` : cep;

    return {
        street: addr.street || '',
        number: '***',
        complement: '',
        neighborhood: addr.neighborhood || '',
        city: addr.city || '',
        state: addr.state || '',
        postal_code: maskedCep,
        cep: maskedCep,
    };
}

export async function GET(request: Request) {
    try {
        // Anti-scraping rate check
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const nowMs = Date.now();
        const hit = statusRateLimitMap.get(ip);

        if (hit && (nowMs - hit.timestamp) < STATUS_RATE_LIMIT_WINDOW) {
            if (hit.count >= MAX_STATUS_REQUESTS) {
                console.warn(`🚨 BLOCKED: Status query rate limit exceeded by IP: ${ip}`);
                return NextResponse.json({ ok: false, error: 'Muitas consultas. Aguarde um instante.' }, { status: 429 });
            }
            hit.count++;
        } else {
            statusRateLimitMap.set(ip, { count: 1, timestamp: nowMs });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id') || searchParams.get('session_id') || searchParams.get('order_id');

        if (!id) {
            return NextResponse.json({ ok: false, error: 'ID do pedido não informado' }, { status: 400 });
        }

        const cleanId = id.replace(/[^0-9a-zA-Z_]/g, '');
        if (cleanId.length < 4) {
            return NextResponse.json({ ok: false, error: 'Identificador do pedido inválido' }, { status: 400 });
        }

        // Tenta buscar diretamente pelo ID
        let docSnap = await adminDb.collection('orders').doc(cleanId).get();

        // Se não encontrar, tenta com prefixo ORDER_
        if (!docSnap.exists && !cleanId.startsWith('ORDER_')) {
            docSnap = await adminDb.collection('orders').doc(`ORDER_${cleanId}`).get();
        }

        // Se ainda não encontrar, pesquisa pelo campo id no documento
        if (!docSnap.exists) {
            const querySnap = await adminDb.collection('orders')
                .where('id', '==', cleanId)
                .limit(1)
                .get();

            if (!querySnap.empty) {
                docSnap = querySnap.docs[0];
            }
        }

        // Se ainda não encontrar (ex: cliente digitou os 6 dígitos finais como 488243)
        if (!docSnap.exists && cleanId.length >= 4) {
            const recentSnap = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(100).get();
            const found = recentSnap.docs.find(d => {
                const docId = d.id;
                const fieldId = d.data()?.id ? String(d.data().id) : '';
                return docId.includes(cleanId) || fieldId.includes(cleanId);
            });
            if (found) {
                docSnap = found;
            }
        }

        if (!docSnap || !docSnap.exists) {
            return NextResponse.json({ ok: false, error: 'Pedido não encontrado' }, { status: 404 });
        }

        const data = docSnap.data() || {};
        
        let items = Array.isArray(data.items) ? data.items : [];
        items = items.map((it: any) => {
            const prodId = it.productId || it.id;
            const found = productControl.find((p: any) => p.id === prodId || p.technicalName === prodId);
            return {
                ...it,
                image: it.image || found?.images?.[0] || '',
            };
        });

        const rawStatus = (data.status || 'pendente').toLowerCase();
        const displayStatus = (rawStatus === 'pago_aprovado' || rawStatus === 'approved' || rawStatus === 'paid')
            ? 'pago'
            : rawStatus;

        // Retorna informações seguras com mascaramento LGPD para exibição pública
        return NextResponse.json({
            ok: true,
            order: {
                id: docSnap.id,
                customerName: maskCustomerName(data.customerName),
                customerPhone: maskPhone(data.customerPhone),
                address: maskAddress(data.address),
                items,
                status: displayStatus,
                totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
                shippingAmount: typeof data.shippingAmount === 'number' ? data.shippingAmount : 0,
                createdAt: data.createdAt || null,
                deadlineDate: data.deadlineDate || null,
                trackingCode: data.trackingCode || data.superfrete?.tracking || null,
                trackingUrl: data.trackingUrl || data.superfrete?.trackingUrl || null,
                postedAt: data.postedAt || null,
            }
        });
    } catch (e: any) {
        console.error('Erro ao buscar status público do pedido:', e);
        return NextResponse.json({ ok: false, error: 'Erro ao consultar pedido no servidor' }, { status: 500 });
    }
}
