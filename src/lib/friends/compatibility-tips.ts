/**
 * Daily compatibility tips between element pairs.
 * Uses deterministic selection based on user/friend/date hash.
 */

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

type ElementPair = 'same' | 'complementary' | 'challenging' | 'neutral';

const ELEMENT_MAP: Record<string, string> = {
  Aries: 'fire',
  Leo: 'fire',
  Sagittarius: 'fire',
  Taurus: 'earth',
  Virgo: 'earth',
  Capricorn: 'earth',
  Gemini: 'air',
  Libra: 'air',
  Aquarius: 'air',
  Cancer: 'water',
  Scorpio: 'water',
  Pisces: 'water',
};

function getElementPairType(
  sign1: string | null,
  sign2: string | null,
): ElementPair {
  if (!sign1 || !sign2) return 'neutral';

  const el1 = ELEMENT_MAP[sign1];
  const el2 = ELEMENT_MAP[sign2];

  if (!el1 || !el2) return 'neutral';

  if (el1 === el2) return 'same';

  const complementary: Record<string, string> = {
    fire: 'air',
    air: 'fire',
    earth: 'water',
    water: 'earth',
  };

  if (complementary[el1] === el2) return 'complementary';

  return 'challenging';
}

const TIPS: Record<ElementPair, string[]> = {
  same: [
    'You mirror each other today — celebrate shared energy.',
    'Same-element bonds are intuitive. Trust the unspoken today.',
    'Your shared element amplifies moods. Keep the vibe positive.',
    'Like attracts like. Lean into what you both enjoy today.',
    'Your friendship thrives on understanding. Deepen it with honesty.',
    'You instinctively get each other. Use that for a fun spontaneous plan.',
    'Shared rhythms make today flow. Go with it.',
    'When you are in sync, magic happens. Today is one of those days.',
    'Your shared element makes you natural allies. Collaborate on something.',
    'You do not need words today — your energy speaks volumes.',
  ],
  complementary: [
    "You fan each other's flames today. Channel that into something creative.",
    'Your elements feed each other. Expect an inspiring conversation.',
    'Together you are balanced: one dreams, the other grounds. Use that.',
    'Complementary energy is powerful today. Brainstorm together.',
    'Your differences are your superpower. Lean into what they bring.',
    "You fill in each other's gaps. Ask for their perspective today.",
    'Cosmic chemistry is high. Initiate something you have both been wanting to do.',
    'Your bond strengthens through what you give each other that is different.',
    'Today, your friend brings exactly what you need. Be open.',
    'Complementary elements create growth. Expect a meaningful exchange.',
  ],
  challenging: [
    'Friction creates sparks. Use creative tension wisely today.',
    'Square energy means growth potential. Be patient with differences.',
    'Your elements clash gently. Choose curiosity over frustration.',
    'Challenging connections teach the most. What can you learn today?',
    'Give each other space today. Distance creates appreciation.',
    'Not every day is easy, but it is always worth it. Choose kindness.',
    'Opposing elements test patience. Deep breaths and humor help.',
    'Your differences are invitations to grow, not reasons to pull apart.',
    'Challenging days build resilience. Show up anyway.',
    'When energy clashes, choose to listen more than speak.',
  ],
  neutral: [
    'Today is a clean slate with your friend. Make it meaningful.',
    'Send a small message — it will mean more than you think.',
    'Cosmic bonds do not need a reason. Just connect today.',
    'The stars do not define your bond. Your choices do.',
    "A simple check-in can shift someone's entire day.",
    'Friendship is its own cosmic force. Honor it today.',
    'No major cosmic tension — just genuine connection energy.',
    'Today is about showing up. That is always enough.',
    'Small acts of friendship ripple outward. Start one.',
    'The best compatibility is the kind you actively build.',
  ],
};

/**
 * Get a deterministic daily compatibility tip between two users.
 */
export function getDailyCompatibilityTip(
  userId: string,
  friendId: string,
  friendSunSign: string | null,
  userSunSign: string | null,
  date?: string,
): { tip: string; pairType: ElementPair } {
  const dateStr = date ?? new Date().toISOString().split('T')[0];
  const pairType = getElementPairType(userSunSign, friendSunSign);
  const tips = TIPS[pairType];
  const seed = simpleHash(`${userId}-${friendId}-${dateStr}`);
  const tip = tips[seed % tips.length];

  return { tip, pairType };
}
