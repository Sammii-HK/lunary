/**
 * Shared types for Couples Mode v1.
 *
 * A "couple" is two paired users who see a single shared compatibility
 * dashboard — today's score + the day's strongest activated aspect, plus a
 * 14-day cosmic calendar with harmonious / friction / mixed days.
 */

export type CoupleDayTheme = 'harmonious' | 'friction' | 'mixed';

export interface CoupleDailyAspect {
  /** Personal-A planet involved in the natal-to-natal aspect (e.g. "Sun"). */
  planetA: string;
  /** Personal-B planet involved in the natal-to-natal aspect (e.g. "Moon"). */
  planetB: string;
  /** Aspect name, lowercase: 'conjunction' | 'trine' | 'square' | etc. */
  aspect: string;
  /** Aspect glyph (e.g. '☌', '△', '□'). */
  aspectSymbol: string;
  /** Natal aspect orb in degrees. */
  orb: number;
  /** Tone of the aspect — drives card colour. */
  nature: 'harmonious' | 'challenging' | 'neutral';
  /** Short prose blurb to narrate. */
  description: string;
}

export interface CoupleDayForecast {
  /** ISO date (YYYY-MM-DD) for the day in UTC. */
  date: string;
  /** 0-100 compatibility score for that day. */
  score: number;
  /** Tone tag for colouring the calendar bar. */
  theme: CoupleDayTheme;
}

export interface CoupleSummary {
  partnerId: string;
  partnerName: string;
  /** Optional /me/{handle} reference for the partner. */
  partnerHandle?: string;
  pairedAt: string;
  /** 0-100 score for today. */
  dailyScore: number;
  /** The single tightest activated synastry aspect today. */
  dailyAspect: CoupleDailyAspect | null;
  /** 14-day rolling forecast starting today. */
  fourteenDay: CoupleDayForecast[];
}
