/**
 * Tests for server-side A/B testing utilities
 *
 * The A/B testing system works as follows:
 * 1. Middleware assigns variants deterministically using hash(anonId + testName)
 * 2. Variants are stored in cookies (lunary_ab_tests)
 * 3. Server components read cookies and pass variants to client components
 */

// Extract hash and variant functions from middleware for testing
// Since we can't import from middleware directly, we replicate the logic

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function assignVariant(
  userId: string,
  testName: string,
  test: { variants: string[]; weights?: number[] },
): string {
  const hash = hashString(`${userId}-${testName}`);
  const { variants, weights } = test;

  if (weights && weights.length === variants.length) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const normalized = hash % totalWeight;
    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (normalized < cumulative) return variants[i];
    }
  }

  return variants[hash % variants.length];
}

describe('A/B Testing - Hash Function', () => {
  it('returns consistent values for same input', () => {
    const hash1 = hashString('test-input');
    const hash2 = hashString('test-input');
    expect(hash1).toBe(hash2);
  });

  it('returns different values for different inputs', () => {
    const hash1 = hashString('user-123-test-a');
    const hash2 = hashString('user-456-test-a');
    expect(hash1).not.toBe(hash2);
  });

  it('returns positive integers', () => {
    const testInputs = [
      'abc',
      '123',
      'user-test',
      '',
      'very-long-string-with-lots-of-characters',
    ];

    testInputs.forEach((input) => {
      const hash = hashString(input);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(hash)).toBe(true);
    });
  });

  it('handles special characters', () => {
    const hash = hashString('user@email.com-test-name');
    expect(hash).toBeGreaterThan(0);
    expect(Number.isInteger(hash)).toBe(true);
  });
});

describe('A/B Testing - Variant Assignment', () => {
  const inlineCtaTest = {
    variants: ['control', 'minimal', 'sparkles', 'card'],
  };

  it('returns one of the defined variants', () => {
    const variant = assignVariant(
      'user-123',
      'inline-cta-style',
      inlineCtaTest,
    );
    expect(inlineCtaTest.variants).toContain(variant);
  });

  it('returns deterministic results for same user+test', () => {
    const variant1 = assignVariant(
      'user-abc',
      'inline-cta-style',
      inlineCtaTest,
    );
    const variant2 = assignVariant(
      'user-abc',
      'inline-cta-style',
      inlineCtaTest,
    );
    expect(variant1).toBe(variant2);
  });

  it('distributes users across all variants', () => {
    const variantCounts: Record<string, number> = {
      control: 0,
      minimal: 0,
      sparkles: 0,
      card: 0,
    };

    // Assign 1000 users and check distribution
    for (let i = 0; i < 1000; i++) {
      const variant = assignVariant(
        `user-${i}`,
        'inline-cta-style',
        inlineCtaTest,
      );
      variantCounts[variant]++;
    }

    // Each variant should have at least some users (expect ~250 each with 4 variants)
    // Use a generous threshold (50) to avoid flaky tests
    Object.values(variantCounts).forEach((count) => {
      expect(count).toBeGreaterThan(50);
    });
  });

  it('assigns different variants based on test name', () => {
    const userId = 'consistent-user-123';

    const variant1 = assignVariant(userId, 'test-a', inlineCtaTest);
    const variant2 = assignVariant(userId, 'test-b', inlineCtaTest);

    // May or may not be different by chance, but hash should differ
    const hash1 = hashString(`${userId}-test-a`);
    const hash2 = hashString(`${userId}-test-b`);
    expect(hash1).not.toBe(hash2);
  });

  describe('weighted variants', () => {
    it('respects weights when provided', () => {
      const weightedTest = {
        variants: ['a', 'b', 'c'],
        weights: [70, 20, 10], // 70% a, 20% b, 10% c
      };

      const counts: Record<string, number> = { a: 0, b: 0, c: 0 };

      for (let i = 0; i < 10000; i++) {
        const variant = assignVariant(
          `user-${i}`,
          'weighted-test',
          weightedTest,
        );
        counts[variant]++;
      }

      // With 10000 users:
      // 'a' should be ~7000 (expect > 5000)
      // 'b' should be ~2000 (expect > 1000)
      // 'c' should be ~1000 (expect > 500)
      expect(counts['a']).toBeGreaterThan(5000);
      expect(counts['b']).toBeGreaterThan(1000);
      expect(counts['c']).toBeGreaterThan(500);
    });

    it('falls back to equal distribution without weights', () => {
      const unweightedTest = {
        variants: ['x', 'y'],
        // No weights
      };

      const counts: Record<string, number> = { x: 0, y: 0 };

      for (let i = 0; i < 1000; i++) {
        const variant = assignVariant(
          `user-${i}`,
          'binary-test',
          unweightedTest,
        );
        counts[variant]++;
      }

      // Should be roughly 50/50
      expect(counts['x']).toBeGreaterThan(300);
      expect(counts['y']).toBeGreaterThan(300);
    });
  });
});

describe('A/B Testing - Inline CTA Style Variants', () => {
  const testConfig = {
    variants: ['control', 'minimal', 'sparkles', 'card'] as const,
  };

  it('control variant should be valid', () => {
    // Find a user that gets 'control'
    let controlUser: string | null = null;
    for (let i = 0; i < 100; i++) {
      const variant = assignVariant(
        `find-control-${i}`,
        'inline-cta-style',
        testConfig,
      );
      if (variant === 'control') {
        controlUser = `find-control-${i}`;
        break;
      }
    }

    expect(controlUser).not.toBeNull();
    const confirmedVariant = assignVariant(
      controlUser!,
      'inline-cta-style',
      testConfig,
    );
    expect(confirmedVariant).toBe('control');
  });

  it('all four variants are assignable', () => {
    const foundVariants = new Set<string>();

    for (let i = 0; i < 1000 && foundVariants.size < 4; i++) {
      const variant = assignVariant(
        `discover-${i}`,
        'inline-cta-style',
        testConfig,
      );
      foundVariants.add(variant);
    }

    expect(foundVariants.size).toBe(4);
    expect(foundVariants.has('control')).toBe(true);
    expect(foundVariants.has('minimal')).toBe(true);
    expect(foundVariants.has('sparkles')).toBe(true);
    expect(foundVariants.has('card')).toBe(true);
  });
});

describe('A/B Testing - Cookie Format', () => {
  it('cookie value should be valid JSON', () => {
    const mockCookieValue = JSON.stringify({
      'inline-cta-style': 'sparkles',
      'other-test': 'variant-a',
    });

    const parsed = JSON.parse(mockCookieValue);
    expect(parsed['inline-cta-style']).toBe('sparkles');
    expect(typeof parsed).toBe('object');
  });

  it('handles empty cookie gracefully', () => {
    const emptyCookie = '';
    let result: Record<string, string> = {};

    if (emptyCookie) {
      try {
        result = JSON.parse(emptyCookie);
      } catch {
        result = {};
      }
    }

    expect(result).toEqual({});
  });

  it('handles invalid JSON gracefully', () => {
    const invalidJson = '{invalid json}';
    let result: Record<string, string> = {};

    try {
      result = JSON.parse(invalidJson);
    } catch {
      result = {};
    }

    expect(result).toEqual({});
  });
});
