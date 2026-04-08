import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { oldFilename, newSKU, sourceDir, composition, customName, filters } = await req.json();

        // Validate directories
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const productsDir = path.join(process.cwd(), 'public', 'produtos');
        const verifiedDir = path.join(productsDir, 'conferidos');

        if (!fs.existsSync(productsDir)) {
            fs.mkdirSync(productsDir, { recursive: true });
        }

        let oldPath = '';
        let targetDir = verifiedDir; // All renames and organizations should move files to 'conferidos' pending publication

        if (sourceDir === 'uploads') {
            oldPath = path.join(uploadsDir, oldFilename);
        } else {
            // Check root and subfolders
            const rootPath = path.join(productsDir, oldFilename);
            const subPath = path.join(verifiedDir, oldFilename);

            if (fs.existsSync(rootPath)) {
                oldPath = rootPath;
            } else if (fs.existsSync(subPath)) {
                oldPath = subPath;
            } else {
                oldPath = rootPath; // fallback for failure check
            }
        }

        // Handle sequence numbering
        let attempt = 1;
        let finalFilename = `${newSKU}_01${path.extname(oldFilename)}`;
        let finalPath = path.join(targetDir, finalFilename);

        while (fs.existsSync(finalPath) && finalPath !== oldPath) {
            attempt++;
            const suffix = attempt.toString().padStart(2, '0');
            finalFilename = `${newSKU}_${suffix}${path.extname(oldFilename)}`;
            finalPath = path.join(targetDir, finalFilename);
        }

        // Move file
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, finalPath);

            // Handle Metadata (JSON sidecar)
            // const { composition, customName, filters } = await req.json(); // REMOVED

            // 1. Rename existing JSON if exists (for renames)
            const oldJsonPath = oldPath.replace(path.extname(oldPath), '.json');
            const newJsonPath = finalPath.replace(path.extname(finalPath), '.json');

            if (fs.existsSync(oldJsonPath)) {
                fs.renameSync(oldJsonPath, newJsonPath);
            }

            // 2. Update/Create JSON with new data
            // If composition or customName is provided, write/update the file
            if (composition || customName || filters) {
                let metadata: any = {};
                if (fs.existsSync(newJsonPath)) {
                    try {
                        const fileContent = fs.readFileSync(newJsonPath, 'utf8');
                        metadata = JSON.parse(fileContent);
                    } catch (e) {
                        console.error('Error reading existing JSON', e);
                    }
                }

                metadata = {
                    ...metadata,
                    ...filters, // Save parsed fields for easier access later
                    composition: (composition && composition.length > 0) ? composition : (metadata.composition || []),
                    customName: (customName && customName.trim().length > 0) ? customName : (metadata.customName || ''),
                    updatedAt: new Date().toISOString()
                };

                fs.writeFileSync(newJsonPath, JSON.stringify(metadata, null, 2));
            }

            return NextResponse.json({ success: true, newFilename: finalFilename });
        } else {
            return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
        }

    } catch (error: any) {
        console.error('Rename error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
