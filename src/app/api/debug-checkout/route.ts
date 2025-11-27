import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    console.log('--- Debug Checkout Started ---');

    // 1. Check Environment Variables
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        console.error('MISSING_KEY: STRIPE_SECRET_KEY is undefined');
        return NextResponse.json({ error: 'CRITICAL: STRIPE_SECRET_KEY is missing in Vercel Environment Variables.' }, { status: 500 });
    }

    if (stripeKey.startsWith('sk_test_placeholder')) {
        console.error('PLACEHOLDER_KEY: Using placeholder key');
        return NextResponse.json({ error: 'CRITICAL: You are using the PLACEHOLDER Stripe key. Please configure the real key in Vercel.' }, { status: 500 });
    }

    // 2. Initialize Stripe
    try {
        const stripe = new Stripe(stripeKey, {
            apiVersion: '2025-11-17.clover' as any, // Cast to any to avoid TS version mismatch errors if types are old
        });

        // 3. Create Session
        const body = await req.json();
        const { origin } = new URL(req.url); // Or use headers().get('origin')

        console.log('Creating Stripe Session for:', body.productName);

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: body.productName || 'Produto Teste',
                        },
                        unit_amount: 1000, // R$ 10.00 fixed
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/produto-teste`,
        });

        console.log('Session Created:', session.id);
        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe API Error:', error);
        return NextResponse.json({
            error: `Stripe Error: ${error.message}`,
            details: error
        }, { status: 500 });
    }
}
