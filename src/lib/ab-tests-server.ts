import { cookies } from 'next/headers';
import crypto from 'crypto';

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

/**
 * Deterministic server-side variant assignment.
 *
 * Uses SHA-256 hashing of `${testName}:${seed}` to pick a variant, so
 * assignment is stable across requests without needing a cookie. This is
 * what closes the loop for Codex-shipped experiments: immune to cookie
 * blockers (Safari ITP, Brave, ad blockers), incognito mode, and cross-
 * device variance for logged-in users.
 *
 * @param testName Stable identifier for the test. MUST match the entry in
 *   `POSTHOG_TEST_MAPPING` in `src/lib/ab-test-tracking.ts`.
 * @param seed Stable per-user identifier. Prefer `user.id` for
 *   authenticated users; fall back to `anonymous_id` (from conversion
 *   events / session) for anonymous users. MUST be the SAME seed used
 *   everywhere the variant is read for this user, or the user will flicker
 *   between variants.
 * @param variants Ordered list of variant labels. Defaults to ['A', 'B'].
 *   Pass multivariate labels (e.g. ['control', 'minimal', 'bold']) to
 *   assign more than two.
 * @returns One of the variant labels, deterministically chosen.
 *
 * @example
 * ```ts
 * // Server component or route handler
 * const variant = assignVariantServer('onboarding_value_stack_v1', user.id);
 * if (variant === 'B') {
 *   // show treatment
 * }
 *
 * // Then when tracking downstream events, tag with the variant:
 * import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';
 * const abMeta = getABTestMetadataFromVariant(
 *   'onboarding_value_stack_v1',
 *   variant,
 * );
 * trackEvent('trial_started', { metadata: { ...abMeta } });
 * ```
 */
export function assignVariantServer<T extends string>(
  testName: string,
  seed: string,
  variants: readonly T[] = ['A', 'B'] as unknown as readonly T[],
): T {
  if (!variants.length) {
    throw new Error('assignVariantServer: variants must be non-empty');
  }
  const hash = crypto
    .createHash('sha256')
    .update(`${testName}:${seed}`)
    .digest();
  const index = hash.readUInt32BE(0) % variants.length;
  return variants[index];
}
