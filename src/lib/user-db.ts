import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { useCartStore } from '@/store/cart-store';

/**
 * Disparado logo após o usuário fazer login.
 * Garante o perfil no banco e mescla o carrinho local e o da nuvem.
 */
export async function syncUserFromCloud(user: User) {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const localCart = useCartStore.getState().items;

    if (!snap.exists()) {
        // Novo Usuário cria documento raiz
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            cart: localCart,
            favorites: [],
            addresses: [],
            createdAt: new Date().toISOString()
        });
    } else {
        const data = snap.data();
        const cloudCart: any[] = data.cart || [];
        const cloudFavorites: string[] = data.favorites || [];
        
        // Mesclagem Inteligente: Cloud + Local (Mantém tudo sem perder do login prévio)
        const mergedCart = [...cloudCart];
        const cloudKeys = new Set(cloudCart.map(c => typeof c.id !== 'undefined' ? c.id : c.productId));
        
        for (const item of localCart) {
            const key = item.id || item.productId;
            if (!cloudKeys.has(key)) {
                mergedCart.push(item);
                cloudKeys.add(key);
            }
        }

        // Faz update da nuvem com a colisão do localStorage resolvido
        if (mergedCart.length > cloudCart.length) {
           await updateDoc(userRef, { cart: mergedCart });
        }

        // Reflete diretamente na UI do NextJS injetando via callback de hydration
        useCartStore.setState({ items: mergedCart });
    }
}

/** Salva ou atualiza um endereço no perfil */
export async function saveUserAddress(uid: string, address: any) {
    try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            const data = snap.data();
            const addresses = data.addresses || [];
            
            // Se já existir um endereço com o mesmo CEP e número, substitui, senão adiciona
            const index = addresses.findIndex((a: any) => a.cep === address.cep && a.number === address.number);
            if (index >= 0) {
                addresses[index] = { ...addresses[index], ...address, updatedAt: new Date().toISOString() };
            } else {
                addresses.push({ ...address, id: Date.now().toString(), createdAt: new Date().toISOString() });
            }
            
            await updateDoc(userRef, { addresses });
            return addresses;
        }
    } catch (e) {
        console.error("Erro ao salvar endereço:", e);
    }
    return null;
}

/** Remove um endereço */
export async function deleteUserAddress(uid: string, addressId: string) {
    try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            const addresses = (snap.data().addresses || []).filter((a: any) => a.id !== addressId);
            await updateDoc(userRef, { addresses });
            return addresses;
        }
    } catch (e) {
        console.error("Erro ao deletar endereço:", e);
    }
    return null;
}

/** Salva qualquer nova adição ao carrinho direto na nuvem em Background */
export async function pushCartToCloud(uid: string, items: any[]) {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { cart: items });
    } catch (e) {
        console.error("Falha ao salvar cart na nuvem silenciosamente:", e);
    }
}

/** Helper para gerenciar Wishlist do Firebase */
export async function toggleFavoriteInCloud(uid: string, productId: string, isAdding: boolean) {
    const userRef = doc(db, 'users', uid);
    try {
        await updateDoc(userRef, {
            favorites: isAdding ? arrayUnion(productId) : arrayRemove(productId)
        });
    } catch (e) {
        console.error("Falha a favoritar produto no db", e);
    }
}
