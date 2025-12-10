import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { createElement } from 'react';

export async function GET() {
    try {
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
        }

        const data = await resend.emails.send({
            from: 'Danis Para Bebê <onboarding@resend.dev>',
            to: 'entregas@resend.dev', // Resend replaces this with your account email automatically in testing
            subject: 'Teste de Email - Danis Para Bebê',
            html: '<h1>Seu sistema de email está funcionando!</h1><p>Se você recebeu isso, a chave API está correta.</p>',
        });

        if (data.error) {
            return NextResponse.json({ error: data.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
