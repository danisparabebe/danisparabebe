import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { productControl } from '@/data/product-control';
import { getProductPricing } from '@/data/pricing';
import { UNIT_PRICES_NET, KIT_PRICES_NET } from '@/data/pricing-data';
import { KIT_RECIPES } from '@/data/admin-options';

/**
 * POST /api/admin/reprice
 * 
 * Atualiza todos os produtos em product-control.ts
 * aplicando a nova lógica de precificação (Líquido -> Bruto embute Stripe).
 * 
 * Estratégia de resolução de composição (3 camadas):
 * 1. Parseia features do tipo "1x FRG", "2x FRP" (apenas tipos válidos)
 * 2. Match por nome (name) contra KIT_RECIPES
 * 3. Match por technicalName/ID contra KIT_RECIPES
 * 
 * Quando a composição é resolvida, atualiza o features com códigos reais
 * para que futuras execuções funcionem diretamente na camada 1.
 */
export async function POST(req: Request) {
    try {
        let reqData: any = {};
        try {
            reqData = await req.json();
        } catch (e) {
            // Body is empty or invalid JSON, ignore
        }

        const customUnitPrices = reqData.unitPrices || UNIT_PRICES_NET;
        const customKitPrices = reqData.kitPrices || KIT_PRICES_NET;

        const filePath = path.join(process.cwd(), 'src', 'data', 'product-control.ts');
        let fileContent = fs.readFileSync(filePath, 'utf8');

        let updatedCount = 0;
        let fixedFeatures = 0;
        const validTypes = new Set(Object.keys(customUnitPrices));

        // Helper: tenta encontrar uma receita de kit apenas se o nome for exato
        function findRecipeMatch(searchTexts: string[]): typeof KIT_RECIPES[number] | null {
            for (const text of searchTexts) {
                const lower = text.trim().toLowerCase();
                // Strict exact match to avoid destroying custom kit compositions
                const exactMatch = KIT_RECIPES.find(r => r.name.toLowerCase() === lower);
                if (exactMatch) return exactMatch;
            }
            return null;
        }

        for (const product of productControl) {
            const composition: { type: string; qty: number }[] = [];

            // ─── Step 1: Parse composition from features like "1x FRG", "2x FRP" ───
            if (product.features && product.features.length > 0) {
                for (const feat of product.features) {
                    const match = feat.match(/(\d+)x?\s+(\w+)/);
                    if (match && validTypes.has(match[2])) {
                        composition.push({ type: match[2], qty: parseInt(match[1]) });
                    }
                }
            }

            // ─── Step 2: Fallback — match KIT_RECIPES by name, technicalName, or id ───
            if (composition.length === 0) {
                const searchTexts = [
                    product.name,
                    product.technicalName || '',
                    product.id
                ].filter(Boolean);

                const kitMatch = findRecipeMatch(searchTexts);
                if (kitMatch) {
                    for (const [type, qty] of Object.entries(kitMatch.items)) {
                        composition.push({ type, qty: qty as number });
                    }

                    // ─── Self-heal: persist proper composition codes in features ───
                    // This ensures future reprice runs resolve instantly via Step 1
                    product.features = composition.map(c => `${c.qty}x ${c.type}`);
                    fixedFeatures++;
                }
            }

            // Calculo da precificação inteligente
            const pricing = getProductPricing(composition, product.name, false, customUnitPrices, customKitPrices);

            // Directly modify the object in memory
            product.priceFull = pricing.priceFull;
            product.originalPriceFull = pricing.originalPriceFull;
            product.pixPrice = pricing.pixPrice;
            product.pixDiscountPct = pricing.pixDiscountPct;
            product.discountPct = pricing.discountPct;
            product.netValue = pricing.netValue;

            updatedCount++;
        }

        // Stringify the entire updated array neatly
        const newArrStr = JSON.stringify(productControl, null, 4);
        
        // Safely replace the block in the TS file
        fileContent = fileContent.replace(/export const productControl: ManagedProduct\[\] = \[\s*([\s\S]*?)\s*\];/, `export const productControl: ManagedProduct[] = ${newArrStr};`);

        fs.writeFileSync(filePath, fileContent, 'utf8');

        return NextResponse.json({ 
            success: true, 
            updated: updatedCount, 
            total: productControl.length,
            fixedFeatures 
        });
    } catch (error: any) {
        console.error('Reprice error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
