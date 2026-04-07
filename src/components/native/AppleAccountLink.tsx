'use client';

import { useState, useEffect } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Loader2, CheckCircle2, Link2 } from 'lucide-react';

type LinkStatus = 'idle' | 'linking' | 'success' | 'error';

export function AppleAccountLink() {
  const [status, setStatus] = useState<LinkStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/link-apple/status', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.linked) setIsLinked(true);
      })
      .catch(() => {});
  }, []);

  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return null;
  }

  const handleLinkApple = async () => {
    setStatus('linking');
    setMessage(null);

    try {
      const SignInWithApple = registerPlugin<{
        authorize(options: { nonce?: string }): Promise<{
          response: {
            identityToken: string;
            user: string;
            email?: string;
            givenName?: string;
            familyName?: string;
          };
        }>;
      }>('SignInWithApple');

      // Suppress Capacitor's console.error on cancellation
      const _origConsoleError = console.error;
      console.error = (...args: unknown[]) => {
        const first = args[0];
        if (
          args.length === 1 &&
          first !== null &&
          typeof first === 'object' &&
          Object.keys(first).length === 0
        )
          return;
        _origConsoleError(...args);
      };

      let result: Awaited<ReturnType<typeof SignInWithApple.authorize>>;
      try {
        result = await SignInWithApple.authorize({
          nonce: crypto.randomUUID(),
        });
      } finally {
        console.error = _origConsoleError;
      }

      const response = await fetch('/api/auth/link-apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identityToken: result.response.identityToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link Apple ID');
      }

      setStatus('success');
      setMessage(data.message || 'Apple ID linked successfully.');
      setIsLinked(true);
    } catch (err: any) {
      const code: number | string | undefined = err?.code ?? err?.error?.code;
      const msg: string = err?.message ?? err?.error?.message ?? '';

      // Silent dismissal
      const isSilent =
        (!code && !msg) ||
        code === 1001 ||
        String(code).includes('1001') ||
        msg.includes('1001') ||
        msg.toLowerCase().includes('cancel') ||
        code === 1000 ||
        String(code).includes('1000') ||
        msg.includes('1000');

      if (isSilent) {
        setStatus('idle');
      } else {
        setStatus('error');
        setMessage(msg || 'Failed to link Apple ID. Please try again.');
      }
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between p-4 rounded-lg bg-surface-card/50'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10'>
            <svg
              className='w-5 h-5 text-content-primary'
              viewBox='0 0 24 24'
              fill='currentColor'
            >
              <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
            </svg>
          </div>
          <div>
            <h4 className='text-sm font-medium text-content-primary'>
              {isLinked ? 'Apple ID Linked' : 'Link Apple ID'}
            </h4>
            <p className='text-xs text-content-muted'>
              {isLinked
                ? 'You can sign in with Apple on any device'
                : 'Sign in with Apple on iOS, even with a different email'}
            </p>
          </div>
        </div>

        {isLinked || status === 'success' ? (
          <CheckCircle2 className='w-5 h-5 text-lunary-success-400 flex-shrink-0' />
        ) : (
          <button
            onClick={handleLinkApple}
            disabled={status === 'linking'}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-content-primary bg-white/10 hover:bg-white/15 border border-stroke-strong rounded-lg transition-colors disabled:opacity-50'
          >
            {status === 'linking' ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Link2 className='w-4 h-4' />
            )}
            Link
          </button>
        )}
      </div>

      {message && (
        <p
          className={`text-xs px-1 ${
            status === 'error'
              ? 'text-lunary-error-300'
              : 'text-lunary-success-300'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
