import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { postVideoToYouTubeViaAyrshare } from '@/lib/social/ayrshare-youtube';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const SLOTS_UTC = [14, 15, 16, 17, 18, 19, 20, 21];
const VIDEOS_PER_DAY = 6;
const RATE_LIMIT_MS = 1000;
const DEFAULT_TAGS = ['astrology', 'zodiac', 'spirituality', 'lunary'];

interface FailedUpload {
  id: number;
  topic: string;
  video_url: string;
  created_at: string;
  description?: string;
  hashtags?: string[];
}

function normaliseTopic(topic: string): string {
  return topic.toLowerCase().trim();
}

function generateTitle(topic: string): string {
  const t = topic.trim();
  const lower = t.toLowerCase();

  // Angel numbers (e.g. "444", "11:11")
  const numberMatch = lower.match(/^(\d{3,4})$/);
  if (numberMatch) {
    return `Angel Number ${numberMatch[1]} | What It Means When You See It`;
  }
  const colonMatch = lower.match(/^(\d{2}):(\d{2})$/);
  if (colonMatch) {
    return `${colonMatch[1]}:${colonMatch[2]} Angel Number | Spiritual Meaning Explained`;
  }

  // Planets
  const planets = [
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'chiron',
    'sun',
    'moon',
  ];
  if (planets.includes(lower)) {
    const capitalised = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    return `${capitalised} in Astrology | What This Planet Means for You`;
  }

  // Zodiac signs
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  if (signs.includes(lower)) {
    const capitalised = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    return `${capitalised} Zodiac Sign | Personality, Traits & Compatibility`;
  }

  // Already conversational / hot takes / callouts — keep as-is
  if (t.length > 30) {
    return t;
  }

  return `${t} | Astrology Explained`;
}

function generateDescription(topic: string): string {
  const lower = topic.toLowerCase().trim();

  const numberMatch = lower.match(/^(\d{3,4})$/);
  if (numberMatch) {
    return `What does ${numberMatch[1]} mean? Discover the spiritual meaning of angel number ${numberMatch[1]}. From Lunary's Grimoire.\n\n#numerology #angelnumbers #${numberMatch[1]} #spirituality`;
  }

  const colonMatch = lower.match(/^(\d{2}):(\d{2})$/);
  if (colonMatch) {
    return `Seeing ${colonMatch[1]}:${colonMatch[2]} everywhere? Learn its spiritual meaning. From Lunary's Grimoire.\n\n#numerology #angelnumbers #spirituality`;
  }

  const planets = [
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'sun',
    'moon',
  ];
  if (planets.includes(lower)) {
    const capitalised =
      topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
    return `${capitalised} explained. Learn what ${capitalised} means in your birth chart and how it influences your life. From Lunary's Grimoire.\n\n#astrology #${lower} #birthchart #zodiac`;
  }

  if (lower === 'chiron') {
    return `Chiron in astrology. Discover your healing journey through this placement and what it means for your chart. From Lunary's Grimoire.\n\n#astrology #chiron #birthchart #healing`;
  }

  return `${topic}. Explore this topic in astrology with Lunary's Grimoire.\n\n#astrology #zodiac #spirituality #lunary`;
}

function extractHashtags(content: string): string[] {
  const matches = content.match(/#\w+/g);
  if (!matches) return [];
  return matches.map((tag) => tag.replace('#', '').toLowerCase());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GET: Dry-run preview of what would be uploaded
 * POST: Execute the bulk upload
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const uploads = await getDeduplicatedUploads();

  const schedule = buildSchedule(uploads);

  return NextResponse.json({
    totalFailed: uploads.length,
    scheduled: schedule.map((s) => ({
      id: s.upload.id,
      topic: s.upload.topic,
      title: s.title,
      publishAt: s.publishAt,
      hasDescription: !!s.upload.description,
      videoUrl: s.upload.video_url,
    })),
    daysNeeded: Math.ceil(uploads.length / VIDEOS_PER_DAY),
    slotsPerDay: VIDEOS_PER_DAY,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const uploads = await getDeduplicatedUploads();

  if (uploads.length === 0) {
    return NextResponse.json({
      message: 'No failed uploads to process',
      uploaded: 0,
      failed: 0,
    });
  }

  const schedule = buildSchedule(uploads);
  const playlistId = process.env.YOUTUBE_SHORTS_PLAYLIST_ID;

  const results: Array<{
    id: number;
    topic: string;
    success: boolean;
    videoId?: string;
    publishAt: string;
    error?: string;
  }> = [];

  for (const item of schedule) {
    const description =
      item.upload.description || generateDescription(item.upload.topic);
    const tags = [
      ...DEFAULT_TAGS,
      ...(item.upload.hashtags || []),
      ...extractHashtags(description),
    ];
    const uniqueTags = [...new Set(tags)];

    try {
      const result = await postVideoToYouTubeViaAyrshare({
        content: description,
        videoUrl: item.upload.video_url,
        title: item.title,
        isShort: true,
        visibility: 'private',
        playlistId,
        tags: uniqueTags.slice(0, 30),
        madeForKids: false,
        categoryId: '22',
        publishAt: item.publishAt,
      });

      if (result.success) {
        await sql`
          UPDATE youtube_uploads
          SET status = 'uploaded',
              youtube_video_id = ${result.videoId || null},
              error = null
          WHERE id = ${item.upload.id}
        `;

        results.push({
          id: item.upload.id,
          topic: item.upload.topic,
          success: true,
          videoId: result.videoId,
          publishAt: item.publishAt,
        });

        console.log(
          `Scheduled YouTube Short: "${item.title}" for ${item.publishAt}`,
        );
      } else {
        await sql`
          UPDATE youtube_uploads
          SET error = ${result.error || 'Unknown Ayrshare error'}
          WHERE id = ${item.upload.id}
        `;

        results.push({
          id: item.upload.id,
          topic: item.upload.topic,
          success: false,
          publishAt: item.publishAt,
          error: result.error,
        });

        console.error(`Failed to schedule "${item.title}": ${result.error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      await sql`
        UPDATE youtube_uploads
        SET error = ${errorMsg}
        WHERE id = ${item.upload.id}
      `;

      results.push({
        id: item.upload.id,
        topic: item.upload.topic,
        success: false,
        publishAt: item.publishAt,
        error: errorMsg,
      });
    }

    await sleep(RATE_LIMIT_MS);
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    message: `Bulk upload complete: ${succeeded} scheduled, ${failed} failed`,
    uploaded: succeeded,
    failed,
    results,
  });
}

async function getDeduplicatedUploads(): Promise<FailedUpload[]> {
  // Get all failed uploads, joined with social_posts for descriptions
  const result = await sql`
    WITH ranked AS (
      SELECT
        yu.id,
        yu.topic,
        yu.video_url,
        yu.created_at,
        sp.content AS sp_content,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(TRIM(yu.topic))
          ORDER BY yu.created_at DESC
        ) AS rn
      FROM youtube_uploads yu
      LEFT JOIN social_posts sp
        ON sp.topic = yu.topic
        AND sp.platform = 'youtube'
      WHERE yu.status = 'failed'
    )
    SELECT id, topic, video_url, created_at, sp_content
    FROM ranked
    WHERE rn = 1
    ORDER BY created_at ASC
  `;

  return result.rows.map((row) => {
    const hashtags = row.sp_content ? extractHashtags(row.sp_content) : [];
    return {
      id: row.id,
      topic: row.topic,
      video_url: row.video_url,
      created_at: row.created_at,
      description: row.sp_content || undefined,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
    };
  });
}

interface ScheduleItem {
  upload: FailedUpload;
  title: string;
  publishAt: string;
}

function buildSchedule(uploads: FailedUpload[]): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  let dayOffset = 0;
  let slotIndex = 0;

  for (const upload of uploads) {
    const publishDate = new Date(tomorrow);
    publishDate.setUTCDate(publishDate.getUTCDate() + dayOffset);
    publishDate.setUTCHours(SLOTS_UTC[slotIndex], 0, 0, 0);

    schedule.push({
      upload,
      title: generateTitle(upload.topic),
      publishAt: publishDate.toISOString(),
    });

    slotIndex++;
    if (slotIndex >= VIDEOS_PER_DAY) {
      slotIndex = 0;
      dayOffset++;
    }
  }

  return schedule;
}
