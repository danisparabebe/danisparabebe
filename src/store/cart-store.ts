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
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    shipping: number;
    setShipping: (value: number) => void;
    total: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            shipping: 0,
            addItem: (item) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }
                    return { items: [...state.items, item], isOpen: true };
                });
            },
            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                })),
            clearCart: () => set({ items: [], shipping: 0 }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            setShipping: (value) => set({ shipping: value }),
            total: () => {
                const itemsTotal = get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                return itemsTotal + get().shipping;
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
