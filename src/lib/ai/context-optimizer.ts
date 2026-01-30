/**
 * Context Optimization Strategy
 *
 * Determines what context to build based on the user's query
 * Reduces API costs by only computing necessary data
 */

export type ContextRequirements = {
  needsBasicCosmic: boolean; // Current transits, moon phase
  needsPersonalTransits: boolean; // Personalized transit calculations
  needsNatalPatterns: boolean; // Stelliums, aspect patterns
  needsPlanetaryReturns: boolean; // Saturn/Jupiter/Solar returns
  needsProgressedChart: boolean; // Secondary progressions
  needsEclipses: boolean; // Eclipse tracking
  needsTarotPatterns: boolean; // Tarot pattern analysis
  needsJournalHistory: boolean; // Journal entries
};

/**
 * Analyze user message to determine required context
 * Returns flags indicating which context modules to activate
 */
export function analyzeContextNeeds(userMessage: string): ContextRequirements {
  const msg = userMessage.toLowerCase();

  return {
    // ALWAYS include basic cosmic data (lightweight)
    needsBasicCosmic: true,

    // Personal transits: expensive calculation, only if relevant
    needsPersonalTransits:
      msg.includes('transit') ||
      msg.includes('aspect') ||
      msg.includes('influence') ||
      msg.includes('energy') ||
      msg.includes('feeling') ||
      msg.includes('house'),

    // Natal patterns: moderate cost, detect patterns in birth chart
    needsNatalPatterns:
      msg.includes('natal') ||
      msg.includes('birth chart') ||
      msg.includes('pattern') ||
      msg.includes('stellium') ||
      msg.includes('grand trine') ||
      msg.includes('t-square'),

    // Planetary returns: lightweight, only if explicitly asked
    needsPlanetaryReturns:
      msg.includes('return') ||
      msg.includes('saturn') ||
      msg.includes('jupiter') ||
      msg.includes('birthday'),

    // Progressed chart: moderate cost, only if relevant
    needsProgressedChart:
      msg.includes('progress') ||
      msg.includes('evolve') ||
      msg.includes('changed') ||
      msg.includes('development'),

    // Eclipses: moderate cost (astronomy calculations)
    needsEclipses:
      msg.includes('eclipse') ||
      msg.includes('portal') ||
      msg.includes('transformation'),

    // Tarot patterns: lightweight (database query)
    needsTarotPatterns:
      msg.includes('tarot') || msg.includes('card') || msg.includes('pattern'),

    // Journal history: expensive (database queries + processing)
    needsJournalHistory:
      msg.includes('journal') ||
      msg.includes('wrote') ||
      msg.includes('entries') ||
      msg.includes('reflection'),
  };
}

/**
 * Calculate estimated token cost for context components
 * Helps track and optimize API costs
 */
export function estimateContextCost(requirements: ContextRequirements): {
  estimatedTokens: number;
  components: Record<string, number>;
} {
  const components: Record<string, number> = {
    basicCosmic: requirements.needsBasicCosmic ? 150 : 0, // Moon, transits summary
    personalTransits: requirements.needsPersonalTransits ? 300 : 0, // Detailed calculations
    natalPatterns: requirements.needsNatalPatterns ? 200 : 0, // Pattern detection
    planetaryReturns: requirements.needsPlanetaryReturns ? 100 : 0, // Return proximity
    progressedChart: requirements.needsProgressedChart ? 250 : 0, // Progression calculations
    eclipses: requirements.needsEclipses ? 200 : 0, // Eclipse tracking
    tarotPatterns: requirements.needsTarotPatterns ? 150 : 0, // Pattern analysis
    journalHistory: requirements.needsJournalHistory ? 400 : 0, // Journal summaries
  };

  const estimatedTokens = Object.values(components).reduce(
    (sum, cost) => sum + cost,
    0,
  );

  return { estimatedTokens, components };
}

/**
 * Get recommended context requirements for common query types
 * Presets for optimal performance
 */
export function getPresetRequirements(
  queryType:
    | 'quick_cosmic'
    | 'deep_analysis'
    | 'tarot_focus'
    | 'journal_reflection',
): ContextRequirements {
  const presets: Record<string, ContextRequirements> = {
    // "What's the cosmic weather today?"
    quick_cosmic: {
      needsBasicCosmic: true,
      needsPersonalTransits: false,
      needsNatalPatterns: false,
      needsPlanetaryReturns: false,
      needsProgressedChart: false,
      needsEclipses: false,
      needsTarotPatterns: true,
      needsJournalHistory: false,
    },

    // "Give me a deep astrological analysis"
    deep_analysis: {
      needsBasicCosmic: true,
      needsPersonalTransits: true,
      needsNatalPatterns: true,
      needsPlanetaryReturns: true,
      needsProgressedChart: true,
      needsEclipses: true,
      needsTarotPatterns: false,
      needsJournalHistory: false,
    },

    // "Interpret my tarot reading"
    tarot_focus: {
      needsBasicCosmic: true,
      needsPersonalTransits: false,
      needsNatalPatterns: false,
      needsPlanetaryReturns: false,
      needsProgressedChart: false,
      needsEclipses: false,
      needsTarotPatterns: true,
      needsJournalHistory: false,
    },

    // "Reflect on my journal entries"
    journal_reflection: {
      needsBasicCosmic: true,
      needsPersonalTransits: true,
      needsNatalPatterns: false,
      needsPlanetaryReturns: false,
      needsProgressedChart: false,
      needsEclipses: false,
      needsTarotPatterns: true,
      needsJournalHistory: true,
    },
  };

  return presets[queryType];
}

/**
 * Example usage:
 *
 * const requirements = analyzeContextNeeds(userMessage);
 * const { estimatedTokens } = estimateContextCost(requirements);
 *
 * if (estimatedTokens > 1000) {
 *   // Consider simplifying context
 * }
 *
 * // Only build what's needed:
 * if (requirements.needsProgressedChart && userBirthday) {
 *   progressedChart = await calculateProgressedChart(userBirthday, now);
 * }
 */
