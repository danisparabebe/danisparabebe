import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BORDADOS_DIR = path.join(process.cwd(), 'bordados');
const DATA_FILE = path.join(process.cwd(), 'src/data/bordados-data.json');

// Public READ-ONLY route for the configurator (no auth required)
export async function GET() {
    try {
        if (!fs.existsSync(BORDADOS_DIR)) {
            return NextResponse.json({ success: true, bordados: [], relationships: {} });
        }

        const files = fs.readdirSync(BORDADOS_DIR);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
        });

        // Read relationships
        let relationships: Record<string, any> = {};
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
            relationships = JSON.parse(rawData);
        }

        // Build list — use PUBLIC image route
        const bordadosList = imageFiles.map(file => ({
            id: file,
            name: file.replace(/\.[^/.]+$/, ""),
            filename: file,
            url: `/bordados/${encodeURIComponent(file)}`
        }));

        return NextResponse.json({
            success: true,
            bordados: bordadosList,
            relationships: relationships
        });

    } catch (error: any) {
        console.error('Error fetching bordados (public):', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
