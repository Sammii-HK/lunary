import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Flame, Droplets, Wind, Mountain } from 'lucide-react';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Four Elements: Fire, Water, Air, Earth Correspondences | Lunary',
  description:
    'Complete guide to the four classical elements in magic. Learn Fire, Water, Air, and Earth correspondences including colors, crystals, herbs, and zodiac signs.',
  keywords: [
    'four elements',
    'elemental correspondences',
    'fire element magic',
    'water element magic',
    'air element magic',
    'earth element magic',
    'elemental magic',
    'classical elements',
  ],
  openGraph: {
    title: 'Four Elements Correspondences | Lunary',
    description:
      'Complete guide to Fire, Water, Air, and Earth elemental correspondences.',
    url: 'https://lunary.app/grimoire/correspondences/elements',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Four Elements Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Four Elements Correspondences | Lunary',
    description: 'Complete guide to elemental magic and correspondences.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/elements',
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
    question: 'What are the four classical elements?',
    answer:
      'The four classical elements are Fire, Water, Air, and Earth. These form the foundation of Western magical practice, dating back to ancient Greece. Each element represents different qualities, energies, and correspondences used in spellwork, ritual, and understanding the natural world.',
  },
  {
    question: 'How do the elements relate to zodiac signs?',
    answer:
      'Each zodiac sign belongs to one of the four elements: Fire signs (Aries, Leo, Sagittarius), Earth signs (Taurus, Virgo, Capricorn), Air signs (Gemini, Libra, Aquarius), and Water signs (Cancer, Scorpio, Pisces). This elemental quality influences the signs personality traits and energies.',
  },
  {
    question: 'How do I work with elemental magic?',
    answer:
      'To work with elemental magic, identify which element aligns with your intention. Use Fire for passion and transformation, Water for emotions and intuition, Air for communication and intellect, Earth for stability and abundance. Incorporate elemental correspondences like colors, herbs, and tools into your practice.',
  },
  {
    question: 'What element am I based on my zodiac sign?',
    answer:
      'Your Sun sign determines your primary element. Fire: Aries, Leo, Sagittarius. Earth: Taurus, Virgo, Capricorn. Air: Gemini, Libra, Aquarius. Water: Cancer, Scorpio, Pisces. However, your full birth chart contains all elements in varying degrees.',
  },
  {
    question: 'What is the fifth element?',
    answer:
      'The fifth element, called Spirit, Aether, or Akasha, represents the transcendent element that unites all four classical elements. It symbolizes the divine, consciousness, and the quintessence of life. In magical practice, Spirit is often invoked to bind and harmonize the other elements.',
  },
];

const elementColors: Record<string, string> = {
  Fire: 'text-orange-400 border-orange-700/50 hover:border-orange-500',
  Water: 'text-blue-400 border-blue-700/50 hover:border-blue-500',
  Air: 'text-cyan-400 border-cyan-700/50 hover:border-cyan-500',
  Earth: 'text-emerald-400 border-emerald-700/50 hover:border-emerald-500',
};

const elementIcons: Record<string, React.ReactNode> = {
  Fire: <Flame className='w-8 h-8 text-orange-400' />,
  Water: <Droplets className='w-8 h-8 text-blue-400' />,
  Air: <Wind className='w-8 h-8 text-cyan-400' />,
  Earth: <Mountain className='w-8 h-8 text-emerald-400' />,
};

export default function ElementsIndexPage() {
  const classicalElementKeys = ['Fire', 'Water', 'Air', 'Earth'] as const;
  type ClassicalElementKey = (typeof classicalElementKeys)[number];
  const elements = classicalElementKeys
    .map((key) => [key, correspondencesData.elements[key]] as const)
    .filter(
      (
        entry,
      ): entry is readonly [
        ClassicalElementKey,
        NonNullable<(typeof correspondencesData.elements)[ClassicalElementKey]>,
      ] => Boolean(entry[1]),
    );

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Elements | Lunary'
        h1='The Four Elements: Fire, Water, Air, Earth'
        description='The four classical elements form the foundation of magical practice and understanding the natural world. Each carries unique energies and correspondences.'
        keywords={[
          'four elements',
          'elemental magic',
          'fire water air earth',
          'correspondences',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/elements'
        whatIs={{
          question: 'What are the Four Elements?',
          answer:
            'The four classical elements — Fire, Water, Air, and Earth — are the foundational building blocks of Western magical tradition. Dating back to ancient Greece, these elements represent different states of matter, qualities of energy, and aspects of existence. In magical practice, understanding elemental correspondences allows practitioners to align their intentions with natural forces.',
        }}
        tldr='Fire represents passion and transformation, Water embodies emotions and intuition, Air governs communication and intellect, Earth provides stability and abundance. Each element has associated colors, directions, seasons, zodiac signs, and magical applications.'
        meaning={`The four elements have been central to magical and philosophical thought for millennia. From Empedocles in ancient Greece to modern Wiccan practice, these elements provide a framework for understanding the universe and our place in it.

**The Elements and Their Qualities:**

**Fire (South, Summer, Aries/Leo/Sagittarius)**
Fire is the element of passion, will, courage, and transformation. It's associated with candle magic, passion spells, and purification. Fire energy is masculine, active, and projective.

**Water (West, Autumn, Cancer/Scorpio/Pisces)**
Water governs emotions, intuition, healing, and the subconscious. It's used in divination, emotional healing, and psychic work. Water energy is feminine, receptive, and flowing.

**Air (East, Spring, Gemini/Libra/Aquarius)**
Air rules communication, intellect, travel, and new beginnings. It's associated with incense, spoken spells, and mental magic. Air energy is masculine, active, and changeable.

**Earth (North, Winter, Taurus/Virgo/Capricorn)**
Earth embodies stability, abundance, fertility, and grounding. It's used in prosperity magic, grounding rituals, and physical healing. Earth energy is feminine, receptive, and stable.

**Working with Elements:**

To incorporate elements into your practice, consider:
- Your intention and which element aligns with it
- Seasonal and lunar timing
- Elemental tools (athame/wand for fire, chalice for water, etc.)
- Colors, herbs, and crystals associated with each element`}
        howToWorkWith={[
          'Identify which element aligns with your magical intention',
          'Face the elemental direction when casting or invoking',
          'Use corresponding colors, herbs, and tools',
          'Work during the associated season for strongest energy',
          'Balance all four elements in your sacred space',
        ]}
        tables={[
          {
            title: 'Elemental Correspondences Overview',
            headers: [
              'Element',
              'Direction',
              'Season',
              'Zodiac Signs',
              'Quality',
            ],
            rows: [
              [
                'Fire',
                'South',
                'Summer',
                'Aries, Leo, Sagittarius',
                'Hot & Dry',
              ],
              [
                'Water',
                'West',
                'Autumn',
                'Cancer, Scorpio, Pisces',
                'Cold & Wet',
              ],
              ['Air', 'East', 'Spring', 'Gemini, Libra, Aquarius', 'Hot & Wet'],
              [
                'Earth',
                'North',
                'Winter',
                'Taurus, Virgo, Capricorn',
                'Cold & Dry',
              ],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Colors',
            href: '/grimoire/correspondences/colors',
            type: 'Correspondences',
          },
          {
            name: 'Herbs',
            href: '/grimoire/correspondences/herbs',
            type: 'Correspondences',
          },
          {
            name: 'Crystals',
            href: '/grimoire/crystals',
            type: 'Guide',
          },
          {
            name: 'Zodiac Signs',
            href: '/grimoire/zodiac',
            type: 'Astrology',
          },
          {
            name: 'All Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Sabbats', href: '/grimoire/wheel-of-the-year' },
        ]}
        ctaText='Want personalized elemental insights based on your birth chart?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Explore Each Element
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {elements.map(([name, data]) => (
              <Link
                key={name}
                href={`/grimoire/correspondences/elements/${stringToKebabCase(name)}`}
                className={`group rounded-xl border bg-zinc-900/30 p-6 hover:bg-zinc-900/50 transition-all ${elementColors[name]}`}
              >
                <div className='flex items-center gap-4 mb-4'>
                  {elementIcons[name]}
                  <h3
                    className={`text-2xl font-medium ${elementColors[name].split(' ')[0]}`}
                  >
                    {name}
                  </h3>
                </div>
                <div className='space-y-2 text-sm text-zinc-400'>
                  <p>
                    <span className='text-zinc-400'>Direction:</span>{' '}
                    {data.directions}
                  </p>
                  <p>
                    <span className='text-zinc-400'>Season:</span>{' '}
                    {data.seasons}
                  </p>
                  <p>
                    <span className='text-zinc-400'>Zodiac:</span>{' '}
                    {data.zodiacSigns.join(', ')}
                  </p>
                  <p>
                    <span className='text-zinc-400'>Colors:</span>{' '}
                    {data.colors.slice(0, 3).join(', ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12 bg-gradient-to-r from-orange-900/20 via-blue-900/20 to-emerald-900/20 border border-zinc-700 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Elemental Magic
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-orange-400 font-medium'>Fire Magic:</p>
              <p className='text-zinc-400'>
                Candles, passion, transformation, courage, willpower
              </p>
            </div>
            <div>
              <p className='text-blue-400 font-medium'>Water Magic:</p>
              <p className='text-zinc-400'>
                Bowls, emotions, intuition, healing, purification
              </p>
            </div>
            <div>
              <p className='text-cyan-400 font-medium'>Air Magic:</p>
              <p className='text-zinc-400'>
                Incense, communication, intellect, travel, new beginnings
              </p>
            </div>
            <div>
              <p className='text-emerald-400 font-medium'>Earth Magic:</p>
              <p className='text-zinc-400'>
                Crystals, abundance, stability, grounding, fertility
              </p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
