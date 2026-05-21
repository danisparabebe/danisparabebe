/**
 * generate-catalog-manifest.mjs
 * 
 * Escaneia public/Catálogo/ e gera src/data/catalog-manifest.json
 * contendo a lista de imagens por gênero.
 * 
 * Executado automaticamente antes do build via "prebuild" no package.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const catalogDir = path.join(projectRoot, 'public', 'Catálogo');
const outputFile = path.join(projectRoot, 'src', 'data', 'catalog-manifest.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function scanGender(gender) {
    const dir = path.join(catalogDir, gender);
    if (!fs.existsSync(dir)) return [];
    
    return fs.readdirSync(dir)
        .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

const manifest = {
    generatedAt: new Date().toISOString(),
    Meninos: scanGender('Meninos'),
    Meninas: scanGender('Meninas'),
};

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`✅ Catalog manifest generated: ${manifest.Meninos.length} Meninos, ${manifest.Meninas.length} Meninas`);
