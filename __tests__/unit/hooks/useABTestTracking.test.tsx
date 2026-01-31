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
    it('should track app_opened event even when user is NOT in any A/B test', async () => {
      // User is not in any A/B test
      mockUseFeatureFlagVariant.mockReturnValue(null);
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

    it('should track page_viewed event even when user is NOT in any A/B test', async () => {
      // User is not in any A/B test
      mockUseFeatureFlagVariant.mockReturnValue(null);
      mockGetABTestMetadataFromVariant.mockReturnValue(null);

      renderHook(() =>
        useABTestTracking('horoscope', 'page_viewed', ['cta-copy-test']),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/horoscope',
          metadata: {
            page: 'horoscope',
          },
        });
      });
    });

    it('should track events for all pages regardless of A/B test participation', async () => {
      // User is not in any A/B test
      mockUseFeatureFlagVariant.mockReturnValue(null);
      mockGetABTestMetadataFromVariant.mockReturnValue(null);

      const pages = ['dashboard', 'tarot', 'horoscope', 'welcome'];

      for (const page of pages) {
        jest.clearAllMocks();
        renderHook(() => useABTestTracking(page, 'page_viewed'));

        await waitFor(() => {
          expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
            pagePath: `/${page}`,
            metadata: {
              page,
            },
          });
        });
      }
    });
  });

  describe('Event tracking for users IN A/B tests', () => {
    it('should track app_opened WITH A/B metadata when user is in a test', async () => {
      // User is in the cta-copy-test with variant "mystical"
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return 'mystical';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'cta-copy-test' && variant === 'mystical') {
            return {
              ab_test: 'cta-copy-test',
              ab_variant: 'mystical',
            };
          }
          return null;
        },
      );

      renderHook(() =>
        useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']),
      );

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith('app_opened', {
          pagePath: '/dashboard',
          metadata: {
            ab_test: 'cta-copy-test',
            ab_variant: 'mystical',
            page: 'dashboard',
          },
        });
      });
    });

    it('should include A/B metadata for page_viewed events when user is in a test', async () => {
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'paywall_preview_style_v1') return 'blur';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'paywall_preview_style_v1' && variant === 'blur') {
            return {
              ab_test: 'paywall_preview_style_v1',
              ab_variant: 'blur',
            };
          }
          return null;
        },
      );

      renderHook(() => useABTestTracking('tarot', 'page_viewed'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/tarot',
          metadata: {
            ab_test: 'paywall_preview_style_v1',
            ab_variant: 'blur',
            page: 'tarot',
          },
        });
      });
    });

    it('should prioritize first active test when user is in multiple tests', async () => {
      // User is in multiple tests
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return 'mystical';
        if (flag === 'paywall_preview_style_v1') return 'blur';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'cta-copy-test' && variant === 'mystical') {
            return {
              ab_test: 'cta-copy-test',
              ab_variant: 'mystical',
            };
          }
          if (test === 'paywall_preview_style_v1' && variant === 'blur') {
            return {
              ab_test: 'paywall_preview_style_v1',
              ab_variant: 'blur',
            };
          }
          return null;
        },
      );

      renderHook(() => useABTestTracking('dashboard', 'page_viewed'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith('page_viewed', {
          pagePath: '/dashboard',
          metadata: {
            ab_test: 'cta-copy-test',
            ab_variant: 'mystical',
            page: 'dashboard',
          },
        });
      });
    });
  });

  describe('Specific test filtering', () => {
    it('should only check specified tests when tests parameter is provided', async () => {
      // User is in paywall test but we only check for cta-copy-test
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'paywall_preview_style_v1') return 'blur';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'paywall_preview_style_v1' && variant === 'blur') {
            return {
              ab_test: 'paywall_preview_style_v1',
              ab_variant: 'blur',
            };
          }
          return null;
        },
      );

      renderHook(() =>
        useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']),
      );

      await waitFor(() => {
        // Should track without A/B metadata since we filtered to only cta-copy-test
        expect(mockTrackEvent).toHaveBeenCalledWith('app_opened', {
          pagePath: '/dashboard',
          metadata: {
            page: 'dashboard',
          },
        });
      });
    });
  });

  describe('Return values', () => {
    it('should return hasActiveTest=false when user is not in any test', () => {
      mockUseFeatureFlagVariant.mockReturnValue(null);
      mockGetABTestMetadataFromVariant.mockReturnValue(null);

      const { result } = renderHook(() =>
        useABTestTracking('dashboard', 'app_opened'),
      );

      expect(result.current.hasActiveTest).toBe(false);
      expect(result.current.abMetadata).toBe(null);
    });

    it('should return hasActiveTest=true when user is in a test', () => {
      mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
        if (flag === 'cta-copy-test') return 'mystical';
        return null;
      });

      mockGetABTestMetadataFromVariant.mockImplementation(
        (test: string, variant: any) => {
          if (test === 'cta-copy-test' && variant === 'mystical') {
            return {
              ab_test: 'cta-copy-test',
              ab_variant: 'mystical',
            };
          }
          return null;
        },
      );

      const { result } = renderHook(() =>
        useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']),
      );

      expect(result.current.hasActiveTest).toBe(true);
      expect(result.current.abMetadata).toEqual({
        ab_test: 'cta-copy-test',
        ab_variant: 'mystical',
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
    mockUseFeatureFlagVariant.mockReturnValue(null);
    mockGetABTestMetadataFromVariant.mockReturnValue(null);

    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });
  });

  it('should track conversion events WITH A/B metadata when user is in a test', () => {
    mockUseFeatureFlagVariant.mockImplementation((flag: string) => {
      if (flag === 'cta-copy-test') return 'mystical';
      return null;
    });

    mockGetABTestMetadataFromVariant.mockImplementation(
      (test: string, variant: any) => {
        if (test === 'cta-copy-test' && variant === 'mystical') {
          return {
            ab_test: 'cta-copy-test',
            ab_variant: 'mystical',
          };
        }
        return null;
      },
    );

    const { result } = renderHook(() => useABTestConversion());

    result.current.trackConversion('upgrade_clicked', {
      featureName: 'tarot_full_reading',
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('upgrade_clicked', {
      featureName: 'tarot_full_reading',
      metadata: {
        ab_test: 'cta-copy-test',
        ab_variant: 'mystical',
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
          return {
            ab_test: 'cta-copy-test',
            ab_variant: 'mystical',
          };
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
        ab_test: 'cta-copy-test',
        ab_variant: 'mystical',
        custom_field: 'custom_value',
      },
    });
  });
});
