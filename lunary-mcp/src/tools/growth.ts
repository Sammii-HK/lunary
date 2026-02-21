import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lunary } from '../client.js';
import {
  jsonResult,
  errorResult,
  timeParams,
  timeQueryParams,
} from '../types.js';

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
