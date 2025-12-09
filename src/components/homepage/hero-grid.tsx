import Image from 'next/image';
import Link from 'next/link';

interface HeroItem {
    title: string;
    subtitle?: string;
    image: string;
    link: string;
    ctaText: string;
}

interface HeroGridProps {
    items: HeroItem[];
}

export function HeroGrid({ items }: HeroGridProps) {
    return (
        <div className="my-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item, index) => (
                <div key={index} className="group relative min-h-[600px] overflow-hidden">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-12 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <div className="text-center px-4">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-heading)' }}>
                                {item.title}
                            </h2>
                            {item.subtitle && (
                                <h3 className="text-xl md:text-3xl text-white mb-6 drop-shadow-md">
                                    {item.subtitle}
                                </h3>
                            )}
                            <Link
                                href={item.link}
                                className="inline-block bg-white/90 hover:bg-white text-charcoal px-8 md:px-14 py-3 rounded-full text-sm md:text-base uppercase font-bold transition-colors shadow-lg"
                            >
                                {item.ctaText}
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
