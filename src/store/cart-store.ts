import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // unique cart item id (product id + options)
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    personalization?: {
        name?: string;
        color?: string;
        theme?: string;
    };
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) => {
                const id = `${item.productId}-${JSON.stringify(item.personalization)}`;
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === id
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }
                    return { items: [...state.items, { ...item, id }], isOpen: true };
                });
            },
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                })),
            clearCart: () => set({ items: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            total: () => {
                const state = get();
                return state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'danis-cart-storage',
        }
    )
);
