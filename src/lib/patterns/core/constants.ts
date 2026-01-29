/**
 * Shared constants for cosmic pattern detection
 * Single source of truth for thresholds, frequencies, and configuration
 */

// ============================================================================
// Detection Thresholds
// ============================================================================

export const PATTERN_CONSTANTS = {
  // Minimum requirements for pattern detection
  MIN_OCCURRENCES: 3,
  MIN_CONFIDENCE: 0.6,
  MIN_TAROT_PULLS: 3,
  MIN_JOURNAL_ENTRIES: 5,

  // Analysis window configuration
  DEFAULT_ANALYSIS_WINDOW: 90, // days
  EXTENDED_ANALYSIS_WINDOW: 180, // days (premium)
  MIN_ANALYSIS_WINDOW: 30, // days

  // Storage limits
  MAX_PATTERNS_PER_USER: 20,
  PATTERN_EXPIRATION_DAYS: 30,

  // Rate limiting
  RECALCULATION_COOLDOWN_HOURS: 24,

  // Cache configuration
  CACHE_TTL_MS: 3600000, // 1 hour
  COSMIC_DATA_CACHE_DAYS: 365, // Cache historical data indefinitely
} as const;

// ============================================================================
// Expected Frequencies (for confidence scoring)
// ============================================================================

/**
 * Expected frequency of events under null hypothesis (no cosmic correlation)
 * Used to calculate statistical significance
 */
export const EXPECTED_FREQUENCY = {
  /**
   * Moon phase frequencies (29.5-day lunar cycle)
   * Each phase lasts approximately:
   * - New/Full: ~1 day each (~3.4%)
   * - Quarters: ~1 day each (~3.4%)
   * - Waxing/Waning Crescent/Gibbous: ~7 days each (~23.7%)
   */
  moonPhase: {
    'New Moon': 1 / 29.5,
    'Waxing Crescent': 7 / 29.5,
    'First Quarter': 1 / 29.5,
    'Waxing Gibbous': 7 / 29.5,
    'Full Moon': 1 / 29.5,
    'Waning Gibbous': 7 / 29.5,
    'Last Quarter': 1 / 29.5,
    'Waning Crescent': 7 / 29.5,
  },

  /**
   * Planetary sign frequencies (varies by planet speed)
   * These are approximations - actual frequencies depend on retrograde cycles
   */
  planetarySign: {
    // Fast-moving planets (more uniform distribution)
    Sun: 1 / 12, // ~30 days per sign
    Moon: 1 / 12, // ~2.5 days per sign (but averages out)
    Mercury: 1 / 12, // ~20 days per sign (variable due to retrograde)
    Venus: 1 / 12, // ~30 days per sign
    Mars: 1 / 12, // ~45 days per sign

    // Slower planets (less uniform, but use average)
    Jupiter: 1 / 12, // ~1 year per sign
    Saturn: 1 / 12, // ~2.5 years per sign
    Uranus: 1 / 12, // ~7 years per sign
    Neptune: 1 / 12, // ~14 years per sign
    Pluto: 1 / 12, // ~20 years per sign
  },

  /**
   * Planetary aspect frequencies
   * Based on typical aspect orbs and planetary speeds
   */
  aspects: {
    conjunction: 0.05, // 5% of time (0° ± 8° orb)
    opposition: 0.05, // 5% of time (180° ± 8° orb)
    square: 0.08, // 8% of time (90° ± 8° orb, two squares per cycle)
    trine: 0.08, // 8% of time (120° ± 8° orb, two trines per cycle)
    sextile: 0.08, // 8% of time (60° ± 6° orb, two sextiles per cycle)
  },

  /**
   * Natal transit aspect frequencies
   * Similar to general aspects but considers natal chart positions
   */
  natalTransit: {
    conjunction: 0.03, // Rarer due to specific natal positions
    opposition: 0.03,
    square: 0.05,
    trine: 0.05,
    sextile: 0.05,
  },
} as const;

// ============================================================================
// Confidence Scoring Weights
// ============================================================================

export const CONFIDENCE_WEIGHTS = {
  /**
   * Sample size bonus: Reward patterns with more occurrences
   * Formula: min(occurrences / SAMPLE_SIZE_BONUS_DIVISOR, SAMPLE_SIZE_BONUS_MAX)
   */
  SAMPLE_SIZE_BONUS_DIVISOR: 10,
  SAMPLE_SIZE_BONUS_MAX: 0.3,

  /**
   * Time window penalty: Penalize patterns from insufficient data
   * Applied if daysAnalyzed < TIME_WINDOW_PENALTY_THRESHOLD
   */
  TIME_WINDOW_PENALTY_THRESHOLD: 60,
  TIME_WINDOW_PENALTY: 0.1,

  /**
   * Statistical significance weight
   * Chi-squared test result is multiplied by this
   */
  CHI_SQUARED_WEIGHT: 0.2,

  /**
   * Base frequency weight
   * How much to weight the observed vs expected frequency ratio
   */
  FREQUENCY_RATIO_WEIGHT: 0.5,
} as const;

// ============================================================================
// Pattern Type Metadata
// ============================================================================

export const PATTERN_TYPE_CONFIG: Record<
  string,
  {
    tier: 'free' | 'premium';
    category: 'tarot' | 'emotion';
    requiresBirthChart: boolean;
    minEvents: number;
  }
> = {
  tarot_moon_phase: {
    tier: 'free',
    category: 'tarot',
    requiresBirthChart: false,
    minEvents: 3,
  },
  emotion_moon_phase: {
    tier: 'free',
    category: 'emotion',
    requiresBirthChart: false,
    minEvents: 5,
  },
  tarot_planetary_position: {
    tier: 'premium',
    category: 'tarot',
    requiresBirthChart: false,
    minEvents: 3,
  },
  emotion_planetary_position: {
    tier: 'premium',
    category: 'emotion',
    requiresBirthChart: false,
    minEvents: 5,
  },
  tarot_planetary_aspect: {
    tier: 'premium',
    category: 'tarot',
    requiresBirthChart: false,
    minEvents: 3,
  },
  emotion_planetary_aspect: {
    tier: 'premium',
    category: 'emotion',
    requiresBirthChart: false,
    minEvents: 5,
  },
  tarot_natal_transit: {
    tier: 'premium',
    category: 'tarot',
    requiresBirthChart: true,
    minEvents: 3,
  },
  emotion_natal_transit: {
    tier: 'premium',
    category: 'emotion',
    requiresBirthChart: true,
    minEvents: 5,
  },
} as const;

// ============================================================================
// Statistical Test Thresholds
// ============================================================================

export const STATISTICAL_THRESHOLDS = {
  /**
   * Chi-squared critical values for p < 0.05 (95% confidence)
   * df = 1 (single pattern comparison)
   */
  CHI_SQUARED_CRITICAL_VALUE: 3.841,

  /**
   * Minimum expected count for chi-squared test validity
   */
  MIN_EXPECTED_COUNT: 5,
} as const;

// ============================================================================
// Pattern Description Templates
// ============================================================================

export const PATTERN_TEMPLATES = {
  tarot_moon_phase: (data: any) =>
    `You pull tarot ${data.percentage.toFixed(0)}% more often during ${data.moonPhase}`,

  emotion_moon_phase: (data: any) =>
    `You experience ${data.emotion} ${data.percentage.toFixed(0)}% more during ${data.moonPhase}`,

  tarot_planetary_position: (data: any) =>
    `You pull tarot ${data.percentage.toFixed(0)}% more when ${data.planet} is in ${data.sign}`,

  emotion_planetary_position: (data: any) =>
    `You feel ${data.emotion} ${data.percentage.toFixed(0)}% more when ${data.planet} is in ${data.sign}`,

  tarot_planetary_aspect: (data: any) =>
    `You pull tarot ${data.percentage.toFixed(0)}% more during ${data.planet1}-${data.planet2} ${data.aspectType}`,

  emotion_planetary_aspect: (data: any) =>
    `You experience ${data.emotion} ${data.percentage.toFixed(0)}% more during ${data.planet1}-${data.planet2} ${data.aspectType}`,

  tarot_natal_transit: (data: any) =>
    `You pull tarot when transiting ${data.transitingPlanet} ${data.aspectType}s your natal ${data.natalPlanet}`,

  emotion_natal_transit: (data: any) =>
    `You feel ${data.emotion} when transiting ${data.transitingPlanet} ${data.aspectType}s your natal ${data.natalPlanet}`,
} as const;

// ============================================================================
// Batch Processing Configuration
// ============================================================================

export const BATCH_CONFIG = {
  /**
   * Number of users to process in parallel during cron job
   */
  BATCH_SIZE: 50,

  /**
   * Maximum execution time for cron job (milliseconds)
   */
  MAX_EXECUTION_TIME_MS: 300000, // 5 minutes

  /**
   * Retry configuration for failed pattern detection
   */
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
} as const;

// ============================================================================
// Emotion Keywords (for journal parsing)
// ============================================================================

/**
 * Common emotion keywords to extract from journal entries
 * Used when explicit emotion tags aren't present
 */
export const EMOTION_KEYWORDS = {
  gratitude: ['grateful', 'thankful', 'blessed', 'appreciate'],
  joy: ['happy', 'joyful', 'excited', 'delighted', 'elated'],
  anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'],
  sadness: ['sad', 'depressed', 'down', 'melancholy', 'blue'],
  anger: ['angry', 'frustrated', 'annoyed', 'irritated', 'mad'],
  peace: ['peaceful', 'calm', 'serene', 'tranquil', 'relaxed'],
  love: ['love', 'loving', 'affectionate', 'caring', 'warm'],
  fear: ['afraid', 'scared', 'fearful', 'terrified', 'frightened'],
  hope: ['hopeful', 'optimistic', 'positive', 'encouraged'],
  confusion: ['confused', 'uncertain', 'lost', 'unclear', 'bewildered'],
} as const;
