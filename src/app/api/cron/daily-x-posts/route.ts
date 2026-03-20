/**
 * Daily X Posts for @sammiihk
 *
 * Generates 3-4 text-only posts per day for the sammii account set on X.
 * All text-only (30% more engagement on X).
 * Links always in first_comment, never body.
 *
 * Post types:
 * 1. Tech/engineering insight (from recent work or grimoire)
 * 2. Hot take / shitpost (highest viral potential)
 * 3. BIP observation (with real numbers from live-metrics.md)
 * 4. Engagement question (drives replies — #1 X signal)
 *
 * Schedule: 08:00 UTC daily
 * Posts scheduled at: 08:00, 12:00, 17:00, 20:00 UTC (from platform-playbooks.md)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SAMMII_ACCOUNT_SET_ID = '430eab81-ea60-4d11-9733-1bb126c5264c';
const SAMMII_X_ACCOUNT_ID = '90187c4d-b32e-46c3-bcb9-c5e7e45bc5d2';

const POST_SLOTS_UTC = [8, 12, 17, 20];

// Seeded RNG for deterministic daily content
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return function () {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Hot Take Pool ──
// These are the viral format. Opinion, not information. No hedging.
const HOT_TAKES = [
  'Most people overthink their tech stack and underthink their content strategy. Pick boring tools, write interesting things.',
  "The best marketing channel for a solo dev is the one you actually enjoy using. Everything else is a chore you'll abandon in 3 weeks.",
  "Everyone talks about product-market fit. Nobody talks about founder-product fit. If you hate what you're building, the market won't save you.",
  "Your landing page copy matters 10x more than your landing page design. Nobody's buying because of your gradient.",
  "Ship it ugly. Ship it broken. Ship it embarrassing. The only version that doesn't ship is the perfect one.",
  'People say "just charge more." The real hack is charging less and making it impossible to churn.',
  'SEO is the most underrated distribution channel for indie devs. Social media is rented land. Google traffic is free real estate.',
  'Half of Build in Public is people performing productivity. The other half is people actually building. You can tell the difference.',
  "Your users don't care about your architecture. They care if the button works.",
  "The hardest part of being a solo founder isn't building. It's deciding what NOT to build.",
  "Stop asking for feedback on your idea. Build it, launch it, let real users tell you what's wrong.",
  "Automated content pipelines aren't lazy. Manual posting at 3am is.",
  'Every developer thinks they need a unique idea. Most successful products are better versions of something that already exists.',
  '"I\'ll add that feature when users ask for it" is how you never add anything. Watch what they DO, not what they SAY.',
  'The gap between 0 and 1 user is harder than 1 to 1000. Most founders never cross the first gap.',
];

// ── Tech Insight Pool ──
const TECH_INSIGHTS = [
  'Seeded randomness is underrated. Same input = same output = no database needed for daily content. astronomy-engine does this beautifully.',
  "The trick to scaling content as a solo dev: deterministic generation. If you can compute today's content from today's date, you don't need a CMS.",
  'Next.js cron routes + Vercel are a full orchestration layer if you squint hard enough. 40+ crons running my entire content pipeline.',
  'Prisma migrations are non-negotiable for a production app. Raw SQL in a migrations folder is a ticking time bomb.',
  "The real performance bottleneck in most web apps isn't the framework. It's the 47 analytics scripts you're loading on every page.",
  "Better Auth > NextAuth if you want to understand what's actually happening with your sessions. Fewer abstractions, fewer surprises.",
  "If your CI takes longer than your attention span, you'll stop running it. Keep builds under 3 minutes or accept that nobody's testing.",
  'Self-hosting saves money until something breaks at 2am. Then it costs your sanity. Know which services are worth paying for.',
  'TypeScript strictNullChecks caught more bugs in my codebase than all my unit tests combined.',
  "Remotion for programmatic video generation is criminally underrated. React components that render to MP4. Chef's kiss.",
  'The best monitoring tool is Discord webhooks. When your cron fails, you want a notification where you actually look.',
  'MCP servers are the glue between AI and everything else. One protocol to connect to any tool.',
];

// ── Engagement Question Pool ──
const ENGAGEMENT_QUESTIONS = [
  "What's the one tool you couldn't build without? Not a framework, an actual tool you use every day.",
  'Hot take check: do you actually LIKE the framework you use, or are you just used to it?',
  "Solo founders: what's your most embarrassing production incident? I'll go first.",
  "What's the most overengineered thing in your codebase that you secretly love?",
  'What feature did you build that exactly zero users have ever used?',
  'How many unfinished side projects do you have? Exact number. No judgement.',
  "What's the dumbest bug that took you the longest to find?",
  'Be honest: when was the last time you actually read your own documentation?',
  "What's a popular dev tool that you've tried multiple times and just can't get into?",
  "If you could mass-delete one thing from every codebase you've ever worked on, what would it be?",
];

// ── BIP Templates ──
// These MUST be filled with real numbers at generation time
const BIP_TEMPLATES = [
  (metrics: LiveMetrics) =>
    `Lunary SEO update: ${metrics.impressions7dAvg.toLocaleString()} impressions/day avg. Started at 100/day in Nov 2025. No paid ads, just 2000+ grimoire articles doing their thing.`,
  (metrics: LiveMetrics) =>
    `${metrics.mau} MAU on Lunary. Still small. But 3 months ago it was half that. Compounding is slow until it isn't.`,
  (metrics: LiveMetrics) =>
    `MRR: ${metrics.mrrFormatted}. Not life-changing money yet, but it's real money from real people who find the product useful. That matters.`,
  (metrics: LiveMetrics) =>
    `${metrics.signupsThisWeek} new signups this week on Lunary. Every one of them found us through Google. SEO is the gift that keeps giving.`,
  (metrics: LiveMetrics) =>
    `Building in public, week update: ${metrics.mau} monthly actives, ${metrics.mrrFormatted} MRR, ${metrics.impressions7dAvg.toLocaleString()} daily impressions. The numbers are boring until you zoom out.`,
];

interface LiveMetrics {
  mau: number;
  mrr: number;
  mrrFormatted: string;
  signupsThisWeek: number;
  impressionsToday: number;
  impressions7dAvg: number;
}

async function fetchLiveMetrics(): Promise<LiveMetrics | null> {
  try {
    const secret = process.env.CRON_SECRET;
    const res = await fetch('https://lunary.app/api/internal/weekly-snapshot', {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function scheduleXPost(params: {
  content: string;
  scheduledFor: string;
  firstComment?: string;
}): Promise<{ id: string; success: boolean }> {
  const SPELLCAST_URL = process.env.SPELLCAST_API_URL;
  const spellcastKey = process.env.SPELLCAST_API_KEY;

  if (!SPELLCAST_URL || !spellcastKey) {
    throw new Error('Spellcast env vars not configured');
  }

  // Create the post
  const createRes = await fetch(`${SPELLCAST_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${spellcastKey}`,
    },
    body: JSON.stringify({
      content: params.content,
      accountSetId: SAMMII_ACCOUNT_SET_ID,
      scheduledFor: params.scheduledFor,
      postType: 'post',
      firstComment: params.firstComment ?? null,
      selectedAccountIds: [SAMMII_X_ACCOUNT_ID],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    throw new Error(`Create post failed (${createRes.status}): ${errText}`);
  }

  const post = (await createRes.json()) as { id: string };

  // Schedule the post
  const scheduleRes = await fetch(
    `${SPELLCAST_URL}/api/posts/${post.id}/schedule`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${spellcastKey}`,
      },
    },
  );

  if (!scheduleRes.ok) {
    return { id: post.id, success: false };
  }

  return { id: post.id, success: true };
}

export async function GET(request: NextRequest) {
  // Auth
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authHeader = request.headers.get('authorization');
  if (
    !isVercelCron &&
    (!process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';
  const overrideDate = url.searchParams.get('date');

  // Target date is 7 days ahead (generate a week in advance)
  const now = new Date();
  const dateStr = (() => {
    if (overrideDate && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate)) {
      return overrideDate;
    }
    const target = new Date(now);
    target.setDate(target.getDate() + 7);
    return target.toISOString().split('T')[0];
  })();

  // Skip weekends (X engagement drops significantly)
  const targetDay = new Date(dateStr).getUTCDay();
  if (targetDay === 0 || targetDay === 6) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: `${dateStr} is a weekend — skipping X posts`,
    });
  }

  // Dedup check
  const eventKey = `daily-x-posts-${dateStr}`;
  if (!force) {
    const existing = await sql`
      SELECT id FROM notification_sent_events
      WHERE date = ${dateStr}::date AND event_key = ${eventKey}
    `;
    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: `Already generated X posts for ${dateStr}`,
      });
    }
  }

  const rng = seededRandom(`x-posts-${dateStr}`);

  // Fetch live metrics for BIP post
  const metrics = await fetchLiveMetrics();

  // Generate posts
  const posts: Array<{
    type: string;
    content: string;
    firstComment?: string;
    slotHour: number;
    status: 'success' | 'error';
    error?: string;
    postId?: string;
  }> = [];

  // Post 1 (08:00): Tech insight
  const techInsight = pickRandom(TECH_INSIGHTS, rng);
  posts.push({
    type: 'tech_insight',
    content: techInsight,
    slotHour: POST_SLOTS_UTC[0],
    status: 'success',
  });

  // Post 2 (12:00): Hot take / shitpost
  const hotTake = pickRandom(HOT_TAKES, rng);
  posts.push({
    type: 'hot_take',
    content: hotTake,
    slotHour: POST_SLOTS_UTC[1],
    status: 'success',
  });

  // Post 3 (17:00): BIP observation (with real numbers)
  if (metrics) {
    const bipTemplate = pickRandom(BIP_TEMPLATES, rng);
    const bipContent = bipTemplate(metrics);
    posts.push({
      type: 'bip',
      content: bipContent,
      firstComment: 'https://lunary.app',
      slotHour: POST_SLOTS_UTC[2],
      status: 'success',
    });
  }

  // Post 4 (20:00): Engagement question
  const question = pickRandom(ENGAGEMENT_QUESTIONS, rng);
  posts.push({
    type: 'engagement_question',
    content: question,
    slotHour: POST_SLOTS_UTC[3],
    status: 'success',
  });

  // Schedule all posts
  for (const post of posts) {
    const scheduledDate = new Date(dateStr);
    scheduledDate.setUTCHours(post.slotHour, 0, 0, 0);

    try {
      const result = await scheduleXPost({
        content: post.content,
        scheduledFor: scheduledDate.toISOString(),
        firstComment: post.firstComment,
      });
      post.postId = result.id;
      post.status = result.success ? 'success' : 'error';
    } catch (error) {
      post.status = 'error';
      post.error =
        error instanceof Error ? error.message : 'Unknown scheduling error';
    }
  }

  const successCount = posts.filter((p) => p.status === 'success').length;

  // Record dedup if all succeeded
  if (successCount === posts.length && successCount > 0) {
    await sql`
      INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
      VALUES (${dateStr}::date, ${eventKey}, 'daily_x_posts', 'Daily X Posts', 3, 'cron')
      ON CONFLICT (date, event_key) DO NOTHING
    `;
  }

  // Discord notification
  if (successCount > 0) {
    try {
      await sendDiscordNotification({
        title: 'Daily X Posts — @sammiihk',
        description: `${successCount}/${posts.length} posts scheduled for ${dateStr}\n${posts.map((p) => `- ${p.type}: ${p.content.slice(0, 60)}...`).join('\n')}`,
        color: successCount === posts.length ? 'success' : 'warning',
        category: 'general',
      });
    } catch {
      /* non-critical */
    }
  }

  return NextResponse.json({
    success: successCount > 0,
    date: dateStr,
    postsGenerated: posts.length,
    postsScheduled: successCount,
    posts: posts.map((p) => ({
      type: p.type,
      slotHour: p.slotHour,
      status: p.status,
      contentPreview: p.content.slice(0, 80),
      ...(p.error ? { error: p.error } : {}),
      ...(p.postId ? { postId: p.postId } : {}),
    })),
  });
}
