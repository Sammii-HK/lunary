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

export function registerFeatureTools(server: McpServer) {
  server.tool(
    'get_feature_usage',
    'Feature usage heatmap: which features, how often, by whom',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/feature-usage', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_feature_adoption',
    'Adoption rates per feature over time',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/feature-adoption', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_cta_conversions',
    'CTA click-through and conversion rates by location and type',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/cta-conversions', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_conversion_influence',
    'Which features most influence trial→paid conversion',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/conversion-influence', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
