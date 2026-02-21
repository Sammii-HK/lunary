import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary, BASE_URL, ADMIN_KEY } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

const CRON_JOBS = [
  {
    path: '/api/cron/generate-daily-tarot',
    schedule: '5 0 * * *',
    description: 'Generate daily tarot readings',
  },
  {
    path: '/api/cron/process-deletions',
    schedule: '0 2 * * *',
    description: 'Process account deletion requests',
  },
  {
    path: '/api/cron/compute-metrics',
    schedule: '0 1 * * *',
    description: 'Compute daily analytics metrics',
  },
  {
    path: '/api/cron/update-global-cosmic-data',
    schedule: '0 6 * * *',
    description: 'Update global cosmic/planetary data',
  },
  {
    path: '/api/cron/daily-morning-notification',
    schedule: '0 8 * * *',
    description: 'Send morning push notifications',
  },
  {
    path: '/api/cron/daily-cosmic-pulse',
    schedule: '0 10 * * *',
    description: 'Daily cosmic pulse notification',
  },
  {
    path: '/api/cron/moon-circles',
    schedule: '0 10 * * *',
    description: 'Moon circle events processing',
  },
  {
    path: '/api/cron/daily-posts',
    schedule: '0 8 * * *',
    description: 'Generate and post daily social content',
  },
  {
    path: '/api/cron/weekly-content',
    schedule: '0 8 * * 0',
    description: 'Generate weekly content (Sundays)',
  },
  {
    path: '/api/cron/weekly-metrics',
    schedule: '0 2 * * 1',
    description: 'Compute weekly metrics (Mondays)',
  },
  {
    path: '/api/cron/fx-drift',
    schedule: '0 9 1 * *',
    description: 'Monthly FX drift check',
  },
  {
    path: '/api/cron/yearly-tarot-analysis',
    schedule: '15 0 1 1 *',
    description: 'Annual tarot analysis (Jan 1)',
  },
  {
    path: '/api/cron/compute-transit-dates',
    schedule: '30 0 1 1 *',
    description: 'Compute transit dates (Jan 1)',
  },
  {
    path: '/api/cron/monthly-metrics',
    schedule: '0 3 2 * *',
    description: 'Monthly metrics rollup (2nd of month)',
  },
  {
    path: '/api/cron/pattern-snapshots',
    schedule: '0 4 * * 0',
    description: 'Weekly pattern snapshots (Sundays)',
  },
  {
    path: '/api/cron/activate-retrograde-spaces',
    schedule: '0 6 * * *',
    description: 'Activate retrograde community spaces',
  },
  {
    path: '/api/cron/weekly-subscription-sync',
    schedule: '0 2 * * 0',
    description: 'Sync Stripe subscriptions (Sundays)',
  },
  {
    path: '/api/cron/generate-weekly-challenge',
    schedule: '0 7 * * 1',
    description: 'Generate weekly challenge (Mondays)',
  },
  {
    path: '/api/cron/detect-milestones',
    schedule: '30 6 * * *',
    description: 'Detect user milestones for notifications',
  },
];

export function registerHealthTools(server: McpServer) {
  server.tool(
    'health_check',
    'Quick health check — is lunary.app responding?',
    {},
    async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/health`);
        const data = await res.json();
        return jsonResult({ status: res.status, ...data });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'deep_health_check',
    'Full health check: homepage, API, OG images, response times',
    {},
    async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cron/health-check`, {
          headers: { Authorization: `Bearer ${ADMIN_KEY}` },
        });
        const data = await res.json();
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'list_cron_jobs',
    'List all configured Vercel cron jobs with their schedules',
    {},
    async () => {
      return jsonResult(CRON_JOBS);
    },
  );

  server.tool(
    'trigger_cron',
    'Manually trigger a cron job by path (e.g. compute-metrics, weekly-metrics, daily-posts)',
    {
      job: z
        .string()
        .describe(
          "Cron job name, e.g. 'compute-metrics', 'weekly-metrics', 'daily-posts'",
        ),
    },
    async ({ job }) => {
      try {
        const res = await fetch(`${BASE_URL}/api/cron/${job}`, {
          headers: { Authorization: `Bearer ${ADMIN_KEY}` },
        });
        const data = await res.json().catch(() => ({ status: res.status }));
        return jsonResult({ triggered: job, status: res.status, ...data });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_db_status',
    'Check Neon PostgreSQL connectivity and query latency',
    {},
    async () => {
      try {
        const data = await lunary('/health/db');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
