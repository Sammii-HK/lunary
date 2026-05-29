import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import { factPageSchema } from '@/lib/seo/current-sky-fact-pages';
import { getUpcomingAstrologyEvent } from '@/lib/seo/astrology-calendar-dataset';
import { FactShell } from '../_components';

export const revalidate = 3600;

const PATH = '/grimoire/facts/next-eclipse';

export const metadata: Metadata = {
  title: 'Next Eclipse | Lunary',
  description:
    'The next solar or lunar eclipse date, zodiac sign, source dataset, and Lunary methodology links.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default async function NextEclipsePage() {
  const event = await getUpcomingAstrologyEvent('eclipse');
  const dateKey = new Date().toISOString().slice(0, 10);
  const type = event?.type === 'solar' ? 'Solar Eclipse' : 'Lunar Eclipse';
  const answer = event
    ? `The next eclipse is a ${type} on ${event.date} in ${event.sign}. ${event.description}`
    : 'The next eclipse is not available in the current Lunary calendar window.';

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Next Eclipse',
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
        title='Next Eclipse'
        eyebrow={event?.date ?? dateKey}
        answer={answer}
        detail='This page is generated from Lunary annual astrology calendar data and links back to eclipse guides and methodology.'
        faqs={[
          {
            question: 'When is the next eclipse?',
            answer: event
              ? `The next eclipse is a ${type} on ${event.date} in ${event.sign}.`
              : 'The next eclipse is not available in the current Lunary calendar window.',
          },
          {
            question: 'Is the next eclipse a solar or lunar eclipse?',
            answer: event
              ? `The next eclipse is a ${type}.`
              : 'The next eclipse type is not available in the current Lunary calendar window.',
          },
          {
            question: 'What do eclipses mean in astrology?',
            answer:
              'Eclipses are supercharged New Moons (solar) or Full Moons (lunar) that fall near the lunar nodes. Astrologically they are read as accelerated turning points that bring beginnings, endings, and pivotal events.',
          },
        ]}
        sources={[
          {
            label: 'Astrology calendar JSON',
            href: `/grimoire/datasets/astrology-calendar/${new Date().getUTCFullYear()}.json`,
          },
          { label: 'Eclipse guide', href: '/grimoire/eclipses' },
          { label: 'Methodology', href: '/about/methodology' },
        ]}
      />
    </>
  );
}
