// Mock dependencies before importing the module under test
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('tz-lookup', () => jest.fn(() => 'America/New_York'));

jest.mock('../../../../utils/astrology/birthChart', () => ({
  generateBirthChart: jest.fn(async () => [
    {
      body: 'Sun',
      sign: 'Aries',
      degree: 15,
      minute: 30,
      eclipticLongitude: 15.5,
      retrograde: false,
    },
  ]),
  parseLocationToCoordinates: jest.fn(async () => ({
    latitude: 40.7128,
    longitude: -74.006,
  })),
}));

import {
  ensureRelationshipChartFresh,
  isValidChart,
  recentRegenCache,
  inFlightMap,
} from '../../../../utils/astrology/regenerateRelationshipChart';
import { CURRENT_BIRTH_CHART_VERSION } from '../../../../utils/astrology/chart-version';
import { sql } from '@vercel/postgres';
import { generateBirthChart } from '../../../../utils/astrology/birthChart';

describe('ensureRelationshipChartFresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recentRegenCache.clear();
    inFlightMap.clear();
  });

  it('returns existing chart when version matches', async () => {
    const existingChart = [
      {
        body: 'Moon',
        sign: 'Taurus',
        degree: 10,
        minute: 0,
        eclipticLongitude: 40,
        retrograde: false,
      },
    ];

    const result = await ensureRelationshipChartFresh({
      id: 'test-id',
      birthday: '1990-01-01',
      birth_chart: existingChart,
      birth_chart_version: CURRENT_BIRTH_CHART_VERSION,
    });

    expect(result.regenerated).toBe(false);
    expect(result.chart).toEqual(existingChart);
    expect(generateBirthChart).not.toHaveBeenCalled();
  });

  it('regenerates when version is stale', async () => {
    (sql as unknown as jest.Mock).mockResolvedValue({
      rows: [],
    });

    const result = await ensureRelationshipChartFresh({
      id: 'test-id',
      birthday: '1990-01-01',
      birth_location: 'New York, NY',
      birth_chart: [],
      birth_chart_version: 0,
    });

    expect(result.regenerated).toBe(true);
    expect(result.chart).toBeDefined();
    expect(result.chart!.length).toBeGreaterThan(0);
    expect(generateBirthChart).toHaveBeenCalledWith(
      '1990-01-01',
      undefined,
      'New York, NY',
      'America/New_York',
    );
    expect(sql).toHaveBeenCalled();
  });

  it('handles missing birthday gracefully', async () => {
    const result = await ensureRelationshipChartFresh({
      id: 'test-id',
      birthday: '',
      birth_chart: null,
      birth_chart_version: 0,
    });

    expect(result.regenerated).toBe(false);
    expect(result.chart).toBeNull();
    expect(generateBirthChart).not.toHaveBeenCalled();
  });

  it('regenerates without timezone when birth_location is missing', async () => {
    (sql as unknown as jest.Mock).mockResolvedValue({
      rows: [],
    });

    const result = await ensureRelationshipChartFresh({
      id: 'test-id',
      birthday: '1995-06-15',
      birth_chart: null,
      birth_chart_version: 0,
    });

    expect(result.regenerated).toBe(true);
    expect(generateBirthChart).toHaveBeenCalledWith(
      '1995-06-15',
      undefined,
      undefined,
      undefined,
    );
  });

  it('returns existing chart on regeneration error', async () => {
    const existingChart = [
      {
        body: 'Sun',
        sign: 'Leo',
        degree: 5,
        minute: 20,
        eclipticLongitude: 125.33,
        retrograde: false,
      },
    ];

    (generateBirthChart as jest.Mock).mockRejectedValueOnce(
      new Error('Chart generation failed'),
    );

    const result = await ensureRelationshipChartFresh({
      id: 'test-id',
      birthday: '1990-01-01',
      birth_chart: existingChart,
      birth_chart_version: 0,
    });

    expect(result.regenerated).toBe(false);
    expect(result.chart).toEqual(existingChart);
  });

  describe('empty chart validation', () => {
    it('rejects empty array and keeps existing chart', async () => {
      const existingChart = [
        {
          body: 'Mars',
          sign: 'Scorpio',
          degree: 20,
          minute: 15,
          eclipticLongitude: 230.25,
          retrograde: false,
        },
      ];

      (generateBirthChart as jest.Mock).mockResolvedValueOnce([]);

      const result = await ensureRelationshipChartFresh({
        id: 'test-empty',
        birthday: '1990-01-01',
        birth_chart: existingChart,
        birth_chart_version: 0,
      });

      expect(result.regenerated).toBe(false);
      expect(result.chart).toEqual(existingChart);
      // Should NOT have attempted DB persist
      expect(sql).not.toHaveBeenCalled();
    });

    it('rejects chart entries missing required fields', async () => {
      const existingChart = [
        {
          body: 'Venus',
          sign: 'Libra',
          degree: 10,
          minute: 0,
          eclipticLongitude: 190,
          retrograde: false,
        },
      ];

      // Return entries with missing body/sign
      (generateBirthChart as jest.Mock).mockResolvedValueOnce([
        { degree: 15, minute: 0, eclipticLongitude: 15, retrograde: false },
      ]);

      const result = await ensureRelationshipChartFresh({
        id: 'test-invalid',
        birthday: '1990-01-01',
        birth_chart: existingChart,
        birth_chart_version: 0,
      });

      expect(result.regenerated).toBe(false);
      expect(result.chart).toEqual(existingChart);
    });
  });

  describe('TTL cache', () => {
    it('serves from cache when DB persist failed recently', async () => {
      // Simulate a cached regeneration
      const cachedChart = [
        {
          body: 'Jupiter',
          sign: 'Sagittarius',
          degree: 5,
          minute: 0,
          eclipticLongitude: 245,
          retrograde: false,
        },
      ];

      recentRegenCache.set('test-cached', {
        chart: cachedChart,
        expiresAt: Date.now() + 300_000, // 5 min from now
      });

      const result = await ensureRelationshipChartFresh({
        id: 'test-cached',
        birthday: '1990-01-01',
        birth_chart: null,
        birth_chart_version: 0,
      });

      expect(result.regenerated).toBe(false);
      expect(result.chart).toEqual(cachedChart);
      expect(generateBirthChart).not.toHaveBeenCalled();
    });

    it('ignores expired cache entries', async () => {
      recentRegenCache.set('test-expired', {
        chart: [],
        expiresAt: Date.now() - 1000, // already expired
      });

      (sql as unknown as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await ensureRelationshipChartFresh({
        id: 'test-expired',
        birthday: '1990-01-01',
        birth_chart: null,
        birth_chart_version: 0,
      });

      expect(result.regenerated).toBe(true);
      expect(generateBirthChart).toHaveBeenCalled();
    });

    it('populates cache when DB persist fails completely', async () => {
      (sql as unknown as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await ensureRelationshipChartFresh({
        id: 'test-db-fail',
        birthday: '1990-01-01',
        birth_chart: null,
        birth_chart_version: 0,
      });

      expect(result.regenerated).toBe(true);
      expect(result.chart!.length).toBeGreaterThan(0);

      // Cache should now be populated
      const cached = recentRegenCache.get('test-db-fail');
      expect(cached).toBeDefined();
      expect(cached!.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('in-flight deduplication', () => {
    it('shares a single generation across concurrent calls', async () => {
      // Make generateBirthChart slow so both calls overlap
      let resolveGeneration: (v: any) => void;
      (generateBirthChart as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveGeneration = resolve;
          }),
      );

      (sql as unknown as jest.Mock).mockResolvedValue({ rows: [] });

      const profile = {
        id: 'test-dedup',
        birthday: '1990-01-01',
        birth_chart: null as any,
        birth_chart_version: 0,
      };

      // Start two concurrent calls
      const p1 = ensureRelationshipChartFresh(profile);
      const p2 = ensureRelationshipChartFresh(profile);

      // Resolve the single generation
      resolveGeneration!([
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 15,
          minute: 30,
          eclipticLongitude: 15.5,
          retrograde: false,
        },
      ]);

      const [r1, r2] = await Promise.all([p1, p2]);

      // Both should get the same result
      expect(r1.chart).toEqual(r2.chart);
      expect(r1.regenerated).toBe(true);
      expect(r2.regenerated).toBe(true);

      // generateBirthChart should only have been called ONCE
      expect(generateBirthChart).toHaveBeenCalledTimes(1);
    });
  });
});

describe('isValidChart', () => {
  it('returns true for valid chart with body and sign', () => {
    expect(
      isValidChart([
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 15,
          minute: 30,
          eclipticLongitude: 15.5,
          retrograde: false,
        },
      ] as any),
    ).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(isValidChart([])).toBe(false);
  });

  it('returns false for entries missing body', () => {
    expect(
      isValidChart([
        {
          sign: 'Aries',
          degree: 15,
          minute: 0,
          eclipticLongitude: 15,
          retrograde: false,
        },
      ] as any),
    ).toBe(false);
  });

  it('returns false for entries missing sign', () => {
    expect(
      isValidChart([
        {
          body: 'Sun',
          degree: 15,
          minute: 0,
          eclipticLongitude: 15,
          retrograde: false,
        },
      ] as any),
    ).toBe(false);
  });

  it('returns true when at least one entry is valid among invalid ones', () => {
    expect(
      isValidChart([
        { degree: 15 } as any,
        {
          body: 'Moon',
          sign: 'Cancer',
          degree: 10,
          minute: 0,
          eclipticLongitude: 100,
          retrograde: false,
        },
      ] as any),
    ).toBe(true);
  });
});
