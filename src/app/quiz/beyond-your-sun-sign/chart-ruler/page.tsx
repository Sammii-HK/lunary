import type { Metadata } from 'next';
import { Heading } from '@/components/ui/Heading';
import { ChartRulerQuizClient } from '@/components/quiz/ChartRulerQuizClient';

export const metadata: Metadata = {
  title: 'Chart Ruler Profile — Beyond Your Sun Sign | Lunary',
  description:
    'Most people read their sun sign and stop. Your chart ruler is the hidden director of your whole chart. Take the 90-second quiz to find yours, using your full birth chart.',
  openGraph: {
    title: 'Your Chart Ruler: the hidden director of your whole chart',
    description:
      'Take the Beyond Your Sun Sign quiz. 90 seconds, uses your full birth chart, not just your sun sign.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Chart Ruler: the hidden director of your whole chart',
    description:
      'Take the Beyond Your Sun Sign quiz. 90 seconds. Uses your full birth chart.',
  },
};

export default function ChartRulerQuizPage() {
  return (
    <main className='min-h-screen'>
      <section className='mx-auto w-full max-w-4xl px-4 pt-16 pb-6 text-center sm:pt-24'>
        <span className='text-lunary-accent mb-3 inline-block text-xs tracking-widest uppercase'>
          Beyond Your Sun Sign · by Lunary
        </span>
        <Heading as='h1' variant='h1' className='mb-4'>
          The placement that actually runs your chart
        </Heading>
        <p className='text-content-secondary mx-auto max-w-2xl text-base sm:text-lg'>
          Your rising sign is only the first layer. The planet that rules it —
          your <em>chart ruler</em> — is the hidden director of your whole
          chart. Ninety seconds, full birth chart, no sun sign guesswork.
        </p>
      </section>

      <ChartRulerQuizClient />

      <section className='mx-auto w-full max-w-3xl px-4 py-12 sm:py-16'>
        <Heading as='h2' variant='h3' className='mb-6'>
          How this works
        </Heading>
        <div className='text-content-secondary flex flex-col gap-4 text-sm leading-relaxed sm:text-base'>
          <p>
            We compute your full natal chart using astronomy-engine (the same
            library used by Lunary's flagship birth-chart reader, accurate to
            within an arcminute).
          </p>
          <p>
            Your rising sign is determined by what was ascending on the eastern
            horizon at your birth. The planet that rules that sign becomes your
            chart ruler. Its sign, house, and aspects colour every other
            placement in your chart.
          </p>
          <p>
            Unlike most astrology quizzes, this one doesn't run on archetypes or
            sun-sign generalisations. Every result is composed from your actual
            placements.
          </p>
        </div>
      </section>
    </main>
  );
}
