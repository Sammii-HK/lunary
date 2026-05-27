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
