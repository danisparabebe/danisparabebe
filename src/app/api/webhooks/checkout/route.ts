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
            console.log('Retrieving line items for session:', session.id);
            // Retrieve line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            console.log('Line items retrieved:', lineItems?.data?.length);

            const emailItems = lineItems.data.map((item) => ({
                name: item.description || 'Produto',
                quantity: item.quantity || 1,
                price: (item.amount_total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            }));

            const customerName = session.customer_details?.name || 'Cliente';
            const customerEmail = session.customer_details?.email;
            const orderTotal = (session.amount_total! / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            console.log('Preparing email for:', customerEmail); // Safe to log email in logs? Maybe partially mask.

            if (customerEmail && process.env.RESEND_API_KEY) {
                console.log('Attempting to send email via Resend (Fetch API)...');

                // Render email to string (basic approach since we can't easily use ReactDOMServer in Edge/Serverless sometimes without config)
                // Actually, let's keep it simple and just send the HTML directly or use a very basic template string for reliability now
                // We can construct the HTML manually to avoid react-dom/server issues if that's easier, or try to stick with React if build allows.
                // Given the build errors, simpler is better.

                const emailHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #d18d96;">Pedido Confirmado!</h1>
                        <p>Olá, ${customerName}!</p>
                        <p>Seu pedido <strong>#${session.id.slice(-6).toUpperCase()}</strong> foi recebido com sucesso.</p>
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Resumo:</h3>
                            ${emailItems.map(item => `
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0;">
                                    <span>${item.quantity}x ${item.name}</span>
                                    <span>${item.price}</span>
                                </div>
                            `).join('')}
                            <div style="display: flex; justify-content: space-between; margin-top: 15px; font-weight: bold;">
                                <span>Total:</span>
                                <span>${orderTotal}</span>
                            </div>
                        </div>
                        <p>Obrigado por escolher a Danis para Bebê!</p>
                    </div>
                `;

                const resendResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: 'Danis Para Bebê <onboarding@resend.dev>',
                        to: customerEmail,
                        subject: `Pedido Confirmado! #${session.id.slice(-6).toUpperCase()}`,
                        html: emailHtml,
                    }),
                });

                if (!resendResponse.ok) {
                    const errorText = await resendResponse.text();
                    console.error('Resend API Error:', resendResponse.status, errorText);
                    throw new Error(`Resend API Error: ${errorText}`);
                }

                const data = await resendResponse.json();
                console.log(`Email sent successfully to ${customerEmail}. ID: ${data?.id}`);
            } else {
                console.log('Skipping email: Missing email or API Key');
            }

            console.log(`Order ${session.id} processed successfully`);

        } catch (error: any) {
            console.error('Error processing webhook logic:', error);
            // Return JSON with error details for debugging in Stripe Dashboard
            return NextResponse.json({
                error: 'Failed to process order',
                details: error.message,
                stack: error.stack
            }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
