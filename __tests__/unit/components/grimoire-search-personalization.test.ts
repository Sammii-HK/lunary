/**
 * Tests for GrimoireSearch personalization logic
 * Tests score boosting, badge assignment, and user sign extraction
 * used in the sparkle search feature.
 */

import type { BirthChartPlacement } from '@/context/UserContext';

// Replicate the scoring/badge logic from GrimoireSearch for testing
interface ScoredResult {
  type: string;
  title: string;
  section?: string;
  href: string;
  match?: string;
  score: number;
  badges?: string[];
}

interface UserSigns {
  sun?: string;
  moon?: string;
  rising?: string;
}

function extractUserSigns(
  birthChart: BirthChartPlacement[] | undefined,
): UserSigns | null {
  if (!birthChart?.length) return null;
  const sun = birthChart.find((p) => p.body === 'Sun');
  const moon = birthChart.find((p) => p.body === 'Moon');
  const rising = birthChart.find((p) => p.body === 'Ascendant');
  return { sun: sun?.sign, moon: moon?.sign, rising: rising?.sign };
}

function applyPersonalizationBoosts(
  results: ScoredResult[],
  userSigns: UserSigns | null,
  currentMoonSign: string | null,
  activeRetrogrades: string[],
): ScoredResult[] {
  if (!userSigns) return results;

  for (const result of results) {
    const titleLower = result.title.toLowerCase();
    const badges: string[] = [];

    if (userSigns.sun && titleLower.includes(userSigns.sun.toLowerCase())) {
      result.score += 3;
      badges.push('Your Sun Sign');
    }
    if (userSigns.moon && titleLower.includes(userSigns.moon.toLowerCase())) {
      result.score += 3;
      badges.push('Your Moon Sign');
    }
    if (
      userSigns.rising &&
      titleLower.includes(userSigns.rising.toLowerCase())
    ) {
      result.score += 3;
      badges.push('Your Rising');
    }
    if (
      currentMoonSign &&
      titleLower.includes(currentMoonSign.toLowerCase()) &&
      !badges.some((b) => b.startsWith('Your'))
    ) {
      result.score += 2;
      badges.push('Current Moon');
    }
    for (const planet of activeRetrogrades) {
      if (
        titleLower.includes(planet.toLowerCase()) &&
        (titleLower.includes('retrograde') || result.section === 'retrogrades')
      ) {
        result.score += 2;
        badges.push('Active Now');
        break;
      }
    }

    if (badges.length > 0) {
      result.badges = badges;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Tests: extractUserSigns
// ---------------------------------------------------------------------------

describe('extractUserSigns', () => {
  it('returns null when birth chart is undefined', () => {
    expect(extractUserSigns(undefined)).toBeNull();
  });

  it('returns null when birth chart is empty', () => {
    expect(extractUserSigns([])).toBeNull();
  });

  it('extracts Sun, Moon, and Ascendant signs', () => {
    const chart: BirthChartPlacement[] = [
      {
        body: 'Sun',
        sign: 'Aries',
        degree: 15,
        minute: 30,
        eclipticLongitude: 15.5,
        retrograde: false,
      },
      {
        body: 'Moon',
        sign: 'Scorpio',
        degree: 10,
        minute: 0,
        eclipticLongitude: 220,
        retrograde: false,
      },
      {
        body: 'Ascendant',
        sign: 'Leo',
        degree: 5,
        minute: 45,
        eclipticLongitude: 125.75,
        retrograde: false,
      },
      {
        body: 'Mercury',
        sign: 'Taurus',
        degree: 20,
        minute: 10,
        eclipticLongitude: 50.17,
        retrograde: true,
      },
    ];

    expect(extractUserSigns(chart)).toEqual({
      sun: 'Aries',
      moon: 'Scorpio',
      rising: 'Leo',
    });
  });

  it('returns undefined for missing placements', () => {
    const chart: BirthChartPlacement[] = [
      {
        body: 'Sun',
        sign: 'Gemini',
        degree: 1,
        minute: 0,
        eclipticLongitude: 61,
        retrograde: false,
      },
    ];

    const signs = extractUserSigns(chart);
    expect(signs).toEqual({
      sun: 'Gemini',
      moon: undefined,
      rising: undefined,
    });
  });
});

// ---------------------------------------------------------------------------
// Tests: applyPersonalizationBoosts
// ---------------------------------------------------------------------------

describe('applyPersonalizationBoosts', () => {
  const makeResult = (
    title: string,
    score: number,
    section?: string,
  ): ScoredResult => ({
    type: 'zodiac',
    title,
    section: section || 'astronomy',
    href: `/grimoire/zodiac/${title.toLowerCase()}`,
    score,
  });

  it('does nothing when userSigns is null', () => {
    const results = [makeResult('Zodiac Sign - Aries', 2)];
    const boosted = applyPersonalizationBoosts(results, null, null, []);
    expect(boosted[0].score).toBe(2);
    expect(boosted[0].badges).toBeUndefined();
  });

  it('boosts and badges results matching Sun sign', () => {
    const results = [
      makeResult('Zodiac Sign - Aries', 1),
      makeResult('Zodiac Sign - Taurus', 1),
    ];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, null, []);

    expect(results[0].score).toBe(4); // 1 + 3
    expect(results[0].badges).toEqual(['Your Sun Sign']);
    expect(results[1].score).toBe(1); // unchanged
    expect(results[1].badges).toBeUndefined();
  });

  it('boosts and badges results matching Moon sign', () => {
    const results = [makeResult('Zodiac Sign - Scorpio', 1)];
    const userSigns: UserSigns = { moon: 'Scorpio' };

    applyPersonalizationBoosts(results, userSigns, null, []);

    expect(results[0].score).toBe(4);
    expect(results[0].badges).toEqual(['Your Moon Sign']);
  });

  it('boosts and badges results matching Rising sign', () => {
    const results = [makeResult('Zodiac Sign - Leo', 1)];
    const userSigns: UserSigns = { rising: 'Leo' };

    applyPersonalizationBoosts(results, userSigns, null, []);

    expect(results[0].score).toBe(4);
    expect(results[0].badges).toEqual(['Your Rising']);
  });

  it('assigns multiple badges when result matches multiple placements', () => {
    // User has Sun and Moon both in Aries
    const results = [makeResult('Zodiac Sign - Aries', 1)];
    const userSigns: UserSigns = { sun: 'Aries', moon: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, null, []);

    expect(results[0].score).toBe(7); // 1 + 3 + 3
    expect(results[0].badges).toEqual(['Your Sun Sign', 'Your Moon Sign']);
  });

  it('boosts current moon sign when not already badged as user sign', () => {
    const results = [
      makeResult('Zodiac Sign - Pisces', 1),
      makeResult('Zodiac Sign - Aries', 1),
    ];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, 'Pisces', []);

    // Pisces gets Current Moon badge
    expect(results[0].score).toBe(3); // 1 + 2
    expect(results[0].badges).toEqual(['Current Moon']);
    // Aries gets Sun badge
    expect(results[1].score).toBe(4);
    expect(results[1].badges).toEqual(['Your Sun Sign']);
  });

  it('skips Current Moon badge when result already has a user sign badge for that sign', () => {
    // User's Sun is Aries, and current moon is also in Aries
    const results = [makeResult('Zodiac Sign - Aries', 1)];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, 'Aries', []);

    expect(results[0].score).toBe(4); // 1 + 3 (no +2 for current moon)
    expect(results[0].badges).toEqual(['Your Sun Sign']);
    expect(results[0].badges).not.toContain('Current Moon');
  });

  it('boosts retrograde results with Active Now badge', () => {
    const results = [
      makeResult('Mercury Retrograde', 1, 'retrogrades'),
      makeResult('Venus Retrograde', 1, 'retrogrades'),
    ];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, null, ['Mercury']);

    expect(results[0].score).toBe(3); // 1 + 2
    expect(results[0].badges).toEqual(['Active Now']);
    expect(results[1].score).toBe(1); // Venus not retrograde
    expect(results[1].badges).toBeUndefined();
  });

  it('matches retrograde by section even without "retrograde" in title', () => {
    const results = [makeResult('Mercury', 1, 'retrogrades')];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, null, ['Mercury']);

    expect(results[0].score).toBe(3);
    expect(results[0].badges).toEqual(['Active Now']);
  });

  it('only adds one Active Now badge even with multiple retrograde planets matching', () => {
    // A result mentioning both Mercury and Venus
    const results = [
      makeResult('Mercury and Venus Retrograde Guide', 1, 'retrogrades'),
    ];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, null, ['Mercury', 'Venus']);

    // Should only get one Active Now badge (breaks after first match)
    expect(results[0].badges).toEqual(['Active Now']);
    expect(results[0].score).toBe(3); // 1 + 2 (only one boost)
  });

  it('case-insensitive matching for sign names', () => {
    const results = [makeResult('ZODIAC SIGN - ARIES', 1)];
    const userSigns: UserSigns = { sun: 'Aries' };

    applyPersonalizationBoosts(results, userSigns, null, []);

    expect(results[0].badges).toEqual(['Your Sun Sign']);
  });
});
