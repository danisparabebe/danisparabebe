import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const files: any[] = [];

        const readDirWithStatus = (dir: string, baseStatus: string, folderName: string) => {
            if (!fs.existsSync(dir)) return;
            const items = fs.readdirSync(dir);
            for (const item of items) {
                if (!/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item)) continue;

                const filePath = path.join(dir, item);
                if (!fs.statSync(filePath).isFile()) continue;

                const jsonPath = path.join(dir, item.replace(/\.[^/.]+$/, '.json'));
                let metadata: any = {};
                if (fs.existsSync(jsonPath)) {
                    try {
                        const content = fs.readFileSync(jsonPath, 'utf8');
                        metadata = JSON.parse(content);
                    } catch (e) {
                        console.error('Error reading JSON meta', e);
                    }
                }

                let status = baseStatus;
                if (baseStatus === 'conferido' && metadata.published) {
                    status = 'publicado';
                }

                files.push({
                    filename: item,
                    folder: folderName,
                    status,
                    ...metadata,
                    published: !!metadata.published
                });
            }
        };

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        const productsDir = path.join(process.cwd(), 'public', 'produtos');
        const conferidosDir = path.join(productsDir, 'conferidos');

        readDirWithStatus(uploadsDir, 'upload', 'uploads/products');
        readDirWithStatus(productsDir, 'pendente', 'produtos');
        readDirWithStatus(conferidosDir, 'conferido', 'produtos/conferidos');

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Error listing all photos:', error);
        return NextResponse.json({ error: 'Failed to list photos' }, { status: 500 });
    }
}
