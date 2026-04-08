import path from 'path';
import fs from 'fs';
import { calculateProductPrice } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    // Normalizes string to remove accents and make lowercase
    const normalizeString = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const normalizedQuery = normalizeString(query);

    if (!normalizedQuery || normalizedQuery.length < 2) {
        return Response.json([]);
    }

    const productsDir = path.join(process.cwd(), 'public', 'produtos', 'conferidos');
    const products: any[] = [];

    // Advanced synonym mapping for baby terms
    const synonyms: Record<string, string[]> = {
        'fralda': ['babete', 'pano de boca', 'fraldinha', 'toalha de boca', 'babeiro', 'paninho'],
        'manta': ['manta termica', 'cobertor', 'mantinha', 'cueiro', 'coberta'],
        'mijao': ['pagao', 'mijão', 'pagão', 'calca', 'calça', 'culote'],
        'body': ['roupinha', 'camisetinha', 'tamanho', 'bodie'],
        'touca': ['gorro', 'chapeu', 'chapeuzinho', 'protetor de orelha'],
        'toalha': ['toalha de banho', 'toalha fralda', 'toalhao', 'toalha felpuda'],
        'short': ['tapa fralda', 'shortinho', 'bermuda', 'bermudinha', 'calcinha'],
        'faixa': ['tiara', 'laco', 'laço', 'faixinha', 'presilha', 'cabelo'],
        'kit': ['conjunto', 'combo', 'presente', 'saida de maternidade', 'enxoval'],
        'sapato': ['sapatinho', 'pantufa', 'meia', 'calçado', 'calcado', 'tenis', 'tenisinho'],
        'menina': ['rosa', 'princesa', 'flores', 'borboleta', 'fem', 'feminino', 'meninas'],
        'menino': ['azul', 'principe', 'safari', 'urso', 'masc', 'masculino', 'meninos'],
    };

    const typeMap: Record<string, string> = {
        'KIT': 'kit',
        'MNT': 'manta',
        'FRP': 'fralda passeio boca babete',
        'FRM': 'fralda de ombro',
        'FRG': 'fralda grande toalha fralda',
        'BDL': 'body manga longa',
        'BCC': 'body manga curta',
        'MAC': 'macacão macacao pijama',
        'TOB': 'toalha banho',
        'TOU': 'touca gorro',
        'SAP': 'sapato sapatinho',
        'FAI': 'faixa cabelo tiara laco laço',
    };

    let searchTerms = normalizedQuery.split(' ').filter(Boolean);

    // Expand search terms with all synonyms (checking in normalized form)
    searchTerms.forEach(term => {
        // Also add the term exactly as typed
        for (const [key, vals] of Object.entries(synonyms)) {
            // Check if term matches the key or any of the normalized values
            const normalizedVals = vals.map(v => normalizeString(v));
            if (term === normalizeString(key) || normalizedVals.includes(term)) {
                searchTerms.push(normalizeString(key));
                searchTerms.push(...normalizedVals);
            }
        }
    });

    // Unique terms
    searchTerms = Array.from(new Set(searchTerms));

    if (fs.existsSync(productsDir)) {
        const files = fs.readdirSync(productsDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
                    const metadata = JSON.parse(content);

                    if (metadata.published) {
                        const productName = normalizeString(metadata.customName || `${metadata.type} ${metadata.themeName}`);
                        const productType = normalizeString(metadata.type || '');
                        const typeExpanded = normalizeString(typeMap[metadata.type] || '');
                        const theme = normalizeString(metadata.themeName || '');
                        const description = metadata.observations ? normalizeString(metadata.observations) : '';
                        const id = file.replace('.json', '');

                        const searchableString = `${productName} ${productType} ${typeExpanded} ${theme} ${description} ${id.toLowerCase()}`;

                        // Check if ANY of the search terms match this product
                        const isMatch = searchTerms.some(term => searchableString.includes(term));

                        if (isMatch) {
                            const price = calculateProductPrice(metadata.composition || [], !!metadata.customName);

                            const imgExtensions = ['.jpeg', '.jpg', '.png', '.JPG'];
                            let validImage = '';
                            for (const ext of imgExtensions) {
                                if (fs.existsSync(path.join(productsDir, id + ext))) {
                                    validImage = id + ext;
                                    break;
                                }
                            }

                            products.push({
                                id,
                                name: metadata.customName || `${metadata.type} ${metadata.themeName}`,
                                category: formatCategoryName(metadata.type),
                                price,
                                image: validImage ? encodeURI(`/produtos/conferidos/${validImage}`) : '/Logos/Logomarca%20Rose.png',
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error in search API', file, e);
                }
            }
        }
    }

    // Limit to 5 results for autocomplete
    return Response.json(products.slice(0, 5));
}
