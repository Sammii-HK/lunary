import type { ScriptTopic, ScriptItem } from './narrative-generator';
import type { ThemePalette } from './theme-palette';
import type {
  WeeklyCosmicData,
  PlanetaryHighlight,
  RetrogradeChange,
  MajorAspect,
  MoonPhaseEvent,
} from '../../../utils/blog/weeklyContentGenerator';

export interface TopicImageConfig {
  topic: ScriptTopic['topic'];
  imageUrl: string;
  startTime: number;
  endTime: number;
}

/**
 * Get the next unused item from an array, tracking used indices
 */
function getNextUnusedItem<T>(array: T[], usedIndices: Set<number>): T | null {
  for (let i = 0; i < array.length; i++) {
    if (!usedIndices.has(i)) {
      usedIndices.add(i);
      return array[i];
    }
  }
  return null;
}

/**
 * Generate image URLs for each topic/item in a long-form video
 * Handles both topic-based and item-based segments
 * For item-based segments, matches specific items from weeklyData
 */
export async function generateTopicImages(
  topics: ScriptTopic[] | ScriptItem[],
  weeklyData: WeeklyCosmicData,
  baseUrl: string,
  format: 'story' | 'square' | 'landscape' | 'youtube' = 'youtube',
  options?: {
    palette?: ThemePalette;
    introBg?: string;
    lockIntroHue?: boolean;
  },
): Promise<TopicImageConfig[]> {
  const images: TopicImageConfig[] = [];

  // Track which items have been used from each array to ensure uniqueness
  const usedIndices = {
    planetaryHighlights: new Set<number>(),
    aspects: new Set<number>(),
    retrogrades: new Set<number>(),
    moonPhases: new Set<number>(),
  };

  // Track used image titles/subtitles to prevent duplicates
  const usedImageKeys = new Set<string>();

  // Calculate week offset once for all images (based on weeklyData.weekStart)
  // This ensures all images show the correct date range
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekStartDate = new Date(weeklyData.weekStart);
  weekStartDate.setHours(0, 0, 0, 0);

  // Calculate the Monday of the current week for comparison
  const currentDayOfWeek = now.getDay();
  const daysToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const currentWeekMonday = new Date(now);
  currentWeekMonday.setDate(now.getDate() - daysToCurrentMonday);

  // Calculate weeks difference
  const weeksDiff = Math.round(
    (weekStartDate.getTime() - currentWeekMonday.getTime()) /
      (1000 * 60 * 60 * 24 * 7),
  );
  const weekOffset = weeksDiff;

  const buildPaletteParams = (overrideBg?: string, lockHue?: boolean) => {
    if (!options?.palette && !overrideBg) {
      return '';
    }
    const bg = overrideBg || options?.palette?.background;
    const fg = options?.palette?.foreground;
    const accent = options?.palette?.accent;
    const highlight = options?.palette?.highlight;
    const params = new URLSearchParams();
    if (bg) params.set('bg', bg);
    if (fg) params.set('fg', fg);
    if (accent) params.set('accent', accent);
    if (highlight) params.set('highlight', highlight);
    if (lockHue) params.set('lockHue', '1');
    const built = params.toString();
    return built ? `&${built}` : '';
  };

  for (const topic of topics) {
    let imageUrl: string;
    let imageKey: string;

    switch (topic.topic) {
      case 'intro':
        imageKey = `intro-${weeklyData.title}`;
        // For intro slide: swap title and subtitle format
        // Title becomes "Week of [date], [year]" and subtitle becomes the event name
        const weekOf = weeklyData.weekStart.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
        const year = weeklyData.weekStart.getFullYear();
        const introTitle = `Week of ${weekOf}, ${year}`;
        const introSubtitle = weeklyData.subtitle || '';

        // Log for debugging
        console.log(
          `[Intro Image] Week: ${weeklyData.weekStart.toISOString()}, Title: ${introTitle}, Subtitle: ${introSubtitle}, weekOffset: ${weekOffset}`,
        );

        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(introTitle)}&subtitle=${encodeURIComponent(introSubtitle)}&week=${weekOffset}${buildPaletteParams(
          options?.introBg,
          options?.lockIntroHue,
        )}`;
        break;
      case 'planetary_highlights': {
        let planet: PlanetaryHighlight | null = null;
        let planetTitle: string;
        let subtitle: string;

        // Use exact planet reference if available (CRITICAL: this ensures image matches script)
        if ('exactPlanet' in topic && topic.exactPlanet) {
          planet = topic.exactPlanet;
        }
        // Fallback: try to match from item string (for backwards compatibility)
        else if ('item' in topic && topic.item) {
          const itemParts = topic.item.split('-');
          if (itemParts[0] === 'planet' && itemParts.length >= 2) {
            const planetName = itemParts[1];
            const eventType = itemParts[2];
            planet =
              weeklyData.planetaryHighlights.find(
                (p) =>
                  p.planet.toLowerCase() === planetName.toLowerCase() &&
                  (eventType ? p.event === eventType : true),
              ) || null;
          }
        }

        // Only use "next unused" as last resort if no exact match
        // But first, try to extract from segment text directly
        if (!planet && topic.text) {
          // Try to find planet mentioned in text
          const planets = [
            'Sun',
            'Moon',
            'Mercury',
            'Venus',
            'Mars',
            'Jupiter',
            'Saturn',
            'Uranus',
            'Neptune',
            'Pluto',
          ];
          const lowerText = topic.text.toLowerCase();
          for (const p of planets) {
            if (lowerText.includes(p.toLowerCase())) {
              // Try to find matching planet in weeklyData
              planet =
                weeklyData.planetaryHighlights.find(
                  (h) => h.planet.toLowerCase() === p.toLowerCase(),
                ) || null;
              if (planet) break;
            }
          }
        }

        // Last resort: next unused
        if (!planet) {
          planet = getNextUnusedItem<PlanetaryHighlight>(
            weeklyData.planetaryHighlights,
            usedIndices.planetaryHighlights,
          );
        }

        if (planet) {
          if (planet.event === 'enters-sign' && planet.details?.toSign) {
            planetTitle = `${planet.planet} enters ${planet.details.toSign}`;
          } else if (planet.event === 'goes-retrograde') {
            planetTitle = `${planet.planet} Stations Retrograde`;
          } else if (planet.event === 'goes-direct') {
            planetTitle = `${planet.planet} Goes Direct`;
          } else if (planet.event === 'major-aspect') {
            planetTitle = `${planet.planet} Major Aspect`;
          } else {
            planetTitle = `${planet.planet} ${planet.event}`;
          }
          subtitle = 'Major planetary movements this week';
        } else {
          // All planets used, create unique title from topic text
          const words = topic.text.split(/\s+/).slice(0, 5).join(' ');
          planetTitle =
            words.length > 30 ? words.substring(0, 30) + '...' : words;
          subtitle = 'Planetary highlights';
        }

        imageKey = `planetary-${planetTitle}`;
        // Check if this exact image was already used
        if (usedImageKeys.has(imageKey)) {
          // Add a unique suffix
          imageKey = `planetary-${planetTitle}-${usedIndices.planetaryHighlights.size}`;
        }
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(planetTitle)}&subtitle=${encodeURIComponent(subtitle)}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      }
      case 'retrogrades': {
        let retrograde: RetrogradeChange | null = null;
        let retroTitle: string;
        let subtitle: string;

        // If item is specified, try to match it to a specific retrograde
        if ('item' in topic && topic.item) {
          const itemParts = topic.item.split('-');
          if (itemParts[0] === 'retrograde' && itemParts.length >= 3) {
            const planetName = itemParts[1];
            const actionType = itemParts[2];
            // Find matching retrograde in weeklyData
            retrograde =
              weeklyData.retrogradeChanges.find(
                (r) =>
                  r.planet.toLowerCase() === planetName.toLowerCase() &&
                  (actionType ? r.action === actionType : true),
              ) || null;
          }
        }

        // If no match from item, get next unused retrograde
        if (!retrograde) {
          retrograde = getNextUnusedItem<RetrogradeChange>(
            weeklyData.retrogradeChanges,
            usedIndices.retrogrades,
          );
        }

        if (retrograde) {
          retroTitle = `${retrograde.planet} ${retrograde.action === 'begins' ? 'Stations Retrograde' : 'Goes Direct'}`;
          subtitle = 'Retrograde insights';
        } else {
          // All retrogrades used, create unique title
          const words = topic.text.split(/\s+/).slice(0, 5).join(' ');
          retroTitle =
            words.length > 30 ? words.substring(0, 30) + '...' : words;
          subtitle = 'Retrograde activity';
        }

        imageKey = `retrograde-${retroTitle}`;
        if (usedImageKeys.has(imageKey)) {
          imageKey = `retrograde-${retroTitle}-${usedIndices.retrogrades.size}`;
        }
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(retroTitle)}&subtitle=${encodeURIComponent(subtitle)}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      }
      case 'aspects': {
        let aspect: MajorAspect | null = null;
        let aspectTitle: string;
        let subtitle: string;

        // Use exact aspect reference if available (CRITICAL: this ensures image matches script)
        if ('exactAspect' in topic && topic.exactAspect) {
          aspect = topic.exactAspect;
        }
        // Fallback: try to match from item string (for backwards compatibility)
        else if ('item' in topic && topic.item) {
          const itemParts = topic.item.split('-');
          if (itemParts[0] === 'aspect' && itemParts.length >= 4) {
            const planetA = itemParts[1];
            const aspectType = itemParts[2];
            const planetB = itemParts[3];
            aspect =
              weeklyData.majorAspects.find(
                (a) =>
                  a.planetA.toLowerCase() === planetA.toLowerCase() &&
                  a.planetB.toLowerCase() === planetB.toLowerCase() &&
                  a.aspect.toLowerCase() === aspectType.toLowerCase(),
              ) || null;
          }
        }

        // Only use "next unused" as last resort if no exact match
        // But first, try to extract from segment text directly
        if (!aspect && topic.text) {
          const lowerText = topic.text.toLowerCase();
          const planets = [
            'sun',
            'moon',
            'mercury',
            'venus',
            'mars',
            'jupiter',
            'saturn',
            'uranus',
            'neptune',
            'pluto',
          ];
          const aspects = [
            'conjunction',
            'conjunct',
            'trine',
            'square',
            'opposition',
            'opposite',
            'sextile',
          ];

          // Try to find aspect mentioned in text
          for (const aspectType of aspects) {
            if (lowerText.includes(aspectType)) {
              // Find planets mentioned around the aspect
              const aspectIndex = lowerText.indexOf(aspectType);
              const beforeAspect = lowerText.substring(
                Math.max(0, aspectIndex - 50),
                aspectIndex,
              );
              const afterAspect = lowerText.substring(
                aspectIndex,
                Math.min(lowerText.length, aspectIndex + 50),
              );

              for (const planetA of planets) {
                if (beforeAspect.includes(planetA)) {
                  for (const planetB of planets) {
                    if (planetB !== planetA && afterAspect.includes(planetB)) {
                      let normalizedAspect = aspectType;
                      if (aspectType === 'conjunct')
                        normalizedAspect = 'conjunction';
                      if (aspectType === 'opposite')
                        normalizedAspect = 'opposition';

                      aspect =
                        weeklyData.majorAspects.find(
                          (a) =>
                            a.planetA.toLowerCase() === planetA &&
                            a.planetB.toLowerCase() === planetB &&
                            a.aspect.toLowerCase() === normalizedAspect,
                        ) || null;
                      if (aspect) break;

                      // Try reverse
                      aspect =
                        weeklyData.majorAspects.find(
                          (a) =>
                            a.planetA.toLowerCase() === planetB &&
                            a.planetB.toLowerCase() === planetA &&
                            a.aspect.toLowerCase() === normalizedAspect,
                        ) || null;
                      if (aspect) break;
                    }
                  }
                  if (aspect) break;
                }
              }
              if (aspect) break;
            }
          }
        }

        // Last resort: next unused
        if (!aspect) {
          aspect = getNextUnusedItem<MajorAspect>(
            weeklyData.majorAspects,
            usedIndices.aspects,
          );
        }

        if (aspect) {
          aspectTitle = `${aspect.planetA} ${aspect.aspect} ${aspect.planetB}`;
          subtitle = 'Cosmic alignments';
        } else {
          // All aspects used, create unique title
          const words = topic.text.split(/\s+/).slice(0, 5).join(' ');
          aspectTitle =
            words.length > 30 ? words.substring(0, 30) + '...' : words;
          subtitle = 'Major aspects';
        }

        imageKey = `aspect-${aspectTitle}`;
        if (usedImageKeys.has(imageKey)) {
          imageKey = `aspect-${aspectTitle}-${usedIndices.aspects.size}`;
        }
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(aspectTitle)}&subtitle=${encodeURIComponent(subtitle)}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      }
      case 'moon_phases': {
        let moonPhase: MoonPhaseEvent | null = null;
        let moonTitle: string;
        let subtitle: string;

        // Use exact moon phase reference if available (CRITICAL: this ensures image matches script)
        if ('exactMoonPhase' in topic && topic.exactMoonPhase) {
          moonPhase = topic.exactMoonPhase;
        }
        // Fallback: try to match from item string (for backwards compatibility)
        else if ('item' in topic && topic.item) {
          const itemParts = topic.item.split('-');
          if (itemParts[0] === 'moon' && itemParts.length >= 3) {
            const phaseName = itemParts[1];
            const signName = itemParts[2];
            moonPhase =
              weeklyData.moonPhases.find(
                (m) =>
                  m.phase.toLowerCase().includes(phaseName.toLowerCase()) &&
                  m.sign.toLowerCase() === signName.toLowerCase(),
              ) || null;
          }
        }

        // Only use "next unused" as last resort if no exact match
        // But first, try to extract from segment text directly
        if (!moonPhase && topic.text) {
          const lowerText = topic.text.toLowerCase();
          const moonPhases = [
            'new moon',
            'waxing crescent',
            'first quarter',
            'waxing gibbous',
            'full moon',
            'waning gibbous',
            'last quarter',
            'waning crescent',
          ];
          const signs = [
            'aries',
            'taurus',
            'gemini',
            'cancer',
            'leo',
            'virgo',
            'libra',
            'scorpio',
            'sagittarius',
            'capricorn',
            'aquarius',
            'pisces',
          ];

          // Try to find moon phase mentioned in text
          for (const phase of moonPhases) {
            if (lowerText.includes(phase)) {
              const phaseIndex = lowerText.indexOf(phase);
              const inIndex = lowerText.indexOf(' in ', phaseIndex);

              if (inIndex > phaseIndex && inIndex - phaseIndex < 30) {
                // Try to find sign
                for (const sign of signs) {
                  const signIndex = lowerText.indexOf(sign, inIndex);
                  if (signIndex > inIndex && signIndex - inIndex < 20) {
                    moonPhase =
                      weeklyData.moonPhases.find(
                        (m) =>
                          m.phase.toLowerCase() === phase &&
                          m.sign.toLowerCase() === sign,
                      ) || null;
                    if (moonPhase) break;
                  }
                }
              }

              // If no sign match, try just phase
              if (!moonPhase) {
                moonPhase =
                  weeklyData.moonPhases.find(
                    (m) => m.phase.toLowerCase() === phase,
                  ) || null;
              }

              if (moonPhase) break;
            }
          }
        }

        // Last resort: next unused
        if (!moonPhase) {
          moonPhase = getNextUnusedItem<MoonPhaseEvent>(
            weeklyData.moonPhases,
            usedIndices.moonPhases,
          );
        }

        // Always set title and subtitle - ensure moon phase image is always created
        if (moonPhase && moonPhase.phase) {
          moonTitle = moonPhase.phase;
          // Include zodiac sign in subtitle if available
          subtitle = moonPhase.sign ? `in ${moonPhase.sign}` : 'Moon phases';
        } else {
          // No moon phase found - use "No Major Changes"
          moonTitle = 'No Major Changes';
          subtitle = 'Moon phases';
        }

        // Ensure values are set (defensive programming)
        moonTitle = moonTitle || 'No Major Changes';
        subtitle = subtitle || 'Moon phases';

        imageKey = `moon-${moonTitle}`;
        if (usedImageKeys.has(imageKey)) {
          imageKey = `moon-${moonTitle}-${usedIndices.moonPhases.size}`;
        }
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(moonTitle)}&subtitle=${encodeURIComponent(subtitle)}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      }
      case 'seasonal_events': {
        // Solstices, equinoxes, and cross-quarter days
        let eventTitle = 'Seasonal Event';
        let eventSubtitle = 'Cosmic Alignment';

        // Check if topic has exactSeasonalEvent (ScriptItem type)
        const seasonalEventRef =
          'exactSeasonalEvent' in topic ? topic.exactSeasonalEvent : undefined;

        if (seasonalEventRef) {
          eventTitle = seasonalEventRef.name;
          // Set subtitle based on event type
          if (seasonalEventRef.type === 'solstice') {
            eventSubtitle = seasonalEventRef.name
              .toLowerCase()
              .includes('winter')
              ? 'Shortest Day of the Year'
              : 'Longest Day of the Year';
          } else if (seasonalEventRef.type === 'equinox') {
            eventSubtitle = 'Day and Night in Balance';
          } else {
            eventSubtitle = 'Sacred Time';
          }
        } else if (
          weeklyData.seasonalEvents &&
          weeklyData.seasonalEvents.length > 0
        ) {
          const event = weeklyData.seasonalEvents[0];
          eventTitle = event.name;
          eventSubtitle = event.significance || 'Cosmic Alignment';
        }

        imageKey = `seasonal-${eventTitle}`;
        if (usedImageKeys.has(imageKey)) {
          imageKey = `seasonal-${eventTitle}-${images.filter((i) => i.topic === 'seasonal_events').length}`;
        }
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(eventTitle)}&subtitle=${encodeURIComponent(eventSubtitle)}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      }
      case 'best_days':
        imageKey = 'best-days';
        if (usedImageKeys.has(imageKey)) {
          imageKey = `best-days-${images.filter((i) => i.topic === 'best_days').length}`;
        }
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent('Best Days This Week')}&subtitle=${encodeURIComponent('Optimal timing for your activities')}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      case 'conclusion': {
        // Use engaging conclusion titles (same as long form)
        const conclusionTitles = [
          'Thank You',
          'Follow the Stars',
          'Let the Planets Guide You',
          'Until Next Week',
          'Stay Aligned',
          'Cosmic Blessings',
        ];
        // Use a consistent title based on week to ensure caching works
        const titleIndex =
          weeklyData.weekStart.getTime() % conclusionTitles.length;
        const conclusionTitle = conclusionTitles[titleIndex];

        imageKey = 'conclusion';
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(conclusionTitle)}&week=${weekOffset}${buildPaletteParams()}`;
        break;
      }
      default:
        // Fallback for unknown topics
        imageKey = `topic-${topic.topic}-${images.length}`;
        const words = topic.text.split(/\s+/).slice(0, 5).join(' ');
        const title =
          words.length > 30 ? words.substring(0, 30) + '...' : words;
        imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Cosmic insights')}&week=${weekOffset}${buildPaletteParams()}`;
    }

    // Mark this image key as used
    usedImageKeys.add(imageKey);

    // Ensure moon phase images are always created (safeguard)
    if (topic.topic === 'moon_phases' && !imageUrl) {
      console.warn('⚠️ Moon phase image URL not set, creating fallback image');
      imageUrl = `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent('No Major Changes')}&subtitle=${encodeURIComponent('Moon phases')}&week=${weekOffset}${buildPaletteParams()}`;
      imageKey = 'moon-fallback';
    }

    images.push({
      topic: topic.topic,
      imageUrl,
      startTime: topic.startTime,
      endTime: topic.endTime,
    });
  }

  console.log(
    `✅ Generated ${images.length} unique topic images (used ${usedIndices.planetaryHighlights.size} planetary highlights, ${usedIndices.aspects.size} aspects, ${usedIndices.retrogrades.size} retrogrades, ${usedIndices.moonPhases.size} moon phases)`,
  );

  return images;
}
