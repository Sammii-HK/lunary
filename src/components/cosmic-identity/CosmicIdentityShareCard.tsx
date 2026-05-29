'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Share2, Sparkles } from 'lucide-react';

import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { buildReferralLink } from '@/lib/referrals/referral-link';
import { conversionTracking } from '@/lib/analytics';

/**
 * Claim + share affordance for the public cosmic-identity profile (`/me/[handle]`).
 *
 * The public page, its OG card (`/api/og/cosmic-identity`) and the claim
 * endpoint (`POST /api/me/handle`) already exist — this is the missing UI that
 * lets an authenticated user (1) claim a handle and (2) share the resulting
 * public page. The shared link carries the user's referral code as `?ref=` so
 * a visitor who signs up is attributed back to the sharer (a source-labelled
 * viral loop).
 */
export function CosmicIdentityShareCard() {
  const { user } = useUser();
  const [handle, setHandle] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      setCanShare(true);
    }
  }, []);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [handleRes, refRes] = await Promise.all([
        fetch('/api/me/handle'),
        fetch('/api/referrals'),
      ]);
      if (handleRes.ok) {
        const data = (await handleRes.json()) as { handle?: string | null };
        setHandle(data.handle ?? null);
      }
      if (refRes.ok) {
        const data = (await refRes.json()) as { code?: string | null };
        setReferralCode(data.code ?? null);
      }
    } catch {
      // Silent fail — the card simply won't render its share state.
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const claimHandle = async () => {
    const normalized = draft.toLowerCase().trim();
    if (!normalized) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/me/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: normalized }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        handle?: string;
        error?: string;
      };
      if (res.ok && data.handle) {
        setHandle(data.handle);
        setDraft('');
      } else {
        setError(data.error ?? 'Could not claim that handle');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Public profile path, with the sharer's referral code attached so signups
  // from the page are attributed back to them.
  const shareUrl = handle
    ? buildReferralLink(referralCode, `/me/${handle}`)
    : '';

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      conversionTracking.referralLinkCopied(user?.id);
    } catch {
      // Clipboard can be unavailable — fail silently.
    }
  };

  const shareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({
        title: 'My cosmic identity',
        text: 'Here are my Big Three and the transits shaping my year on Lunary.',
        url: shareUrl,
      });
      conversionTracking.referralLinkShared(user?.id, 'native');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        copyLink();
      }
    }
  };

  if (!user?.id || loading) return null;

  return (
    <section className='w-full max-w-3xl rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-layer-base/40 to-lunary-highlight-900/30 p-5 sm:p-6'>
      <div className='flex items-start gap-3'>
        <Sparkles
          className='mt-0.5 h-5 w-5 flex-shrink-0 text-lunary-primary-400'
          aria-hidden
        />
        <div className='flex-1'>
          <Heading as='h3' variant='h3'>
            Your public cosmic profile
          </Heading>

          {handle ? (
            <>
              <p className='mt-1 text-sm text-content-secondary'>
                Share your Big Three and the transits shaping your year. Friends
                who join from your link start with a head start, and you earn a
                bonus week of Pro for each one who sticks.
              </p>
              <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
                <Link
                  href={`/me/${handle}`}
                  className='truncate text-sm text-content-brand underline-offset-2 hover:underline'
                >
                  lunary.app/me/{handle}
                </Link>
                <div className='flex items-center gap-2 sm:ml-auto'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={copyLink}
                  >
                    {copied ? (
                      <>
                        <Check className='text-lunary-success' /> Copied
                      </>
                    ) : (
                      <>
                        <Copy /> Copy link
                      </>
                    )}
                  </Button>
                  {canShare && (
                    <Button
                      type='button'
                      variant='lunary'
                      size='sm'
                      onClick={shareLink}
                    >
                      <Share2 /> Share
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className='mt-1 text-sm text-content-secondary'>
                Claim a handle to get a shareable page with your Big Three and
                your year&apos;s top transits. It is public and works without an
                account, so anyone can see it.
              </p>
              <div className='mt-4 flex flex-col gap-2 sm:flex-row sm:items-center'>
                <div className='flex flex-1 items-center rounded-lg border border-stroke-strong bg-surface-base px-3 py-2 text-sm'>
                  <span className='text-content-muted'>lunary.app/me/</span>
                  <input
                    type='text'
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') claimHandle();
                    }}
                    placeholder='your-handle'
                    maxLength={30}
                    autoCapitalize='none'
                    autoCorrect='off'
                    spellCheck={false}
                    className='ml-0.5 w-full bg-transparent text-content-primary placeholder:text-content-muted focus:outline-none'
                    aria-label='Choose your public handle'
                  />
                </div>
                <Button
                  type='button'
                  variant='lunary'
                  size='sm'
                  onClick={claimHandle}
                  disabled={saving || !draft.trim()}
                >
                  {saving ? 'Claiming...' : 'Claim handle'}
                </Button>
              </div>
              <p className='mt-2 text-xs text-content-muted'>
                Lowercase letters, numbers and hyphens. 3 to 30 characters.
              </p>
              {error && (
                <p className='mt-1 text-xs text-lunary-rose' role='alert'>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
