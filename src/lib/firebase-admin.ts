import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
