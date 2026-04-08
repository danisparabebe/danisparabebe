import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

// --- SECURITY: RATE LIMITING IN-MEMORY (Anti-Bot) ---
// Evita ataques cibernéticos de spam massivo na API gerando faturas falsas para esgotar cota.
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 5; // Limite rigoroso (5 compras por minuto por IP é razoável)

// --- SECURITY: SCHEMA VALIDATION (Zod) ---
// Qualquer json ou payload malicioso injetado será barrado imediatamente.
const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().max(100),
    name: z.string().max(150),
    price: z.number().nonnegative(),
    quantity: z.number().int().positive().max(100),
    personalization: z.any().optional() // Podem vir campos variados, deixamos passar mas validamos o topo
  })).min(1, "Carrinho vazio."),
  shipping: z.number().nonnegative().optional(),
  customer: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(8).max(20),
    street: z.string().max(150).optional(),
    number: z.string().max(20).optional(),
    complement: z.string().max(100).optional(),
    neighborhood: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(2).optional(),
    cep: z.string().max(20).optional()
  }),
  cancelPath: z.string().optional()
});

function addBusinessDays(baseDate: Date, daysToAdd: number): Date {
    let current = new Date(baseDate);
    let added = 0;
    while (added < daysToAdd) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { 
            added++;
        }
    }
    return current;
}

export async function POST(request: Request) {
    try {
        // --- SECURITY CHECK 1: RATE LIMITING ---
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const nowMs = Date.now();
        const hit = rateLimitMap.get(ip);
        
        if (hit && (nowMs - hit.timestamp) < RATE_LIMIT_WINDOW) {
            if (hit.count >= MAX_REQUESTS_PER_WINDOW) {
                console.error(`🚨 BLOCKED: Rate limit exceeded by IP: ${ip}`);
                return NextResponse.json({ error: 'Muitas requisições. Você foi bloqueado temporariamente por segurança.' }, { status: 429 });
            }
            hit.count++;
        } else {
            rateLimitMap.set(ip, { count: 1, timestamp: nowMs });
        }

        const body = await request.json();
        
        // --- SECURITY CHECK 2: PAYLOAD SANITIZATION ---
        const parseResult = checkoutSchema.safeParse(body);
        if (!parseResult.success) {
            console.error('🚨 BLOCKED: Invalid Payload injected:', parseResult.error.format());
            // Leak prevention: Não mandamos o objeto Zod pro front-end parar evitar analise do hacker
            return NextResponse.json({ error: 'Dados fornecidos estão mal-formados ou inválidos.' }, { status: 400 });
        }
        
        // Agora usamos os dados higienizados ("Limpos e verificados")
        const { items, shipping, customer, cancelPath } = parseResult.data;

        console.log('\n========== DEBUG CHECKOUT ==========');
        console.log('📦 Segurança passou. Request limpo:', customer.name);

        // 1. Structure Line Items for InfinitePay
        const ipItems = items.map((item: any) => {
            let desc = item.name;
            if (item.personalization?.name) {
                desc += ` (Bordado: ${item.personalization.name} | Tema: ${item.personalization.theme})`;
            }

            const mapped = {
                description: desc.substring(0, 255),
                price: Math.round(item.price * 100),
                quantity: item.quantity || 1,
            };
            console.log('🏷️ Item mapped:', JSON.stringify(mapped));
            return mapped;
        });

        // 2. Add Shipping as a Line Item (if greater than 0)
        if (shipping && shipping > 0) {
            const shippingItem = {
                description: `Frete`,
                price: Math.round(shipping * 100),
                quantity: 1,
            };
            ipItems.push(shippingItem);
            console.log('🚚 Shipping item added:', JSON.stringify(shippingItem));
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const orderId = `ORDER_${Date.now()}`;
        const totalAmount = ipItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

        console.log('💰 Total amount (cents):', totalAmount);
        console.log('💰 Total amount (reais):', totalAmount / 100);

        // 3. Pre-Register order in Firebase (Pendente)
        const now = new Date();
        const deadline = addBusinessDays(now, 12);
        
        try {
            const orderData = {
                id: orderId,
                customerName: customer?.name || 'Cliente',
                customerEmail: customer?.email || '',
                customerPhone: customer?.phone || '',
                address: {
                    line1: [customer?.street, customer?.number].filter(Boolean).join(', '),
                    line2: [customer?.complement, customer?.neighborhood].filter(Boolean).join(' - '),
                    city: customer?.city,
                    state: customer?.state,
                    postal_code: customer?.cep,
                },
                items: items,
                totalAmount: totalAmount / 100,
                shippingAmount: shipping || 0,
                createdAt: now.toISOString(),
                deadlineDate: deadline.toISOString(),
                status: 'pendente'
            };

            const sanitizedData = JSON.parse(JSON.stringify(orderData));
            
            setDoc(doc(db, 'orders', orderId), sanitizedData)
                .then(() => console.log(`✅ Pre-registered Order ${orderId} in Firebase.`))
                .catch(err => console.error("❌ Failed to pre-register in Firebase:", err));

        } catch (dbErr) {
            console.error("❌ Failed to parse order data for pre-register:", dbErr);
        }

        // 4. Create InfinitePay Checkout Session
        const ipHandle = process.env.NEXT_PUBLIC_INFINITEPAY_HANDLE;
        console.log('🏪 Handle:', ipHandle);
        if (!ipHandle) throw new Error("NEXT_PUBLIC_INFINITEPAY_HANDLE is missing in .env.local");
        
        const ipPayload = {
            handle: ipHandle,
            amount: totalAmount,
            order_nsu: orderId,
            redirect_url: `${baseUrl}/sucesso?session_id=${orderId}`,
            items: ipItems.map((item: any) => ({
                description: item.description,
                price: item.price,
                quantity: item.quantity,
            }))
        };

        console.log('\n🚀 PAYLOAD ENVIADO PARA INFINITEPAY:');
        console.log(JSON.stringify(ipPayload, null, 2));

        const ipResponse = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ipPayload)
        });

        console.log('\n📡 RESPOSTA DA INFINITEPAY:');
        console.log('  Status:', ipResponse.status, ipResponse.statusText);
        console.log('  Headers:', JSON.stringify(Object.fromEntries(ipResponse.headers.entries())));

        const rawResponseText = await ipResponse.text();
        console.log('  Body (raw):', rawResponseText);

        if (!ipResponse.ok) {
            console.error('❌ InfinitePay retornou erro! Status:', ipResponse.status);
            console.error('❌ Body completo:', rawResponseText);
            throw new Error(`InfinitePay error ${ipResponse.status}: ${rawResponseText}`);
        }

        const ipResponseData = JSON.parse(rawResponseText);
        console.log('✅ URL gerada:', ipResponseData.url);
        console.log('========== FIM DEBUG CHECKOUT ==========\n');
        
        return NextResponse.json({ url: ipResponseData.url });

    } catch (error: any) {
        console.error('\n❌❌❌ ERRO FATAL NO CHECKOUT:', error);
        console.error('Stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
