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
  | 'testimonial'; // User stories and social proof (18:00 UTC)

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
