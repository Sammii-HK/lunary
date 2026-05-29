import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/current-moon-sign';

export const metadata: Metadata = {
  title: 'Current Moon Sign | Lunary',
  description:
    'The current Moon sign with degree, ecliptic longitude, and source dataset from Lunary current-sky facts.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function CurrentMoonSignPage() {
  const { facts, dateKey, datasetUrl, archiveUrl, methodologyUrl } =
    getFactPageData();
  const answer = `Today, ${dateKey}, the Moon is in ${facts.moon.sign} at ${facts.moon.degreeInSign.toFixed(2)} degrees of the sign, with geocentric ecliptic longitude ${facts.moon.eclipticLongitude.toFixed(2)} degrees.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Current Moon Sign',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
        }),
      )}
      <FactShell
        title='Current Moon Sign'
        eyebrow={dateKey}
        answer={answer}
        detail='Lunary calculates the Moon sign from geocentric ecliptic longitude. This page is designed for direct citation, while the linked dataset preserves the machine-readable fact.'
        faqs={[
          {
            question: 'What sign is the Moon in today?',
            answer: `As of ${dateKey}, the Moon is in ${facts.moon.sign} at ${facts.moon.degreeInSign.toFixed(1)} degrees of the sign.`,
          },
          {
            question: 'How often does the Moon change signs?',
            answer:
              'The Moon moves through one zodiac sign roughly every 2 to 3 days, completing all twelve signs in about 27 to 28 days.',
          },
          {
            question: 'What does the current Moon sign mean?',
            answer: `The current Moon sign, ${facts.moon.sign}, describes the collective emotional tone for the next couple of days. It is short-lived weather rather than your natal Moon sign, which is fixed at birth.`,
          },
        ]}
        sources={[
          { label: 'Moon guide', href: '/grimoire/moon' },
          {
            label: 'Current sky JSON',
            href: '/grimoire/datasets/current-sky-facts.json',
          },
          {
            label: 'Dated snapshot',
            href: `/grimoire/datasets/current-sky/${dateKey}`,
          },
          { label: 'Methodology', href: '/about/methodology' },
        ]}
      />
    </>
  );
}
