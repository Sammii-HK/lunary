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

export function registerGrowthTools(server: McpServer) {
  server.tool(
    'get_user_growth',
    'Signup trends over time with daily/weekly breakdown',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/user-growth', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_cohort_retention',
    'Weekly cohort retention curves (D1/D7/D30)',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/cohort-retention', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_activation',
    'Activation funnel: signup→birth data→onboarding→feature use',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/activation', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_conversions',
    'Conversion funnel metrics with step-by-step breakdown',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/conversions', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_attribution',
    'Signup attribution by source (UTM, referrer, organic)',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/attribution', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_cac',
    'Customer acquisition cost analysis by channel',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/cac', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
