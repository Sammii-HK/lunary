import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og/'],
        disallow: ['/admin/', '/api/', '/profile/'],
      },
      // Allow AI crawlers to index content for retrieval and citation
      ...[
        'GPTBot',
        'ChatGPT-User',
        'OAI-SearchBot',
        'ClaudeBot',
        'Claude-Web',
        'Anthropic-AI',
        'PerplexityBot',
        'Google-Extended',
        'Applebot-Extended',
        'CCBot',
      ].map((bot) => ({
        userAgent: bot,
        allow: [
          '/grimoire/',
          '/comparison/',
          '/blog/',
          '/horoscope/',
          '/robots.txt',
          '/llms.txt',
          '/llms-full.txt',
          '/.well-known/ai-plugin.json',
          '/.well-known/openapi.json',
          '/.well-known/lunary-gpt-openapi.yaml',
          '/sitemap-index.xml',
          '/sitemap.xml',
        ],
        disallow: ['/api/', '/profile/', '/admin/'],
      })),
    ],
    sitemap: [
      'https://lunary.app/sitemap-index.xml',
      'https://lunary.app/sitemap.xml',
    ],
    host: 'https://lunary.app',
  };
}
