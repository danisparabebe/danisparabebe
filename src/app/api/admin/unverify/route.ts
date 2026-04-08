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
        const verifiedDir = path.join(productsDir, 'conferidos');

        const sourcePath = path.join(verifiedDir, filename);
        const destPath = path.join(productsDir, filename);

        if (fs.existsSync(sourcePath)) {
            fs.renameSync(sourcePath, destPath);

            // Move sidecar JSON if exists
            const sourceJson = sourcePath.replace(path.extname(sourcePath), '.json');
            const destJson = destPath.replace(path.extname(destPath), '.json');

            if (fs.existsSync(sourceJson)) {
                fs.renameSync(sourceJson, destJson);
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'File not found in conferidos folder' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Unverify error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
