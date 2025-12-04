'use client';

import { Card, CardImage, CardContent, CardTitle, CardPrice } from '@/components/ui/card';
import { bestsellers } from '@/data/bestsellers';

export default function BestsellersGrid() {
    return (
        <section className="py-20 px-4 bg-neutral-white">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="font-fraunces text-4xl md:text-5xl text-neutral-text mb-4">
                        Os Favoritos das Mamães
                    </h2>
                    <p className="text-neutral-textSub max-w-2xl mx-auto">
                        Peças exclusivas, feitas com amor e aprovadas por milhares de famílias
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestsellers.map((product) => (
                        <div key={product.id} className="group relative">
                            <Card>
                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-4 left-4 z-10 bg-secondary-brand text-white text-xs px-3 py-1 rounded-full font-medium">
                                        {product.badge}
                                    </div>
                                )}

                                {/* Image */}
                                <CardImage
                                    src={product.image}
                                    alt={product.name}
                                    aspectRatio="3/4"
                                />

                                {/* Info */}
                                <CardContent>
                                    <CardTitle>{product.name}</CardTitle>
                                    <CardPrice>R$ {product.price.toFixed(2)}</CardPrice>
                                </CardContent>
                            </Card>

                            {/* Hover Button */}
                            <button className="absolute bottom-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-brand hover:bg-primary-hover text-white px-6 py-2 rounded-full text-sm font-medium uppercase tracking-wider">
                                Personalizar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
