/**
 * Type definitions for cosmic pattern recognition system
 * Supports 8 pattern types: tarot/emotion × moon phase/planetary/aspect/natal
 */

// ============================================================================
// Core Pattern Types
// ============================================================================

export type PatternTier = 'free' | 'premium';

export type PatternType =
  // Free tier patterns
  | 'tarot_moon_phase'
  | 'emotion_moon_phase'
  // Premium tier patterns
  | 'tarot_planetary_position'
  | 'tarot_planetary_aspect'
  | 'tarot_natal_transit'
  | 'emotion_planetary_position'
  | 'emotion_planetary_aspect'
  | 'emotion_natal_transit';

export interface TimeWindow {
  startDate: string; // ISO date
  endDate: string; // ISO date
  daysAnalyzed: number;
}

/**
 * Base pattern structure stored in journal_patterns.pattern_data
 */
export interface Pattern<TData = any> {
  type: PatternType;
  title: string;
  description: string;
  confidence: number; // 0-1, minimum 0.6 to display
  tier: PatternTier;
  data: TData;
  generatedAt?: string; // ISO timestamp
  expiresAt?: string; // ISO timestamp
}

// ============================================================================
// Pattern-Specific Data Types
// ============================================================================

export interface TarotMoonPhaseData {
  moonPhase: string; // e.g., 'Full Moon', 'Waxing Crescent'
  pullCount: number;
  totalPulls: number;
  percentage: number;
  expectedFrequency: number;
  significantCards?: Array<{
    cardName: string;
    count: number;
  }>;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface EmotionMoonPhaseData {
  moonPhase: string;
  emotion: string; // e.g., 'gratitude', 'anxiety', 'joy'
  entryCount: number;
  totalEntries: number;
  percentage: number;
  expectedFrequency: number;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface TarotPlanetaryPositionData {
  planet: string; // e.g., 'Venus', 'Mars'
  sign: string; // e.g., 'Pisces', 'Aries'
  pullCount: number;
  totalPulls: number;
  percentage: number;
  expectedFrequency: number;
  significantCards?: Array<{
    cardName: string;
    count: number;
  }>;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface EmotionPlanetaryPositionData {
  planet: string;
  sign: string;
  emotion: string;
  entryCount: number;
  totalEntries: number;
  percentage: number;
  expectedFrequency: number;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface TarotPlanetaryAspectData {
  aspectType: string; // e.g., 'conjunction', 'square', 'trine'
  planet1: string;
  planet2: string;
  pullCount: number;
  totalPulls: number;
  percentage: number;
  expectedFrequency: number;
  significantCards?: Array<{
    cardName: string;
    count: number;
  }>;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface EmotionPlanetaryAspectData {
  aspectType: string;
  planet1: string;
  planet2: string;
  emotion: string;
  entryCount: number;
  totalEntries: number;
  percentage: number;
  expectedFrequency: number;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface TarotNatalTransitData {
  transitingPlanet: string;
  natalPlanet: string;
  aspectType: string;
  pullCount: number;
  totalPulls: number;
  percentage: number;
  expectedFrequency: number;
  significantCards?: Array<{
    cardName: string;
    count: number;
  }>;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

export interface EmotionNatalTransitData {
  transitingPlanet: string;
  natalPlanet: string;
  aspectType: string;
  emotion: string;
  entryCount: number;
  totalEntries: number;
  percentage: number;
  expectedFrequency: number;
  timeWindow: TimeWindow;
  occurrences: number;
  totalEvents: number;
}

// ============================================================================
// Enriched Event Types (with cosmic context)
// ============================================================================

export interface CosmicData {
  moonPhase: {
    name: string;
    illumination: number;
    angle: number;
  };
  planetaryPositions: Array<{
    planet: string;
    sign: string;
    degree: number;
    isRetrograde: boolean;
  }>;
  aspects?: Array<{
    type: string;
    planet1: string;
    planet2: string;
    angle: number;
    orb: number;
  }>;
}

export interface EnrichedTarotPull {
  id: string;
  created_at: string;
  cards: any; // Original tarot reading cards
  metadata?: any;
  cosmicData: CosmicData;
}

export interface EnrichedJournalEntry {
  id: string;
  created_at: string;
  content: string;
  tags?: string[];
  emotions?: string[]; // Extracted from content/tags
  cosmicData: CosmicData;
}

export type EnrichedEvent = EnrichedTarotPull | EnrichedJournalEntry;

// ============================================================================
// Detector Interface
// ============================================================================

export interface IPatternDetector<TData = any> {
  readonly patternType: PatternType;
  readonly tier: PatternTier;
  detect(events: EnrichedEvent[]): Promise<Pattern<TData>[]>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface CosmicPatternsResponse {
  success: boolean;
  patterns: Pattern[];
  meta: {
    totalPatterns: number;
    userTier: PatternTier | 'free';
    premiumPatternsLocked: number;
    analysisWindow: number;
    lastUpdated: string;
  };
}

export interface InsufficientDataPattern {
  type: 'insufficient_data';
  tier: 'free';
  title: string;
  description: string;
  confidence: 0;
  data: {
    currentTarotPulls: number;
    currentJournalEntries: number;
    requiredTarotPulls: number;
    requiredJournalEntries: number;
    daysUntilAnalysis: number;
  };
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StoredPattern {
  id: number;
  user_id: string;
  pattern_type: PatternType;
  pattern_data: Pattern; // Encrypted JSONB
  generated_at: Date;
  expires_at: Date;
}

// ============================================================================
// Natal Chart Types (for natal transit patterns)
// ============================================================================

export interface NatalChart {
  planets: Array<{
    planet: string;
    sign: string;
    degree: number;
    house?: number;
  }>;
  aspects?: Array<{
    type: string;
    planet1: string;
    planet2: string;
    angle: number;
  }>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type GroupedEvents<T> = Record<string, T[]>;

export interface ConfidenceFactors {
  baseFrequency: number;
  sampleSizeBonus: number;
  timeWindowPenalty: number;
  statisticalSignificance: number;
}
