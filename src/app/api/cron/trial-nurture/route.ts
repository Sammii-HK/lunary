import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import { formatDate } from '@/lib/analytics/date-range';
import {
  generateTrialDay2EmailHTML,
  generateTrialDay2EmailText,
  generateTrialDay3EmailHTML,
  generateTrialDay3EmailText,
  generateTrialDay5EmailHTML,
  generateTrialDay5EmailText,
} from '@/lib/email-templates/trial-nurture';
import {
  renderBirthChartDay1,
  renderBirthChartDay4,
  renderBirthChartDay6,
  renderBirthChartDay7,
  renderCompleteBirthChartCta,
} from '@/lib/email-components/BirthChartDripEmails';
import sunPlacements from '@/data/sun-placements.json';
import venusPlacements from '@/data/venus-placements.json';

export const dynamic = 'force-dynamic';

interface PlacementData {
  sign: string;
  lifeThemes?: string;
  coreTraits?: string[];
  strengths?: string[];
}

type PlacementsFile = {
  placements: Record<string, PlacementData>;
};

function getPlacementInterpretation(
  placementsFile: PlacementsFile,
  sign: string,
): PlacementData | null {
  const key = Object.keys(placementsFile.placements).find((k) =>
    k.toLowerCase().includes(sign.toLowerCase()),
  );
  return key ? placementsFile.placements[key] : null;
}

interface BirthChartPlacements {
  sun?: string;
  moon?: string;
  rising?: string;
  venus?: string;
  mars?: string;
}

function extractPlacements(birthChart: unknown): BirthChartPlacements | null {
  if (!Array.isArray(birthChart)) return null;

  const result: BirthChartPlacements = {};
  for (const placement of birthChart) {
    if (typeof placement !== 'object' || !placement) continue;
    const body = (placement as Record<string, unknown>).body as string;
    const sign = (placement as Record<string, unknown>).sign as string;
    if (!body || !sign) continue;

    if (body === 'Sun') result.sun = sign;
    else if (body === 'Moon') result.moon = sign;
    else if (body === 'Ascendant') result.rising = sign;
    else if (body === 'Venus') result.venus = sign;
    else if (body === 'Mars') result.mars = sign;
  }

  return result.sun ? result : null;
}

const TRIAL_BASE_QUERY = `
  FROM subscriptions s
  LEFT JOIN user_profiles up ON s.user_id = up.user_id
  WHERE s.status = 'trial'
  AND s.trial_ends_at IS NOT NULL
  AND s.user_email IS NOT NULL
  AND (s.has_discount IS NULL OR s.has_discount = false)
  AND (s.promo_code IS NULL OR s.promo_code = '')
`;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sent: Record<string, number> = {};
    const errors: string[] = [];

    // Helper to get date N days ago
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d;
    };

    // ─── Day 1: Sun Sign (birth chart drip) ─────────────────────────

    const day1Date = daysAgo(1);
    const day1Trials = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
              s.trial_ends_at, up.birth_chart
       ${TRIAL_BASE_QUERY}
       AND DATE(s.created_at) = $1
       AND (s.trial_nurture_day1_sent = false OR s.trial_nurture_day1_sent IS NULL)`,
      [formatDate(day1Date)],
    );

    sent.day1 = 0;
    for (const user of day1Trials.rows) {
      try {
        const placements = extractPlacements(user.birth_chart);

        let html: string;
        let subject: string;

        if (placements?.sun) {
          const interp = getPlacementInterpretation(
            sunPlacements as PlacementsFile,
            placements.sun,
          );
          html = await renderBirthChartDay1({
            userName: user.name || 'there',
            sign: placements.sun,
            planet: 'Sun',
            interpretation: {
              lifeThemes: interp?.lifeThemes,
              coreTraits: interp?.coreTraits,
              strengths: interp?.strengths,
            },
            userEmail: user.email,
          });
          subject = `Your Sun in ${placements.sun} — here's what it means`;
        } else {
          html = await renderCompleteBirthChartCta({
            userName: user.name || 'there',
            userEmail: user.email,
          });
          subject = 'Unlock your cosmic blueprint';
        }

        await sendEmail({
          to: user.email,
          subject,
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day1-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'birth_drip',
              content: 'day1',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day1_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day1++;
      } catch (error) {
        errors.push(
          `Day 1 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 2: Birth Chart Reveals (existing) ──────────────────────

    const day2Date = daysAgo(2);
    const day2Trials = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name, s.trial_ends_at
      FROM subscriptions s
      WHERE s.status = 'trial' AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${formatDate(day2Date)}
      AND (s.trial_nurture_day2_sent = false OR s.trial_nurture_day2_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
    `;

    sent.day2 = 0;
    for (const user of day2Trials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = await generateTrialDay2EmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = await generateTrialDay2EmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: '🌟 Your Birth Chart Reveals...',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day2-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day2',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day2_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day2++;
      } catch (error) {
        errors.push(
          `Day 2 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 3: Daily Guidance Personalized (existing) ──────────────

    const day3Date = daysAgo(3);
    const day3Trials = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name, s.trial_ends_at
      FROM subscriptions s
      WHERE s.status = 'trial' AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${formatDate(day3Date)}
      AND (s.trial_nurture_day3_sent = false OR s.trial_nurture_day3_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
    `;

    sent.day3 = 0;
    for (const user of day3Trials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = await generateTrialDay3EmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = await generateTrialDay3EmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: '🔮 Your Daily Guidance is Personalised',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day3-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day3',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day3_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day3++;
      } catch (error) {
        errors.push(
          `Day 3 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 4: Venus (birth chart drip) ────────────────────────────

    const day4Date = daysAgo(4);
    const day4Trials = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
              s.trial_ends_at, up.birth_chart
       ${TRIAL_BASE_QUERY}
       AND DATE(s.created_at) = $1
       AND (s.trial_nurture_day4_sent = false OR s.trial_nurture_day4_sent IS NULL)`,
      [formatDate(day4Date)],
    );

    sent.day4 = 0;
    for (const user of day4Trials.rows) {
      try {
        const placements = extractPlacements(user.birth_chart);

        let html: string;
        let subject: string;

        if (placements?.venus) {
          const interp = getPlacementInterpretation(
            venusPlacements as PlacementsFile,
            placements.venus,
          );
          html = await renderBirthChartDay4({
            userName: user.name || 'there',
            sign: placements.venus,
            planet: 'Venus',
            interpretation: {
              lifeThemes: interp?.lifeThemes,
              coreTraits: interp?.coreTraits,
              strengths: interp?.strengths,
            },
            userEmail: user.email,
          });
          subject = `Your Venus in ${placements.venus} — love & relationships`;
        } else {
          html = await renderCompleteBirthChartCta({
            userName: user.name || 'there',
            userEmail: user.email,
          });
          subject = 'Discover your love language through your birth chart';
        }

        await sendEmail({
          to: user.email,
          subject,
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day4-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'birth_drip',
              content: 'day4',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day4_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day4++;
      } catch (error) {
        errors.push(
          `Day 4 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 5: 2 Days Left (existing) ──────────────────────────────

    const day5Date = daysAgo(5);
    const day5Trials = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name, s.trial_ends_at
      FROM subscriptions s
      WHERE s.status = 'trial' AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${formatDate(day5Date)}
      AND (s.trial_nurture_day5_sent = false OR s.trial_nurture_day5_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
    `;

    sent.day5 = 0;
    for (const user of day5Trials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = await generateTrialDay5EmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = await generateTrialDay5EmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: "⏰ 2 Days Left—Here's What You'll Miss",
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day5-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_nurture',
              content: 'day5',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day5_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day5++;
      } catch (error) {
        errors.push(
          `Day 5 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 6: Big 3 Summary (birth chart drip) ────────────────────

    const day6Date = daysAgo(6);
    const day6Trials = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
              s.trial_ends_at, up.birth_chart
       ${TRIAL_BASE_QUERY}
       AND DATE(s.created_at) = $1
       AND (s.trial_nurture_day6_sent = false OR s.trial_nurture_day6_sent IS NULL)`,
      [formatDate(day6Date)],
    );

    sent.day6 = 0;
    for (const user of day6Trials.rows) {
      try {
        const placements = extractPlacements(user.birth_chart);

        let html: string;
        let subject: string;

        if (placements?.sun && placements?.moon && placements?.rising) {
          html = await renderBirthChartDay6({
            userName: user.name || 'there',
            sunSign: placements.sun,
            moonSign: placements.moon,
            risingSign: placements.rising,
            userEmail: user.email,
          });
          subject = `Your Big 3: ${placements.sun} Sun, ${placements.moon} Moon, ${placements.rising} Rising`;
        } else {
          html = await renderCompleteBirthChartCta({
            userName: user.name || 'there',
            userEmail: user.email,
          });
          subject = 'Your Big 3 — the full cosmic picture';
        }

        await sendEmail({
          to: user.email,
          subject,
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day6-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'birth_drip',
              content: 'day6',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day6_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day6++;
      } catch (error) {
        errors.push(
          `Day 6 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 7: Current Transits (birth chart drip) ─────────────────

    const day7Date = daysAgo(7);
    const day7Trials = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name, s.trial_ends_at
      FROM subscriptions s
      WHERE s.status = 'trial' AND s.trial_ends_at IS NOT NULL
      AND DATE(s.created_at) = ${formatDate(day7Date)}
      AND (s.trial_nurture_day7_sent = false OR s.trial_nurture_day7_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
    `;

    sent.day7 = 0;
    for (const user of day7Trials.rows) {
      try {
        const html = await renderBirthChartDay7({
          userName: user.name || 'there',
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: "What's ahead — your current transits",
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_nurture',
            notificationId: `trial-nurture-day7-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'birth_drip',
              content: 'day7',
            },
          },
        });

        await sql`UPDATE subscriptions SET trial_nurture_day7_sent = true WHERE user_id = ${user.user_id} AND status = 'trial'`;
        sent.day7++;
      } catch (error) {
        errors.push(
          `Day 7 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    const total = Object.values(sent).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      sent: { ...sent, total },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Trial nurture cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send trial nurture emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
