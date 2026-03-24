/**
 * Types for the transit deep-dive blog generation system.
 */

import type { EventRarity } from '@/lib/astro/event-calendar';

/** Context assembled before sending to AI for generation */
export interface TransitGenerationContext {
  // Core transit info
  planet: string;
  sign: string;
  year: number;
  transitType: string;
  transitId: string;

  // Dates from ephemeris
  startDate: string | null;
  endDate: string | null;
  totalDays: number | null;
  hasRetrograde: boolean;
  segments: { start: string; end: string }[];

  // From YearlyTransit
  description: string;
  themes: string[];
  doList: string[];
  avoidList: string[];
  tone: string;

  // From event-calendar
  rarity: EventRarity;
  orbitalPeriodYears: number | null;
  yearsPerSign: number | null;

  // Historical context
  previousPeriods: string[];
  historicalEvents: Record<string, string[]>;
  historicalTheme: string | null;
  previousTransitDates: { start: string; end: string } | null;

  // Planetary dignity
  dignity: string | null;

  // Related transits in the same year
  relatedTransits: {
    id: string;
    title: string;
    planet: string;
    sign: string;
  }[];
}

/** Shape of the AI-generated content */
export interface TransitBlogContent {
  title: string;
  subtitle: string;
  metaDescription: string;
  keywords: string[];
  introduction: string;
  historicalDeepDive: string;
  astronomicalContext: string;
  practicalGuidance: string;
  signBreakdowns: Record<string, string>;
  closingSection: string;
}

/** A transit candidate that needs a blog post */
export interface TransitCandidate {
  transitId: string;
  planet: string;
  sign: string;
  year: number;
  transitType: string;
  startDate: Date | null;
  endDate: Date | null;
  rarity: EventRarity;
  score: number;
  title: string;
}
