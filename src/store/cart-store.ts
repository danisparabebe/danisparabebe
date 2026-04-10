import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@/lib/firebase';
import { pushCartToCloud } from '@/lib/user-db';

export interface CartItem {
    id: string; // Unique ID for the cart instance (e.g., timestamp)
    productId: string; // Base product ID
    name: string;
    price: number;
    image: string;
    quantity: number;
    personalization?: {
        name?: string;
        color?: string;
        theme?: string;
        finishDetail?: string;
        finishColor?: string;
        size?: string;
        observations?: string;
    };
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    shipping: number;
    // Actions
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    // UI Actions
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    // Shipping
    setShipping: (price: number) => void;
    // Computed
    total: () => number;
    itemCount: () => number;
}

const triggerCloudSync = (items: CartItem[]) => {
    if (auth.currentUser) {
        pushCartToCloud(auth.currentUser.uid, items);
    }
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            shipping: 0,

            addItem: (newItem) => {
                set((state) => {
                    // Check if identical item exists (same ID or exactly same personalization)
                    // For custom baby items, it's safer to just add as new unless it's a generic product.
                    // If it has no personalization, we can merge quantities.
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.productId === newItem.productId && !i.personalization && !newItem.personalization
                    );

                    if (existingItemIndex >= 0) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += newItem.quantity;
                        triggerCloudSync(newItems);
                        return { items: newItems };
                    }

                    const newItemsList = [...state.items, newItem];
                    triggerCloudSync(newItemsList);
                    return { items: newItemsList };
                });
            },

            removeItem: (id) => {
                set((state) => {
                    const filtered = state.items.filter((item) => item.id !== id);
                    triggerCloudSync(filtered);
                    return { items: filtered };
                });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) return;
                set((state) => {
                    const altered = state.items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    );
                    triggerCloudSync(altered);
                    return { items: altered };
                });
            },

            clearCart: () => {
                triggerCloudSync([]);
                set({ items: [], shipping: 0 });
            },

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            setShipping: (price) => set({ shipping: price }),

            total: () => {
                const { items, shipping } = get();
                const subtotal = items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
                return subtotal + shipping;
            },

            itemCount: () => {
                const { items } = get();
                return items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'danis-cart-storage', // saves to local storage
            partialize: (state) => ({ items: state.items }), // Only save items, not UI state like isOpen
        }
    )
);
