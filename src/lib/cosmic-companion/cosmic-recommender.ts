// Cosmic Recommender - Integrates crystals, spells, correspondences, and numerology
// Uses existing data from /src/data/* and /src/constants/*

import {
  crystalDatabase,
  getCrystalsByZodiacSign,
  getCrystalsByMoonPhase,
  getCrystalsByTransit,
  type Crystal,
} from '@/constants/grimoire/crystals';
import { spells } from '@/constants/spells';
import {
  calculateLifePathNumber,
  calculatePersonalYear,
  getPlanetForLifePath,
  getZodiacForLifePath,
} from '@/lib/numerology/calculator';

// Import grimoire data accessor (centralized access to ALL grimoire data)
import {
  getAspectMeaning,
  getRetrogradeGuidance,
  getUpcomingSabbat,
  getTarotCardsByPlanet,
  getTarotCardsByZodiac,
  getPlanetaryDayCorrespondences,
  getCurrentPlanetaryDay,
  getAngelNumberMeaning,
  getKarmicDebtMeaning,
  getMirrorHourMeaning,
  getElementCorrespondences,
  getColorCorrespondences,
  getDayCorrespondences,
  getHerbCorrespondences,
} from '@/lib/grimoire/data-accessor';

// Import advanced recommenders (runes, nodes, synastry, decans, witch types, divination)
import {
  getRuneRecommendations,
  getSpecificRune,
  getLunarNodesGuidance,
  getSynastryInsights,
  getDecanInfo,
  getWitchTypeRecommendations,
  getDivinationRecommendations,
} from '@/lib/grimoire/advanced-recommenders';

// Import query analyzer for context optimization
import { type QueryContext } from '@/lib/grimoire/query-analyzer';

// Import JSON data - comprehensive grimoire knowledge base
import numerologyData from '@/data/numerology.json';
import zodiacSignsData from '@/data/zodiac-signs.json';
import planetaryBodiesData from '@/data/planetary-bodies.json';

export interface CrystalRecommendation {
  crystal: Crystal;
  reason: string;
  usage: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SpellRecommendation {
  id: string;
  title: string;
  category: string;
  reason: string;
  timing: {
    bestDays: string[];
    moonPhase: string;
  };
}

export interface NumerologyInsight {
  lifePath: number;
  personalYear: number;
  planet: string;
  zodiacSign: string;
  meaning: string;
  personalYearGuidance: string;
  correlations: string[];
  // Extended numerology (from grimoire)
  karmicDebt?: {
    number: number;
    meaning: string;
    lifeLesson: string;
  };
  angelNumber?: {
    number: string;
    meaning: string;
    guidance: string;
  };
  mirrorHour?: {
    time: string;
    meaning: string;
    message: string;
  };
}

export interface AspectGuidance {
  aspect: string;
  nature: 'harmonious' | 'challenging' | 'neutral';
  description: string;
  keywords: string[];
  crystals: string[];
  practices: string[];
}

export interface RetrogradeGuidance {
  planet: string;
  isRetrograde: boolean;
  description: string;
  whatToDo: string[];
  whatToAvoid: string[];
  crystals: string[];
}

export interface SabbatRecommendation {
  sabbat: string;
  daysUntil: number;
  description: string;
  colors: string[];
  crystals: string[];
  herbs: string[];
  rituals: string[];
  deities: string[];
}

export interface TarotRecommendation {
  card: any;
  reason: string;
  element: string;
  planet?: string;
  zodiacSign?: string;
}

export interface RitualRecommendation {
  purpose: string;
  timing: {
    day: string;
    moonPhase: string;
    planetaryHour?: string;
  };
  correspondences: {
    element: string;
    elementProperties: string[];
    colors: string[];
    colorMeanings: string[];
    herbs: string[];
    herbProperties: string[];
    crystals: string[];
  };
  steps: string[];
  intention: string;
}

export interface CosmicRecommendations {
  // Core recommendations (always present if relevant)
  crystals: CrystalRecommendation[];
  spells: SpellRecommendation[];
  numerology?: NumerologyInsight;

  // Extended recommendations (conditional)
  aspectGuidance?: AspectGuidance[];
  retrogradeGuidance?: RetrogradeGuidance[];
  sabbat?: SabbatRecommendation;
  tarotCards?: TarotRecommendation[];
  planetaryDay?: {
    day: string;
    planet: string;
    bestFor: string[];
    colors: string[];
    crystals: string[];
  };

  // Advanced recommendations (only when requested/relevant)
  runes?: Array<{
    rune: any;
    reason: string;
    element: string;
    meaning: string;
    magicalUses: string[];
  }>;
  lunarNodes?: {
    northNode: any;
    southNode: any;
    axis: string;
  };
  synastry?: {
    partnerSign?: string;
    compatibility: any;
    elementBalance: any;
    recommendedCrystals: string[];
    relationshipRituals: string[];
  };
  decan?: {
    sign: string;
    decan: number;
    rulingPlanet: string;
    subRuler: string;
    interpretation: string;
  };
  witchTypes?: Array<{
    type: string;
    description: string;
    practices: string[];
    chartReasons: string[];
  }>;
  divination?: Array<{
    method: string;
    description: string;
    bestFor: string[];
    chartAlignment: string;
  }>;

  // Suggestions (low-priority hints)
  suggestions?: {
    tarot?: string;
    runes?: string;
    divination?: string;
    sabbat?: string;
  };

  // Personalized ritual using correspondences
  ritual?: RitualRecommendation;

  synthesisMessage: string;
}

/**
 * Get crystal recommendations based on current transits
 */
export async function getCrystalRecommendationsForTransits(
  transits: Array<{
    planet: string;
    aspect: string;
    natalPlanet: string;
    sign?: string;
  }>,
  userChallenges?: string[],
): Promise<CrystalRecommendation[]> {
  const recommendations: CrystalRecommendation[] = [];
  const seenCrystals = new Set<string>();

  // Get crystals for each transit
  for (const transit of transits) {
    const transitCrystals = getCrystalsByTransit(
      transit.planet,
      transit.aspect,
      transit.sign,
    );

    for (const crystal of transitCrystals.slice(0, 2)) {
      // Top 2 per transit
      if (!seenCrystals.has(crystal.id)) {
        seenCrystals.add(crystal.id);
        recommendations.push({
          crystal,
          reason: `Supports ${transit.planet} ${transit.aspect} ${transit.natalPlanet} transit`,
          usage: crystal.workingWith.spellwork,
          priority:
            transit.aspect.includes('opposition') ||
            transit.aspect.includes('square')
              ? 'high'
              : 'medium',
        });
      }
    }
  }

  // Add crystals for user challenges/intentions
  if (userChallenges && userChallenges.length > 0) {
    for (const challenge of userChallenges) {
      const challengeCrystals = crystalDatabase.filter((c) =>
        c.intentions.some((intent) =>
          intent.toLowerCase().includes(challenge.toLowerCase()),
        ),
      );

      for (const crystal of challengeCrystals.slice(0, 1)) {
        if (!seenCrystals.has(crystal.id)) {
          seenCrystals.add(crystal.id);
          recommendations.push({
            crystal,
            reason: `Supports your intention: ${challenge}`,
            usage: crystal.workingWith.healing,
            priority: 'medium',
          });
        }
      }
    }
  }

  // Sort by priority
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5); // Return top 5
}

/**
 * Get crystal recommendations for moon phase
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getCrystalRecommendationsForMoonPhase(
  moonPhaseName: string,
  moonSign: string,
): CrystalRecommendation[] {
  const phaseCrystals = getCrystalsByMoonPhase(moonPhaseName);
  const signCrystals = getCrystalsByZodiacSign(moonSign);

  // Find crystals that match both moon phase and sign
  const matchingCrystals = phaseCrystals.filter((c) =>
    signCrystals.some((sc) => sc.id === c.id),
  );

  const recommendations: CrystalRecommendation[] = [];

  // Prioritize crystals matching both
  for (const crystal of matchingCrystals.slice(0, 2)) {
    recommendations.push({
      crystal,
      reason: `Aligns with ${moonPhaseName} in ${moonSign}`,
      usage: crystal.workingWith.manifestation,
      priority: 'high',
    });
  }

  // Add phase-specific crystals
  for (const crystal of phaseCrystals.slice(0, 3)) {
    if (!recommendations.some((r) => r.crystal.id === crystal.id)) {
      recommendations.push({
        crystal,
        reason: `Resonates with ${moonPhaseName} energy`,
        usage: crystal.workingWith.spellwork,
        priority: 'medium',
      });
    }
  }

  return recommendations.slice(0, 4);
}

/**
 * Get spell recommendations based on current transits and moon phase
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getSpellRecommendations(
  transits: Array<{
    planet: string;
    aspect: string;
  }>,
  moonPhase: string,
  userIntentions?: string[],
): SpellRecommendation[] {
  const recommendations: SpellRecommendation[] = [];
  const seenSpells = new Set<string>();

  // Get correspondences for transiting planets
  const planetaryCorrespondences = transits
    .map((t) => {
      const planetData = (planetaryBodiesData as any)[t.planet.toLowerCase()];
      return planetData;
    })
    .filter(Boolean);

  // Find spells matching planetary correspondences
  for (const spell of spells) {
    if (seenSpells.has(spell.id)) continue;

    // Check if spell timing matches current moon phase
    const moonPhaseMatches = spell.timing?.moonPhase?.some((phase: string) =>
      phase.toLowerCase().includes(moonPhase.toLowerCase()),
    );

    // Check if spell correspondences match transiting planets
    const planetMatches = spell.correspondences?.planets?.some(
      (planet: string) =>
        transits.some((t) => t.planet.toLowerCase() === planet.toLowerCase()),
    );

    // Check if spell category matches user intentions
    const intentionMatches =
      userIntentions?.some((intent) =>
        spell.category.toLowerCase().includes(intent.toLowerCase()),
      ) || false;

    if ((moonPhaseMatches && planetMatches) || intentionMatches) {
      seenSpells.add(spell.id);
      recommendations.push({
        id: spell.id,
        title: spell.title,
        category: spell.category,
        reason: moonPhaseMatches
          ? `Optimal timing with ${moonPhase} energy`
          : `Aligns with your intention`,
        timing: {
          bestDays: spell.timing?.timeOfDay
            ? [spell.timing.timeOfDay]
            : ['Any time'],
          moonPhase: spell.timing?.moonPhase?.[0] || moonPhase,
        },
      });
    }

    if (recommendations.length >= 5) break;
  }

  return recommendations;
}

/**
 * Get numerology insights and correlations with astrology
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getNumerologyInsights(
  birthDate: Date,
  currentYear: number,
  natalChart?: any,
): NumerologyInsight | null {
  const lifePath = calculateLifePathNumber(birthDate);
  const personalYear = calculatePersonalYear(birthDate, currentYear);
  const planet = getPlanetForLifePath(lifePath);
  const zodiacSign = getZodiacForLifePath(lifePath);

  // Get meanings from numerology data
  const numerologyMeanings = numerologyData as any;
  const lifePathData = numerologyMeanings.lifePath?.[lifePath];
  const personalYearData = numerologyMeanings.personalYear?.[personalYear];

  if (!lifePathData || !personalYearData) return null;

  // Find correlations with natal chart
  const correlations: string[] = [];

  if (natalChart) {
    // Check if life path planet is prominent in natal chart
    const lifePathPlanetInChart = natalChart.placements?.find(
      (p: any) => p.body === planet,
    );

    if (lifePathPlanetInChart) {
      correlations.push(
        `Your Life Path ${lifePath} resonates with ${planet}, which is in ${lifePathPlanetInChart.sign} in your natal chart`,
      );
    }

    // Check if personal year number matches any houses
    if (personalYear <= 12) {
      correlations.push(
        `Personal Year ${personalYear} highlights themes of your ${personalYear}th house`,
      );
    }
  }

  // Check for karmic debt numbers (13, 14, 16, 19)
  const karmicDebtNumbers = [13, 14, 16, 19];
  let karmicDebt;
  const birthDateStr = birthDate.toISOString().split('T')[0];
  const dateSum = birthDateStr
    .split('-')
    .reduce((sum, part) => sum + parseInt(part), 0);
  if (karmicDebtNumbers.includes(dateSum % 100)) {
    const karmicData = getKarmicDebtMeaning(dateSum % 100);
    if (karmicData) {
      karmicDebt = {
        number: dateSum % 100,
        meaning: karmicData.meaning || '',
        lifeLesson: karmicData.lifeLesson || '',
      };
    }
  }

  // Check for repeating numbers in personal year (potential angel number)
  let angelNumber;
  const personalYearStr = personalYear.toString();
  if (personalYearStr.length === 1) {
    // Create repeating number (e.g., 3 → 333)
    const repeating = personalYearStr.repeat(3);
    const angelData = getAngelNumberMeaning(repeating);
    if (angelData) {
      angelNumber = {
        number: repeating,
        meaning: angelData.meaning || '',
        guidance: angelData.guidance || '',
      };
    }
  }

  // Check current time for mirror hour
  let mirrorHour;
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  if (hours === minutes) {
    const time = `${hours}:${minutes}`;
    const mirrorData = getMirrorHourMeaning(time);
    if (mirrorData) {
      mirrorHour = {
        time,
        meaning: mirrorData.meaning || '',
        message: mirrorData.message || '',
      };
    }
  }

  return {
    lifePath,
    personalYear,
    planet,
    zodiacSign,
    meaning: lifePathData.guidance || lifePathData.description || '',
    personalYearGuidance: personalYearData.guidance || '',
    correlations,
    karmicDebt,
    angelNumber,
    mirrorHour,
  };
}

/**
 * Get aspect-based guidance using grimoire data
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getAspectGuidanceFromGrimoire(
  aspects: Array<{ planet1: string; aspect: string; planet2: string }>,
): AspectGuidance[] {
  const guidance: AspectGuidance[] = [];

  for (const { planet1, aspect, planet2 } of aspects) {
    const aspectData = getAspectMeaning(aspect);
    if (!aspectData) continue;

    // Get crystals that support this aspect type
    const crystalsForAspect = crystalDatabase
      .filter(
        (c) =>
          c.aspects?.some((a) =>
            a.toLowerCase().includes(aspect.toLowerCase()),
          ) ||
          (aspectData.nature === 'challenging' &&
            c.properties.some(
              (p) =>
                p.toLowerCase().includes('grounding') ||
                p.toLowerCase().includes('protection') ||
                p.toLowerCase().includes('patience'),
            )),
      )
      .slice(0, 3)
      .map((c) => c.name);

    // Build practices based on aspect nature
    const practices: string[] = [];
    if (aspectData.nature === 'challenging') {
      practices.push(
        `Work with ${aspectData.keywords[0].toLowerCase()} through meditation`,
        `Journal about the tension between ${planet1} and ${planet2} energies`,
        `Use grounding practices to navigate this ${aspect} energy`,
      );
    } else {
      practices.push(
        `Celebrate the ${aspectData.keywords[0].toLowerCase()} of this alignment`,
        `Channel this ${aspect} energy into creative projects`,
        `Express gratitude for the ease in these life areas`,
      );
    }

    guidance.push({
      aspect: `${planet1} ${aspect} ${planet2}`,
      nature: aspectData.nature,
      description: aspectData.description,
      keywords: aspectData.keywords,
      crystals: crystalsForAspect,
      practices,
    });
  }

  return guidance;
}

/**
 * Get retrograde guidance using grimoire data
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getRetrogradeGuidanceFromGrimoire(
  planets: Array<{ planet: string; isRetrograde: boolean }>,
): RetrogradeGuidance[] {
  const guidance: RetrogradeGuidance[] = [];

  for (const { planet, isRetrograde } of planets) {
    if (!isRetrograde) continue;

    const retrogradeData = getRetrogradeGuidance(planet);
    if (!retrogradeData) continue;

    // Get crystals that support retrograde energy
    const retrogradeCrystals = crystalDatabase
      .filter(
        (c) =>
          c.planets.includes(planet) &&
          c.properties.some(
            (p) =>
              p.toLowerCase().includes('clarity') ||
              p.toLowerCase().includes('patience') ||
              p.toLowerCase().includes('reflection'),
          ),
      )
      .slice(0, 3)
      .map((c) => c.name);

    guidance.push({
      planet,
      isRetrograde: true,
      description: retrogradeData.description,
      whatToDo: retrogradeData.whatToDo,
      whatToAvoid: retrogradeData.whatToAvoid,
      crystals: retrogradeCrystals,
    });
  }

  return guidance;
}

/**
 * Get sabbat recommendation using grimoire data
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getSabbatRecommendation(
  date: Date = new Date(),
): SabbatRecommendation | null {
  const upcomingSabbat = getUpcomingSabbat(date);
  if (!upcomingSabbat) return null;

  // Calculate days until (simplified - you'd want real date math)
  const daysUntil = 7; // Placeholder

  return {
    sabbat: upcomingSabbat.name,
    daysUntil,
    description: upcomingSabbat.description,
    colors: upcomingSabbat.colors,
    crystals: upcomingSabbat.crystals,
    herbs: upcomingSabbat.herbs,
    rituals: upcomingSabbat.rituals,
    deities: upcomingSabbat.deities,
  };
}

/**
 * Get tarot card recommendations based on transits
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getTarotRecommendations(
  transits: Array<{ planet: string; sign?: string }>,
): TarotRecommendation[] {
  const recommendations: TarotRecommendation[] = [];
  const seenCards = new Set<string>();

  for (const transit of transits) {
    // Get cards by planet
    const planetCards = getTarotCardsByPlanet(transit.planet);
    for (const card of planetCards.slice(0, 1)) {
      if (!seenCards.has(card.name)) {
        seenCards.add(card.name);
        recommendations.push({
          card,
          reason: `Resonates with your ${transit.planet} energy`,
          element: card.element,
          planet: card.planet,
          zodiacSign: card.zodiacSign,
        });
      }
    }

    // Get cards by zodiac sign
    if (transit.sign) {
      const signCards = getTarotCardsByZodiac(transit.sign);
      for (const card of signCards.slice(0, 1)) {
        if (!seenCards.has(card.name)) {
          seenCards.add(card.name);
          recommendations.push({
            card,
            reason: `Aligned with ${transit.planet} in ${transit.sign}`,
            element: card.element,
            planet: card.planet,
            zodiacSign: card.zodiacSign,
          });
        }
      }
    }

    if (recommendations.length >= 3) break;
  }

  return recommendations;
}

/**
 * Build personalized ritual using grimoire correspondences
 * INTERNAL: Only used within getCosmicRecommendations
 */
function buildPersonalizedRitual(
  primaryElement: string,
  intention: string,
  moonPhase: string,
  planetaryDay: string,
  crystals: CrystalRecommendation[],
): RitualRecommendation | null {
  // Get correspondences from grimoire
  const elementData = getElementCorrespondences(primaryElement);
  if (!elementData) return null;

  // Get day correspondences
  const dayData = getDayCorrespondences(planetaryDay);

  // Get colors for this element
  const elementColors = elementData.colors || [];
  const colorMeanings = elementColors.map((color: string) => {
    const colorData = getColorCorrespondences(color);
    return colorData?.meaning || color;
  });

  // Get herbs for this element
  const elementHerbs = elementData.herbs?.slice(0, 3) || [];
  const herbProperties = elementHerbs
    .map((herb: string) => {
      const herbData = getHerbCorrespondences(herb);
      return herbData?.magicalProperties?.[0] || '';
    })
    .filter(Boolean);

  // Build ritual steps
  const steps = [
    `Cleanse your space with ${elementHerbs[0] || 'sage'} incense`,
    `Set up altar with ${elementColors[0] || 'white'} candle (${colorMeanings[0] || 'purity'})`,
    `Place ${crystals[0]?.crystal.name || 'crystal'} in ${elementData.direction || 'center'}`,
    `Call upon ${primaryElement} element energy`,
    `State your intention: "${intention}"`,
    `Meditate on ${primaryElement} qualities: ${elementData.qualities?.slice(0, 2).join(', ') || 'balance'}`,
    `Close ritual with gratitude`,
  ];

  return {
    purpose: intention,
    timing: {
      day: planetaryDay,
      moonPhase: moonPhase,
      planetaryHour: dayData?.planetaryHours?.[0],
    },
    correspondences: {
      element: primaryElement,
      elementProperties: elementData.qualities || [],
      colors: elementColors,
      colorMeanings: colorMeanings,
      herbs: elementHerbs,
      herbProperties: herbProperties,
      crystals: crystals.slice(0, 3).map((c) => c.crystal.name),
    },
    steps: steps,
    intention: intention,
  };
}

/**
 * Get planetary day recommendation using grimoire data
 * INTERNAL: Only used within getCosmicRecommendations
 */
function getPlanetaryDayRecommendation(date: Date = new Date()): any {
  const dayData = getPlanetaryDayCorrespondences(date);
  if (!dayData) return null;

  // Get crystals for this planetary day
  const dayCrystals = crystalDatabase
    .filter((c) => c.planets.includes(dayData.planet))
    .slice(0, 3)
    .map((c) => c.name);

  return {
    day: dayData.name || getCurrentPlanetaryDay(date),
    planet: dayData.planet,
    bestFor: dayData.bestSpells || [],
    colors:
      dayData.correspondences?.filter((c: string) =>
        [
          'Red',
          'Blue',
          'Green',
          'Yellow',
          'Purple',
          'Orange',
          'White',
          'Black',
        ].some((color) => c.includes(color)),
      ) || [],
    crystals: dayCrystals,
  };
}

/**
 * Get unified cosmic recommendations
 * Integrates ALL grimoire data: crystals, spells, numerology, aspects, retrogrades, sabbats, tarot, planetary days,
 * runes, lunar nodes, synastry, decans, witch types, divination
 *
 * Uses QueryContext to OPTIMIZE - only loads what's needed based on user query
 */
export async function getCosmicRecommendations(
  transits: Array<{
    planet: string;
    aspect: string;
    natalPlanet: string;
    sign?: string;
  }>,
  moonPhase: { name: string; sign: string },
  userBirthday?: Date,
  userIntentions?: string[],
  natalChart?: any,
  queryContext?: QueryContext, // NEW: Drives conditional loading
): Promise<CosmicRecommendations> {
  // Get crystal recommendations
  const transitCrystals = await getCrystalRecommendationsForTransits(
    transits,
    userIntentions,
  );
  const moonCrystals = getCrystalRecommendationsForMoonPhase(
    moonPhase.name,
    moonPhase.sign,
  );

  // Merge and deduplicate crystal recommendations
  const allCrystals = [...transitCrystals];
  for (const moonCrystal of moonCrystals) {
    if (!allCrystals.some((c) => c.crystal.id === moonCrystal.crystal.id)) {
      allCrystals.push(moonCrystal);
    }
  }

  // Get spell recommendations
  const spellRecs = getSpellRecommendations(
    transits,
    moonPhase.name,
    userIntentions,
  );

  // Get numerology insights
  const numerology = userBirthday
    ? getNumerologyInsights(
        userBirthday,
        new Date().getFullYear(),
        natalChart,
      ) || undefined
    : undefined;

  // NEW: Get aspect guidance from grimoire
  const aspectGuidance = getAspectGuidanceFromGrimoire(
    transits
      .filter((t) => t.aspect && t.natalPlanet)
      .map((t) => ({
        planet1: t.planet,
        aspect: t.aspect,
        planet2: t.natalPlanet,
      })),
  );

  // NEW: Get retrograde guidance from grimoire
  const retrogradeGuidance = getRetrogradeGuidanceFromGrimoire(
    transits.map((t) => ({
      planet: t.planet,
      isRetrograde: t.aspect?.includes('retrograde') || false,
    })),
  );

  // NEW: Get sabbat recommendation
  const sabbat = getSabbatRecommendation();

  // NEW: Get tarot recommendations based on transits
  const tarotCards = getTarotRecommendations(transits);

  // NEW: Get planetary day recommendation
  const planetaryDay = getPlanetaryDayRecommendation();

  // ADVANCED RECOMMENDATIONS (conditional based on query context)
  let runes: any[] | undefined;
  let lunarNodes: any | undefined;
  let synastry: any | undefined;
  let decan: any | undefined;
  let witchTypes: any[] | undefined;
  let divination: any[] | undefined;
  let suggestions: any | undefined;

  if (queryContext) {
    // RUNES - check for specific rune request first, then general recommendations
    if (queryContext.needsRunes) {
      // If user asked about a specific rune by name
      if (queryContext.specificRune) {
        const specificRuneData = getSpecificRune(queryContext.specificRune);
        if (specificRuneData) {
          runes = [specificRuneData];
        }
      } else {
        // General rune recommendations by element
        const dominantElement = natalChart?.dominantElement || moonPhase.sign;
        runes = getRuneRecommendations(dominantElement).slice(0, 3);
      }
    }

    // LUNAR NODES - only if birth chart available and relevant
    if (queryContext.needsLunarNodes && natalChart?.northNode) {
      const nodeGuidance = getLunarNodesGuidance(
        natalChart.northNode.sign,
        natalChart.northNode.house,
      );
      if (nodeGuidance) {
        lunarNodes = nodeGuidance;
      }
    }

    // SYNASTRY - only for relationship queries
    if (queryContext.needsSynastry && natalChart?.sun) {
      const userSunSign = natalChart.sun.sign;
      // Partner sign would come from user input - for now just show compatibility info
      const synastryData = getSynastryInsights(userSunSign);
      if (synastryData) {
        synastry = synastryData;
      }
    }

    // DECANS - only if explicitly requested or for detailed sun/moon analysis
    if (queryContext.needsDecans && natalChart?.sun) {
      const decanData = getDecanInfo(
        natalChart.sun.sign,
        natalChart.sun.degree,
      );
      if (decanData) {
        decan = decanData;
      }
    }

    // WITCH TYPES - only if path/practice query detected
    if (queryContext.needsWitchTypes && natalChart) {
      const dominantElements = natalChart.dominantElements || [];
      const sunSign = natalChart.sun?.sign || '';
      const moonSign = natalChart.moon?.sign || '';
      witchTypes = getWitchTypeRecommendations(
        dominantElements,
        sunSign,
        moonSign,
      ).slice(0, 3);
    }

    // DIVINATION - only if divination query or strong intuitive placements
    if (queryContext.needsDivination || queryContext.suggestDivination) {
      const hasStrongNeptune =
        natalChart?.neptune?.aspects?.length > 2 || false;
      const hasStrongMoon = natalChart?.moon?.aspects?.length > 2 || false;
      const hasStrongMercury =
        natalChart?.mercury?.aspects?.length > 2 || false;
      const dominantElement = natalChart?.dominantElement;

      divination = getDivinationRecommendations(
        hasStrongNeptune,
        hasStrongMoon,
        hasStrongMercury,
        dominantElement,
      ).slice(0, 3);
    }

    // BUILD SUGGESTIONS (subtle hints without overwhelming)
    const suggestionMessages: any = {};

    if (queryContext.suggestTarot && !queryContext.needsTarot) {
      suggestionMessages.tarot =
        'Consider pulling a tarot card for additional guidance on this transit.';
    }

    if (queryContext.suggestRunes && !queryContext.needsRunes) {
      suggestionMessages.runes =
        'Rune divination could offer insight into this situation.';
    }

    if (queryContext.suggestDivination && !queryContext.needsDivination) {
      suggestionMessages.divination =
        'Your chart suggests natural divination abilities - explore scrying or pendulum work.';
    }

    if (queryContext.suggestSabbat && !queryContext.needsSabbats && sabbat) {
      suggestionMessages.sabbat = `${sabbat.sabbat} approaches - rituals could enhance this energy.`;
    }

    if (Object.keys(suggestionMessages).length > 0) {
      suggestions = suggestionMessages;
    }
  }

  // Build personalized ritual using correspondences (if user has spell/ritual intent)
  let ritual: RitualRecommendation | undefined;
  if (queryContext?.needsSpells && allCrystals.length > 0 && natalChart) {
    // Determine primary element from natal chart or moon phase
    const sunSignData = natalChart.sun
      ? getZodiacCorrespondences(natalChart.sun.sign)
      : null;
    const primaryElement = sunSignData?.element || moonPhase.sign;

    // Determine intention from user's top challenge or general manifestation
    const intention = userIntentions?.[0] || 'manifestation and alignment';

    // Get planetary day
    const currentDay = getCurrentPlanetaryDay(new Date());

    ritual =
      buildPersonalizedRitual(
        primaryElement,
        intention,
        moonPhase.name,
        currentDay,
        allCrystals,
      ) || undefined;
  }

  // Generate synthesis message with ALL data
  const synthesisMessage = generateSynthesisMessage(
    allCrystals,
    spellRecs,
    numerology,
    transits,
    moonPhase,
    aspectGuidance,
    sabbat,
    planetaryDay,
  );

  return {
    crystals: allCrystals.slice(0, 5),
    spells: spellRecs,
    numerology,
    aspectGuidance: aspectGuidance.length > 0 ? aspectGuidance : undefined,
    retrogradeGuidance:
      retrogradeGuidance.length > 0 ? retrogradeGuidance : undefined,
    sabbat: sabbat || undefined,
    tarotCards: tarotCards.length > 0 ? tarotCards : undefined,
    planetaryDay: planetaryDay || undefined,
    // Advanced recommendations (conditional)
    runes: runes && runes.length > 0 ? runes : undefined,
    lunarNodes,
    synastry,
    decan,
    witchTypes: witchTypes && witchTypes.length > 0 ? witchTypes : undefined,
    divination: divination && divination.length > 0 ? divination : undefined,
    // Suggestions (subtle hints)
    suggestions,
    // Personalized ritual
    ritual,
    synthesisMessage,
  };
}

/**
 * Get house meaning and themes from grimoire data
 * INTERNAL: Only used within cosmic recommender
 * NOTE: This duplicates functionality in grimoire/data-accessor.ts
 */
function getHouseMeaning(houseNumber: number): string {
  const houseMeanings: { [key: number]: string } = {
    1: 'Self, Identity, Physical Appearance',
    2: 'Values, Finances, Material Possessions',
    3: 'Communication, Learning, Siblings',
    4: 'Home, Family, Roots, Emotional Foundation',
    5: 'Creativity, Romance, Children, Self-Expression',
    6: 'Health, Work, Daily Routines, Service',
    7: 'Partnerships, Marriage, One-on-One Relationships',
    8: 'Transformation, Intimacy, Shared Resources, Death/Rebirth',
    9: 'Philosophy, Higher Learning, Travel, Spirituality',
    10: 'Career, Public Reputation, Life Direction',
    11: 'Friends, Community, Hopes, Dreams',
    12: 'Spirituality, Subconscious, Hidden Matters, Karma',
  };

  return houseMeanings[houseNumber] || 'Unknown life area';
}

/**
 * Get zodiac sign correspondences from grimoire
 * INTERNAL: Only used within cosmic recommender
 */
function getZodiacCorrespondences(sign: string): {
  element: string;
  modality: string;
  rulingPlanet: string;
  keywords: string[];
} {
  const signData = (zodiacSignsData as any)[sign.toLowerCase()];
  if (!signData) {
    return {
      element: 'Unknown',
      modality: 'Unknown',
      rulingPlanet: 'Unknown',
      keywords: [],
    };
  }

  return {
    element: signData.element || 'Unknown',
    modality: signData.modality || 'Unknown',
    rulingPlanet: signData.rulingPlanet || 'Unknown',
    keywords: signData.keywords || [],
  };
}

/**
 * Get chakra correspondence for a planet or element
 * INTERNAL: Only used within cosmic recommender
 */
function getChakraForEnergy(planet?: string, element?: string): string {
  // Planetary chakra correspondences
  const planetaryChakras: { [key: string]: string } = {
    Saturn: 'Root',
    Mars: 'Sacral',
    Sun: 'Solar Plexus',
    Venus: 'Heart',
    Mercury: 'Throat',
    Jupiter: 'Third Eye',
    Neptune: 'Crown',
    Moon: 'Sacral',
    Uranus: 'Crown',
    Pluto: 'Root',
  };

  // Element chakra correspondences
  const elementChakras: { [key: string]: string } = {
    Earth: 'Root',
    Water: 'Sacral',
    Fire: 'Solar Plexus',
    Air: 'Heart',
    Ether: 'Throat',
  };

  if (planet && planetaryChakras[planet]) {
    return planetaryChakras[planet];
  }

  if (element && elementChakras[element]) {
    return elementChakras[element];
  }

  return 'All Chakras';
}

/**
 * Generate a holistic synthesis message using ALL grimoire data
 */
function generateSynthesisMessage(
  crystals: CrystalRecommendation[],
  spells: SpellRecommendation[],
  numerology: NumerologyInsight | undefined,
  transits: Array<{ planet: string; aspect: string }>,
  moonPhase: { name: string; sign: string },
  aspectGuidance?: AspectGuidance[],
  sabbat?: SabbatRecommendation | null,
  planetaryDay?: any,
): string {
  const messages: string[] = [];

  // Moon phase + zodiac element
  const moonSignData = getZodiacCorrespondences(moonPhase.sign);
  messages.push(
    `The cosmic energies are aligned with ${moonPhase.name} in ${moonPhase.sign} (${moonSignData.element} element).`,
  );

  // Major transit with element correspondence
  if (transits.length > 0) {
    const majorTransit = transits[0];
    const planetData = (planetaryBodiesData as any)[
      majorTransit.planet.toLowerCase()
    ];
    const chakra = getChakraForEnergy(majorTransit.planet);

    if (planetData) {
      messages.push(
        `Your ${majorTransit.planet} ${majorTransit.aspect} (${chakra} chakra energy) is a significant influence right now.`,
      );
    }
  }

  // Numerology integration
  if (numerology) {
    messages.push(
      `As a Life Path ${numerology.lifePath} (${numerology.planet} energy), you're in a Personal Year ${numerology.personalYear}, emphasizing themes of ${numerology.personalYearGuidance.split('.')[0].toLowerCase()}.`,
    );
  }

  // Crystal recommendation with chakra/element
  if (crystals.length > 0) {
    const topCrystal = crystals[0].crystal;
    const chakraInfo = topCrystal.chakras?.[0]
      ? ` (${topCrystal.chakras[0]} chakra)`
      : '';
    messages.push(
      `Working with ${topCrystal.name}${chakraInfo} can support you through ${crystals[0].reason.toLowerCase()}.`,
    );
  }

  // Spell timing
  if (spells.length > 0) {
    messages.push(
      `The ${spells[0].title} is particularly potent right now with current energies.`,
    );
  }

  // Aspect guidance from grimoire
  if (aspectGuidance && aspectGuidance.length > 0) {
    const topAspect = aspectGuidance[0];
    messages.push(
      `Your ${topAspect.aspect} brings ${topAspect.nature === 'harmonious' ? 'harmonious' : 'challenging'} energy - ${topAspect.keywords[0].toLowerCase()}.`,
    );
  }

  // Sabbat timing
  if (sabbat && sabbat.daysUntil <= 14) {
    messages.push(
      `${sabbat.sabbat} approaches in ${sabbat.daysUntil} days, bringing ${sabbat.rituals[0]?.toLowerCase() || 'seasonal energy'}.`,
    );
  }

  // Planetary day
  if (planetaryDay) {
    messages.push(
      `Today is ${planetaryDay.day} (${planetaryDay.planet}'s day), ideal for ${planetaryDay.bestFor[0]?.toLowerCase() || 'focused work'}.`,
    );
  }

  return messages.join(' ');
}
