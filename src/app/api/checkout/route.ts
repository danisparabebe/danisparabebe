import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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
    productId: z.string().max(100).optional(),
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
  userId: z.string().optional(),
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
        const { items, shipping, customer, userId, cancelPath } = parseResult.data;

        console.log('\n========== DEBUG CHECKOUT ==========');
        console.log('📦 Segurança passou. Request limpo:', customer.name, 'UID:', userId || 'Deslogado');

        // --- SECURITY CHECK 3: AUTHENTIC SERVER-SIDE PRICING ---
        // NUNCA confiar no `item.price` vindo do front-end. O cliente pode manipular o payload e pagar R$ 1.
        // Vamos varrer item a item e recalcular o preço real baseado na nossa base de dados.
        const { productControl } = require('@/data/product-control');
        const { calculateProductPrice, BASE_PRICES } = require('@/lib/pricing');
        const { resolveProductId } = require('@/lib/short-codes');
        const fs = require('fs');
        const path = require('path');

        const ipItems = [];
        let calculatedTotalAmountCents = 0;

        // Calcula quantidade total de peças customizadas do "Monte seu Kit" para aplicar o desconto de volume
        const customItemsCount = items.reduce((acc: number, it: any) => {
            const rid = resolveProductId(it.productId || it.id);
            return acc + (rid.startsWith('custom-') ? it.quantity : 0);
        }, 0);

        let kitDiscountPct = 0;
        if (customItemsCount >= 10) kitDiscountPct = 20;
        else if (customItemsCount >= 6) kitDiscountPct = 15;
        else if (customItemsCount >= 4) kitDiscountPct = 10;
        else if (customItemsCount >= 2) kitDiscountPct = 5;

        for (const item of items) {
            let authenticPrice = 0;
            const resolvedId = resolveProductId(item.productId || item.id);

            // 1. Tentar encontrar no Catalog (productControl)
            const managedProduct = productControl.find((p: any) => p.id === resolvedId);
            if (managedProduct) {
                authenticPrice = managedProduct.pixPrice;
            } else if (resolvedId.startsWith('custom-')) {
                // 2. Produto montado no "Monte seu Kit"
                const typeId = resolvedId.replace('custom-', '');
                const basePrice = BASE_PRICES[typeId];
                if (!basePrice) {
                    console.error(`🚨 BLOCKED: Peça customizada inválida: ${typeId}`);
                    return NextResponse.json({ error: `Peça customizada não encontrada: ${item.name}` }, { status: 400 });
                }
                // Aplica o desconto de volume progressivo do kit
                authenticPrice = basePrice * (1 - kitDiscountPct / 100);
            } else {
                // 3. Tentar encontrar no legado (conferidos)
                const productsDir = path.join(process.cwd(), 'public', 'produtos', 'conferidos');
                const jsonPath = path.join(productsDir, `${resolvedId}.json`);
                if (fs.existsSync(jsonPath)) {
                    const content = fs.readFileSync(jsonPath, 'utf8');
                    const metadata = JSON.parse(content);
                    authenticPrice = calculateProductPrice(metadata.composition || [], !!metadata.customName) * 0.95;
                } else {
                    console.error(`🚨 BLOCKED: Tentativa de compra de produto inválido/removido: ${resolvedId}`);
                    return NextResponse.json({ error: `Produto indisponível ou inválido: ${item.name}` }, { status: 400 });
                }
            }

            // O preço agora é unificado na opção 1 (Preço Seco/Pix-base). 
            // A InfinitePay repassará as taxas de cartão de crédito no gateway caso essa forma de pgto seja escolhida.
            let priceCents = Math.round(authenticPrice * 100);

            let desc = item.name;
            if (item.personalization?.name) {
                const temaDesc = item.personalization.theme ? ` | Tema: ${item.personalization.theme}` : '';
                desc += ` (Bordado: ${item.personalization.name}${temaDesc})`;
            }

            const mapped = {
                description: desc.substring(0, 255),
                price: priceCents,
                quantity: item.quantity || 1,
            };
            
            ipItems.push(mapped);
            calculatedTotalAmountCents += (priceCents * mapped.quantity);
            console.log(`🏷️ Item verificado: ${mapped.description} | Preço Segurou: R$ ${(authenticPrice).toFixed(2)}`);
        }

        // 2. Add Shipping as a Line Item (if greater than 0)
        if (shipping && shipping > 0) {
            const shippingCents = Math.round(shipping * 100);
            const shippingItem = {
                description: `Frete`,
                price: shippingCents,
                quantity: 1,
            };
            ipItems.push(shippingItem);
            calculatedTotalAmountCents += shippingCents;
            console.log(`🚚 Shipping verificado: R$ ${(shipping).toFixed(2)}`);
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const orderId = `ORDER_${Date.now()}`;
        const totalAmount = calculatedTotalAmountCents;

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
                userId: userId || '',
                createdAt: now.toISOString(),
                deadlineDate: deadline.toISOString(),
                status: 'pendente',
                requestedMethod: 'infinitepay'
            };

            const sanitizedData = JSON.parse(JSON.stringify(orderData));
            
            adminDb.collection('orders').doc(orderId).set(sanitizedData)
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
