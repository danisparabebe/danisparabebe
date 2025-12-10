import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { cep } = await req.json();

    if (!cep) {
        return NextResponse.json({ error: 'CEP is required' }, { status: 400 });
    }

    if (!process.env.SUPERFRETE_TOKEN) {
        // Fallback if token is missing (dev mode)
        return NextResponse.json([
            {
                name: 'PAC (Simulado)',
                price: 25.90,
                days: 7,
                carrier: 'Correios'
            },
            {
                name: 'SEDEX (Simulado)',
                price: 45.90,
                days: 3,
                carrier: 'Correios'
            }
        ]);
    }

    try {
        // Prepare payload for SuperFrete
        // Using standard package dimensions for a kit
        const payload = {
            from: {
                postal_code: process.env.NEXT_PUBLIC_ORIGIN_CEP || '01001000',
            },
            to: {
                postal_code: cep,
            },
            services: '1,2', // 1=PAC, 2=SEDEX (SuperFrete IDs vary, assuming standard or filtering later)
            options: {
                own_hand: false,
                receipt: false,
                insurance_value: 0,
                use_insurance_value: false,
            },
            package: {
                height: 20,
                width: 30,
                length: 40,
                weight: 1, // 1kg average kit
            },
        };

        const response = await fetch('https://api.superfrete.com/api/v0/calculator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPERFRETE_TOKEN}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SuperFrete API Error:', response.status, errorText);
            throw new Error('Failed to fetch shipping rates');
        }

        const data = await response.json();

        // Transform SuperFrete response to our format
        // Note: Actual SuperFrete response structure might vary, adapting safely
        const shippingOptions = data.map((rate: any) => ({
            name: rate.name || rate.service_name,
            price: parseFloat(rate.price),
            days: rate.delivery_time || rate.days,
            carrier: rate.company?.name || 'Correios',
            id: rate.id
        }));

        return NextResponse.json(shippingOptions);

    } catch (error) {
        console.error('Shipping calculation error:', error);
        // Fallback in case of API error
        return NextResponse.json([
            {
                name: 'PAC (Fixo)',
                price: 29.90,
                days: 10,
                carrier: 'Correios'
            },
            {
                name: 'SEDEX (Fixo)',
                price: 59.90,
                days: 4,
                carrier: 'Correios'
            }
        ]);
    }
}
