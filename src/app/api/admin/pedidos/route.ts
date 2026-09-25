import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function toIsoString(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val.toDate === 'function') {
        try {
            return val.toDate().toISOString();
        } catch {
            return null;
        }
    }
    if (typeof val._seconds === 'number') {
        return new Date(val._seconds * 1000).toISOString();
    }
    if (val instanceof Date) {
        return val.toISOString();
    }
    return null;
}

export async function GET() {
    try {
        let snapshot;
        try {
            snapshot = await adminDb.collection('orders').orderBy('createdAt', 'desc').get();
        } catch (orderErr) {
            console.warn('OrderBy createdAt falhou, tentando busca sem ordenação:', orderErr);
            snapshot = await adminDb.collection('orders').get();
        }

        const orders: any[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() || {};
            const createdAt = toIsoString(data.createdAt) || new Date().toISOString();

            // Se deadlineDate não existir, calcula 15 dias a partir de createdAt
            let deadlineDate = toIsoString(data.deadlineDate);
            if (!deadlineDate) {
                const d = new Date(createdAt);
                d.setDate(d.getDate() + 15);
                deadlineDate = d.toISOString();
            }

            let rawStatus = (data.status || 'pendente').toLowerCase();
            if (rawStatus === 'pago_aprovado' || rawStatus === 'approved' || rawStatus === 'paid') {
                rawStatus = 'pago';
            } else if (rawStatus === 'pending') {
                rawStatus = 'pendente';
            }

            const totalAmount = typeof data.totalAmount === 'number'
                ? data.totalAmount
                : (typeof data.totalPrice === 'number' ? data.totalPrice : 0);

            let items = Array.isArray(data.items) ? data.items : [];
            if (items.length === 0 && (data.productName || data.productId)) {
                items = [{
                    id: data.productId || '1',
                    productId: data.productId || '1',
                    name: data.productName || 'Produto Personalizado',
                    quantity: 1,
                    price: totalAmount,
                    personalization: {
                        name: data.babyName,
                        theme: data.embroideryName,
                        color: data.fabricName,
                    }
                }];
            }

            orders.push({
                id: doc.id,
                customerName: data.customerName || data.babyName || data.name || 'Cliente',
                customerEmail: data.customerEmail || data.email || '',
                customerPhone: data.customerPhone || data.phone || '',
                totalAmount,
                createdAt,
                deadlineDate,
                address: data.address || null,
                status: rawStatus,
                items,
                requestedMethod: data.requestedMethod || null,
                shippingAmount: data.shippingAmount || 0,
            });
        });

        // Ordena por data decrescente (mais recente primeiro)
        orders.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ ok: true, orders });
    } catch (err: any) {
        console.error('❌ Erro ao listar pedidos no Admin API:', err);
        return NextResponse.json(
            { ok: false, error: err.message || 'Falha ao buscar pedidos no servidor', orders: [] },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { ok: false, error: 'Campos orderId e status são obrigatórios' },
                { status: 400 }
            );
        }

        const validStatuses = ['pendente', 'pago', 'em_producao', 'conferencia', 'enviado'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { ok: false, error: `Status inválido. Permitidos: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        await adminDb.collection('orders').doc(orderId).update({
            status,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ ok: true, orderId, status });
    } catch (err: any) {
        console.error('❌ Erro ao atualizar status no Admin API:', err);
        return NextResponse.json(
            { ok: false, error: err.message || 'Falha ao atualizar status do pedido' },
            { status: 500 }
        );
    }
}
