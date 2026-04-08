import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { filename, action } = await req.json(); // action: 'publish' | 'unpublish'

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        const productsDir = path.join(process.cwd(), 'public', 'produtos');
        const conferidosDir = path.join(productsDir, 'conferidos');

        // We only publish items that are in the 'conferidos' folder
        const jsonFilename = filename.replace(/\.[^/.]+$/, '.json');
        const jsonPath = path.join(conferidosDir, jsonFilename);

        if (!fs.existsSync(jsonPath)) {
            return NextResponse.json({ error: 'Configuration not found. Please verify the product first.' }, { status: 404 });
        }

        // Read and update JSON
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        let metadata = JSON.parse(fileContent);

        metadata.published = action === 'publish';
        metadata.publishedAt = action === 'publish' ? new Date().toISOString() : null;

        fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

        return NextResponse.json({ success: true, published: metadata.published });
    } catch (error: any) {
        console.error('Publish error:', error);
        return NextResponse.json({ error: 'Failed to update publication status' }, { status: 500 });
    }
}
