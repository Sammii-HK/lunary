import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import {
  jsonResult,
  errorResult,
  timeParams,
  timeQueryParams,
} from '../types.js';

export function registerContentTools(server: McpServer) {
  server.tool(
    'get_search_console',
    'Google Search Console: impressions, clicks, CTR, top queries and pages',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/search-console', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_grimoire_health',
    'Grimoire content health: missing pages, broken links, coverage gaps',
    {},
    async () => {
      try {
        const data = await lunary('/analytics/grimoire-health');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_seo_metrics',
    'SEO indexing audit: indexed pages, crawl errors, sitemap coverage',
    {},
    async () => {
      try {
        const data = await lunary('/seo/indexing-audit');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_grimoire_context',
    'Query Lunary grimoire knowledge base: retrieve grounded passages about astrology, crystals, spells, tarot, correspondences. Use lightweight mode for topic knowledge, full mode for user-specific transits + grimoire.',
    {
      query: z
        .string()
        .describe(
          'Topic to search (e.g. "Pisces season energy", "full moon ritual", "rose quartz")',
        ),
      mode: z
        .enum(['lightweight', 'full'])
        .optional()
        .describe(
          'lightweight = grimoire only (default), full = grimoire + transits/moon/tarot (requires user_id)',
        ),
      limit: z
        .number()
        .optional()
        .describe('Number of grimoire results (1-10, default 3)'),
      category: z
        .string()
        .optional()
        .describe(
          'Filter by grimoire category (e.g. crystals, spells, zodiac)',
        ),
      user_id: z
        .string()
        .optional()
        .describe('User ID for full mode (birth chart / transit context)'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire-context', {
          method: 'POST',
          body: {
            query: params.query,
            ...(params.mode && { mode: params.mode }),
            ...(params.limit && { limit: params.limit }),
            ...(params.category && { category: params.category }),
            ...(params.user_id && { userId: params.user_id }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_ai_engagement',
    'AI feature engagement: personalized horoscopes, birth charts, astral chat usage',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/ai-engagement', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
