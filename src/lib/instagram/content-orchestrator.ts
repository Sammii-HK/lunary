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
import { getMoonPhase } from '../../../utils/moon/moonPhases';
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
  // Get ACTUAL moon phase for the date using real astronomical data
  const date = new Date(dateStr);
  const moonPhase = getMoonPhase(date);

  // Headlines matched to moon phase energy
  // Waxing phases (New → Full): Growth, manifestation, building
  // Waning phases (Full → New): Release, reflection, letting go
  const headlinesByPhase: Record<string, string[]> = {
    'New Moon': [
      'Set intentions with clarity and purpose',
      'New beginnings await you today',
      'Plant seeds for what you wish to manifest',
      'A blank canvas for your cosmic dreams',
      'Fresh starts are written in the stars',
      'Embrace the power of starting anew',
      'The universe supports your new chapter',
    ],
    'Waxing Crescent': [
      'Trust the process unfolding around you',
      'Your plans are taking root',
      'Take action toward your goals',
      'Small steps lead to cosmic transformations',
      'Your intentions are gaining momentum',
      'Nurture the seeds you have planted',
      'Growth happens in the in-between moments',
    ],
    'First Quarter': [
      'A day for creative breakthroughs',
      'Push through challenges with determination',
      'Your momentum is building',
      'Obstacles are opportunities in disguise',
      'The universe rewards bold action',
      'Your courage is your superpower today',
      'Break through limitations with confidence',
    ],
    'Waxing Gibbous': [
      'Refinement leads to perfection',
      'Fine-tune your approach',
      'Success is within reach',
      'Polish your vision until it shines',
      'The final touches make all the difference',
      'Trust in the culmination of your efforts',
      'Your hard work is about to pay off',
    ],
    'Full Moon': [
      'Your intuition is especially strong today',
      'The cosmos aligns in your favour today',
      'Celebrate your achievements',
      'Bask in the glow of your manifestations',
      'Your inner wisdom is illuminated',
      'Everything you need is already within you',
      'The peak of your power is now',
    ],
    'Waning Gibbous': [
      'Share your wisdom with others',
      'Gratitude opens new doors',
      'Take time to reflect on your journey',
      'Give thanks for all you have received',
      'Your experiences are gifts to share',
      'Abundance flows through appreciation',
      'Wisdom ripens in the afterglow',
    ],
    'Last Quarter': [
      'Release what no longer serves your growth',
      'Let go of old patterns',
      'Make space for transformation',
      'Surrender to create space for miracles',
      'What you release makes room for blessings',
      'Trust the cosmic process of letting go',
      'Freedom comes from releasing control',
    ],
    'Waning Crescent': [
      'Rest and restore your energy',
      'Quiet reflection brings clarity',
      'Prepare for new beginnings',
      'Embrace the sacred pause before rebirth',
      'In stillness, you find your power',
      'The darkness holds wisdom and healing',
      'Rest deeply before the next chapter begins',
    ],
  };

  // Select headline deterministically based on date
  const rng = seededRandom(`cosmic-${dateStr}`);
  const phaseHeadlines =
    headlinesByPhase[moonPhase] || headlinesByPhase['Full Moon'];
  const headline = phaseHeadlines[Math.floor(rng() * phaseHeadlines.length)];

  const params = new URLSearchParams({
    date: dateStr,
    headline,
    moonPhase,
    variant: 'daily_energy',
    v: '5', // Cache-busting version (using PNGs now!)
    t: Date.now().toString(), // Timestamp to force fresh generation
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
    metadata: {
      moonPhase, // Store actual moon phase for reference
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

function buildScheduleTime(dateStr: string, utcHour: number): string {
  const date = new Date(dateStr);
  date.setUTCHours(utcHour, 0, 0, 0);
  return date.toISOString();
}
