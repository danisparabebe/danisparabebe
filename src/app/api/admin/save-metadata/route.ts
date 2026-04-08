import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { filename, folder, composition, customName, filters } = await req.json();

        if (!filename || !folder) {
            return NextResponse.json({ error: 'Filename and folder are required' }, { status: 400 });
        }

        const targetDir = path.join(process.cwd(), 'public', folder);
        const filePath = path.join(targetDir, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const jsonPath = filePath.replace(path.extname(filePath), '.json');

        let metadata: any = {};
        if (fs.existsSync(jsonPath)) {
            try {
                const fileContent = fs.readFileSync(jsonPath, 'utf8');
                metadata = JSON.parse(fileContent);
            } catch (e) {
                console.error('Error reading existing JSON', e);
            }
        }

        metadata = {
            ...metadata,
            ...filters,
            composition: (composition && composition.length > 0) ? composition : (metadata.composition || []),
            customName: (customName !== undefined) ? customName : (metadata.customName || ''),
            updatedAt: new Date().toISOString()
        };

        // ─── Auto-rename the file if classification changed ───
        // Build what the new SKU-based filename SHOULD be from the saved filters
        let newFilename = filename; // default: keep current name
        if (filters && filters.category && filters.type && filters.theme && filters.color) {
            let newSKU = `${filters.category}-${filters.type}-${filters.theme}-${filters.color}`;
            if (filters.detail) newSKU += `-${filters.detail}`;
            if (filters.detailColor && filters.detailColor !== 'PAD') newSKU += `-${filters.detailColor}`;
            if (filters.detailColor2 && filters.detailColor2 !== 'PAD') newSKU += `-${filters.detailColor2}`;
            if (filters.detailColor3 && filters.detailColor3 !== 'PAD') newSKU += `-${filters.detailColor3}`;
            if (filters.detailColor4 && filters.detailColor4 !== 'PAD') newSKU += `-${filters.detailColor4}`;
            if (filters.detailColor5 && filters.detailColor5 !== 'PAD') newSKU += `-${filters.detailColor5}`;
            if (filters.ribbonColor && filters.ribbonColor !== 'PAD') newSKU += `-${filters.ribbonColor}`;

            // Extract the current SKU prefix from the existing filename (everything before the _XX suffix)
            const ext = path.extname(filename);
            const baseName = filename.replace(ext, '');
            // Match the _01, _02 etc suffix  
            const suffixMatch = baseName.match(/_(\d+)$/);
            const suffix = suffixMatch ? suffixMatch[0] : '_01';  // e.g. "_02"
            const currentSKU = suffixMatch ? baseName.replace(/_\d+$/, '') : baseName;

            // Only rename if the SKU portion actually changed
            if (currentSKU !== newSKU) {
                // Find available sequence number for the new SKU
                let attempt = 1;
                let finalFilename = `${newSKU}_${attempt.toString().padStart(2, '0')}${ext}`;
                let finalPath = path.join(targetDir, finalFilename);

                while (fs.existsSync(finalPath) && finalPath !== filePath) {
                    attempt++;
                    finalFilename = `${newSKU}_${attempt.toString().padStart(2, '0')}${ext}`;
                    finalPath = path.join(targetDir, finalFilename);
                }

                // Rename image file
                fs.renameSync(filePath, finalPath);

                // Rename JSON sidecar
                const newJsonPath = finalPath.replace(ext, '.json');
                if (fs.existsSync(jsonPath)) {
                    fs.renameSync(jsonPath, newJsonPath);
                }

                // Write updated metadata to the NEW json path
                fs.writeFileSync(newJsonPath, JSON.stringify(metadata, null, 2));

                return NextResponse.json({ success: true, metadata, renamed: true, newFilename: finalFilename });
            }
        }

        // No rename needed – just write metadata
        fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

        return NextResponse.json({ success: true, metadata });
    } catch (error: any) {
        console.error('Save metadata error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
