import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BORDADOS_DIR = path.join(process.cwd(), 'bordados');

// Public image serving route (no auth required)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const file = searchParams.get('file');

        if (!file) {
            return new NextResponse('File not provided', { status: 400 });
        }

        // Security: prevent path traversal
        const safeName = path.basename(file);
        const filePath = path.join(BORDADOS_DIR, safeName);

        if (!fs.existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        
        let contentType = 'image/png';
        const ext = path.extname(safeName).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
        });

    } catch (error: any) {
        console.error('Error serving bordado image (public):', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
