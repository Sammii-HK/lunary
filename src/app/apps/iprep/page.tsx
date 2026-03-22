import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingNavbar } from '@/components/MarketingNavbar';

export const metadata: Metadata = {
  title: 'iPrep — AI Interview Coach | Lunar Computing',
  description:
    'Practice interview answers with AI-powered feedback. Speech recognition, spaced repetition, and detailed scoring — all private, all on your device.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/iprep',
  },
  openGraph: {
    title: 'iPrep — AI Interview Coach',
    description:
      'Practice answers, get AI feedback, track your progress. Everything stays on your device.',
    url: 'https://lunary.app/apps/iprep',
    siteName: 'Lunar Computing',
    locale: 'en_US',
    type: 'website',
  },
};

const features = [
  {
    icon: '🎙️',
    title: 'Speech recognition',
    description:
      "Answer questions out loud. Your speech is transcribed on your device using Apple's Speech framework — no audio is ever stored.",
  },
  {
    icon: '🤖',
    title: 'AI scoring',
    description:
      'Get scored on answer quality, structure, confidence, and delivery. Uses on-device AI by default — nothing leaves your phone.',
  },
  {
    icon: '📚',
    title: 'Question banks',
    description:
      'Behavioural, technical, system design, leadership, and personal questions. Add your own or generate with AI.',
  },
  {
    icon: '🔁',
    title: 'Spaced repetition',
    description:
      'Weak answers resurface more often. The app learns what you struggle with and drills it until it sticks.',
  },
  {
    icon: '📊',
    title: 'Detailed feedback',
    description:
      'See what you got right, what you missed, better phrasing suggestions, and filler word counts.',
  },
  {
    icon: '🎯',
    title: 'Mock interviews',
    description:
      'Run a full mock with 5–10 questions back to back. Interview day mode surfaces your weakest questions first.',
  },
];

const privacyPoints = [
  {
    title: 'On-device by default',
    description:
      'Speech recognition and AI scoring run on your device. Your transcripts and answers never leave your phone unless you choose otherwise.',
  },
  {
    title: 'iCloud sync — your account only',
    description:
      'Practice history and scores sync to your iCloud account via CloudKit. Only you can access this data — not us.',
  },
  {
    title: 'Bring your own key (optional)',
    description:
      'Add a DeepInfra or Claude API key for richer AI feedback. Keys are stored in your Keychain and sent directly to the API — never via our servers.',
  },
  {
    title: 'No tracking, no ads',
    description:
      'We do not build ad profiles, sell your data, or track your usage beyond basic crash reporting.',
  },
];

export default function IPrepLandingPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col'>
      <MarketingNavbar />

      {/* Hero */}
      <section className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full'>
        <div className='max-w-2xl'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='text-xs font-medium px-3 py-1 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 border border-lunary-primary-800'>
              iOS App
            </span>
            <span className='text-zinc-500 text-xs'>by Lunar Computing</span>
          </div>
          <h1 className='text-4xl md:text-6xl font-semibold text-white mb-5 leading-tight'>
            Ace your next
            <br />
            <span className='text-lunary-primary-400'>interview</span>
          </h1>
          <p className='text-zinc-400 text-lg md:text-xl leading-relaxed mb-8 max-w-lg'>
            Practice out loud. Get AI feedback on every answer. Track what you
            struggle with and fix it before the real thing.
          </p>
          <div className='flex flex-wrap items-center gap-4'>
            <a
              href='https://apps.apple.com/app/iprep'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors'
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
              </svg>
              Download on the App Store
            </a>
            <span className='text-zinc-500 text-sm'>
              Free to start · 14-day premium trial
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full'>
        <h2 className='text-2xl md:text-3xl font-semibold text-white mb-2'>
          Everything you need to prepare
        </h2>
        <p className='text-zinc-400 mb-10'>
          From first practice to the night before — iPrep covers the whole
          journey.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {features.map((f) => (
            <div
              key={f.title}
              className='p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40'
            >
              <div className='text-2xl mb-3'>{f.icon}</div>
              <h3 className='text-base font-semibold text-white mb-2'>
                {f.title}
              </h3>
              <p className='text-zinc-400 text-sm leading-relaxed'>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy section */}
      <section className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full'>
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 md:p-10'>
          <div className='mb-8'>
            <p className='text-lunary-primary-400 text-sm font-medium uppercase tracking-widest mb-2'>
              Privacy first
            </p>
            <h2 className='text-2xl md:text-3xl font-semibold text-white mb-3'>
              Your practice stays yours
            </h2>
            <p className='text-zinc-400 max-w-lg'>
              Interview prep is personal. iPrep is designed so your answers,
              scores, and profile never leave your device unless you explicitly
              choose otherwise.
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {privacyPoints.map((p) => (
              <div key={p.title} className='flex gap-3'>
                <div className='mt-0.5 w-5 h-5 rounded-full bg-lunary-primary-900/60 border border-lunary-primary-700 flex-shrink-0 flex items-center justify-center'>
                  <svg
                    className='w-3 h-3 text-lunary-primary-400'
                    viewBox='0 0 12 12'
                    fill='none'
                  >
                    <path
                      d='M2 6l2.5 2.5L10 3.5'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm font-medium text-white mb-1'>
                    {p.title}
                  </p>
                  <p className='text-zinc-400 text-sm leading-relaxed'>
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full'>
        <div className='text-center'>
          <h2 className='text-2xl md:text-3xl font-semibold text-white mb-3'>
            Start practising today
          </h2>
          <p className='text-zinc-400 mb-8'>
            Free to download. 14-day premium trial included.
          </p>
          <a
            href='https://apps.apple.com/app/iprep'
            className='inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
            </svg>
            Download on the App Store
          </a>
        </div>
      </section>

      {/* Legal footer */}
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full'>
        <div className='pt-8 border-t border-zinc-800 flex flex-wrap gap-5'>
          <Link
            href='/apps/iprep/privacy'
            className='text-zinc-500 hover:text-zinc-300 text-sm transition-colors'
          >
            Privacy policy
          </Link>
          <Link
            href='/apps/terms'
            className='text-zinc-500 hover:text-zinc-300 text-sm transition-colors'
          >
            Terms of service
          </Link>
          <Link
            href='/apps'
            className='text-zinc-500 hover:text-zinc-300 text-sm transition-colors'
          >
            All apps
          </Link>
        </div>
      </div>

      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
