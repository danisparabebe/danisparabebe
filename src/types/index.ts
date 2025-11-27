// Core Types
export interface Product {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    category: string;
}

export interface Fabric {
    id: string;
    name: string;
    textureUrl: string;
    additionalPrice: number;
}

export interface Embroidery {
    id: string;
    name: string;
    designUrl: string;
    additionalPrice: number;
}

export interface Order {
    id: string;
    productId: string;
    fabricId: string;
    embroideryId: string;
    babyName: string;
    totalPrice: number;
    status: 'pending' | 'paid' | 'processing' | 'completed';
    createdAt: Date;
    stripeSessionId?: string;
}

// Builder Store State
export interface BuilderState {
    // Selections
    selectedProduct: Product | null;
    selectedFabric: Fabric | null;
    selectedEmbroidery: Embroidery | null;
    babyName: string;

    // UI State
    currentStep: number;

    // Computed
    totalPrice: number;

    // Actions
    setProduct: (product: Product) => void;
    setFabric: (fabric: Fabric) => void;
    setEmbroidery: (embroidery: Embroidery) => void;
    setBabyName: (name: string) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetBuilder: () => void;
    calculateTotal: () => void;
}
