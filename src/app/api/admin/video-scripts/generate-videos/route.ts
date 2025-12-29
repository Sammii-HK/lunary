import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { categoryThemes } from '@/lib/social/weekly-themes';
import {
  ensureVideoScriptsTable,
  getVideoScripts,
} from '@/lib/social/video-script-generator';

export const runtime = 'nodejs';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

async function ensureVideoJobsTable() {
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS video_jobs (
      id SERIAL PRIMARY KEY,
      script_id INTEGER NOT NULL,
      week_start DATE,
      date_key DATE,
      topic TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_script_id
    ON video_jobs(script_id)
  `;
}

function dedupeScriptsByDate<
  T extends { scheduledDate: Date; facetTitle: string; createdAt?: Date },
>(scripts: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const script of scripts) {
    const dateKey = script.scheduledDate.toISOString().split('T')[0];
    const key = `${dateKey}|${script.facetTitle}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, script);
      continue;
    }
    const existingCreated = existing.createdAt?.getTime() ?? 0;
    const candidateCreated = script.createdAt?.getTime() ?? 0;
    if (candidateCreated >= existingCreated) {
      byKey.set(key, script);
    }
  }
  return Array.from(byKey.values()).sort(
    (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime(),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const weekStartParam = body?.weekStart as string | undefined;

    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    const weekStart = weekStartParam
      ? getWeekStart(new Date(weekStartParam))
      : getWeekStart(new Date());
    const weekEnd = getWeekEnd(weekStart);

    await ensureVideoJobsTable();
    await ensureVideoScriptsTable();
    const scripts = await getVideoScripts({
      platform: 'tiktok',
      weekStart,
    });

    const weekThemeResult = await sql`
      SELECT week_theme, COUNT(*) AS count
      FROM social_posts
      WHERE scheduled_date >= ${weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        AND week_theme IS NOT NULL
      GROUP BY week_theme
      ORDER BY count DESC
      LIMIT 1
    `;
    const weekTheme =
      (weekThemeResult.rows[0]?.week_theme as string | undefined) || null;

    const filteredScripts = weekTheme
      ? scripts.filter((script) => script.themeName === weekTheme)
      : scripts;

    if (filteredScripts.length === 0) {
      return NextResponse.json({
        success: false,
        message: weekTheme
          ? `No daily short scripts found for this week and theme: ${weekTheme}`
          : 'No daily short scripts found for this week',
      });
    }

    const themeName = filteredScripts[0]?.themeName;
    const theme = categoryThemes.find((t) => t.name === themeName);

    const videoPlatforms = [
      'instagram',
      'tiktok',
      'threads',
      'twitter',
      'youtube',
    ];
    const scheduleResult = await sql.query(
      `SELECT topic, scheduled_date, platform, content
       FROM social_posts
       WHERE scheduled_date >= $1
         AND scheduled_date < $2
         AND platform = ANY($3::text[])
         AND post_type = $4
         AND ($5::text IS NULL OR week_theme = $5)`,
      [
        weekStart.toISOString(),
        weekEnd.toISOString(),
        videoPlatforms,
        'educational',
        weekTheme,
      ],
    );

    const postContentByKey = new Map<string, string>();
    for (const row of scheduleResult.rows) {
      const dateKey = new Date(row.scheduled_date).toISOString().split('T')[0];
      const contentKey = `${dateKey}|${row.topic}`;
      if (row.content && !postContentByKey.has(contentKey)) {
        postContentByKey.set(contentKey, row.content);
      }
    }

    const uniqueScripts = dedupeScriptsByDate(filteredScripts);
    const existingVideoByKey = new Map<string, string>();
    const existingVideoResult = await sql.query(
      `SELECT topic, scheduled_date::date AS date_key, video_url
       FROM social_posts
       WHERE scheduled_date >= $1
         AND scheduled_date < $2
         AND video_url IS NOT NULL
         AND ($3::text IS NULL OR week_theme = $3)`,
      [weekStart.toISOString(), weekEnd.toISOString(), weekTheme],
    );
    for (const row of existingVideoResult.rows) {
      if (!row.topic || !row.video_url) continue;
      const dateKey = new Date(row.date_key).toISOString().split('T')[0];
      existingVideoByKey.set(`${dateKey}|${row.topic}`, row.video_url);
    }

    let generated = 0;
    let reused = 0;
    for (const script of uniqueScripts) {
      const dateKey = script.scheduledDate.toISOString().split('T')[0];
      const logPrefix = `[VIDEO][${dateKey}][${script.facetTitle}]`;
      try {
        console.log(`${logPrefix} Preparing assets`);
        const partNumber = Number.isFinite(script.partNumber)
          ? script.partNumber
          : uniqueScripts.findIndex((item) => item === script) + 1;
        const totalParts = uniqueScripts.length || 7;
        const existingVideoKey = `${dateKey}|${script.facetTitle}`;
        const existingVideoUrl = existingVideoByKey.get(existingVideoKey);
        if (existingVideoUrl) {
          console.log(`${logPrefix} Reusing existing video`);
          await sql.query(
            `UPDATE social_posts
             SET video_url = $1
             WHERE platform = ANY($2::text[])
               AND post_type = $3
               AND topic = $4
               AND scheduled_date::date = $5
               AND ($6::text IS NULL OR week_theme = $6)`,
            [
              existingVideoUrl,
              videoPlatforms,
              'educational',
              script.facetTitle,
              dateKey,
              weekTheme,
            ],
          );
          reused += 1;
          continue;
        }

        await sql.query(
          `INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
           ON CONFLICT (script_id)
           DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()`,
          [
            script.id,
            weekStart.toISOString().split('T')[0],
            dateKey,
            script.facetTitle,
          ],
        );

        const youtubeTitleBase = `Weekly Theme: ${theme?.name || themeName || 'Lunary'} • Part ${partNumber} of ${totalParts} — ${script.facetTitle}`;
        const youtubeTitle =
          youtubeTitleBase.length > 90
            ? youtubeTitleBase.substring(0, 87) + '...'
            : youtubeTitleBase;
        const contentKey = `${dateKey}|${script.facetTitle}`;
        const postContent =
          postContentByKey.get(contentKey) ||
          script.writtenPostContent ||
          `This is part ${partNumber} of ${totalParts} in our weekly theme series: ${theme?.name || themeName || 'Lunary'}.`;
        const youtubeDescription = `${postContent}\n\nFrom Lunary's Grimoire — explore deeper rituals, meanings, and correspondences inside the full Grimoire.\n\n#Lunary #Grimoire`;
        void youtubeTitle;
        void youtubeDescription;

        generated += 1;
        console.log(`${logPrefix} Queued`);
      } catch (error) {
        console.error(`${logPrefix} Failed`, error);
        if (error instanceof Error && error.stack) {
          console.error(`${logPrefix} Stack`, error.stack);
        }
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      weekStart: weekStart.toISOString(),
      generated,
      reused,
    });
  } catch (error) {
    console.error('Failed to generate videos from scripts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
