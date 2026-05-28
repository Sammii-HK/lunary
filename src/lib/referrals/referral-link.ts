/**
 * Client-side referral link helpers.
 *
 * These run in the browser and intentionally avoid importing the server-only
 * referral module (`@/lib/referrals`), which depends on `@vercel/postgres`.
 *
 * The flow is:
 *  1. A referrer builds a link with their code (`buildReferralLink`).
 *  2. A new visitor lands on a `?ref=CODE` URL and we stash the code in
 *     localStorage (`storeReferralCodeFromUrl` / `storeReferralCode`).
 *  3. After the visitor signs up, we redeem the stored code against their
 *     new user id (`redeemStoredReferralCode`), which attributes FREE signups.
 *     Paid signups are already attributed by the Stripe webhook.
 */

import { conversionTracking } from '@/lib/analytics';

/** localStorage key shared with the existing referral system. */
export const REFERRAL_CODE_STORAGE_KEY = 'lunary_referral_code';

const DEFAULT_ORIGIN = 'https://lunary.app';

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_ORIGIN;
}

/**
 * Build a shareable referral link that carries the referrer's code.
 *
 * @param code   The referrer's referral code.
 * @param path   Destination path the recipient lands on (default `/pricing`,
 *               matching where the code is read back in today).
 */
export function buildReferralLink(
  code: string | null | undefined,
  path = '/pricing',
): string {
  const origin = getOrigin();
  if (!code) return `${origin}${path}`;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const separator = normalizedPath.includes('?') ? '&' : '?';
  return `${origin}${normalizedPath}${separator}ref=${encodeURIComponent(code)}`;
}

/** Persist a referral code so it survives until the visitor signs up. */
export function storeReferralCode(code: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const trimmed = code?.trim();
  if (!trimmed) return;
  try {
    window.localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, trimmed);
  } catch {
    // localStorage can be unavailable (private mode, quota). Fail silently.
  }
}

/**
 * Read a `ref` param from a URL search string and stash it. Returns the stored
 * code, or null if none was present.
 */
export function storeReferralCodeFromUrl(
  search?: string,
): string | null {
  if (typeof window === 'undefined') return null;
  const source = search ?? window.location.search;
  try {
    const ref = new URLSearchParams(source).get('ref');
    if (!ref) return null;
    storeReferralCode(ref);
    return ref.trim();
  } catch {
    return null;
  }
}

/** Read the stored referral code, if any. */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY);
    return stored?.trim() || null;
  } catch {
    return null;
  }
}

/** Clear the stored referral code (after a successful redemption). */
export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
  } catch {
    // Fail silently.
  }
}

/**
 * Redeem any stored referral code against the freshly authenticated user.
 *
 * This is what attributes FREE signups. It is safe to call repeatedly: the
 * server rejects self-referrals and codes a user has already used, and we
 * clear the stored code once it has been processed so the same code is never
 * redeemed twice.
 *
 * @param userId The new user's id. MUST be `authState.user?.id` — there is no
 *               `authState.userId` field. Passing undefined hits the guard and
 *               silently does nothing.
 */
export async function redeemStoredReferralCode(
  userId: string | undefined,
): Promise<{ success: boolean; alreadyHandled?: boolean }> {
  if (typeof window === 'undefined') return { success: false };

  const code = getStoredReferralCode();
  if (!userId || !code) {
    return { success: false };
  }

  try {
    const res = await fetch('/api/referrals/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.success) {
      // Successfully attributed — never redeem this code again.
      clearStoredReferralCode();
      conversionTracking.referralCodeRedeemed(userId, { outcome: 'attributed' });
      return { success: true };
    }

    // The API returns 400 for already-used codes and self-referrals. Those are
    // terminal for this user, so clear the stored code to avoid retrying every
    // time they authenticate.
    if (res.status === 400) {
      clearStoredReferralCode();
      conversionTracking.referralCodeRedeemed(userId, {
        outcome: 'rejected',
        reason: data?.error,
      });
      return { success: false, alreadyHandled: true };
    }

    // Transient/server error — leave the code in place to retry on next auth.
    return { success: false };
  } catch {
    // Network error — leave the code in place to retry later.
    return { success: false };
  }
}
