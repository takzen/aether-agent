import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://biegwsteczny.pl'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        // W przyszłości tutaj można dodać dynamiczne ścieżki do konkretnych debat
        // pobierając ich ID z Supabase
    ]
}
