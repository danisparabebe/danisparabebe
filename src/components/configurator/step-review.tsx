'use client';

import { useCartStore } from "@/store/cart-store";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface StepReviewProps {
    data: {
        babyName: string;
        theme: string;
        items: string[];
        finishingColor: string;
    };
}

const ITEMS_MAP: Record<string, { name: string; price: number; image: string }> = {
    'manta': { name: 'Manta Bordada', price: 189.90, image: '/api/placeholder/400/400' },
    'fralda-grande': { name: 'Fralda Grande', price: 45.90, image: '/api/placeholder/400/400' },
    'fralda-pequena': { name: 'Fralda de Boca', price: 25.90, image: '/api/placeholder/400/400' },
    'toalha': { name: 'Toalha de Banho', price: 129.90, image: '/api/placeholder/400/400' },
    'body': { name: 'Body Personalizado', price: 59.90, image: '/api/placeholder/400/400' },
    'touca': { name: 'Touca', price: 39.90, image: '/api/placeholder/400/400' },
    'faixa': { name: 'Faixa de Cabelo', price: 29.90, image: '/api/placeholder/400/400' },
};

export function StepReview({ data }: StepReviewProps) {
    const { addItem, openCart } = useCartStore();
    const router = useRouter();

    const selectedItems = data.items.map(id => ITEMS_MAP[id]).filter(Boolean);
    const total = selectedItems.reduce((acc, item) => acc + item.price, 0);

    const handleAddToCart = () => {
        // Add each item individually to cart but with the same personalization
        selectedItems.forEach(item => {
            addItem({
                productId: `custom-${item.name.toLowerCase().replace(/\s/g, '-')}`,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1,
                personalization: {
                    name: data.babyName,
                    color: data.finishingColor,
                    theme: data.theme
                }
            });
        });

        openCart();
        router.push('/');
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal mb-2 font-heading">
                    Tudo Pronto!
                </h2>
                <p className="text-slate text-sm">
                    Confira os detalhes do seu pedido especial.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-soft border border-line max-w-xl mx-auto">
                <div className="flex items-center gap-4 border-b border-line pb-4 mb-4">
                    <div className="bg-dusty-rose/10 p-3 rounded-full">
                        <CheckCircle className="w-8 h-8 text-dusty-rose" />
                    </div>
                    <div>
                        <p className="text-sm text-slate">Personalização para</p>
                        <h3 className="text-xl font-heading text-charcoal">{data.babyName}</h3>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate">Tema escolhido:</span>
                        <span className="font-medium text-charcoal capitalize">{data.theme}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate">Cor do acabamento:</span>
                        <span className="font-medium text-charcoal capitalize">{data.finishingColor.replace('-', ' ')}</span>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <p className="text-sm font-medium text-charcoal mb-2">Itens do Kit:</p>
                    {selectedItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm bg-warm-stone/50 p-2 rounded">
                            <span className="text-slate">{item.name}</span>
                            <span className="font-medium text-charcoal">R$ {item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center border-t border-line pt-4 mb-6">
                    <span className="font-bold text-lg text-charcoal">Total</span>
                    <span className="font-bold text-2xl text-dusty-rose">R$ {total.toFixed(2)}</span>
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full bg-dusty-rose hover:bg-deep-rose text-white py-4 rounded-full font-bold text-lg shadow-soft transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Adicionar Kit ao Carrinho
                </button>
            </div>
        </div>
    );
}
