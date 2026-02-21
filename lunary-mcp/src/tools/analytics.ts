import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lunary } from '../client.js';
import {
  jsonResult,
  errorResult,
  timeParams,
  timeQueryParams,
} from '../types.js';

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

  server.tool(
    'get_api_costs',
    'API spend breakdown by provider (OpenAI, Anthropic, etc.)',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/api-costs', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_ai_insights',
    'AI-generated anomaly detection and trend insights',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/insights', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_cohorts',
    'Cohort grouping analysis with behavioral segments',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/cohorts', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_notification_stats',
    'Push notification delivery rates and engagement',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/notifications', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_intention_breakdown',
    'User intent tracking — what users are trying to accomplish',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/intention-breakdown', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_success_metrics',
    'KPI dashboard — key success metrics and goal tracking',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/analytics/success-metrics', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
