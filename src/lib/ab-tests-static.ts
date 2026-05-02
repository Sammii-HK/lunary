import crypto from 'crypto';

export type InlineCtaVariant = 'control' | 'minimal' | 'sparkles' | 'card';

/**
 * Static-safe inline CTA variant for public SEO pages.
 * The winning treatment is fixed, so these pages do not need request cookies.
 */
export function getInlineCtaVariant(): InlineCtaVariant {
  return 'sparkles';
}

/**
 * Deterministic server-side variant assignment without request state.
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
