import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { productControl } from '@/data/product-control';
import { generateProductDescription } from '@/lib/description-generator';
import { KIT_RECIPES } from '@/data/admin-options';

/**
 * POST /api/admin/regenerate-descriptions
 * 
 * Regenera as descrições de todos os produtos em product-control.ts
 * usando o novo gerador inteligente.
 */
export async function POST() {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'product-control.ts');
        let fileContent = fs.readFileSync(filePath, 'utf8');

        let updatedCount = 0;

        for (const product of productControl) {
            // Parse composition from features array (e.g. ["1x FRG", "1x FRP", "1x MNT"])
            const composition: { type: string; qty: number }[] = [];

            if (product.features && product.features.length > 0) {
                for (const feat of product.features) {
                    const match = feat.match(/(\d+)x?\s+(\w+)/);
                    if (match) {
                        composition.push({ type: match[2], qty: parseInt(match[1]) });
                    }
                }
            }

            // If no composition found from features, try to infer from name + KIT_RECIPES
            if (composition.length === 0) {
                const kitMatch = KIT_RECIPES.find(r => 
                    product.name.toLowerCase().includes(r.name.toLowerCase().replace('kit ', ''))
                );
                if (kitMatch) {
                    for (const [type, qty] of Object.entries(kitMatch.items)) {
                        composition.push({ type, qty: qty as number });
                    }
                }
            }

            // Extract theme and color from technical ID (e.g. FEM-KIT-MON-RSE-BAB-RSE)
            const idParts = product.id.split('-');
            const category = idParts[0] || 'UNI'; // FEM, MAS, UNI
            const theme = idParts[2] || '';        // MON, SAF, JDE, etc.
            const color = idParts[3] || '';        // RSE, VDM, LIL, etc.
            const detail = idParts[4] || '';       // BAB, POA, etc.

            // Generate new description
            const newDesc = generateProductDescription({
                name: product.name,
                composition,
                theme,
                color,
                category,
                detail,
            });

            // Escape the description for JSON embedding
            const escapedDesc = JSON.stringify(newDesc);

            // Replace the old description in the file content
            // Find the product block and replace only the description field
            const oldDescEscaped = JSON.stringify(product.description);
            if (fileContent.includes(oldDescEscaped)) {
                fileContent = fileContent.replace(oldDescEscaped, escapedDesc);
                updatedCount++;
            }
        }

        // Write updated content back to file
        fs.writeFileSync(filePath, fileContent, 'utf8');

        return NextResponse.json({ 
            success: true, 
            updated: updatedCount, 
            total: productControl.length 
        });
    } catch (error: any) {
        console.error('Regenerate descriptions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
