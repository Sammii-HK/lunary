'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

/**
 * Resolve the signed-in user's referral code client-side.
 *
 * Mirrors the established pattern in `ReferralShareCTA` / `ReferralProgram`:
 * fetch `GET /api/referrals/code?userId=...`, which lazily generates a code if
 * the user doesn't have one yet. Anonymous users (no `user.id`) resolve to
 * `null`, so callers can pass the result straight to `buildReferralLink` /
 * `appendRef`, which no-op on a null code and return the bare URL.
 *
 * Used by the share components so the copied/shared link carries `?ref=CODE`
 * and recipients' signups attribute back to the sharer.
 */
export function useReferralCode(): string | null {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setReferralCode(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/referrals/code?userId=${encodeURIComponent(userId)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setReferralCode(data.code ?? null);
        }
      } catch {
        // Silent fail — the share link just falls back to the bare URL.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return referralCode;
}
