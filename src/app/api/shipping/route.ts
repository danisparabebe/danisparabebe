import { NextResponse } from 'next/server';

const SUPERFRETE_DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjUzOTY2NDEsInN1YiI6IjA4NGd3UkRqOW5YblZ5RnZmMmZmcnZkMjNaNTMifQ.kc-ypJj0RZc5oJew64IUKMIKkaIOOF5KtMmNzTzuPz8';

export async function POST(req: Request) {
    let rawCep = '';
    let totalWeight = 0.8;
    try {
        const body = await req.json();
        rawCep = (body?.cep || '').toString().replace(/\D/g, '');
        if (body?.totalWeight) {
            const parsedWeight = parseFloat(body.totalWeight);
            if (!isNaN(parsedWeight) && parsedWeight > 0) {
                totalWeight = Math.max(0.3, Math.min(30, parsedWeight));
            }
        }
    } catch {
        return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    if (!rawCep || rawCep.length !== 8) {
        return NextResponse.json({ error: 'CEP inválido. Deve conter 8 dígitos.' }, { status: 400 });
    }

    const token = process.env.SUPERFRETE_TOKEN || SUPERFRETE_DEFAULT_TOKEN;
    const originCep = (process.env.NEXT_PUBLIC_ORIGIN_CEP || '16201348').replace(/\D/g, '');

    try {
        // Payload oficial conforme documentação da API SuperFrete
        const payload = {
            from: {
                postal_code: originCep,
            },
            to: {
                postal_code: rawCep,
            },
            services: '1,2,17,3,33', // 1: PAC, 2: SEDEX, 17: Mini Envios, 3: Jadlog, 33: J&T
            options: {
                own_hand: false,
                receipt: false,
                insurance_value: 0,
                use_insurance_value: false,
            },
            package: {
                height: 15,
                width: 25,
                length: 35,
                weight: totalWeight,
            },
        };

        const response = await fetch('https://api.superfrete.com/api/v0/calculator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'DanisParaBebe/1.0 (contato@danisparabebe.com.br)',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SuperFrete API Error:', response.status, errorText);
            throw new Error(`SuperFrete Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('SuperFrete retornou formato inesperado:', data);
            throw new Error('Formato inválido retornado pela SuperFrete');
        }

        // Filtra opções com erro retornado pela SuperFrete e sem preço válido
        const validRates = data.filter((rate: any) => {
            if (rate.has_error || rate.error) return false;
            const price = typeof rate.price === 'number' ? rate.price : parseFloat(rate.price);
            return !isNaN(price) && price > 0;
        });

        // Formata os nomes das transportadoras
        const shippingOptions = validRates.map((rate: any) => {
            const rawName = (rate.name || rate.service_name || '').toUpperCase();
            const carrierName = (rate.company?.name || '').toUpperCase();

            let cleanName = rawName;
            if (rawName.includes('JADLOG') || carrierName.includes('JADLOG') || rawName.includes('.PACKAGE') || rawName.includes('.COM')) {
                cleanName = 'JADLOG';
            } else if (rawName.includes('PAC')) {
                cleanName = 'CORREIOS PAC';
            } else if (rawName.includes('SEDEX')) {
                cleanName = 'CORREIOS SEDEX';
            } else if (rawName.includes('MINI')) {
                cleanName = 'CORREIOS MINI ENVIOS';
            } else if (rawName.includes('J&T') || carrierName.includes('J&T')) {
                cleanName = 'J&T EXPRESS';
            }

            const price = typeof rate.price === 'number' ? rate.price : parseFloat(rate.price);
            const days = rate.delivery_time || (rate.delivery_range ? rate.delivery_range.max : rate.days) || 5;

            return {
                id: rate.id,
                name: cleanName,
                price: parseFloat(price.toFixed(2)),
                days: Number(days),
                carrier: carrierName || cleanName,
            };
        });

        // Filtrar a Loggi (caso venha ativada no token)
        const filteredOptions = shippingOptions.filter((opt: any) =>
            !opt.name.toLowerCase().includes('loggi') &&
            !opt.carrier.toLowerCase().includes('loggi')
        );

        // Ordena por preço crescente (mais barato primeiro)
        filteredOptions.sort((a: any, b: any) => a.price - b.price);

        if (filteredOptions.length === 0) {
            throw new Error('Nenhuma opção de frete disponível no momento');
        }

        return NextResponse.json(filteredOptions);

    } catch (error) {
        console.error('Shipping calculation error:', error);
        // Fallback robusto caso a API da SuperFrete oscile
        return NextResponse.json([
            {
                id: 1,
                name: 'CORREIOS PAC',
                price: 24.90,
                days: 7,
                carrier: 'CORREIOS'
            },
            {
                id: 3,
                name: 'JADLOG',
                price: 18.90,
                days: 5,
                carrier: 'JADLOG'
            },
            {
                id: 2,
                name: 'CORREIOS SEDEX',
                price: 38.90,
                days: 3,
                carrier: 'CORREIOS'
            }
        ]);
    }
}
