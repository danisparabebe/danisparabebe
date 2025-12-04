import Image from 'next/image';
import Link from 'next/link';

interface Brand {
    name: string;
    image: string;
}

interface BrandGridProps {
    title?: string;
    brands: Brand[];
}

export function BrandGrid({ title, brands }: BrandGridProps) {
    return (
        <section className="px-4 py-10">
            <div className="mx-auto max-w-7xl">
                {title && (
                    <h3 className="mb-6 text-center text-xl font-normal md:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
                        {title}
                    </h3>
                )}
                <div className="mx-auto flex max-w-full flex-wrap justify-center gap-4">
                    {brands.map((brand, index) => (
                        <div
                            key={index}
                            className="group basis-[48%] cursor-pointer md:basis-[30%] lg:basis-[15%]"
                            style={{ minWidth: '120px', maxWidth: '220px' }}
                        >
                            <Link href={`/marca/${brand.name.toLowerCase().replace(/ /g, '-')}`}>
                                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                                    <Image
                                        src={brand.image}
                                        alt={brand.name}
                                        fill
                                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                </div>
                                <h4 className="mt-3 text-center text-sm tracking-wider md:text-base">
                                    {brand.name}
                                </h4>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
