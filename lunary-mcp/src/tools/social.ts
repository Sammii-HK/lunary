import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary, BASE_URL, SPELLCAST_URL, SPELLCAST_KEY } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

const SPELLCAST_API_URL = SPELLCAST_URL;
const SPELLCAST_API_KEY = SPELLCAST_KEY;

// Lunary account set on Spellcast
const LUNARY_ACCOUNT_SET_ID = 'a190e806-5bac-497b-88bd-b1d96ed1f2e8';

// Sammii sparkle account set (personal Lunary account → @sammiisparkle)
const SAMMII_SPARKLE_ACCOUNT_SET_ID = '89cf0e70-7bd1-48c2-bd8a-39ce54357d12';
const SAMMII_SPARKLE_IG_ID = '8ae5e498-b683-4c0e-96fc-e3db38aac65b'; // @sammiisparkle on Instagram
const SAMMII_SPARKLE_THREADS_ID = 'beb8c6ad-adff-4f7b-886b-283044680f50'; // @sammiisparkle on Threads
const SAMMII_EMAIL = 'kellow.sammii@gmail.com';

/** Personal OG image types for Sammii's share posts. Each entry describes how to build the URL. */
const SAMMII_OG_TYPES = {
  // Daily — content changes every day, post frequently
  horoscope: { label: 'Daily Horoscope', needsCosmic: false, cadence: 'daily' },
  'daily-insight': {
    label: 'Daily Insight',
    needsCosmic: false,
    cadence: 'daily',
  },
  'cosmic-state': {
    label: 'Cosmic State',
    needsCosmic: true,
    cadence: 'daily',
  },
  'sky-now': {
    label: 'Sky Now (Planetary Positions)',
    needsCosmic: true,
    cadence: 'daily',
  },
  // Weekly — changes but not daily, post once or twice a week
  'zodiac-season': {
    label: 'Zodiac Season',
    needsCosmic: true,
    cadence: 'weekly',
  },
  numerology: {
    label: 'Numerology Numbers',
    needsCosmic: false,
    cadence: 'weekly',
  },
  streak: { label: 'Streak & Stats', needsCosmic: false, cadence: 'weekly' },
  // Monthly — largely static, post once a month at most
  'big-three': {
    label: 'Big Three (Sun/Moon/Rising)',
    needsCosmic: false,
    cadence: 'monthly',
  },
  'birth-chart': {
    label: 'Birth Chart',
    needsCosmic: false,
    cadence: 'monthly',
  },
  'retrograde-badge': {
    label: 'Retrograde Survival Badge',
    needsCosmic: true,
    cadence: 'monthly',
  },
  referral: { label: 'Referral Card', needsCosmic: false, cadence: 'monthly' },
  'compat-invite': {
    label: 'Compatibility Invite',
    needsCosmic: false,
    cadence: 'monthly',
  },
} as const;

type SammiiOgType = keyof typeof SAMMII_OG_TYPES;

/** OG image types available for posting to Spellcast.
 *  storyPath: if set, this route is used for the Instagram Story (9:16).
 *             Falls back to path if absent.
 */
const OG_TYPES = {
  moon: {
    path: '/api/og/moon',
    storyPath: '/api/og/instagram/story-daily',
    params: ['date'],
    label: 'Moon phase',
  },
  'daily-insight': {
    path: '/api/og/daily-insight',
    storyPath: '/api/og/instagram/story-daily',
    params: ['date', 'format'],
    label: 'Daily cosmic insight',
  },
  cosmic: {
    path: '/api/og/cosmic/{date}',
    storyPath: null,
    params: ['date'],
    label: 'Cosmic energy snapshot',
  },
  horoscope: {
    path: '/api/og/horoscope',
    storyPath: null,
    params: ['sign', 'period', 'date'],
    label: 'Horoscope card',
  },
  crystal: {
    path: '/api/og/crystal',
    storyPath: null,
    params: ['name', 'date'],
    label: 'Crystal of the day',
  },
  tarot: {
    path: '/api/og/tarot',
    storyPath: '/api/og/instagram/story-tarot',
    params: ['card', 'date'],
    label: 'Tarot card',
  },
  'did-you-know': {
    path: '/api/og/instagram/did-you-know',
    storyPath: '/api/og/instagram/did-you-know',
    params: ['fact', 'category', 'source'],
    label: 'Did you know',
  },
  meme: {
    path: '/api/og/instagram/meme',
    storyPath: null,
    params: ['text', 'category'],
    label: 'Astrology meme',
  },
  'sign-ranking': {
    path: '/api/og/instagram/sign-ranking',
    storyPath: null,
    params: ['topic'],
    label: 'Sign ranking',
  },
} as const;

type OgType = keyof typeof OG_TYPES;

async function uploadToSpellcast(
  imageBuffer: Buffer,
  filename: string,
): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'png';
  const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  formData.append(
    'file',
    new Blob([imageBuffer.buffer as ArrayBuffer], { type: mimeType }),
    filename,
  );

  const res = await fetch(`${SPELLCAST_API_URL}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SPELLCAST_API_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Spellcast upload failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    id?: string;
    url?: string;
    name?: string;
    path?: string;
  };
  return { id: data.id ?? data.name ?? '', url: data.url ?? data.path ?? '' };
}

async function autoScheduleOnSpellcast(
  content: string,
  mediaUrls: string[],
  accountSetId: string,
  selectedAccountIds?: string[],
): Promise<{ id: string; scheduledFor: string }> {
  const res = await fetch(`${SPELLCAST_API_URL}/api/posts/auto-schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SPELLCAST_API_KEY}`,
    },
    body: JSON.stringify({
      accountSetId,
      posts: [
        {
          content,
          mediaUrls,
          postType: 'post',
          ...(selectedAccountIds?.length && { selectedAccountIds }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Auto-schedule failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    scheduled?: Array<{ postId: string; scheduledFor: string }>;
    errors?: Array<{ error: string }>;
  };
  if (!data.scheduled?.length)
    throw new Error(
      `No slot available: ${data.errors?.[0]?.error ?? 'unknown'}`,
    );
  return {
    id: data.scheduled[0].postId,
    scheduledFor: data.scheduled[0].scheduledFor,
  };
}

async function generateSpellcastCaption(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${SPELLCAST_API_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SPELLCAST_API_KEY}`,
      },
      body: JSON.stringify({ action: 'write', prompt }),
    });
    if (!res.ok) return '';
    const data = (await res.json()) as {
      content?: string;
      text?: string;
      result?: string;
    };
    return data.content ?? data.text ?? data.result ?? '';
  } catch {
    return '';
  }
}

export function registerSocialTools(server: McpServer) {
  server.tool(
    'generate_social_posts',
    'AI-generate social media posts for specified platforms',
    {
      topic: z.string().optional().describe('Topic or theme for the posts'),
      platforms: z
        .array(z.string())
        .optional()
        .describe(
          'Target platforms (e.g. facebook, instagram, threads, tiktok)',
        ),
      count: z
        .number()
        .optional()
        .describe('Number of posts to generate (default 3)'),
    },
    async ({ topic, platforms, count }) => {
      try {
        const data = await lunary('/social-posts/generate', {
          method: 'POST',
          body: {
            ...(topic && { topic }),
            ...(platforms && { platforms }),
            ...(count && { count }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'send_social_post',
    'Send/publish a social post to connected platforms',
    {
      post_id: z.string().describe('ID of the post to send'),
      platforms: z
        .array(z.string())
        .optional()
        .describe('Override target platforms (uses post defaults if omitted)'),
    },
    async ({ post_id, platforms }) => {
      try {
        const data = await lunary('/social-posts/send', {
          method: 'POST',
          body: {
            postId: post_id,
            ...(platforms && { platforms }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_pending_posts',
    "Posts awaiting approval in Lunary's internal social pipeline",
    {},
    async () => {
      try {
        const data = await lunary('/social-posts/pending');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'approve_post',
    'Approve a pending social post for publishing',
    {
      post_id: z.string().describe('ID of the post to approve'),
    },
    async ({ post_id }) => {
      try {
        const data = await lunary('/social-posts/approve', {
          method: 'POST',
          body: { postId: post_id },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_social_schedule',
    'Upcoming scheduled posts with dates and platforms',
    {},
    async () => {
      try {
        const data = await lunary('/social-posts/update-schedule');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_video_jobs',
    'Video generation job status from Remotion pipeline (requeue-failed, requeue-processing)',
    {
      type: z
        .enum(['requeue-failed', 'requeue-processing'])
        .optional()
        .describe('Filter by job type'),
    },
    async ({ type }) => {
      try {
        const endpoint = type
          ? `/video-jobs/${type}`
          : '/video-jobs/requeue-failed';
        const data = await lunary(endpoint);
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'get_video_performance',
    'TikTok/YouTube video performance metrics',
    {},
    async () => {
      try {
        const data = await lunary('/video-performance');
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'post_og_to_spellcast',
    [
      'Fetch a Lunary OG/shareable image and schedule it via Spellcast.',
      'Instagram gets a Story (story-sized 9:16 image, postType: story). Threads gets a regular feed post.',
      'Fetches images from lunary.app, uploads to Spellcast, AI-generates captions, and auto-schedules on the Lunary account set.',
      `Available og_types: ${Object.entries(OG_TYPES)
        .map(([k, v]) => `${k} (${v.label})`)
        .join(', ')}`,
    ].join(' '),
    {
      og_type: z
        .enum(Object.keys(OG_TYPES) as [OgType, ...OgType[]])
        .describe(
          `OG image type to post. Options: ${Object.keys(OG_TYPES).join(', ')}`,
        ),
      date: z
        .string()
        .optional()
        .describe('Date in YYYY-MM-DD format. Defaults to today.'),
      extra_params: z
        .record(z.string(), z.string())
        .optional()
        .describe(
          'Extra query params for the OG route (e.g. {sign: "scorpio"} for horoscope, {fact: "...", category: "tarot"} for did-you-know)',
        ),
      caption: z.string().optional().describe('Override AI-generated caption.'),
      account_set_id: z
        .string()
        .optional()
        .describe(
          `Spellcast account set to post to. Defaults to Lunary (${LUNARY_ACCOUNT_SET_ID}).`,
        ),
    },
    async ({
      og_type,
      date,
      extra_params,
      caption: captionOverride,
      account_set_id,
    }) => {
      if (!SPELLCAST_API_KEY)
        return errorResult(
          new Error('SPELLCAST_API_KEY not configured in lunary-mcp env'),
        );

      const today = new Date().toISOString().split('T')[0];
      const targetDate = date ?? today;
      const accountSetId = account_set_id ?? LUNARY_ACCOUNT_SET_ID;
      const ogConfig = OG_TYPES[og_type];

      const ogLabel = ogConfig.label;

      // Build story image URL for Instagram (story-sized 9:16 where available)
      const storyOgPath = (ogConfig.storyPath ?? ogConfig.path).replace(
        '{date}',
        targetDate,
      );
      const storyUrl = new URL(storyOgPath, BASE_URL);
      if (
        (ogConfig.params as readonly string[]).includes('date') &&
        !storyOgPath.includes(targetDate)
      ) {
        storyUrl.searchParams.set('date', targetDate);
      }
      if (extra_params) {
        for (const [k, v] of Object.entries(extra_params))
          storyUrl.searchParams.set(k, String(v));
      }

      // Build regular image URL for Threads
      const feedOgPath = ogConfig.path.replace('{date}', targetDate);
      const feedUrl = new URL(feedOgPath, BASE_URL);
      if (
        (ogConfig.params as readonly string[]).includes('date') &&
        !feedOgPath.includes(targetDate)
      ) {
        feedUrl.searchParams.set('date', targetDate);
      }
      if (extra_params) {
        for (const [k, v] of Object.entries(extra_params))
          feedUrl.searchParams.set(k, String(v));
      }

      // Fetch and upload story image (for Instagram)
      const storyRes = await fetch(storyUrl.toString());
      if (!storyRes.ok)
        return errorResult(
          new Error(
            `Failed to fetch story OG image (${storyRes.status}): ${storyUrl.toString()}`,
          ),
        );
      const storyContentType =
        storyRes.headers.get('content-type') ?? 'image/png';
      const storyExt = storyContentType.includes('jpeg') ? 'jpg' : 'png';
      const storyBuffer = Buffer.from(await storyRes.arrayBuffer());
      const storyUploaded = await uploadToSpellcast(
        storyBuffer,
        `lunary-${og_type}-story-${targetDate}.${storyExt}`,
      );

      // Fetch and upload feed image (for Threads) — skip re-fetch if same URL
      let feedUploaded = storyUploaded;
      if (feedUrl.toString() !== storyUrl.toString()) {
        const feedRes = await fetch(feedUrl.toString());
        if (feedRes.ok) {
          const feedContentType =
            feedRes.headers.get('content-type') ?? 'image/png';
          const feedExt = feedContentType.includes('jpeg') ? 'jpg' : 'png';
          const feedBuffer = Buffer.from(await feedRes.arrayBuffer());
          feedUploaded = await uploadToSpellcast(
            feedBuffer,
            `lunary-${og_type}-feed-${targetDate}.${feedExt}`,
          );
        }
      }

      // Get account set social accounts to split IG vs Threads
      const setRes = await fetch(
        `${SPELLCAST_API_URL}/api/account-sets/${accountSetId}`,
        {
          headers: { Authorization: `Bearer ${SPELLCAST_API_KEY}` },
        },
      );
      const setData = setRes.ok
        ? ((await setRes.json()) as {
            socialAccounts?: Array<{ id: string; platform: string }>;
          })
        : { socialAccounts: [] };
      const accounts = setData.socialAccounts ?? [];
      const igIds = accounts
        .filter((a) => a.platform === 'instagram')
        .map((a) => a.id);
      const threadsIds = accounts
        .filter((a) => a.platform === 'threads')
        .map((a) => a.id);

      // Instagram story caption — short, no hashtags (stories don't show them anyway)
      const storyCaption =
        captionOverride ??
        ((await generateSpellcastCaption(
          `Write a very short Instagram Story caption for a Lunary ${ogLabel} graphic (${targetDate}).\n` +
            '1-2 lines max, 80 characters max. Punchy, direct — people tap through stories fast.\n' +
            'Sentence case, UK English, 1 emoji max, no hashtags, no links.',
        )) ||
          ogLabel);

      // Threads caption — punchy short post
      const threadsCaption =
        (await generateSpellcastCaption(
          `Write a 1-3 line Threads caption for a Lunary ${ogLabel} post (${targetDate}). Punchy, specific, no fluff. Under 200 chars. No hashtags. Sentence case, UK English.`,
        )) || storyCaption;

      // Schedule Instagram Story
      let igStory: { id: string; scheduledFor: string } | null = null;
      if (igIds.length) {
        const igRes = await fetch(
          `${SPELLCAST_API_URL}/api/posts/auto-schedule`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${SPELLCAST_API_KEY}`,
            },
            body: JSON.stringify({
              accountSetId,
              posts: [
                {
                  content: storyCaption,
                  mediaUrls: [storyUploaded.url],
                  postType: 'story',
                  selectedAccountIds: igIds,
                },
              ],
            }),
          },
        );
        if (igRes.ok) {
          const igData = (await igRes.json()) as {
            scheduled?: Array<{ postId: string; scheduledFor: string }>;
          };
          if (igData.scheduled?.[0])
            igStory = {
              id: igData.scheduled[0].postId,
              scheduledFor: igData.scheduled[0].scheduledFor,
            };
        }
      }

      // Schedule Threads post at same time as the story
      let threadsPost: { id: string } | null = null;
      if (threadsIds.length) {
        const threadsRes = await fetch(`${SPELLCAST_API_URL}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SPELLCAST_API_KEY}`,
          },
          body: JSON.stringify({
            content: threadsCaption,
            mediaUrls: [feedUploaded.url],
            accountSetId,
            scheduledFor:
              igStory?.scheduledFor ??
              new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            platformSettings: {},
            postType: 'post',
            selectedAccountIds: threadsIds,
          }),
        });
        if (threadsRes.ok)
          threadsPost = (await threadsRes.json()) as { id: string };
      }

      return jsonResult({
        og_type,
        date: targetDate,
        instagram_story: igStory
          ? {
              post_id: igStory.id,
              scheduled_for: igStory.scheduledFor,
              image_url: storyUploaded.url,
              caption: storyCaption,
              story_image_source: storyUrl.toString(),
            }
          : null,
        threads: threadsPost
          ? {
              post_id: threadsPost.id,
              scheduled_for: igStory?.scheduledFor,
              image_url: feedUploaded.url,
              caption: threadsCaption,
            }
          : null,
      });
    },
  );

  // ─── Sammii personal OG images → sammii sparkle ────────────────────────────
  server.tool(
    'post_sammii_og_to_spellcast',
    [
      "Post a personal Lunary OG image from Sammii's own account to Instagram Story (@sammiisparkle) and Threads.",
      "Fetches Sammii's birth chart + today's cosmic data from Lunary, builds a personalised story-sized OG image,",
      'uploads it to Spellcast, and schedules it — bypassing auto-schedule cadence so date-specific images go out on the right day.',
      'Instagram Stories have no caption (image is the content). Threads gets a short punchy caption.',
      'CADENCE RULES — respect these when deciding how often to post each type:',
      `Daily (post every day or every other day): ${Object.entries(
        SAMMII_OG_TYPES,
      )
        .filter(([, v]) => v.cadence === 'daily')
        .map(([k, v]) => `${k} (${v.label})`)
        .join(', ')}.`,
      `Weekly (post once or twice a week): ${Object.entries(SAMMII_OG_TYPES)
        .filter(([, v]) => v.cadence === 'weekly')
        .map(([k, v]) => `${k} (${v.label})`)
        .join(', ')}.`,
      `Monthly (post at most once a month — content is largely static): ${Object.entries(
        SAMMII_OG_TYPES,
      )
        .filter(([, v]) => v.cadence === 'monthly')
        .map(([k, v]) => `${k} (${v.label})`)
        .join(', ')}.`,
      "Set force=true to override the cadence check if you're intentionally reposting.",
    ].join(' '),
    {
      og_type: z
        .enum(Object.keys(SAMMII_OG_TYPES) as [SammiiOgType, ...SammiiOgType[]])
        .describe(
          `OG image type. Options: ${Object.keys(SAMMII_OG_TYPES).join(', ')}`,
        ),
      scheduled_for: z
        .string()
        .optional()
        .describe(
          'ISO 8601 datetime to schedule the post. Defaults to today at 12:00 UTC.',
        ),
      force: z
        .boolean()
        .optional()
        .describe('Skip cadence check and post regardless.'),
      caption: z
        .string()
        .optional()
        .describe('Override the auto-generated Instagram Story caption.'),
      threads_caption_override: z
        .string()
        .optional()
        .describe('Override the auto-generated Threads caption.'),
      // Extra data for types that need user-supplied values
      streak_days: z
        .number()
        .optional()
        .describe('For streak type: current streak in days.'),
      streak_readings: z
        .number()
        .optional()
        .describe('For streak type: total readings.'),
      streak_entries: z
        .number()
        .optional()
        .describe('For streak type: total journal entries.'),
      horoscope_headline: z
        .string()
        .optional()
        .describe('For horoscope type: headline text.'),
      horoscope_overview: z
        .string()
        .optional()
        .describe('For horoscope type: overview paragraph.'),
      retrograde_planet: z
        .string()
        .optional()
        .describe('For retrograde-badge type: planet name (e.g. Mercury).'),
    },
    async ({
      og_type,
      scheduled_for,
      force,
      caption: captionOverride,
      threads_caption_override,
      streak_days,
      streak_readings,
      streak_entries,
      horoscope_headline,
      horoscope_overview,
      retrograde_planet,
    }) => {
      if (!SPELLCAST_API_KEY)
        return errorResult(
          new Error('SPELLCAST_API_KEY not configured in lunary-mcp env'),
        );

      // Cadence guard — check recent posts for this og_type unless force=true
      if (!force) {
        const typeConfig = SAMMII_OG_TYPES[og_type];
        const cadenceDays =
          typeConfig.cadence === 'daily'
            ? 1
            : typeConfig.cadence === 'weekly'
              ? 7
              : 30;
        try {
          const recentRes = await fetch(
            `${SPELLCAST_API_URL}/api/posts?accountSetId=${SAMMII_SPARKLE_ACCOUNT_SET_ID}&limit=50`,
            { headers: { Authorization: `Bearer ${SPELLCAST_API_KEY}` } },
          );
          if (recentRes.ok) {
            const recentData = (await recentRes.json()) as {
              posts?: Array<{ createdAt: string; content?: string }>;
            };
            const cutoff = new Date(
              Date.now() - cadenceDays * 24 * 60 * 60 * 1000,
            );
            // Check for posts created within the cadence window that contain the og_type label
            const ogLabel = SAMMII_OG_TYPES[og_type].label.toLowerCase();
            const recentMatch = (recentData.posts ?? []).find((p) => {
              const created = new Date(p.createdAt);
              return (
                created > cutoff &&
                (p.content ?? '').toLowerCase().includes(ogLabel.split(' ')[0])
              );
            });
            if (recentMatch) {
              return jsonResult({
                skipped: true,
                reason: `Cadence check: a "${og_type}" post was already created within the last ${cadenceDays} day(s). Use force=true to override.`,
                cadence: typeConfig.cadence,
                last_post_at: recentMatch.createdAt,
              });
            }
          }
        } catch {
          /* if the check fails, proceed anyway */
        }
      }

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Default scheduled_for: today at noon London time
      const scheduledFor =
        scheduled_for ??
        (() => {
          const d = new Date();
          // Build noon London as a simple UTC offset approximation (use explicit time string)
          // Just use today at 12:00:00 UTC which is close enough; user can override
          d.setUTCHours(12, 0, 0, 0);
          return d.toISOString();
        })();

      // 1. Fetch Sammii's birth chart from Lunary admin API (falls back to known data)
      // Sun: Capricorn, Moon: Taurus, Rising: Scorpio, Birthday: 1994-01-20
      const SAMMII_FALLBACK = {
        name: 'Sammii',
        birthday: '1994-01-20',
        birthChart: [
          { body: 'Sun', sign: 'Capricorn' },
          { body: 'Moon', sign: 'Taurus' },
          { body: 'Ascendant', sign: 'Scorpio' },
          { body: 'Mercury', sign: 'Aquarius' },
          { body: 'Venus', sign: 'Aquarius' },
          { body: 'Mars', sign: 'Capricorn' },
          { body: 'Jupiter', sign: 'Scorpio' },
          { body: 'Saturn', sign: 'Aquarius' },
          { body: 'Uranus', sign: 'Capricorn' },
          { body: 'Neptune', sign: 'Capricorn' },
          { body: 'Pluto', sign: 'Scorpio' },
        ],
      };
      let birthData = SAMMII_FALLBACK;
      try {
        const fetched = await lunary<{
          name: string;
          birthday: string;
          birthChart: Array<{ body: string; sign: string }> | null;
        }>('/birth-chart', { params: { email: SAMMII_EMAIL } });
        if (fetched.birthChart?.length)
          birthData = {
            name: fetched.name ?? 'Sammii',
            birthday: fetched.birthday ?? '1994-01-20',
            birthChart: fetched.birthChart,
          };
      } catch {
        /* use fallback */
      }

      const firstName = 'Sammii'; // Always use display name, not raw DB value
      const birthChart = birthData.birthChart ?? [];
      const birthday = birthData.birthday ?? '1994-01-20';

      const sun = birthChart.find((p) => p.body === 'Sun')?.sign ?? 'Scorpio';
      const moon = birthChart.find((p) => p.body === 'Moon')?.sign ?? 'Cancer';
      const rising =
        birthChart.find((p) => p.body === 'Ascendant')?.sign ?? 'Virgo';

      // Dominant element/modality from birth chart
      const elementCounts: Record<string, number> = {
        Fire: 0,
        Earth: 0,
        Air: 0,
        Water: 0,
      };
      const modalityCounts: Record<string, number> = {
        Cardinal: 0,
        Fixed: 0,
        Mutable: 0,
      };
      for (const p of birthChart) {
        const s = p.sign.toLowerCase();
        if (['aries', 'leo', 'sagittarius'].includes(s)) elementCounts.Fire++;
        else if (['taurus', 'virgo', 'capricorn'].includes(s))
          elementCounts.Earth++;
        else if (['gemini', 'libra', 'aquarius'].includes(s))
          elementCounts.Air++;
        else if (['cancer', 'scorpio', 'pisces'].includes(s))
          elementCounts.Water++;
        if (['aries', 'cancer', 'libra', 'capricorn'].includes(s))
          modalityCounts.Cardinal++;
        else if (['taurus', 'leo', 'scorpio', 'aquarius'].includes(s))
          modalityCounts.Fixed++;
        else if (['gemini', 'virgo', 'sagittarius', 'pisces'].includes(s))
          modalityCounts.Mutable++;
      }
      const dominantElement =
        Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        'Water';
      const dominantModality =
        Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        'Fixed';

      // Life path number from birthday
      let lifePath = 7,
        soulUrge = 3,
        expression = 5;
      if (birthday) {
        const d = new Date(birthday);
        let sum = d.getDate() + (d.getMonth() + 1) + d.getFullYear();
        while (sum > 9 && sum !== 11 && sum !== 22) {
          sum = String(sum)
            .split('')
            .reduce((a, b) => a + parseInt(b, 10), 0);
        }
        lifePath = sum;
        soulUrge = (firstName.length % 9) + 1;
        expression = ((firstName.length + birthData.name.length) % 9) + 1;
      }

      // 2. Fetch global cosmic data (no auth needed)
      let moonPhaseName = 'Waning Crescent';
      let zodiacSeason = sun;
      let transitHeadline = 'Celestial energies shift';
      let transitDesc = 'A powerful moment for reflection and growth.';
      let planets: Record<string, { sign: string; retrograde: boolean }> = {
        Sun: { sign: sun, retrograde: false },
        Moon: { sign: moon, retrograde: false },
        Mercury: { sign: 'Aquarius', retrograde: false },
        Venus: { sign: 'Pisces', retrograde: false },
        Mars: { sign: 'Cancer', retrograde: false },
        Jupiter: { sign: 'Gemini', retrograde: false },
        Saturn: { sign: 'Pisces', retrograde: false },
        Uranus: { sign: 'Taurus', retrograde: true },
        Neptune: { sign: 'Pisces', retrograde: false },
        Pluto: { sign: 'Aquarius', retrograde: false },
      };

      try {
        const cosmicRes = await fetch(`${BASE_URL}/api/cosmic/global`);
        if (cosmicRes.ok) {
          const cosmic = (await cosmicRes.json()) as {
            moonPhase?: { name?: string };
            planetaryPositions?: Record<
              string,
              { sign?: string; retrograde?: boolean }
            >;
            generalTransits?: Array<{ name?: string; energy?: string }>;
          };
          if (cosmic.moonPhase?.name) moonPhaseName = cosmic.moonPhase.name;
          if (cosmic.planetaryPositions) {
            // Map to the simpler shape the OG routes expect
            for (const [planet, pos] of Object.entries(
              cosmic.planetaryPositions,
            )) {
              if (pos.sign) {
                planets[planet] = {
                  sign: pos.sign,
                  retrograde: pos.retrograde ?? false,
                };
              }
            }
            // Derive zodiac season from Sun's current position
            if (planets.Sun?.sign) zodiacSeason = planets.Sun.sign;
          }
          if (cosmic.generalTransits?.[0]) {
            const t = cosmic.generalTransits[0];
            transitHeadline = t.name ?? transitHeadline;
            transitDesc = t.energy ?? transitDesc;
          }
        }
      } catch {
        /* use defaults */
      }

      // Zodiac season element/modality
      const zodiacEl = ['Aries', 'Leo', 'Sagittarius'].includes(zodiacSeason)
        ? 'Fire'
        : ['Taurus', 'Virgo', 'Capricorn'].includes(zodiacSeason)
          ? 'Earth'
          : ['Gemini', 'Libra', 'Aquarius'].includes(zodiacSeason)
            ? 'Air'
            : 'Water';
      const zodiacMod = ['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(
        zodiacSeason,
      )
        ? 'Cardinal'
        : ['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(zodiacSeason)
          ? 'Fixed'
          : 'Mutable';

      // Check for active retrograde (for retrograde-badge type)
      const activePlanet =
        retrograde_planet ??
        Object.entries(planets).find(
          ([, v]) => v.retrograde && !['Node', 'Chiron'].includes(v.sign),
        )?.[0] ??
        'Mercury';

      // 3. Build the OG image URL (always story format: 1080×1920)
      const p = (v: string) => encodeURIComponent(v);
      let ogPath: string;

      switch (og_type) {
        case 'big-three':
          ogPath = `/api/og/share/big-three?format=story&name=${p(firstName)}&sun=${sun}&moon=${moon}&rising=${rising}`;
          break;
        case 'birth-chart': {
          const insight = `${dominantElement} energy dominates with ${dominantModality} expression. Sun in ${sun}, Moon in ${moon}, ${rising} rising.`;
          ogPath = `/api/og/share/birth-chart?format=story&name=${p(firstName)}&sun=${sun}&moon=${moon}&rising=${rising}&element=${dominantElement}&modality=${dominantModality}&insight=${p(insight)}`;
          break;
        }
        case 'cosmic-state': {
          const cosmicInsight = `Today's cosmic energies align with ${zodiacSeason} season under a ${moonPhaseName} moon.`;
          ogPath = `/api/og/share/cosmic-state?format=story&name=${p(firstName)}&moonPhase=${p(moonPhaseName)}&zodiacSeason=${zodiacSeason}&insight=${p(cosmicInsight)}&transitHeadline=${p(transitHeadline)}&transitDesc=${p(transitDesc)}`;
          break;
        }
        case 'sky-now':
          ogPath = `/api/og/share/sky-now?format=story&name=${p(firstName)}&positions=${p(JSON.stringify(planets))}&date=${dateStr}`;
          break;
        case 'numerology':
          ogPath = `/api/og/share/numerology?format=story&name=${p(firstName)}&birthDate=${birthday}&lifePath=${lifePath}&soulUrge=${soulUrge}&expression=${expression}&lifePathMeaning=${p('The Seeker — wisdom and introspection')}&soulUrgeMeaning=${p('The Creative — self-expression and joy')}&expressionMeaning=${p('The Explorer — freedom and change')}`;
          break;
        case 'zodiac-season':
          ogPath = `/api/og/share/zodiac-season?format=story&name=${p(firstName)}&sign=${zodiacSeason}&element=${zodiacEl}&modality=${zodiacMod}&themes=${p('Intuition,Depth,Transformation')}`;
          break;
        case 'daily-insight':
          ogPath = `/api/og/daily-insight?format=story&name=${p(firstName)}&personalized=true&insight=${p(`Today brings ${zodiacEl.toLowerCase()} energy for ${sun}. Lean into your ${moon} Moon for emotional guidance.`)}`;
          break;
        case 'horoscope': {
          const headline =
            horoscope_headline ??
            `${sun} season energy supports your path, ${firstName}`;
          const overview =
            horoscope_overview ??
            `Today's ${moonPhaseName} moon activates your ${sun} Sun. Trust your ${moon} Moon instincts for emotional clarity.`;
          const numNum = lifePath;
          ogPath = `/api/og/share/horoscope?format=story&name=${p(firstName)}&sunSign=${sun}&headline=${p(headline)}&overview=${p(overview)}&numerologyNumber=${numNum}&date=${dateStr}`;
          break;
        }
        case 'retrograde-badge':
          ogPath = `/api/og/share/retrograde-badge?format=story&name=${p(firstName)}&planet=${activePlanet}&badgeLevel=silver&survivalDays=10&isCompleted=false&sign=${planets[activePlanet]?.sign ?? sun}`;
          break;
        case 'referral':
          ogPath = `/api/og/share/referral?format=story&name=${p(firstName)}&sign=${sun}`;
          break;
        case 'compat-invite':
          ogPath = `/api/og/share/compat-invite?format=story&inviterName=${p(firstName)}&inviterSign=${sun}&sun=${sun}&moon=${moon}&rising=${rising}`;
          break;
        case 'streak':
          ogPath = `/api/og/share/streak?format=story&streakDays=${streak_days ?? 30}&totalReadings=${streak_readings ?? 142}&totalEntries=${streak_entries ?? 67}&totalRituals=30&userName=${p(firstName)}`;
          break;
        default:
          return errorResult(new Error(`Unknown og_type: ${og_type}`));
      }

      const ogUrl = new URL(ogPath, BASE_URL);

      // 4. Fetch and upload image to Spellcast
      const imageRes = await fetch(ogUrl.toString());
      if (!imageRes.ok)
        return errorResult(
          new Error(
            `Failed to fetch OG image (${imageRes.status}): ${ogUrl.toString()}`,
          ),
        );
      const contentType = imageRes.headers.get('content-type') ?? 'image/png';
      const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      const uploaded = await uploadToSpellcast(
        imageBuffer,
        `sammii-${og_type}-${dateStr}.${ext}`,
      );

      // 5. Generate captions
      const ogLabel = SAMMII_OG_TYPES[og_type].label;

      // Instagram Stories don't need text content — the image is the post
      const storyCaption = '';

      const rawThreadsCaption =
        threads_caption_override ??
        ((await generateSpellcastCaption(
          `Write a 1-3 line Threads caption for Sammii sharing her personal ${ogLabel} from Lunary (${dateStr}). ` +
            `Sun in ${sun}, Moon in ${moon}, ${rising} rising. Punchy, personal, under 200 chars. No hashtags. Sentence case, UK English.`,
        )) ||
          ogLabel);
      // Strip surrounding quotes that LLMs sometimes add
      const threadsCaption = rawThreadsCaption
        .trim()
        .replace(/^["'"']|["'"']$/g, '')
        .trim();

      // 6. Schedule Instagram Story (bypass cadence — post at exact time)
      let igStory: { id: string } | null = null;
      let igError: string | null = null;
      const igRes = await fetch(`${SPELLCAST_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SPELLCAST_API_KEY}`,
        },
        body: JSON.stringify({
          content: storyCaption,
          mediaUrls: [uploaded.url],
          accountSetId: SAMMII_SPARKLE_ACCOUNT_SET_ID,
          scheduledFor,
          platformSettings: {},
          postType: 'story',
          selectedAccountIds: [SAMMII_SPARKLE_IG_ID],
        }),
      });
      if (igRes.ok) {
        igStory = (await igRes.json()) as { id: string };
      } else {
        igError = `${igRes.status}: ${await igRes.text().catch(() => '')}`;
      }

      // 7. Schedule Threads feed post at the same time
      let threadsPost: { id: string } | null = null;
      let threadsError: string | null = null;
      const threadsRes = await fetch(`${SPELLCAST_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SPELLCAST_API_KEY}`,
        },
        body: JSON.stringify({
          content: threadsCaption,
          mediaUrls: [uploaded.url],
          accountSetId: SAMMII_SPARKLE_ACCOUNT_SET_ID,
          scheduledFor,
          platformSettings: {},
          postType: 'post',
          selectedAccountIds: [SAMMII_SPARKLE_THREADS_ID],
        }),
      });
      if (threadsRes.ok) {
        threadsPost = (await threadsRes.json()) as { id: string };
      } else {
        threadsError = `${threadsRes.status}: ${await threadsRes.text().catch(() => '')}`;
      }

      return jsonResult({
        og_type,
        date: dateStr,
        image_url: uploaded.url,
        og_source_url: ogUrl.toString(),
        scheduled_for: scheduledFor,
        instagram_story: igStory
          ? {
              post_id: igStory.id,
              platform: 'instagram (@sammiisparkle)',
              post_type: 'story',
            }
          : { error: igError },
        threads: threadsPost
          ? {
              post_id: threadsPost.id,
              caption: threadsCaption,
              platform: 'threads (@sammiisparkle)',
              post_type: 'post',
            }
          : { error: threadsError },
      });
    },
  );
}
