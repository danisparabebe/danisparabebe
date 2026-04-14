import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BORDADOS_DIR = path.join(process.cwd(), 'bordados');
const DATA_FILE = path.join(process.cwd(), 'src/data/bordados-data.json');

// Helper to ensure data file exists
const ensureDataFile = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 4));
    }
};

export async function GET() {
    try {
        if (!fs.existsSync(BORDADOS_DIR)) {
            fs.mkdirSync(BORDADOS_DIR, { recursive: true });
        }

        const files = fs.readdirSync(BORDADOS_DIR);
        
        // Filter out non-images (optional, but good practice)
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
        });

        // Read relationships
        ensureDataFile();
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        const relationships = JSON.parse(rawData);

        // Build list with metadata
        const bordadosList = imageFiles.map(file => {
            return {
                id: file, // Use filename as ID
                name: file.replace(/\.[^/.]+$/, ""), // Strip extension for display name
                filename: file,
                url: `/bordados/${encodeURIComponent(file)}`
            };
        });

        return NextResponse.json({
            success: true,
            bordados: bordadosList,
            relationships: relationships
        });

    } catch (error: any) {
        console.error('Error fetching bordados:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, linkedBordados } = body;

        ensureDataFile();
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        const relationships = JSON.parse(rawData);

        relationships[productId] = linkedBordados;

        fs.writeFileSync(DATA_FILE, JSON.stringify(relationships, null, 4));

        return NextResponse.json({ success: true, message: 'Relações salvas com sucesso.' });
    } catch (error: any) {
        console.error('Error saving bordados relationships:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
