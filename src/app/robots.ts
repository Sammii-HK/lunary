import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/sitemap-*.xml'],
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/api/og/', '/sitemap-images.xml'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/api/gpt/'],
        disallow: ['/api/admin/', '/admin/', '/auth/', '/profile'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/api/gpt/'],
        disallow: ['/api/admin/', '/admin/', '/auth/', '/profile'],
      },
    ],
    sitemap: [
      'https://lunary.app/sitemap-index.xml',
      'https://lunary.app/sitemap.xml',
      'https://lunary.app/sitemap-images.xml',
    ],
  };
}
