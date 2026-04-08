import fs from 'fs';
import path from 'path';
import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Navigation } from '@/components/homepage/navigation';
import { Footer } from '@/components/homepage/footer';
import { ProductGrid } from '@/components/homepage/product-grid';
import { calculateProductPrice } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/utils';

async function searchPublishedProducts(query: string) {
    const productsDir = path.join(process.cwd(), 'public', 'produtos', 'conferidos');
    const products: any[] = [];
    // Normalizes string to remove accents and make lowercase
    const normalizeString = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const normalizedQuery = normalizeString(query);

    if (!normalizedQuery || normalizedQuery.length < 2) return products;

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

    searchTerms = Array.from(new Set(searchTerms));

    if (fs.existsSync(productsDir)) {
        const files = fs.readdirSync(productsDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
                    const metadata = JSON.parse(content);

                    if (metadata.published) {
                        const id = file.replace('.json', '');
                        const productName = normalizeString(metadata.customName || `${metadata.type} ${metadata.themeName}`);
                        const productType = normalizeString(metadata.type || '');
                        const typeExpanded = normalizeString(typeMap[metadata.type] || '');
                        const theme = normalizeString(metadata.themeName || '');
                        const description = metadata.observations ? normalizeString(metadata.observations) : '';

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

                            if (validImage) {
                                products.push({
                                    id,
                                    name: metadata.customName || `${metadata.type} ${metadata.themeName}`,
                                    category: formatCategoryName(metadata.type),
                                    price: price,
                                    installmentPrice: price / 3,
                                    installments: 3,
                                    image: `/produtos/conferidos/${validImage}`,
                                    // _meta: metadata
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing product', file, e);
                }
            }
        }
    }

    return products;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const query = (typeof resolvedParams.q === 'string' ? resolvedParams.q : '') || '';
    const results = await searchPublishedProducts(query);

    return (
        <div className="min-h-screen bg-dots-texture flex flex-col">
            <TopBar />
            <Header />
            <Navigation />

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <h1 className="text-3xl font-heading font-bold text-charcoal">
                        Resultados para: <span className="text-dusty-rose">"{query}"</span>
                    </h1>
                    <p className="text-slate mt-2">
                        {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}.
                    </p>
                </div>

                {results.length > 0 ? (
                    <ProductGrid title="" products={results} />
                ) : (
                    <div className="text-center py-24">
                        <p className="text-xl text-slate">Nenhum produto recém-nascido ou enxoval encontrado com esse termo.</p>
                        <p className="text-charcoal mt-2">Tente buscar por "Manta", "Kit", "Body" ou "Fralda".</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
