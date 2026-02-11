import { renderHook, act, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';

// Mock the auth chain to prevent better-auth ESM import errors
jest.mock('@/lib/auth-client', () => ({
  betterAuthClient: { getSession: jest.fn().mockResolvedValue(null) },
}));

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => ({
    isAuthenticated: true,
    user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
  }),
}));

jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      birthday: '1990-01-15',
      birthChart: [
        {
          body: 'Sun',
          sign: 'Capricorn',
          degree: 25,
          minute: 10,
          eclipticLongitude: 295.17,
          retrograde: false,
        },
      ],
    },
  }),
}));

jest.mock('@/lib/cache/dailyCache', () => ({
  DailyCache: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  getLocalDateString: jest.fn().mockReturnValue('2025-01-15'),
}));

jest.mock('@/lib/tarot/get-personalized-card', () => ({
  getPersonalizedTarotCard: jest.fn().mockReturnValue({
    name: 'The Star',
    keywords: ['hope', 'inspiration'],
    information: 'A card of hope',
  }),
}));

const mockCosmicData = {
  moonPhase: {
    name: 'Waxing Gibbous',
    energy: 'building',
    priority: 3,
    emoji: '🌔',
    illumination: 0.78,
    age: 10.5,
    isSignificant: false,
  },
  planetaryPositions: {
    Sun: {
      longitude: 295.5,
      sign: 'Capricorn',
      degree: 25,
      minutes: 30,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Moon: {
      longitude: 120.3,
      sign: 'Leo',
      degree: 0,
      minutes: 18,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Mercury: {
      longitude: 280.1,
      sign: 'Capricorn',
      degree: 10,
      minutes: 6,
      retrograde: true,
      newRetrograde: false,
      newDirect: false,
    },
    Venus: {
      longitude: 330.7,
      sign: 'Pisces',
      degree: 0,
      minutes: 42,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Mars: {
      longitude: 95.2,
      sign: 'Cancer',
      degree: 5,
      minutes: 12,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Jupiter: {
      longitude: 45.8,
      sign: 'Taurus',
      degree: 15,
      minutes: 48,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Saturn: {
      longitude: 350.0,
      sign: 'Pisces',
      degree: 20,
      minutes: 0,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Uranus: {
      longitude: 55.4,
      sign: 'Taurus',
      degree: 25,
      minutes: 24,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Neptune: {
      longitude: 357.9,
      sign: 'Pisces',
      degree: 27,
      minutes: 54,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    Pluto: {
      longitude: 301.2,
      sign: 'Aquarius',
      degree: 1,
      minutes: 12,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
  },
  generalTransits: [
    {
      name: 'Sun conjunct Pluto',
      aspect: 'conjunction',
      glyph: '☌',
      planetA: { body: 'Sun' },
      planetB: { body: 'Pluto' },
      energy: 'intense',
      priority: 1,
      separation: 0.3,
    },
  ],
};

// Store original fetch
const originalFetch = global.fetch;

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true });
  // Mock fetch to return cosmic data
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(mockCosmicData),
  }) as unknown as typeof fetch;
});

afterEach(() => {
  jest.useRealTimers();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

// Import after mocks are set up
import {
  AstronomyContextProvider,
  useAstronomyContext,
  useCosmicDate,
  useMoonData,
  usePlanetaryChart,
  useTarotCard,
} from '@/context/AstronomyContext';
import { DailyCache } from '@/lib/cache/dailyCache';

function createWrapper(demoData?: any) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AstronomyContextProvider demoData={demoData}>
        {children}
      </AstronomyContextProvider>
    );
  };
}

// =============================================================================
// Step 1: Baseline tests for current behavior
// =============================================================================

describe('AstronomyContextProvider', () => {
  describe('Provider contract', () => {
    it('renders children without crashing', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it('fetches cosmic data from /api/cosmic/global on mount', async () => {
      const wrapper = createWrapper();
      renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/cosmic/global'),
        );
      });
    });

    it('uses cached data when available', async () => {
      (DailyCache.get as jest.Mock).mockReturnValueOnce(mockCosmicData);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentAstrologicalChart.length).toBeGreaterThan(
          0,
        );
      });
      // Should not fetch when cache is available and refreshKey === 0
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('refreshCosmicData triggers a re-fetch', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Trigger refresh
      act(() => {
        result.current.refreshCosmicData();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Hook return values', () => {
    it('returns all expected fields with correct types', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentAstrologicalChart.length).toBeGreaterThan(
          0,
        );
      });

      expect(result.current).toEqual(
        expect.objectContaining({
          currentAstrologicalChart: expect.any(Array),
          currentMoonPosition: expect.any(Object),
          currentMoonConstellationPosition: expect.any(String),
          currentMoonConstellation: expect.any(Object),
          currentDateTime: expect.any(Date),
          setCurrentDateTime: expect.any(Function),
          currentMoonPhase: expect.any(String),
          moonIllumination: expect.any(Number),
          moonAge: expect.any(Number),
          writtenDate: expect.any(String),
          currentTarotCard: expect.any(Object),
          symbol: expect.any(String),
          currentDate: expect.any(String),
          refreshCosmicData: expect.any(Function),
          generalTransits: expect.any(Array),
        }),
      );
    });

    it('returns safe fallback defaults when used outside provider', () => {
      const { result } = renderHook(() => useAstronomyContext());

      expect(result.current.currentAstrologicalChart).toEqual([]);
      expect(result.current.currentMoonPosition).toBeUndefined();
      expect(result.current.currentMoonPhase).toBe('New Moon');
      expect(result.current.moonIllumination).toBe(0);
      expect(result.current.moonAge).toBe(0);
      expect(result.current.writtenDate).toBe('');
      expect(result.current.currentTarotCard).toBeNull();
      expect(result.current.symbol).toBe('');
      expect(result.current.currentDate).toBeDefined();
      expect(typeof result.current.setCurrentDateTime).toBe('function');
      expect(typeof result.current.refreshCosmicData).toBe('function');
    });
  });

  describe('Computed values', () => {
    it('derives currentAstrologicalChart in solar system order', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentAstrologicalChart.length).toBe(10);
      });

      const bodies = result.current.currentAstrologicalChart.map((c) => c.body);
      expect(bodies).toEqual([
        'Sun',
        'Moon',
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
        'Pluto',
      ]);
    });

    it('derives currentMoonPosition from the chart', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentMoonPosition).toBeDefined();
      });

      expect(result.current.currentMoonPosition?.body).toBe('Moon');
      expect(result.current.currentMoonPosition?.sign).toBe('Leo');
    });

    it('derives moon phase from cosmicData', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentMoonPhase).toBe('Waxing Gibbous');
      });

      expect(result.current.moonIllumination).toBe(0.78);
      expect(result.current.moonAge).toBe(10.5);
    });

    it('derives generalTransits from cosmicData', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.generalTransits).toHaveLength(1);
      });

      expect(result.current.generalTransits[0].name).toBe('Sun conjunct Pluto');
    });
  });

  describe('Demo mode', () => {
    it('overrides moon phase and illumination with demo data', async () => {
      const demoData = {
        currentMoonPhase: 'Full Moon' as const,
        moonIllumination: 1.0,
        moonAge: 14.7,
      };

      const wrapper = createWrapper(demoData);
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      expect(result.current.currentMoonPhase).toBe('Full Moon');
      expect(result.current.moonIllumination).toBe(1.0);
      expect(result.current.moonAge).toBe(14.7);
    });

    it('does not fetch in demo mode', () => {
      const demoData = { currentMoonPhase: 'Full Moon' as const };
      const wrapper = createWrapper(demoData);
      renderHook(() => useAstronomyContext(), { wrapper });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// Step 2: Granular hook tests (RED -> GREEN with the refactoring)
// =============================================================================

describe('Granular hooks', () => {
  describe('useCosmicDate()', () => {
    it('returns date-related fields only', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCosmicDate(), { wrapper });

      expect(result.current).toEqual(
        expect.objectContaining({
          currentDateTime: expect.any(Date),
          setCurrentDateTime: expect.any(Function),
          currentDate: expect.any(String),
          writtenDate: expect.any(String),
        }),
      );

      // Should NOT have moon/planetary fields
      expect(result.current).not.toHaveProperty('currentMoonPhase');
      expect(result.current).not.toHaveProperty('currentAstrologicalChart');
      expect(result.current).not.toHaveProperty('currentTarotCard');
    });

    it('returns fallback defaults when outside provider', () => {
      const { result } = renderHook(() => useCosmicDate());

      expect(result.current.currentDateTime).toBeInstanceOf(Date);
      expect(typeof result.current.setCurrentDateTime).toBe('function');
      expect(typeof result.current.currentDate).toBe('string');
      expect(typeof result.current.writtenDate).toBe('string');
    });
  });

  describe('useMoonData()', () => {
    it('returns moon-related fields only', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useMoonData(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentMoonPhase).toBe('Waxing Gibbous');
      });

      expect(result.current).toEqual(
        expect.objectContaining({
          currentMoonPhase: expect.any(String),
          moonIllumination: expect.any(Number),
          moonAge: expect.any(Number),
          currentMoonPosition: expect.any(Object),
          currentMoonConstellationPosition: expect.any(String),
          symbol: expect.any(String),
        }),
      );

      // Should NOT have date/planetary/tarot fields
      expect(result.current).not.toHaveProperty('currentDateTime');
      expect(result.current).not.toHaveProperty('currentAstrologicalChart');
      expect(result.current).not.toHaveProperty('currentTarotCard');
    });

    it('returns fallback defaults when outside provider', () => {
      const { result } = renderHook(() => useMoonData());

      expect(result.current.currentMoonPhase).toBe('New Moon');
      expect(result.current.moonIllumination).toBe(0);
      expect(result.current.moonAge).toBe(0);
      expect(result.current.currentMoonPosition).toBeUndefined();
      expect(result.current.symbol).toBe('');
    });
  });

  describe('usePlanetaryChart()', () => {
    it('returns planetary chart fields only', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePlanetaryChart(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentAstrologicalChart.length).toBeGreaterThan(
          0,
        );
      });

      expect(result.current).toEqual(
        expect.objectContaining({
          currentAstrologicalChart: expect.any(Array),
          generalTransits: expect.any(Array),
          refreshCosmicData: expect.any(Function),
        }),
      );

      // Should NOT have moon/date/tarot fields
      expect(result.current).not.toHaveProperty('currentMoonPhase');
      expect(result.current).not.toHaveProperty('currentDateTime');
      expect(result.current).not.toHaveProperty('currentTarotCard');
    });

    it('returns fallback defaults when outside provider', () => {
      const { result } = renderHook(() => usePlanetaryChart());

      expect(result.current.currentAstrologicalChart).toEqual([]);
      expect(result.current.generalTransits).toBeUndefined();
      expect(typeof result.current.refreshCosmicData).toBe('function');
    });
  });

  describe('useTarotCard()', () => {
    it('returns tarot card only', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTarotCard(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentTarotCard).toBeDefined();
      });

      expect(result.current).toEqual(
        expect.objectContaining({
          currentTarotCard: expect.any(Object),
        }),
      );

      // Should NOT have other fields
      expect(result.current).not.toHaveProperty('currentMoonPhase');
      expect(result.current).not.toHaveProperty('currentAstrologicalChart');
      expect(result.current).not.toHaveProperty('currentDateTime');
    });

    it('returns fallback defaults when outside provider', () => {
      const { result } = renderHook(() => useTarotCard());

      expect(result.current.currentTarotCard).toBeNull();
    });
  });

  describe('useAstronomyContext() backwards compatibility', () => {
    it('still returns ALL fields when composed from sub-hooks', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAstronomyContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentAstrologicalChart.length).toBeGreaterThan(
          0,
        );
      });

      // All fields from all sub-contexts should be present
      expect(result.current.currentDateTime).toBeInstanceOf(Date);
      expect(result.current.currentDate).toBeDefined();
      expect(result.current.writtenDate).toBeDefined();
      expect(result.current.setCurrentDateTime).toBeDefined();
      expect(result.current.currentMoonPhase).toBeDefined();
      expect(result.current.moonIllumination).toBeDefined();
      expect(result.current.moonAge).toBeDefined();
      expect(result.current.currentMoonPosition).toBeDefined();
      expect(result.current.symbol).toBeDefined();
      expect(result.current.currentAstrologicalChart).toBeDefined();
      expect(result.current.generalTransits).toBeDefined();
      expect(result.current.refreshCosmicData).toBeDefined();
      expect(result.current.currentTarotCard).toBeDefined();
    });
  });
});
