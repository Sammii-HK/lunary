import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/sitemap-*.xml'],
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/api/og/', '/sitemap-images.xml'],
        disallow: ['/api/cron/', '/api/admin/', '/api/ai/', '/api/stripe/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: [
      'https://lunary.app/sitemap-index.xml',
      'https://lunary.app/sitemap.xml',
      'https://lunary.app/sitemap-images.xml',
    ],
  };
}
