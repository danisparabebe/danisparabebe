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

        // Tenta buscar diretamente pelo ID
        let docSnap = await adminDb.collection('orders').doc(id).get();

        // Se não encontrar, tenta com prefixo ORDER_
        if (!docSnap.exists && !id.startsWith('ORDER_')) {
            docSnap = await adminDb.collection('orders').doc(`ORDER_${id}`).get();
        }

        // Se ainda não encontrar, pesquisa pelo campo id no documento
        if (!docSnap.exists) {
            const querySnap = await adminDb.collection('orders')
                .where('id', '==', id)
                .limit(1)
                .get();

            if (!querySnap.empty) {
                docSnap = querySnap.docs[0];
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

        // Retorna informações seguras para exibição pública do cliente
        return NextResponse.json({
            ok: true,
            order: {
                id: docSnap.id,
                customerName: data.customerName || 'Cliente',
                customerPhone: data.customerPhone || '',
                address: data.address || null,
                items,
                status: data.status || 'pendente',
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
