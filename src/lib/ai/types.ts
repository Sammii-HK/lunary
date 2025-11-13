export type AiMessageRole = 'user' | 'assistant';

export type BirthChartPlacement = {
  planet: string;
  sign: string;
  house: number;
  degree: number;
};

export type BirthChartAspect = {
  a: string;
  b: string;
  type: string;
  orb: number;
};

export type BirthChartSnapshot = {
  date: string;
  time: string;
  lat: number;
  lon: number;
  placements: BirthChartPlacement[];
  aspects?: BirthChartAspect[];
};

export type TransitRecord = {
  aspect: string;
  from: string;
  to: string;
  exactUtc: string;
  applying: boolean;
  strength: number;
};

export type MoonSnapshot = {
  phase: string;
  sign: string;
  emoji: string;
  illumination: number;
};

export type TarotCard = {
  name: string;
  position?: string;
  reversed?: boolean;
};

export type TarotReading = {
  spread: string;
  cards: TarotCard[];
  timestamp: string;
};

export type TarotPatternAnalysis = {
  daily?: TarotCard;
  weekly?: TarotCard;
  personal?: TarotCard;
  trends?: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    patternInsights: string[];
  };
};

export type MoodTrendEntry = {
  date: string;
  tag: string;
};

export type MoodHistory = {
  last7d: MoodTrendEntry[];
};

export type ConversationMessageMeta = {
  role: AiMessageRole;
  ts: string;
  tokens: number;
};

export type LunaryContext = {
  user: {
    id: string;
    tz: string;
    locale: string;
    displayName?: string;
  };
  birthChart: BirthChartSnapshot | null;
  currentTransits: TransitRecord[];
  moon: MoonSnapshot | null;
  tarot: {
    lastReading?: TarotReading;
    daily?: TarotCard;
    weekly?: TarotCard;
    personal?: TarotCard;
    patternAnalysis?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
    };
  };
  mood?: MoodHistory;
  history: {
    lastMessages: ConversationMessageMeta[];
  };
};

export type AiPlanId = 'free' | 'lunary_plus' | 'lunary_plus_ai';

export type AiPlan = {
  id: AiPlanId;
  name: string;
  priceGBP: number;
  dailyMessageLimit: number;
  memoryTurns: number;
  features: string[];
  addOns?: {
    aiPackPriceGBP?: number;
    creditPacks?: Array<{
      credits: number;
      priceGBP: number;
    }>;
  };
};

export type DailyHighlight = {
  primaryEvent: string;
  date: string;
};
