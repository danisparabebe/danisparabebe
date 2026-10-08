import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { productControl } from '@/data/product-control';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id') || searchParams.get('session_id') || searchParams.get('order_id');

        if (!id) {
            return NextResponse.json({ ok: false, error: 'ID do pedido não informado' }, { status: 400 });
        }

        const cleanId = id.replace(/[^0-9a-zA-Z_]/g, '');

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

        // Retorna informações seguras para exibição pública do cliente
        return NextResponse.json({
            ok: true,
            order: {
                id: docSnap.id,
                customerName: data.customerName || 'Cliente',
                customerPhone: data.customerPhone || '',
                address: data.address || null,
                items,
                status: displayStatus,
                totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
                shippingAmount: typeof data.shippingAmount === 'number' ? data.shippingAmount : 0,
                createdAt: data.createdAt || null,
                deadlineDate: data.deadlineDate || null,
            }
        });
    } catch (e: any) {
        console.error('Erro ao buscar status público do pedido:', e);
        return NextResponse.json({ ok: false, error: 'Erro ao consultar pedido no servidor' }, { status: 500 });
    }
}
