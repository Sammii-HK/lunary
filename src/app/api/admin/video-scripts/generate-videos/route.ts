import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
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
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const weekStartParam = body?.weekStart as string | undefined;

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

    // Include ALL scripts for the week (primary + engagement slots)
    // Don't filter by weekTheme — engagement scripts have different theme names
    if (scripts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No daily short scripts found for this week',
      });
    }

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
         AND post_type IN ('educational', 'video')`,
      [weekStart.toISOString(), weekEnd.toISOString(), videoPlatforms],
    );

    const postContentByKey = new Map<string, string>();
    for (const row of scheduleResult.rows) {
      const dateKey = new Date(row.scheduled_date).toISOString().split('T')[0];
      const contentKey = `${dateKey}|${row.topic}`;
      if (row.content && !postContentByKey.has(contentKey)) {
        postContentByKey.set(contentKey, row.content);
      }
    }

    const uniqueScripts = dedupeScriptsByDate(scripts);
    const existingVideoByKey = new Map<string, string>();
    const existingVideoResult = await sql.query(
      `SELECT topic, scheduled_date::date AS date_key, video_url
       FROM social_posts
       WHERE scheduled_date >= $1
         AND scheduled_date < $2
         AND video_url IS NOT NULL`,
      [weekStart.toISOString(), weekEnd.toISOString()],
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
               AND post_type IN ('educational', 'video')
               AND topic = $3
               AND scheduled_date::date = $4`,
            [existingVideoUrl, videoPlatforms, script.facetTitle, dateKey],
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

        const toHashtag = (value: string): string | null => {
          const words = value
            .replace(/[^a-z0-9]+/gi, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          if (words.length === 0) return null;
          const tag = words
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
          return tag ? `#${tag}` : null;
        };

        const scriptThemeName = script.themeName || 'Lunary';
        const scriptTheme = categoryThemes.find(
          (t) => t.name === scriptThemeName,
        );
        const resolvedThemeName = scriptTheme?.name || scriptThemeName;
        const themeTag = toHashtag(resolvedThemeName);
        const topicTag = toHashtag(script.facetTitle);
        const titleTags = ['#astrology', themeTag, '#universe']
          .filter(Boolean)
          .join(' ');
        const titleBase = `${resolvedThemeName} • Part ${partNumber} of ${totalParts} — ${script.facetTitle}`;
        const titleSuffix = titleTags ? ` ${titleTags}` : '';
        const maxTitleLength = 100;
        let trimmedBase = titleBase;
        if (trimmedBase.length + titleSuffix.length > maxTitleLength) {
          trimmedBase = trimmedBase
            .substring(0, maxTitleLength - titleSuffix.length - 1)
            .replace(/[—•\s]+$/g, '')
            .trim();
        }
        const youtubeTitle = `${trimmedBase}${titleSuffix}`.trim();
        const contentKey = `${dateKey}|${script.facetTitle}`;
        const postContent =
          postContentByKey.get(contentKey) ||
          script.writtenPostContent ||
          `This is part ${partNumber} of ${totalParts} in our weekly theme series: ${resolvedThemeName}.`;
        const descriptionTags = Array.from(
          new Set(['#Lunary', '#astrology', '#universe', themeTag, topicTag]),
        )
          .filter(Boolean)
          .join(' ');
        const youtubeDescription =
          `${postContent}\n\n${descriptionTags}`.trim();
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
