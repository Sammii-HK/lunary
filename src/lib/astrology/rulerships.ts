type SignKey =
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

const MODERN_RULERS: Record<SignKey, string> = {
  aries: 'Mars',
  taurus: 'Venus',
  gemini: 'Mercury',
  cancer: 'Moon',
  leo: 'Sun',
  virgo: 'Mercury',
  libra: 'Venus',
  scorpio: 'Pluto',
  sagittarius: 'Jupiter',
  capricorn: 'Saturn',
  aquarius: 'Uranus',
  pisces: 'Neptune',
};

const TRADITIONAL_RULERS: Record<SignKey, string> = {
  aries: 'Mars',
  taurus: 'Venus',
  gemini: 'Mercury',
  cancer: 'Moon',
  leo: 'Sun',
  virgo: 'Mercury',
  libra: 'Venus',
  scorpio: 'Mars',
  sagittarius: 'Jupiter',
  capricorn: 'Saturn',
  aquarius: 'Saturn',
  pisces: 'Jupiter',
};

function normalise(sign: string): SignKey | null {
  const lower = sign.trim().toLowerCase();
  const valid: SignKey[] = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  return (valid as string[]).includes(lower) ? (lower as SignKey) : null;
}

export function getPrimaryRuler(sign: string): string {
  const key = normalise(sign);
  return key ? MODERN_RULERS[key] : 'Unknown';
}

export function getTraditionalRuler(sign: string): string {
  const key = normalise(sign);
  return key ? TRADITIONAL_RULERS[key] : 'Unknown';
}

export function formatRulershipValue(sign: string): string {
  const key = normalise(sign);
  if (!key) return 'Unknown';
  const modern = MODERN_RULERS[key];
  const traditional = TRADITIONAL_RULERS[key];
  if (modern === traditional) return modern;
  return `${modern} (modern) · ${traditional} (traditional)`;
}

export function getSignRulership(
  sign: string,
): { modern: string; traditional: string } | null {
  const key = normalise(sign);
  if (!key) return null;
  return { modern: MODERN_RULERS[key], traditional: TRADITIONAL_RULERS[key] };
}

export function formatRulershipSentence(sign: string): string {
  const key = normalise(sign);
  if (!key) return 'has no known rulership';
  const modern = MODERN_RULERS[key];
  const traditional = TRADITIONAL_RULERS[key];
  if (modern === traditional) return `is ruled by ${modern}`;
  return `is traditionally ruled by ${traditional} and, in modern astrology, by ${modern}`;
}
