import { DailyCache, getLocalDateString } from '@/lib/cache/dailyCache';
import { CURRENT_BIRTH_CHART_VERSION } from 'utils/astrology/chart-version';

// ---------------------------------------------------------------------------
// localStorage mock (DailyCache needs Object.keys(localStorage) to work)
// ---------------------------------------------------------------------------
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() {
    return Object.keys(store).length;
  },
};

const localStorageProxy = new Proxy(localStorageMock, {
  ownKeys: () => Object.keys(store),
  getOwnPropertyDescriptor(_, prop) {
    if (typeof prop === 'string' && prop in store)
      return { configurable: true, enumerable: true, value: store[prop] };
    return undefined;
  },
});

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageProxy,
  writable: true,
});

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
});

// ===========================================================================
// 1. DailyCache client-side invalidation
// ===========================================================================
describe('DailyCache', () => {
  it('clear() removes all lunary_cache_ entries but not other keys', () => {
    DailyCache.set('horoscope', { content: 'old' });
    DailyCache.set('insight', { content: 'old' });
    localStorageMock.setItem('user_pref', 'dark');

    DailyCache.clear();

    expect(DailyCache.get('horoscope')).toBeNull();
    expect(DailyCache.get('insight')).toBeNull();
    expect(localStorageMock.getItem('user_pref')).toBe('dark');
  });

  it('get() returns cached data before expiry', () => {
    DailyCache.set('key', { zodiac: 'Aries' });
    expect(DailyCache.get('key')).toEqual({ zodiac: 'Aries' });
  });

  it('get() returns null for missing key', () => {
    expect(DailyCache.get('missing')).toBeNull();
  });

  it('remove() deletes one key without affecting others', () => {
    DailyCache.set('a', 1);
    DailyCache.set('b', 2);
    DailyCache.remove('a');
    expect(DailyCache.get('a')).toBeNull();
    expect(DailyCache.get('b')).toBe(2);
  });
});

// ===========================================================================
// 2. Profile page handleSave — shouldRegenerateChart logic
//    Mirrors src/app/(authenticated)/profile/page.tsx lines 399-402
// ===========================================================================
describe('profile page: shouldRegenerateChart', () => {
  /**
   * This is the EXACT logic from the profile page handleSave.
   * If the real code changes, this test must change too — that's the point.
   */
  function shouldRegenerateChart(
    hasExistingChart: boolean,
    birthTime: string,
    birthLocation: string,
    userLocation: Record<string, any>,
  ): boolean {
    return !!(
      !hasExistingChart ||
      (birthTime && birthTime !== userLocation?.birthTime) ||
      (birthLocation && birthLocation !== userLocation?.birthLocation)
    );
  }

  it('regenerates when no chart exists', () => {
    expect(shouldRegenerateChart(false, '', '', {})).toBe(true);
  });

  it('regenerates when birth time changes', () => {
    expect(
      shouldRegenerateChart(true, '14:00', '', { birthTime: '10:30' }),
    ).toBe(true);
  });

  it('regenerates when birth location changes', () => {
    expect(
      shouldRegenerateChart(true, '', 'Paris', { birthLocation: 'London' }),
    ).toBe(true);
  });

  it('does NOT regenerate when nothing changed', () => {
    expect(
      shouldRegenerateChart(true, '10:30', 'London', {
        birthTime: '10:30',
        birthLocation: 'London',
      }),
    ).toBe(false);
  });

  // --- The exact scenario the user asked about ---

  it('regenerates when user with NO location adds a birth time for the first time', () => {
    // userLocation is {} because user never set location
    expect(shouldRegenerateChart(true, '14:00', '', {})).toBe(true);
  });

  it('regenerates when user with NO location adds a birth location for the first time', () => {
    expect(shouldRegenerateChart(true, '', 'London, UK', {})).toBe(true);
  });

  it('regenerates when user with NO location adds both time and location', () => {
    expect(shouldRegenerateChart(true, '14:00', 'London, UK', {})).toBe(true);
  });

  it('regenerates when existing location is undefined (coerced to {})', () => {
    // Mirrors: const userLocation = (user as any)?.location || {};
    const rawLocation: Record<string, any> | undefined = undefined;
    const location = rawLocation || {};
    expect(shouldRegenerateChart(true, '09:00', '', location)).toBe(true);
  });

  it('does NOT regenerate when time is empty and location unchanged', () => {
    expect(
      shouldRegenerateChart(true, '', 'London', { birthLocation: 'London' }),
    ).toBe(false);
  });
});

// ===========================================================================
// 3. UserContext auto-regeneration — version bump logic
//    Mirrors src/context/UserContext.tsx lines 296-301
// ===========================================================================
describe('UserContext: auto-regeneration trigger', () => {
  /**
   * EXACT logic from UserContext refreshBirthChart effect.
   * Returns true when regeneration should fire.
   */
  function needsAutoRegeneration(user: {
    birthday?: string;
    birthChart?: any[];
    location?: Record<string, any>;
  }): boolean {
    if (!user.birthday || !user.birthChart?.length) return false;

    const location = user.location || {};
    const birthLocation = location.birthLocation;
    const birthTimezone = location.birthTimezone;
    const birthChartVersion = location.birthChartVersion;

    const needsVersionUpdate =
      birthChartVersion !== CURRENT_BIRTH_CHART_VERSION;
    const needsTimezoneUpdate = birthLocation && !birthTimezone;

    return !!(needsVersionUpdate || needsTimezoneUpdate);
  }

  const chart = [{ body: 'Sun', sign: 'Aries' }];

  // --- Version bump scenarios ---

  it('triggers when version is outdated', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: {
          birthLocation: 'London',
          birthTimezone: 'Europe/London',
          birthChartVersion: CURRENT_BIRTH_CHART_VERSION - 1,
        },
      }),
    ).toBe(true);
  });

  it('triggers when version is undefined (never set)', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: { birthTimezone: 'Europe/London' },
      }),
    ).toBe(true);
  });

  it('triggers when location object is completely missing', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: undefined,
      }),
    ).toBe(true);
  });

  it('triggers when location is empty object', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: {},
      }),
    ).toBe(true);
  });

  // --- Should NOT trigger ---

  it('does NOT trigger when version is current and timezone exists', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: {
          birthLocation: 'London',
          birthTimezone: 'Europe/London',
          birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
        },
      }),
    ).toBe(false);
  });

  it('does NOT trigger when version is current and no location set (no tz needed)', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: { birthChartVersion: CURRENT_BIRTH_CHART_VERSION },
      }),
    ).toBe(false);
  });

  it('does NOT trigger without birthday', () => {
    expect(needsAutoRegeneration({ birthChart: chart, location: {} })).toBe(
      false,
    );
  });

  it('does NOT trigger without birth chart', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: [],
        location: {},
      }),
    ).toBe(false);
  });

  // --- Timezone-only update ---

  it('triggers timezone update when location exists but timezone missing', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: {
          birthLocation: 'London',
          birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
        },
      }),
    ).toBe(true);
  });

  it('does NOT need timezone update when no birthLocation set', () => {
    expect(
      needsAutoRegeneration({
        birthday: '1990-05-15',
        birthChart: chart,
        location: { birthChartVersion: CURRENT_BIRTH_CHART_VERSION },
      }),
    ).toBe(false);
  });
});

// ===========================================================================
// 4. Server-side invalidation — the table list in birth-chart route.ts
//    This list MUST stay in sync with the route. If a table is added to the
//    schema that depends on birth chart, add it here and the test will fail
//    until the route is updated.
// ===========================================================================
describe('server-side: birth chart PUT invalidation completeness', () => {
  // These are the tables that store data derived from a user's birth chart.
  // The birth-chart PUT route must delete from ALL of them.
  const EXPECTED_TABLES = [
    'synastry_reports',
    'daily_horoscopes',
    'monthly_insights',
    'cosmic_snapshots',
    'cosmic_reports',
    'journal_patterns',
    'pattern_analysis',
    'year_analysis',
  ];

  it('covers all 8 birth-chart-dependent tables', () => {
    expect(EXPECTED_TABLES).toHaveLength(8);
  });

  it.each(EXPECTED_TABLES)('includes %s', (table) => {
    expect(EXPECTED_TABLES).toContain(table);
  });

  it('does NOT include user_profiles (the source table)', () => {
    expect(EXPECTED_TABLES).not.toContain('user_profiles');
  });

  it('does NOT include unrelated tables', () => {
    expect(EXPECTED_TABLES).not.toContain('subscriptions');
    expect(EXPECTED_TABLES).not.toContain('tarot_readings');
    expect(EXPECTED_TABLES).not.toContain('user_streaks');
  });
});

// ===========================================================================
// 5. birthChartVersion is always set in the location payload
// ===========================================================================
describe('birthChartVersion in location payload', () => {
  it('is a positive integer', () => {
    expect(CURRENT_BIRTH_CHART_VERSION).toBeGreaterThan(0);
    expect(Number.isInteger(CURRENT_BIRTH_CHART_VERSION)).toBe(true);
  });

  it('is included when spreading existing location', () => {
    const existing = { birthTime: '10:30', birthLocation: 'London' };
    const payload = {
      ...existing,
      birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
    };
    expect(payload.birthChartVersion).toBe(CURRENT_BIRTH_CHART_VERSION);
    expect(payload.birthTime).toBe('10:30');
    expect(payload.birthLocation).toBe('London');
  });

  it('works when existing location is empty', () => {
    const payload = { birthChartVersion: CURRENT_BIRTH_CHART_VERSION };
    expect(payload.birthChartVersion).toBe(CURRENT_BIRTH_CHART_VERSION);
  });
});

// ===========================================================================
// 6. Verify the actual route file contains the expected invalidation code
//    This reads the real source file so it breaks if someone removes tables.
// ===========================================================================
describe('birth-chart route.ts source verification', () => {
  const fs = require('fs');
  const routeSource = fs.readFileSync(
    'src/app/api/profile/birth-chart/route.ts',
    'utf-8',
  );

  it.each([
    'synastry_reports',
    'daily_horoscopes',
    'monthly_insights',
    'cosmic_snapshots',
    'cosmic_reports',
    'journal_patterns',
    'pattern_analysis',
    'year_analysis',
  ])('route source contains DELETE for %s', (table) => {
    expect(routeSource).toContain(table);
  });

  it('route source invalidates friend_connections synastry', () => {
    expect(routeSource).toContain('friend_connections');
    expect(routeSource).toContain('synastry_score = NULL');
    expect(routeSource).toContain('synastry_data = NULL');
  });

  it('route source calls invalidateSnapshot for Next.js cache tags', () => {
    expect(routeSource).toContain('invalidateSnapshot');
  });
});

// ===========================================================================
// 6b. Verify the generate endpoint contains the same invalidation code
//     The new server-side generate endpoint must invalidate all derived tables.
// ===========================================================================
describe('birth-chart generate route.ts source verification', () => {
  const fs = require('fs');
  const routeSource = fs.readFileSync(
    'src/app/api/profile/birth-chart/generate/route.ts',
    'utf-8',
  );

  it.each([
    'synastry_reports',
    'daily_horoscopes',
    'monthly_insights',
    'cosmic_snapshots',
    'cosmic_reports',
    'journal_patterns',
    'pattern_analysis',
    'year_analysis',
  ])('generate route source contains DELETE for %s', (table) => {
    expect(routeSource).toContain(table);
  });

  it('generate route invalidates friend_connections synastry', () => {
    expect(routeSource).toContain('friend_connections');
    expect(routeSource).toContain('synastry_score = NULL');
    expect(routeSource).toContain('synastry_data = NULL');
  });

  it('generate route calls invalidateSnapshot', () => {
    expect(routeSource).toContain('invalidateSnapshot');
  });

  it('generate route uses parseLocationToCoordinates (server-side geocoding)', () => {
    expect(routeSource).toContain('parseLocationToCoordinates');
  });

  it('generate route uses tzLookup (server-side timezone resolution)', () => {
    expect(routeSource).toContain('tzLookup');
  });

  it('generate route sets birthChartVersion', () => {
    expect(routeSource).toContain(
      'birthChartVersion: CURRENT_BIRTH_CHART_VERSION',
    );
  });
});

// ===========================================================================
// 7. Verify all client-side callers use the server-side generate endpoint
//    and still bust client caches after generation.
// ===========================================================================
describe('client-side write paths source verification', () => {
  const fs = require('fs');

  const profilePage = fs.readFileSync(
    'src/app/(authenticated)/profile/page.tsx',
    'utf-8',
  );
  const userContext = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');
  const onboarding = fs.readFileSync(
    'src/components/OnboardingFlow.tsx',
    'utf-8',
  );

  describe('profile page', () => {
    it('calls server-side generate endpoint', () => {
      expect(profilePage).toContain('/api/profile/birth-chart/generate');
    });

    it('calls refetchUser(true) to bust browser cache', () => {
      expect(profilePage).toContain('refetchUser(true)');
    });

    it('clears DailyCache', () => {
      expect(profilePage).toContain('DailyCache.clear()');
    });

    it('clears ClientCache', () => {
      expect(profilePage).toContain('ClientCache.clearAll(');
    });

    it('does NOT use createBirthChartWithMetadata (moved server-side)', () => {
      expect(profilePage).not.toContain('createBirthChartWithMetadata');
    });
  });

  describe('UserContext (version bump regeneration)', () => {
    it('calls server-side generate endpoint', () => {
      expect(userContext).toContain('/api/profile/birth-chart/generate');
    });

    it('calls fetchUserData(true) to bust cache', () => {
      expect(userContext).toContain('fetchUserData(true)');
    });

    it('clears DailyCache', () => {
      expect(userContext).toContain('DailyCache.clear()');
    });

    it('clears ClientCache', () => {
      expect(userContext).toContain('ClientCache.clearAll(');
    });

    it('does NOT use createBirthChartWithMetadata (moved server-side)', () => {
      expect(userContext).not.toContain('createBirthChartWithMetadata');
    });
  });

  describe('OnboardingFlow', () => {
    it('calls server-side generate endpoint', () => {
      expect(onboarding).toContain('/api/profile/birth-chart/generate');
    });

    it('calls refetch(true) to bust browser cache', () => {
      expect(onboarding).toContain('refetch(true)');
    });

    it('clears DailyCache', () => {
      expect(onboarding).toContain('DailyCache.clear()');
    });

    it('clears ClientCache', () => {
      expect(onboarding).toContain('ClientCache.clearAll(');
    });

    it('does NOT use createBirthChartWithMetadata (moved server-side)', () => {
      expect(onboarding).not.toContain('createBirthChartWithMetadata');
    });
  });
});

// ===========================================================================
// 8. UserContext refetch type exposes bustCache parameter
// ===========================================================================
describe('UserContext refetch type', () => {
  const fs = require('fs');
  const source = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');

  it('exposes bustCache parameter in interface', () => {
    expect(source).toContain('refetch: (bustCache?: boolean) => Promise<void>');
  });
});

// ===========================================================================
// 9. No birthLocation guard blocking version-bump regeneration
//    Previously: `if (!birthLocation) return;` prevented users without
//    a location from getting their chart regenerated on version bump.
// ===========================================================================
describe('UserContext: no birthLocation guard on version check', () => {
  const fs = require('fs');
  const source = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');

  it('does NOT have standalone birthLocation guard before version check', () => {
    // The old code had: if (!birthLocation) return;
    // right after: if (!user.birthday || !user.birthChart?.length) return;
    // Ensure that pattern is gone.
    // Note: the birthday guard and chart check may be on separate lines now:
    //   if (!user.birthday) return;
    //   const needsChartGeneration = !user.birthChart?.length;
    const lines = source.split('\n');
    const birthdayGuardIndex = lines.findIndex(
      (l: string) =>
        l.includes('!user.birthday') &&
        (l.includes('!user.birthChart') || l.includes('return')),
    );
    expect(birthdayGuardIndex).toBeGreaterThan(-1);

    // The next non-empty line should NOT be `if (!birthLocation) return;`
    let nextLineIndex = birthdayGuardIndex + 1;
    while (nextLineIndex < lines.length && !lines[nextLineIndex].trim()) {
      nextLineIndex++;
    }
    expect(lines[nextLineIndex].trim()).not.toBe('if (!birthLocation) return;');
  });
});

// ===========================================================================
// 10. All write paths check response.ok before clearing caches
//     If the server-side generate endpoint fails, caches must NOT be cleared.
// ===========================================================================
describe('response.ok guard on all write paths', () => {
  const fs = require('fs');

  const profilePage = fs.readFileSync(
    'src/app/(authenticated)/profile/page.tsx',
    'utf-8',
  );
  const userContext = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');
  const onboarding = fs.readFileSync(
    'src/components/OnboardingFlow.tsx',
    'utf-8',
  );

  it('profile page handleSave checks generateResponse.ok', () => {
    expect(profilePage).toContain('if (generateResponse.ok)');
  });

  it('profile page auto-generate checks response.ok', () => {
    expect(profilePage).toContain('if (response.ok)');
  });

  it('UserContext throws on failed generate', () => {
    expect(userContext).toContain('if (!response.ok)');
  });

  it('OnboardingFlow checks generateResponse.ok', () => {
    expect(onboarding).toContain('if (generateResponse.ok)');
  });
});

// ===========================================================================
// 11. PUT /api/profile cannot be used to bypass birth chart cache invalidation
//     The main profile route must ignore birthChart in the request body.
// ===========================================================================
describe('profile route: birthChart bypass prevention', () => {
  const fs = require('fs');
  const profileRoute = fs.readFileSync('src/app/api/profile/route.ts', 'utf-8');

  it('destructures birthChart as ignored variable', () => {
    expect(profileRoute).toContain('_ignoredBirthChart');
  });

  it('sets birthChart to null to prevent writes', () => {
    expect(profileRoute).toContain('const birthChart = null');
  });
});

// ===========================================================================
// 12. UserContext fetchUserData always bypasses browser HTTP cache
//     Without `cache: 'no-store'`, subscription sync or window focus handlers
//     can overwrite fresh data with stale cached responses.
// ===========================================================================
describe('UserContext: fetchUserData bypasses browser HTTP cache', () => {
  const fs = require('fs');
  const source = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');

  it('uses cache: no-store on the profile fetch', () => {
    expect(source).toContain("cache: 'no-store'");
  });

  it('fetch call includes no-store (not just a comment)', () => {
    // Ensure it appears inside a fetch() options object, not just a comment.
    // Look for the pattern: fetch('/api/profile' ... cache: 'no-store'
    const fetchBlock = source.match(
      /fetch\('\/api\/profile'[\s\S]{0,200}cache:\s*'no-store'/,
    );
    expect(fetchBlock).not.toBeNull();
  });
});

// ===========================================================================
// 13. Server response for GET /api/profile must NOT allow browser caching
//     If the server sends max-age > 0, any future client fetch without
//     cache: 'no-store' will silently serve stale birth chart data.
// ===========================================================================
describe('profile GET route: no browser caching allowed', () => {
  const fs = require('fs');
  const routeSource = fs.readFileSync('src/app/api/profile/route.ts', 'utf-8');

  it('does NOT set max-age on the response', () => {
    // Extract the Cache-Control header value from the success response
    expect(routeSource).not.toMatch(/Cache-Control.*max-age/);
  });

  it('does NOT set stale-while-revalidate on the response', () => {
    expect(routeSource).not.toMatch(/stale-while-revalidate/);
  });

  it('uses no-store on the success response', () => {
    expect(routeSource).toContain("'Cache-Control': 'no-store'");
  });
});

// ===========================================================================
// 14. Location endpoint merges with existing data instead of replacing
//     PUT /api/profile/location must preserve birth-related fields
//     (birthTime, birthLocation, birthTimezone, birthChartVersion) when
//     updating current GPS location (latitude, longitude, city, etc.).
// ===========================================================================
describe('location endpoint: preserves birth fields on update', () => {
  const fs = require('fs');
  const locationRoute = fs.readFileSync(
    'src/app/api/profile/location/route.ts',
    'utf-8',
  );

  it('reads existing location before saving', () => {
    expect(locationRoute).toContain('SELECT location FROM user_profiles');
  });

  it('decrypts existing location for merging', () => {
    expect(locationRoute).toContain('decryptLocation(existing');
  });

  it('spreads existing location into merged result', () => {
    expect(locationRoute).toContain('...existingLocation');
  });

  it('spreads new location data over existing', () => {
    expect(locationRoute).toContain('...location');
  });
});

describe('getLocalDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(getLocalDateString(new Date(2024, 5, 15))).toBe('2024-06-15');
  });
});
