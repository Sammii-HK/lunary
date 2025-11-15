'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount } from 'jazz-tools/react';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sparkles, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';

interface MoonCircleData {
  id: number;
  moonPhase: string;
  moonSign: string;
  circleDate: string;
  content: {
    guidedRitual: string;
    journalQuestions: string[];
    tarotSpreadSuggestion: string;
    aiDeepDivePrompt: string;
    moonSignInfo: string;
    intention: string;
  };
}

export default function MoonCirclesPage() {
  const authState = useAuthStatus();
  const { me } = useAccount();
  const searchParams = useSearchParams();
  const [moonCircle, setMoonCircle] = useState<MoonCircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const dateParam = searchParams.get('date');

  useEffect(() => {
    async function fetchMoonCircle() {
      try {
        const date = dateParam || new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/moon-circles?date=${date}`);
        if (response.ok) {
          const data = await response.json();
          setMoonCircle(data.moonCircle);
        }
      } catch (error) {
        console.error('Failed to fetch moon circle:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMoonCircle();
  }, [dateParam]);

  if (authState.loading || loading) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
        <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-6 md:py-10'>
          <div className='text-zinc-400'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
        <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:py-10'>
          <header className='mb-6 space-y-2'>
            <h1 className='text-3xl font-light tracking-tight text-zinc-50 md:text-4xl'>
              Moon Circles
            </h1>
            <p className='text-sm text-zinc-400 md:text-base'>
              Join our community for New Moon and Full Moon rituals, journaling,
              and cosmic guidance.
            </p>
          </header>

          <main className='flex flex-1 flex-col items-center justify-center gap-6'>
            <div className='rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur p-8 md:p-12 text-center max-w-lg'>
              <h2 className='text-2xl font-light text-zinc-50 mb-4'>
                Sign in to access Moon Circles
              </h2>
              <p className='text-sm text-zinc-400 mb-6 md:text-base'>
                Join our community for guided rituals, journal prompts, and AI
                deep-dives during New Moon and Full Moon.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-500'
              >
                Sign In
              </Button>
            </div>
          </main>

          {showAuthModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
              <div className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl'>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-200'
                  aria-label='Close'
                >
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
                <AuthComponent
                  onSuccess={() => {
                    setShowAuthModal(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!moonCircle) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
        <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:py-10'>
          <header className='mb-6 space-y-2'>
            <h1 className='text-3xl font-light tracking-tight text-zinc-50 md:text-4xl'>
              Moon Circles
            </h1>
            <p className='text-sm text-zinc-400 md:text-base'>
              Join our community for New Moon and Full Moon rituals.
            </p>
          </header>

          <main className='flex flex-1 flex-col items-center justify-center gap-6'>
            <div className='rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur p-8 md:p-12 text-center max-w-lg'>
              <Moon className='w-16 h-16 text-purple-400 mx-auto mb-4' />
              <h2 className='text-2xl font-light text-zinc-50 mb-4'>
                No Moon Circle Today
              </h2>
              <p className='text-sm text-zinc-400 mb-6 md:text-base'>
                Moon Circles are created for New Moon and Full Moon events.
                Check back soon!
              </p>
              <Link
                href='/grimoire/moon'
                className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-500'
              >
                Explore Moon Rituals
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const emoji = moonCircle.moonPhase === 'New Moon' ? '🌑' : '🌕';
  const deepLinkUrl = `/book-of-shadows?prompt=${encodeURIComponent(moonCircle.content.aiDeepDivePrompt)}`;

  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
      <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:py-10'>
        <header className='mb-6 space-y-2'>
          <div className='flex items-center gap-3'>
            <span className='text-4xl'>{emoji}</span>
            <div>
              <h1 className='text-3xl font-light tracking-tight text-zinc-50 md:text-4xl'>
                Moon Circle
              </h1>
              <p className='text-sm text-zinc-400 md:text-base'>
                {moonCircle.moonPhase} in {moonCircle.moonSign}
              </p>
            </div>
          </div>
        </header>

        <main className='flex flex-1 flex-col gap-6'>
          <div className='rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur p-6 md:p-8 space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Moon className='w-5 h-5 text-purple-400 mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-lg font-medium text-zinc-100 mb-2'>
                    {moonCircle.moonPhase} Energy
                  </h2>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    {moonCircle.content.moonSignInfo}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Sparkles className='w-5 h-5 text-purple-400 mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-lg font-medium text-zinc-100 mb-2'>
                    Guided Ritual
                  </h2>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    {moonCircle.content.guidedRitual}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <PenTool className='w-5 h-5 text-purple-400 mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-lg font-medium text-zinc-100 mb-2'>
                    Journal Questions
                  </h2>
                  <ul className='space-y-2'>
                    {moonCircle.content.journalQuestions.map(
                      (question, index) => (
                        <li
                          key={index}
                          className='text-sm text-zinc-300 leading-relaxed'
                        >
                          • {question}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <BookOpen className='w-5 h-5 text-purple-400 mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-lg font-medium text-zinc-100 mb-2'>
                    Tarot Spread Suggestion
                  </h2>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    {moonCircle.content.tarotSpreadSuggestion}
                  </p>
                  <Link
                    href='/tarot'
                    className='inline-block mt-2 text-sm text-purple-400 hover:text-purple-300 underline'
                  >
                    Draw cards now →
                  </Link>
                </div>
              </div>
            </div>

            <div className='pt-4 border-t border-zinc-800/60'>
              <Link
                href={deepLinkUrl}
                className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-500'
              >
                Ask Lunary AI for Deep Dive →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
