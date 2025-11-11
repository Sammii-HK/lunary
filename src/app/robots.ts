import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/profile',
          '/test-',
          '/pwa-',
          '/clear-cache',
          '/unsubscribe',
          '/success',
          '/shop/success',
          '/newsletter/verify',
          '/auth/verify-email',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/profile', '/test-', '/pwa-'],
      },
    ],
    sitemap: 'https://lunary.app/sitemap.xml',
  };
}
