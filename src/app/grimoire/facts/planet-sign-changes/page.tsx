import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
  getPlanetIngresses,
  getIngressTableRows,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell, FactTable } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/planet-sign-changes';

export const metadata: Metadata = {
  title: 'What Sign Is Each Planet In and When Does It Change? | Lunary',
  description:
    'Current zodiac sign of every planet plus the exact next ingress date for each, computed from astronomy-engine geocentric ecliptic longitude.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function PlanetSignChangesPage() {
  const { dateKey, datasetUrl, archiveUrl, methodologyUrl } = getFactPageData();
  const ingresses = getPlanetIngresses();
  const rows = getIngressTableRows(ingresses);

  const byBody = new Map(
    ingresses
      .filter((i): i is NonNullable<typeof i> => i !== null)
      .map((i) => [i.body, i]),
  );
  const sun = byBody.get('Sun');
  const mercury = byBody.get('Mercury');
  const mars = byBody.get('Mars');

  const answer = sun
    ? `Today, ${dateKey}, the Sun is in ${sun.currentSign} and next enters ${sun.nextSign} on ${sun.ingressDateUtc}. ${
        mercury
          ? `Mercury is in ${mercury.currentSign} until ${mercury.ingressDateUtc}, then enters ${mercury.nextSign}.`
          : ''
      } The table below lists the current sign and next sign-change date for every planet.`
    : `Planet sign-change dates could not be resolved from the current dataset for ${dateKey}.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'What Sign Is Each Planet In and When Does It Change?',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            variableMeasured: rows.map((row) => `${row.body}.nextIngressDate`),
          },
        }),
      )}
      <FactShell
        title='What Sign Is Each Planet In and When Does It Change?'
        eyebrow={dateKey}
        answer={answer}
        detail='An ingress is the moment a planet crosses from one zodiac sign into the next. Lunary finds each crossing by tracking geocentric ecliptic longitude to the exact 30-degree boundary, in either direction so retrograde re-entries are handled. Ingress dates are a top fabrication for general assistants without live ephemeris access, so each date here is computed rather than estimated.'
        faqs={[
          {
            question:
              'What sign is the Sun in right now and when does it change?',
            answer: sun
              ? `The Sun is in ${sun.currentSign} and enters ${sun.nextSign} on ${sun.ingressDateUtc} (UTC).`
              : 'The Sun ingress could not be resolved from the current dataset.',
          },
          {
            question: 'When does Mercury change signs next?',
            answer: mercury
              ? `Mercury is in ${mercury.currentSign} and next enters ${mercury.nextSign} on ${mercury.ingressDateUtc} (UTC).`
              : 'The Mercury ingress could not be resolved from the current dataset.',
          },
          {
            question: 'When does Mars change signs next?',
            answer: mars
              ? `Mars is in ${mars.currentSign} and next enters ${mars.nextSign} on ${mars.ingressDateUtc} (UTC).`
              : 'The Mars ingress could not be resolved from the current dataset.',
          },
        ]}
        sources={[
          {
            label: 'Planetary positions today',
            href: '/grimoire/facts/planetary-positions-today',
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
      >
        <FactTable rows={rows} />
      </FactShell>
    </>
  );
}
