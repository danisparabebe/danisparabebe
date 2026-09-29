import * as admin from 'firebase-admin';

function formatPrivateKey(key: string): string {
    if (!key) return '';
    let k = key.trim();
    if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
        k = k.slice(1, -1);
    }
    // Suporta tanto \n literais quanto quebras reais
    return k.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
    let initialized = false;

    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        try {
            const formattedKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'danisparabebeofc',
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: formattedKey,
                }),
            });
            initialized = true;
        } catch (certErr) {
            console.error('⚠️ Falha ao inicializar credencial do Firebase Admin com FIREBASE_PRIVATE_KEY:', certErr);
        }
    }

    if (!initialized) {
        console.warn('⚠️ Inicializando Firebase Admin com fallback para evitar quebra no build.');
        try {
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'danisparabebeofc'
            });
        } catch (fallbackErr) {
            console.error('⚠️ Falha no fallback do Firebase Admin:', fallbackErr);
        }
    }
}

const adminDb = admin.firestore();

export { adminDb, admin };
