import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile/'],
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
        disallow: ['/api/', '/profile/'],
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
        disallow: ['/api/', '/profile/'],
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
        disallow: ['/api/', '/profile/'],
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
        disallow: ['/api/', '/profile/'],
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
        disallow: ['/api/', '/profile/'],
      },
    ],
    sitemap: 'https://lunary.app/sitemap.xml',
    host: 'https://lunary.app',
  };
}
