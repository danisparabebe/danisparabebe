import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
            const orderId = session.metadata?.orderId;

            if (!orderId) {
                console.error('No order ID in session metadata');
                return NextResponse.json({ error: 'No order ID' }, { status: 400 });
            }

            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'paid',
                stripeSessionId: session.id,
                paidAt: new Date(),
                customerEmail: session.customer_details?.email,
                amountPaid: session.amount_total ? session.amount_total / 100 : 0,
            });

            console.log(`Order ${orderId} marked as paid`);

            // Trigger n8n Webhook for WhatsApp automation
            const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
            if (n8nWebhookUrl) {
                try {
                    await fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId,
                            customerName: session.customer_details?.name,
                            customerEmail: session.customer_details?.email,
                            amount: session.amount_total ? session.amount_total / 100 : 0,
                            items: session.metadata, // Pass metadata (product info)
                        }),
                    });
                    console.log('n8n webhook triggered successfully');
                } catch (n8nError) {
                    console.error('Failed to trigger n8n webhook:', n8nError);
                    // Don't fail the request if n8n fails, just log it
                }
            }

        } catch (error) {
            console.error('Error updating order:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
