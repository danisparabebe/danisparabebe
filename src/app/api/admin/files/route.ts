import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const productsDir = path.join(process.cwd(), 'public', 'produtos');

    const files: { filename: string; folder: string }[] = [];

    // Scan uploads
    if (fs.existsSync(uploadsDir)) {
        const uploadFiles = fs.readdirSync(uploadsDir).filter(file =>
            /\.(jpg|jpeg|png|webp|svg)$/i.test(file)
        );
        uploadFiles.forEach(f => files.push({ filename: f, folder: 'uploads' }));
    }

    // Scan products root (raw files manually placed there)
    if (fs.existsSync(productsDir)) {
        const productFiles = fs.readdirSync(productsDir).filter(file => {
            const fullPath = path.join(productsDir, file);
            return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png|webp|svg)$/i.test(file);
        });
        // Avoid files that already look like SKUs if possible, but for now let's just include all files in root
        productFiles.forEach(f => files.push({ filename: f, folder: 'produtos' }));
    }

    return NextResponse.json({ files });
}
