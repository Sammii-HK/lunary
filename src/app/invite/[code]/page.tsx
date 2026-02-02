'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/components/AuthStatus';
import dynamic from 'next/dynamic';

const AuthComponent = dynamic(
  () => import('@/components/Auth').then((m) => ({ default: m.AuthComponent })),
  {
    loading: () => (
      <div className='h-48 bg-zinc-800 animate-pulse rounded-lg' />
    ),
  },
);

type InviteStatus = 'loading' | 'valid' | 'expired' | 'error' | 'accepted';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const authState = useAuthStatus();
  const code = params.code as string;

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [inviterName, setInviterName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [accepting, setAccepting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    async function checkInvite() {
      try {
        const response = await fetch(`/api/friends/invite/${code}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setInviterName(data.inviterName);
          setStatus('valid');
        } else {
          setErrorMessage(data.error || 'Invalid invite');
          setStatus('expired');
        }
      } catch {
        setErrorMessage('Failed to load invite');
        setStatus('error');
      }
    }

    checkInvite();
  }, [code]);

  // Accept invite - used when clicking the button while authenticated
  const handleAccept = async () => {
    if (!authState.isAuthenticated) {
      setShowAuth(true);
      return;
    }
    await acceptInvite();
  };

  // Actually perform the invite acceptance (called after auth or directly)
  const acceptInvite = async () => {
    setAccepting(true);
    try {
      const response = await fetch(`/api/friends/invite/${code}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('accepted');
        setTimeout(() => {
          router.push('/profile?tab=circle');
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Failed to accept invite');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Failed to accept invite');
      setStatus('error');
    } finally {
      setAccepting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-lunary-bg'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary' />
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-lunary-bg p-4'>
        <div className='max-w-md w-full text-center space-y-6'>
          <div className='w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center'>
            <Check className='w-10 h-10 text-green-400' />
          </div>
          <h1 className='text-2xl font-bold text-white'>Connected!</h1>
          <p className='text-zinc-400'>
            You and {inviterName} are now cosmic friends. Redirecting to your
            Circle...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'expired' || status === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-lunary-bg p-4'>
        <div className='max-w-md w-full text-center space-y-6'>
          <div className='w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center'>
            <X className='w-10 h-10 text-red-400' />
          </div>
          <h1 className='text-2xl font-bold text-white'>
            {status === 'expired' ? 'Invite Expired' : 'Something Went Wrong'}
          </h1>
          <p className='text-zinc-400'>{errorMessage}</p>
          <Button onClick={() => router.push('/')} variant='outline'>
            Go to Lunary
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-lunary-bg p-4'>
      <div className='max-w-md w-full space-y-8'>
        {/* Invite Card */}
        <div className='rounded-2xl border border-zinc-700 bg-lunary-bg-deep p-8 text-center space-y-6'>
          <div className='w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-lunary-primary to-lunary-highlight flex items-center justify-center'>
            <Users className='w-10 h-10 text-white' />
          </div>

          <div className='space-y-2'>
            <h1 className='text-2xl font-bold text-white'>
              {inviterName} wants to connect
            </h1>
            <p className='text-zinc-400'>
              Join their cosmic circle on Lunary to discover your compatibility
              and explore the stars together.
            </p>
          </div>

          <div className='flex items-center justify-center gap-2 text-sm text-lunary-accent-300'>
            <Sparkles className='w-4 h-4' />
            <span>Compare birth charts & see synastry</span>
          </div>

          {!showAuth ? (
            <Button
              onClick={handleAccept}
              variant='lunary'
              size='lg'
              className='w-full'
              disabled={accepting}
            >
              {accepting
                ? 'Connecting...'
                : authState.isAuthenticated
                  ? 'Accept & Connect'
                  : 'Sign Up to Connect'}
            </Button>
          ) : (
            <div className='pt-4'>
              <AuthComponent
                defaultToSignUp={true}
                onSuccess={() => {
                  setShowAuth(false);
                  // Force accept without checking local auth state
                  // The server will validate the session
                  acceptInvite();
                }}
              />
            </div>
          )}

          {authState.isAuthenticated && !showAuth && (
            <p className='text-xs text-zinc-500'>
              Signed in as {authState.user?.email}
            </p>
          )}
        </div>

        {/* Features Preview */}
        <div className='grid grid-cols-2 gap-3'>
          {[
            { title: 'Synastry', desc: 'Relationship compatibility' },
            { title: 'Aspects', desc: 'How your charts interact' },
            { title: 'Elements', desc: 'Fire, Earth, Air, Water balance' },
            { title: 'Timing', desc: 'Best days for connection' },
          ].map((feature) => (
            <div
              key={feature.title}
              className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center'
            >
              <div className='text-sm font-medium text-white'>
                {feature.title}
              </div>
              <div className='text-xs text-zinc-500'>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
