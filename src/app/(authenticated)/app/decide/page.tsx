import type { Metadata } from 'next';

import { Heading } from '@/components/ui/Heading';
import DecisionHelperCard from '@/components/decision-helper/DecisionHelperCard';

export const metadata: Metadata = {
  title: 'Cosmic Decision Helper · Lunary',
  description:
    'Ask a question. Get a Yes / Wait / No verdict from the sky and your chart — with a recommended better day if today is not the moment.',
};

export default function DecidePage() {
  return (
    <div className='h-full overflow-auto'>
      <div className='mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-16 sm:p-6'>
        <header className='flex flex-col gap-2'>
          <Heading as='h1' variant='h1'>
            Decide
          </Heading>
          <p className='text-sm text-content-secondary'>
            Stop spiralling. Type the question. The cosmos answers in three
            shapes — <span className='text-lunary-success'>Yes</span>,{' '}
            <span className='text-lunary-accent'>Wait</span>, or{' '}
            <span className='text-lunary-rose'>No</span> — based on your natal
            chart and today’s sky. No mystic mush, no LLMs guessing — just
            transits, scored.
          </p>
        </header>

        <DecisionHelperCard />

        <section className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-4 text-sm text-content-muted sm:p-5'>
          <Heading as='h3' variant='h3'>
            How it works
          </Heading>
          <ul className='mt-2 flex flex-col gap-1.5 leading-relaxed'>
            <li>
              <span className='text-content-secondary'>Categorise.</span> Your
              question is mapped to one of eight domains — communication, love,
              action, career, creative, travel, commitment, rest.
            </li>
            <li>
              <span className='text-content-secondary'>Score.</span> Today’s
              transits to your natal chart are weighted (trines and sextiles
              support, squares and oppositions resist) with retrograde
              modifiers.
            </li>
            <li>
              <span className='text-content-secondary'>Better day.</span> If
              today is not a clean Yes, we forward-scan the next 14 days and
              suggest the cleanest window.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
