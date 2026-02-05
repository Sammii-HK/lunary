/**
 * Weekly Secondary Content Generator
 *
 * Generates the weekly mix of secondary videos:
 * - 4x App Demos (Mon, Tue, Thu, Sat)
 * - 1x Comparison (Wed)
 * - 1x Numerology Deep-dive (Fri)
 * - 1x Testimonial (Sun)
 */

import { generateAppDemoScript } from './app-demo';
import { generateComparisonScript } from './comparison';
import type { VideoScript } from '../types';
import type { ContentType } from '../content-types';
import { getContentTypeConfig } from '../content-types';

/**
 * Weekly secondary content schedule
 * Optimized for US/UK markets and conversion goals
 */
interface DayConfig {
  contentType: ContentType;
  config: string; // Feature ID, comparison ID, or grimoire slug
}

const WEEKLY_SECONDARY_SCHEDULE: Record<string, DayConfig> = {
  monday: {
    contentType: 'app-demo',
    config: 'daily-transits', // Show personalized transits feature
  },
  tuesday: {
    contentType: 'app-demo',
    config: 'synastry-comparison', // Relationship compatibility
  },
  wednesday: {
    contentType: 'comparison',
    config: 'instant-vs-waiting', // Value prop: instant access
  },
  thursday: {
    contentType: 'app-demo',
    config: 'pattern-recognition', // Pattern tracking feature
  },
  friday: {
    contentType: 'educational-deepdive',
    config: 'numerology', // Leverage best-performing topic
  },
  saturday: {
    contentType: 'app-demo',
    config: 'birth-chart-walkthrough', // Weekend download push
  },
  sunday: {
    contentType: 'testimonial',
    config: 'user-story', // Social proof for week ahead
  },
};

/**
 * Generate all secondary scripts for a week
 */
export async function generateWeeklySecondaryScripts(
  weekStartDate: Date,
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript[]> {
  const scripts: VideoScript[] = [];
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  console.log('📝 Generating weekly secondary scripts...');

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);

    const dayName = days[i];
    const dayConfig = WEEKLY_SECONDARY_SCHEDULE[dayName];
    let script: VideoScript;

    console.log(`  ${dayName}: ${dayConfig.contentType} (${dayConfig.config})`);

    try {
      switch (dayConfig.contentType) {
        case 'app-demo':
          script = await generateAppDemoScript(dayConfig.config, date, baseUrl);
          break;

        case 'comparison':
          script = await generateComparisonScript(
            dayConfig.config,
            date,
            baseUrl,
          );
          break;

        case 'educational-deepdive':
          // For now, use a placeholder - you can implement this later
          // or reuse existing educational script generator
          script = await generateEducationalDeepDiveScript(
            dayConfig.config,
            date,
            baseUrl,
          );
          break;

        case 'testimonial':
          // Placeholder - implement testimonial generator later
          script = await generateTestimonialScript(
            dayConfig.config,
            date,
            baseUrl,
          );
          break;

        default:
          throw new Error(`Unknown content type: ${dayConfig.contentType}`);
      }

      // Set posting time based on content type
      const config = getContentTypeConfig(script.contentType || 'app-demo');
      if (script.metadata) {
        script.metadata.scheduledHour = config.idealTime;
        script.metadata.targetAudience = config.targetAudience;
      }

      scripts.push(script);
    } catch (error) {
      console.error(
        `  ❌ Failed to generate ${dayConfig.contentType} for ${dayName}:`,
        error,
      );
      // Continue with other days even if one fails
    }
  }

  console.log(`✅ Generated ${scripts.length}/7 secondary scripts`);
  return scripts;
}

/**
 * Generate educational deep-dive script (numerology focus)
 * Placeholder - reuse existing educational generator or create new one
 */
async function generateEducationalDeepDiveScript(
  topic: string,
  scheduledDate: Date,
  baseUrl: string,
): Promise<VideoScript> {
  // TODO: Implement or reuse existing educational script generator
  // For now, return a placeholder
  return {
    themeId: 'educational-deepdive',
    themeName: 'Educational Deep-dive',
    facetTitle: `${topic} Deep-dive`,
    topic,
    angle: 'deepdive',
    aspect: 'education',
    platform: 'tiktok',
    sections: [
      {
        name: 'PLACEHOLDER',
        duration: '0-30s',
        content: 'Educational deep-dive script (to be implemented)',
      },
    ],
    fullScript: 'Educational deep-dive script (to be implemented)',
    wordCount: 100,
    estimatedDuration: '30s',
    scheduledDate,
    status: 'draft',
    coverImageUrl: `${baseUrl}/api/og/grimoire/${topic}`,
    metadata: {
      theme: 'EDUCATIONAL',
      title: `${topic} Deep-dive`,
      series: 'Educational Deep-dive',
      summary: 'Deep educational content',
    },
  };
}

/**
 * Generate testimonial script
 * Placeholder - implement later with user testimonial data
 */
async function generateTestimonialScript(
  config: string,
  scheduledDate: Date,
  baseUrl: string,
): Promise<VideoScript> {
  // TODO: Implement testimonial generator with real user stories
  return {
    themeId: 'testimonial',
    themeName: 'Testimonial',
    facetTitle: 'User Story',
    topic: 'testimonial',
    angle: 'social-proof',
    aspect: 'conversion',
    platform: 'tiktok',
    sections: [
      {
        name: 'PLACEHOLDER',
        duration: '0-30s',
        content: 'Testimonial script (to be implemented)',
      },
    ],
    fullScript: 'Testimonial script (to be implemented)',
    wordCount: 100,
    estimatedDuration: '30s',
    scheduledDate,
    status: 'draft',
    coverImageUrl: `${baseUrl}/screenshots/testimonial.png`,
    metadata: {
      theme: 'TESTIMONIAL',
      title: 'User Story',
      series: 'User Testimonial',
      summary: 'User testimonial',
    },
  };
}

/**
 * Get the weekly secondary content schedule
 */
export function getWeeklySchedule(): Record<string, DayConfig> {
  return WEEKLY_SECONDARY_SCHEDULE;
}
