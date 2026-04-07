import { generateMemeContent } from './meme-content';
import {
  buildCarouselFromSlug,
  getCarouselImageUrls,
} from './carousel-content';
import { selectCarouselForDate } from './carousel-scheduler';
import { generateCaption } from './caption-generator';
import {
  generateDidYouKnow,
  generateDidYouKnowCarousel,
} from './did-you-know-content';
import { generateRankingCarousel } from './ranking-content';
import { generateCompatibility } from './compatibility-content';
import { generateAngelNumberBatch } from './angel-number-content';
import { generateOneWordBatch, AVAILABLE_TRAITS } from './one-word-content';
import { seededRandom } from './ig-utils';
import {
  getTransitContext,
  getRetrogradeBiasedTraits,
  getTransitCategoryBias,
  type TransitContext,
} from './transit-context';
import { generateTransitSpotlight } from './transit-spotlight-content';
import { generateMythVsReality } from './myth-vs-reality-content';
import type { IGScheduledPost, IGPostBatch, IGPostType } from './types';

// Quality infrastructure (same systems used by Threads + video scripts)
import { validateSocialCopy } from '@/lib/social/social-copy/validation';
import { getWeightedGrimoireCategories } from '@/lib/threads/orbit-insights';

const SHARE_BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app'
).replace(/\/+$/, '');

// Daily posting schedule (UTC hours)
const POSTING_TIMES: Record<IGPostType, number> = {
  carousel: 10, // 10am UTC (primary content slot)
  angel_number_carousel: 10, // 10am UTC (primary content slot)
  one_word: 12, // noon UTC (engagement slot)
  meme: 12, // noon UTC (lunch scroll)
  did_you_know: 14, // 2pm UTC (afternoon education)
  sign_ranking: 12, // noon UTC (engagement slot)
  compatibility: 12, // noon UTC (engagement slot)
  transit_spotlight: 10, // 10am UTC (timely, saves)
  myth_vs_reality: 12, // noon UTC (contrarian, saves)
  quote: 19, // 7pm UTC (evening reflection -- stories/bonus)
  app_feature: 14, // 2pm UTC (when scheduled)
  story: 9, // 9am UTC (morning stories)
};

// ---------------------------------------------------------------------------
// 8-type rotation pool (replaces fixed DAILY_CONTENT_MIX)
//
// dayOfYear % 8 selects the position. 8-day cycle means content shifts
// by 1 day each week -- no more "always memes on Tuesday" fatigue.
//
// Priority signals: saves > shares > comments > likes
// ---------------------------------------------------------------------------

const ROTATION_POOL: IGPostType[] = [
  'one_word', // Position 0: saves + engagement
  'carousel', // Position 1: grimoire deep-dives
  'meme', // Position 2: shares + growth
  'transit_spotlight', // Position 3: timely + saves
  'compatibility', // Position 4: tags + shares
  'sign_ranking', // Position 5: comments + shares
  'angel_number_carousel', // Position 6: saves + search volume
  'myth_vs_reality', // Position 7: contrarian + saves
];

/**
 * Select content type for a given date using the 8-type rotation,
 * with transit override and DYK insertion.
 */
function selectContentType(
  dateStr: string,
  transitContext: TransitContext,
): IGPostType {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Transit override: CRITICAL/HIGH events (score >= 70) force transit_spotlight
  if (transitContext.highPriorityEvent) {
    return 'transit_spotlight';
  }

  // DYK carousel insertion: every 3rd cycle (positions 16-23 in a 24-day supercycle)
  // replaces the carousel slot with did_you_know carousel (~1x every 3 weeks)
  const superPosition = dayOfYear % 24;
  const rotationPosition = dayOfYear % 8;

  if (superPosition >= 16 && rotationPosition === 1) {
    return 'did_you_know';
  }

  return ROTATION_POOL[rotationPosition];
}

/**
 * Generate a full day's Instagram content batch.
 *
 * Uses an 8-type rotation pool with transit context awareness:
 * - Transit override for CRITICAL/HIGH events
 * - Transit biasing for sign/trait/category selection
 * - DYK carousel insertion every ~3 weeks
 * - Orbit insights for grimoire category weighting
 * - Caption validation (same quality gate as Threads + video scripts)
 * - Cross-day cosmic event dedup (3-day lookback via shared engine)
 */
export async function generateDailyBatch(
  dateStr: string,
  baseUrl?: string,
): Promise<IGPostBatch> {
  // Fetch transit context (real astronomical data + cosmic events)
  let transitContext: TransitContext;
  try {
    transitContext = await getTransitContext(dateStr);
  } catch (error) {
    console.warn(
      '[IG Orchestrator] Transit context failed, using defaults:',
      error,
    );
    transitContext = {
      sunSign: 'aries',
      moonPhase: { name: 'Waxing Crescent', energy: 'Building momentum' },
      retrogradePlanets: [],
      highPriorityEvent: null,
      hotSign: 'aries',
      hotSignPlanetCount: 1,
      todayEvents: [],
      cosmicEvents: [],
    };
  }

  const postType = selectContentType(dateStr, transitContext);
  const posts: IGScheduledPost[] = [];

  try {
    const post = await generatePost(postType, dateStr, transitContext, baseUrl);
    if (post) {
      // Quality gate: validate caption (same check as Threads + video scripts)
      const validationIssues = validatePostCaption(post);
      if (validationIssues.length > 0) {
        console.warn(
          `[IG Orchestrator] Caption validation issues for ${postType}:`,
          validationIssues,
        );
        // Fix issues inline rather than rejecting the post
        post.caption = sanitiseCaption(post.caption);
      }
      posts.push(post);
    }
  } catch (error) {
    console.error(`[IG Orchestrator] Failed to generate ${postType}:`, error);
  }

  return { date: dateStr, posts };
}

/**
 * Validate a post's caption using the shared quality gate.
 * Same validation used by Threads and video scripts.
 */
function validatePostCaption(post: IGScheduledPost): string[] {
  const topic = post.metadata?.category || post.type || 'astrology';
  return validateSocialCopy(post.caption, topic);
}

/**
 * Fix common validation issues in captions.
 * Strips banned patterns rather than rejecting the whole post.
 */
function sanitiseCaption(caption: string): string {
  // Remove em dashes (banned)
  let clean = caption.replace(/\u2014/g, ',').replace(/--/g, ',');
  // Remove trailing punctuation issues
  clean = clean.replace(/\.\.\s*$/g, '.').replace(/:\s*$/g, '.');
  return clean;
}

/**
 * Generate a single Instagram post by type, with transit context biasing.
 */
async function generatePost(
  type: IGPostType,
  dateStr: string,
  transitContext: TransitContext,
  baseUrl?: string,
): Promise<IGScheduledPost | null> {
  const scheduledTime = buildScheduleTime(dateStr, POSTING_TIMES[type]);

  switch (type) {
    case 'meme':
      return generateMemePost(dateStr, scheduledTime, transitContext);
    case 'carousel':
      return generateCarouselPost(
        dateStr,
        scheduledTime,
        transitContext,
        baseUrl,
      );
    case 'angel_number_carousel':
      return generateAngelNumberPost(dateStr, scheduledTime, baseUrl);
    case 'one_word':
      return generateOneWordPost(
        dateStr,
        scheduledTime,
        transitContext,
        baseUrl,
      );
    case 'quote':
      return generateQuotePost(dateStr, scheduledTime);
    case 'did_you_know':
      return generateDidYouKnowCarouselPost(dateStr, scheduledTime, baseUrl);
    case 'sign_ranking':
      return generateSignRankingPost(dateStr, scheduledTime, transitContext);
    case 'compatibility':
      return generateCompatibilityPost(dateStr, scheduledTime);
    case 'transit_spotlight':
      return generateTransitSpotlightPost(
        dateStr,
        scheduledTime,
        transitContext,
        baseUrl,
      );
    case 'myth_vs_reality':
      return generateMythVsRealityPost(dateStr, scheduledTime, baseUrl);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Post generators
// ---------------------------------------------------------------------------

async function generateMemePost(
  dateStr: string,
  scheduledTime: string,
  transitContext: TransitContext,
): Promise<IGScheduledPost> {
  // Transit bias: prefer the hotSign (sign with most transiting planets)
  const preferredSign = transitContext.hotSign;
  const meme = generateMemeContent(dateStr, preferredSign);

  // Build transit reason when the meme used the hot sign
  let transitReason: string | undefined;
  if (
    meme.sign.toLowerCase() === transitContext.hotSign.toLowerCase() &&
    transitContext.hotSignPlanetCount >= 3
  ) {
    const cap =
      transitContext.hotSign.charAt(0).toUpperCase() +
      transitContext.hotSign.slice(1);
    transitReason = `${transitContext.hotSignPlanetCount} planets in ${cap} right now. This energy is everywhere.`;
  }

  const { caption, hashtags } = generateCaption('meme', {
    sign: meme.sign,
    setup: meme.setup,
    punchline: meme.punchline,
    transitReason,
  });

  const params = new URLSearchParams({
    sign: meme.sign,
    setup: meme.setup,
    punchline: meme.punchline,
    template: meme.template,
    category: meme.category,
    v: '4',
    t: Date.now().toString(),
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
  transitContext: TransitContext,
  baseUrl?: string,
): Promise<IGScheduledPost | null> {
  // Layer 1: Transit bias from current astronomical context
  const transitBias = getTransitCategoryBias(transitContext);

  // Layer 2: Orbit performance weights (same system as Threads)
  // If orbit has category data, use it to override transit bias when applicable
  let effectiveBias = transitBias;
  if (!transitBias) {
    try {
      const orbitCategories = await getWeightedGrimoireCategories();
      if (orbitCategories.length > 0) {
        const rng = seededRandom(`carousel-orbit-${dateStr}`);
        effectiveBias =
          orbitCategories[Math.floor(rng() * orbitCategories.length)];
      }
    } catch (err) {
      console.warn(
        '[IG Orchestrator] Orbit unavailable, proceeding without category bias:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  const { category, slug } = selectCarouselForDate(
    dateStr,
    effectiveBias as any,
  );
  const carousel = await buildCarouselFromSlug(slug);

  if (!carousel) {
    console.warn(`[IG Orchestrator] No carousel data for slug: ${slug}`);
    return null;
  }

  const imageUrls = getCarouselImageUrls(carousel, baseUrl);
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
  baseUrl?: string,
): Promise<IGScheduledPost | null> {
  const batch = generateAngelNumberBatch(dateStr, 1);
  if (batch.length === 0) return null;

  const { number, slides } = batch[0];
  const cacheBust = Date.now().toString();
  const base = (baseUrl || SHARE_BASE_URL).replace(/\/$/, '');

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
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
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

async function generateOneWordPost(
  dateStr: string,
  scheduledTime: string,
  transitContext: TransitContext,
  baseUrl?: string,
): Promise<IGScheduledPost | null> {
  // Transit bias: prefer retrograde-relevant traits
  const biasedTraits = getRetrogradeBiasedTraits(
    transitContext.retrogradePlanets,
  );

  let batch;
  if (biasedTraits.length > 0) {
    // Check if any biased trait is in the available traits
    const validBiased = biasedTraits.filter((t) =>
      AVAILABLE_TRAITS.includes(t),
    );
    if (validBiased.length > 0) {
      // Use seeded random to pick from biased traits deterministically
      const rng = seededRandom(`oneword-bias-${dateStr}`);
      const pickedTrait = validBiased[Math.floor(rng() * validBiased.length)];
      // Generate with that specific trait by creating a batch seeded to land on it
      batch = generateOneWordBatch(dateStr, 1);
      // Override if the picked trait differs from what was randomly selected
      if (batch.length > 0 && batch[0].traitKey !== pickedTrait) {
        const { generateOneWordCarousel } = await import('./one-word-content');
        const slides = generateOneWordCarousel(pickedTrait);
        const trait = AVAILABLE_TRAITS.find((t) => t === pickedTrait);
        batch = [
          {
            traitKey: pickedTrait,
            traitLabel: pickedTrait.replace(/_/g, ' '),
            slides,
          },
        ];
      }
    } else {
      batch = generateOneWordBatch(dateStr, 1);
    }
  } else {
    batch = generateOneWordBatch(dateStr, 1);
  }

  if (batch.length === 0) return null;

  const { traitKey, traitLabel, slides } = batch[0];
  const cacheBust = Date.now().toString();
  const base = (baseUrl || SHARE_BASE_URL).replace(/\/$/, '');

  const imageUrls = slides.map((slide) => {
    if (slide.variant === 'body') {
      const params = new URLSearchParams({
        sign: slide.title,
        word: slide.content,
        explanation: slide.subtitle || '',
        symbol: slide.symbol || '',
        slideIndex: String(slide.slideIndex),
        totalSlides: String(slide.totalSlides),
        v: '4',
        t: cacheBust,
      });
      return `${base}/api/og/instagram/one-word?${params.toString()}`;
    }
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
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
  });

  const { caption, hashtags } = generateCaption('one_word', {
    trait: traitKey,
    category: 'zodiac',
  });

  return {
    type: 'one_word',
    format: 'square',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      category: 'zodiac',
      slug: `one-word-${traitKey}`,
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
    const { sql } = await import('@vercel/postgres');
    const result = await sql`
      SELECT id, quote_text, author
      FROM social_quotes
      WHERE status = 'available'
      ORDER BY use_count ASC, created_at ASC
      LIMIT 50
    `;

    if (result.rows.length > 0) {
      const rng = seededRandom(`quote-${dateStr}`);
      const index = Math.floor(rng() * result.rows.length);
      const quote = result.rows[index];

      quoteText = quote.quote_text;
      author = quote.author || 'Lunary';

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
  }

  const params = new URLSearchParams({
    text: author !== 'Lunary' ? `${quoteText} - ${author}` : quoteText,
    format: 'portrait',
    v: '4',
    t: Date.now().toString(),
  });

  const { caption, hashtags } = generateCaption('quote', {
    headline: quoteText,
  });

  return {
    type: 'quote',
    format: 'portrait',
    imageUrls: [`${SHARE_BASE_URL}/api/og/social-quote?${params.toString()}`],
    caption,
    hashtags,
    scheduledTime,
    metadata: { quoteText, author },
  };
}

async function generateDidYouKnowCarouselPost(
  dateStr: string,
  scheduledTime: string,
  baseUrl?: string,
): Promise<IGScheduledPost> {
  const { slides, category } = generateDidYouKnowCarousel(dateStr);
  const cacheBust = Date.now().toString();
  const base = (baseUrl || SHARE_BASE_URL).replace(/\/$/, '');

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
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
  });

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const { caption, hashtags } = generateCaption('did_you_know', {
    fact: `3 ${categoryLabel} facts you need to know`,
    category,
  });

  return {
    type: 'did_you_know',
    format: 'square',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      category,
      slug: `dyk-carousel-${dateStr}`,
    },
  };
}

async function generateSignRankingPost(
  dateStr: string,
  scheduledTime: string,
  transitContext: TransitContext,
): Promise<IGScheduledPost> {
  // Transit bias: the ranking generator uses seeded random for trait selection,
  // but we can influence by checking if retrograde-relevant traits are available
  const { trait, slides, rankings } = generateRankingCarousel(dateStr);

  const carouselContent = {
    title: `Signs ranked by ${trait}`,
    category: 'zodiac' as const,
    slug: `sign-ranking-${dateStr}`,
    slides,
  };

  const imageUrls = getCarouselImageUrls(carouselContent, SHARE_BASE_URL);

  const { caption, hashtags } = generateCaption('sign_ranking', {
    trait,
  });

  return {
    type: 'carousel',
    format: 'portrait',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      dateStr,
      trait,
    },
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

async function generateTransitSpotlightPost(
  dateStr: string,
  scheduledTime: string,
  transitContext: TransitContext,
  baseUrl?: string,
): Promise<IGScheduledPost> {
  const { slides, eventName, planet, sign } = generateTransitSpotlight(
    dateStr,
    transitContext,
  );

  const cacheBust = Date.now().toString();
  const base = (baseUrl || SHARE_BASE_URL).replace(/\/$/, '');

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
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
  });

  const { caption, hashtags } = generateCaption('transit_spotlight', {
    transitEvent: eventName,
    transitPlanet: planet,
    transitSign: sign,
    category: slides[0]?.category,
  });

  return {
    type: 'transit_spotlight',
    format: 'square',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      transitEvent: eventName,
      transitPlanet: planet,
      transitSign: sign,
      category: slides[0]?.category,
    },
  };
}

async function generateMythVsRealityPost(
  dateStr: string,
  scheduledTime: string,
  baseUrl?: string,
): Promise<IGScheduledPost> {
  const { slides, topic, category } = generateMythVsReality(dateStr);

  const cacheBust = Date.now().toString();
  const base = (baseUrl || SHARE_BASE_URL).replace(/\/$/, '');

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
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
  });

  const { caption, hashtags } = generateCaption('myth_vs_reality', {
    mythTopic: topic,
    category,
  });

  return {
    type: 'myth_vs_reality',
    format: 'square',
    imageUrls,
    caption,
    hashtags,
    scheduledTime,
    metadata: {
      mythTopic: topic,
      category,
    },
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
