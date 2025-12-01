export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Moon from '../components/Moon';

export const metadata: Metadata = {
  title: 'Moon Phases & Lunar Wisdom: Complete Guide - Lunary',
  description:
    "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life. Discover moon rituals, moon signs, eclipses, and how to work with lunar energy for manifestation and spiritual growth.",
  keywords: [
    'moon phases',
    'lunar cycles',
    'full moon',
    'new moon',
    'moon signs',
    'lunar calendar',
    'moon magic',
    'moon rituals',
    'lunar eclipse',
    'moon in signs',
  ],
  openGraph: {
    title: 'Moon Phases & Lunar Wisdom: Complete Guide - Lunary',
    description:
      "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Moon Phases & Lunar Wisdom: Complete Guide - Lunary',
    description:
      "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon',
  },
};

export default function MoonPage() {
  return (
    <>
      <SEOContentTemplate
        title='Moon Phases & Lunar Wisdom: Complete Guide - Lunary'
        h1='Moon Phases & Lunar Wisdom'
        description="Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life. Discover moon rituals, moon signs, and how to work with lunar energy."
        keywords={[
          'moon phases',
          'lunar cycles',
          'full moon',
          'new moon',
          'moon signs',
          'lunar calendar',
          'moon magic',
          'moon rituals',
        ]}
        canonicalUrl='https://lunary.app/grimoire/moon'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon Phases', href: '/grimoire/moon' },
        ]}
        intro="The moon has been a source of wonder, magic, and guidance for millennia. Its cycles influence tides, emotions, and magical work. Understanding moon phases, full moon names, and lunar correspondences helps you align your practice with natural rhythms and harness the moon's powerful energy. This comprehensive guide covers all aspects of lunar magic, from basic moon phases to advanced moon sign work and eclipse magic."
        meaning="The moon represents the feminine principle, intuition, emotions, and the subconscious. Its 29.5-day cycle through phases mirrors natural cycles of growth, release, and renewal. Each phase carries unique energy that can enhance different types of magical work.

New Moon: Time for new beginnings, setting intentions, and planting seeds for the future. The dark moon offers a blank slate for manifestation.

Waxing Moon: Growing energy supports attraction, building, and increasing. Use for spells that bring things toward you.

Full Moon: Peak power for manifestation, release, and celebration. The moon's energy is at its strongest, amplifying all magical work.

Waning Moon: Decreasing energy supports banishing, releasing, and letting go. Use for removing obstacles and releasing what no longer serves.

Understanding these phases and aligning your practice with them creates powerful synchronicity between your intentions and natural rhythms."
        howToWorkWith={[
          'Track moon phases using a lunar calendar',
          'Set intentions during New Moon',
          'Perform manifestation spells during Waxing Moon',
          'Release and banish during Waning Moon',
          'Celebrate and charge tools during Full Moon',
          'Work with moon signs for daily guidance',
          'Use full moon names for seasonal magic',
          'Honor eclipses as powerful transformation times',
        ]}
        faqs={[
          {
            question: 'What moon phase is best for love spells?',
            answer:
              'Waxing Moon (especially approaching Full Moon) is ideal for love spells, as it supports attraction and growth. New Moon works for new relationships, while Full Moon amplifies all love magic.',
          },
          {
            question: 'How do moon signs affect daily life?',
            answer:
              'The moon changes signs every 2-3 days, influencing emotional energy and moods. Moon in Fire signs (Aries, Leo, Sagittarius) brings action and passion. Moon in Water signs (Cancer, Scorpio, Pisces) enhances emotions and intuition.',
          },
          {
            question: 'What should I do during a Full Moon?',
            answer:
              'Full Moons are powerful for charging tools, performing manifestation rituals, releasing what no longer serves, and celebrating your growth. Many practitioners charge crystals, make moon water, and perform gratitude rituals.',
          },
        ]}
        internalLinks={[
          { text: 'Moon Rituals', href: '/grimoire/moon-rituals' },
          { text: 'Moon Signs', href: '/grimoire/moon-signs' },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Moon />
      </div>
    </>
  );
}
