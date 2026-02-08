export type ThreadIntent =
  | 'observation'
  | 'contrast'
  | 'misconception'
  | 'quick_rule'
  | 'signal'
  | 'hot_take'
  | 'poll'
  | 'identity_callout'
  | 'cosmic_now'
  | 'ranking';

export interface ThreadAngle {
  intent: ThreadIntent;
  opener: string;
  payload?: string;
  closerType: 'question' | 'try_this';
  closer: string;
}

export interface ThreadsSeed {
  keyword: string;
  angles: ThreadAngle[];
}

export interface EnrichmentData {
  keywords?: string[];
  element?: string;
  ruler?: string;
  affirmation?: string;
  meaning?: string;
  description?: string;
  category?: string;
  difficulty?: string;
}

export interface DailyFacet {
  dayIndex: number;
  title: string;
  grimoireSlug: string;
  focus: string;
  shortFormHook: string;
  threads: ThreadsSeed;
  enrichmentData?: EnrichmentData;
}

export type ThemeCategory =
  | 'zodiac'
  | 'tarot'
  | 'lunar'
  | 'planetary'
  | 'crystals'
  | 'numerology'
  | 'chakras'
  | 'sabbat'
  | 'runes'
  | 'spells';

export interface WeeklyTheme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  facets: DailyFacet[];
  facetPool?: DailyFacet[];
  threads: ThreadsSeed;
}

export interface SabbatTheme {
  id: string;
  name: string;
  date: { month: number; day: number };
  category: 'sabbat';
  leadUpFacets: DailyFacet[];
  threads: ThreadsSeed;
}
