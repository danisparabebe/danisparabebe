import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/bordados-data.json');

// Public READ-ONLY route for the configurator (no auth required)
// Images are served statically from public/bordados/ — this route only returns the relationship data.
export async function GET() {
    try {
        let relationships: Record<string, any> = {};

        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
            relationships = JSON.parse(rawData);
        } else {
            console.warn('[bordados] bordados-data.json not found at:', DATA_FILE);
        }

        // Build a flat list of all unique bordados referenced in the relationships
        const uniqueBordados = new Map<string, any>();
        Object.values(relationships).forEach((embroideries: any) => {
            if (Array.isArray(embroideries)) {
                embroideries.forEach((emb: any) => {
                    if (!uniqueBordados.has(emb.id)) {
                        uniqueBordados.set(emb.id, emb);
                    }
                });
            }
        });

        return NextResponse.json({
            success: true,
            bordados: Array.from(uniqueBordados.values()),
            relationships: relationships
        });

    } catch (error: any) {
        console.error('[bordados] Error fetching bordados (public):', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
