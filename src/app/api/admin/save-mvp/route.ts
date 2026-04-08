import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { products } = await req.json();

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ error: 'Products array is required' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'src', 'data', 'product-control.ts');

        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Format exactly as the previous copyToClipboard function did
        const code = `import { ManagedProduct } from '@/types/admin';\n\nexport const productControl: ManagedProduct[] = ${JSON.stringify(products, null, 4)};\n`;

        fs.writeFileSync(filePath, code, 'utf8');

        return NextResponse.json({ success: true, count: products.length });
    } catch (error: any) {
        console.error('Save MVP error:', error);
        return NextResponse.json({ error: 'Failed to save MVP data' }, { status: 500 });
    }
}
