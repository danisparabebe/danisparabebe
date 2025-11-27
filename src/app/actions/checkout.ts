'use server';

import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover',
});

export async function createCheckoutSession(orderData: {
    productId: string;
    productName: string;
    fabricId: string;
    fabricName: string;
    embroideryId: string;
    embroideryName: string;
    babyName: string;
    totalPrice: number;
}) {
    try {
        const origin = (await headers()).get('origin') || 'http://localhost:3000';

        // Create order in Firebase first (pending status)
        const orderRef = await addDoc(collection(db, 'orders'), {
            productId: orderData.productId,
            productName: orderData.productName,
            fabricId: orderData.fabricId,
            fabricName: orderData.fabricName,
            embroideryId: orderData.embroideryId,
            embroideryName: orderData.embroideryName,
            babyName: orderData.babyName,
            totalPrice: orderData.totalPrice,
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `Enxoval Personalizado - ${orderData.productName}`,
                            description: `Tecido: ${orderData.fabricName} | Bordado: ${orderData.embroideryName} | Nome: ${orderData.babyName}`,
                            images: [], // Add product images here if available
                        },
                        unit_amount: Math.round(orderData.totalPrice * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                orderId: orderRef.id,
                productId: orderData.productId,
                babyName: orderData.babyName,
            },
            success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/montar-enxoval`,
        });

        return { url: session.url, sessionId: session.id };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Failed to create checkout session');
    }
}
