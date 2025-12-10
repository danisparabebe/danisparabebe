import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Stripe Secret Key not configured' },
            { status: 500 }
        );
    }

    try {
        const { items } = await req.json();

        // Format items for Stripe
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'brl',
                product_data: {
                    name: item.name,
                    description: item.personalization
                        ? `Personalização: ${item.personalization.name} (${item.personalization.theme})`
                        : undefined,
                    images: item.image ? [item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_APP_URL || 'https://danisparabebe.com'}${item.image}`] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        );
    }
}
