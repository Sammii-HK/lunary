/**
 * @jest-environment jsdom
 *
 * VITAL OP #7 - Referral capture (client side).
 *
 * Source: src/lib/referrals/referral-link.ts. This is the loop that attributes
 * FREE signups: a ?ref=CODE visitor has the code stashed in localStorage, then
 * after sign-up it is redeemed against the new user id. Currently untested.
 *
 * conversionTracking is mocked (it pulls in the large analytics module). fetch
 * is mocked per-test. No real network/DB.
 */
jest.mock('@/lib/analytics', () => ({
  conversionTracking: {
    referralCodeRedeemed: jest.fn(),
  },
}));

import {
  REFERRAL_CODE_STORAGE_KEY,
  buildReferralLink,
  storeReferralCode,
  storeReferralCodeFromUrl,
  getStoredReferralCode,
  clearStoredReferralCode,
  redeemStoredReferralCode,
} from '../../../src/lib/referrals/referral-link';

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

describe('VITAL #7 buildReferralLink', () => {
  it('builds a /pricing link carrying the referrer code by default', () => {
    expect(buildReferralLink('ABC123')).toBe(
      'http://localhost/pricing?ref=ABC123',
    );
  });

  it('uses & when the destination path already has a query', () => {
    expect(buildReferralLink('ABC123', '/quiz?x=1')).toBe(
      'http://localhost/quiz?x=1&ref=ABC123',
    );
  });

  it('url-encodes the code', () => {
    expect(buildReferralLink('a b&c')).toContain('ref=a%20b%26c');
  });

  it('returns a plain link with no ref when code is missing', () => {
    expect(buildReferralLink(null, '/pricing')).toBe(
      'http://localhost/pricing',
    );
  });
});

describe('VITAL #7 store / read / clear referral code', () => {
  it('stores and reads back a trimmed code', () => {
    storeReferralCode('  CODE42  ');
    expect(window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY)).toBe(
      'CODE42',
    );
    expect(getStoredReferralCode()).toBe('CODE42');
  });

  it('ignores empty / whitespace codes', () => {
    storeReferralCode('   ');
    expect(getStoredReferralCode()).toBeNull();
  });

  it('captures ?ref=CODE from a URL search string', () => {
    const captured = storeReferralCodeFromUrl('?ref=FROMURL&utm_source=ig');
    expect(captured).toBe('FROMURL');
    expect(getStoredReferralCode()).toBe('FROMURL');
  });

  it('returns null when there is no ref param', () => {
    expect(storeReferralCodeFromUrl('?utm_source=ig')).toBeNull();
    expect(getStoredReferralCode()).toBeNull();
  });

  it('clears the stored code', () => {
    storeReferralCode('CODE42');
    clearStoredReferralCode();
    expect(getStoredReferralCode()).toBeNull();
  });
});

describe('VITAL #7 redeemStoredReferralCode', () => {
  it('does nothing (and does not fetch) when there is no stored code', async () => {
    const fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;
    const result = await redeemStoredReferralCode('user_1');
    expect(result).toEqual({ success: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does nothing when there is no userId', async () => {
    storeReferralCode('CODE42');
    const fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;
    const result = await redeemStoredReferralCode(undefined);
    expect(result).toEqual({ success: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts the code, clears it, and reports success on a 200/attributed response', async () => {
    storeReferralCode('CODE42');
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const result = await redeemStoredReferralCode('user_1');

    expect((global as any).fetch).toHaveBeenCalledWith(
      '/api/referrals/use',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body).toEqual({ code: 'CODE42', userId: 'user_1' });
    expect(result.success).toBe(true);
    // Successful attribution must clear the code so it is never redeemed twice.
    expect(getStoredReferralCode()).toBeNull();
  });

  it('clears the code and reports alreadyHandled on a 400 (self-referral / used)', async () => {
    storeReferralCode('CODE42');
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'self_referral' }),
    });

    const result = await redeemStoredReferralCode('user_1');
    expect(result).toEqual({ success: false, alreadyHandled: true });
    // 400 is terminal for this user -> code cleared to stop retrying.
    expect(getStoredReferralCode()).toBeNull();
  });

  it('KEEPS the code on a transient 5xx so it can retry on next auth', async () => {
    storeReferralCode('CODE42');
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    const result = await redeemStoredReferralCode('user_1');
    expect(result).toEqual({ success: false });
    expect(getStoredReferralCode()).toBe('CODE42');
  });

  it('KEEPS the code on a network error', async () => {
    storeReferralCode('CODE42');
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await redeemStoredReferralCode('user_1');
    expect(result).toEqual({ success: false });
    expect(getStoredReferralCode()).toBe('CODE42');
  });
});
