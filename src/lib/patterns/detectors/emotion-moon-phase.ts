/**
 * Emotion Moon Phase Pattern Detector (FREE TIER)
 * Detects correlations between journal emotions and moon phases
 */

import { BasePatternDetector } from './base-detector';
import type {
  Pattern,
  EnrichedJournalEntry,
  EmotionMoonPhaseData,
  PatternType,
  PatternTier,
} from '../types';
import { groupBy } from '../utils/groupBy';
import { getMoonPhaseExpectedFrequency } from '../core/confidence';
import { EMOTION_KEYWORDS } from '../core/constants';

export class EmotionMoonPhaseDetector extends BasePatternDetector<EnrichedJournalEntry> {
  protected readonly patternType: PatternType = 'emotion_moon_phase';
  protected readonly tier: PatternTier = 'free';

  async detect(
    entries: EnrichedJournalEntry[],
  ): Promise<Pattern<EmotionMoonPhaseData>[]> {
    // Validate sufficient data
    if (!this.hasSufficientData(entries, 5)) {
      return [];
    }

    // Validate cosmic data present
    if (!this.validateCosmicData(entries)) {
      console.warn('Journal entries missing cosmic data');
      return [];
    }

    // Extract emotions from entries
    const entriesWithEmotions = entries
      .map((entry) => ({
        ...entry,
        extractedEmotions: this.extractEmotions(entry),
      }))
      .filter((entry) => entry.extractedEmotions.length > 0);

    if (entriesWithEmotions.length < 5) {
      return [];
    }

    const totalEntries = entriesWithEmotions.length;
    const timeWindow = this.createTimeWindow(entries);
    const patterns: Pattern<EmotionMoonPhaseData>[] = [];

    // Group by emotion, then by moon phase
    const emotionGroups = groupBy(
      entriesWithEmotions.flatMap((entry) =>
        entry.extractedEmotions.map((emotion) => ({
          entry,
          emotion,
          moonPhase: entry.cosmicData.moonPhase.name,
        })),
      ),
      (item) => item.emotion,
    );

    for (const [emotion, emotionInstances] of Object.entries(emotionGroups)) {
      // Group this emotion by moon phase
      const phaseGroups = groupBy(emotionInstances, (item) => item.moonPhase);

      for (const [moonPhase, phaseInstances] of Object.entries(phaseGroups)) {
        const entryCount = phaseInstances.length;

        // Skip if insufficient occurrences
        if (entryCount < 3) continue;

        const expectedFrequency = getMoonPhaseExpectedFrequency(moonPhase);
        const percentage = (entryCount / totalEntries) * 100;

        // Calculate confidence
        const confidence = this.calculatePatternConfidence({
          occurrences: entryCount,
          totalEvents: totalEntries,
          expectedFrequency,
          daysAnalyzed: timeWindow.daysAnalyzed,
        });

        const data: EmotionMoonPhaseData = {
          moonPhase,
          emotion,
          entryCount,
          totalEntries,
          percentage,
          expectedFrequency,
          timeWindow,
          occurrences: entryCount,
          totalEvents: totalEntries,
        };

        const pattern = this.createPattern(data, confidence);
        patterns.push(pattern);
      }
    }

    // Filter and sort
    return this.sortByConfidence(this.filterByThreshold(patterns));
  }

  /**
   * Extract emotions from journal entry
   * Uses tags if available, otherwise keyword matching
   */
  private extractEmotions(entry: EnrichedJournalEntry): string[] {
    const emotions = new Set<string>();

    // 1. Check explicit emotion tags
    if (entry.emotions && Array.isArray(entry.emotions)) {
      entry.emotions.forEach((emotion) => emotions.add(emotion.toLowerCase()));
    }

    // 2. Check tags for emotions
    if (entry.tags && Array.isArray(entry.tags)) {
      for (const tag of entry.tags) {
        const normalizedTag = tag.toLowerCase();
        // Check if tag matches known emotions
        for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
          if (
            keywords.includes(normalizedTag) ||
            normalizedTag === emotion ||
            normalizedTag.includes(emotion)
          ) {
            emotions.add(emotion);
          }
        }
      }
    }

    // 3. Keyword matching in content (if no explicit emotions found)
    if (emotions.size === 0 && entry.content) {
      const content = entry.content.toLowerCase();

      for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        for (const keyword of keywords) {
          // Word boundary check to avoid false matches
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(content)) {
            emotions.add(emotion);
            break; // One match per emotion is enough
          }
        }
      }
    }

    return Array.from(emotions);
  }
}
