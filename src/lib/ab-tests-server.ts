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
 * Sparkles won the A/B test (0.79% CTR, 90% confidence) — now hardcoded.
 */
export async function getInlineCtaVariant(): Promise<InlineCtaVariant> {
  return 'sparkles';
}

/**
 * Get the anon ID from cookies (for per-user copy rotation)
 */
export async function getAnonId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('lunary_anon_id')?.value;
}
