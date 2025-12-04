import Link from 'next/link';

export function PromoBanner() {
    return (
        <Link href="/ofertas">
            <div className="flex h-12 items-center justify-center bg-charcoal text-white text-center px-4">
                <span className="text-sm md:text-base">
                    🎈 Ofertas - Até 70% de desconto - Descubra todas
                </span>
            </div>
        </Link>
    );
}
