import { getAvailableQuote } from '@/lib/social/quote-generator';
import { generateMemeContent } from './meme-content';
import {
  buildCarouselFromSlug,
  getCarouselImageUrls,
} from './carousel-content';
import { selectCarouselForDate } from './carousel-scheduler';
import { generateCaption } from './caption-generator';
import { generateDidYouKnow } from './did-you-know-content';
import { generateSignRanking } from './ranking-content';
import { generateCompatibility } from './compatibility-content';
import { generateRecycledPost } from './content-recycler';
import { seededRandom } from './ig-utils';
import type { IGScheduledPost, IGPostBatch, IGPostType } from './types';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Daily posting schedule (UTC hours)
const POSTING_TIMES: Record<IGPostType, number> = {
  daily_cosmic: 8, // 8am UTC (morning engagement)
  did_you_know: 10, // 10am UTC (late morning education)
  meme: 12, // noon UTC (lunch scroll)
  carousel: 12, // noon UTC (when no meme)
  app_feature: 14, // 2pm UTC (when scheduled)
  sign_ranking: 15, // 3pm UTC (afternoon engagement)
  compatibility: 15, // 3pm UTC (afternoon engagement)
  quote: 19, // 7pm UTC (evening reflection)
  story: 9, // 9am UTC (morning stories)
};

// Day-of-week content schedule - no light days
// 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
const DAILY_CONTENT_MIX: Record<number, IGPostType[]> = {
  0: ['daily_cosmic', 'did_you_know', 'meme', 'quote'], // Monday
  1: ['daily_cosmic', 'carousel', 'sign_ranking', 'quote'], // Tuesday
  2: ['daily_cosmic', 'did_you_know', 'meme', 'quote'], // Wednesday
  3: ['daily_cosmic', 'carousel', 'compatibility', 'quote'], // Thursday
  4: ['daily_cosmic', 'did_you_know', 'meme', 'quote'], // Friday
  5: ['daily_cosmic', 'carousel', 'sign_ranking', 'quote'], // Saturday
  6: ['daily_cosmic', 'meme', 'quote'], // Sunday (3 posts min)
};

/**
 * Generate a full day's Instagram content batch.
 */
export async function generateDailyBatch(
  dateStr: string,
): Promise<IGPostBatch> {
  const date = new Date(dateStr);
  const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Mon=0

  const contentMix = DAILY_CONTENT_MIX[dayOfWeek] || ['daily_cosmic', 'quote'];
  const posts: IGScheduledPost[] = [];

  for (const postType of contentMix) {
    try {
      const post = await generatePost(postType, dateStr);
      if (post) {
        posts.push(post);
      }
    } catch (error) {
      console.error(`[IG Orchestrator] Failed to generate ${postType}:`, error);
    }
  }

  // Sunday bonus slot: recycle a top-performing evergreen post
  if (dayOfWeek === 6) {
    try {
      const recycled = await generateRecycledPost(dateStr);
      if (recycled) {
        posts.push(recycled);
      }
    } catch (error) {
      console.error(
        '[IG Orchestrator] Failed to generate recycled post:',
        error,
      );
    }
  }

  return { date: dateStr, posts };
}

/**
 * Generate a single Instagram post by type.
 */
async function generatePost(
  type: IGPostType,
  dateStr: string,
): Promise<IGScheduledPost | null> {
  const scheduledTime = buildScheduleTime(dateStr, POSTING_TIMES[type]);

  switch (type) {
    case 'meme':
      return generateMemePost(dateStr, scheduledTime);
    case 'carousel':
      return generateCarouselPost(dateStr, scheduledTime);
    case 'daily_cosmic':
      return generateDailyCosmicPost(dateStr, scheduledTime);
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
): Promise<IGScheduledPost | null> {
  const { category, slug } = selectCarouselForDate(dateStr);
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

async function generateDailyCosmicPost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  // Simple cosmic card with moon phase focus
  const rng = seededRandom(`cosmic-${dateStr}`);
  const moonPhases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const headlines = [
    'Trust the process unfolding around you',
    'Your intuition is especially strong today',
    'A day for creative breakthroughs',
    'Set intentions with clarity and purpose',
    'Release what no longer serves your growth',
    'New connections bring unexpected insights',
    'The cosmos aligns in your favour today',
    'Take time to reflect on your journey',
  ];

  const moonPhase = moonPhases[Math.floor(rng() * moonPhases.length)];
  const headline = headlines[Math.floor(rng() * headlines.length)];

  const params = new URLSearchParams({
    date: dateStr,
    headline,
    moonPhase,
    variant: 'daily_energy',
  });

  const { caption, hashtags } = generateCaption('daily_cosmic', {
    headline,
    moonPhase,
  });

  return {
    type: 'daily_cosmic',
    format: 'square',
    imageUrls: [
      `${SHARE_BASE_URL}/api/og/instagram/daily-cosmic?${params.toString()}`,
    ],
    caption,
    hashtags,
    scheduledTime,
    metadata: {},
  };
}

async function generateQuotePost(
  dateStr: string,
  scheduledTime: string,
): Promise<IGScheduledPost> {
  let quoteText = 'The cosmos is within us. We are made of star-stuff.';
  let author = 'Carl Sagan';

  try {
    const quote = await getAvailableQuote();
    if (quote) {
      quoteText = quote.quoteText;
      author = quote.author || 'Lunary';
    }
  } catch {
    // Use fallback
  }

  const params = new URLSearchParams({
    text: author !== 'Lunary' ? `${quoteText} - ${author}` : quoteText,
    format: 'square',
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
    metadata: {},
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

function buildScheduleTime(dateStr: string, utcHour: number): string {
  const date = new Date(dateStr);
  date.setUTCHours(utcHour, 0, 0, 0);
  return date.toISOString();
}
