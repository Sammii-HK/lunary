export const monthlyMoonPhases = {
  newMoon: {
    keywords: ['Beginnings', 'Intention', 'Renewal'],
    symbol: '🌑',
    information:
      "The New Moon is a time of new beginnings, setting intentions, and starting fresh. It's a time to plant the seeds for future growth. Focus on setting clear goals, starting new projects, and embracing change.",
    icon: {
      src: '/icons/moon-phases/new-moon.svg',
      alt: 'New Moon icon',
    },
  },
  waxingCrescent: {
    keywords: ['Expansion', 'Courage', 'Action'],
    symbol: '🌒',
    information:
      "The Waxing Crescent Moon is a time for building momentum and taking action. It's a time to move forward with your plans and pursue your goals with courage. Focus on taking practical steps toward your objectives and expanding your efforts.",
    icon: {
      src: '/icons/moon-phases/waxing-cresent-moon.svg',
      alt: 'Waxing Crescent Moon icon',
    },
  },
  firstQuarter: {
    keywords: ['Challenges', 'Decisions', 'Growth'],
    symbol: '🌓',
    information:
      "The First Quarter Moon is a time to face challenges and make decisions. It's a time to push through obstacles and continue growing. Focus on problem-solving, making necessary adjustments, and staying determined.",
    icon: {
      src: '/icons/moon-phases/first-quarter.svg',
      alt: 'First Quarter Moon icon',
    },
  },
  waxingGibbous: {
    keywords: ['Refinement', 'Patience', 'Preparation'],
    symbol: '🌔',
    information:
      "The Waxing Gibbous Moon is a time for refinement and preparation. It's a time to review your progress, make improvements, and prepare for the fruition of your efforts. Focus on fine-tuning your plans, being patient, and staying dedicated.",
    icon: {
      src: '/icons/moon-phases/waxing-gibbous-moon.svg',
      alt: 'Waxing Gibbous Moon icon',
    },
  },
  fullMoon: {
    keywords: ['Completion', 'Clarity', 'Manifestation'],
    symbol: '🌕',
    information:
      "The Full Moon is a time of completion, clarity, and manifestation. It's a time to celebrate your achievements and see the results of your efforts. Focus on gratitude, releasing what no longer serves you, and enjoying the fruits of your labor.",
    icon: {
      src: '/icons/moon-phases/full-moon.svg',
      alt: 'Full Moon icon',
    },
  },
  waningGibbous: {
    keywords: ['Gratitude', 'Sharing', 'Introspection'],
    symbol: '🌖',
    information:
      "The Waning Gibbous Moon is a time for gratitude, sharing, and introspection. It's a time to give thanks for your accomplishments and share your knowledge with others. Focus on reflecting on your journey, expressing gratitude, and giving back.",
    icon: {
      src: '/icons/moon-phases/waning-gibbous-moon.svg',
      alt: 'Waning Gibbous Moon icon',
    },
  },
  lastQuarter: {
    keywords: ['Release', 'Forgiveness', 'Transition'],
    symbol: '🌗',
    information:
      "The Last Quarter Moon is a time for release and forgiveness. It's a time to let go of what no longer serves you and prepare for new beginnings. Focus on clearing out the old, forgiving past mistakes, and embracing transitions.",
    icon: {
      src: '/icons/moon-phases/last-quarter.svg',
      alt: 'Last Quarter Moon icon',
    },
  },
  waningCrescent: {
    keywords: ['Rest', 'Reflection', 'Closure'],
    symbol: '🌘',
    information:
      "The Waning Crescent Moon is a time for rest, reflection, and closure. It's a time to wind down and prepare for the new cycle ahead. Focus on introspection, completing unfinished business, and resting to recharge your energy.",
    icon: {
      src: '/icons/moon-phases/waning-cresent-moon.svg',
      alt: 'Waning Crescent Moon icon',
    },
  },
};

export type MonthlyMoonPhase = {
  keywords: string[];
  symbol: string;
  icon: {
    src: string;
    alt: string;
  };
  information: string;
};

export type MonthlyMoonPhaseKey = keyof typeof monthlyMoonPhases;

// console.log(moonPhases);
