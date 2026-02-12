/**
 * Content Types for Video Scripts
 *
 * Defines different content types with optimal posting times and target audiences
 */

export type ContentType =
  | 'primary-educational' // Daily theme-based grimoire content (12:00 UTC)
  | 'educational-deepdive' // Deep grimoire content, numerology focus (17:00 UTC)
  | 'app-demo' // Feature showcase for conversions (20:00 UTC)
  | 'comparison' // Before/After value proposition (20:00 UTC)
  | 'testimonial' // User stories and social proof (18:00 UTC)
  | 'quiz' // Interactive identity quiz (12:00 UTC)
  | 'ranking' // "Ranking signs by [trait]" list format (12:00 UTC)
  | 'hot-take' // "Unpopular opinion: [take]" debate format (12:00 UTC)
  | 'sign-check' // "If you're a [sign], stop scrolling" callout (12:00 UTC)
  | 'myth' // "The real reason [sign] is..." storytime (12:00 UTC)
  | 'transit-alert' // Timely transit content when major transits detected (12:00 UTC)
  | 'did-you-know'; // Surprising facts from grimoire content (17:00 UTC)

export type TargetAudience = 'discovery' | 'consideration' | 'conversion';

export interface ContentTypeConfig {
  type: ContentType;
  purpose: string;
  idealTime: number; // UTC hour (0-23)
  targetAudience: TargetAudience;
  platforms: ('tiktok' | 'instagram' | 'youtube')[];
  description: string;
}

/**
 * Content type configurations with optimal posting times
 *
 * Timing strategy:
 * - 12:00 UTC = UK lunch (12 PM), US morning (7-5 AM) - Discovery
 * - 17:00 UTC = UK evening (5 PM), US lunch (12-9 AM) - Consideration/Learning
 * - 18:00 UTC = UK prime (6 PM), US afternoon (1-10 AM) - Prime engagement
 * - 20:00 UTC = UK leisure (8 PM), US afternoon (3-12 PM) - Peak app downloads
 */
export const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
  'primary-educational': {
    type: 'primary-educational',
    purpose: 'Daily educational content on rotating themes',
    idealTime: 12, // Keep existing primary video time
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      'Theme-based grimoire content that educates and builds authority. Targets discovery phase users during UK lunch and US morning.',
  },

  'educational-deepdive': {
    type: 'educational-deepdive',
    purpose: 'Deep grimoire content, especially numerology (best performing)',
    idealTime: 17, // UK evening wind-down, US lunch break
    targetAudience: 'consideration',
    platforms: ['tiktok', 'instagram', 'youtube'],
    description:
      'In-depth educational content that demonstrates expertise. Scheduled for Friday to leverage best-performing numerology topic.',
  },

  'app-demo': {
    type: 'app-demo',
    purpose: 'Feature showcase driving direct conversions',
    idealTime: 20, // PEAK CONVERSION TIME
    targetAudience: 'conversion',
    platforms: ['tiktok', 'instagram'],
    description:
      'Screen recording walkthroughs showing app features in action. Scheduled at peak app download time (UK leisure, US afternoon).',
  },

  comparison: {
    type: 'comparison',
    purpose: 'Value proposition and moat messaging',
    idealTime: 20, // CONVERSION TIME
    targetAudience: 'conversion',
    platforms: ['tiktok', 'instagram'],
    description:
      'Before/After split-screen showing Lunary advantages over traditional methods. Emphasizes instant, personalized insights.',
  },

  testimonial: {
    type: 'testimonial',
    purpose: 'Social proof and trust building',
    idealTime: 18, // Prime time both markets
    targetAudience: 'conversion',
    platforms: ['tiktok', 'instagram'],
    description:
      'User stories and testimonials. Scheduled at prime engagement time in both US and UK markets.',
  },

  quiz: {
    type: 'quiz',
    purpose: 'Interactive identity quiz driving comments and shares',
    idealTime: 12, // Discovery window
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      'Identity-based quiz format that drives comments and shares. "Which one are you?" framing for maximum engagement.',
  },

  ranking: {
    type: 'ranking',
    purpose: 'Ranking signs by traits for discovery engagement',
    idealTime: 12, // Discovery window
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      'Provocative sign rankings by traits. List format drives debate in comments. High share potential.',
  },

  'hot-take': {
    type: 'hot-take',
    purpose: 'Debate-provoking opinions for engagement',
    idealTime: 12, // Discovery window
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      'Bold, confident takes on astrology that provoke debate. Designed for duets, stitches, and comment wars.',
  },

  'sign-check': {
    type: 'sign-check',
    purpose: 'Direct sign callouts for targeted engagement',
    idealTime: 12, // Discovery window
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      '"If you\'re a [sign], stop scrolling" format. Personal, direct, teasing. High save and share rate.',
  },

  myth: {
    type: 'myth',
    purpose: 'Zodiac mythology and origin stories',
    idealTime: 12, // Discovery window
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      'Captivating origin stories and hidden history behind zodiac signs, planets, and symbols. Reveal-structured for rewatches.',
  },

  'transit-alert': {
    type: 'transit-alert',
    purpose: 'Timely content for major upcoming transits',
    idealTime: 12, // Discovery window
    targetAudience: 'discovery',
    platforms: ['tiktok', 'instagram'],
    description:
      'Auto-generated alerts for major transits within 14 days. Timely but meaning-focused for evergreen value.',
  },

  'did-you-know': {
    type: 'did-you-know',
    purpose: 'Surprising facts from grimoire content',
    idealTime: 17, // UK evening, US lunch — consideration window
    targetAudience: 'discovery',
    platforms: ['tiktok'],
    description:
      'Save-worthy facts that educate and surprise. Hook-driven "Did you know...?" format designed for saves and shares.',
  },
};

/**
 * Get config for a content type
 */
export function getContentTypeConfig(type: ContentType): ContentTypeConfig {
  return CONTENT_TYPE_CONFIGS[type];
}

/**
 * Get ideal posting hour for a content type
 */
export function getIdealPostingHour(type: ContentType): number {
  return CONTENT_TYPE_CONFIGS[type].idealTime;
}

/**
 * Posting time windows per audience tier for A/B testing
 *
 * Each tier has a set of hours to rotate through deterministically.
 * Different dates naturally land on different hours, providing built-in
 * A/B comparison data without randomness.
 */
export interface PostingTimeWindow {
  baseHour: number; // Centre of optimal window (UTC)
  windowHours: number[]; // Hours to rotate through for A/B testing
  weekendAdjust: number; // Hour offset for Sat/Sun
}

export const POSTING_TIME_WINDOWS: Record<TargetAudience, PostingTimeWindow> = {
  discovery: {
    baseHour: 12,
    windowHours: [11, 12, 13, 14], // UK lunch + US morning
    weekendAdjust: 1, // People scroll later on weekends
  },
  consideration: {
    baseHour: 17,
    windowHours: [16, 17, 18], // UK evening + US lunch
    weekendAdjust: -1, // Weekend leisure shifts earlier
  },
  conversion: {
    baseHour: 20,
    windowHours: [19, 20, 21], // UK leisure + US afternoon peak
    weekendAdjust: 0, // Stable - conversion timing is consistent
  },
};

/**
 * Get posting time window for an audience tier
 */
export function getPostingTimeWindow(
  audience: TargetAudience,
): PostingTimeWindow {
  return POSTING_TIME_WINDOWS[audience];
}

/**
 * Check if content type is conversion-focused
 */
export function isConversionContent(type: ContentType): boolean {
  return CONTENT_TYPE_CONFIGS[type].targetAudience === 'conversion';
}

/**
 * Get all conversion-focused content types
 */
export function getConversionContentTypes(): ContentType[] {
  return Object.values(CONTENT_TYPE_CONFIGS)
    .filter((config) => config.targetAudience === 'conversion')
    .map((config) => config.type);
}
