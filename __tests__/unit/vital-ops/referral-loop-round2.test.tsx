/**
 * @jest-environment jsdom
 *
 * VITAL OP #7 (round 2) - Referral loop CLOSURE.
 *
 * Round 1 (referral-capture.test.ts / share-referral-utm.test.ts) pinned the
 * pure helpers `buildReferralLink`, `appendRef`, `storeReferralCodeFromUrl` and
 * `redeemStoredReferralCode`. This file covers the work that merged AFTER that
 * closed the loop end-to-end:
 *
 *   1. `useReferralCode` hook (src/hooks/useReferralCode.ts) - resolves the
 *      signed-in user's code so share links carry `?ref=`, and resolves to
 *      `null` for anonymous users (so `buildReferralLink(null)` returns a bare
 *      URL and never crashes).
 *   2. The capture -> redeem WIRING:
 *        - /auth captures `?ref` on mount and redeems it once authenticated.
 *        - /pricing captures `?ref` on mount.
 *        - /api/referrals/use is the redemption endpoint.
 *   3. The 3 static-share components feed `useReferralCode` straight into
 *      `buildReferralLink`, so a logged-in sharer's link is attributable and an
 *      anonymous one degrades to the bare URL.
 *
 * Network/UserContext are mocked. The wiring is asserted structurally against
 * the real source (the established vital-ops pattern in
 * stripe-checkout-logic.test.ts) so it fails loudly if the loop is unwired.
 */
import * as fs from 'fs';
import * as path from 'path';
import { renderHook, waitFor } from '@testing-library/react';

// buildReferralLink (via referral-link.ts) transitively imports @/lib/analytics,
// which pulls in @vercel/analytics (ESM Jest does not transform). Stub it, as the
// round-1 referral-capture test does, to keep this an offline unit.
jest.mock('@/lib/analytics', () => ({
  conversionTracking: { referralCodeRedeemed: jest.fn() },
}));

// useReferralCode reads the user from UserContext; mock it so we control auth.
const mockUseUser = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

import { useReferralCode } from '@/hooks/useReferralCode';
import { buildReferralLink } from '../../../src/lib/referrals/referral-link';

const readSource = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('VITAL #7 (r2) useReferralCode - anonymous users no-op cleanly', () => {
  it('returns null for an anonymous user and never calls the code endpoint', () => {
    mockUseUser.mockReturnValue({ user: null });
    const fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;

    const { result } = renderHook(() => useReferralCode());

    expect(result.current).toBeNull();
    // No user id -> the effect must not hit /api/referrals/code.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('a null code from the hook produces a BARE share URL (no ?ref=, no crash)', () => {
    // This is the contract that keeps anonymous sharing working: the hook
    // hands `null` to buildReferralLink, which must yield a plain link.
    expect(buildReferralLink(null)).toBe('http://localhost/pricing');
    expect(buildReferralLink(null, '/tarot')).toBe('http://localhost/tarot');
    expect(buildReferralLink(null)).not.toContain('ref=');
  });
});

describe('VITAL #7 (r2) useReferralCode - signed-in users resolve a code', () => {
  it('fetches /api/referrals/code with the user id and exposes the code', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_42' } });
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'SHARE42' }),
    });

    const { result } = renderHook(() => useReferralCode());

    await waitFor(() => expect(result.current).toBe('SHARE42'));

    expect((global as any).fetch).toHaveBeenCalledTimes(1);
    expect((global as any).fetch).toHaveBeenCalledWith(
      '/api/referrals/code?userId=user_42',
    );
  });

  it('url-encodes the user id in the lookup (no query injection)', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'a b&c' } });
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'X' }),
    });

    renderHook(() => useReferralCode());

    await waitFor(() =>
      expect((global as any).fetch).toHaveBeenCalledWith(
        '/api/referrals/code?userId=a%20b%26c',
      ),
    );
  });

  it('stays null when the lookup fails (share link falls back to bare URL)', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_42' } });
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useReferralCode());

    // Give the effect a tick; it must remain null on a non-ok response.
    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it('stays null when the network throws (silent fail, no crash)', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_42' } });
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useReferralCode());

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it('treats a missing code field in the response as null', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_42' } });
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useReferralCode());

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});

describe('VITAL #7 (r2) capture -> redeem path is wired on /auth', () => {
  const source = readSource('src/app/auth/page.tsx');

  it('imports both capture and redeem helpers from the referral module', () => {
    expect(source).toContain('storeReferralCodeFromUrl');
    expect(source).toContain('redeemStoredReferralCode');
    expect(source).toContain("from '@/lib/referrals/referral-link'");
  });

  it('captures the ?ref code on mount', () => {
    expect(source).toContain('storeReferralCodeFromUrl()');
  });

  it('redeems the stored code against authState.user?.id once authenticated', () => {
    // The id MUST come from user?.id (there is no authState.userId); a regression
    // here silently stops attributing every free signup.
    expect(source).toContain('redeemStoredReferralCode(authState.user?.id)');
    expect(source).toMatch(
      /if \(authState\.loading \|\| !authState\.isAuthenticated\) return;/,
    );
  });
});

describe('VITAL #7 (r2) capture is wired on /pricing', () => {
  const source = readSource('src/app/pricing/page.tsx');

  it('imports and calls storeReferralCodeFromUrl with the live query string', () => {
    expect(source).toContain('storeReferralCodeFromUrl');
    expect(source).toContain(
      'storeReferralCodeFromUrl(window.location.search)',
    );
  });
});

describe('VITAL #7 (r2) /api/referrals/use is the redemption endpoint', () => {
  const source = readSource('src/app/api/referrals/use/route.ts');

  it('POSTs code+userId through processReferralCode and 400s on missing input', () => {
    expect(source).toContain('export async function POST');
    expect(source).toContain('processReferralCode(code, userId)');
    expect(source).toContain('if (!code || !userId)');
    expect(source).toContain('status: 400');
  });

  it('matches the client redeem target (referral-link.ts posts /api/referrals/use)', () => {
    const client = readSource('src/lib/referrals/referral-link.ts');
    expect(client).toContain("fetch('/api/referrals/use'");
  });
});

describe('VITAL #7 (r2) static-share components attach the referral code', () => {
  // The 3 static-share surfaces from the loop-closing work. Each must resolve
  // the code via useReferralCode and feed it to buildReferralLink so a signed-in
  // share is attributable and an anonymous share degrades to a bare URL.
  const components: Array<[string, string]> = [
    ['ShareDailyInsight', 'src/components/ShareDailyInsight.tsx'],
    ['ShareMoonPhase', 'src/components/share/ShareMoonPhase.tsx'],
    ['ShareDailyTarotCard', 'src/components/share/ShareDailyTarotCard.tsx'],
  ];

  it.each(components)(
    '%s resolves useReferralCode and builds the share link with it',
    (_name, rel) => {
      const source = readSource(rel);
      expect(source).toContain(
        "import { useReferralCode } from '@/hooks/useReferralCode'",
      );
      expect(source).toContain('const referralCode = useReferralCode()');
      expect(source).toContain('buildReferralLink(referralCode');
    },
  );
});
