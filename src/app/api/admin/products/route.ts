import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder') || '';

        const productsDir = path.join(process.cwd(), 'public', 'produtos', folder);

        if (!fs.existsSync(productsDir)) {
            return NextResponse.json({ files: [] });
        }

        const files = fs.readdirSync(productsDir)
            .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
            .map(file => {
                const jsonPath = path.join(productsDir, file.replace(/\.[^/.]+$/, '.json'));
                let published = false;
                let metadata: any = {};
                if (fs.existsSync(jsonPath)) {
                    try {
                        const content = fs.readFileSync(jsonPath, 'utf8');
                        metadata = JSON.parse(content);
                        published = !!metadata.published;
                    } catch (e) {
                        console.error('Error reading JSON meta', e);
                    }
                }
                return { filename: file, ...metadata, published };
            });

        // Filter by published status if requested
        const publishedFilter = searchParams.get('published');
        if (publishedFilter !== null) {
            const isPublished = publishedFilter === 'true';
            return NextResponse.json({ files: files.filter(f => f.published === isPublished) });
        }

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Error listing files:', error);
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }
}
