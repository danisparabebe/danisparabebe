import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ManagedProduct } from '@/types/admin';
import { productControl } from '@/data/product-control';

export async function POST(req: Request) {
    try {
        const { products } = await req.json();

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ error: 'Products array is required' }, { status: 400 });
        }

        // Garante que todo produto tenha um shortCode permanente (DPB-XXXX) único e sequencial
        const usedCodes = new Set<string>();
        let maxNum = 0;
        
        // Mapeia códigos já usados no catálogo completo
        productControl.forEach((p: ManagedProduct) => {
            if (p.shortCode) {
                usedCodes.add(p.shortCode.toUpperCase());
                const m = p.shortCode.match(/DPB-(\d+)/i);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            }
        });
        
        products.forEach((p: ManagedProduct) => {
            if (p.shortCode) {
                usedCodes.add(p.shortCode.toUpperCase());
                const m = p.shortCode.match(/DPB-(\d+)/i);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            }
        });

        const normalizedProducts = products.map((p: ManagedProduct) => {
            if (p.shortCode) return p;
            maxNum++;
            while (usedCodes.has(`DPB-${String(maxNum).padStart(4, '0')}`)) {
                maxNum++;
            }
            const newCode = `DPB-${String(maxNum).padStart(4, '0')}`;
            usedCodes.add(newCode);
            return {
                ...p,
                shortCode: newCode
            };
        });

        // MERGE INTELIGENTE: Se a lista enviada for parcial (ex: apenas itens do MVP),
        // mescla com o catálogo completo para NUNCA perder os outros produtos!
        let fullCatalog = [...productControl];
        const incomingMap = new Map(normalizedProducts.map((p: ManagedProduct) => [p.id, p]));

        if (normalizedProducts.length < fullCatalog.length && normalizedProducts.length > 0) {
            fullCatalog = fullCatalog.map((existing: ManagedProduct) => {
                if (incomingMap.has(existing.id)) {
                    return incomingMap.get(existing.id)!;
                }
                return existing;
            });
            for (const p of normalizedProducts) {
                if (!fullCatalog.some((c: ManagedProduct) => c.id === p.id)) {
                    fullCatalog.push(p);
                }
            }
        } else if (normalizedProducts.length >= fullCatalog.length) {
            fullCatalog = normalizedProducts;
        }

        // 1. Grava no banco de dados principal (src/data/product-control.ts)
        const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'data', 'product-control.ts');
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const code = `import { ManagedProduct } from '@/types/admin';\n\nexport const productControl: ManagedProduct[] = ${JSON.stringify(fullCatalog, null, 4)};\n`;
        fs.writeFileSync(filePath, code, 'utf8');

        // 2. Sincroniza os arquivos de metadados originais (public/produtos/conferidos/[id].json)
        const conferidosDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'produtos', 'conferidos');
        let syncedJsonCount = 0;

        if (fs.existsSync(conferidosDir)) {
            for (const p of normalizedProducts) {
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
                                priceFull: p.priceFull,
                                pixPrice: p.pixPrice,
                                originalPriceFull: p.originalPriceFull,
                                discountPct: p.discountPct,
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
        const activeMvpIds = normalizedProducts
            .filter((p: ManagedProduct) => p.mvpEnabled === true)
            .map((p: ManagedProduct) => p.shortCode || p.id);

        if (activeMvpIds.length > 0) {
            const mvpConfigFile = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'data', 'mvp-config.ts');
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
