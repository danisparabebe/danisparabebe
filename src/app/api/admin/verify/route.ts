import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { filename } = await req.json();

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        // --- SECURITY PATCH: PATH TRAVERSAL PREVENT ---
        // Apenas caracteres alfanuméricos, pontos, traços, underlines e espaços são permitidos.
        // Rejeita bloqueando a raiz de injeções transversais (../) ou caminhos absolutos (/).
        if (!/^[a-zA-Z0-9_\-\.\s]+$/.test(filename) || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            console.error('ALERTA DE SEGURANÇA: Tentativa de Path Traversal detectada.', { filename });
            return NextResponse.json({ error: 'Ação Bloqueada: Formato de arquivo inválido' }, { status: 403 });
        }
        // ----------------------------------------------

        const productsDir = path.join(process.cwd(), 'public', 'produtos');
        const verifiedDir = path.join(productsDir, 'conferidos');

        const sourcePath = path.join(productsDir, filename);
        const destPath = path.join(verifiedDir, filename);

        if (!fs.existsSync(verifiedDir)) {
            fs.mkdirSync(verifiedDir, { recursive: true });
        }

        if (fs.existsSync(sourcePath)) {
            fs.renameSync(sourcePath, destPath);

            // Move sidecar JSON if exists
            const sourceJson = sourcePath.replace(path.extname(sourcePath), '.json');
            const destJson = destPath.replace(path.extname(destPath), '.json');

            if (fs.existsSync(sourceJson)) {
                fs.renameSync(sourceJson, destJson);
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
    } catch (error: any) {
        // --- SECURITY PATCH: IMPEDIR INFORMATION LEAKAGE ---
        // Se um erro estourar vindo do Node.js fs, o error.message pode expor
        // o caminho real absoluto do servidor (ex: C:/Users/.../Desktop/pasta). 
        // O hacker usaria essa info para descobrir a arvore do sistema, por isso escondemos o log dele.
        console.error('Verify Route Admin Error:', error);
        return NextResponse.json({ error: 'Ocorreu um erro interno ao processar o arquivo no servidor.' }, { status: 500 });
    }
}
