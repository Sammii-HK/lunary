/**
 * Starfield Seeding for Unique Videos
 *
 * Ensures each video has unique star positions and comet paths
 * by generating deterministic but unique seeds
 */

/**
 * Generate a unique seed for each video based on multiple factors
 *
 * This ensures:
 * - Same content on different days = different starfield
 * - Different content types = different starfield
 * - Reproducible (same inputs = same output)
 */
export function generateStarfieldSeed(params: {
  contentType: string;
  scheduledDate: Date;
  topic: string;
  videoId?: number;
}): string {
  const { contentType, scheduledDate, topic, videoId } = params;

  // Create seed from multiple factors
  const datePart = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const idPart = videoId ? `-${videoId}` : '';
  const topicHash = simpleHash(topic);

  return `${contentType}-${datePart}-${topicHash}${idPart}`;
}

/**
 * Simple hash function for strings
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Example usage in Remotion compositions:
 *
 * ```typescript
 * import { generateStarfieldSeed } from '@/lib/social/video-scripts/starfield-seeding';
 * import { generateStarfield } from '@/lib/video/starfield-generator';
 *
 * export const WitchTypeVideo: React.FC<{ script: VideoScript }> = ({ script }) => {
 *   // Generate unique seed for this video
 *   const seed = generateStarfieldSeed({
 *     contentType: script.contentType || 'primary-educational',
 *     scheduledDate: script.scheduledDate,
 *     topic: script.topic || script.facetTitle,
 *     videoId: script.id,
 *   });
 *
 *   // Your starfield generator already supports seeds!
 *   // Just pass the unique seed and you'll get unique stars/comets
 *   return (
 *     <AbsoluteFill>
 *       <Starfield seed={seed} />
 *       <Content script={script} />
 *     </AbsoluteFill>
 *   );
 * };
 * ```
 */

/**
 * Get seed for specific video types
 */
export const StarfieldSeeds = {
  /**
   * Witch Type videos - use witch type name in seed
   */
  witchType: (witchType: string, date: Date, videoId?: number) => {
    return generateStarfieldSeed({
      contentType: 'witch-type',
      scheduledDate: date,
      topic: witchType,
      videoId,
    });
  },

  /**
   * Mirror Hour videos - use time in seed
   */
  mirrorHour: (time: string, date: Date, videoId?: number) => {
    return generateStarfieldSeed({
      contentType: 'mirror-hour',
      scheduledDate: date,
      topic: time,
      videoId,
    });
  },

  /**
   * Transit Alert videos - use planet and sign in seed
   */
  transitAlert: (
    planet: string,
    sign: string,
    date: Date,
    videoId?: number,
  ) => {
    return generateStarfieldSeed({
      contentType: 'transit-alert',
      scheduledDate: date,
      topic: `${planet}-${sign}`,
      videoId,
    });
  },

  /**
   * Spell videos - use spell name in seed
   */
  spell: (spellName: string, date: Date, videoId?: number) => {
    return generateStarfieldSeed({
      contentType: 'spell',
      scheduledDate: date,
      topic: spellName,
      videoId,
    });
  },

  /**
   * App Demo videos - use feature name in seed
   */
  appDemo: (feature: string, date: Date, videoId?: number) => {
    return generateStarfieldSeed({
      contentType: 'app-demo',
      scheduledDate: date,
      topic: feature,
      videoId,
    });
  },
};

/**
 * Verify seeds are unique
 *
 * Run this in development to ensure different videos get different seeds
 */
export function verifySeedUniqueness() {
  const date1 = new Date('2025-02-05');
  const date2 = new Date('2025-02-06');

  const seeds = [
    StarfieldSeeds.witchType('Cosmic Witch', date1),
    StarfieldSeeds.witchType('Kitchen Witch', date1),
    StarfieldSeeds.witchType('Cosmic Witch', date2), // Same witch, different day
    StarfieldSeeds.mirrorHour('11:11', date1),
    StarfieldSeeds.transitAlert('Saturn', 'Aries', date1),
  ];

  const uniqueSeeds = new Set(seeds);

  console.log('Generated seeds:', seeds);
  console.log(`Unique: ${uniqueSeeds.size}/${seeds.length}`);

  return uniqueSeeds.size === seeds.length;
}
