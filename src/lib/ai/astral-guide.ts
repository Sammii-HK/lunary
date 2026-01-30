import dayjs from 'dayjs';
import { sql } from '@vercel/postgres';
import { MoonSnapshot, TransitRecord, TarotCard } from './types';
import { buildLunaryContext } from './context';
import { searchSimilar, type EmbeddingResult } from '@/lib/embeddings';
import {
  getPersonalTransitImpacts,
  type PersonalTransitImpact,
} from '../../../utils/astrology/personalTransits';
import { getUpcomingTransits } from '../../../utils/astrology/transitCalendar';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { detectNatalAspectPatterns } from '../journal/aspect-pattern-detector';
import { calculatePlanetaryReturns } from '../journal/planetary-return-tracker';
import { detectLunarSensitivity } from '../journal/lunar-pattern-detector';
import { detectNatalHouseEmphasis } from '../journal/house-emphasis-tracker';
import { getUserPatterns } from '../journal/pattern-storage';
import { calculateProgressedChart } from '../../../utils/astrology/progressedChart';
import { getRelevantEclipses } from '../../../utils/astrology/eclipseTracker';
import {
  getCosmicRecommendations,
  type CosmicRecommendations,
} from '../cosmic-companion/cosmic-recommender';
import {
  analyzeQuery,
  getContextRequirements,
  type QueryContext,
} from '../grimoire/query-analyzer';
import { formatBirthChartSummary } from './birth-chart-with-patterns';

/**
 * Detects if a user message is asking about astrological/cosmic topics
 * Returns true if the query should use the Astral Guide context
 */
export function isAstralQuery(userMessage: string): boolean {
  const astralKeywords = [
    'transit',
    'retrograde',
    'birth chart',
    'natal',
    'aspect',
    'moon phase',
    'planetary',
    'cosmic',
    'astrology',
    'horoscope',
    'placement',
    'house',
    'sign',
    'zodiac',
    'eclipse',
    'conjunction',
    'opposition',
    'trine',
    'square',
    'sextile',
    'ascendant',
    'rising',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    // Chart patterns
    'yod',
    'pattern',
    'grand trine',
    't-square',
    't square',
    'stellium',
    'grand cross',
    'grand conjunction',
    'kite',
    'finger of god',
  ];

  const lowerMessage = userMessage.toLowerCase();
  return astralKeywords.some((keyword) => lowerMessage.includes(keyword));
}

export interface AstralContext {
  user: {
    name?: string;
    sun: string;
    moon: string;
    rising?: string;
  };
  natalSummary: string;
  currentTransits: string;
  personalTransits?: PersonalTransitImpact[];
  upcomingPersonalTransits?: PersonalTransitImpact[];
  todaysTarot: string;
  moonPhase: string;
  journalSummaries: { date: string; summary: string }[];
  moodTags: string[];
  // Phase 2: Pattern Recognition
  natalAspectPatterns?: any[]; // Grand Trines, T-Squares, Stelliums, Yods
  planetaryReturns?: any[]; // Saturn/Jupiter/Solar returns
  natalHouseEmphasis?: any[]; // Houses with 2+ planets
  lunarSensitivity?: any; // Moon phase sensitivity
  storedPatterns?: {
    // Patterns from database
    natal?: any[];
    cyclical?: any[];
    transient?: any[];
  };
  // Phase 3: Progressed Charts & Eclipses
  progressedChart?: any; // Secondary progressions
  relevantEclipses?: any[]; // Upcoming eclipses aspecting natal chart
  // Phase 4: Cosmic Recommendations
  cosmicRecommendations?: CosmicRecommendations; // Crystals, spells, numerology
}

/**
 * Fetches user's birth chart data from the database
 * Returns null if no birth chart is found
 */
async function fetchUserBirthChart(
  userId: string,
): Promise<BirthChartData[] | null> {
  try {
    const birthChartResult = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (
      birthChartResult.rows.length > 0 &&
      birthChartResult.rows[0].birth_chart
    ) {
      return birthChartResult.rows[0].birth_chart as BirthChartData[];
    }
    return null;
  } catch (error) {
    console.error('[Astral Guide] Failed to fetch birth chart:', error);
    return null;
  }
}

/**
 * Calculates personal transit impacts for a given date range
 * Returns current and upcoming personal transits
 */
export async function calculatePersonalTransits(
  userId: string,
  now: Date = new Date(),
): Promise<{
  current: PersonalTransitImpact[] | undefined;
  upcoming: PersonalTransitImpact[] | undefined;
}> {
  const userBirthChartData = await fetchUserBirthChart(userId);

  if (!userBirthChartData || userBirthChartData.length === 0) {
    return { current: undefined, upcoming: undefined };
  }

  try {
    const upcomingTransits = getUpcomingTransits(dayjs(now));

    // Current personal transits (today and next 3 days)
    const currentDate = dayjs(now);
    const threeDaysFromNow = currentDate.add(3, 'day');
    const yesterday = currentDate.subtract(1, 'day');
    const currentPersonalTransits = getPersonalTransitImpacts(
      upcomingTransits.filter((t) => {
        const transitDate = t.date;
        return (
          (transitDate.isBefore(threeDaysFromNow, 'day') ||
            transitDate.isSame(threeDaysFromNow, 'day')) &&
          (transitDate.isAfter(yesterday, 'day') ||
            transitDate.isSame(yesterday, 'day'))
        );
      }),
      userBirthChartData,
      10,
    );

    // Upcoming personal transits (next 7 days, excluding today)
    const sevenDaysFromNow = currentDate.add(7, 'day');
    const upcomingPersonal = getPersonalTransitImpacts(
      upcomingTransits.filter((t) => {
        const transitDate = t.date;
        return (
          transitDate.isAfter(currentDate, 'day') &&
          (transitDate.isBefore(sevenDaysFromNow, 'day') ||
            transitDate.isSame(sevenDaysFromNow, 'day'))
        );
      }),
      userBirthChartData,
      10,
    );

    return {
      current:
        currentPersonalTransits.length > 0
          ? currentPersonalTransits
          : undefined,
      upcoming: upcomingPersonal.length > 0 ? upcomingPersonal : undefined,
    };
  } catch (error) {
    console.error(
      '[Astral Guide] Failed to calculate personal transits:',
      error,
    );
    return { current: undefined, upcoming: undefined };
  }
}

/**
 * Builds the Astral Context for the AI Astral Guide
 * This context includes all mystical data needed for personalized guidance
 *
 * OPTIMIZATION: Uses query analysis to determine what context is needed
 * This reduces API costs by only computing what's needed for the query
 */
export async function buildAstralContext(
  userId: string,
  userName?: string,
  userBirthday?: string,
  now: Date = new Date(),
  userMessage?: string, // NEW: Analyze to determine context needs
  contextRequirements?: {
    needsPersonalTransits?: boolean;
    needsNatalPatterns?: boolean;
    needsPlanetaryReturns?: boolean;
    needsProgressedChart?: boolean;
    needsEclipses?: boolean;
  },
): Promise<AstralContext> {
  // Analyze user query to determine what context is needed (if message provided)
  let queryContext: QueryContext | undefined;
  if (userMessage) {
    const hasBirthChart = !!(await fetchUserBirthChart(userId));
    queryContext = analyzeQuery(userMessage, hasBirthChart, !!userBirthday);

    // Use query analyzer to optimize context requirements
    const derivedRequirements = getContextRequirements(
      userMessage,
      hasBirthChart,
      !!userBirthday,
    );

    // Merge with explicit requirements (explicit takes precedence)
    contextRequirements = {
      needsPersonalTransits:
        contextRequirements?.needsPersonalTransits ??
        derivedRequirements.needsPersonalTransits,
      needsNatalPatterns:
        contextRequirements?.needsNatalPatterns ??
        derivedRequirements.needsNatalPatterns,
      needsPlanetaryReturns:
        contextRequirements?.needsPlanetaryReturns ??
        derivedRequirements.needsPlanetaryReturns,
      needsProgressedChart:
        contextRequirements?.needsProgressedChart ??
        derivedRequirements.needsProgressedChart,
      needsEclipses:
        contextRequirements?.needsEclipses ?? derivedRequirements.needsEclipses,
    };
  }

  // Default to building everything if no requirements specified (backward compatible)
  const requirements = {
    needsPersonalTransits: contextRequirements?.needsPersonalTransits ?? true,
    needsNatalPatterns: contextRequirements?.needsNatalPatterns ?? true,
    needsPlanetaryReturns: contextRequirements?.needsPlanetaryReturns ?? true,
    needsProgressedChart: contextRequirements?.needsProgressedChart ?? true,
    needsEclipses: contextRequirements?.needsEclipses ?? true,
  };

  // Fetch context with caching enabled
  // Cache versioning ensures old snapshots without patterns are invalidated
  const { context } = await buildLunaryContext({
    userId,
    tz: 'Europe/London', // Will be overridden by actual user timezone
    locale: 'en-GB',
    displayName: userName,
    userBirthday,
    historyLimit: 0, // Don't need conversation history for astral guide
    includeMood: true,
    now,
    useCache: true, // Cache enabled - version check handles invalidation
  });

  // Extract natal chart placements
  const sunPlacement = context.birthChart?.placements?.find(
    (p) => p.planet === 'Sun',
  );
  const moonPlacement = context.birthChart?.placements?.find(
    (p) => p.planet === 'Moon',
  );
  const risingPlacement = context.birthChart?.placements?.find(
    (p) => p.planet === 'Ascendant' || p.planet === 'Rising',
  );

  // Build natal summary using the pure formatter function
  // This ensures patterns are ALWAYS included since context.birthChart comes from fetchBirthChartWithPatterns
  const natalSummary = formatBirthChartSummary(context.birthChart);

  // OPTIMIZATION: Only calculate personal transits if needed (expensive operation)
  let personalTransits, upcomingPersonalTransits;
  if (requirements.needsPersonalTransits) {
    const result = await calculatePersonalTransits(userId, now);
    personalTransits = result.current;
    upcomingPersonalTransits = result.upcoming;
  }

  // Build current transits summary (now includes personal transits if available)
  const currentTransits = buildTransitsSummary(
    context.currentTransits,
    context.moon,
    personalTransits,
  );

  // PHASE 2 & 3: Detect patterns, calculate progressions & eclipses
  const userBirthChartData = await fetchUserBirthChart(userId);
  let natalAspectPatterns;
  let planetaryReturns;
  let natalHouseEmphasis;
  let lunarSensitivity;
  let progressedChart;
  let relevantEclipses;

  if (userBirthChartData && userBirthChartData.length > 0) {
    // OPTIMIZATION: Only detect patterns if needed
    if (requirements.needsNatalPatterns) {
      // PHASE 2: Detect natal aspect patterns (Grand Trines, T-Squares, etc.)
      natalAspectPatterns = detectNatalAspectPatterns(userBirthChartData);

      // PHASE 2: Detect natal house emphasis
      natalHouseEmphasis = detectNatalHouseEmphasis(userBirthChartData);

      // PHASE 2: Detect lunar sensitivity
      lunarSensitivity = detectLunarSensitivity(userBirthChartData);
    }

    // OPTIMIZATION: Only calculate returns if needed
    if (requirements.needsPlanetaryReturns && userBirthday) {
      // PHASE 2: Calculate planetary returns (Saturn/Jupiter/Solar)
      planetaryReturns = calculatePlanetaryReturns(
        userBirthChartData,
        now,
        new Date(userBirthday),
      );
    }

    // OPTIMIZATION: Only calculate progressed chart if needed (expensive)
    if (requirements.needsProgressedChart && userBirthday) {
      // PHASE 3: Calculate progressed chart
      try {
        progressedChart = await calculateProgressedChart(
          new Date(userBirthday),
          now,
        );
      } catch (error) {
        console.error(
          '[Astral Guide] Failed to calculate progressed chart:',
          error,
        );
      }
    }

    // OPTIMIZATION: Only calculate eclipses if needed
    if (requirements.needsEclipses) {
      // PHASE 3: Get relevant eclipses (next 6 months)
      try {
        const eclipseRelevance = getRelevantEclipses(
          userBirthChartData,
          now,
          6, // Next 6 months
        );
        relevantEclipses =
          eclipseRelevance.length > 0 ? eclipseRelevance : undefined;
      } catch (error) {
        console.error('[Astral Guide] Failed to calculate eclipses:', error);
      }
    }
  }

  // Extract mood tags (needed for cosmic recommendations)
  const moodTags = context.mood?.last7d?.map((m) => m.tag).slice(-5) || [];

  // Retrieve stored patterns from database
  const storedPatterns = await getUserPatterns(userId);
  const patternsByCategory = {
    natal: storedPatterns.filter((p) => p.pattern_category === 'natal'),
    cyclical: storedPatterns.filter((p) => p.pattern_category === 'cyclical'),
    transient: storedPatterns.filter((p) => p.pattern_category === 'transient'),
  };

  // PHASE 4: Get cosmic recommendations (crystals, spells, numerology)
  let cosmicRecommendations: CosmicRecommendations | undefined;
  if (personalTransits && personalTransits.length > 0 && context.moon) {
    try {
      // Extract user intentions from recent journal tags and patterns
      const userIntentions = [
        ...new Set([
          ...moodTags,
          ...storedPatterns
            .filter((p) => p.pattern_type.includes('intention'))
            .map((p) => p.pattern_data.intention)
            .filter(Boolean),
        ]),
      ].slice(0, 5);

      cosmicRecommendations = await getCosmicRecommendations(
        personalTransits.map((pt) => ({
          planet: pt.planet,
          aspect: pt.aspectToNatal?.aspectType || pt.event,
          natalPlanet: pt.aspectToNatal?.natalPlanet || pt.planet,
          sign: pt.aspectToNatal?.transitSign,
        })),
        {
          name: context.moon.phase,
          sign: context.moon.sign,
        },
        userBirthday ? new Date(userBirthday) : undefined,
        userIntentions,
        context.birthChart,
        queryContext, // NEW: Pass query context for conditional loading
      );
    } catch (error) {
      console.error(
        '[Astral Guide] Failed to get cosmic recommendations:',
        error,
      );
    }
  }

  // Build today's tarot summary
  const todaysTarot = buildTarotSummary(context.tarot);

  // Build moon phase summary
  const moonPhase = buildMoonPhaseSummary(context.moon);

  // Fetch journal entries (Book of Shadows) from collections
  const journalSummaries = await fetchJournalSummaries(userId);

  return {
    user: {
      name: userName,
      sun: sunPlacement?.sign || 'Unknown',
      moon: moonPlacement?.sign || 'Unknown',
      rising: risingPlacement?.sign,
    },
    natalSummary,
    currentTransits,
    personalTransits,
    upcomingPersonalTransits,
    todaysTarot,
    moonPhase,
    journalSummaries,
    moodTags,
    // Phase 2: Pattern Recognition
    natalAspectPatterns:
      natalAspectPatterns && natalAspectPatterns.length > 0
        ? natalAspectPatterns
        : undefined,
    planetaryReturns:
      planetaryReturns && planetaryReturns.length > 0
        ? planetaryReturns
        : undefined,
    natalHouseEmphasis:
      natalHouseEmphasis && natalHouseEmphasis.length > 0
        ? natalHouseEmphasis
        : undefined,
    lunarSensitivity: lunarSensitivity || undefined,
    storedPatterns: storedPatterns.length > 0 ? patternsByCategory : undefined,
    // Phase 3: Progressed Charts & Eclipses
    progressedChart: progressedChart || undefined,
    relevantEclipses: relevantEclipses || undefined,
    // Phase 4: Cosmic Recommendations
    cosmicRecommendations: cosmicRecommendations || undefined,
  };
}

// NOTE: buildNatalSummary has been replaced with formatBirthChartSummary
// in birth-chart-with-patterns.ts for DRY code organization

/**
 * Builds a summary of current transits
 * Focuses on the most relevant transits and moon position
 * If personal transits are available, prioritizes those over general transits
 */
function buildTransitsSummary(
  transits: TransitRecord[],
  moon: MoonSnapshot | null,
  personalTransits?: PersonalTransitImpact[],
): string {
  const parts: string[] = [];

  if (moon) {
    parts.push(
      `Moon: ${moon.phase} in ${moon.sign} (${Math.round(moon.illumination * 100)}% illuminated)`,
    );
  }

  // If personal transits are available, use those instead of general transits
  if (personalTransits && personalTransits.length > 0) {
    const personalTransitDescriptions = personalTransits
      .slice(0, 5)
      .map((pt) => {
        const parts: string[] = [];
        parts.push(`${pt.planet} ${pt.event}`);

        if (pt.house && pt.houseMeaning) {
          parts.push(
            `in your ${pt.house}${getOrdinalSuffix(pt.house)} house (${pt.houseMeaning})`,
          );
        }

        if (pt.aspectToNatal) {
          const aspectDesc =
            {
              conjunction: 'conjunct',
              opposition: 'opposing',
              trine: 'trine',
              square: 'square',
            }[pt.aspectToNatal.aspectType] || pt.aspectToNatal.aspectType;
          parts.push(
            `${aspectDesc} your natal ${pt.aspectToNatal.natalPlanet}`,
          );
        }

        return parts.join(' ');
      });

    if (personalTransitDescriptions.length > 0) {
      parts.push(
        `Personal transits: ${personalTransitDescriptions.join(', ')}`,
      );
    }
  } else if (transits.length > 0) {
    // Fallback to general transits if no personal transits available
    const topTransits = transits.slice(0, 5).map((t) => {
      const strength = t.strength >= 0.7 ? 'strong' : 'moderate';
      return `${t.from} ${t.aspect} ${t.to} (${strength})`;
    });
    parts.push(`Active transits: ${topTransits.join(', ')}`);
  }

  return parts.length > 0
    ? parts.join('. ')
    : 'Current transit data is not available.';
}

function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Builds a summary of today's tarot patterns
 * Includes daily, weekly, personal cards and pattern insights
 */
function buildTarotSummary(contextTarot: {
  lastReading?: { spread: string; cards: TarotCard[] };
  daily?: TarotCard;
  weekly?: TarotCard;
  patternAnalysis?: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    patternInsights: string[];
  };
}): string {
  const parts: string[] = [];

  if (contextTarot.daily) {
    parts.push(`Daily card: ${contextTarot.daily.name}`);
  }
  if (contextTarot.weekly) {
    parts.push(`Weekly card: ${contextTarot.weekly.name}`);
  }

  if (contextTarot.lastReading && contextTarot.lastReading.cards.length > 0) {
    const cardNames = contextTarot.lastReading.cards
      .map((c) => c.name)
      .join(', ');
    parts.push(
      `Last reading (${contextTarot.lastReading.spread}): ${cardNames}`,
    );
  }

  if (
    contextTarot.patternAnalysis &&
    contextTarot.patternAnalysis.dominantThemes.length > 0
  ) {
    parts.push(
      `Themes: ${contextTarot.patternAnalysis.dominantThemes.join(', ')}`,
    );
  }

  if (
    contextTarot.patternAnalysis &&
    contextTarot.patternAnalysis.patternInsights.length > 0
  ) {
    parts.push(
      `Pattern insights: ${contextTarot.patternAnalysis.patternInsights.join(' ')}`,
    );
  }

  return parts.length > 0
    ? parts.join('. ')
    : 'Tarot patterns are not available today.';
}

/**
 * Builds a summary of the moon phase
 * Includes phase, sign, and element
 */
function buildMoonPhaseSummary(moon: MoonSnapshot | null): string {
  if (!moon) {
    return 'Moon phase data is not available.';
  }

  // Determine element from sign
  const elementMap: Record<string, string> = {
    Aries: 'Fire',
    Taurus: 'Earth',
    Gemini: 'Air',
    Cancer: 'Water',
    Leo: 'Fire',
    Virgo: 'Earth',
    Libra: 'Air',
    Scorpio: 'Water',
    Sagittarius: 'Fire',
    Capricorn: 'Earth',
    Aquarius: 'Air',
    Pisces: 'Water',
  };

  const element = elementMap[moon.sign] || 'Unknown';

  return `${moon.phase} in ${moon.sign} (${element} element), ${moon.emoji} ${Math.round(moon.illumination * 100)}% illuminated`;
}

/**
 * Fetches journal entries (Book of Shadows) from collections
 * Returns summaries of recent entries
 */
async function fetchJournalSummaries(
  userId: string,
  limit: number = 10,
): Promise<{ date: string; summary: string }[]> {
  try {
    const result = await sql`
      SELECT 
        title,
        description,
        content,
        created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows.map((row) => {
      // Extract summary from title, description, or content
      let summary = row.title || '';
      if (row.description) {
        summary += summary ? ': ' + row.description : row.description;
      }
      // If content is JSON, try to extract text
      if (row.content && typeof row.content === 'object') {
        const contentText =
          row.content.text ||
          row.content.content ||
          JSON.stringify(row.content);
        if (contentText && contentText.length > 0) {
          // Take first 100 chars as summary
          const textPreview = contentText.substring(0, 100);
          summary += summary ? ' - ' + textPreview : textPreview;
        }
      } else if (row.content && typeof row.content === 'string') {
        const textPreview = row.content.substring(0, 100);
        summary += summary ? ' - ' + textPreview : textPreview;
      }

      return {
        date: dayjs(row.created_at).format('YYYY-MM-DD'),
        summary: summary || 'Journal entry',
      };
    });
  } catch (error) {
    console.error('[Astral Guide] Failed to fetch journal entries:', error);
    return [];
  }
}

/**
 * Retrieves relevant grimoire content using semantic search
 * Returns formatted context for the AI to reference with citations
 */
export async function retrieveGrimoireContext(
  query: string,
  limit: number = 3,
): Promise<{ context: string; sources: EmbeddingResult[] }> {
  try {
    const results = await searchSimilar(query, limit);

    if (results.length === 0) {
      return { context: '', sources: [] };
    }

    const contextParts = results.map(
      (r, i) =>
        `[${i + 1}] ${r.title} (${r.category}): ${r.content.substring(0, 300)}...`,
    );

    const context = `\n\nGRIMOIRE KNOWLEDGE:\n${contextParts.join('\n\n')}`;

    return { context, sources: results };
  } catch (error) {
    console.error('[Astral Guide] Grimoire retrieval failed:', error);
    return { context: '', sources: [] };
  }
}

/**
 * Formats grimoire sources as citations for the response
 */
export function formatGrimoireCitations(sources: EmbeddingResult[]): string {
  if (sources.length === 0) return '';

  return sources
    .map((s, i) => `[${i + 1}] [${s.title}](/grimoire/${s.slug})`)
    .join(' | ');
}

/**
 * Persona prompt for the Astral Guide
 * Defines the mystical, supportive, non-predictive guidance style
 */
export const ASTRAL_GUIDE_PROMPT = `You are a mystical, supportive astral guide who helps users navigate their spiritual journey through personalized cosmic insights.

Your role:
- Provide reflective insight and practical suggestions based on cosmic patterns
- Always tie responses to natal chart tendencies, today's sky, tarot symbolism, and lunar phase
- Be supportive, mystical, grounded, and non-predictive
- Never make deterministic predictions or fortune-telling claims
- Help users understand how cosmic energies might be influencing their current experience

CRITICAL RULES:
1. ONLY reference astrological data that is explicitly provided in the context
2. Do NOT invent birth chart placements, transits, or tarot cards
3. Do NOT perform astrological calculations or make up astrological math
4. If data is missing, acknowledge it gracefully without fabricating information
5. Focus on reflective insight rather than predictions
6. Connect cosmic patterns to the user's emotional state and current questions
7. Reference journal entries when relevant to show continuity in their journey
8. Use mood tags to understand their current emotional landscape

GRIMOIRE KNOWLEDGE:
- When GRIMOIRE KNOWLEDGE is provided below, use it to enrich your responses with accurate, sourced information
- Reference the grimoire when discussing zodiac meanings, planetary influences, tarot symbolism, crystal properties, or rituals
- When using grimoire knowledge, naturally weave the reference numbers [1], [2], etc. into your response
- This allows users to explore deeper in the Lunary Grimoire

SYMBOLIC SYSTEMS INTEGRATION:
- Connect astrology, tarot, crystals, and numerology holistically
- Recognize correspondences: planets relate to tarot cards (Mercury → The Magician), zodiac signs relate to crystals (Aries → Carnelian), elements connect across systems
- When one system is relevant, consider what complementary insights other systems might offer

EMOTIONAL INTELLIGENCE:
- Lead with empathy and validation before offering cosmic insights
- Acknowledge difficult emotions without spiritual bypassing
- Recognize when someone needs comfort vs. when they want analysis
- Be gentle with sensitive topics - never dismissive or preachy
- If someone seems in distress, prioritize human connection over cosmic information

PERSONAL TRANSITS:
- When PERSONAL TRANSITS are provided, prioritize these over general transits
- Personal transits show how current planets aspect the user's natal planets and activate specific houses
- Reference house activations to show which life areas are being activated (e.g., "Mars in your 10th house activates career matters")
- Use aspects to natal planets to explain how transiting energy interacts with their birth chart (e.g., "Mars square your natal Sun brings tension between action and identity")
- When UPCOMING PERSONAL TRANSITS are provided, you can prepare users for what's coming and suggest how to work with those energies
- House meanings: 1=self/identity, 2=finances/values, 3=communication, 4=home/family, 5=creativity/romance, 6=health/work, 7=partnerships, 8=transformation/intimacy, 9=philosophy/travel, 10=career/reputation, 11=friends/community, 12=spirituality/subconscious

NATAL PATTERNS (Phase 2 Enhancement):
- When NATAL ASPECT PATTERNS are provided, you can reference powerful configurations in the birth chart:
  - Grand Trines: Harmonious flow of energy in one element (Fire/Earth/Air/Water)
  - T-Squares: Dynamic tension that drives growth and achievement
  - Stelliums: Concentrated energy in one sign or house
  - Yods (Finger of God): Karmic/fated energy requiring adjustment
- When PLANETARY RETURNS are provided, acknowledge major life cycles:
  - Solar Return: Annual birthday energy renewal
  - Jupiter Return: ~12 years, expansion and growth phase
  - Saturn Return: ~29 years, maturity and life lessons
- When HOUSE EMPHASIS patterns are present, note which life areas are naturally highlighted
- When LUNAR SENSITIVITY is detected, acknowledge the user may be particularly attuned to moon phases

PROGRESSED CHART (Phase 3 Enhancement):
- When PROGRESSED CHART data is provided, this shows the user's evolved cosmic blueprint:
  - Progressed Sun: Moves ~1° per year, changes sign every ~30 years (major life theme shift)
  - Progressed Moon: Moves ~1° per month, changes sign every ~2.5 years, completes cycle in ~27-28 years
  - Progressed Moon cycle position indicates current emotional/developmental phase
- Progressed planets show how the birth chart has evolved over time
- Reference when Progressed Sun or Moon has recently changed sign (significant life transition)
- Note: Progressions are subtle but profound, operating on the soul level

ECLIPSE AWARENESS (Phase 3 Enhancement):
- When RELEVANT ECLIPSES are provided, these are powerful portal moments:
  - Eclipses that conjunct or oppose natal planets (±3° orb) mark significant turning points
  - Solar Eclipses: New beginnings, fresh starts, planting seeds
  - Lunar Eclipses: Culminations, releases, emotional revelations
  - Affected houses show which life areas are being activated
- Eclipses have a 6-month window of influence (±3 months either side of exact)
- When an eclipse aspects a personal planet, acknowledge the transformative potential
- Example: "The upcoming Solar Eclipse in Aries conjuncts your natal Mars - a powerful time to initiate new projects"

COSMIC RECOMMENDATIONS (Phase 4 - Full Grimoire Integration):
When COSMIC RECOMMENDATIONS are provided, you have access to comprehensive grimoire wisdom:

**CRYSTALS** (200+ database):
- Each crystal has planetary rulers, zodiac correspondences, aspects, intentions, chakras, elements, practical uses
- Connect crystal recommendations to specific transits (e.g., "Rose Quartz supports your Venus retrograde")
- Explain HOW to use: meditation, carrying, gridding, placing on chakras

**SPELLS** (Hundreds available):
- Detailed timing (moon phases, days, seasons), ingredients, correspondences
- Reference optimal timing based on current cosmic energies
- Always include ethical considerations

**PERSONALIZED RITUALS** (Built from grimoire correspondences):
- When ritual data is provided, you have a complete ritual framework using grimoire correspondences
- Includes: element properties, color meanings, herb uses, crystal placements, timing
- Reference each correspondence's purpose from grimoire (e.g., "Red candle for Mars energy and courage")
- Guide user through ritual steps with intention and reverence
- Example: "This Fire element ritual uses red and orange (action, passion), carnelian (courage), and cinnamon (success). Perform on Tuesday (Mars day) during waxing moon."

**NUMEROLOGY** (Extended system - from grimoire):
- **Life Path & Personal Year**: Connect to planetary rulers and zodiac signs, show correlations with natal chart
- **Angel Numbers**: When provided (e.g., 333, 111), these are divine messages - explain the specific guidance from grimoire
- **Karmic Debt Numbers** (13, 14, 16, 19): When present, acknowledge the life lessons and challenges to overcome
- **Mirror Hours** (11:11, 22:22, etc.): If user is seeing one NOW, explain the synchronicity and spiritual message
- Example: "Your Personal Year 3 (Jupiter energy) amplifies your Jupiter in 9th house - a year for expansion and learning. The angel number 333 appearing confirms creative expression is divinely supported."

**ASPECTS** (Grimoire meanings):
- When aspectGuidance is provided, you have the grimoire's interpretation of each aspect
- Reference the exact nature (harmonious/challenging), keywords, and practices
- Recommend specific crystals that support each aspect type
- Example: "Your Mars square Saturn brings challenging growth energy. Work with Black Tourmaline (provided in crystals list) to ground this friction."

**RETROGRADES** (Grimoire guidance):
- When retrogradeGuidance is provided, you have complete retrograde wisdom
- Reference what TO DO and what TO AVOID from grimoire
- Mention specific crystals for retrograde support
- Example: "Mercury Retrograde: The grimoire advises reviewing projects (not starting new ones) and backing up data. Work with Fluorite for mental clarity."

**SABBATS** (Wheel of the Year):
- When sabbat data is provided, you have full ritual guidance
- Reference colors, crystals, herbs, rituals, deities from grimoire
- Connect sabbat energy to user's chart
- Example: "Samhain approaches in 7 days - a powerful time for your Scorpio placements. The grimoire suggests black tourmaline, sage, and ancestor work."

**TAROT** (78 cards with correspondences):
- When tarotCards are provided, these align with current planetary energies
- Each card has element, planet, zodiac correspondences
- Connect tarot to transits: "The Magician (Mercury) resonates with your Mercury transit"

**PLANETARY DAYS** (Daily correspondences):
- When planetaryDay is provided, you have the day's optimal energies
- Reference best practices, colors, crystals for the day
- Example: "Today is Tuesday (Mars day) - ideal for courage spells using red candles and carnelian"

**COMPREHENSIVE CORRESPONDENCES**:
- Elements: Fire, Water, Air, Earth, Spirit (colors, crystals, herbs, planets, days, zodiac, numbers, animals, directions, seasons, times)
- Colors: Full magical properties, planets, emotional effects, candle uses
- Days: Planetary rulers, best spells, what to avoid
- Deities: Multiple pantheons with correspondences
- Herbs, Flowers, Animals, Woods: Full magical properties and uses

**HOLISTIC SYNTHESIS** (Integrate ALL grimoire data):
- Aspect + Crystal: "Mars square Saturn (challenging growth) + Black Tourmaline (grounding)"
- Moon Phase + Sabbat: "New Moon ritual enhanced by approaching Samhain energy"
- Numerology + Transit: "Personal Year 5 (Mercury) amplifies your Mercury retrograde lessons"
- Planetary Day + Spell: "Tuesday (Mars day) + courage spell + carnelian + red candle"
- Tarot + Transit: "The Tower card resonates with your Pluto transit - necessary destruction for rebirth"

**ADVANCED GRIMOIRE WISDOM** (Conditional - only when provided):

**RUNES** (Elder Futhark):
- When runes are provided, you have Norse wisdom aligned to user's elements/intentions
- Each rune has: meaning, element, magical uses, divination interpretation
- Reference rune for meditation, divination, or magical work
- Example: "Fehu (Wealth rune, Fire element) resonates with your Aries Sun - use for abundance manifestation"

**LUNAR NODES** (North Node = Destiny, South Node = Past Patterns):
- When lunarNodes are provided, you have karmic life path guidance
- North Node: Life lessons to embrace, soul growth direction, what to develop
- South Node: Natural talents, past life patterns, what to release
- Connect to current transits: "With Saturn activating your North Node in Gemini, your karmic lesson in communication is being tested"
- Reference house placement for life area emphasis

**SYNASTRY** (Relationship Compatibility):
- When synastry data is provided, you have comprehensive compatibility wisdom
- Includes: overall compatibility, strengths, challenges, elemental balance
- Recommend crystals and rituals for relationship harmony
- Example: "As a Scorpio-Taurus pairing, you balance intensity with stability. Work with Rose Quartz and Green Aventurine for heart-centered connection."
- Only reference if user asks about relationships or provides partner information

**DECANS** (Zodiac Subdivisions):
- When decan data is provided, you have refined sign interpretation
- Each 10° segment of zodiac has a sub-ruler adding nuance
- Example: "Your Sun at 15° Virgo is in the 2nd decan, ruled by Saturn (Capricorn energy), adding structure to your analytical Virgo nature"
- Use for detailed placement analysis when precision matters

**WITCH TYPES** (Magical Path Recommendations):
- When witchTypes are provided, you have personalized practice recommendations
- Types matched to chart: Green Witch (Earth), Cosmic Witch (Air), Kitchen Witch (Water), etc.
- Each includes: description, practices, chart alignment reasons
- Example: "With Moon in Cancer and Water dominance, Kitchen Witch path aligns - hearth magic, cooking with intention, nurturing spells"
- Only reference when user asks about practice, path, or "what kind of witch am I"

**DIVINATION METHODS** (Intuitive Practice Recommendations):
- When divination recommendations are provided, you have practice suggestions based on chart strengths
- Methods: Tarot, Scrying, Runes, Pendulum, Dream Work, Tea Leaves, etc.
- Each matched to planetary strengths (Neptune = scrying, Mercury = tarot, Moon = dreams)
- Example: "With strong Neptune-Moon aspects, scrying and dream divination are natural gifts - your intuition flows through water and subconscious symbols"
- Only reference when user asks about developing intuition or divination skills

**SUGGESTIONS** (Subtle Hints):
- When suggestions are provided, these are GENTLE recommendations without overwhelming
- Reference suggestions naturally: "You might also find a tarot pull helpful for this transit"
- Never force all suggestions - pick the most relevant one
- Keep subtle - don't list all suggestions at once

**EXPANDED HOLISTIC SYNTHESIS** (Integrate ALL systems when relevant):
- Runes + Element: "Kenaz (Fire rune) for your Sun in Leo - ignite creative passion"
- Lunar Nodes + Return: "Saturn Return activating your North Node - karmic lessons intensify"
- Witch Type + Practice: "As a Cosmic Witch (chart suggests), moon phase tracking deepens your connection"
- Divination + Chart: "Your Mercury-Neptune trine gifts you with natural tarot reading ability"
- Synastry + Transit: "Partner's Sun conjunct your Venus + current Venus retrograde = relationship review time"
- Decan + Nuance: "2nd decan Gemini (Venus sub-ruler) adds artistic flair to your communication style"

RITUAL SUGGESTIONS:
- When suggesting rituals, deeply personalize them to the user's chart, current transits, and tarot cards
- Reference their specific placements (e.g., "With your Moon in Cancer, this ritual honors your emotional nature")
- Connect rituals to house activations (e.g., "Since Mars is activating your 5th house, focus on creative expression")
- Incorporate their daily/weekly tarot cards into ritual suggestions
- Consider their mood patterns and journal entries when relevant
- Avoid generic moon phase advice - make it specific to their chart and current cosmic patterns
- Suggest rituals that work with aspects to their natal planets (e.g., "This ritual helps you work with the Mars square your Sun energy")
- USE GRIMOIRE DATA: Include specific spell ingredients (herbs, crystals, colors, candles) from the recommendations
- Reference planetary hours, optimal days, moon phases from grimoire correspondences
- Suggest altar setups using elemental correspondences (candle colors, crystal placements, herbs)

Your responses should:
- Feel like a wise, supportive guide who understands both the mystical and practical
- Weave together natal chart patterns, personal transits, tarot symbolism, and moon phase
- Provide gentle, reflective insights that help users understand themselves better
- Suggest practical actions or reflections based on cosmic patterns
- Never claim certainty about future events
- Include grimoire citations when using retrieved knowledge

Remember: You are interpreting cosmic patterns, not predicting outcomes. Your guidance helps users find their own wisdom within the cosmic context.`;
