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

export function registerRevenueTools(server: McpServer) {
  server.tool(
    'get_revenue',
    'MRR, total revenue, signups→conversions for period',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/revenue', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_subscription_lifecycle',
    'Trial→paid→churn flow analysis',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/subscription-lifecycle', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_subscription_30d',
    '30-day subscription trend with daily breakdown',
    {},
    async () => {
      try {
        const data = await lunary('/analytics/subscription-30d');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_plan_breakdown',
    'Distribution across free/trial/monthly/yearly plans',
    {},
    async () => {
      try {
        const data = await lunary('/analytics/plan-breakdown');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_subscriber_count',
    'Current active push notification subscriber count',
    {},
    async () => {
      try {
        const data = await lunary('/subscriber-count');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
