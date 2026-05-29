/**
 * @jest-environment node
 *
 * VITAL OP #4 - Paywall / caps: capped (not hard-paywalled) features must
 *   return the teaser path for free users and the full path for Pro/trial.
 * VITAL OP #6 - Free tier = GENERIC tarot + GENERIC horoscope, NEVER
 *   personalised. The free path must not leak personalised content.
 *
 * Both gates are decided by hasFeatureAccess(...) over the FEATURE_ACCESS
 * entitlement map (utils/entitlements.ts, surfaced via utils/pricing.ts).
 * Components such as TarotView and UnifiedTransitList branch the
 * teaser-vs-full UI on exactly these checks, and on the cap constants
 * (FREE_DAILY_TAROT_TRUNCATE_LENGTH, FREE_TRANSIT_LIMIT, CHAT_LIMITS).
 *
 * Existing pricing.test.ts only spot-checks a couple of features. This file
 * pins the full generic-vs-personalised matrix and the cap constants, which
 * are currently untested. No network/DB. Deterministic.
 */
import { hasFeatureAccess } from '../../../utils/pricing';
import {
  FEATURE_ACCESS,
  FREE_DAILY_TAROT_TRUNCATE_LENGTH,
  FREE_TRANSIT_LIMIT,
  CHAT_LIMITS,
  JOURNAL_LIMITS,
  QUESTION_LIMITS,
  FRIEND_LIMITS,
} from '../../../utils/entitlements';

// The generic (free) vs personalised (paid) feature pairs. The LEFT side
// must be free; the RIGHT side must be paid-only. This is the core of the
// "no personalised content leaks to free" guarantee.
const GENERIC_VS_PERSONALISED: Array<{
  generic: string;
  personalised: string;
}> = [
  { generic: 'general_horoscope', personalised: 'personalized_horoscope' },
  { generic: 'general_tarot', personalised: 'personal_tarot' },
  { generic: 'general_rune', personalised: 'personalized_rune' },
  {
    generic: 'general_crystal_recommendations',
    personalised: 'personalized_crystal_recommendations',
  },
];

describe('VITAL #6 free tier serves GENERIC content', () => {
  it.each(GENERIC_VS_PERSONALISED)(
    'free user CAN access generic "$generic"',
    ({ generic }) => {
      expect(hasFeatureAccess('free', 'free', generic as any)).toBe(true);
      expect(hasFeatureAccess('free', undefined, generic as any)).toBe(true);
    },
  );
});

describe('VITAL #6 free tier must NOT leak PERSONALISED content', () => {
  it.each(GENERIC_VS_PERSONALISED)(
    'free user CANNOT access personalised "$personalised"',
    ({ personalised }) => {
      expect(hasFeatureAccess('free', 'free', personalised as any)).toBe(false);
      expect(hasFeatureAccess('free', undefined, personalised as any)).toBe(
        false,
      );
    },
  );

  it('the free list never contains a personalised tarot/horoscope/rune/crystal key', () => {
    const free = FEATURE_ACCESS.free as readonly string[];
    // The day/year *number* features are intentionally free (the bare number;
    // the _meaning interpretation is paid). They are an allowed exception, so
    // we assert specifically on personalised CONTENT keys, not a blanket prefix.
    const ALLOWED_FREE_PERSONAL = new Set([
      'personal_day_number',
      'personal_year_number',
    ]);
    const leaked = free.filter(
      (f) =>
        (f.startsWith('personal_') || f.startsWith('personalized_')) &&
        !ALLOWED_FREE_PERSONAL.has(f),
    );
    expect(leaked).toEqual([]);
  });

  it('free users cannot reach Pro AI features (unlimited chat, weekly reports)', () => {
    expect(hasFeatureAccess('free', 'free', 'unlimited_ai_chat' as any)).toBe(
      false,
    );
    expect(hasFeatureAccess('free', 'free', 'weekly_reports' as any)).toBe(
      false,
    );
    expect(hasFeatureAccess('free', 'free', 'transit_calendar' as any)).toBe(
      false,
    );
  });
});

describe('VITAL #4 caps - teaser (free) vs full (paid) decision', () => {
  it.each(GENERIC_VS_PERSONALISED)(
    'Pro/trial users CAN access personalised "$personalised" (full path)',
    ({ personalised }) => {
      expect(
        hasFeatureAccess('active', 'lunary_plus', personalised as any),
      ).toBe(true);
      expect(
        hasFeatureAccess('trial', 'lunary_plus', personalised as any),
      ).toBe(true);
      expect(
        hasFeatureAccess('active', 'lunary_plus_ai', personalised as any),
      ).toBe(true);
    },
  );

  it('birth_chart is intentionally a free feature (signup/share hook, not a hard paywall)', () => {
    // Documented in entitlements.ts: free users see their birth chart to
    // encourage signups and sharing.
    expect(hasFeatureAccess('free', 'free', 'birth_chart')).toBe(true);
    expect(hasFeatureAccess('active', 'lunary_plus', 'birth_chart')).toBe(true);
  });

  it('grimoire and moon_phases stay free for everyone', () => {
    expect(hasFeatureAccess('free', 'free', 'grimoire' as any)).toBe(true);
    expect(hasFeatureAccess('free', 'free', 'moon_phases' as any)).toBe(true);
  });
});

describe('VITAL #4 caps - cap constants are sane and free < paid', () => {
  it('daily tarot truncation is a positive teaser length', () => {
    expect(FREE_DAILY_TAROT_TRUNCATE_LENGTH).toBeGreaterThan(0);
    expect(typeof FREE_DAILY_TAROT_TRUNCATE_LENGTH).toBe('number');
  });

  it('free transit list is capped to a small positive number', () => {
    expect(FREE_TRANSIT_LIMIT).toBeGreaterThan(0);
    expect(FREE_TRANSIT_LIMIT).toBeLessThan(10);
  });

  it('chat limits increase free < plus <= pro', () => {
    expect(CHAT_LIMITS.free).toBeGreaterThan(0);
    expect(CHAT_LIMITS.lunary_plus).toBeGreaterThan(CHAT_LIMITS.free);
    expect(CHAT_LIMITS.lunary_plus_ai).toBeGreaterThanOrEqual(
      CHAT_LIMITS.lunary_plus,
    );
  });

  it('free journal entries and questions are finite, capped values', () => {
    expect(JOURNAL_LIMITS.freeMonthlyEntries).toBeGreaterThan(0);
    expect(Number.isFinite(JOURNAL_LIMITS.freeMonthlyEntries)).toBe(true);
    expect(QUESTION_LIMITS.freePerWeek).toBeGreaterThan(0);
    expect(Number.isFinite(QUESTION_LIMITS.freePerWeek)).toBe(true);
  });

  it('free friends are capped while paid friends are unlimited', () => {
    expect(Number.isFinite(FRIEND_LIMITS.free)).toBe(true);
    expect(FRIEND_LIMITS.free).toBeGreaterThan(0);
    expect(FRIEND_LIMITS.paid).toBe(Infinity);
  });
});
