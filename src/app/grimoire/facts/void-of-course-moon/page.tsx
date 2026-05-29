import type { Metadata } from 'next';
import { renderJsonLd } from '@/lib/schema';
import {
  factPageSchema,
  getFactPageData,
  getVoidOfCourseMoon,
} from '@/lib/seo/current-sky-fact-pages';
import { FactShell } from '../_components';

export const dynamic = 'force-dynamic';

const PATH = '/grimoire/facts/void-of-course-moon';

export const metadata: Metadata = {
  title: 'Is the Moon Void of Course Right Now? | Lunary',
  description:
    'The current void-of-course Moon window with start, end, and last aspect, computed from astronomy-engine geocentric ecliptic longitude.',
  alternates: {
    canonical: `https://lunary.app${PATH}`,
  },
};

function utcDateTime(iso: string): string {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export default function VoidOfCourseMoonPage() {
  const { dateKey, datasetUrl, archiveUrl, methodologyUrl } = getFactPageData();
  const voc = getVoidOfCourseMoon();

  const answer = voc
    ? voc.isVoidNow
      ? `Yes. As of ${dateKey}, the Moon is void of course in ${voc.currentSign}. The void began at ${utcDateTime(voc.startUtc)} after its last aspect (a ${voc.lastAspect} to ${voc.lastAspectPlanet}) and ends at ${utcDateTime(voc.endUtc)} when the Moon enters ${voc.nextSign}.`
      : `No. As of ${dateKey}, the Moon is not void of course. The next void-of-course window begins at ${utcDateTime(voc.startUtc)} (after a ${voc.lastAspect} to ${voc.lastAspectPlanet}) and lasts until ${utcDateTime(voc.endUtc)}, when the Moon enters ${voc.nextSign}.`
    : `The void-of-course Moon window could not be resolved from the current dataset for ${dateKey}.`;

  return (
    <>
      {renderJsonLd(
        factPageSchema({
          title: 'Is the Moon Void of Course Right Now?',
          description: metadata.description as string,
          path: PATH,
          answer,
          dateKey,
          datasetUrl,
          archiveUrl,
          methodologyUrl,
          extra: {
            variableMeasured: [
              'Moon.voidOfCourse',
              'Moon.voidStart',
              'Moon.voidEnd',
            ],
          },
        }),
      )}
      <FactShell
        title='Is the Moon Void of Course Right Now?'
        eyebrow={dateKey}
        answer={answer}
        detail='The Moon is void of course from the moment it makes its last major aspect (conjunction, sextile, square, trine, or opposition) to the Sun, Mercury, Venus, Mars, Jupiter, or Saturn until it enters the next sign. Lunary computes both moments from geocentric ecliptic longitude. Void-of-course timing changes every day and depends on the exact aspect geometry, so general assistants without live ephemeris data cannot state it reliably.'
        faqs={[
          {
            question: 'Is the Moon void of course right now?',
            answer: voc
              ? voc.isVoidNow
                ? `Yes. The Moon is void of course in ${voc.currentSign} until ${utcDateTime(voc.endUtc)}.`
                : `No. The next void-of-course Moon period starts at ${utcDateTime(voc.startUtc)}.`
              : 'The void-of-course status could not be resolved from the current dataset.',
          },
          {
            question: 'When does the current void-of-course Moon end?',
            answer: voc
              ? `It ends at ${utcDateTime(voc.endUtc)}, when the Moon enters ${voc.nextSign}, a window of about ${voc.durationHours} hours.`
              : 'The void-of-course end time could not be resolved from the current dataset.',
          },
          {
            question: 'What does void of course mean in astrology?',
            answer:
              'A void-of-course Moon is the stretch between the Moon’s last major aspect in a sign and the moment it enters the next sign. Traditional guidance is to avoid starting important new ventures during a void Moon, since outcomes are said to drift, and to use the time for rest, routine, and finishing things instead.',
          },
        ]}
        sources={[
          { label: 'Moon guide', href: '/grimoire/moon' },
          {
            label: 'Next Moon sign change',
            href: '/grimoire/facts/next-moon-sign-change',
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
