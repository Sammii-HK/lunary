import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import {
  jsonResult,
  errorResult,
  timeParams,
  timeQueryParams,
} from '../types.js';

export function registerOperationsTools(server: McpServer) {
  server.tool(
    'get_instagram_performance',
    'Instagram post performance: reach, impressions, engagement rate',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/instagram-performance', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_tiktok_performance',
    'TikTok video performance: views, likes, shares, completion rate',
    timeParams,
    async (params) => {
      try {
        const data = await lunary('/tiktok-performance', {
          params: timeQueryParams(params),
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_notification_history',
    'Sent push notification history with delivery status',
    {
      limit: z
        .number()
        .optional()
        .describe('Max number of notifications to return (default 50)'),
    },
    async ({ limit }) => {
      try {
        const data = await lunary('/notifications/sent-history', {
          params: {
            ...(limit && { limit: String(limit) }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_user_engagement',
    'Per-user engagement deep dive: sessions, features, retention',
    {
      user_id: z.string().describe('User ID to analyze'),
    },
    async ({ user_id }) => {
      try {
        const data = await lunary(`/analytics/users/${user_id}/engagement`);
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'debug_stripe_subscription',
    'Debug a Stripe subscription — reconcile local vs Stripe state',
    {
      subscription_id: z
        .string()
        .optional()
        .describe('Stripe subscription ID (debugs all mismatches if omitted)'),
      user_email: z
        .string()
        .optional()
        .describe('User email to look up subscription'),
    },
    async ({ subscription_id, user_email }) => {
      try {
        const data = await lunary('/stripe/subscription-debug', {
          method: 'POST',
          body: {
            ...(subscription_id && { subscriptionId: subscription_id }),
            ...(user_email && { userEmail: user_email }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'resolve_orphaned_subscriptions',
    'Find and resolve orphaned Stripe subscriptions without matching local users',
    {},
    async () => {
      try {
        const data = await lunary('/resolve-orphaned-subscriptions', {
          method: 'POST',
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
