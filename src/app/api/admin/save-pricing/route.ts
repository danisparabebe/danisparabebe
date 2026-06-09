import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { performReprice } from '../reprice/route';

export async function POST(req: Request) {
    try {
        const { unitPrices, kitPrices } = await req.json();

        if (!unitPrices || !kitPrices) {
            return NextResponse.json({ error: 'Missing pricing data objects' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'src', 'data', 'pricing-data.ts');

        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const code = `// PREÇOS LÍQUIDOS AVULSOS
export const UNIT_PRICES_NET: Record<string, number> = ${JSON.stringify(unitPrices, null, 4)};

// PREÇOS LÍQUIDOS DE KITS (Exceções ou Descontos Manuais de Kit)
export const KIT_PRICES_NET: Record<string, number> = ${JSON.stringify(kitPrices, null, 4)};
`;

        fs.writeFileSync(filePath, code, 'utf8');

        // Immediately trigger the reprice script to update all kits with the new part costs
        // We call it directly to avoid Next.js dev server fetch deadlocks
        try {
            await performReprice(unitPrices, kitPrices);
        } catch (err) {
            console.error("Auto-reprice after save-pricing failed:", err);
        }

        revalidatePath('/admin/precificacao');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save Pricing error:', error);
        return NextResponse.json({ error: 'Failed to save Pricing data' }, { status: 500 });
    }
}
