import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ManagedProduct } from '@/types/admin';

export async function POST(req: Request) {
    try {
        const { products } = await req.json();

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ error: 'Products array is required' }, { status: 400 });
        }

        // 1. Grava no banco de dados principal (src/data/product-control.ts)
        const filePath = path.join(process.cwd(), 'src', 'data', 'product-control.ts');
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const code = `import { ManagedProduct } from '@/types/admin';\n\nexport const productControl: ManagedProduct[] = ${JSON.stringify(products, null, 4)};\n`;
        fs.writeFileSync(filePath, code, 'utf8');

        // 2. Sincroniza os arquivos de metadados originais (public/produtos/conferidos/[id].json)
        const conferidosDir = path.join(process.cwd(), 'public', 'produtos', 'conferidos');
        let syncedJsonCount = 0;

        if (fs.existsSync(conferidosDir)) {
            for (const p of products) {
                if (!p.id) continue;
                
                // Tenta achar o arquivo json correspondente
                const possiblePaths = [
                    path.join(conferidosDir, `${p.id}.json`),
                    path.join(conferidosDir, `${p.id}_01.json`),
                ];

                for (const jsonPath of possiblePaths) {
                    if (fs.existsSync(jsonPath)) {
                        try {
                            const raw = fs.readFileSync(jsonPath, 'utf8');
                            const meta = JSON.parse(raw);
                            
                            const updatedMeta = {
                                ...meta,
                                customName: p.name,
                                description: p.description,
                                observations: p.description,
                                images: p.images,
                                colorVariations: p.colorVariations || [],
                                published: true,
                                updatedAt: new Date().toISOString()
                            };

                            fs.writeFileSync(jsonPath, JSON.stringify(updatedMeta, null, 2), 'utf8');
                            syncedJsonCount++;
                            break;
                        } catch (err) {
                            console.error(`Erro ao sincronizar json para ${p.id}:`, err);
                        }
                    }
                }
            }
        }

        // 3. Sincroniza a lista de produtos ativos do MVP (src/data/mvp-config.ts)
        const activeMvpIds = products
            .filter((p: ManagedProduct) => p.mvpEnabled === true)
            .map((p: ManagedProduct) => p.shortCode || p.id);

        if (activeMvpIds.length > 0) {
            const mvpConfigFile = path.join(process.cwd(), 'src', 'data', 'mvp-config.ts');
            const mvpContent = `/**
 * =====================================================================
 * CONFIGURAÇÃO DOS PRODUTOS DO PROTÓTIPO MVP (www.danisparabebe.com.br)
 * Sincronizado automaticamente com o Banco de Dados Principal
 * =====================================================================
 */

export const MVP_PRODUCT_SELECTION: string[] = ${JSON.stringify(activeMvpIds, null, 4)};
`;
            try {
                fs.writeFileSync(mvpConfigFile, mvpContent, 'utf8');
            } catch (err) {
                console.error("Erro ao sincronizar mvp-config.ts:", err);
            }
        }

        return NextResponse.json({
            success: true,
            count: products.length,
            syncedJsonCount,
            activeMvpCount: activeMvpIds.length
        });
    } catch (error: any) {
        console.error('Save MVP error:', error);
        return NextResponse.json({ error: 'Failed to save MVP data' }, { status: 500 });
    }
}
