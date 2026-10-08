import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('\n========== 📦 WEBHOOK SUPERFRETE RECEBIDO ==========');
        console.log(JSON.stringify(body, null, 2));

        const event = body?.event;
        const data = body?.data;

        if (!data || !data.id) {
            console.warn('⚠️ Webhook SuperFrete recebido sem ID de dados.');
            return NextResponse.json({ ok: true, ignored: true });
        }

        const tagId = data.id;
        const trackingCode = data.tracking || null;
        const trackingUrl = data.tracking_url || (trackingCode ? `https://rastreio.superfrete.com/#/tracking/${trackingCode}` : null);

        // Busca o pedido no Firebase pelo identificador da SuperFrete
        let querySnap = await adminDb.collection('orders')
            .where('superfrete.cartId', '==', tagId)
            .limit(1)
            .get();

        if (querySnap.empty) {
            querySnap = await adminDb.collection('orders')
                .where('superfrete.id', '==', tagId)
                .limit(1)
                .get();
        }

        if (querySnap.empty) {
            console.warn(`⚠️ Nenhum pedido encontrado no Firebase para SuperFrete ID: ${tagId}`);
            return NextResponse.json({ ok: true, detail: 'Order not found in store' });
        }

        const orderDoc = querySnap.docs[0];
        const orderData = orderDoc.data();
        const orderId = orderDoc.id;

        console.log(`✅ Pedido localizado no Firebase: ${orderId} (${orderData.customerName})`);

        const updateData: Record<string, any> = {
            'superfrete.lastEvent': event,
            'superfrete.updatedAt': new Date().toISOString(),
        };

        if (trackingCode) {
            updateData['trackingCode'] = trackingCode;
            updateData['superfrete.tracking'] = trackingCode;
        }
        if (trackingUrl) {
            updateData['trackingUrl'] = trackingUrl;
            updateData['superfrete.trackingUrl'] = trackingUrl;
        }

        // 1. Quando o pedido é postado (o correio ou a transportadora bipou no balcão!)
        if (event === 'order.posted' || data.status === 'posted') {
            console.log(`🚚 PEDIDO POSTADO/BIPADO! Atualizando status para "enviado": ${orderId}`);
            updateData['status'] = 'enviado';
            updateData['postedAt'] = data.posted_at || new Date().toISOString();
            updateData['superfrete.status'] = 'posted';
        }
        // 2. Quando a etiqueta é gerada
        else if (event === 'order.generated' || data.status === 'generated') {
            console.log(`🏷️ Etiqueta gerada com rastreio: ${trackingCode}`);
            updateData['superfrete.status'] = 'generated';
            if (orderData.status === 'pendente') {
                updateData['status'] = 'pago';
            }
        }
        // 3. Quando o pedido é entregue na casa do cliente
        else if (event === 'order.delivered' || data.status === 'delivered') {
            console.log(`🎉 PEDIDO ENTREGUE AO CLIENTE: ${orderId}`);
            updateData['status'] = 'enviado'; // Mantém compatibilidade com filtros da UI
            updateData['isDelivered'] = true;
            updateData['deliveredAt'] = data.delivered_at || new Date().toISOString();
            updateData['superfrete.status'] = 'delivered';
        }

        await orderDoc.ref.update(updateData);
        console.log(`✅ Pedido ${orderId} atualizado com sucesso no Firebase.`);
        console.log('========== 🏁 FIM DO WEBHOOK SUPERFRETE ==========\n');

        return NextResponse.json({ ok: true, orderId, updated: true });

    } catch (err: any) {
        console.error('❌ Erro no webhook SuperFrete:', err);
        return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 });
    }
}
