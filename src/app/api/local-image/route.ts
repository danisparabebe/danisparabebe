import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get("path");

    if (!imagePath) {
        return new NextResponse("Missing path", { status: 400 });
    }

    // Security: Only allow paths within Catálogo and Logos
    const normalizedPath = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '');

    // We expect paths like "Catálogo/Meninos/..." or "Logos/..."
    if (!normalizedPath.startsWith("Catálogo") && !normalizedPath.startsWith("Logos")) {
        return new NextResponse("Invalid path", { status: 403 });
    }

    const fullPath = path.join(process.cwd(), normalizedPath);

    try {
        const fileBuffer = await fs.promises.readFile(fullPath);

        // Determine content type based on extension
        const ext = path.extname(fullPath).toLowerCase();
        let contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".webp") contentType = "image/webp";
        if (ext === ".gif") contentType = "image/gif";



        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error) {
        console.error("Error reading image:", error);
        return new NextResponse("Image not found", { status: 404 });
    }
}
