import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import { factPageSchema } from '@/lib/seo/current-sky-fact-pages';
import { getUpcomingAstrologyEvent } from '@/lib/seo/astrology-calendar-dataset';
import { FactShell } from '../_components';

export const revalidate = 3600;

const PATH = '/grimoire/facts/next-new-moon';

export const metadata: Metadata = {
  title: 'Next New Moon | Lunary',
  description:
    'The next New Moon date, zodiac sign, source dataset, and Lunary methodology links.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default async function NextNewMoonPage() {
  const event = await getUpcomingAstrologyEvent('new_moon');
  const dateKey = new Date().toISOString().slice(0, 10);
  const answer = event
    ? `The next New Moon is on ${event.date} in ${event.sign}. ${event.description}`
    : 'The next New Moon is not available in the current Lunary calendar window.';

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Next New Moon',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl: `https://lunary.app/grimoire/datasets/astrology-calendar/${new Date().getUTCFullYear()}.json`,
          archiveUrl: 'https://lunary.app/grimoire/datasets/current-sky',
          methodologyUrl: 'https://lunary.app/about/methodology',
        }),
      )}
      <FactShell
        title='Next New Moon'
        eyebrow={event?.date ?? dateKey}
        answer={answer}
        detail='This page is generated from Lunary annual astrology calendar data and links back to the machine-readable dataset for citation.'
        sources={[
          {
            label: 'Astrology calendar JSON',
            href: `/grimoire/datasets/astrology-calendar/${new Date().getUTCFullYear()}.json`,
          },
          {
            label: 'Moon calendar',
            href: `/grimoire/moon/${new Date().getUTCFullYear()}`,
          },
          { label: 'Methodology', href: '/about/methodology' },
        ]}
      />
    </>
  );
}
