import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MVP_PRODUCT_SELECTION } from '@/data/mvp-config';

export async function GET() {
    return NextResponse.json({ selected: MVP_PRODUCT_SELECTION });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { selectedIds } = body;

        if (!Array.isArray(selectedIds)) {
            return NextResponse.json({ error: 'Formato inválido. Esperado array de IDs.' }, { status: 400 });
        }

        // Garante exatamente 10 slots
        const slots: string[] = [];
        for (let i = 0; i < 10; i++) {
            slots.push(selectedIds[i] || '');
        }

        const targetFile = path.join(process.cwd(), 'src', 'data', 'mvp-config.ts');

        const fileContent = `/**
 * =====================================================================
 * CONFIGURAÇÃO DOS PRODUTOS DO PROTÓTIPO MVP (www.danisparabebe.com.br)
 * Gerado automaticamente pelo Painel de Seleção Visual
 * =====================================================================
 */

export const MVP_PRODUCT_SELECTION: string[] = ${JSON.stringify(slots, null, 4)};
`;

        fs.writeFileSync(targetFile, fileContent, 'utf8');

        return NextResponse.json({
            success: true,
            message: 'Seleção do MVP atualizada com sucesso!',
            selected: slots
        });
    } catch (error: any) {
        console.error('Erro ao salvar MVP:', error);
        return NextResponse.json({ error: error.message || 'Falha ao salvar seleção' }, { status: 500 });
    }
}
