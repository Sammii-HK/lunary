export type ThreadIntent =
  | 'observation'
  | 'contrast'
  | 'misconception'
  | 'quick_rule'
  | 'signal';

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

export interface DailyFacet {
  dayIndex: number;
  title: string;
  grimoireSlug: string;
  focus: string;
  shortFormHook: string;
  threads: ThreadsSeed;
}

export type ThemeCategory =
  | 'zodiac'
  | 'tarot'
  | 'lunar'
  | 'planetary'
  | 'crystals'
  | 'numerology'
  | 'chakras'
  | 'sabbat';

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
