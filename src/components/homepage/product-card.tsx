import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
}

export function ProductCard({ id, name, brand, price, originalPrice, image }: ProductCardProps) {
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <div className="group relative">
            <Link href={`/produto/${id}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {discount > 0 && (
                        <div className="absolute top-2 right-2 bg-dusty-rose text-white px-2 py-1 rounded text-xs font-bold">
                            -{discount}%
                        </div>
                    )}
                </div>
            </Link>

            <button className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-soft hover:shadow-hover transition-shadow">
                <Heart className="h-4 w-4" />
            </button>

            <div className="mt-3 space-y-1">
                <p className="text-xs text-slate">{brand}</p>
                <h3 className="text-sm font-medium text-charcoal line-clamp-2">{name}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-charcoal">
                        R$ {price.toFixed(2)}
                    </span>
                    {originalPrice && (
                        <span className="text-sm text-slate line-through">
                            R$ {originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>
                <button className="mt-2 w-full bg-dusty-rose hover:bg-deep-rose text-white py-2 rounded-full text-sm font-medium transition-colors">
                    Adicionar
                </button>
            </div>
        </div>
    );
}
