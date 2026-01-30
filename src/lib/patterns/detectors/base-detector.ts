/**
 * Base detector class for DRY pattern detection
 * Provides shared logic for all pattern detectors
 */

import type {
  Pattern,
  PatternType,
  PatternTier,
  EnrichedEvent,
  TimeWindow,
} from '../types';
import { PATTERN_CONSTANTS } from '../core/constants';
import {
  calculateConfidence,
  meetsConfidenceThreshold,
  meetsOccurrenceThreshold,
} from '../core/confidence';
import {
  formatPatternDescription,
  formatPatternTitle,
} from '../utils/formatting';

export abstract class BasePatternDetector<
  TEvent extends EnrichedEvent = EnrichedEvent,
> {
  protected abstract readonly patternType: PatternType;
  protected abstract readonly tier: PatternTier;

  /**
   * Detect patterns in enriched events
   * Must be implemented by subclasses
   */
  abstract detect(events: TEvent[]): Promise<Pattern[]>;

  /**
   * Filter patterns by minimum thresholds
   * Removes patterns below confidence/occurrence minimums
   */
  protected filterByThreshold(
    patterns: Pattern[],
    minOccurrences: number = PATTERN_CONSTANTS.MIN_OCCURRENCES,
    minConfidence: number = PATTERN_CONSTANTS.MIN_CONFIDENCE,
  ): Pattern[] {
    return patterns.filter(
      (pattern) =>
        pattern.data.occurrences >= minOccurrences &&
        pattern.confidence >= minConfidence,
    );
  }

  /**
   * Calculate confidence score using standard algorithm
   */
  protected calculatePatternConfidence(params: {
    occurrences: number;
    totalEvents: number;
    expectedFrequency: number;
    daysAnalyzed: number;
  }): number {
    const { confidence } = calculateConfidence(params);
    return confidence;
  }

  /**
   * Create time window from events
   */
  protected createTimeWindow(events: TEvent[]): TimeWindow {
    if (events.length === 0) {
      const now = new Date();
      return {
        startDate: now.toISOString(),
        endDate: now.toISOString(),
        daysAnalyzed: 0,
      };
    }

    const dates = events.map((e) => new Date(e.created_at).getTime());
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));
    const daysAnalyzed = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      daysAnalyzed,
    };
  }

  /**
   * Create a pattern object with standard structure
   */
  protected createPattern<TData>(
    data: TData,
    confidence: number,
    patternType?: PatternType,
  ): Pattern<TData> {
    const type = patternType || this.patternType;

    const pattern: Pattern<TData> = {
      type,
      title: formatPatternTitle(type, data as any),
      description: formatPatternDescription(type, data as any),
      confidence,
      tier: this.tier,
      data,
      generatedAt: new Date().toISOString(),
    };

    return pattern;
  }

  /**
   * Check if we have sufficient data to detect patterns
   */
  protected hasSufficientData(
    events: TEvent[],
    minEvents: number = PATTERN_CONSTANTS.MIN_OCCURRENCES,
  ): boolean {
    return events.length >= minEvents;
  }

  /**
   * Validate that all events have required cosmic data
   */
  protected validateCosmicData(events: TEvent[]): boolean {
    return events.every(
      (event) => event.cosmicData && event.cosmicData.moonPhase,
    );
  }

  /**
   * Sort patterns by confidence (descending)
   */
  protected sortByConfidence(patterns: Pattern[]): Pattern[] {
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Take top N patterns
   */
  protected takeTop(patterns: Pattern[], limit: number): Pattern[] {
    return this.sortByConfidence(patterns).slice(0, limit);
  }

  /**
   * Check if pattern meets all validity criteria
   */
  protected isValidPattern(pattern: Pattern): boolean {
    return (
      meetsOccurrenceThreshold(pattern.data.occurrences) &&
      meetsConfidenceThreshold(pattern.confidence)
    );
  }

  /**
   * Get detector metadata
   */
  getMetadata(): { type: PatternType; tier: PatternTier } {
    return {
      type: this.patternType,
      tier: this.tier,
    };
  }
}
