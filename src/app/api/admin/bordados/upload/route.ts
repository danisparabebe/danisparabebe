import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BORDADOS_DIR = path.join(process.cwd(), 'bordados');

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        if (!fs.existsSync(BORDADOS_DIR)) {
            fs.mkdirSync(BORDADOS_DIR, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Use the original filename to allow overwriting if intended
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_ ()]/g, ''); 
        const filePath = path.join(BORDADOS_DIR, safeFilename);

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ 
            success: true, 
            message: 'Bordado salvo com sucesso.',
            bordado: {
                id: safeFilename,
                name: safeFilename.replace(/\.[^/.]+$/, ""),
                filename: safeFilename,
                url: `/api/admin/bordados/image?file=${encodeURIComponent(safeFilename)}`
            }
        });

    } catch (error: any) {
        console.error('Error uploading bordado:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
