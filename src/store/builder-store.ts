import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BuilderState, Product, Fabric, Embroidery } from '@/types';

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            // Initial State
            selectedProduct: null,
            selectedFabric: null,
            selectedEmbroidery: null,
            babyName: '',
            currentStep: 0,
            totalPrice: 0,

            // Actions
            setProduct: (product: Product) => {
                set({ selectedProduct: product });
                get().calculateTotal();
            },

            setFabric: (fabric: Fabric) => {
                set({ selectedFabric: fabric });
                get().calculateTotal();
            },

            setEmbroidery: (embroidery: Embroidery) => {
                set({ selectedEmbroidery: embroidery });
                get().calculateTotal();
            },

            setBabyName: (name: string) => {
                set({ babyName: name });
            },

            setStep: (step: number) => {
                set({ currentStep: step });
            },

            nextStep: () => {
                const { currentStep } = get();
                if (currentStep < 4) {
                    set({ currentStep: currentStep + 1 });
                }
            },

            prevStep: () => {
                const { currentStep } = get();
                if (currentStep > 0) {
                    set({ currentStep: currentStep - 1 });
                }
            },

            resetBuilder: () => {
                set({
                    selectedProduct: null,
                    selectedFabric: null,
                    selectedEmbroidery: null,
                    babyName: '',
                    currentStep: 0,
                    totalPrice: 0,
                });
            },

            calculateTotal: () => {
                const { selectedProduct, selectedFabric, selectedEmbroidery } = get();
                let total = 0;

                if (selectedProduct) total += selectedProduct.basePrice;
                if (selectedFabric) total += selectedFabric.additionalPrice;
                if (selectedEmbroidery) total += selectedEmbroidery.additionalPrice;

                set({ totalPrice: total });
            },
        }),
        {
            name: 'danis-builder-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
