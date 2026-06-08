import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BASE_PRICES, getKitDiscountPercentage } from '@/lib/pricing';

export type StepId = 'name' | 'theme' | 'colors' | 'items' | 'review';
export const STEP_ORDER: StepId[] = ['name', 'theme', 'colors', 'items', 'review'];

export interface ConfiguratorState {
    currentStep: StepId;
    visitedSteps: Set<StepId>;

    // Step 1: Name
    babyName: string;

    // Step 2: Theme + specific embroidery
    selectedProduct: null | any; // Used to fetch linked embroideries
    selectedTheme: string;
    selectedThemeName: string;
    selectedEmbroideryPhoto: string; // path of the exact photo chosen

    // Step 3: Color
    acabamentoColor: string;   // cor do babado
    passafitaColor: string;    // cor do passa-fita
    observations: string;

    // Step 4: Items
    itemQuantities: Record<string, number>;

    // Actions
    setStep: (step: StepId) => void;
    nextStep: () => void;
    previousStep: () => void;
    setSelectedProduct: (product: any) => void;
    setBabyName: (name: string) => void;
    setTheme: (id: string, name: string) => void;
    setEmbroideryPhoto: (path: string) => void;
    setAcabamentoColor: (color: string) => void;
    setPassafitaColor: (color: string) => void;
    setObservations: (text: string) => void;

    setItemQuantity: (itemId: string, qty: number) => void;

    getTotalPrice: () => number;
    getDiscountPercentage: () => number;
    getItemCount: () => number;
    reset: () => void;
}

const initialState = {
    currentStep: 'name' as StepId,
    visitedSteps: new Set<StepId>(['name']),
    babyName: '',
    selectedProduct: null,
    selectedTheme: '',
    selectedThemeName: '',
    selectedEmbroideryPhoto: '',
    acabamentoColor: '',
    passafitaColor: '',
    observations: '',
    itemQuantities: {},
};

export const useConfiguratorStore = create<ConfiguratorState>()(
    persist(
        (set, get) => ({
    ...initialState,

    setStep: (step) =>
        set((s) => ({
            currentStep: step,
            visitedSteps: new Set([...s.visitedSteps, step]),
        })),

    nextStep: () => {
        const idx = STEP_ORDER.indexOf(get().currentStep);
        if (idx < STEP_ORDER.length - 1) {
            const next = STEP_ORDER[idx + 1];
            set((s) => ({
                currentStep: next,
                visitedSteps: new Set([...s.visitedSteps, next]),
            }));
        }
    },

    previousStep: () => {
        const idx = STEP_ORDER.indexOf(get().currentStep);
        if (idx > 0) set({ currentStep: STEP_ORDER[idx - 1] });
    },

    setSelectedProduct: (product) => set({ selectedProduct: product }),
    setBabyName: (name) => set({ babyName: name }),
    setTheme: (id, name) => set({ selectedTheme: id, selectedThemeName: name, selectedEmbroideryPhoto: '' }),
    setEmbroideryPhoto: (path) => set({ selectedEmbroideryPhoto: path }),
    setAcabamentoColor: (color) => set({ acabamentoColor: color }),
    setPassafitaColor: (color) => set({ passafitaColor: color }),
    setObservations: (text) => set({ observations: text }),

    setItemQuantity: (itemId, qty) =>
        set((state) => {
            const next = { ...state.itemQuantities };
            if (qty <= 0) delete next[itemId];
            else next[itemId] = qty;
            return { itemQuantities: next };
        }),

    getDiscountPercentage: () => {
        const count = Object.values(get().itemQuantities).reduce((sum, q) => sum + q, 0);
        return getKitDiscountPercentage(count);
    },

    getTotalPrice: () => {
        const s = get();
        let itemsTotal = 0;
        Object.entries(s.itemQuantities).forEach(([id, qty]) => {
            itemsTotal += (BASE_PRICES[id] || 0) * qty;
        });

        const discountMultiplier = 1 - (s.getDiscountPercentage() / 100);
        const finalTotal = itemsTotal * discountMultiplier;

        return finalTotal;
    },

    getItemCount: () =>
        Object.values(get().itemQuantities).reduce((sum, q) => sum + q, 0),

    reset: () =>
        set({
            ...initialState,
            visitedSteps: new Set<StepId>(['name']),
        }),
        }),
        {
            name: 'danis-configurator-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                currentStep: state.currentStep,
                visitedSteps: Array.from(state.visitedSteps), // Set -> Array for JSON
                babyName: state.babyName,
                selectedProduct: state.selectedProduct,
                selectedTheme: state.selectedTheme,
                selectedThemeName: state.selectedThemeName,
                selectedEmbroideryPhoto: state.selectedEmbroideryPhoto,
                acabamentoColor: state.acabamentoColor,
                passafitaColor: state.passafitaColor,
                observations: state.observations,
                itemQuantities: state.itemQuantities,
            }),
            onRehydrateStorage: () => (state) => {
                // Convert visitedSteps array back to Set after rehydration
                if (state && Array.isArray(state.visitedSteps)) {
                    state.visitedSteps = new Set(state.visitedSteps as unknown as StepId[]);
                }
            },
        }
    )
);
