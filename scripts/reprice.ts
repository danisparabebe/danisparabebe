import fs from 'fs';
import path from 'path';
import { productControl } from '../src/data/product-control';
import { getProductPricing } from '../src/data/pricing';
import { UNIT_PRICES_NET, KIT_PRICES_NET } from '../src/data/pricing-data';
import { KIT_RECIPES } from '../src/data/admin-options';

async function run() {
    const filePath = path.join(process.cwd(), 'src', 'data', 'product-control.ts');
    let fileContent = fs.readFileSync(filePath, 'utf8');

    let updatedCount = 0;
    const validTypes = new Set(Object.keys(UNIT_PRICES_NET));

    function findRecipeMatch(searchTexts: string[]): typeof KIT_RECIPES[number] | null {
        for (const text of searchTexts) {
            const lower = text.trim().toLowerCase();
            const exactMatch = KIT_RECIPES.find(r => r.name.toLowerCase() === lower);
            if (exactMatch) return exactMatch;
        }
        return null;
    }

    for (const product of productControl) {
        const composition: { type: string; qty: number }[] = [];

        if (product.features && product.features.length > 0) {
            for (const feat of product.features) {
                const match = feat.match(/(\d+)x?\s+(\w+)/);
                if (match && validTypes.has(match[2])) {
                    composition.push({ type: match[2], qty: parseInt(match[1]) });
                }
            }
        }

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
                product.features = composition.map(c => `${c.qty}x ${c.type}`);
            }
        }

        const pricing = getProductPricing(composition, product.name, false, UNIT_PRICES_NET, KIT_PRICES_NET);

        product.priceFull = pricing.priceFull;
        product.originalPriceFull = pricing.originalPriceFull;
        product.pixPrice = pricing.pixPrice;
        product.pixDiscountPct = pricing.pixDiscountPct;
        product.discountPct = pricing.discountPct;
        product.netValue = pricing.netValue;

        updatedCount++;
    }

    const newArrStr = JSON.stringify(productControl, null, 4);
    fileContent = fileContent.replace(/export const productControl: ManagedProduct\[\] = \[\s*([\s\S]*?)\s*\];/, `export const productControl: ManagedProduct[] = ${newArrStr};`);

    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Updated ${updatedCount} products.`);
}

run().catch(console.error);
