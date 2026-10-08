import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
    '.avif',
]);

const MIME_MAP: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get("path");

    if (!imagePath) {
        return new NextResponse("Missing path", { status: 400 });
    }

    const rootDir = process.cwd();
    // Resolve caminho absoluto canonicalizado
    const resolvedPath = path.resolve(/*turbopackIgnore: true*/ rootDir, imagePath);

    const allowedCatalogo = path.resolve(/*turbopackIgnore: true*/ rootDir, 'Catálogo');
    const allowedLogos = path.resolve(/*turbopackIgnore: true*/ rootDir, 'Logos');
    const allowedPublic = path.resolve(/*turbopackIgnore: true*/ rootDir, 'public');

    // Path jail: garante estritamente que o arquivo está contido nas pastas permitidas
    const isUnderAllowed =
        resolvedPath.startsWith(allowedCatalogo + path.sep) ||
        resolvedPath === allowedCatalogo ||
        resolvedPath.startsWith(allowedLogos + path.sep) ||
        resolvedPath === allowedLogos ||
        resolvedPath.startsWith(allowedPublic + path.sep) ||
        resolvedPath === allowedPublic;

    if (!isUnderAllowed) {
        return new NextResponse("Access denied", { status: 403 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return new NextResponse("Forbidden file extension", { status: 403 });
    }

    try {
        const fileBuffer = await fs.promises.readFile(resolvedPath);
        const contentType = MIME_MAP[ext] || "image/jpeg";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        return new NextResponse("Image not found", { status: 404 });
    }
}
