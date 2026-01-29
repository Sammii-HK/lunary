/**
 * Pattern snapshot types for historical tracking
 * Extends cosmic pattern system to track Life Themes, Tarot Seasons, and Archetypes
 */

import type { Pattern } from '../types';

export type SnapshotPatternType =
  | 'life_themes'
  | 'tarot_season'
  | 'archetype'
  | 'tarot_moon_phase'
  | 'emotion_moon_phase';

export interface LifeThemeSnapshot {
  type: 'life_themes';
  themes: Array<{
    id: string; // 'healing', 'transformation', 'seeking', 'creation', etc.
    name: string; // 'Healing & Restoration', 'Deep Transformation', etc.
    score: number; // Scoring from the engine (higher = stronger match)
    shortSummary: string; // Brief description of the theme
    sources: {
      journalEntries: number; // Count of journal entries analyzed
      tarotCards: string[]; // Top tarot cards that triggered this theme
      dreamTags: string[]; // Dream tags that contributed
    };
  }>;
  dominantTheme: string; // ID of the dominant theme
  timestamp: string;
}

export interface TarotSeasonSnapshot {
  type: 'tarot_season';
  season: {
    name: string; // 'Emotional Depth', 'Creative Fire', etc.
    suit: string; // 'Cups', 'Wands', 'Swords', 'Pentacles', 'Major Arcana'
    description: string;
  };
  dominantTheme: string; // 'healing', 'transformation', etc.
  suitDistribution: Array<{
    suit: string;
    percentage: number;
    count: number;
  }>;
  frequentCards: Array<{
    name: string;
    count: number;
  }>;
  period: number; // days analyzed (7, 30, 90, etc.)
  timestamp: string;
}

export interface ArchetypeSnapshot {
  type: 'archetype';
  archetypes: Array<{
    name: string; // 'The Healer', 'The Warrior', etc.
    strength: number; // 0-100
    basedOn: string[]; // card names, journal themes
  }>;
  dominantArchetype: string;
  timestamp: string;
}

export type PatternSnapshot =
  | LifeThemeSnapshot
  | TarotSeasonSnapshot
  | ArchetypeSnapshot
  | Pattern; // Existing cosmic patterns

/**
 * Determines if a pattern has changed significantly (>20% change)
 */
export function hasPatternChanged(
  previous: PatternSnapshot | null,
  current: PatternSnapshot,
): boolean {
  if (!previous) return true;
  if (previous.type !== current.type) return true;

  switch (current.type) {
    case 'life_themes': {
      const prev = previous as LifeThemeSnapshot;
      const curr = current as LifeThemeSnapshot;

      // Check if dominant theme changed
      if (prev.dominantTheme !== curr.dominantTheme) return true;

      // Check if theme confidence changed by >20%
      const prevTheme = prev.themes.find((t) => t.name === curr.dominantTheme);
      const currTheme = curr.themes.find((t) => t.name === curr.dominantTheme);

      if (prevTheme && currTheme) {
        const confidenceDiff = Math.abs(
          prevTheme.confidence - currTheme.confidence,
        );
        return confidenceDiff > 0.2;
      }

      return false;
    }

    case 'tarot_season': {
      const prev = previous as TarotSeasonSnapshot;
      const curr = current as TarotSeasonSnapshot;

      // Check if dominant suit changed
      if (prev.season.suit !== curr.season.suit) return true;

      // Check if suit distribution changed significantly
      const prevTop = prev.suitDistribution[0];
      const currTop = curr.suitDistribution[0];

      if (prevTop && currTop) {
        const percentageDiff = Math.abs(
          prevTop.percentage - currTop.percentage,
        );
        return percentageDiff > 20;
      }

      return false;
    }

    case 'archetype': {
      const prev = previous as ArchetypeSnapshot;
      const curr = current as ArchetypeSnapshot;

      // Check if dominant archetype changed
      if (prev.dominantArchetype !== curr.dominantArchetype) return true;

      // Check if archetype strength changed by >20%
      const prevArch = prev.archetypes.find(
        (a) => a.name === curr.dominantArchetype,
      );
      const currArch = curr.archetypes.find(
        (a) => a.name === curr.dominantArchetype,
      );

      if (prevArch && currArch) {
        const strengthDiff = Math.abs(prevArch.strength - currArch.strength);
        return strengthDiff > 20;
      }

      return false;
    }

    default:
      // For cosmic patterns, compare confidence
      if ('confidence' in previous && 'confidence' in current) {
        return Math.abs(previous.confidence - current.confidence) > 0.2;
      }
      return false;
  }
}
