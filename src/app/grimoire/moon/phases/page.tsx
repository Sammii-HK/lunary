import { Metadata } from 'next';
import Link from 'next/link';
import { MoonPhaseIcon } from '@/components/MoonPhaseIcon';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import {
  monthlyMoonPhases,
  MonthlyMoonPhaseKey,
} from '../../../../../utils/moon/monthlyPhases';
import { stringToKebabCase } from '../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Moon Phases: Complete 8-Phase Lunar Cycle Guide | Lunary',
  description:
    'Complete guide to all 8 moon phases and their meanings. Learn the energy, rituals, and magic of New Moon, Waxing, Full Moon, and Waning phases.',
  keywords: [
    'moon phases',
    'lunar cycle',
    'new moon',
    'full moon',
    'waxing moon',
    'waning moon',
    'moon magic',
    'lunar rituals',
  ],
  openGraph: {
    title: 'Moon Phases Guide: All 8 Lunar Phases | Lunary',
    description:
      'Complete guide to all 8 moon phases and their spiritual meanings.',
    url: 'https://lunary.app/grimoire/moon/phases',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/moon',
        width: 1200,
        height: 630,
        alt: 'Moon Phases Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moon Phases Guide | Lunary',
    description: 'Complete guide to lunar cycles and moon magic.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon/phases',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqs = [
  {
    question: 'How many moon phases are there?',
    answer:
      'There are 8 distinct moon phases in a complete lunar cycle: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, and Waning Crescent. The entire cycle takes approximately 29.5 days.',
  },
  {
    question: 'What is the best moon phase for manifesting?',
    answer:
      'The waxing phases (Waxing Crescent through Waxing Gibbous) are best for manifesting and attraction. Set intentions at the New Moon, build energy during Waxing Crescent, take action at First Quarter, and amplify your work during Waxing Gibbous. The Full Moon is peak manifestation energy.',
  },
  {
    question: 'What moon phase is best for releasing?',
    answer:
      'The waning phases (Waning Gibbous through Waning Crescent) are ideal for release work. Begin releasing at Waning Gibbous, take decisive action at Last Quarter, and complete the release during Waning Crescent before the next New Moon.',
  },
  {
    question: 'How does the moon phase affect spells?',
    answer:
      'Moon phases amplify different types of magic. Waxing moons enhance growth, attraction, and building spells. Full moons boost all magic, especially divination and psychic work. Waning moons strengthen banishing, protection, and release spells. New moons support new beginnings and shadow work.',
  },
  {
    question: 'How long does each moon phase last?',
    answer:
      'Each of the 8 moon phases lasts approximately 3-4 days, though the exact timing varies. The New Moon and Full Moon are technically single moments when the moon is exactly new or full, but their energy is felt for about 3 days before and after.',
  },
];

const phaseDisplayNames: Record<string, string> = {
  newMoon: 'New Moon',
  waxingCrescent: 'Waxing Crescent',
  firstQuarter: 'First Quarter',
  waxingGibbous: 'Waxing Gibbous',
  fullMoon: 'Full Moon',
  waningGibbous: 'Waning Gibbous',
  lastQuarter: 'Last Quarter',
  waningCrescent: 'Waning Crescent',
};

export default function MoonPhasesIndexPage() {
  const phases = Object.entries(monthlyMoonPhases);

  const moonPhasesListSchema = createItemListSchema({
    name: 'Moon Phases',
    description:
      'Complete guide to all 8 moon phases and their meanings for rituals, magic, and spiritual practice.',
    url: 'https://lunary.app/grimoire/moon/phases',
    items: phases.map(([key, phase]) => ({
      name: phaseDisplayNames[key],
      url: `https://lunary.app/grimoire/moon/phases/${stringToKebabCase(key)}`,
      description: phase.information,
    })),
  });

  return (
    <>
      {renderJsonLd(moonPhasesListSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Moon Phases | Lunary'
          h1='Moon Phases: Complete Lunar Cycle Guide'
          description='The moon cycles through 8 distinct phases every 29.5 days. Each phase carries unique energy for rituals, intentions, and magical work.'
          keywords={[
            'moon phases',
            'lunar cycle',
            'moon magic',
            'lunar rituals',
          ]}
          canonicalUrl='https://lunary.app/grimoire/moon/phases'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Moon', href: '/grimoire/moon' },
            { label: 'Moon Phases', href: '/grimoire/moon/phases' },
          ]}
          whatIs={{
            question: 'What are Moon Phases?',
            answer:
              'Moon phases are the different appearances of the moon as seen from Earth during its 29.5-day orbital cycle. As the moon orbits Earth, the angle between the Sun, Earth, and Moon changes, creating 8 distinct phases from New Moon to Full Moon and back. Each phase carries unique energetic qualities that practitioners use to time their magical and spiritual work.',
          }}
          tldr='New Moon: new beginnings. Waxing phases: growth and building. Full Moon: peak energy and manifestation. Waning phases: release and banishing. Work with the lunar cycle to align your magic with cosmic rhythms.'
          meaning={`The lunar cycle has been observed and utilized by humans for thousands of years. Every 29.5-day orbit brings eight distinct phases—New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, and Waning Crescent—each carrying its own tone for intention, action, celebration, release, and rest.

As the moon waxes, lean into building, attracting, and grateful manifestation work. As it wanes, focus on releasing, clearing, and resting. These cards and the sections below help you map the lunar rhythm and plan rituals, spells, and self-care in sync with each moment of the cycle.`}
          howToWorkWith={[
            'Track the current moon phase using a lunar calendar or app',
            'Set intentions at the New Moon for what you want to manifest',
            'Build energy and take action during the waxing phases',
            'Celebrate, charge tools, and do powerful magic at the Full Moon',
            'Release, banish, and rest during the waning phases',
          ]}
          tables={[
            {
              title: 'Moon Phase Energy Guide',
              headers: ['Phase', 'Energy', 'Best For', 'Avoid'],
              rows: [
                [
                  'New Moon',
                  'Beginning',
                  'Intentions, rest',
                  'Major decisions',
                ],
                ['Waxing', 'Building', 'Attraction, growth', 'Releasing'],
                ['Full Moon', 'Peak', 'Manifestation, divination', 'Nothing!'],
                ['Waning', 'Releasing', 'Banishing, clearing', 'Starting new'],
              ],
            },
          ]}
          relatedItems={[
            {
              name: 'Full Moon Names',
              href: '/grimoire/moon/full-moons',
              type: 'Moon',
            },
            {
              name: 'Moon in Signs',
              href: '/grimoire/moon-in',
              type: 'Astrology',
            },
            {
              name: 'Moon Rituals',
              href: '/grimoire/moon/rituals',
              type: 'Practice',
            },
            {
              name: 'Moon Overview',
              href: '/grimoire/moon',
              type: 'Guide',
            },
          ]}
          internalLinks={[
            { text: 'Full Moon Calendar', href: '/moon' },
            { text: 'Current Moon Phase', href: '/moon' },
            { text: 'Moon in Zodiac Signs', href: '/grimoire/moon-in' },
            { text: 'Moon Rituals', href: '/grimoire/moon/rituals' },
          ]}
          ctaText='Want personalized moon phase insights for your chart?'
          ctaHref='/pricing'
          faqs={faqs}
        >
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              All 8 Moon Phases
            </h2>
            <p className='text-zinc-400 mb-6'>
              Click on any phase to explore its energy, rituals, and magical
              applications in depth.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {phases.map(([key, phase]) => (
                <Link
                  key={key}
                  href={`/grimoire/moon/phases/${stringToKebabCase(key)}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all'
                >
                  <div className='flex items-center gap-4 mb-3'>
                    <div className='w-16 h-16 rounded-2xl bg-zinc-950/60 flex items-center justify-center'>
                      <MoonPhaseIcon
                        phase={key as MonthlyMoonPhaseKey}
                        size={44}
                      />
                    </div>
                    <h3 className='text-lg font-medium text-zinc-100 group-hover:text-zinc-200 transition-colors'>
                      {phaseDisplayNames[key]}
                    </h3>
                  </div>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {phase.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className='text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded'
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className='text-sm text-zinc-400 line-clamp-2'>
                    {phase.information}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h2 className='text-xl font-medium text-zinc-100 mb-4'>
              Quick Reference: Lunar Timing
            </h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-medium text-zinc-200 mb-2'>
                  Waxing Moon Magic:
                </h3>
                <ul className='space-y-1 text-sm text-zinc-400'>
                  <li>• Attraction and drawing spells</li>
                  <li>• Abundance and prosperity work</li>
                  <li>• Love and relationship magic</li>
                  <li>• Career and success rituals</li>
                  <li>• Healing and strengthening</li>
                </ul>
              </div>
              <div>
                <h3 className='font-medium text-zinc-200 mb-2'>
                  Waning Moon Magic:
                </h3>
                <ul className='space-y-1 text-sm text-zinc-400'>
                  <li>• Banishing and protection</li>
                  <li>• Breaking bad habits</li>
                  <li>• Releasing negative energy</li>
                  <li>• Cord cutting rituals</li>
                  <li>• Cleansing and clearing</li>
                </ul>
              </div>
            </div>
          </section>
        </SEOContentTemplate>
      </div>
    </>
  );
}
