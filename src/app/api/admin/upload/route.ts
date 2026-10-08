import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const ext = path.extname(file.name).toLowerCase();
        const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        if (!ALLOWED_EXTS.includes(ext)) {
            return NextResponse.json({ error: 'Apenas imagens (JPG, PNG, WEBP, GIF) são permitidas' }, { status: 400 });
        }

        // Usar timestamp e nome higienizado para evitar conflitos e path traversal
        const safeBase = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = `${Date.now()}-${safeBase}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
            url: `/uploads/products/${filename}`
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 });
    }
}
