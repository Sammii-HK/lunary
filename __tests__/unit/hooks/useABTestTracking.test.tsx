import { renderHook, waitFor } from '@testing-library/react';
import {
  useABTestTracking,
  useABTestConversion,
} from '@/hooks/useABTestTracking';

// Mock dependencies
const mockGetABTestVariantClient = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock('@/lib/ab-tests-client', () => ({
  getABTestVariantClient: (testName: string) =>
    mockGetABTestVariantClient(testName),
}));

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn((...args) => mockTrackEvent(...args)),
}));

describe('useABTestTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetABTestVariantClient.mockReturnValue(undefined);
  });

  describe('Cookie-based variant reading (no PostHog timing dependency)', () => {
    it('should read variants from cookie immediately on first render', () => {
      mockGetABTestVariantClient.mockImplementation((testName: string) => {
        if (testName === 'cta-copy-test') return 'mystical';
        return undefined;
      });

      const { result } = renderHook(() =>
        useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']),
      );

      // Available immediately — no waiting for PostHog
      expect(result.current.hasActiveTest).toBe(true);
      expect(result.current.activeTests).toContainEqual({
        abTest: 'cta_copy',
        abVariant: 'mystical',
      });
    });
  });

  describe('Event tracking for users NOT in A/B tests', () => {
    it('should fire 1 bare event when no tests are active', async () => {
      renderHook(() =>
        useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(1);
        expect(mockTrackEvent).toHaveBeenCalledWith('app_opened', {
          pagePath: '/dashboard',
          metadata: { page: 'dashboard' },
        });
      });
    });
  });

  describe('Critical: ALL active tests must be tracked independently', () => {
    it('should fire one event PER active test when user is in multiple tests', async () => {
      mockGetABTestVariantClient.mockImplementation((testName: string) => {
        const variants: Record<string, string> = {
          'cta-copy-test': 'mystical',
          paywall_preview_style_v1: 'blur',
          feature_preview_blur_v1: 'peek',
        };
        return variants[testName];
      });

      renderHook(() => useABTestTracking('horoscope', 'page_viewed'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(3);

        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/horoscope',
          metadata: {
            abTest: 'cta_copy',
            abVariant: 'mystical',
            page: 'horoscope',
          },
        });

        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/horoscope',
          metadata: {
            abTest: 'paywall_preview',
            abVariant: 'blur',
            page: 'horoscope',
          },
        });

        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/horoscope',
          metadata: {
            abTest: 'feature_preview',
            abVariant: 'peek',
            page: 'horoscope',
          },
        });
      });
    });

    it('should track all 8 PostHog tests when user is in all of them', async () => {
      const allVariants: Record<string, string> = {
        'cta-copy-test': 'no-verb',
        paywall_preview_style_v1: 'blur',
        'homepage-features-test': 'four-cards-updated',
        feature_preview_blur_v1: 'peek',
        'transit-overflow-style': 'blurred',
        'weekly-lock-style': 'heavy-blur',
        'tarot-truncation-length': 'short',
        'transit-limit-test': 'one-transit',
      };

      mockGetABTestVariantClient.mockImplementation(
        (testName: string) => allVariants[testName],
      );

      renderHook(() => useABTestTracking('horoscope', 'page_viewed'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(8);

        const trackedTests = mockTrackEvent.mock.calls.map(
          (call: any[]) => call[1]?.metadata?.abTest,
        );
        expect(trackedTests).toContain('cta_copy');
        expect(trackedTests).toContain('paywall_preview');
        expect(trackedTests).toContain('homepage_features');
        expect(trackedTests).toContain('feature_preview');
        expect(trackedTests).toContain('transit_overflow');
        expect(trackedTests).toContain('weekly_lock');
        expect(trackedTests).toContain('tarot_truncation');
        expect(trackedTests).toContain('transit_limit');
      });
    });

    it('should only track filtered tests when tests parameter is provided', async () => {
      const allVariants: Record<string, string> = {
        'cta-copy-test': 'mystical',
        paywall_preview_style_v1: 'blur',
        feature_preview_blur_v1: 'peek',
        'transit-overflow-style': 'blurred',
      };

      mockGetABTestVariantClient.mockImplementation(
        (testName: string) => allVariants[testName],
      );

      renderHook(() =>
        useABTestTracking('horoscope', 'page_viewed', [
          'cta-copy-test',
          'feature_preview_blur_v1',
        ]),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(2);

        const trackedTests = mockTrackEvent.mock.calls.map(
          (call: any[]) => call[1]?.metadata?.abTest,
        );
        expect(trackedTests).toContain('cta_copy');
        expect(trackedTests).toContain('feature_preview');
        expect(trackedTests).not.toContain('paywall_preview');
        expect(trackedTests).not.toContain('transit_overflow');
      });
    });

    it('should track multivariate variant keys correctly', async () => {
      mockGetABTestVariantClient.mockImplementation((testName: string) => {
        if (testName === 'weekly-lock-style') return 'heavy-blur';
        if (testName === 'tarot-truncation-length') return 'short';
        return undefined;
      });

      renderHook(() =>
        useABTestTracking('tarot', 'page_viewed', [
          'weekly-lock-style',
          'tarot-truncation-length',
        ]),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(2);

        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/tarot',
          metadata: {
            abTest: 'weekly_lock',
            abVariant: 'heavy-blur',
            page: 'tarot',
          },
        });

        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/tarot',
          metadata: {
            abTest: 'tarot_truncation',
            abVariant: 'short',
            page: 'tarot',
          },
        });
      });
    });
  });

  describe('Return values', () => {
    it('should return hasActiveTest=false when user is not in any test', () => {
      const { result } = renderHook(() =>
        useABTestTracking('dashboard', 'app_opened'),
      );

      expect(result.current.hasActiveTest).toBe(false);
      expect(result.current.abMetadata).toBe(null);
      expect(result.current.activeTests).toEqual([]);
    });

    it('should return activeTests with all active tests', () => {
      mockGetABTestVariantClient.mockImplementation((testName: string) => {
        if (testName === 'cta-copy-test') return 'mystical';
        if (testName === 'paywall_preview_style_v1') return 'blur';
        return undefined;
      });

      const { result } = renderHook(() =>
        useABTestTracking('dashboard', 'app_opened'),
      );

      expect(result.current.hasActiveTest).toBe(true);
      expect(result.current.activeTests).toHaveLength(2);
      expect(result.current.activeTests).toContainEqual({
        abTest: 'cta_copy',
        abVariant: 'mystical',
      });
      expect(result.current.activeTests).toContainEqual({
        abTest: 'paywall_preview',
        abVariant: 'blur',
      });
    });
  });
});

describe('useABTestConversion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetABTestVariantClient.mockReturnValue(undefined);
  });

  it('should track conversion without A/B metadata when user is not in a test', () => {
    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });
  });

  it('should fire one conversion event PER active test', () => {
    mockGetABTestVariantClient.mockImplementation((testName: string) => {
      const variants: Record<string, string> = {
        'cta-copy-test': 'mystical',
        paywall_preview_style_v1: 'blur',
        feature_preview_blur_v1: 'peek',
      };
      return variants[testName];
    });

    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(3);

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: { abTest: 'cta_copy', abVariant: 'mystical' },
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: { abTest: 'paywall_preview', abVariant: 'blur' },
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: { abTest: 'feature_preview', abVariant: 'peek' },
    });
  });

  it('should preserve existing metadata when adding A/B data', () => {
    mockGetABTestVariantClient.mockImplementation((testName: string) => {
      if (testName === 'cta-copy-test') return 'mystical';
      return undefined;
    });

    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: { custom_field: 'custom_value' },
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: {
        abTest: 'cta_copy',
        abVariant: 'mystical',
        custom_field: 'custom_value',
      },
    });
  });
});
