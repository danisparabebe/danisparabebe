import fs from 'fs';
import path from 'path';
import { notFound, redirect } from 'next/navigation';
import { calculateProductPrice } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/utils';
import { ProductClientView } from './product-client-view';
import { productControl } from '@/data/product-control';
import { getFinalPrice } from '@/lib/utils';
import { resolveProductId, getShortCode } from '@/lib/short-codes';

interface PageProps {
    params: {
        id: string;
    }
}

async function getProduct(rawId: string) {
    // Resolve short code (DPB-0042) to real ID, or pass through if already a real ID
    const id = resolveProductId(rawId);
    
    // 1. Try to find in Product Control Center (MVP Priority)
    const managedProduct = productControl.find(p => p.id === id);
    if (managedProduct) {
        const pixPrice = managedProduct.pixPrice || getFinalPrice(managedProduct);
        return {
            id: managedProduct.id,
            name: managedProduct.name,
            category: managedProduct.category || 'Geral',
            priceFull: managedProduct.priceFull,
            originalPrice: managedProduct.originalPriceFull && managedProduct.originalPriceFull > managedProduct.priceFull ? managedProduct.originalPriceFull : undefined,
            pixPrice: pixPrice,
            installments: 3,
            images: managedProduct.images,
            description: managedProduct.description,
            discountPct: managedProduct.discountPct,
            features: managedProduct.features || [],
            metadata: { type: (managedProduct.category || 'Geral').toUpperCase() }
        };
    }

    // 2. Fallback to conferidos legacy files
    const productsDir = path.join(process.cwd(), 'public', 'produtos', 'conferidos');
    const jsonPath = path.join(productsDir, `${id}.json`);

    if (!fs.existsSync(jsonPath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(jsonPath, 'utf8');
        const metadata = JSON.parse(content);
        const price = calculateProductPrice(metadata.composition || [], !!metadata.customName);

        const imgExtensions = ['.jpeg', '.jpg', '.png', '.JPG'];
        const allImages = [];
        const baseDir = path.join(process.cwd(), 'public');

        // Check primary and alternate images in public/produtos/conferidos
        for (const ext of imgExtensions) {
            if (fs.existsSync(path.join(productsDir, id + ext))) {
                allImages.push(`/produtos/conferidos/${id + ext}`);
                break;
            }
        }

        // Add 2nd image if exists
        for (const ext of imgExtensions) {
            const altId = id.replace('_01', '_02');
            if (fs.existsSync(path.join(productsDir, altId + ext))) {
                allImages.push(`/produtos/conferidos/${altId + ext}`);
                break;
            }
        }

        if (allImages.length === 0) allImages.push('/api/placeholder/600/800');

        return {
            id,
            name: metadata.customName || `${metadata.type} ${metadata.themeName}`,
            category: formatCategoryName(metadata.type),
            priceFull: price,
            pixPrice: price * 0.95, // Fallback legacy logic
            installments: 3,
            images: allImages,
            description: metadata.observations || `Produto ${metadata.type} com tema ${metadata.themeName}.`,
            discountPct: 5, // Fallback legacy logic
            metadata,
        };
    } catch (e) {
        console.error('Error parsing legacy product', e);
        return null;
    }
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await Promise.resolve(params);
    const decodedId = decodeURIComponent(id);

    // If it's a long product ID, check if we have a shortCode for it and redirect to clean the URL
    if (!/^DPB-\d+$/i.test(decodedId)) {
        const mappedShortCode = getShortCode(decodedId);
        if (mappedShortCode) {
            redirect(`/produto/${mappedShortCode}`);
        }
    }

    const product = await getProduct(decodedId);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-dots-texture">
            <main>
                <ProductClientView product={product} />
            </main>
        </div>
    );
}
