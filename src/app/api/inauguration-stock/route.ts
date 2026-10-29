import { NextResponse } from 'next/server';
import { getInaugurationStock } from '@/lib/inauguration-stock';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stock = await getInaugurationStock();
        return NextResponse.json(stock, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
        });
    } catch (error) {
        console.error('Erro na rota /api/inauguration-stock:', error);
        return NextResponse.json({
            fem: { initial: 5, sold: 0, available: 5, isSoldOut: false },
            mas: { initial: 5, sold: 0, available: 5, isSoldOut: false },
            totalAvailable: 10,
        }, { status: 200 });
    }
}
