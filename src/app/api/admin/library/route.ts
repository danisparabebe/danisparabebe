import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const productsDir = path.join(process.cwd(), 'public', 'produtos', 'conferidos');

        if (!fs.existsSync(productsDir)) {
            return NextResponse.json({ products: [] });
        }

        const files = fs.readdirSync(productsDir);

        // Find all main images (ending in .jpg/jpeg/png etc regardless of case)
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

        // Group by base name to avoid duplicates if there's _01, _02 etc.
        const productMap = new Map<string, any>();

        for (const file of imageFiles) {
            // Extract core ID: remove extension and any _NN suffix (e.g. _01, _02, _2)
            const id = file.replace(/\.[^/.]+$/, '').replace(/_\d+$/, '');

            // Se já existe, garante que prefere o _01 como capa (se o atual não for e o outro for, ou o atual for _01 e o outro não)
            if (productMap.has(id) && !file.includes('_01')) {
                continue;
            }

            // Try to find JSON metadata using the core ID
            const jsonPath = path.join(productsDir, `${id}.json`);
            let name = id;
            let type = 'Geral';
            let theme = 'Geral';

            if (fs.existsSync(jsonPath)) {
                try {
                    const content = fs.readFileSync(jsonPath, 'utf8');
                    const metadata = JSON.parse(content);
                    name = metadata.customName || `${metadata.type || ''} ${metadata.themeName || ''}`.trim() || id;
                    type = metadata.type || type;
                    theme = metadata.themeName || theme;
                } catch (e) {
                    // ignore parse error
                }
            } else {
                // Fallback tentar JSON equivalente literal com '_01' etc.
                const literalJson = path.join(productsDir, `${file.replace(/\.[^/.]+$/, '')}.json`);
                if (fs.existsSync(literalJson)) {
                    try {
                        const content = fs.readFileSync(literalJson, 'utf8');
                        const metadata = JSON.parse(content);
                        name = metadata.customName || `${metadata.type || ''} ${metadata.themeName || ''}`.trim() || id;
                        type = metadata.type || type;
                        theme = metadata.themeName || theme;
                    } catch (e) { }
                } else {
                    // Fallback parse from ID: FEM-KIT-BAI...
                    const parts = id.split('-');
                    if (parts.length >= 3) {
                        type = parts[1];
                        theme = parts[2] === 'KIT' && parts[3] ? parts[3] : parts[2];
                    }
                }
            }

            productMap.set(id, {
                id,
                name: name.replace(/_/g, ' '),
                image: `/produtos/conferidos/${file}`,
                type,
                theme
            });
        }

        const products = Array.from(productMap.values());
        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error listing product library:', error);
        return NextResponse.json({ error: 'Failed to list library' }, { status: 500 });
    }
}
