import { CURRENT_BIRTH_CHART_VERSION } from 'utils/astrology/chart-version';

// ===========================================================================
// UserContext auto-regeneration: birthday-only users (age gate signup fix)
//
// When birthday is collected at signup but no birth chart exists yet,
// UserContext must trigger auto-generation on any page load — not just
// when birthChartVersion is outdated.
//
// Mirrors src/context/UserContext.tsx refreshBirthChart effect (~line 282)
// ===========================================================================

describe('UserContext: auto-regeneration for birthday-only users', () => {
  /**
   * EXACT logic from UserContext refreshBirthChart effect.
   * Returns the reason regeneration should fire, or null if it shouldn't.
   */
  function getRegenerationReason(user: {
    birthday?: string;
    birthChart?: any[];
    location?: Record<string, any>;
  }): string | null {
    if (!user.birthday) return null;

    const location = (user.location || {}) as Record<string, any>;
    const birthLocation = location?.birthLocation;
    const birthTimezone = location?.birthTimezone;
    const birthChartVersion = location?.birthChartVersion;

    const needsChartGeneration = !user.birthChart?.length;
    const needsVersionUpdate =
      birthChartVersion !== CURRENT_BIRTH_CHART_VERSION;
    const needsTimezoneUpdate = birthLocation && !birthTimezone;

    if (needsChartGeneration) return 'needsChartGeneration';
    if (needsVersionUpdate) return 'needsVersionUpdate';
    if (needsTimezoneUpdate) return 'needsTimezoneUpdate';
    return null;
  }

  const chart = [{ body: 'Sun', sign: 'Taurus' }];

  // --- The critical new scenario: birthday from signup, no chart ---

  it('triggers chart generation when user has birthday but NO chart (age gate signup)', () => {
    const reason = getRegenerationReason({
      birthday: '1973-05-18',
      birthChart: [],
      location: {},
    });
    expect(reason).toBe('needsChartGeneration');
  });

  it('triggers chart generation when birthChart is undefined', () => {
    const reason = getRegenerationReason({
      birthday: '1973-05-18',
      birthChart: undefined,
      location: {},
    });
    expect(reason).toBe('needsChartGeneration');
  });

  it('triggers chart generation even with no location data at all', () => {
    const reason = getRegenerationReason({
      birthday: '1990-06-15',
      birthChart: [],
      location: undefined,
    });
    expect(reason).toBe('needsChartGeneration');
  });

  // --- Version bump still works ---

  it('triggers version update for outdated chart', () => {
    const reason = getRegenerationReason({
      birthday: '1990-05-15',
      birthChart: chart,
      location: {
        birthTimezone: 'Europe/London',
        birthChartVersion: CURRENT_BIRTH_CHART_VERSION - 1,
      },
    });
    expect(reason).toBe('needsVersionUpdate');
  });

  it('triggers version update when version is undefined (old client-side chart)', () => {
    const reason = getRegenerationReason({
      birthday: '1990-05-15',
      birthChart: chart,
      location: { birthTimezone: 'Europe/London' },
    });
    expect(reason).toBe('needsVersionUpdate');
  });

  // --- Timezone update still works ---

  it('triggers timezone update when location exists but timezone missing', () => {
    const reason = getRegenerationReason({
      birthday: '1990-05-15',
      birthChart: chart,
      location: {
        birthLocation: 'London',
        birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
      },
    });
    expect(reason).toBe('needsTimezoneUpdate');
  });

  // --- Should NOT trigger ---

  it('does NOT trigger when everything is up to date', () => {
    expect(
      getRegenerationReason({
        birthday: '1990-05-15',
        birthChart: chart,
        location: {
          birthLocation: 'London',
          birthTimezone: 'Europe/London',
          birthChartVersion: CURRENT_BIRTH_CHART_VERSION,
        },
      }),
    ).toBeNull();
  });

  it('does NOT trigger without birthday', () => {
    expect(
      getRegenerationReason({ birthChart: chart, location: {} }),
    ).toBeNull();
  });

  it('does NOT trigger with empty birthday string', () => {
    expect(
      getRegenerationReason({ birthday: '', birthChart: chart, location: {} }),
    ).toBeNull();
  });

  // --- Priority: chart generation takes precedence over version update ---

  it('reports needsChartGeneration even when version is also outdated', () => {
    const reason = getRegenerationReason({
      birthday: '1990-05-15',
      birthChart: [],
      location: {
        birthChartVersion: CURRENT_BIRTH_CHART_VERSION - 1,
      },
    });
    expect(reason).toBe('needsChartGeneration');
  });
});

// ===========================================================================
// Structural verification: UserContext source code
// Ensures the birthday-only guard is correct in the actual source file.
// ===========================================================================
describe('UserContext source: birthday-only chart generation guard', () => {
  const fs = require('fs');
  const source = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');

  it('has a standalone birthday guard (if (!user.birthday) return)', () => {
    expect(source).toContain('if (!user.birthday) return');
  });

  it('checks needsChartGeneration (missing birth chart)', () => {
    expect(source).toContain('const needsChartGeneration = !user.birthChart');
  });

  it('includes needsChartGeneration in the skip condition', () => {
    expect(source).toContain('!needsChartGeneration');
    expect(source).toContain('!needsVersionUpdate');
    expect(source).toContain('!needsTimezoneUpdate');
  });

  it('does NOT have the old combined guard that skipped empty charts', () => {
    // The old code: if (!user.birthday || !user.birthChart?.length) return;
    // This blocked auto-generation for users with birthday but no chart
    const lines = source.split('\n');
    const oldGuardLine = lines.find(
      (l: string) =>
        l.includes('!user.birthday') &&
        l.includes('!user.birthChart') &&
        l.includes('return'),
    );
    expect(oldGuardLine).toBeUndefined();
  });
});
