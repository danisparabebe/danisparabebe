import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { cep } = await req.json();
    console.log('Calculating shipping for CEP:', cep);
    console.log('SuperFrete Token exists:', !!process.env.SUPERFRETE_TOKEN);

    if (!cep) {
        return NextResponse.json({ error: 'CEP is required' }, { status: 400 });
    }

    if (!process.env.SUPERFRETE_TOKEN) {
        // Fallback if token is missing (dev mode / pending setup)
        return NextResponse.json([
            {
                name: 'PAC',
                price: 25.90,
                days: 7,
                carrier: 'Correios'
            },
            {
                name: 'SEDEX',
                price: 45.90,
                days: 3,
                carrier: 'Correios'
            },
            {
                name: '.Package',
                price: 27.50,
                days: 6,
                carrier: 'Jadlog'
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
            services: '1,2,3,4,14,15,16,17', // IDs das transportadoras comuns: PAC, SEDEX, Jadlog, etc.
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
            throw new Error(`SuperFrete Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Transform SuperFrete response to our format
        const shippingOptions = data.map((rate: any) => {
            const rawName = (rate.name || rate.service_name || '').toUpperCase();
            const carrierName = (rate.company?.name || '').toUpperCase();
            
            // Clean names (Jadlog.Package -> JADLOG)
            let cleanName = rawName;
            
            if (rawName.includes('JADLOG') || carrierName.includes('JADLOG') || rawName.includes('.PACKAGE') || rawName.includes('.COM')) {
                cleanName = 'JADLOG';
            } else if (rawName.includes('PAC')) {
                cleanName = 'CORREIOS PAC';
            } else if (rawName.includes('SEDEX')) {
                cleanName = 'CORREIOS SEDEX';
            }

            return {
                name: cleanName,
                price: parseFloat(rate.price),
                days: rate.delivery_time || rate.days,
                carrier: carrierName,
                id: rate.id
            };
        });

        // Filtrar a Loggi (exigência do cliente)
        const filteredOptions = shippingOptions.filter((opt: any) => 
            !opt.name.toLowerCase().includes('loggi') && 
            !opt.carrier.toLowerCase().includes('loggi')
        );

        return NextResponse.json(filteredOptions);

    } catch (error) {
        console.error('Shipping calculation error:', error);
        // Fallback robusto caso a API da SuperFrete retorne erro de Autorização (Token novo)
        return NextResponse.json([
            {
                name: 'PAC (Estimado)',
                price: 29.90,
                days: 10,
                carrier: 'Correios'
            },
            {
                name: 'SEDEX (Estimado)',
                price: 59.90,
                days: 4,
                carrier: 'Correios'
            },
            {
                name: '.Package (Estimado)',
                price: 32.50,
                days: 8,
                carrier: 'Jadlog'
            }
        ]);
    }
}
