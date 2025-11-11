// Simple A/B testing using localStorage (free, no external service needed)

export type ABTestVariant = 'A' | 'B';

export interface ABTest {
  name: string;
  variant: ABTestVariant;
  weight?: number; // 0-1, default 0.5 (50/50 split)
}

const AB_TEST_STORAGE_KEY = 'lunary_ab_tests';

// Get or assign a variant for a test
export function getABTestVariant(
  testName: string,
  weight: number = 0.5,
): ABTestVariant {
  if (typeof window === 'undefined') {
    return 'A'; // Server-side default
  }

  // Check if user already has a variant assigned
  const stored = localStorage.getItem(AB_TEST_STORAGE_KEY);
  const tests: Record<string, ABTest> = stored ? JSON.parse(stored) : {};

  if (tests[testName]) {
    return tests[testName].variant;
  }

  // Assign new variant based on weight
  const variant: ABTestVariant = Math.random() < weight ? 'A' : 'B';

  tests[testName] = {
    name: testName,
    variant,
    weight,
  };

  localStorage.setItem(AB_TEST_STORAGE_KEY, JSON.stringify(tests));

  return variant;
}

// Get all active tests
export function getActiveABTests(): Record<string, ABTest> {
  if (typeof window === 'undefined') {
    return {};
  }

  const stored = localStorage.getItem(AB_TEST_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Track conversion for A/B test
export async function trackABTestConversion(
  testName: string,
  variant: ABTestVariant,
  conversionType: string,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    // Track via your analytics
    const { conversionTracking } = await import('./analytics');

    // You can add specific A/B test tracking here
    await fetch('/api/analytics/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: conversionType,
        metadata: {
          abTest: testName,
          abVariant: variant,
          ...metadata,
        },
      }),
    });
  } catch (error) {
    console.error('Failed to track A/B test conversion:', error);
  }
}

// Common A/B tests
export const AB_TESTS = {
  PRICING_CTA: 'pricing_cta',
  PRICING_PRICE: 'pricing_price',
  ONBOARDING_FLOW: 'onboarding_flow',
  UPGRADE_PROMPT: 'upgrade_prompt',
} as const;
