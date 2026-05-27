import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cep = searchParams.get('cep');

    if (!cep || cep.length !== 8) {
        return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (!response.ok) {
            throw new Error(`ViaCEP error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error proxying ViaCEP:', error);
        return NextResponse.json({ error: 'Erro ao buscar CEP' }, { status: 500 });
    }
}
