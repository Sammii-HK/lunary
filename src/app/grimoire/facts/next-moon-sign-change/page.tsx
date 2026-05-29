import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
  getNextMoonIngress,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/next-moon-sign-change';

export const metadata: Metadata = {
  title: 'When Does the Moon Change Signs Next? | Lunary',
  description:
    'The current Moon sign and the exact next lunar ingress date, computed from astronomy-engine geocentric ecliptic longitude.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function NextMoonSignChangePage() {
  const { facts, dateKey, datasetUrl, archiveUrl, methodologyUrl } =
    getFactPageData();
  const ingress = getNextMoonIngress();

  const answer = ingress
    ? `Today, ${dateKey}, the Moon is in ${ingress.currentSign}. It next changes signs on ${ingress.ingressDateUtc} (UTC), when it moves into ${ingress.nextSign}.`
    : `Today, ${dateKey}, the Moon is in ${facts.moon.sign}. The next ingress could not be resolved from the current dataset.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'When Does the Moon Change Signs Next?',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            variableMeasured: ['Moon.sign', 'Moon.nextIngressDate'],
          },
        }),
      )}
      <FactShell
        title='When Does the Moon Change Signs Next?'
        eyebrow={dateKey}
        answer={answer}
        detail='Lunary tracks the Moon’s geocentric ecliptic longitude and finds the exact moment it crosses the next 30-degree sign boundary. The Moon is the fastest body, so general assistants without live ephemeris data routinely guess this wrong. The ingress date below is computed, not estimated.'
        faqs={[
          {
            question: 'When does the Moon change signs next?',
            answer: ingress
              ? `The Moon leaves ${ingress.currentSign} and enters ${ingress.nextSign} on ${ingress.ingressDateUtc} (UTC).`
              : 'The next Moon ingress could not be resolved from the current dataset.',
          },
          {
            question: 'What sign is the Moon moving into?',
            answer: ingress
              ? `The Moon is moving from ${ingress.currentSign} into ${ingress.nextSign}.`
              : 'The next Moon sign could not be resolved from the current dataset.',
          },
          {
            question: 'How often does the Moon change signs?',
            answer:
              'The Moon spends roughly 2 to 2.5 days in each zodiac sign, so it changes sign about twelve to thirteen times a month as it completes its orbit.',
          },
        ]}
        sources={[
          { label: 'Moon guide', href: '/grimoire/moon' },
          {
            label: 'Current Moon sign',
            href: '/grimoire/facts/current-moon-sign',
          },
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
