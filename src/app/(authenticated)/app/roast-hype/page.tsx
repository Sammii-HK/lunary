/**
 * /app/roast-hype — full-page mount of the Roast Me / Hype Me card.
 *
 * Server component shell — no data fetching here; the card is a client
 * component that pulls from `/api/roast-hype` on demand. Sits inside the
 * authenticated `(authenticated)` group so middleware handles auth gating.
 */

import { Heading } from '@/components/ui/Heading';
import RoastHypeCard from '@/components/roast-hype/RoastHypeCard';

export const metadata = {
  title: 'Roast me / Hype me \u00B7 Lunary',
  description:
    'Three lines. Your actual birth chart. Pick your poison \u2014 a sharp roast or an unhinged hype.',
};

export default function RoastHypePage() {
  return (
    <main className='mx-auto max-w-3xl px-4 py-10 md:py-14'>
      <header className='mb-8'>
        <Heading as='h1' variant='h1'>
          Roast me / Hype me
        </Heading>
        <p className='mt-3 max-w-xl text-content-muted'>
          A 3-sentence reading built from your Big Three, your dominant aspects,
          and the sky right now. Tap once for the truth. Tap the other one when
          you need it.
        </p>
      </header>

      <RoastHypeCard />
    </main>
  );
}
