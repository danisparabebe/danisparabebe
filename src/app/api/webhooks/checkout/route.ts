import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { OrderConfirmationEmail } from '@/components/email/order-confirmation';
import { resend } from '@/lib/resend';
import { createElement } from 'react';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            // Retrieve line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

            const emailItems = lineItems.data.map((item) => ({
                name: item.description || 'Produto',
                quantity: item.quantity || 1,
                price: (item.amount_total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            }));

            const customerName = session.customer_details?.name || 'Cliente';
            const customerEmail = session.customer_details?.email;
            const orderTotal = (session.amount_total! / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            if (customerEmail && process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Danis Para Bebê <onboarding@resend.dev>', // Should be updated to real domain later
                    to: customerEmail,
                    subject: `Pedido Confirmado! #${session.id.slice(-6).toUpperCase()}`,
                    react: createElement(OrderConfirmationEmail, {
                        customerName,
                        orderId: session.id.slice(-6).toUpperCase(),
                        total: orderTotal,
                        items: emailItems,
                    }),
                });
                console.log(`Email sent to ${customerEmail}`);
            }

            console.log(`Order ${session.id} processed successfully`);

        } catch (error) {
            console.error('Error processing webhook:', error);
            return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
