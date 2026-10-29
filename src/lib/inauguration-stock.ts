import { adminDb } from '@/lib/firebase-admin';
import { INAUGURATION_PROMO_CONFIG } from '@/data/inauguration-promo';

export interface InaugurationStockData {
    fem: {
        initial: number;
        sold: number;
        available: number;
        isSoldOut: boolean;
    };
    mas: {
        initial: number;
        sold: number;
        available: number;
        isSoldOut: boolean;
    };
    totalAvailable: number;
}

const FEM_IDS = [
    'DPB-INAU-FEM',
    'FEM-KIT-MAN-BOR-RSE-PROMO-INAU_01',
];

const MAS_IDS = [
    'DPB-INAU-MAS',
    'MAS-KIT-MAN-SAF-VDM-PROMO-INAU_01',
];

export async function getInaugurationStock(): Promise<InaugurationStockData> {
    const initialPerGender = INAUGURATION_PROMO_CONFIG.unitsPerGender || 5;

    let femSold = 0;
    let masSold = 0;

    try {
        const snapshot = await adminDb.collection('orders').get();

        snapshot.forEach((doc) => {
            const data = doc.data();
            const status = (data.status || '').toLowerCase();
            // Considera vendas aprovadas, em produção, enviadas ou entregues
            const isValidSale = [
                'pago_aprovado',
                'em_producao',
                'enviado',
                'entregue',
                'pago',
                'approved',
                'paid'
            ].includes(status);

            if (!isValidSale) return;

            const items = Array.isArray(data.items) ? data.items : [];
            for (const item of items) {
                const id = String(item.productId || item.id || '');
                const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;

                if (FEM_IDS.some(femId => id.includes(femId))) {
                    femSold += qty;
                }
                if (MAS_IDS.some(masId => id.includes(masId))) {
                    masSold += qty;
                }
            }
        });
    } catch (err) {
        console.warn('⚠️ [InaugurationStock] Consulta ao Firebase falhou, usando estoque inicial padrão:', err);
    }

    const femAvailable = Math.max(0, initialPerGender - femSold);
    const masAvailable = Math.max(0, initialPerGender - masSold);

    return {
        fem: {
            initial: initialPerGender,
            sold: femSold,
            available: femAvailable,
            isSoldOut: femAvailable <= 0,
        },
        mas: {
            initial: initialPerGender,
            sold: masSold,
            available: masAvailable,
            isSoldOut: masAvailable <= 0,
        },
        totalAvailable: femAvailable + masAvailable,
    };
}
