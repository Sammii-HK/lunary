import type { Metadata } from 'next';
import { Heading } from '@/components/ui/Heading';
import { CosmicVibeQuiz } from '@/components/quiz/CosmicVibeQuiz';

// TODO(orchestrator): wire a nav entry to /quiz/cosmic-vibe — best
// surfaces are the post-signup empty-state ("haven't added your birth
// data yet?") and the Profile tab as a "Try the 30-second quiz" CTA.
// This page is currently only reachable via direct URL.

// Server component shell — mounts the client quiz and provides
// SEO/sharing metadata. The actual interactive flow lives in
// <CosmicVibeQuiz> so the page itself stays static and fast.

export const metadata: Metadata = {
  title: 'Cosmic Profile Quiz · Lunary',
  description:
    'Five questions, thirty seconds. Discover your cosmic archetype and a poetic one-liner that finally gets you.',
  openGraph: {
    title: 'Cosmic Profile Quiz · Lunary',
    description:
      'Five questions, thirty seconds. Discover your cosmic archetype.',
  },
};

export default function CosmicVibeQuizPage() {
  return (
    <main className='relative min-h-[100dvh] overflow-hidden bg-layer-base text-content-primary'>
      {/* Decorative starlit gradient background */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(132,88,216,0.18),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(238,120,158,0.12),transparent_55%)]'
      />

      <div className='relative mx-auto flex max-w-2xl flex-col gap-8 px-6 pt-12 pb-24 sm:pt-16'>
        <header className='flex flex-col items-center gap-3 text-center'>
          <span className='text-xs uppercase tracking-[0.3em] text-content-muted'>
            Cosmic profile · 30 seconds
          </span>
          <Heading as='h1' variant='h1'>
            Find your cosmic vibe
          </Heading>
          <p className='max-w-md text-sm text-content-secondary sm:text-base'>
            Five mood-based questions. One archetype. A line you’ll screenshot
            and send to your group chat.
          </p>
        </header>

        <CosmicVibeQuiz />
      </div>
    </main>
  );
}
