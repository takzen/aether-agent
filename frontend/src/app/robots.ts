import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://aetheragent.pl';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard',
                '/chat',
                '/cognition',
                '/cron',
                '/knowledge',
                '/logs',
                '/memories',
                '/settings',
                '/skills',
                '/topology',
                '/workspace',
                '/privacy',
                '/terms',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
