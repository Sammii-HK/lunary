// Jest globals (describe/it/expect) are provided ambiently via @types/jest, so
// we deliberately do NOT import from '@jest/globals' — that package is not in
// node_modules and importing it breaks the type-check gate (every other test
// that imports it has the same latent issue).
import {
  buildNatalSection,
  enrichTransitSection,
  type NatalChartArray,
} from '@/lib/cosmic-report/personalisation';
import type { CosmicReportSection } from '@/lib/cosmic-report/types';

/**
 * Unit tests for the Cosmic Report personalisation layer.
 *
 * These cover the pure, deterministic logic that makes the paid report richer
 * than the free chart (the natal "Chart Signature" section) and the graceful
 * degradation that keeps the report working when a user has no stored chart.
 *
 * The heavy astronomy-engine path (real house/aspect calculation) is exercised
 * by the route in integration; here we keep it deterministic and fast.
 */

const SAMPLE_CHART: NatalChartArray = [
  { body: 'Sun', sign: 'Leo', house: 5, eclipticLongitude: 130 },
  { body: 'Moon', sign: 'Pisces', house: 12, eclipticLongitude: 345 },
  { body: 'Ascendant', sign: 'Aries', house: 1, eclipticLongitude: 5 },
  { body: 'Mercury', sign: 'Virgo', house: 6, eclipticLongitude: 160 },
  { body: 'Venus', sign: 'Cancer', house: 4, eclipticLongitude: 100 },
];

describe('buildNatalSection', () => {
  it('opens with the Big 3 so the report is unambiguously personalised', () => {
    const section = buildNatalSection(SAMPLE_CHART);
    expect(section).not.toBeNull();
    expect(section?.key).toBe('natal');
    expect(section?.title).toBe('Your Chart Signature');
    expect(section?.summary).toContain('Sun in Leo');
    expect(section?.summary).toContain('Moon in Pisces');
    expect(section?.summary).toContain('Aries rising');
  });

  it('lists key placements with their house so it beats a generic sun-sign read', () => {
    const section = buildNatalSection(SAMPLE_CHART);
    const highlights = section?.highlights ?? [];
    expect(highlights).toContain('Sun in Leo, 5th house');
    expect(highlights).toContain('Moon in Pisces, 12th house');
    expect(highlights).toContain('Mercury in Virgo, 6th house');
  });

  it('returns null when the chart has no Sun (too thin to be meaningful)', () => {
    const thin: NatalChartArray = [{ body: 'Mercury', sign: 'Virgo' }];
    expect(buildNatalSection(thin)).toBeNull();
  });

  it('still renders a Big 3 summary when houses are missing (no birth time)', () => {
    const noHouses: NatalChartArray = [
      { body: 'Sun', sign: 'Leo' },
      { body: 'Moon', sign: 'Pisces' },
    ];
    const section = buildNatalSection(noHouses);
    expect(section?.summary).toContain('Sun in Leo');
    // No "rising" because there is no Ascendant without a birth time.
    expect(section?.summary).not.toContain('rising');
  });
});

describe('enrichTransitSection (graceful degradation)', () => {
  const baseSection: CosmicReportSection = {
    key: 'transits',
    title: 'Planetary Transits',
    summary: 'Some generic transit summary.',
    highlights: ['Mars square Venus (forming)'],
  };

  it('returns the original section unchanged when there is no natal chart', () => {
    expect(enrichTransitSection(baseSection, null)).toBe(baseSection);
  });

  it('returns the original section unchanged when the chart is empty', () => {
    expect(enrichTransitSection(baseSection, [])).toBe(baseSection);
  });
});
