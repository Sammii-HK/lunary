import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
  getMercuryRetrogradeStatus,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/mercury-retrograde-status';

export const metadata: Metadata = {
  title: 'Is Mercury Retrograde Today? | Lunary',
  description:
    'Current Mercury retrograde status, sign, longitude, and source methodology from Lunary.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

export default function MercuryRetrogradeStatusPage() {
  const { dateKey, datasetUrl, archiveUrl, methodologyUrl } = getFactPageData();
  const mercury = getMercuryRetrogradeStatus();
  const answer = `Today, ${dateKey}, Mercury is ${mercury.isRetrograde ? 'retrograde' : 'direct'} in ${mercury.sign} at ${mercury.degreeInSign.toFixed(2)} degrees of the sign.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Is Mercury Retrograde Today?',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            variableMeasured: ['Mercury.retrograde', 'Mercury.sign'],
          },
        }),
      )}
      <FactShell
        title='Is Mercury Retrograde Today?'
        eyebrow={dateKey}
        answer={answer}
        detail={mercury.retrogradeEffect}
        sources={[
          {
            label: 'Retrogrades guide',
            href: '/grimoire/astronomy/retrogrades',
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
