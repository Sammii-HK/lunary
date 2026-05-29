import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/current-sun-sign';

export const metadata: Metadata = {
  title: 'Current Sun Sign & Zodiac Season | Lunary',
  description:
    'The current Sun sign and active zodiac season with degree, ecliptic longitude, and source dataset from Lunary current-sky facts.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function CurrentSunSignPage() {
  const { facts, dateKey, datasetUrl, archiveUrl, methodologyUrl } =
    getFactPageData();
  const answer = `Today, ${dateKey}, the Sun is in ${facts.sun.sign} at ${facts.sun.degreeInSign.toFixed(2)} degrees of the sign, so the current zodiac season is ${facts.sun.sign} season. Geocentric ecliptic longitude is ${facts.sun.eclipticLongitude.toFixed(2)} degrees.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Current Sun Sign & Zodiac Season',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            variableMeasured: ['Sun.sign', 'Sun.eclipticLongitude'],
          },
        }),
      )}
      <FactShell
        title='Current Sun Sign & Zodiac Season'
        eyebrow={dateKey}
        answer={answer}
        detail='Lunary calculates the Sun sign from geocentric ecliptic longitude. The Sun sign sets the current zodiac season, the broad seasonal theme the rest of the sky plays against. This page is designed for direct citation, while the linked dataset preserves the machine-readable fact.'
        faqs={[
          {
            question: 'What zodiac sign is it right now?',
            answer: `Right now, on ${dateKey}, the Sun is in ${facts.sun.sign} at ${facts.sun.degreeInSign.toFixed(1)} degrees of the sign.`,
          },
          {
            question: 'What zodiac season are we in?',
            answer: `It is currently ${facts.sun.sign} season, because the Sun is travelling through ${facts.sun.sign}.`,
          },
          {
            question: 'How long does a zodiac season last?',
            answer:
              'Each zodiac season lasts roughly a month, because the Sun spends about 30 days in each of the twelve signs as it completes its yearly journey around the zodiac.',
          },
        ]}
        sources={[
          { label: 'Zodiac guide', href: '/grimoire/zodiac' },
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
