import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/discord';

const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SLOW_RESPONSE_MS = 3000; // 3 seconds
const MAX_CONSECUTIVE_FAILURES = 2; // Alert after 2 consecutive failures

let consecutiveFailures = 0;
let lastCheckTime = 0;
let lastFailureTime = 0;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.lunary.app'
        : 'http://localhost:3000';

    const endpoints = [
      { name: 'Homepage', url: `${baseUrl}/` },
      {
        name: 'API Health',
        url: `${baseUrl}/api/og/cosmic-post/${new Date().toISOString().split('T')[0]}`,
      },
    ];

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Lunary-Health-Check/1.0',
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          const responseTime = Date.now() - startTime;
          const isOk = response.ok && response.status < 500;
          const isSlow = responseTime > SLOW_RESPONSE_MS;

          return {
            name: endpoint.name,
            url: endpoint.url,
            status: response.status,
            ok: isOk,
            responseTime,
            slow: isSlow,
            error: null,
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            name: endpoint.name,
            url: endpoint.url,
            status: 0,
            ok: false,
            responseTime,
            slow: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    const checks = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter(Boolean);

    const allHealthy = checks.every((check) => check?.ok && !check?.slow);
    const anyDown = checks.some((check) => !check?.ok);
    const anySlow = checks.some((check) => check?.ok && check?.slow);

    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTime;
    lastCheckTime = now;

    if (anyDown) {
      consecutiveFailures++;
      lastFailureTime = now;
    } else {
      consecutiveFailures = 0;
    }

    if (
      consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ||
      (anyDown && consecutiveFailures > 0)
    ) {
      const statusColor = anyDown ? 'error' : anySlow ? 'warning' : 'success';

      const fields = checks
        .filter((check): check is NonNullable<typeof check> => check !== null)
        .map((check) => ({
          name: check.name,
          value: check.ok
            ? `✅ ${check.status} (${check.responseTime}ms)${check.slow ? ' ⚠️ Slow' : ''}`
            : `❌ ${check.status || 'Failed'} (${check.responseTime}ms)${check.error ? `\n${check.error}` : ''}`,
          inline: true,
        }));

      fields.push({
        name: 'Consecutive Failures',
        value: String(consecutiveFailures),
        inline: true,
      });

      await sendDiscordNotification({
        title: anyDown
          ? '🚨 Site Health Check Failed'
          : anySlow
            ? '⚠️ Site Performance Degraded'
            : '✅ Site Health Check Passed',
        description: anyDown
          ? 'One or more endpoints are down or returning errors.'
          : anySlow
            ? 'One or more endpoints are responding slowly.'
            : 'All endpoints are healthy and responding normally.',
        fields,
        color: statusColor,
        footer: `Checked at ${new Date().toISOString()}`,
      });

      if (allHealthy) {
        consecutiveFailures = 0;
      }
    }

    return NextResponse.json({
      success: true,
      healthy: allHealthy,
      checks,
      consecutiveFailures,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
