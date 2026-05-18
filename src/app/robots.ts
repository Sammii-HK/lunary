import { MetadataRoute } from 'next';
import {
  AI_CRAWLER_USER_AGENTS,
  AI_DISCOVERY_PATHS,
} from '@/lib/seo/discovery';

const PUBLIC_AI_CONTENT_PATHS = [
  '/grimoire/',
  '/comparison/',
  '/blog/',
  '/horoscope/',
  ...AI_DISCOVERY_PATHS,
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og/'],
        disallow: ['/admin/', '/api/', '/profile/'],
      },
      // Allow AI crawlers to index content for retrieval and citation
      ...AI_CRAWLER_USER_AGENTS.map((bot) => ({
        userAgent: bot,
        allow: PUBLIC_AI_CONTENT_PATHS,
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
