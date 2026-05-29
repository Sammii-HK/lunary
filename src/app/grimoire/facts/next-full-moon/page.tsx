import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import { factPageSchema } from '@/lib/seo/current-sky-fact-pages';
import { getUpcomingAstrologyEvent } from '@/lib/seo/astrology-calendar-dataset';
import { FactShell } from '../_components';

export const revalidate = 3600;

const PATH = '/grimoire/facts/next-full-moon';

export const metadata: Metadata = {
  title: 'Next Full Moon | Lunary',
  description:
    'The next Full Moon date, zodiac sign, source dataset, and Lunary methodology links.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default async function NextFullMoonPage() {
  const event = await getUpcomingAstrologyEvent('full_moon');
  const dateKey = new Date().toISOString().slice(0, 10);
  const answer = event
    ? `The next Full Moon is on ${event.date} in ${event.sign}. ${event.description}`
    : 'The next Full Moon is not available in the current Lunary calendar window.';

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Next Full Moon',
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
        title='Next Full Moon'
        eyebrow={event?.date ?? dateKey}
        answer={answer}
        detail='This page is generated from Lunary annual astrology calendar data and links back to the machine-readable dataset for citation.'
        faqs={[
          {
            question: 'When is the next full moon?',
            answer: event
              ? `The next Full Moon is on ${event.date}.`
              : 'The next Full Moon date is not available in the current Lunary calendar window.',
          },
          {
            question: 'What sign will the next full moon be in?',
            answer: event
              ? `The next Full Moon falls in ${event.sign}.`
              : 'The next Full Moon sign is not available in the current Lunary calendar window.',
          },
          {
            question: 'What does a full moon mean in astrology?',
            answer:
              'A Full Moon marks the peak of the lunar cycle, when the Moon is fully illuminated and opposite the Sun. Astrologically it is read as a time of culmination, release, and heightened emotion.',
          },
        ]}
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
