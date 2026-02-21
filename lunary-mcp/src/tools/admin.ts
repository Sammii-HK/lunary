import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerAdminTools(server: McpServer) {
  server.tool(
    'get_activity',
    'Recent activity feed — signups, events, errors, feature usage',
    {
      type: z
        .string()
        .optional()
        .describe('Filter by activity type (e.g. signup, error, feature)'),
      limit: z
        .number()
        .optional()
        .describe('Max number of items to return (default 50)'),
      stats: z.boolean().optional().describe('Include aggregate stats summary'),
    },
    async ({ type, limit, stats }) => {
      try {
        const data = await lunary('/activity', {
          params: {
            ...(type && { type }),
            ...(limit && { limit: String(limit) }),
            ...(stats && { stats: 'true' }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_push_subscribers',
    'List active push notification subscribers',
    {},
    async () => {
      try {
        const data = await lunary('/push-subscriptions');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'reactivate_push_subscribers',
    'Re-send activation to lapsed push subscribers',
    {},
    async () => {
      try {
        const data = await lunary('/push-subscriptions', {
          method: 'POST',
          body: { action: 'reactivate' },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'cleanup_stale_subscriptions',
    'Remove stale/expired push notification subscriptions',
    {},
    async () => {
      try {
        const data = await lunary('/push-subscriptions', {
          method: 'POST',
          body: { action: 'cleanup-stale' },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'list_announcements',
    'List all in-app announcements (active, scheduled, expired)',
    {},
    async () => {
      try {
        const data = await lunary('/announcements');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'create_announcement',
    'Create a new in-app announcement',
    {
      title: z.string().describe('Announcement title'),
      body: z.string().describe('Announcement body text'),
      type: z
        .enum(['info', 'warning', 'success', 'promo'])
        .optional()
        .describe('Announcement type (default info)'),
      starts_at: z
        .string()
        .optional()
        .describe('Start date (ISO string, default now)'),
      ends_at: z
        .string()
        .optional()
        .describe('End date (ISO string, default 7 days)'),
    },
    async ({ title, body, type, starts_at, ends_at }) => {
      try {
        const data = await lunary('/announcements', {
          method: 'POST',
          body: {
            title,
            body,
            ...(type && { type }),
            ...(starts_at && { startsAt: starts_at }),
            ...(ends_at && { endsAt: ends_at }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'update_announcement',
    'Update an existing announcement',
    {
      id: z.string().describe('Announcement ID to update'),
      title: z.string().optional().describe('New title'),
      body: z.string().optional().describe('New body text'),
      active: z
        .boolean()
        .optional()
        .describe('Enable/disable the announcement'),
    },
    async ({ id, title, body, active }) => {
      try {
        const data = await lunary(`/announcements`, {
          method: 'PATCH',
          body: {
            id,
            ...(title && { title }),
            ...(body && { body }),
            ...(active !== undefined && { active }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
