import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        // A Vercel frequentemente injeta aspas duplas nas variáveis com múltiplas linhas
        let rawKey = process.env.FIREBASE_PRIVATE_KEY;
        rawKey = rawKey.replace(/^"|"$/g, '').replace(/^'|'$/g, ''); // Remove aspas em volta
        rawKey = rawKey.replace(/\\n/g, '\n'); // Transforma o texto \n em quebra de linha real

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: rawKey,
            }),
        });
    } else {
        console.warn('⚠️ FIREBASE_PRIVATE_KEY is missing. Inicializando app genérico para passar o build.');
        admin.initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'
        });
    }
}

const adminDb = admin.firestore();

export { adminDb, admin };
