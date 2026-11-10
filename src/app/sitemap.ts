import { MetadataRoute } from 'next';
import { productControl } from '@/data/product-control';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://danisparabebe.com.br';
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/monte-seu-kit`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/catalogo`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/quem-somos`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/politicas`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    const productRoutes: MetadataRoute.Sitemap = productControl.map((prod) => ({
        url: `${baseUrl}/produto/${prod.shortCode || prod.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
}
