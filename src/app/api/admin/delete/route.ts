import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { filename } = await req.json();

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }
        const productsDir = path.join(process.cwd(), 'public', 'produtos');
        const conferidosDir = path.join(productsDir, 'conferidos');
        const uploadsProductsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        
        const possiblePaths = [
            path.join(productsDir, filename),
            path.join(conferidosDir, filename),
            path.join(uploadsProductsDir, filename)
        ];

        let deleted = false;
        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);

                // Delete JSON sidecar if it exists
                const jsonPath = filePath.replace(path.extname(filePath), '.json');
                if (fs.existsSync(jsonPath)) {
                    fs.unlinkSync(jsonPath);
                }

                deleted = true;
                break;
            }
        }

        if (deleted) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
