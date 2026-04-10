import { create } from 'zustand';
import { toggleFavoriteInCloud } from '@/lib/user-db';
import { auth } from '@/lib/firebase';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
    items: string[];
    toggle: (productId: string) => void;
    setFromCloud: (cloudItems: string[]) => void;
    isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
        items: [],
        
        toggle: (productId) => {
             const state = get();
             const exists = state.items.includes(productId);
             const newItems = exists ? state.items.filter(id => id !== productId) : [...state.items, productId];
             set({ items: newItems });
             
             // Atualiza FireStore quietamente se logado
             if (auth.currentUser) {
                  toggleFavoriteInCloud(auth.currentUser.uid, productId, !exists);
             }
        },
        
        setFromCloud: (cloudItems) => {
            // Mescla nuvem com local para não perder o que clicou sem login
            const merged = Array.from(new Set([...get().items, ...cloudItems]));
            set({ items: merged });
        },
        
        isFavorite: (productId) => get().items.includes(productId)
    }),
    {
        name: 'danis-favorites-storage',
    }
  )
);
