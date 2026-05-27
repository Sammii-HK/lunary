// Mock next/cache so unstable_cache works outside the Next.js runtime
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock the DB-backed snapshot store — no DB available in unit tests
jest.mock('@/lib/seo/citation-snapshot-store', () => ({
  ...jest.requireActual('@/lib/seo/citation-snapshot-store'),
  getCurrentSkySnapshot: jest.fn().mockResolvedValue(null),
}));

import {
  buildCoreAstrologyDataset,
  buildCurrentSkyFacts,
} from '@/lib/seo/citation-datasets';
import { GET as getCoreSnapshot } from '@/app/grimoire/datasets/core-astrology-2026-05-17.json/route';
import { GET as getSkySnapshot } from '@/app/grimoire/datasets/current-sky/[date]/route';

describe('citation datasets', () => {
  it('builds the core astrology dataset with citeable entity groups', () => {
    const dataset = buildCoreAstrologyDataset();

    expect(dataset.methodology).toBe('https://lunary.app/about/methodology');
    expect(dataset.glossaryTerms.length).toBeGreaterThan(50);
    expect(dataset.zodiacSigns).toHaveLength(12);
    expect(dataset.houses).toHaveLength(12);
    expect(dataset.aspects.length).toBeGreaterThanOrEqual(5);
    expect(dataset.moonPhases).toHaveLength(8);
    expect(dataset.glossaryTerms[0]).toEqual(
      expect.objectContaining({
        term: expect.any(String),
        definition: expect.any(String),
        url: expect.stringContaining('/grimoire/glossary/'),
      }),
    );
  });

  it('builds stable current sky facts for a fixed date', () => {
    const facts = buildCurrentSkyFacts(new Date('2026-05-17T12:00:00Z'));

    expect(facts.validForDateUtc).toBe('2026-05-17');
    expect(facts.methodology).toBe('https://lunary.app/about/methodology');
    expect(facts.moon).toEqual(
      expect.objectContaining({
        phase: expect.any(String),
        sign: expect.any(String),
        illuminationPercent: expect.any(Number),
        phaseAngleDegrees: expect.any(Number),
      }),
    );
    expect(facts.sun.sign).toBe('Taurus');
    expect(facts.planets).toHaveLength(5);
  });

  it('serves a versioned core astrology dataset snapshot', async () => {
    const response = await getCoreSnapshot();
    const body = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        snapshot: true,
        snapshotDate: '2026-05-17',
        latestVersion:
          'https://lunary.app/grimoire/datasets/core-astrology.json',
        url: 'https://lunary.app/grimoire/datasets/core-astrology-2026-05-17.json',
      }),
    );
  });

  it('serves and validates dated current sky snapshots', async () => {
    const response = await getSkySnapshot(new Request('https://lunary.app'), {
      params: Promise.resolve({ date: '2026-05-17' }),
    });
    const body = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        snapshot: true,
        snapshotDate: '2026-05-17',
        validForDateUtc: '2026-05-17',
        url: 'https://lunary.app/grimoire/datasets/current-sky/2026-05-17',
      }),
    );

    const invalid = await getSkySnapshot(new Request('https://lunary.app'), {
      params: Promise.resolve({ date: '2026-13-99' }),
    });

    expect(invalid.status).toBe(404);
  });
});
