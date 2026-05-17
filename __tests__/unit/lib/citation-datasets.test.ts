import {
  buildCoreAstrologyDataset,
  buildCurrentSkyFacts,
} from '@/lib/seo/citation-datasets';

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
});
