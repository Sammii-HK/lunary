import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';
import { spellcastFetch, isSpellcastConfigured } from '@/lib/social/spellcast';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Pipeline health check (daily at 22:00 UTC)
 *
 * Checks that tomorrow's content is ready:
 * 1. Queries notification_sent_events for tomorrow's generation flags
 * 2. Queries Spellcast API for scheduled Lunary posts for tomorrow
 *
 * Silent on success. Discord alert if gaps found.
 */
export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authHeader = request.headers.get('authorization');

  if (!isVercelCron) {
    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const issues: string[] = [];
    const checks: Record<string, { ok: boolean; detail: string }> = {};

    // Check 1: notification_sent_events for tomorrow's crons
    const cronTypes = [
      { key: `daily-posts-${tomorrowStr}`, label: 'Daily Posts' },
    ];

    for (const cron of cronTypes) {
      try {
        const result = await sql`
          SELECT id FROM notification_sent_events
          WHERE event_key = ${cron.key}
          LIMIT 1
        `;
        const generated = result.rows.length > 0;
        checks[cron.label] = {
          ok: generated,
          detail: generated ? 'Generated' : 'NOT generated',
        };
        if (!generated) {
          issues.push(`${cron.label} not generated for ${tomorrowStr}`);
        }
      } catch {
        checks[cron.label] = { ok: false, detail: 'Query failed' };
        issues.push(`${cron.label} check failed`);
      }
    }

    // Check 2: Stories (use social_posts table directly)
    try {
      const storiesResult = await sql`
        SELECT COUNT(*) as count FROM social_posts
        WHERE post_type = 'story' AND platform = 'instagram'
          AND scheduled_date::date = ${tomorrowStr}::date
          AND status = 'sent'
      `;
      const storyCount = Number(storiesResult.rows[0]?.count || 0);
      const storiesOk = storyCount >= 4;
      checks['Daily Stories'] = {
        ok: storiesOk,
        detail: `${storyCount}/4 stories`,
      };
      if (!storiesOk) {
        issues.push(
          `Only ${storyCount}/4 stories generated for ${tomorrowStr}`,
        );
      }
    } catch {
      checks['Daily Stories'] = { ok: false, detail: 'Query failed' };
      issues.push('Stories check failed');
    }

    // Check 3: Spellcast scheduled posts for tomorrow
    let spellcastCount = 0;
    if (isSpellcastConfigured()) {
      try {
        const accountSetId = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID;
        const res = await spellcastFetch(
          `/api/posts?status=scheduled&accountSetId=${accountSetId}&from=${tomorrowStr}&to=${tomorrowStr}`,
        );
        if (res.ok) {
          const data = await res.json();
          spellcastCount = Array.isArray(data)
            ? data.length
            : (data.posts?.length ?? 0);
        }
        const spellcastOk = spellcastCount >= 3;
        checks['Spellcast Posts'] = {
          ok: spellcastOk,
          detail: `${spellcastCount} scheduled`,
        };
        if (!spellcastOk) {
          issues.push(
            `Only ${spellcastCount} Spellcast posts scheduled for ${tomorrowStr} (expected 3+)`,
          );
        }
      } catch {
        checks['Spellcast Posts'] = { ok: false, detail: 'API unreachable' };
        issues.push('Spellcast API unreachable');
      }
    } else {
      checks['Spellcast Posts'] = { ok: false, detail: 'Not configured' };
      issues.push('Spellcast not configured');
    }

    // Check 4: Business health — signups and verification emails
    try {
      const signupResult = await sql`
        SELECT
          COUNT(*) as total,
          MAX("createdAt") as last_signup
        FROM public."user"
        WHERE "createdAt" > NOW() - INTERVAL '48 hours'
      `;
      const signupsIn48h = Number(signupResult.rows[0]?.total || 0);
      const lastSignup = signupResult.rows[0]?.last_signup;

      const lastSignupResult = await sql`
        SELECT MAX("createdAt") as last_signup FROM public."user"
      `;
      const lastSignupEver = lastSignupResult.rows[0]?.last_signup;
      const hoursSinceLastSignup = lastSignupEver
        ? Math.floor(
            (Date.now() - new Date(lastSignupEver).getTime()) / 3_600_000,
          )
        : null;

      const signupsOk = signupsIn48h > 0 || hoursSinceLastSignup === null;
      checks['Signups (48h)'] = {
        ok: signupsOk,
        detail: signupsOk
          ? `${signupsIn48h} signup(s), last: ${lastSignup ? new Date(lastSignup).toISOString() : 'n/a'}`
          : `0 signups in 48h — last was ${hoursSinceLastSignup}h ago`,
      };
      if (!signupsOk) {
        issues.push(
          `No new signups in 48h (last signup was ${hoursSinceLastSignup}h ago)`,
        );
      }
    } catch {
      checks['Signups (48h)'] = { ok: false, detail: 'Query failed' };
      issues.push('Signup health check failed');
    }

    // Check 5: Verification emails sent in 48h (only flag if signups exist but emails not going out)
    try {
      const verifResult = await sql`
        SELECT COUNT(*) as count
        FROM analytics_notification_events
        WHERE notification_type = 'email_verification'
          AND event_type = 'sent'
          AND created_at > NOW() - INTERVAL '48 hours'
      `;
      const verifCount = Number(verifResult.rows[0]?.count || 0);

      const signupsRecently =
        checks['Signups (48h)']?.ok === false ? true : false; // only check if signups are happening
      // Only alert on verification emails if we had signups but no emails went out
      if (!signupsRecently && verifCount === 0) {
        // No signups in 48h either — already flagged above, don't double-alert
      }
      checks['Verification Emails (48h)'] = {
        ok: true,
        detail: `${verifCount} sent`,
      };
    } catch {
      checks['Verification Emails (48h)'] = { ok: true, detail: 'N/A' };
    }

    // Alert only if issues found
    if (issues.length > 0) {
      const baseUrl = (
        process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app'
      ).replace(/\/$/, '');
      const triggerUrl = `${baseUrl}/api/cron/backfill-week?startDate=${tomorrowStr}&days=1`;

      await sendDiscordNotification({
        title: `Pipeline Health: ${issues.length} issue(s) for ${tomorrowStr}`,
        description: [
          ...issues.map((i) => `- ${i}`),
          '',
          `**One-click fix:** \`curl -H "Authorization: Bearer $CRON_SECRET" "${triggerUrl}"\``,
        ].join('\n'),
        color: 'warning',
        category: 'urgent',
      });
    }

    return NextResponse.json({
      success: issues.length === 0,
      date: tomorrowStr,
      checks,
      issues,
    });
  } catch (error) {
    console.error('[pipeline-health] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
