import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import { factPageSchema } from '@/lib/seo/current-sky-fact-pages';
import { getUpcomingAstrologyEvent } from '@/lib/seo/astrology-calendar-dataset';
import { FactShell } from '../_components';

export const revalidate = 3600;

const PATH = '/grimoire/facts/next-mercury-retrograde';

export const metadata: Metadata = {
  title: 'Next Mercury Retrograde | Lunary',
  description:
    'The next Mercury retrograde date window, source dataset, and Lunary methodology links.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default async function NextMercuryRetrogradePage() {
  const event = await getUpcomingAstrologyEvent('mercury_retrograde');
  const dateKey = new Date().toISOString().slice(0, 10);
  const answer = event
    ? `The next Mercury retrograde starts on ${event.startDate} and ends on ${event.endDate}. ${event.description}`
    : 'The next Mercury retrograde is not available in the current Lunary calendar window.';

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Next Mercury Retrograde',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl: `https://lunary.app/grimoire/datasets/astrology-calendar/${new Date().getUTCFullYear()}.json`,
          archiveUrl: 'https://lunary.app/grimoire/events',
          methodologyUrl: 'https://lunary.app/about/methodology',
        }),
      )}
      <FactShell
        title='Next Mercury Retrograde'
        eyebrow={event?.startDate ?? dateKey}
        answer={answer}
        detail='This page is generated from Lunary annual astrology calendar data and links back to the retrograde guide and calculation methodology.'
        sources={[
          {
            label: 'Astrology calendar JSON',
            href: `/grimoire/datasets/astrology-calendar/${new Date().getUTCFullYear()}.json`,
          },
          {
            label: 'Retrogrades guide',
            href: '/grimoire/astronomy/retrogrades',
          },
          { label: 'Methodology', href: '/about/methodology' },
        ]}
      />
    </>
  );
}
