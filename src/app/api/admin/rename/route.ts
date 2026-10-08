import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { oldFilename, newSKU, sourceDir, composition, customName, filters } = await req.json();

        if (!oldFilename || !newSKU || typeof oldFilename !== 'string' || typeof newSKU !== 'string') {
            return NextResponse.json({ error: 'oldFilename e newSKU são obrigatórios' }, { status: 400 });
        }

        const safeOldFilename = path.basename(oldFilename);
        const safeSKU = String(newSKU).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!safeSKU) {
            return NextResponse.json({ error: 'SKU inválido' }, { status: 400 });
        }
        const uploadsProductsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const productsDir = path.join(process.cwd(), 'public', 'produtos');
        const verifiedDir = path.join(productsDir, 'conferidos');

        if (!fs.existsSync(productsDir)) {
            fs.mkdirSync(productsDir, { recursive: true });
        }
        if (!fs.existsSync(verifiedDir)) {
            fs.mkdirSync(verifiedDir, { recursive: true });
        }

        // All renames and organizations should move files to 'conferidos' pending publication
        let targetDir = verifiedDir;

        const candidateFolders = [
            sourceDir ? path.join(process.cwd(), 'public', sourceDir) : null,
            uploadsProductsDir,
            uploadsDir,
            productsDir,
            verifiedDir
        ].filter(Boolean) as string[];

        let oldPath = '';
        for (const dir of candidateFolders) {
            if (!fs.existsSync(dir)) continue;

            const exact = path.join(dir, safeOldFilename);
            if (fs.existsSync(exact)) {
                oldPath = exact;
                break;
            }

            // Fallback: check normalized or decoded filename
            try {
                const decoded = decodeURIComponent(safeOldFilename);
                const decodedPath = path.join(dir, decoded);
                if (fs.existsSync(decodedPath)) {
                    oldPath = decodedPath;
                    break;
                }
            } catch {}

            // Fallback: search directory files by exact match, decoded or normalized match
            try {
                const files = fs.readdirSync(dir);
                const found = files.find(f => 
                    f === safeOldFilename || 
                    f.normalize('NFC') === safeOldFilename.normalize('NFC') ||
                    f.normalize('NFD') === safeOldFilename.normalize('NFD') ||
                    (f.includes(safeOldFilename.slice(0, 13))) // match timestamp prefix if any
                );
                if (found) {
                    oldPath = path.join(dir, found);
                    break;
                }
            } catch (err) {
                console.error(`Error reading directory ${dir}`, err);
            }
        }

        if (!oldPath || !fs.existsSync(oldPath)) {
            console.error(`[Rename] File not found: ${safeOldFilename} in candidate folders:`, candidateFolders);
            return NextResponse.json({ error: `Source file not found: ${safeOldFilename}` }, { status: 404 });
        }

        // Handle sequence numbering
        let attempt = 1;
        let finalFilename = `${safeSKU}_01${path.extname(oldPath)}`;
        let finalPath = path.join(targetDir, finalFilename);

        while (fs.existsSync(finalPath) && finalPath !== oldPath) {
            attempt++;
            const suffix = attempt.toString().padStart(2, '0');
            finalFilename = `${safeSKU}_${suffix}${path.extname(oldPath)}`;
            finalPath = path.join(targetDir, finalFilename);
        }

        // Move file (copy + unlink is safe across partitions/permissions on Windows)
        fs.copyFileSync(oldPath, finalPath);
        if (finalPath !== oldPath) {
            try {
                fs.unlinkSync(oldPath);
            } catch (e) {
                console.warn('Could not remove original file after copy:', e);
            }
        }

        // Handle Metadata (JSON sidecar)
        const oldJsonPath = oldPath.replace(path.extname(oldPath), '.json');
        const newJsonPath = finalPath.replace(path.extname(finalPath), '.json');

        if (fs.existsSync(oldJsonPath)) {
            try {
                fs.copyFileSync(oldJsonPath, newJsonPath);
                if (newJsonPath !== oldJsonPath) {
                    fs.unlinkSync(oldJsonPath);
                }
            } catch (e) {
                console.warn('Could not move old JSON:', e);
            }
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

    } catch (error: any) {
        console.error('Rename error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
