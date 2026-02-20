import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

const timeParams = {
  time_range: z
    .enum(['7d', '30d', '90d', '365d'])
    .optional()
    .describe('Time window (default 30d)'),
  start: z.string().optional().describe('Custom range start (ISO date)'),
  end: z.string().optional().describe('Custom range end (ISO date)'),
};

function timeQueryParams(params: {
  time_range?: string;
  start?: string;
  end?: string;
}) {
  return {
    ...(params.time_range && { range: params.time_range }),
    ...(params.start && { start: params.start }),
    ...(params.end && { end: params.end }),
  };
}

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
