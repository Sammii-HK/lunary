import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateScriptForContentType } from '@/lib/social/video-scripts/generators/weekly-secondary';
import { saveVideoScript } from '@/lib/social/video-scripts/database';
import type { ContentType } from '@/lib/social/video-scripts/content-types';

export const runtime = 'nodejs';
export const maxDuration = 120;

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/**
 * Detect content type from a social_post topic string.
 *
 * The engagement generators set facetTitle with recognisable prefixes:
 *   sign-check  → "{Sign}: {angle}"
 *   ranking     → "Ranking signs: {topic}"
 *   hot-take    → "Hot take: {topic}"
 *   quiz        → contains "vs" (e.g. "Aries vs Leo vs Sagittarius")
 *   myth        → storytime topics (fallback after other checks)
 *   transit-alert → planet names + "into" + sign
 */
function detectContentType(topic: string): ContentType | null {
  if (!topic) return null;

  // Sign Check: starts with a zodiac sign + ":"
  if (ZODIAC_SIGNS.some((sign) => topic.startsWith(`${sign}:`))) {
    return 'sign-check';
  }

  // Ranking
  if (topic.startsWith('Ranking signs:')) {
    return 'ranking';
  }

  // Hot Take
  if (topic.startsWith('Hot take:')) {
    return 'hot-take';
  }

  // Quiz: contains "vs" between terms
  if (/\bvs\b/i.test(topic)) {
    return 'quiz';
  }

  // Transit Alert: planet name + "into" or "stationing"
  const transitPlanets = [
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];
  if (
    transitPlanets.some(
      (planet) =>
        topic.includes(planet) &&
        (/\binto\b/i.test(topic) || /\bstationing\b/i.test(topic)),
    )
  ) {
    return 'transit-alert';
  }

  // Myth: fallback for engagement topics that don't match above
  return 'myth';
}

function getWeekStartForDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const weekStart = body.weekStart as string | undefined;

    // Find video social_posts that have no matching video_scripts row
    const missing = weekStart
      ? await sql`
          SELECT
            sp.id,
            sp.topic,
            sp.scheduled_date as "scheduledDate",
            sp.week_start as "weekStart",
            sp.week_theme as "weekTheme"
          FROM social_posts sp
          WHERE sp.post_type = 'video'
            AND sp.status IN ('pending', 'approved')
            AND NOT EXISTS (
              SELECT 1 FROM video_scripts vs
              WHERE vs.platform = 'tiktok'
                AND vs.scheduled_date = sp.scheduled_date::date
                AND vs.facet_title = sp.topic
            )
            AND sp.scheduled_date >= ${weekStart}::date
            AND sp.scheduled_date < (${weekStart}::date + INTERVAL '7 days')
          ORDER BY sp.scheduled_date ASC
        `
      : await sql`
          SELECT
            sp.id,
            sp.topic,
            sp.scheduled_date as "scheduledDate",
            sp.week_start as "weekStart",
            sp.week_theme as "weekTheme"
          FROM social_posts sp
          WHERE sp.post_type = 'video'
            AND sp.status IN ('pending', 'approved')
            AND NOT EXISTS (
              SELECT 1 FROM video_scripts vs
              WHERE vs.platform = 'tiktok'
                AND vs.scheduled_date = sp.scheduled_date::date
                AND vs.facet_title = sp.topic
            )
          ORDER BY sp.scheduled_date ASC
        `;

    if (missing.rows.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        failed: 0,
        message: 'No missing scripts found',
      });
    }

    let generated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of missing.rows) {
      const topic = row.topic as string;
      const scheduledDate = new Date(row.scheduledDate);
      const contentType = detectContentType(topic);

      if (!contentType) {
        errors.push(`Could not detect content type for topic: "${topic}"`);
        failed++;
        continue;
      }

      try {
        console.log(
          `Generating missing script: "${topic}" (${contentType}) for ${scheduledDate.toISOString().split('T')[0]}`,
        );

        const script = await generateScriptForContentType(
          contentType,
          scheduledDate,
        );

        if (!script) {
          errors.push(
            `Generator returned null for "${topic}" (${contentType})`,
          );
          failed++;
          continue;
        }

        const scriptId = await saveVideoScript(script);

        // Create video_jobs entry
        const weekStartKey =
          row.weekStart?.split?.('T')?.[0] ||
          getWeekStartForDate(scheduledDate);
        const dateKey = scheduledDate.toISOString().split('T')[0];

        await sql`
          INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
          VALUES (${scriptId}, ${weekStartKey}, ${dateKey}, ${topic}, 'pending', NOW(), NOW())
          ON CONFLICT (week_start, date_key, topic)
          DO UPDATE SET script_id = ${scriptId}, status = 'pending', last_error = NULL, updated_at = NOW()
        `;

        generated++;
        console.log(
          `  Saved script #${scriptId} and queued video job for "${topic}"`,
        );
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to generate "${topic}": ${msg}`);
        failed++;
        console.error(`  Failed to generate "${topic}":`, error);
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      failed,
      total: missing.rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error generating missing scripts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
