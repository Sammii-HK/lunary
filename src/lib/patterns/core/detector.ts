/**
 * Main cosmic pattern detector orchestrator
 * Runs all pattern detectors in parallel and aggregates results
 */

import type { Pattern, PatternTier, InsufficientDataPattern } from '../types';
import { PATTERN_CONSTANTS, PATTERN_TYPE_CONFIG } from './constants';
import {
  enrichTarotPulls,
  enrichJournalEntries,
  getAnalysisDateRange,
} from './enricher';

// Import detectors
import { TarotMoonPhaseDetector } from '../detectors/tarot-moon-phase';
import { EmotionMoonPhaseDetector } from '../detectors/emotion-moon-phase';

export interface DetectionOptions {
  daysBack?: number;
  userTier?: PatternTier | 'free';
  category?: 'tarot' | 'emotion';
  forceRefresh?: boolean;
}

export interface DetectionResult {
  patterns: Pattern[];
  meta: {
    totalPatterns: number;
    tarotPatterns: number;
    emotionPatterns: number;
    patternsFound: Record<string, number>;
    analysisWindow: number;
    eventsAnalyzed: {
      tarotPulls: number;
      journalEntries: number;
    };
  };
}

/**
 * Detect all cosmic patterns for a user
 * Runs all detectors in parallel for performance
 */
export async function detectCosmicPatterns(
  userId: string,
  options: DetectionOptions = {},
): Promise<DetectionResult> {
  const startTime = performance.now();

  const {
    daysBack = PATTERN_CONSTANTS.DEFAULT_ANALYSIS_WINDOW,
    userTier = 'free',
    category,
  } = options;

  const safeUserId = String(userId).replace(/[\r\n\x00-\x1F\x7F]/g, '');
  console.log(`Detecting cosmic patterns for user ${safeUserId}`, {
    daysBack,
    userTier,
    category,
  });

  // Get analysis date range
  const { startDate } = getAnalysisDateRange(daysBack);

  // Enrich historical data with cosmic context (in parallel)
  const [enrichedTarotPulls, enrichedJournalEntries] = await Promise.all([
    category === 'emotion'
      ? Promise.resolve([])
      : enrichTarotPulls(userId, startDate),
    category === 'tarot'
      ? Promise.resolve([])
      : enrichJournalEntries(userId, startDate),
  ]);

  console.log('Enriched data:', {
    tarotPulls: enrichedTarotPulls.length,
    journalEntries: enrichedJournalEntries.length,
  });

  // Check for insufficient data
  if (
    enrichedTarotPulls.length < PATTERN_CONSTANTS.MIN_TAROT_PULLS &&
    enrichedJournalEntries.length < PATTERN_CONSTANTS.MIN_JOURNAL_ENTRIES
  ) {
    return createInsufficientDataResult(
      enrichedTarotPulls.length,
      enrichedJournalEntries.length,
    );
  }

  // Initialize detectors (only free tier for now)
  const detectors = [
    new TarotMoonPhaseDetector(),
    new EmotionMoonPhaseDetector(),
    // Premium detectors will be added in Phase 2
  ];

  // Filter detectors by category if specified
  const activeDetectors = detectors.filter((detector) => {
    const metadata = detector.getMetadata();

    // Category filter
    if (category) {
      const detectorCategory = PATTERN_TYPE_CONFIG[metadata.type].category;
      if (detectorCategory !== category) return false;
    }

    return true;
  });

  // Run all detectors in parallel
  const detectionPromises = activeDetectors.map(async (detector) => {
    const metadata = detector.getMetadata();
    const detectorCategory = PATTERN_TYPE_CONFIG[metadata.type].category;

    try {
      if (detectorCategory === 'tarot') {
        return await detector.detect(enrichedTarotPulls as any);
      } else {
        return await detector.detect(enrichedJournalEntries as any);
      }
    } catch (error) {
      console.error(`Error in ${metadata.type} detector:`, error);
      return [];
    }
  });

  const detectionResults = await Promise.all(detectionPromises);

  // Flatten and aggregate patterns
  const allPatterns = detectionResults.flat();

  // Filter by user tier (free users only see free patterns)
  const accessiblePatterns =
    userTier === 'free'
      ? allPatterns.filter((p) => p.tier === 'free')
      : allPatterns;

  // Sort by confidence and take top patterns
  const topPatterns = accessiblePatterns
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, PATTERN_CONSTANTS.MAX_PATTERNS_PER_USER);

  // Calculate metadata
  const duration = performance.now() - startTime;
  console.log(`Pattern detection completed in ${duration.toFixed(0)}ms`, {
    patternsFound: topPatterns.length,
    totalPatterns: allPatterns.length,
  });

  return {
    patterns: topPatterns,
    meta: {
      totalPatterns: allPatterns.length,
      tarotPatterns: topPatterns.filter((p) => p.type.startsWith('tarot_'))
        .length,
      emotionPatterns: topPatterns.filter((p) => p.type.startsWith('emotion_'))
        .length,
      patternsFound: countPatternsByType(topPatterns),
      analysisWindow: daysBack,
      eventsAnalyzed: {
        tarotPulls: enrichedTarotPulls.length,
        journalEntries: enrichedJournalEntries.length,
      },
    },
  };
}

/**
 * Create result for insufficient data case
 */
function createInsufficientDataResult(
  tarotPulls: number,
  journalEntries: number,
): DetectionResult {
  const insufficientPattern: InsufficientDataPattern = {
    type: 'insufficient_data',
    tier: 'free',
    title: 'Building your cosmic profile',
    description:
      'Keep pulling cards and journaling to discover your unique patterns. We need at least 3 tarot pulls or 5 journal entries to detect meaningful correlations.',
    confidence: 0,
    data: {
      currentTarotPulls: tarotPulls,
      currentJournalEntries: journalEntries,
      requiredTarotPulls: PATTERN_CONSTANTS.MIN_TAROT_PULLS,
      requiredJournalEntries: PATTERN_CONSTANTS.MIN_JOURNAL_ENTRIES,
      daysUntilAnalysis: 7,
    },
  };

  return {
    patterns: [insufficientPattern as any],
    meta: {
      totalPatterns: 0,
      tarotPatterns: 0,
      emotionPatterns: 0,
      patternsFound: {},
      analysisWindow: PATTERN_CONSTANTS.DEFAULT_ANALYSIS_WINDOW,
      eventsAnalyzed: {
        tarotPulls,
        journalEntries,
      },
    },
  };
}

/**
 * Count patterns by type
 */
function countPatternsByType(patterns: Pattern[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const pattern of patterns) {
    counts[pattern.type] = (counts[pattern.type] || 0) + 1;
  }

  return counts;
}
