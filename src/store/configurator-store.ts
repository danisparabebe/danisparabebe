import { create } from 'zustand';

interface Item {
    id: string;
    name: string;
    price: number;
}

interface Fabric {
    id: string;
    name: string;
    priceModifier: number;
}

interface Embroidery {
    id: string;
    name: string;
    priceModifier: number;
}

interface ConfiguratorState {
    currentStep: 'items' | 'fabrics' | 'embroidery' | 'personalization' | 'review';
    selectedItems: Item[];
    selectedFabric: Fabric | null;
    selectedEmbroidery: Embroidery | null;
    personalizationName: string;

    // Actions
    setStep: (step: ConfiguratorState['currentStep']) => void;
    nextStep: () => void;
    previousStep: () => void;
    toggleItem: (item: Item) => void;
    setFabric: (fabric: Fabric) => void;
    setEmbroidery: (embroidery: Embroidery) => void;
    setPersonalizationName: (name: string) => void;
    getTotalPrice: () => number;
    reset: () => void;
}

const stepOrder: ConfiguratorState['currentStep'][] = [
    'items',
    'fabrics',
    'embroidery',
    'personalization',
    'review',
];

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
    currentStep: 'items',
    selectedItems: [],
    selectedFabric: null,
    selectedEmbroidery: null,
    personalizationName: '',

    setStep: (step) => set({ currentStep: step }),

    nextStep: () => {
        const currentIndex = stepOrder.indexOf(get().currentStep);
        if (currentIndex < stepOrder.length - 1) {
            set({ currentStep: stepOrder[currentIndex + 1] });
        }
    },

    previousStep: () => {
        const currentIndex = stepOrder.indexOf(get().currentStep);
        if (currentIndex > 0) {
            set({ currentStep: stepOrder[currentIndex - 1] });
        }
    },

    toggleItem: (item) => {
        set((state) => {
            const exists = state.selectedItems.find((i) => i.id === item.id);
            if (exists) {
                return {
                    selectedItems: state.selectedItems.filter((i) => i.id !== item.id),
                };
            } else {
                return {
                    selectedItems: [...state.selectedItems, item],
                };
            }
        });
    },

    setFabric: (fabric) => set({ selectedFabric: fabric }),

    setEmbroidery: (embroidery) => set({ selectedEmbroidery: embroidery }),

    setPersonalizationName: (name) => set({ personalizationName: name }),

    getTotalPrice: () => {
        const state = get();
        let total = 0;

        // Sum items
        state.selectedItems.forEach((item) => {
            total += item.price;
        });

        // Add fabric modifier
        if (state.selectedFabric) {
            total += state.selectedFabric.priceModifier;
        }

        // Add embroidery modifier
        if (state.selectedEmbroidery) {
            total += state.selectedEmbroidery.priceModifier;
        }

        return total;
    },

    reset: () =>
        set({
            currentStep: 'items',
            selectedItems: [],
            selectedFabric: null,
            selectedEmbroidery: null,
            personalizationName: '',
        }),
}));
