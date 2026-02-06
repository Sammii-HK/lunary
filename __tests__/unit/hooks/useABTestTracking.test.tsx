import { renderHook, waitFor } from '@testing-library/react';
import {
  useABTestTracking,
  useABTestConversion,
} from '@/hooks/useABTestTracking';

// Mock dependencies
const mockUseFeatureFlagVariant = jest.fn();
const mockGetABTestMetadataFromVariant = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlagVariant: (flag: string) => mockUseFeatureFlagVariant(flag),
}));

jest.mock('@/lib/ab-test-tracking', () => ({
  getABTestMetadataFromVariant: (test: string, variant: any) =>
    mockGetABTestMetadataFromVariant(test, variant),
}));

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn((...args) => mockTrackEvent(...args)),
}));

describe('useABTestTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no variants active (user not in any test)
    mockUseFeatureFlagVariant.mockReturnValue(null);
    mockGetABTestMetadataFromVariant.mockReturnValue(null);
  });

  describe('Critical: Event tracking for users NOT in A/B tests', () => {
    it('should track app_opened event when user is NOT in any test but flags resolved', async () => {
      // Simulate PostHog loaded but user not in any test (flags return false/null variants)
      // At least one flag must return a non-undefined value to signal "resolved"
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return false; // resolved but not in test
        return undefined;
      });
      mockGetABTestMetadataFromVariant.mockReturnValue(null);

      renderHook(() =>
        useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith('app_opened', {
          pagePath: '/dashboard',
          metadata: {
            page: 'dashboard',
          },
        });
      });
    });

    it('should NOT fire events before PostHog flags resolve', async () => {
      // All flags return undefined — PostHog hasn't loaded
      mockUseFeatureFlagVariant.mockReturnValue(undefined);
      mockGetABTestMetadataFromVariant.mockReturnValue(null);

      renderHook(() => useABTestTracking('dashboard', 'app_opened'));

      // Should not fire any events yet
      expect(mockTrackEvent).not.toHaveBeenCalled();
    });

    it('should fire exactly 1 event when flags resolved but no tests active', async () => {
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return false;
        return undefined;
      });
      mockGetABTestMetadataFromVariant.mockReturnValue(null);

      renderHook(() => useABTestTracking('dashboard', 'app_opened'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Critical: ALL active tests must be tracked independently', () => {
    it('should fire one event PER active test when user is in multiple tests', async () => {
      // User is in 3 tests simultaneously
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return 'mystical';
        if (flag === 'paywall_preview_style_v1') return 'blur';
        if (flag === 'feature_preview_blur_v1') return 'peek';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'cta-copy-test' && variant === 'mystical') {
            return { abTest: 'cta_copy', abVariant: 'mystical' };
          }
          if (test === 'paywall_preview_style_v1' && variant === 'blur') {
            return { abTest: 'paywall_preview', abVariant: 'blur' };
          }
          if (test === 'feature_preview_blur_v1' && variant === 'peek') {
            return { abTest: 'feature_preview', abVariant: 'peek' };
          }
          return null;
        },
      );

      renderHook(() => useABTestTracking('horoscope', 'page_viewed'));

      await waitFor(() => {
        // Must fire 3 separate events — one per active test
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
      // Simulate user assigned to ALL 8 PostHog tests
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        const variants: Record<string, string> = {
          'cta-copy-test': 'no-verb',
          paywall_preview_style_v1: 'blur',
          'homepage-features-test': 'four-cards-updated',
          feature_preview_blur_v1: 'peek',
          'transit-overflow-style': 'blurred',
          'weekly-lock-style': 'heavy-blur',
          'tarot-truncation-length': 'short',
          'transit-limit-test': 'one-transit',
        };
        return variants[flag] ?? null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (variant) {
            // Return mapped test name (mimics real mapping)
            const mapping: Record<string, string> = {
              'cta-copy-test': 'cta_copy',
              paywall_preview_style_v1: 'paywall_preview',
              'homepage-features-test': 'homepage_features',
              feature_preview_blur_v1: 'feature_preview',
              'transit-overflow-style': 'transit_overflow',
              'weekly-lock-style': 'weekly_lock',
              'tarot-truncation-length': 'tarot_truncation',
              'transit-limit-test': 'transit_limit',
            };
            if (mapping[test]) {
              return { abTest: mapping[test], abVariant: variant };
            }
          }
          return null;
        },
      );

      renderHook(() => useABTestTracking('horoscope', 'page_viewed'));

      await waitFor(() => {
        // All 8 tests should fire separate events
        expect(mockTrackEvent).toHaveBeenCalledTimes(8);

        // Verify each test name appears in exactly one call
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
      // User is in 4 tests but page only tracks 2
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return 'mystical';
        if (flag === 'paywall_preview_style_v1') return 'blur';
        if (flag === 'feature_preview_blur_v1') return 'peek';
        if (flag === 'transit-overflow-style') return 'blurred';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (variant) {
            const mapping: Record<string, string> = {
              'cta-copy-test': 'cta_copy',
              paywall_preview_style_v1: 'paywall_preview',
              feature_preview_blur_v1: 'feature_preview',
              'transit-overflow-style': 'transit_overflow',
            };
            if (mapping[test]) {
              return { abTest: mapping[test], abVariant: variant };
            }
          }
          return null;
        },
      );

      // Only track cta-copy-test and feature_preview_blur_v1
      renderHook(() =>
        useABTestTracking('horoscope', 'page_viewed', [
          'cta-copy-test',
          'feature_preview_blur_v1',
        ]),
      );

      await waitFor(() => {
        // Only 2 events for the filtered tests
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

    it('should track multivariate variant keys correctly (not normalize to A/B)', async () => {
      // Tests use multivariate keys like "blur", "peek", "heavy-blur" — not "A"/"B"
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'weekly-lock-style') return 'heavy-blur';
        if (flag === 'tarot-truncation-length') return 'short';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'weekly-lock-style' && variant === 'heavy-blur') {
            return { abTest: 'weekly_lock', abVariant: 'heavy-blur' };
          }
          if (test === 'tarot-truncation-length' && variant === 'short') {
            return { abTest: 'tarot_truncation', abVariant: 'short' };
          }
          return null;
        },
      );

      renderHook(() =>
        useABTestTracking('tarot', 'page_viewed', [
          'weekly-lock-style',
          'tarot-truncation-length',
        ]),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledTimes(2);

        // Variant keys should be the actual PostHog multivariate values
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
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return 'mystical';
        if (flag === 'paywall_preview_style_v1') return 'blur';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'cta-copy-test' && variant === 'mystical') {
            return { abTest: 'cta_copy', abVariant: 'mystical' };
          }
          if (test === 'paywall_preview_style_v1' && variant === 'blur') {
            return { abTest: 'paywall_preview', abVariant: 'blur' };
          }
          return null;
        },
      );

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
      // abMetadata returns first for backward compatibility
      expect(result.current.abMetadata).toEqual({
        abTest: 'cta_copy',
        abVariant: 'mystical',
      });
    });
  });
});

describe('useABTestConversion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureFlagVariant.mockReturnValue(null);
    mockGetABTestMetadataFromVariant.mockReturnValue(null);
  });

  it('should track conversion events without A/B metadata when user is not in a test', () => {
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
    mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
      if (flag === 'cta-copy-test') return 'mystical';
      if (flag === 'paywall_preview_style_v1') return 'blur';
      if (flag === 'feature_preview_blur_v1') return 'peek';
      return null;
    });

    mockGetABTestMetadataFromVariant.mockImplementation(
      (test: string, variant: any) => {
        if (test === 'cta-copy-test' && variant === 'mystical') {
          return { abTest: 'cta_copy', abVariant: 'mystical' };
        }
        if (test === 'paywall_preview_style_v1' && variant === 'blur') {
          return { abTest: 'paywall_preview', abVariant: 'blur' };
        }
        if (test === 'feature_preview_blur_v1' && variant === 'peek') {
          return { abTest: 'feature_preview', abVariant: 'peek' };
        }
        return null;
      },
    );

    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });

    // 3 conversion events — one per active test
    expect(mockTrackEvent).toHaveBeenCalledTimes(3);

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: {
        abTest: 'cta_copy',
        abVariant: 'mystical',
      },
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: {
        abTest: 'paywall_preview',
        abVariant: 'blur',
      },
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: {
        abTest: 'feature_preview',
        abVariant: 'peek',
      },
    });
  });

  it('should preserve existing metadata when adding A/B data', () => {
    mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
      if (flag === 'cta-copy-test') return 'mystical';
      return null;
    });

    mockGetABTestMetadataFromVariant.mockImplementation(
      (test: string, variant: any) => {
        if (test === 'cta-copy-test' && variant === 'mystical') {
          return { abTest: 'cta_copy', abVariant: 'mystical' };
        }
        return null;
      },
    );

    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: {
        custom_field: 'custom_value',
      },
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
