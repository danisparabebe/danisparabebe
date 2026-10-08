import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const SUPERFRETE_TOKEN = process.env.SUPERFRETE_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjUzOTY2NDEsInN1YiI6IjA4NGd3UkRqOW5YblZ5RnZmMmZmcnZkMjNaNTMifQ.kc-ypJj0RZc5oJew64IUKMIKkaIOOF5KtMmNzTzuPz8';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, serviceCode } = body;

        if (!orderId) {
            return NextResponse.json({ ok: false, error: 'orderId é obrigatório' }, { status: 400 });
        }

        const cleanId = orderId.replace(/[^0-9a-zA-Z_]/g, '');

        // Busca o pedido no Firebase
        let docSnap = await adminDb.collection('orders').doc(cleanId).get();
        if (!docSnap.exists && !cleanId.startsWith('ORDER_')) {
            docSnap = await adminDb.collection('orders').doc(`ORDER_${cleanId}`).get();
        }

        if (!docSnap.exists) {
            return NextResponse.json({ ok: false, error: 'Pedido não encontrado no banco' }, { status: 404 });
        }

        const order = docSnap.data() || {};
        const address = order.address || {};

        const destCep = (address.postal_code || address.cep || '').replace(/\D/g, '');
        if (!destCep || destCep.length !== 8) {
            return NextResponse.json({ ok: false, error: 'CEP de entrega inválido no pedido' }, { status: 400 });
        }

        const cleanCpf = (order.customerCpf || address.cpf || '').replace(/\D/g, '');
        const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');

        // Formata os produtos para a Declaração de Conteúdo da SuperFrete
        const productsList = (Array.isArray(order.items) && order.items.length > 0)
            ? order.items.map((it: any) => ({
                name: (it.name || 'Enxoval Bebê Personalizado').substring(0, 50),
                quantity: String(it.quantity || 1),
                unitary_value: Number(it.price || 50).toFixed(2)
            }))
            : [{
                name: 'Enxoval Bebê Personalizado',
                quantity: '1',
                unitary_value: Number(order.totalAmount || 100).toFixed(2)
            }];

        // Serviço: 3 (Jadlog), 1 (PAC), 2 (SEDEX)
        let serviceId = serviceCode || 3;
        if (!serviceCode && order.shippingOption?.name) {
            const shipName = String(order.shippingOption.name).toUpperCase();
            if (shipName.includes('SEDEX')) serviceId = 2;
            else if (shipName.includes('PAC')) serviceId = 1;
            else serviceId = 3;
        }

        const payload = {
            from: {
                name: 'Danis Para Bebê',
                address: 'Rua Geraldo Máximo da Cruz',
                number: '175',
                complement: '',
                district: 'Residencial Jardim Santa Luzia',
                city: 'Birigui',
                state_abbr: 'SP',
                postal_code: (process.env.NEXT_PUBLIC_ORIGIN_CEP || '16201348').replace(/\D/g, ''),
            },
            to: {
                name: (order.customerName || 'Cliente').substring(0, 50),
                address: (address.street || address.line1 || 'Endereço').substring(0, 50),
                number: String(address.number || '').substring(0, 10),
                complement: String(address.complement || '').substring(0, 20),
                district: (address.neighborhood || address.line2 || 'Centro').substring(0, 60),
                city: (address.city || 'São Paulo').substring(0, 50),
                state_abbr: (address.state || 'SP').toUpperCase().substring(0, 2),
                postal_code: destCep,
                document: cleanCpf || '00000000000',
                phone: cleanPhone.length >= 10 ? cleanPhone : '18997518078',
                email: order.customerEmail || null
            },
            service: serviceId,
            products: productsList,
            volumes: {
                height: 15,
                width: 25,
                length: 35,
                weight: Math.max(0.3, Math.min(10, (order.items?.length || 1) * 0.4)),
            },
            options: {
                non_commercial: true, // Declaração de conteúdo
                insurance_value: 0,
                receipt: false,
                own_hand: false,
            },
            platform: 'Danis Para Bebê'
        };

        const sfRes = await fetch('https://api.superfrete.com/api/v0/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
                'User-Agent': 'DanisParaBebe/1.0 (contato@danisparabebe.com.br)'
            },
            body: JSON.stringify(payload)
        });

        const sfData = await sfRes.json();

        if (!sfRes.ok || !sfData?.id) {
            console.error('Erro SuperFrete cart:', sfData);
            return NextResponse.json({
                ok: false,
                error: sfData?.message || sfData?.error || 'Erro ao gerar etiqueta na SuperFrete'
            }, { status: sfRes.status || 400 });
        }

        const cartId = sfData.id;
        const price = sfData.price;

        // Salva a etiqueta no Firebase
        await docSnap.ref.update({
            superfrete: {
                cartId,
                price,
                status: 'pending',
                serviceId,
                createdAt: new Date().toISOString()
            }
        });

        // Tenta finalizar o checkout automaticamente caso haja saldo na carteira
        try {
            const checkoutRes = await fetch('https://api.superfrete.com/api/v0/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
                    'User-Agent': 'DanisParaBebe/1.0 (contato@danisparabebe.com.br)'
                },
                body: JSON.stringify({ orders: [cartId] })
            });

            if (checkoutRes.ok) {
                // Sucesso com saldo! Busca o link do PDF
                const linkRes = await fetch('https://api.superfrete.com/api/v0/tag/link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
                        'User-Agent': 'DanisParaBebe/1.0 (contato@danisparabebe.com.br)'
                    },
                    body: JSON.stringify({ orders: [cartId] })
                });

                if (linkRes.ok) {
                    const linkData = await linkRes.json();
                    const printUrl = linkData?.url || linkData?.link || null;

                    await docSnap.ref.update({
                        'superfrete.status': 'released',
                        'superfrete.printUrl': printUrl
                    });

                    return NextResponse.json({
                        ok: true,
                        cartId,
                        status: 'released',
                        price,
                        printUrl,
                        message: 'Etiqueta paga e emitida com sucesso!'
                    });
                }
            }
        } catch {
            /* Saldo insuficiente ou erro no checkout automático — segue para link no painel */
        }

        return NextResponse.json({
            ok: true,
            cartId,
            status: 'pending',
            price,
            panelUrl: 'https://web.superfrete.com/#/minhas-etiquetas',
            message: 'Etiqueta enviada para o seu painel SuperFrete! Acesse para emitir e imprimir.'
        });

    } catch (err: any) {
        console.error('Erro na rota de geração de etiqueta:', err);
        return NextResponse.json({ ok: false, error: err.message || 'Erro interno no servidor' }, { status: 500 });
    }
}
