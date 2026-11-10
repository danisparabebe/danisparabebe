import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function sanitizeText(str: unknown, maxLen = 150): string {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim()
        .slice(0, maxLen);
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body || !body.customer) {
            return NextResponse.json({ ok: false, message: 'Dados incompletos' }, { status: 400 });
        }

        const { customer, items, totalAmount, source } = body;
        const cleanName = sanitizeText(customer.name, 100);
        const cleanPhone = (customer.phone || '').replace(/\D/g, '').slice(0, 15);

        // Requer no mínimo nome e telefone válido (10 ou 11 dígitos no Brasil)
        if (cleanName.length < 2 || cleanPhone.length < 10) {
            return NextResponse.json({ ok: false, message: 'Nome ou telefone insuficientes' }, { status: 400 });
        }

        const now = new Date();
        const deadline = new Date(now);
        deadline.setDate(deadline.getDate() + 15);

        const cleanStreet = sanitizeText(customer.street, 120);
        const cleanNumber = sanitizeText(customer.number, 20);
        const cleanComplement = sanitizeText(customer.complement, 80);
        const cleanNeighborhood = sanitizeText(customer.neighborhood, 80);
        const cleanCity = sanitizeText(customer.city, 80);
        const cleanState = sanitizeText(customer.state, 2).toUpperCase();
        const cleanCep = (customer.cep || '').replace(/\D/g, '').slice(0, 8);
        const cleanCpf = (customer.cpf || '').replace(/\D/g, '').slice(0, 11);
        const cleanEmail = sanitizeText(customer.email, 100);

        const leadId = `LEAD_${cleanPhone}`;

        const leadData = {
            id: leadId,
            customerName: cleanName,
            customerPhone: cleanPhone,
            customerEmail: cleanEmail,
            customerCpf: cleanCpf,
            address: {
                line1: [cleanStreet, cleanNumber].filter(Boolean).join(', '),
                line2: [cleanComplement, cleanNeighborhood].filter(Boolean).join(' - '),
                street: cleanStreet,
                number: cleanNumber,
                complement: cleanComplement,
                neighborhood: cleanNeighborhood,
                city: cleanCity,
                state: cleanState,
                postal_code: cleanCep,
            },
            items: Array.isArray(items) ? items : [],
            totalAmount: typeof totalAmount === 'number' ? totalAmount : 0,
            status: 'pendente',
            isLead: true,
            source: source || 'checkout',
            createdAt: now.toISOString(),
            deadlineDate: deadline.toISOString(),
            updatedAt: now.toISOString(),
        };

        const sanitized = JSON.parse(JSON.stringify(leadData));
        await adminDb.collection('orders').doc(leadId).set(sanitized, { merge: true });

        console.log(`📥 [LEAD] Carrinho abandonado capturado para ${cleanName} (${cleanPhone})`);
        return NextResponse.json({ ok: true, leadId });

    } catch (err: any) {
        console.error('❌ Erro ao registrar lead abandonado:', err);
        return NextResponse.json({ ok: false, error: err.message || 'Erro interno' }, { status: 500 });
    }
}
