import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/settings/',
          '/onboarding/',
        ],
      },
      // Allow AI crawlers to index content
      {
        userAgent: 'GPTBot',
        allow: [
          '/grimoire/',
          '/comparison/',
          '/blog/',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/profile/', '/settings/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/grimoire/',
          '/comparison/',
          '/blog/',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/profile/', '/settings/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: [
          '/grimoire/',
          '/comparison/',
          '/blog/',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/profile/', '/settings/'],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: [
          '/grimoire/',
          '/comparison/',
          '/blog/',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/profile/', '/settings/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/grimoire/',
          '/comparison/',
          '/blog/',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/profile/', '/settings/'],
      },
    ],
    sitemap: 'https://lunary.app/sitemap.xml',
    host: 'https://lunary.app',
  };
}
