export interface NumerologyYearData {
  number: number;
  theme: string;
  keywords: string[];
  energy: string;
  focus: string[];
  challenges: string[];
  opportunities: string[];
  months: { month: string; energy: string }[];
}

export const NUMEROLOGY_MEANINGS: Record<number, NumerologyYearData> = {
  1: {
    number: 1,
    theme: 'New Beginnings',
    keywords: ['independence', 'leadership', 'initiative', 'new starts'],
    energy:
      'A year of fresh starts and new cycles. The universe supports bold action and stepping into leadership.',
    focus: [
      'Starting new projects',
      'Taking initiative',
      'Independence',
      'Self-development',
    ],
    challenges: [
      'Impatience',
      'Loneliness',
      'Self-doubt',
      'Fear of the unknown',
    ],
    opportunities: [
      'Career advancement',
      'New relationships',
      'Personal reinvention',
      'Leadership roles',
    ],
    months: [
      { month: 'January', energy: 'Setting intentions' },
      { month: 'February', energy: 'Building momentum' },
      { month: 'March', energy: 'Taking action' },
      { month: 'April', energy: 'Establishing foundations' },
      { month: 'May', energy: 'Expanding networks' },
      { month: 'June', energy: 'Nurturing growth' },
      { month: 'July', energy: 'Creative expression' },
      { month: 'August', energy: 'Refinement' },
      { month: 'September', energy: 'Partnerships' },
      { month: 'October', energy: 'Deep transformation' },
      { month: 'November', energy: 'Expansion' },
      { month: 'December', energy: 'Completion and planning' },
    ],
  },
  2: {
    number: 2,
    theme: 'Cooperation & Balance',
    keywords: ['partnership', 'patience', 'diplomacy', 'receptivity'],
    energy:
      'A year for partnerships, patience, and finding balance. Seeds planted in the 1 year begin to grow.',
    focus: [
      'Relationships',
      'Collaboration',
      'Patience',
      'Emotional intelligence',
    ],
    challenges: [
      'Indecision',
      'Over-sensitivity',
      'Dependency',
      'Passive-aggressiveness',
    ],
    opportunities: [
      'Deep connections',
      'Marriage/partnership',
      'Mediation',
      'Artistic pursuits',
    ],
    months: [
      { month: 'January', energy: 'Relationship reflection' },
      { month: 'February', energy: 'Love and connection' },
      { month: 'March', energy: 'Communication focus' },
      { month: 'April', energy: 'Home and security' },
      { month: 'May', energy: 'Creative collaboration' },
      { month: 'June', energy: 'Service to others' },
      { month: 'July', energy: 'Partnership decisions' },
      { month: 'August', energy: 'Transformation in relationships' },
      { month: 'September', energy: 'Personal growth' },
      { month: 'October', energy: 'New connections' },
      { month: 'November', energy: 'Deepening bonds' },
      { month: 'December', energy: 'Gratitude and closure' },
    ],
  },
  3: {
    number: 3,
    theme: 'Creativity & Expression',
    keywords: ['creativity', 'communication', 'joy', 'self-expression'],
    energy:
      'A year of creative expansion, social connection, and joyful expression. Your voice matters.',
    focus: [
      'Creative projects',
      'Social life',
      'Communication',
      'Joy and pleasure',
    ],
    challenges: [
      'Scattered energy',
      'Superficiality',
      'Gossip',
      'Procrastination',
    ],
    opportunities: [
      'Artistic success',
      'Public speaking',
      'Writing',
      'Social expansion',
    ],
    months: [
      { month: 'January', energy: 'Creative planning' },
      { month: 'February', energy: 'Relationship creativity' },
      { month: 'March', energy: 'Communication breakthrough' },
      { month: 'April', energy: 'Home beautification' },
      { month: 'May', energy: 'Romance and play' },
      { month: 'June', energy: 'Health through creativity' },
      { month: 'July', energy: 'Social partnerships' },
      { month: 'August', energy: 'Deep creative work' },
      { month: 'September', energy: 'Learning and growth' },
      { month: 'October', energy: 'Career creativity' },
      { month: 'November', energy: 'Community connection' },
      { month: 'December', energy: 'Spiritual creativity' },
    ],
  },
  4: {
    number: 4,
    theme: 'Foundation & Structure',
    keywords: ['stability', 'hard work', 'discipline', 'building'],
    energy:
      'A year for building solid foundations through hard work and discipline. Effort now pays off later.',
    focus: [
      'Career building',
      'Financial security',
      'Health routines',
      'Organization',
    ],
    challenges: ['Rigidity', 'Overwork', 'Frustration', 'Feeling stuck'],
    opportunities: [
      'Real estate',
      'Career foundations',
      'Health improvement',
      'Skill building',
    ],
    months: [
      { month: 'January', energy: 'Planning and structure' },
      { month: 'February', energy: 'Relationship foundations' },
      { month: 'March', energy: 'Communication systems' },
      { month: 'April', energy: 'Home foundations' },
      { month: 'May', energy: 'Creative discipline' },
      { month: 'June', energy: 'Health routines' },
      { month: 'July', energy: 'Partnership commitments' },
      { month: 'August', energy: 'Financial planning' },
      { month: 'September', energy: 'Educational goals' },
      { month: 'October', energy: 'Career building' },
      { month: 'November', energy: 'Community service' },
      { month: 'December', energy: 'Spiritual practice' },
    ],
  },
  5: {
    number: 5,
    theme: 'Change & Freedom',
    keywords: ['change', 'adventure', 'freedom', 'flexibility'],
    energy:
      'A year of significant change, travel, and personal freedom. Embrace the unexpected.',
    focus: ['Travel', 'New experiences', 'Personal freedom', 'Adaptability'],
    challenges: [
      'Restlessness',
      'Impulsiveness',
      'Excess',
      'Commitment issues',
    ],
    opportunities: [
      'Travel',
      'Career change',
      'New adventures',
      'Breaking free from limitations',
    ],
    months: [
      { month: 'January', energy: 'Fresh perspectives' },
      { month: 'February', energy: 'Relationship freedom' },
      { month: 'March', energy: 'Communication expansion' },
      { month: 'April', energy: 'Home changes' },
      { month: 'May', energy: 'Creative risks' },
      { month: 'June', energy: 'Health variety' },
      { month: 'July', energy: 'Partnership evolution' },
      { month: 'August', energy: 'Financial risks/rewards' },
      { month: 'September', energy: 'Travel and learning' },
      { month: 'October', energy: 'Career changes' },
      { month: 'November', energy: 'Social expansion' },
      { month: 'December', energy: 'Spiritual adventure' },
    ],
  },
  6: {
    number: 6,
    theme: 'Love & Responsibility',
    keywords: ['love', 'family', 'responsibility', 'nurturing'],
    energy:
      'A year focused on love, family, and taking responsibility. Home and relationships are central.',
    focus: [
      'Family matters',
      'Home improvement',
      'Relationships',
      'Service to others',
    ],
    challenges: ['Overgiving', 'Perfectionism', 'Meddling', 'Martyrdom'],
    opportunities: [
      'Marriage',
      'Family healing',
      'Home ownership',
      'Community leadership',
    ],
    months: [
      { month: 'January', energy: 'Family intentions' },
      { month: 'February', energy: 'Love and romance' },
      { month: 'March', energy: 'Family communication' },
      { month: 'April', energy: 'Home focus' },
      { month: 'May', energy: 'Creative family time' },
      { month: 'June', energy: 'Health and wellness' },
      { month: 'July', energy: 'Committed relationships' },
      { month: 'August', energy: 'Shared resources' },
      { month: 'September', energy: 'Learning and growth' },
      { month: 'October', energy: 'Work-life balance' },
      { month: 'November', energy: 'Community and friends' },
      { month: 'December', energy: 'Spiritual family' },
    ],
  },
  7: {
    number: 7,
    theme: 'Introspection & Wisdom',
    keywords: ['introspection', 'spirituality', 'wisdom', 'solitude'],
    energy:
      'A year for inner work, spiritual development, and seeking deeper understanding.',
    focus: [
      'Spiritual growth',
      'Study and research',
      'Alone time',
      'Inner wisdom',
    ],
    challenges: ['Isolation', 'Overthinking', 'Skepticism', 'Depression'],
    opportunities: [
      'Spiritual awakening',
      'Research and study',
      'Writing',
      'Healing',
    ],
    months: [
      { month: 'January', energy: 'Inner reflection' },
      { month: 'February', energy: 'Soul connections' },
      { month: 'March', energy: 'Mental clarity' },
      { month: 'April', energy: 'Private sanctuary' },
      { month: 'May', energy: 'Creative solitude' },
      { month: 'June', energy: 'Health wisdom' },
      { month: 'July', energy: 'Relationship depth' },
      { month: 'August', energy: 'Transformation' },
      { month: 'September', energy: 'Higher learning' },
      { month: 'October', energy: 'Career reflection' },
      { month: 'November', energy: 'Spiritual community' },
      { month: 'December', energy: 'Integration' },
    ],
  },
  8: {
    number: 8,
    theme: 'Power & Abundance',
    keywords: ['power', 'abundance', 'achievement', 'karma'],
    energy:
      'A year of material achievement, power, and karmic balance. What you give, you receive.',
    focus: [
      'Financial goals',
      'Career achievement',
      'Personal power',
      'Karmic lessons',
    ],
    challenges: [
      'Materialism',
      'Power struggles',
      'Workaholism',
      'Karmic debts',
    ],
    opportunities: [
      'Financial success',
      'Business growth',
      'Recognition',
      'Leadership',
    ],
    months: [
      { month: 'January', energy: 'Power intentions' },
      { month: 'February', energy: 'Relationship investments' },
      { month: 'March', energy: 'Powerful communication' },
      { month: 'April', energy: 'Real estate opportunities' },
      { month: 'May', energy: 'Creative investments' },
      { month: 'June', energy: 'Health investments' },
      { month: 'July', energy: 'Business partnerships' },
      { month: 'August', energy: 'Financial transformation' },
      { month: 'September', energy: 'Educational investments' },
      { month: 'October', energy: 'Career peak' },
      { month: 'November', energy: 'Community leadership' },
      { month: 'December', energy: 'Spiritual abundance' },
    ],
  },
  9: {
    number: 9,
    theme: 'Completion & Release',
    keywords: ['completion', 'release', 'humanitarianism', 'endings'],
    energy:
      'A year of completion and release. Let go of what no longer serves to make room for new.',
    focus: [
      'Letting go',
      'Completing projects',
      'Service to humanity',
      'Forgiveness',
    ],
    challenges: [
      'Holding on',
      'Nostalgia',
      'Unfinished business',
      'Emotional heaviness',
    ],
    opportunities: [
      'Healing old wounds',
      'Travel',
      'Humanitarian work',
      'Creative completion',
    ],
    months: [
      { month: 'January', energy: 'Releasing the old' },
      { month: 'February', energy: 'Relationship completion' },
      { month: 'March', energy: 'Final communications' },
      { month: 'April', energy: 'Home clearing' },
      { month: 'May', energy: 'Creative completion' },
      { month: 'June', energy: 'Health release' },
      { month: 'July', energy: 'Partnership clarity' },
      { month: 'August', energy: 'Deep release' },
      { month: 'September', energy: 'Wisdom gained' },
      { month: 'October', energy: 'Career completion' },
      { month: 'November', energy: 'Community goodbye' },
      { month: 'December', energy: 'Spiritual completion' },
    ],
  },
};

export function getUniversalYear(year: number): number {
  const sum = String(year)
    .split('')
    .reduce((a, b) => a + parseInt(b), 0);
  if (sum <= 9) return sum;
  return String(sum)
    .split('')
    .reduce((a, b) => a + parseInt(b), 0);
}

export function getYearRange(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
}
