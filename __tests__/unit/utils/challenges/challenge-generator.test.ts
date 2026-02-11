import {
  selectTransitKey,
  generateChallenge,
} from '@/utils/challenges/challenge-generator';
import type { GlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

function createMockCosmicData(
  overrides: Partial<GlobalCosmicData> = {},
): GlobalCosmicData {
  return {
    moonPhase: {
      name: 'Full Moon',
      energy: 'Illumination',
      priority: 9,
      emoji: '',
      illumination: 100,
      age: 14.8,
      isSignificant: true,
    },
    planetaryPositions: {
      Sun: {
        longitude: 15,
        sign: 'Aries',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Moon: {
        longitude: 195,
        sign: 'Libra',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Mercury: {
        longitude: 45,
        sign: 'Taurus',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Venus: {
        longitude: 75,
        sign: 'Gemini',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Mars: {
        longitude: 105,
        sign: 'Cancer',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Jupiter: {
        longitude: 135,
        sign: 'Leo',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Saturn: {
        longitude: 165,
        sign: 'Virgo',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Uranus: {
        longitude: 225,
        sign: 'Scorpio',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Neptune: {
        longitude: 255,
        sign: 'Sagittarius',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Pluto: {
        longitude: 285,
        sign: 'Capricorn',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
    },
    generalTransits: [],
    voidOfCourse: null,
    retrogradeInfo: { planets: [] },
    ...overrides,
  } as GlobalCosmicData;
}

describe('challenge-generator', () => {
  describe('selectTransitKey', () => {
    it('prioritizes retrograde planets', () => {
      const data = createMockCosmicData({
        planetaryPositions: {
          ...createMockCosmicData().planetaryPositions,
          Mercury: {
            longitude: 45,
            sign: 'Taurus',
            degree: 15,
            minutes: 0,
            retrograde: true,
            newRetrograde: false,
            newDirect: false,
          },
        },
      });
      expect(selectTransitKey(data)).toBe('mercury_retrograde');
    });

    it('prioritizes Venus retrograde when Mercury is not retrograde', () => {
      const data = createMockCosmicData({
        planetaryPositions: {
          ...createMockCosmicData().planetaryPositions,
          Venus: {
            longitude: 75,
            sign: 'Gemini',
            degree: 15,
            minutes: 0,
            retrograde: true,
            newRetrograde: false,
            newDirect: false,
          },
        },
      });
      expect(selectTransitKey(data)).toBe('venus_retrograde');
    });

    it('falls back to aspect energy when no retrogrades', () => {
      const data = createMockCosmicData({
        generalTransits: [
          {
            planet1: 'Venus',
            planet2: 'Mars',
            aspect: 'Conjunction',
            orb: 1.5,
            applying: true,
          },
        ] as unknown as GlobalCosmicData['generalTransits'],
      });
      expect(selectTransitKey(data)).toBe('conjunction_energy');
    });

    it('falls back to planet-in-sign combos when no retrogrades or aspects', () => {
      const data = createMockCosmicData({
        planetaryPositions: {
          ...createMockCosmicData().planetaryPositions,
          Venus: {
            longitude: 345,
            sign: 'Pisces',
            degree: 15,
            minutes: 0,
            retrograde: false,
            newRetrograde: false,
            newDirect: false,
          },
        },
      });
      expect(selectTransitKey(data)).toBe('venus_in_pisces');
    });

    it('falls back to moon phase when nothing else matches', () => {
      const data = createMockCosmicData();
      const key = selectTransitKey(data);
      expect(key).toBe('full_moon_week');
    });

    it('returns new_moon_week for New Moon phase fallback', () => {
      const data = createMockCosmicData({
        moonPhase: {
          name: 'New Moon',
          energy: 'Intention',
          priority: 9,
          emoji: '',
          illumination: 0,
          age: 0,
          isSignificant: true,
        },
      });
      const key = selectTransitKey(data);
      expect(key).toBe('new_moon_week');
    });
  });

  describe('generateChallenge', () => {
    it('returns a valid challenge with transitKey and template', () => {
      const data = createMockCosmicData({
        planetaryPositions: {
          ...createMockCosmicData().planetaryPositions,
          Mercury: {
            longitude: 45,
            sign: 'Taurus',
            degree: 15,
            minutes: 0,
            retrograde: true,
            newRetrograde: false,
            newDirect: false,
          },
        },
      });
      const result = generateChallenge(data);
      expect(result).not.toBeNull();
      expect(result!.transitKey).toBe('mercury_retrograde');
      expect(result!.template.dailyPrompts).toHaveLength(7);
      expect(result!.template.title).toBe('Mercury Retrograde Survival');
    });

    it('always returns a result (moon phase fallback guarantees)', () => {
      const data = createMockCosmicData();
      const result = generateChallenge(data);
      expect(result).not.toBeNull();
    });
  });
});
