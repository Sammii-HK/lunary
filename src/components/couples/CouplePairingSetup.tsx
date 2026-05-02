'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Heart, Share2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

interface CouplePairingSetupProps {
  /** If the user already minted a code in a previous session, hydrate it. */
  existingCode?: string;
}

const PAIR_CODE_REGEX = /^\d{6}$/;

function formatCodeForDisplay(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

export function CouplePairingSetup({ existingCode }: CouplePairingSetupProps) {
  const router = useRouter();

  const [code, setCode] = useState<string | null>(existingCode ?? null);
  const [minting, setMinting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const mintCode = useCallback(async () => {
    setMinting(true);
    setError(null);
    try {
      const res = await fetch('/api/couples/pair', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        throw new Error(data?.error || 'Could not mint a code');
      }
      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mint a code');
    } finally {
      setMinting(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard blocked — silently ignore.
    }
  }, [code]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    const text = `Pair with me on Lunary — our daily compatibility forecast is one tap away. Code: ${code}`;
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({ text, title: 'Pair on Lunary' });
        return;
      }
    } catch {
      // User cancelled the share sheet — no-op.
    }
    // Fallback to SMS deep link.
    if (typeof window !== 'undefined') {
      window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
    }
  }, [code]);

  const handleJoin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = partnerCode.replace(/\s/g, '');
      if (!PAIR_CODE_REGEX.test(trimmed)) {
        setError('Enter the 6-digit code from your partner.');
        return;
      }
      setJoining(true);
      setError(null);
      try {
        const res = await fetch('/api/couples/pair', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code: trimmed }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Could not pair');
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not pair');
      } finally {
        setJoining(false);
      }
    },
    [partnerCode, router],
  );

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* ----- Generate code column ----- */}
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-5'>
        <div className='flex items-center gap-2 mb-3 text-content-secondary'>
          <Users className='w-4 h-4 text-lunary-accent' />
          <Heading as='h2' variant='h3' className='mb-0'>
            Generate a code
          </Heading>
        </div>
        <p className='text-xs text-content-muted mb-4'>
          Share this 6-digit code with your partner. Once they enter it, your
          shared dashboard unlocks.
        </p>

        {code ? (
          <div className='space-y-3'>
            <div
              aria-label='Pairing code'
              className='rounded-xl border border-lunary-primary-700 bg-layer-base px-4 py-5 text-center'
            >
              <div className='text-3xl font-light tracking-[0.4em] text-lunary-accent tabular-nums'>
                {formatCodeForDisplay(code)}
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='lunary'
                size='sm'
                onClick={handleCopy}
                className='flex-1'
              >
                {copied ? (
                  <>
                    <Check className='w-4 h-4' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4' />
                    Copy
                  </>
                )}
              </Button>
              <Button
                type='button'
                variant='lunary-soft'
                size='sm'
                onClick={handleShare}
                className='flex-1'
              >
                <Share2 className='w-4 h-4' />
                Send via text
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type='button'
            variant='lunary-solid'
            onClick={mintCode}
            disabled={minting}
            className='w-full'
          >
            <Heart className='w-4 h-4' />
            {minting ? 'Generating...' : 'Generate code'}
          </Button>
        )}
      </div>

      {/* ----- Enter partner's code column ----- */}
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-5'>
        <div className='flex items-center gap-2 mb-3 text-content-secondary'>
          <Heart className='w-4 h-4 text-lunary-rose' />
          <Heading as='h2' variant='h3' className='mb-0'>
            Enter partner&apos;s code
          </Heading>
        </div>
        <p className='text-xs text-content-muted mb-4'>
          Got a code from your partner? Drop it in below to pair.
        </p>
        <form onSubmit={handleJoin} className='space-y-3'>
          <input
            value={partnerCode}
            onChange={(e) =>
              setPartnerCode(e.target.value.replace(/[^\d\s]/g, '').slice(0, 7))
            }
            inputMode='numeric'
            autoComplete='off'
            placeholder='000 000'
            aria-label="Partner's pairing code"
            className={cn(
              'w-full rounded-xl border border-stroke-subtle bg-layer-base px-4 py-3',
              'text-center text-2xl tracking-[0.4em] tabular-nums text-content-primary',
              'placeholder:text-content-muted/40 placeholder:tracking-[0.4em]',
              'focus:outline-none focus:border-lunary-accent',
            )}
          />
          <Button
            type='submit'
            variant='lunary-solid'
            disabled={joining || partnerCode.replace(/\s/g, '').length !== 6}
            className='w-full'
          >
            {joining ? 'Pairing...' : 'Pair us up'}
          </Button>
        </form>
      </div>

      {error && (
        <div
          role='alert'
          className='md:col-span-2 rounded-xl border border-lunary-rose/30 bg-lunary-rose/5 px-4 py-3 text-sm text-content-secondary'
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default CouplePairingSetup;
