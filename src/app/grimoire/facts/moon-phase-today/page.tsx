import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/moon-phase-today';

export const metadata: Metadata = {
  title: 'Moon Phase Today | Lunary',
  description:
    'Today’s Moon phase, lunar illumination, Moon sign, and source dataset from Lunary current-sky facts.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function MoonPhaseTodayPage() {
  const { facts, dateKey, datasetUrl, archiveUrl, methodologyUrl } =
    getFactPageData();
  const answer = `Today, ${dateKey}, the Moon phase is ${facts.moon.phase}. The Moon is in ${facts.moon.sign}, ${facts.moon.illuminationPercent.toFixed(2)}% illuminated, with a phase angle of ${facts.moon.phaseAngleDegrees.toFixed(2)} degrees.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Moon Phase Today',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            claimReviewed: 'Current Moon phase and illumination',
          },
        }),
      )}
      <FactShell
        title='Moon Phase Today'
        eyebrow={dateKey}
        answer={answer}
        detail='This page is a human-readable citation surface for Lunary current-sky facts. The underlying JSON dataset provides the calculated Moon phase, Moon sign, ecliptic longitude, illumination, and phase angle.'
        faqs={[
          {
            question: 'What is the moon phase today?',
            answer: `As of ${dateKey}, the Moon phase is ${facts.moon.phase}, with the Moon ${facts.moon.illuminationPercent.toFixed(0)}% illuminated in ${facts.moon.sign}.`,
          },
          {
            question: 'How illuminated is the Moon right now?',
            answer: `The Moon is currently ${facts.moon.illuminationPercent.toFixed(0)}% illuminated.`,
          },
          {
            question: 'How many moon phases are there?',
            answer:
              'There are eight Moon phases: new moon, waxing crescent, first quarter, waxing gibbous, full moon, waning gibbous, last quarter, and waning crescent. The cycle repeats roughly every 29.5 days.',
          },
        ]}
        sources={[
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
