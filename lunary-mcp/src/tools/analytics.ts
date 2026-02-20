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

export function registerAnalyticsTools(server: McpServer) {
  server.tool(
    'get_dashboard',
    'Full dashboard: DAU/WAU/MAU, signups, MRR, stickiness, feature adoption timeseries',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/dashboard', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_analytics',
    'Legacy analytics: funnel, events breakdown, conversion rates',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_dau_wau_mau',
    'Engagement metrics over time with product DAU distinction',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/dau-wau-mau', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_engagement',
    'Engagement overview — sessions, features per user, active days',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/engagement-overview', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_user_segments',
    'User segment breakdown: power users, casual, dormant, churned',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/user-segments', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_metric_snapshot',
    'Point-in-time metric snapshot for comparison',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/snapshot', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
