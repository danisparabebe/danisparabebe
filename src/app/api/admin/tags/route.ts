import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { productId, tags } = await req.json();

        if (!productId || !Array.isArray(tags)) {
            return NextResponse.json({ error: 'ID do produto e array de tags são obrigatórios.' }, { status: 400 });
        }

        const dataFilePath = path.join(process.cwd(), 'src', 'data', 'product-control.ts');
        
        if (!fs.existsSync(dataFilePath)) {
            return NextResponse.json({ error: 'Arquivo product-control.ts não encontrado.' }, { status: 404 });
        }

        let fileContent = fs.readFileSync(dataFilePath, 'utf-8');

        // We need to carefully parse and replace just the tags array for the specific product ID.
        // It's safer to use a regex or string manipulation than eval() to keep formatting.
        
        // Find the block for this product
        const idStr = `"id": "${productId}"`;
        const idIndex = fileContent.indexOf(idStr);
        
        if (idIndex === -1) {
             return NextResponse.json({ error: 'Produto não encontrado no controle.' }, { status: 404 });
        }

        // Find where the tags array starts after this ID
        const tagsStartMatch = fileContent.substring(idIndex).match(/"tags":\s*\[/);
        
        if (tagsStartMatch && tagsStartMatch.index !== undefined) {
             const tagsStartIndex = idIndex + tagsStartMatch.index;
             const tagsEndIndex = fileContent.indexOf(']', tagsStartIndex);
             
             if (tagsEndIndex !== -1) {
                 // Format the new tags array
                 const newTagsString = `"tags": [\n            ${tags.map(t => `"${t}"`).join(',\n            ')}\n        ]`;
                 
                 // Replace the old tags array with the new one
                 fileContent = fileContent.substring(0, tagsStartIndex) + newTagsString + fileContent.substring(tagsEndIndex + 1);
                 
                 fs.writeFileSync(dataFilePath, fileContent, 'utf-8');
                 return NextResponse.json({ success: true, message: 'Tags atualizadas com sucesso!' });
             }
        } else {
             // If there's no tags array, we should technically add it, but currently all products have a tags array.
             // For safety, let's just log it.
             return NextResponse.json({ error: 'Array de tags não encontrado para este produto.' }, { status: 500 });
        }
        
    } catch (error: any) {
        console.error('Error updating tags:', error);
        return NextResponse.json({ error: error.message || 'Erro interno ao atualizar tags.' }, { status: 500 });
    }
}
