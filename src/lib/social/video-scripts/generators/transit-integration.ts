/**
 * Transit Video Integration
 *
 * Integrates with your existing cosmic snapshot system to auto-generate
 * transit alert videos for upcoming events (ingresses, stations, eclipses)
 */

import {
  detectUpcomingSignChanges,
  detectUpcomingRetrogradeStations,
  type SignChangeEvent,
  type RetrogradeStationEvent,
} from '@/lib/cosmic-snapshot/global-cache';
import { generateTransitAlertScript, type TransitEvent } from './transit-alert';
import type { VideoScript } from '../types';

/**
 * Convert your SignChangeEvent to our TransitEvent format
 */
function signChangeToTransitEvent(
  event: SignChangeEvent,
  date: Date,
): TransitEvent {
  return {
    type: 'ingress',
    planet: event.planet,
    fromSign: event.previousSign,
    toSign: event.sign,
    date,
    rarity:
      event.planet === 'Saturn' ||
      event.planet === 'Jupiter' ||
      event.planet === 'Uranus' ||
      event.planet === 'Neptune' ||
      event.planet === 'Pluto'
        ? 'very-rare'
        : event.planet === 'Mars' || event.planet === 'Venus'
          ? 'rare'
          : 'common',
    significance: `${event.planet} enters ${event.sign}. ${event.energy}`,
  };
}

/**
 * Convert RetrogradeStationEvent to TransitEvent format
 */
function retrogradeToTransitEvent(
  event: RetrogradeStationEvent,
  date: Date,
): TransitEvent {
  return {
    type: 'station',
    planet: event.planet,
    fromSign: event.sign,
    toSign: event.sign,
    date,
    rarity:
      event.planet === 'Mercury'
        ? 'common'
        : event.type === 'retrograde_start'
          ? 'rare'
          : 'very-rare',
    significance: event.name,
  };
}

/**
 * Detect all upcoming transits using your cosmic snapshot system
 * and generate video scripts for them
 */
export async function generateTransitVideosFromCosmicData(
  daysAhead: number = 14,
  leadTime: number = 7,
): Promise<VideoScript[]> {
  const today = new Date();
  const scripts: VideoScript[] = [];

  // Check each day in the range
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + dayOffset);

    const tomorrow = new Date(checkDate);
    tomorrow.setDate(checkDate.getDate() + 1);

    // Detect sign changes using YOUR system
    const { ingresses, egresses } = await detectUpcomingSignChanges(
      checkDate,
      tomorrow,
    );

    // Detect retrograde stations using YOUR system
    const stations = await detectUpcomingRetrogradeStations(
      checkDate,
      tomorrow,
    );

    // Generate video for ingresses (planet entering new sign)
    for (const ingress of ingresses) {
      // Skip fast-moving planets (Sun, Moon, Mercury) unless significant
      if (
        ['Sun', 'Moon'].includes(ingress.planet) ||
        (ingress.planet === 'Mercury' && ingress.priority < 8)
      ) {
        continue;
      }

      const transitEvent = signChangeToTransitEvent(ingress, tomorrow);

      // Calculate when to post (leadTime days before)
      const postDate = new Date(tomorrow);
      postDate.setDate(tomorrow.getDate() - leadTime);

      // Only generate if post date is in the future
      if (postDate > today) {
        const script = await generateTransitAlertScript(
          transitEvent,
          postDate,
          'https://lunary.app',
        );
        scripts.push(script);
      }
    }

    // Generate video for retrograde stations
    for (const station of stations) {
      // Retrograde stations are always significant
      const transitEvent = retrogradeToTransitEvent(station, tomorrow);

      const postDate = new Date(tomorrow);
      postDate.setDate(tomorrow.getDate() - leadTime);

      if (postDate > today) {
        const script = await generateTransitAlertScript(
          transitEvent,
          postDate,
          'https://lunary.app',
        );
        scripts.push(script);
      }
    }
  }

  return scripts;
}

/**
 * Get a transit video for a given date if a major transit is nearby.
 * Looks up to 10 days ahead from `fromDate` to catch upcoming ingresses/stations.
 */
export async function getTodaysTransitVideo(
  fromDate?: Date,
): Promise<VideoScript | null> {
  const today = fromDate ?? new Date();

  // Scan a 10-day window ahead to catch nearby major transits
  for (const daysAhead of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);

    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const { ingresses } = await detectUpcomingSignChanges(targetDate, nextDay);
    const stations = await detectUpcomingRetrogradeStations(
      targetDate,
      nextDay,
    );

    // Find the most significant event
    const significantIngress = ingresses.find(
      (i) => !['Sun', 'Moon', 'Mercury'].includes(i.planet) && i.priority >= 8,
    );

    if (significantIngress) {
      const transitEvent = signChangeToTransitEvent(
        significantIngress,
        nextDay,
      );
      return await generateTransitAlertScript(
        transitEvent,
        today,
        'https://lunary.app',
      );
    }

    if (stations.length > 0) {
      const transitEvent = retrogradeToTransitEvent(stations[0], nextDay);
      return await generateTransitAlertScript(
        transitEvent,
        today,
        'https://lunary.app',
      );
    }
  }

  return null;
}

/**
 * Example usage in your weekly cron:
 *
 * ```typescript
 * // In src/app/api/cron/weekly-content/route.ts
 * import { generateTransitVideosFromCosmicData } from '@/lib/social/video-scripts/generators/transit-integration';
 *
 * // Generate transit videos for upcoming 14 days
 * const transitVideos = await generateTransitVideosFromCosmicData(14, 7);
 * console.log(`Generated ${transitVideos.length} transit alert videos`);
 *
 * // Save to database
 * for (const video of transitVideos) {
 *   await saveVideoScript(video);
 * }
 * ```
 */
