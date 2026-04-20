export type RulershipSystem = 'traditional' | 'modern';

type Rulership = {
  traditional: string;
  modern: string;
};

const SIGN_RULERS: Record<string, Rulership> = {
  aries: { traditional: 'Mars', modern: 'Mars' },
  taurus: { traditional: 'Venus', modern: 'Venus' },
  gemini: { traditional: 'Mercury', modern: 'Mercury' },
  cancer: { traditional: 'Moon', modern: 'Moon' },
  leo: { traditional: 'Sun', modern: 'Sun' },
  virgo: { traditional: 'Mercury', modern: 'Mercury' },
  libra: { traditional: 'Venus', modern: 'Venus' },
  scorpio: { traditional: 'Mars', modern: 'Pluto' },
  sagittarius: { traditional: 'Jupiter', modern: 'Jupiter' },
  capricorn: { traditional: 'Saturn', modern: 'Saturn' },
  aquarius: { traditional: 'Saturn', modern: 'Uranus' },
  pisces: { traditional: 'Jupiter', modern: 'Neptune' },
};

const toKey = (sign: string) => sign.trim().toLowerCase();

export function getSignRulership(sign: string): Rulership | null {
  return SIGN_RULERS[toKey(sign)] || null;
}

export function getPrimaryRuler(
  sign: string,
  system: RulershipSystem = 'traditional',
): string {
  const rulership = getSignRulership(sign);
  if (!rulership) return 'Unknown';
  return rulership[system];
}

export function hasDualRulership(sign: string): boolean {
  const rulership = getSignRulership(sign);
  if (!rulership) return false;
  return rulership.traditional !== rulership.modern;
}

export function formatRulershipValue(sign: string): string {
  const rulership = getSignRulership(sign);
  if (!rulership) return 'Unknown';
  if (rulership.traditional === rulership.modern) return rulership.traditional;
  return `${rulership.traditional} (traditional), ${rulership.modern} (modern)`;
}

export function formatRulershipSentence(sign: string): string {
  const rulership = getSignRulership(sign);
  if (!rulership) return 'has an unknown ruler';
  if (rulership.traditional === rulership.modern) {
    return `is ruled by ${rulership.traditional}`;
  }
  return `is traditionally ruled by ${rulership.traditional} and modernly ruled by ${rulership.modern}`;
}
