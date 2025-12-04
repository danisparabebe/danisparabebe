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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="text-center px-4">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                {item.title}
                            </h2>
                            {item.subtitle && (
                                <h3 className="text-xl md:text-3xl text-white mb-4">
                                    {item.subtitle}
                                </h3>
                            )}
                            <Link
                                href={item.link}
                                className="inline-block bg-dusty-rose hover:bg-deep-rose text-white px-8 md:px-14 py-4 rounded-full text-sm md:text-base uppercase font-medium transition-colors"
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
