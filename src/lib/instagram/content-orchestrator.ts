import { generateMemeContent } from './meme-content';
import {
  buildCarouselFromSlug,
  getCarouselImageUrls,
} from './carousel-content';
import {
  selectCarouselForDate,
  getCarouselCategoryForDay,
} from './carousel-scheduler';
import { generateCaption } from './caption-generator';
import { generateDidYouKnow } from './did-you-know-content';
import { generateSignRanking } from './ranking-content';
import { generateCompatibility } from './compatibility-content';
import { generateAngelNumberBatch } from './angel-number-content';
import { seededRandom } from './ig-utils';
import type { IGScheduledPost, IGPostBatch, IGPostType } from './types';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Daily posting schedule (UTC hours)
const POSTING_TIMES: Record<IGPostType, number> = {
  carousel: 10, // 10am UTC (primary content slot)
  angel_number_carousel: 10, // 10am UTC (primary content slot)
  meme: 12, // noon UTC (lunch scroll)
  did_you_know: 14, // 2pm UTC (afternoon education)
  sign_ranking: 12, // noon UTC (engagement slot)
  compatibility: 12, // noon UTC (engagement slot)
  quote: 19, // 7pm UTC (evening reflection — stories/bonus)
  app_feature: 14, // 2pm UTC (when scheduled)
  story: 9, // 9am UTC (morning stories)
};

// Weekly cadence plan — 5 feed posts/week (optimal 3-5 range)
// Memes drive shares (growth), carousels drive saves, rankings drive comments
// Angel numbers, DYK, quotes moved to story rotation for better format fit
// Stories + reels provide presence on rest days (Wed/Sun)
// 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
const DAILY_CONTENT_MIX: Record<number, IGPostType[]> = {
  0: ['carousel'], // Monday: zodiac carousel (saves)
  1: ['meme'], // Tuesday: meme (shares — #1 growth lever)
  2: ['did_you_know'], // Wednesday: factual DYK (saves/shares)
  3: ['carousel'], // Thursday: factual carousel (saves)
  4: ['did_you_know'], // Friday: factual DYK (saves/shares)
  5: ['carousel'], // Saturday: tarot carousel (saves)
  6: [], // Sunday: rest day (stories only)
};

/**
 * Generate a full day's Instagram content batch.
 * Follows the weekly cadence plan (5 posts/week):
 * Mon=zodiac carousel, Tue=angel number, Wed=rest,
 * Thu=ranking, Fri=DYK, Sat=tarot carousel, Sun=rest
 */
export async function generateDailyBatch(
  dateStr: string,
): Promise<IGPostBatch> {
  const date = new Date(dateStr);
  const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Mon=0

  const contentMix = DAILY_CONTENT_MIX[dayOfWeek] || ['carousel'];
  const posts: IGScheduledPost[] = [];

  for (const postType of contentMix) {
    try {
      const post = await generatePost(postType, dateStr, dayOfWeek);
      if (post) {
        posts.push(post);
      }
    } catch (error) {
      console.error(`[IG Orchestrator] Failed to generate ${postType}:`, error);
    }
  }

  return { date: dateStr, posts };
}

/**
 * Generate a single Instagram post by type.
 * dayOfWeek (Mon=0) is used to determine forced carousel category.
 */
async function generatePost(
  type: IGPostType,
  dateStr: string,
  dayOfWeek: number,
): Promise<IGScheduledPost | null> {
  const scheduledTime = buildScheduleTime(dateStr, POSTING_TIMES[type]);

  switch (type) {
    case 'meme':
      return generateMemePost(dateStr, scheduledTime);
    case 'carousel':
      return generateCarouselPost(dateStr, scheduledTime, dayOfWeek);
    case 'angel_number_carousel':
      return generateAngelNumberPost(dateStr, scheduledTime);
    case 'quote':
      return generateQuotePost(dateStr, scheduledTime);
    case 'did_you_know':
      return generateDidYouKnowPost(dateStr, scheduledTime);
    case 'sign_ranking':
      return generateSignRankingPost(dateStr, scheduledTime);
    case 'compatibility':
      return generateCompatibilityPost(dateStr, scheduledTime);
    default:
      return null;
  }
}

async function generateMemePost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  const meme = generateMemeContent(dateStr);
  const { caption, hashtags } = generateCaption('meme', {
    sign: meme.sign,
    setup: meme.setup,
    punchline: meme.punchline,
  });

  const params = new URLSearchParams({
    sign: meme.sign,
    setup: meme.setup,
    punchline: meme.punchline,
    template: meme.template,
    category: meme.category,
    v: '4', // Design version
    t: Date.now().toString(), // Timestamp cache bust
  });

  return {
    type: 'meme',
    format: 'square',
    imageUrls: [`${SHARE_BASE_URL}/api/og/instagram/meme?${params.toString()}`],
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      sign: meme.sign,
      template: meme.template,
    },
  };
}

async function generateCarouselPost(
  dateStr: string,
  scheduledTime: string,
  dayOfWeek?: number,
): Promise<IGScheduledPost | null> {
  // Cadence plan forces specific categories per day: Mon=zodiac, Sat=tarot, Sun=crystals
  const forcedCategory =
    dayOfWeek !== undefined ? getCarouselCategoryForDay(dayOfWeek) : undefined;
  const { category, slug } = selectCarouselForDate(dateStr, forcedCategory);
  const carousel = await buildCarouselFromSlug(slug);

  if (!carousel) {
    console.warn(`[IG Orchestrator] No carousel data for slug: ${slug}`);
    return null;
  }

  const imageUrls = getCarouselImageUrls(carousel);
  const { caption, hashtags } = generateCaption('carousel', {
    category: carousel.category,
    title: carousel.title,
    slug: carousel.slug,
  });

  return {
    type: 'carousel',
    format: 'square',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      category: carousel.category,
      slug: carousel.slug,
    },
  };
}

async function generateAngelNumberPost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost | null> {
  const batch = generateAngelNumberBatch(dateStr, 1);
  if (batch.length === 0) return null;

  const { number, slides } = batch[0];
  const cacheBust = Date.now().toString();

  const imageUrls = slides.map((slide) => {
    const params = new URLSearchParams({
      title: slide.title,
      slideIndex: String(slide.slideIndex),
      totalSlides: String(slide.totalSlides),
      content: slide.content,
      category: slide.category,
      variant: slide.variant,
      v: '4',
      t: cacheBust,
    });
    if (slide.subtitle) params.set('subtitle', slide.subtitle);
    if (slide.symbol) params.set('symbol', slide.symbol);
    return `${SHARE_BASE_URL}/api/og/instagram/carousel?${params.toString()}`;
  });

  const { caption, hashtags } = generateCaption('angel_number_carousel', {
    title: number,
    category: 'numerology',
  });

  return {
    type: 'angel_number_carousel',
    format: 'square',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      category: 'numerology',
      slug: `angel-number-${number}`,
    },
  };
}

async function generateQuotePost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  let quoteText = 'The cosmos is within us. We are made of star-stuff.';
  let author = 'Carl Sagan';

  try {
    // Get ALL available quotes and select one deterministically based on date
    // This ensures: different quotes for different dates, same quote for same date
    const { sql } = await import('@vercel/postgres');
    const result = await sql`
      SELECT id, quote_text, author
      FROM social_quotes
      WHERE status = 'available'
      ORDER BY use_count ASC, created_at ASC
      LIMIT 50
    `;

    if (result.rows.length > 0) {
      // Select quote deterministically based on date
      const rng = seededRandom(`quote-${dateStr}`);
      const index = Math.floor(rng() * result.rows.length);
      const quote = result.rows[index];

      quoteText = quote.quote_text;
      author = quote.author || 'Lunary';

      // Mark as used (increment use_count)
      await sql`
        UPDATE social_quotes
        SET use_count = use_count + 1,
            used_at = NOW(),
            updated_at = NOW()
        WHERE id = ${quote.id}
      `;
    }
  } catch (error) {
    console.warn('[Quote] Failed to fetch quote, using fallback:', error);
    // Use fallback quote
  }

  const params = new URLSearchParams({
    text: author !== 'Lunary' ? `${quoteText} - ${author}` : quoteText,
    format: 'square',
    v: '4',
    t: Date.now().toString(),
  });

  const { caption, hashtags } = generateCaption('quote', {
    headline: quoteText,
  });

  return {
    type: 'quote',
    format: 'square',
    imageUrls: [`${SHARE_BASE_URL}/api/og/social-quote?${params.toString()}`],
    caption,
    hashtags,
    scheduledTime,
    metadata: { quoteText, author },
  };
}

async function generateDidYouKnowPost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  const content = generateDidYouKnow(dateStr);

  const params = new URLSearchParams({
    fact: content.fact,
    category: content.category,
    source: content.source,
    v: '4',
    t: Date.now().toString(),
  });

  const { caption, hashtags } = generateCaption('did_you_know', {
    fact: content.fact,
    category: content.category,
  });

  return {
    type: 'did_you_know',
    format: 'square',
    imageUrls: [
      `${SHARE_BASE_URL}/api/og/instagram/did-you-know?${params.toString()}`,
    ],
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      category: content.category,
      slug: content.source,
    },
  };
}

async function generateSignRankingPost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  const content = generateSignRanking(dateStr);

  const params = new URLSearchParams({
    trait: content.trait,
    rankings: JSON.stringify(content.rankings),
    v: '4',
    t: Date.now().toString(),
  });

  const { caption, hashtags } = generateCaption('sign_ranking', {
    trait: content.trait,
  });

  return {
    type: 'sign_ranking',
    format: 'square',
    imageUrls: [
      `${SHARE_BASE_URL}/api/og/instagram/sign-ranking?${params.toString()}`,
    ],
    caption,
    hashtags,
    scheduledTime,
    metadata: {},
  };
}

async function generateCompatibilityPost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  const content = generateCompatibility(dateStr);

  const params = new URLSearchParams({
    sign1: content.sign1,
    sign2: content.sign2,
    score: String(content.score),
    element1: content.element1,
    element2: content.element2,
    headline: content.headline,
    v: '4',
    t: Date.now().toString(),
  });

  const { caption, hashtags } = generateCaption('compatibility', {
    sign1: content.sign1,
    sign2: content.sign2,
    score: content.score,
  });

  return {
    type: 'compatibility',
    format: 'square',
    imageUrls: [
      `${SHARE_BASE_URL}/api/og/instagram/compatibility?${params.toString()}`,
    ],
    caption,
    hashtags,
    scheduledTime,
    metadata: {},
  };
}

/**
 * Generate LinkedIn "Did You Know" image posts for 3 days per week (Mon, Wed, Fri).
 * Reuses the same DYK content and OG image URLs as the Instagram pipeline.
 */
export function generateLinkedInDidYouKnowBatch(
  weekStartDate: string,
): IGScheduledPost[] {
  const posts: IGScheduledPost[] = [];
  const dykDays = [0, 2, 4]; // Mon, Wed, Fri offsets from week start

  for (const dayOffset of dykDays) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    const content = generateDidYouKnow(dateStr);
    const params = new URLSearchParams({
      fact: content.fact,
      category: content.category,
      source: content.source,
      v: '4',
      t: Date.now().toString(),
    });

    const { caption, hashtags } = generateCaption('did_you_know', {
      fact: content.fact,
      category: content.category,
    });

    posts.push({
      type: 'did_you_know',
      format: 'square',
      imageUrls: [
        `${SHARE_BASE_URL}/api/og/instagram/did-you-know?${params.toString()}`,
      ],
      caption,
      hashtags,
      scheduledTime: `${dateStr}T14:00:00.000Z`,
      metadata: {
        category: content.category,
        slug: content.source,
      },
    });
  }

  return posts;
}

function buildScheduleTime(dateStr: string, utcHour: number): string {
  const date = new Date(dateStr);
  date.setUTCHours(utcHour, 0, 0, 0);
  return date.toISOString();
}
