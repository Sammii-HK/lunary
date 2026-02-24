import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lunary } from '../client.js';
import {
  jsonResult,
  errorResult,
  timeParams,
  timeQueryParams,
} from '../types.js';

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
