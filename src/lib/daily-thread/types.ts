export type DailyThreadModuleType =
  | 'ambient' // Level 0: moon phase, neutral transit
  | 'reflection' // Level 1-3: personalised prompts
  | 'milestone' // Level 2-3: streak celebrations
  | 'memory' // Level 2-3: on this day
  | 'pattern'; // Level 2-3: pattern insights

export type UserLevel = 0 | 1 | 2 | 3;

export interface DailyThreadModule {
  id: string; // Stable ID for the day
  type: DailyThreadModuleType;
  level: UserLevel; // Required level to see this module
  title: string;
  body: string;
  meta?: {
    relativeTime?: string; // "3 weeks ago"
    journalSnippet?: string;
    tarotCard?: string;
    moonPhase?: string;
    streakDays?: number;
    insight?: string;
    question?: string;
    suggestedAction?: string;
  };
  actions: Array<{
    label: string;
    href?: string;
    intent?: 'journal' | 'ritual' | 'view' | 'share' | 'dismiss';
    payload?: any;
  }>;
  priority: number; // Higher = shown first
  createdAt: string;
}
