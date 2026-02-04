import { cookies } from 'next/headers';

const AB_TEST_COOKIE = 'lunary_ab_tests';

export type InlineCtaVariant = 'control' | 'minimal' | 'sparkles' | 'card';

/**
 * Get A/B test variants from server-side cookies
 * Use this in Server Components to read variant assignments
 */
export async function getABTestVariants(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const abTestsCookie = cookieStore.get(AB_TEST_COOKIE)?.value;

  if (!abTestsCookie) {
    return {};
  }

  try {
    return JSON.parse(abTestsCookie);
  } catch {
    return {};
  }
}

/**
 * Get a specific A/B test variant
 */
export async function getABTestVariant(
  testName: string,
): Promise<string | undefined> {
  const variants = await getABTestVariants();
  return variants[testName];
}

/**
 * Get the inline CTA style variant
 */
export async function getInlineCtaVariant(): Promise<InlineCtaVariant> {
  const variant = await getABTestVariant('inline-cta-style');
  // Default to 'sparkles' if no variant assigned yet
  if (
    !variant ||
    !['control', 'minimal', 'sparkles', 'card'].includes(variant)
  ) {
    return 'sparkles';
  }
  return variant as InlineCtaVariant;
}
