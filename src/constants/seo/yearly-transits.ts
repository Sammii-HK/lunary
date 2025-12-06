export interface YearlyTransit {
  id: string;
  year: number;
  planet: string;
  transitType: string;
  title: string;
  dates: string;
  signs: string[];
  description: string;
  themes: string[];
  doList: string[];
  avoidList: string[];
}

export const YEARLY_TRANSITS: YearlyTransit[] = [
  // 2025
  {
    id: 'saturn-return-2025',
    year: 2025,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2025',
    dates: 'All year (for those born ~1995-1996)',
    signs: ['Pisces'],
    description:
      'Saturn Return occurs when Saturn returns to its natal position, happening around ages 29-30. In 2025, Saturn continues through Pisces, bringing karmic lessons about boundaries, spirituality, and dissolving old structures.',
    themes: ['maturity', 'responsibility', 'life assessment', 'karmic lessons'],
    doList: [
      'Take stock of your life',
      'Set long-term goals',
      'Accept responsibility',
      'Build sustainable structures',
    ],
    avoidList: [
      'Avoiding hard truths',
      'Resisting change',
      'Shortcuts',
      'Blaming others',
    ],
  },
  {
    id: 'jupiter-gemini-2025',
    year: 2025,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Gemini 2025',
    dates: 'Until June 9, 2025',
    signs: ['Gemini'],
    description:
      'Jupiter in Gemini expands communication, learning, and networking. This transit favors writers, teachers, and those in media. Ideas flow freely and connections multiply.',
    themes: ['communication', 'learning', 'networking', 'curiosity'],
    doList: [
      'Learn new skills',
      'Write and publish',
      'Network actively',
      'Explore ideas',
    ],
    avoidList: [
      'Scattered focus',
      'Superficial knowledge',
      'Gossip',
      'Overcommitting',
    ],
  },
  {
    id: 'jupiter-cancer-2025',
    year: 2025,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Cancer 2025',
    dates: 'June 9, 2025 - June 30, 2026',
    signs: ['Cancer'],
    description:
      "Jupiter enters Cancer mid-2025, expanding themes of home, family, and emotional security. This is Jupiter's exaltation sign, making it especially powerful for nurturing, real estate, and family growth.",
    themes: ['home', 'family', 'emotional growth', 'nurturing'],
    doList: [
      'Invest in home',
      'Strengthen family bonds',
      'Heal emotional wounds',
      'Create safety',
    ],
    avoidList: [
      'Overprotectiveness',
      'Clinging to the past',
      'Emotional manipulation',
      'Over-eating',
    ],
  },
  // 2026
  {
    id: 'saturn-return-2026',
    year: 2026,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2026',
    dates: 'All year (for those born ~1996-1997)',
    signs: ['Pisces', 'Aries'],
    description:
      'In 2026, Saturn transitions from Pisces to Aries. Those born in late 1996-1997 experience their Saturn Return, a major life transition around age 29-30.',
    themes: ['new beginnings', 'identity', 'independence', 'taking charge'],
    doList: [
      'Define your identity',
      'Take leadership',
      'Start new ventures',
      'Be courageous',
    ],
    avoidList: ['Recklessness', 'Impatience', 'Selfishness', 'Burning bridges'],
  },
  {
    id: 'jupiter-cancer-2026',
    year: 2026,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Cancer 2026',
    dates: 'Until June 30, 2026',
    signs: ['Cancer'],
    description:
      'Jupiter continues its exalted position in Cancer through the first half of 2026, blessing family matters, home investments, and emotional healing.',
    themes: [
      'family expansion',
      'home blessings',
      'emotional abundance',
      'nurturing',
    ],
    doList: [
      'Buy property',
      'Expand family',
      'Heal generational patterns',
      'Create sanctuary',
    ],
    avoidList: [
      'Smothering',
      'Living in the past',
      'Emotional eating',
      'Dependency',
    ],
  },
  {
    id: 'jupiter-leo-2026',
    year: 2026,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Leo 2026',
    dates: 'June 30, 2026 - July 2027',
    signs: ['Leo'],
    description:
      'Jupiter enters Leo in mid-2026, bringing expansion to creativity, self-expression, and romance. This transit favors artists, performers, and those embracing their authentic selves.',
    themes: ['creativity', 'romance', 'self-expression', 'joy'],
    doList: ['Create boldly', 'Romance', 'Perform', 'Celebrate yourself'],
    avoidList: ['Arrogance', 'Drama', 'Overspending', 'Vanity'],
  },
  // 2027
  {
    id: 'saturn-aries-2027',
    year: 2027,
    planet: 'Saturn',
    transitType: 'Saturn Transit',
    title: 'Saturn in Aries 2027',
    dates: 'All year',
    signs: ['Aries'],
    description:
      'Saturn fully commits to Aries in 2027, teaching lessons about independence, leadership, and taking mature action. This is about learning to be a responsible pioneer.',
    themes: ['leadership', 'independence', 'courage', 'discipline'],
    doList: [
      'Lead responsibly',
      'Take calculated risks',
      'Build independence',
      'Develop self-discipline',
    ],
    avoidList: ['Impulsive action', 'Aggression', 'Selfishness', 'Impatience'],
  },
  {
    id: 'uranus-gemini-2027',
    year: 2027,
    planet: 'Uranus',
    transitType: 'Uranus Transit',
    title: 'Uranus Enters Gemini 2027',
    dates: 'Starting May 2027',
    signs: ['Gemini'],
    description:
      'Uranus enters Gemini in 2027, revolutionizing communication, technology, and information. Expect major breakthroughs in AI, media, and how we share information.',
    themes: [
      'communication revolution',
      'technology',
      'information',
      'innovation',
    ],
    doList: [
      'Embrace new tech',
      'Learn cutting-edge skills',
      'Be adaptable',
      'Think differently',
    ],
    avoidList: [
      'Resistance to change',
      'Information overload',
      'Nervous energy',
      'Scattered thinking',
    ],
  },
  // 2028
  {
    id: 'jupiter-virgo-2028',
    year: 2028,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Virgo 2028',
    dates: 'July 2027 - August 2028',
    signs: ['Virgo'],
    description:
      'Jupiter in Virgo brings expansion through service, health, and practical improvement. This transit favors those in healthcare, wellness, and service industries.',
    themes: ['health', 'service', 'improvement', 'practical growth'],
    doList: [
      'Optimize health',
      'Serve others',
      'Improve skills',
      'Organize life',
    ],
    avoidList: ['Perfectionism', 'Over-analysis', 'Criticism', 'Workaholism'],
  },
  // 2029
  {
    id: 'saturn-taurus-2029',
    year: 2029,
    planet: 'Saturn',
    transitType: 'Saturn Transit',
    title: 'Saturn Enters Taurus 2029',
    dates: 'Starting late 2029',
    signs: ['Taurus'],
    description:
      'Saturn enters Taurus in late 2029, bringing lessons about finances, values, and material security. This transit teaches sustainable wealth-building.',
    themes: ['finances', 'values', 'security', 'sustainability'],
    doList: [
      'Build savings',
      'Define values',
      'Create stability',
      'Invest wisely',
    ],
    avoidList: [
      'Overspending',
      'Stubbornness',
      'Materialism',
      'Resistance to change',
    ],
  },
  // 2030
  {
    id: 'jupiter-libra-2030',
    year: 2030,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Libra 2030',
    dates: 'Late 2029 - Late 2030',
    signs: ['Libra'],
    description:
      'Jupiter in Libra expands relationships, partnerships, and justice. This transit favors marriage, legal matters, and collaborative ventures.',
    themes: ['relationships', 'partnership', 'justice', 'balance'],
    doList: ['Partner up', 'Seek balance', 'Legal matters', 'Beautify'],
    avoidList: [
      'Codependency',
      'Indecision',
      'People-pleasing',
      'Superficiality',
    ],
  },
];

export function getTransitsForYear(year: number): YearlyTransit[] {
  return YEARLY_TRANSITS.filter((t) => t.year === year);
}

export function generateAllTransitParams(): { transit: string }[] {
  return YEARLY_TRANSITS.map((t) => ({ transit: t.id }));
}
