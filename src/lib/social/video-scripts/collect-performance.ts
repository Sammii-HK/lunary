/**
 * Video performance data collection
 *
 * Pulls TikTok post analytics from Ayrshare (the actual posting service),
 * categorises posts by content, and inserts into video_performance table
 * for the self-healing scheduler.
 *
 * Data flow:
 * Ayrshare (GET /api/history) → categorise by caption keywords → video_performance
 * → content-scores.ts reads video_performance → dynamic scheduler adjusts weights
 *
 * Ayrshare is used for TikTok (and Pinterest). Spellcast handles other platforms.
 */

import { sql } from '@vercel/postgres';
import { getContentTypeRankings } from '@/utils/content-performance';
import { bulkInsertPerformance, ensureVideoPerformanceTable } from './database';
import { categorisePost } from './categorise';
import { getPlatformPerformance } from './content-scores';

import { ayrshareFetch } from '../ayrshare-fetch';

const AYRSHARE_API_URL = 'https://api.ayrshare.com/api';

function getAyrshareHeaders(): Record<string, string> {
  const apiKey = process.env.AYRSHARE_API_KEY;
  if (!apiKey) throw new Error('AYRSHARE_API_KEY not set');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  const profileKey = process.env.AYRSHARE_PROFILE_KEY;
  if (profileKey) headers['Profile-Key'] = profileKey;
  return headers;
}

interface AyrshareHistoryPost {
  id?: string;
  refId?: string;
  post?: string | Record<string, string>;
  status?: string;
  created?: string;
  publishDate?: string;
  scheduleDate?: string;
  platforms?: string[];
  postIds?: Array<{ id?: string; platform?: string; status?: string }>;
  analytics?: Record<
    string,
    {
      views?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
      plays?: number;
    }
  >;
  // Flat analytics (some Ayrshare responses)
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

/**
 * Extract caption text from Ayrshare post field.
 * Post can be a plain string or an object like { default: "...", facebook: "..." }
 */
function extractCaption(
  post: string | Record<string, string> | undefined,
): string {
  if (!post) return '';
  if (typeof post === 'string') return post;
  // Object form: prefer tiktok-specific, then default, then first value
  return post.tiktok ?? post.default ?? Object.values(post)[0] ?? '';
}

/**
 * Fetch post history from Ayrshare for a given platform.
 * Ayrshare API: GET /api/history?platform=tiktok
 */
async function fetchAyrshareHistory(
  platform: string,
  limit: number = 50,
): Promise<AyrshareHistoryPost[]> {
  const headers = getAyrshareHeaders();

  const response = await ayrshareFetch(
    `${AYRSHARE_API_URL}/history?platform=${platform}&limit=${limit}`,
    { headers, signal: AbortSignal.timeout(30000) },
  );

  if (!response.ok) {
    console.warn(
      `[Collect Performance] Ayrshare history ${platform} failed: ${response.status}`,
    );
    return [];
  }

  const data = await response.json();
  // Ayrshare returns array or { posts: [] }
  return Array.isArray(data) ? data : (data.posts ?? data.history ?? []);
}

/**
 * Fetch analytics for a specific post from Ayrshare.
 * Ayrshare API: POST /api/analytics/post with { id, platforms }
 *
 * Response structure:
 * { tiktok: { analytics: { videoViews, likeCount, commentsCount, shareCount, favorites, ... } } }
 */
async function fetchPostAnalytics(
  postId: string,
  platform: string,
): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
} | null> {
  const headers = getAyrshareHeaders();

  try {
    const response = await ayrshareFetch(`${AYRSHARE_API_URL}/analytics/post`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: postId, platforms: [platform] }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Ayrshare nests analytics under platform.analytics
    const analytics = data[platform]?.analytics ?? data[platform] ?? data;

    return {
      views: analytics.videoViews ?? analytics.views ?? analytics.plays ?? 0,
      likes: analytics.likeCount ?? analytics.likes ?? 0,
      comments: analytics.commentsCount ?? analytics.comments ?? 0,
      shares: analytics.shareCount ?? analytics.shares ?? 0,
      saves: analytics.favorites ?? analytics.saves ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Infer which engagement slot a post came from based on its posting hour.
 * Falls back to null if the hour doesn't match any known slot window.
 */
function inferSlotFromHour(hour: number): string | null {
  if (hour >= 10 && hour <= 12) return 'engagementC';
  if (hour >= 13 && hour <= 15) return 'primary';
  if (hour >= 16 && hour <= 18) return 'engagementA';
  if (hour >= 19 && hour <= 22) return 'engagementB';
  return null;
}

/**
 * Try to match an Ayrshare post to a social_posts record to get slot metadata.
 * Looks up by ayrshare post ID first, then by posting date + topic match.
 */
async function lookupSlotFromDB(
  postId: string | undefined,
  postedAt: string,
): Promise<string | null> {
  try {
    // Try matching social_posts → video_jobs → video_scripts metadata
    if (postId) {
      const result = await sql`
        SELECT vs.metadata
        FROM social_posts sp
        JOIN video_jobs vj ON vj.script_id = (
          SELECT id FROM video_scripts
          WHERE facet_title = sp.topic
            AND scheduled_date::date = sp.scheduled_date::date
          LIMIT 1
        )
        JOIN video_scripts vs ON vs.id = vj.script_id
        WHERE sp.content LIKE '%' || LEFT(${postId}, 20) || '%'
          OR sp.scheduled_date::date = ${postedAt}::date
        LIMIT 1
      `;
      if (result.rows.length > 0) {
        const metadata = result.rows[0].metadata;
        if (metadata?.slot) return metadata.slot;
      }
    }
  } catch {
    // DB lookup failed, fall back to hour-based inference
  }
  return null;
}

/**
 * Extract analytics from an Ayrshare post.
 * Only fetches analytics for posts with status "success" (actually published).
 * Uses POST /api/analytics/post to get per-post metrics.
 */
async function extractAnalytics(
  post: AyrshareHistoryPost,
  platform: string = 'tiktok',
): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
} | null> {
  // Only fetch analytics for successfully published posts
  if (post.status !== 'success') return null;

  const postId = post.id;
  if (!postId) return null;

  // Fetch via POST /api/analytics/post
  const fetched = await fetchPostAnalytics(postId, platform);
  if (fetched && (fetched.views > 0 || fetched.likes > 0)) {
    return fetched;
  }

  // Check flat analytics on the post object as fallback
  const views = post.views ?? 0;
  const likes = post.likes ?? 0;
  if (views > 0 || likes > 0) {
    return {
      views,
      likes,
      comments: post.comments ?? 0,
      shares: post.shares ?? 0,
      saves: 0,
    };
  }

  return null;
}

/**
 * Collect video performance data from Ayrshare.
 *
 * 1. Fetches TikTok post history from Ayrshare
 * 2. For each post, fetches analytics (or uses embedded analytics)
 * 3. Categorises content type by keyword matching on caption
 * 4. Infers slot from DB metadata or posting hour
 * 5. Upserts into video_performance table (deduped by ayrshare_id)
 * 6. Returns updated content type rankings
 */
export async function collectVideoPerformance(): Promise<{
  collected: number;
  skipped: number;
  errors: number;
  rankings: Awaited<ReturnType<typeof getContentTypeRankings>>;
}> {
  if (!process.env.AYRSHARE_API_KEY) {
    console.log('[Collect Performance] AYRSHARE_API_KEY not set, skipping');
    const rankings = await getContentTypeRankings(30, 2);
    return { collected: 0, skipped: 0, errors: 0, rankings };
  }

  // Ensure table + columns exist (including new slot + ayrshare_id columns)
  await ensureVideoPerformanceTable();

  const PLATFORMS = ['tiktok', 'pinterest', 'instagram'] as const;

  const records: Array<{
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    contentCategory: string;
    postedAt: string;
    slot?: string;
    ayrshareId?: string;
    scheduledHour?: number;
    dayOfWeek?: number;
  }> = [];

  let skipped = 0;
  let errors = 0;
  let totalFetched = 0;

  for (const platform of PLATFORMS) {
    const posts = await fetchAyrshareHistory(platform, 100);
    console.log(
      `[Collect Performance] Fetched ${posts.length} ${platform} posts from Ayrshare`,
    );
    totalFetched += posts.length;

    for (const post of posts) {
      try {
        const caption = extractCaption(post.post);
        if (!caption.trim()) {
          skipped++;
          continue;
        }

        const postId = post.id;
        const postedAt =
          post.scheduleDate ??
          post.publishDate ??
          post.created ??
          new Date().toISOString();
        const scheduledDate = new Date(postedAt);
        const scheduledHour = scheduledDate.getUTCHours();

        const analytics = await extractAnalytics(post, platform);
        if (!analytics) {
          skipped++;
          continue;
        }

        // Infer slot: try DB lookup first, fall back to hour-based inference
        const dbSlot = await lookupSlotFromDB(postId, postedAt);
        const slot = dbSlot ?? inferSlotFromHour(scheduledHour) ?? undefined;

        records.push({
          platform,
          ...analytics,
          contentCategory: categorisePost(caption),
          postedAt,
          slot,
          ayrshareId: postId ?? undefined,
          scheduledHour,
          dayOfWeek: scheduledDate.getUTCDay(),
        });
      } catch (error) {
        console.error(
          `[Collect Performance] Error processing ${platform} post:`,
          error,
        );
        errors++;
      }
    }
  }

  // Bulk upsert (dedup by ayrshare_id — re-runs update metrics instead of duplicating)
  let collected = 0;
  if (records.length > 0) {
    collected = await bulkInsertPerformance(records);
  }

  // Get updated rankings
  const rankings = await getContentTypeRankings(30, 2);

  console.log(
    `[Collect Performance] Collected ${collected}, skipped ${skipped}, errors ${errors} from ${totalFetched} posts across ${PLATFORMS.join(', ')}`,
  );

  return { collected, skipped, errors, rankings };
}

/**
 * Backfill ALL historical TikTok performance data from Ayrshare.
 * Fetches full history with pagination and upserts everything.
 */
export async function backfillAllPerformance(): Promise<{
  total: number;
  inserted: number;
  skipped: number;
  errors: number;
}> {
  if (!process.env.AYRSHARE_API_KEY) {
    throw new Error('AYRSHARE_API_KEY not set');
  }

  await ensureVideoPerformanceTable();

  // Fetch all TikTok history (Ayrshare max per request varies, paginate)
  let allPosts: AyrshareHistoryPost[] = [];
  let page = 0;
  const pageSize = 100;

  while (true) {
    const headers = getAyrshareHeaders();
    const response = await ayrshareFetch(
      `${AYRSHARE_API_URL}/history?platform=tiktok&limit=${pageSize}&offset=${page * pageSize}&status=success`,
      { headers, signal: AbortSignal.timeout(30000) },
    );

    if (!response.ok) break;

    const data = await response.json();
    const posts: AyrshareHistoryPost[] = Array.isArray(data)
      ? data
      : (data.posts ?? data.history ?? []);

    if (posts.length === 0) break;

    allPosts = allPosts.concat(posts);
    page++;

    // Safety: stop at 1000 posts to avoid runaway pagination
    if (allPosts.length >= 1000 || posts.length < pageSize) break;
  }

  console.log(
    `[Backfill] Fetched ${allPosts.length} total TikTok posts from Ayrshare`,
  );

  const records: Array<{
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    contentCategory: string;
    postedAt: string;
    slot?: string;
    ayrshareId?: string;
    scheduledHour?: number;
    dayOfWeek?: number;
  }> = [];

  let skipped = 0;
  let errors = 0;

  for (const post of allPosts) {
    try {
      const caption = extractCaption(post.post);
      if (!caption.trim()) {
        skipped++;
        continue;
      }

      const postId = post.id;
      const postedAt =
        post.scheduleDate ??
        post.publishDate ??
        post.created ??
        new Date().toISOString();
      const scheduledDate = new Date(postedAt);
      const scheduledHour = scheduledDate.getUTCHours();

      const analytics = await extractAnalytics(post);
      if (!analytics) {
        skipped++;
        continue;
      }

      // For historical data, infer slot from scheduled hour
      const slot = inferSlotFromHour(scheduledHour) ?? undefined;

      records.push({
        platform: 'tiktok',
        ...analytics,
        contentCategory: categorisePost(caption),
        postedAt,
        slot,
        ayrshareId: postId ?? undefined,
        scheduledHour,
        dayOfWeek: scheduledDate.getUTCDay(),
      });

      // Small delay between analytics fetches to avoid Ayrshare rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`[Backfill] Error processing post:`, error);
      errors++;
    }
  }

  let inserted = 0;
  if (records.length > 0) {
    inserted = await bulkInsertPerformance(records);
  }

  console.log(
    `[Backfill] Total: ${allPosts.length}, Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`,
  );

  return { total: allPosts.length, inserted, skipped, errors };
}

/**
 * Format performance rankings as markdown for content-performance.md.
 * Includes content type rankings, platform breakdown, and time analysis.
 */
export async function formatPerformanceMarkdown(
  rankings: Awaited<ReturnType<typeof getContentTypeRankings>>,
): Promise<string> {
  const now = new Date().toISOString().split('T')[0];

  const rows = rankings
    .map((r, i) => {
      const trend = r.trend > 0.1 ? 'UP' : r.trend < -0.1 ? 'DOWN' : 'STABLE';
      return `| ${i + 1} | ${r.contentType} | ${Math.round(r.avgViews)} | ${Math.round(r.avgLikes)} | ${Math.round(r.avgComments)} | ${Math.round(r.compositeScore)} | ${r.sampleCount} | ${trend} |`;
    })
    .join('\n');

  // Platform breakdown
  let platformSection = '';
  try {
    const platformData = await getPlatformPerformance();
    if (platformData.size > 0) {
      const platformRows = [...platformData.entries()]
        .sort((a, b) => b[1].avgViews - a[1].avgViews)
        .map(
          ([platform, data]) =>
            `| ${platform} | ${Math.round(data.avgViews)} | ${Math.round(data.avgEngagement)} | ${data.count} |`,
        )
        .join('\n');
      platformSection = `
## Platform Breakdown

| Platform | Avg Views | Avg Engagement | Posts |
|----------|-----------|---------------|-------|
${platformRows}
`;
    }
  } catch {
    // Platform data unavailable
  }

  // Day of week breakdown
  let daySection = '';
  try {
    const dayResult = await sql`
      SELECT
        day_of_week,
        AVG(views)::int as avg_views,
        AVG(comments * 3.0 + shares * 2.0 + likes * 1.0 + views * 0.3)::int as avg_engagement,
        COUNT(*)::int as count
      FROM video_performance
      WHERE recorded_at >= NOW() - INTERVAL '30 days'
        AND day_of_week IS NOT NULL
      GROUP BY day_of_week
      ORDER BY day_of_week
    `;
    if (dayResult.rows.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayRows = dayResult.rows
        .map(
          (r) =>
            `| ${dayNames[r.day_of_week] ?? r.day_of_week} | ${r.avg_views} | ${r.avg_engagement} | ${r.count} |`,
        )
        .join('\n');
      daySection = `
## Day of Week

| Day | Avg Views | Avg Engagement | Posts |
|-----|-----------|---------------|-------|
${dayRows}
`;
    }
  } catch {
    // Day data unavailable
  }

  // Optimal hours per slot
  let slotSection = '';
  try {
    const { getOptimalHourBySlot } = await import('./content-scores');
    const slots = ['engagementC', 'primary', 'engagementA', 'engagementB'];
    const slotRows: string[] = [];
    for (const slot of slots) {
      const hour = await getOptimalHourBySlot(slot);
      slotRows.push(`| ${slot} | ${hour}:00 UTC |`);
    }
    slotSection = `
## Optimal Posting Times

| Slot | Best Hour |
|------|-----------|
${slotRows.join('\n')}
`;
  } catch {
    // Slot data unavailable
  }

  return `# Content Performance Rankings

Last updated: ${now}

| Rank | Content Type | Avg Views | Avg Likes | Avg Comments | Score | Samples | Trend |
|------|-------------|-----------|-----------|-------------|-------|---------|-------|
${rows}
${platformSection}${daySection}${slotSection}
## How this data feeds the scheduler
- Self-healing scheduler reads video_performance to weight content type selection
- Score = views*0.3 + likes*1.0 + comments*3.0 + shares*2.0 + saves*1.5
- Categories with <100 avg views and 10+ samples get auto-suppressed
- Categories trending up get a 15% scheduling boost
- Data source: Ayrshare analytics across TikTok, Instagram, Pinterest (collected daily at 06:00 UTC)
`;
}
