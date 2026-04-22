export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export type SignKey =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type QuizInput = {
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  birthTimezone?: string;
  email?: string;
};

export type QuizSection = {
  heading: string;
  body: string;
  highlight?: string;
  bullets?: string[];
  locked?: boolean;
};

export type QuizResult = {
  quizSlug: string;
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
  };
  sections: QuizSection[];
  shareCard: {
    title: string;
    subtitle: string;
  };
  tease: string;
  meta: {
    generatedAt: string;
    chartKey: string;
  };
};
