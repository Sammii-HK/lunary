import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
  getPlanetaryPositionRows,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell, FactTable } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/planetary-positions-today';

export const metadata: Metadata = {
  title: 'Planetary Positions Today | Lunary',
  description:
    'Today’s Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn sign positions with source dataset links.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function PlanetaryPositionsTodayPage() {
  const { facts, dateKey, datasetUrl, archiveUrl, methodologyUrl } =
    getFactPageData();
  const rows = getPlanetaryPositionRows(facts);
  const answer = `Today, ${dateKey}, the Sun is in ${facts.sun.sign}, the Moon is in ${facts.moon.sign}, Mercury is in ${facts.planets[0].sign}, Venus is in ${facts.planets[1].sign}, Mars is in ${facts.planets[2].sign}, Jupiter is in ${facts.planets[3].sign}, and Saturn is in ${facts.planets[4].sign}.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Planetary Positions Today',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            variableMeasured: rows.map((row) => `${row.body}.sign`),
          },
        }),
      )}
      <FactShell
        title='Planetary Positions Today'
        eyebrow={dateKey}
        answer={answer}
        detail='These are geocentric ecliptic longitude positions for the Sun, Moon, and visible planets. Use the JSON dataset for exact degrees and the methodology page for calculation notes.'
        faqs={[
          {
            question: 'Where are the planets right now?',
            answer: `As of ${dateKey}, the Sun is in ${facts.sun.sign}, the Moon is in ${facts.moon.sign}, Mercury in ${facts.planets[0].sign}, Venus in ${facts.planets[1].sign}, and Mars in ${facts.planets[2].sign}.`,
          },
          {
            question: 'What zodiac sign is the Sun in right now?',
            answer: `The Sun is currently in ${facts.sun.sign}, which means it is ${facts.sun.sign} season.`,
          },
          {
            question: 'How are these planetary positions calculated?',
            answer:
              'Lunary computes geocentric ecliptic longitude for each body and maps it to the zodiac sign. The exact degrees are available in the linked current-sky JSON dataset, with calculation notes on the methodology page.',
          },
        ]}
        sources={[
          {
            label: 'Current sky JSON',
            href: '/grimoire/datasets/current-sky-facts.json',
          },
          { label: 'Snapshot archive', href: '/grimoire/datasets/current-sky' },
          {
            label: 'Dated snapshot',
            href: `/grimoire/datasets/current-sky/${dateKey}`,
          },
          { label: 'Methodology', href: '/about/methodology' },
        ]}
      >
        <FactTable rows={rows} />
      </FactShell>
    </>
  );
}
