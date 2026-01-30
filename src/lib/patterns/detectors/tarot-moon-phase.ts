/**
 * Tarot Moon Phase Pattern Detector (FREE TIER)
 * Detects correlations between tarot pulls and moon phases
 */

import { BasePatternDetector } from './base-detector';
import type {
  Pattern,
  EnrichedTarotPull,
  TarotMoonPhaseData,
  PatternType,
  PatternTier,
} from '../types';
import { groupBy, countBy } from '../utils/groupBy';
import { getMoonPhaseExpectedFrequency } from '../core/confidence';

export class TarotMoonPhaseDetector extends BasePatternDetector<EnrichedTarotPull> {
  protected readonly patternType: PatternType = 'tarot_moon_phase';
  protected readonly tier: PatternTier = 'free';

  async detect(
    pulls: EnrichedTarotPull[],
  ): Promise<Pattern<TarotMoonPhaseData>[]> {
    // Validate sufficient data
    if (!this.hasSufficientData(pulls, 3)) {
      return [];
    }

    // Validate cosmic data present
    if (!this.validateCosmicData(pulls)) {
      console.warn('Tarot pulls missing cosmic data');
      return [];
    }

    // Group pulls by moon phase
    const pullsByPhase = groupBy(
      pulls,
      (pull) => pull.cosmicData.moonPhase.name,
    );

    const totalPulls = pulls.length;
    const timeWindow = this.createTimeWindow(pulls);
    const patterns: Pattern<TarotMoonPhaseData>[] = [];

    // Analyze each moon phase
    for (const [moonPhase, phasePulls] of Object.entries(pullsByPhase)) {
      const pullCount = phasePulls.length;

      // Skip phases with insufficient occurrences
      if (pullCount < 3) continue;

      const expectedFrequency = getMoonPhaseExpectedFrequency(moonPhase);
      const percentage = (pullCount / totalPulls) * 100;

      // Calculate confidence
      const confidence = this.calculatePatternConfidence({
        occurrences: pullCount,
        totalEvents: totalPulls,
        expectedFrequency,
        daysAnalyzed: timeWindow.daysAnalyzed,
      });

      // Extract significant cards (cards pulled most during this phase)
      const significantCards = this.extractSignificantCards(phasePulls);

      const data: TarotMoonPhaseData = {
        moonPhase,
        pullCount,
        totalPulls,
        percentage,
        expectedFrequency,
        significantCards,
        timeWindow,
        occurrences: pullCount,
        totalEvents: totalPulls,
      };

      const pattern = this.createPattern(data, confidence);
      patterns.push(pattern);
    }

    // Filter and sort
    return this.sortByConfidence(this.filterByThreshold(patterns));
  }

  /**
   * Extract cards that appear most frequently during this phase
   */
  private extractSignificantCards(
    pulls: EnrichedTarotPull[],
  ): Array<{ cardName: string; count: number }> {
    // Collect all cards from all pulls
    const allCards: string[] = [];

    for (const pull of pulls) {
      // Handle different card data structures
      if (Array.isArray(pull.cards)) {
        // Array of card objects
        for (const card of pull.cards) {
          if (typeof card === 'string') {
            allCards.push(card);
          } else if (card && typeof card === 'object' && 'name' in card) {
            allCards.push(card.name);
          }
        }
      } else if (pull.cards && typeof pull.cards === 'object') {
        // Object with positions
        for (const position of Object.values(pull.cards)) {
          if (typeof position === 'string') {
            allCards.push(position);
          } else if (
            position &&
            typeof position === 'object' &&
            'name' in position
          ) {
            allCards.push((position as any).name);
          }
        }
      }
    }

    // Count occurrences
    const cardCounts = countBy(allCards, (card) => card);

    // Sort by count and take top 3
    const sortedCards = Object.entries(cardCounts)
      .map(([cardName, count]) => ({ cardName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Only return cards that appear more than once
    return sortedCards.filter((card) => card.count > 1);
  }
}
