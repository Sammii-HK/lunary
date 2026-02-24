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
    'Create a new in-app feature announcement shown to users once per session',
    {
      title: z.string().describe('Announcement title'),
      description: z.string().describe('Announcement body text'),
      icon: z
        .enum(['Sparkles', 'Star', 'Moon', 'Heart', 'Users'])
        .optional()
        .describe('Lucide icon name (default Sparkles)'),
      cta_label: z
        .string()
        .optional()
        .describe('Optional CTA button label (e.g. "Try it now")'),
      cta_href: z
        .string()
        .optional()
        .describe('Optional CTA button link (e.g. "/birth-chart")'),
      required_tier: z
        .array(
          z.enum(['lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual']),
        )
        .optional()
        .describe('Subscription tiers that can see this (omit for all users)'),
      released_at: z
        .string()
        .optional()
        .describe('Release date ISO string (default now)'),
    },
    async ({
      title,
      description,
      icon,
      cta_label,
      cta_href,
      required_tier,
      released_at,
    }) => {
      try {
        const data = await lunary('/announcements', {
          method: 'POST',
          body: {
            title,
            description,
            ...(icon && { icon }),
            ...(cta_label && { ctaLabel: cta_label }),
            ...(cta_href && { ctaHref: cta_href }),
            ...(required_tier && { requiredTier: required_tier }),
            ...(released_at && { releasedAt: released_at }),
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
    'Update an existing in-app feature announcement',
    {
      id: z.string().describe('Announcement ID to update'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New body text'),
      icon: z
        .enum(['Sparkles', 'Star', 'Moon', 'Heart', 'Users'])
        .optional()
        .describe('Lucide icon name'),
      cta_label: z.string().optional().describe('CTA button label'),
      cta_href: z.string().optional().describe('CTA button link'),
      required_tier: z
        .array(
          z.enum(['lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual']),
        )
        .optional()
        .describe('Required subscription tiers (empty array = all users)'),
      is_active: z
        .boolean()
        .optional()
        .describe('Enable/disable the announcement'),
      released_at: z.string().optional().describe('Release date ISO string'),
    },
    async ({
      id,
      title,
      description,
      icon,
      cta_label,
      cta_href,
      required_tier,
      is_active,
      released_at,
    }) => {
      try {
        const data = await lunary(`/announcements`, {
          method: 'PATCH',
          body: {
            id,
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(icon !== undefined && { icon }),
            ...(cta_label !== undefined && { ctaLabel: cta_label }),
            ...(cta_href !== undefined && { ctaHref: cta_href }),
            ...(required_tier !== undefined && { requiredTier: required_tier }),
            ...(is_active !== undefined && { isActive: is_active }),
            ...(released_at !== undefined && { releasedAt: released_at }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
