import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { zodiacSigns, zodiacUnicode } from '../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../utils/string';

export const metadata: Metadata = {
  title: 'Moon in Signs: Complete Lunar Zodiac Guide | Lunary',
  description:
    'Complete guide to the Moon in each zodiac sign. Learn how Moon in Aries through Pisces affects emotions, intuition, and daily energy.',
  keywords: [
    'moon in signs',
    'moon zodiac',
    'lunar astrology',
    'moon in aries',
    'moon in taurus',
    'moon placements',
    'transiting moon',
    'natal moon',
  ],
  openGraph: {
    title: 'Moon in Signs: Lunar Zodiac Guide | Lunary',
    description:
      'Complete guide to the Moon in each zodiac sign and their emotional meanings.',
    url: 'https://lunary.app/grimoire/moon-in',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/moon',
        width: 1200,
        height: 630,
        alt: 'Moon in Signs Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moon in Signs Guide | Lunary',
    description: 'Complete guide to lunar zodiac placements.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon-in',
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
    question: 'How long does the Moon stay in each sign?',
    answer:
      'The Moon stays in each zodiac sign for approximately 2-3 days (about 2.5 days on average). This means the Moon moves through all 12 signs in about 28 days, creating a monthly emotional cycle.',
  },
  {
    question: "What's the difference between transiting Moon and natal Moon?",
    answer:
      "Your natal Moon sign is where the Moon was when you were born — it's permanent and reveals your emotional nature. The transiting Moon is where the Moon is currently in the sky, affecting everyone's daily mood and energy.",
  },
  {
    question: 'How does the Moon sign affect my emotions?',
    answer:
      'The Moon sign colors emotional energy for everyone during those 2-3 days. Fire sign Moons bring passion and impulsivity, Earth Moons offer stability, Air Moons enhance communication, and Water Moons deepen intuition and sensitivity.',
  },
  {
    question: 'What is the best Moon sign for magic?',
    answer:
      'It depends on your magical intent. Aries Moon for courage spells, Taurus for abundance, Gemini for communication, Cancer for home/family, Leo for confidence, Virgo for healing, Libra for love, Scorpio for transformation, Sagittarius for travel, Capricorn for career, Aquarius for innovation, Pisces for psychic work.',
  },
  {
    question: 'Should I avoid certain Moon signs?',
    answer:
      'The Void of Course Moon (when the Moon makes no more aspects before changing signs) is traditionally avoided for starting new ventures. Some avoid Scorpio Moon for light-hearted activities or Capricorn Moon for emotional processing. However, every sign has valuable uses.',
  },
];

export default function MoonInSignsIndexPage() {
  const signs = Object.entries(zodiacSigns);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Moon in Signs | Lunary'
        h1='Moon in Signs: Lunar Zodiac Guide'
        description='The Moon changes signs every 2-3 days, coloring our emotional landscape and influencing intuition, mood, and daily energy.'
        keywords={[
          'moon in signs',
          'moon zodiac',
          'lunar astrology',
          'moon placements',
        ]}
        canonicalUrl='https://lunary.app/grimoire/moon-in'
        whatIs={{
          question: 'What does Moon in Signs mean?',
          answer:
            'Moon in Signs refers to the zodiac sign the Moon occupies at any given time. The transiting Moon moves through all 12 signs approximately every 28 days, spending about 2-3 days in each sign. This lunar position influences collective mood, emotional energy, and the best types of activities and magic for those days.',
        }}
        tldr='The Moon changes signs every 2-3 days. Fire Moons (Aries, Leo, Sag) bring energy and action. Earth Moons (Taurus, Virgo, Cap) offer stability. Air Moons (Gemini, Libra, Aqua) enhance communication. Water Moons (Cancer, Scorpio, Pisces) deepen emotions.'
        meaning={`Understanding the Moon's sign helps you work with daily emotional tides and time your activities for best results.

**Transit Moon vs. Natal Moon:**

**Transit Moon**: Where the Moon is right now, affecting everyone
**Natal Moon**: Where the Moon was when you were born, your emotional nature

Both are important. Your natal Moon sign is your emotional baseline. The transit Moon affects everyone's daily energy.

**Moon by Element:**

**Fire Moons (Aries, Leo, Sagittarius)**
Energy: Active, passionate, impulsive
Best for: Starting projects, courage, confidence, physical activity
Mood: Enthusiastic but potentially short-tempered

**Earth Moons (Taurus, Virgo, Capricorn)**
Energy: Stable, practical, grounded
Best for: Financial matters, planning, health, practical magic
Mood: Calm but potentially stubborn

**Air Moons (Gemini, Libra, Aquarius)**
Energy: Communicative, social, intellectual
Best for: Communication, networking, learning, mental work
Mood: Curious but potentially scattered

**Water Moons (Cancer, Scorpio, Pisces)**
Energy: Emotional, intuitive, receptive
Best for: Emotional healing, psychic work, creativity, divination
Mood: Sensitive but potentially moody

**Timing Magic by Moon Sign:**

Each sign has optimal magical uses. Check the current Moon sign before important spellwork and align your intentions with the lunar energy.`}
        howToWorkWith={[
          'Track the current Moon sign using a lunar calendar',
          'Plan activities that match the Moon elemental energy',
          'Time spells and rituals for compatible Moon signs',
          'Rest more during Water Moon days if you feel sensitive',
          'Take action during Fire Moon days for momentum',
        ]}
        tables={[
          {
            title: 'Moon Signs Quick Reference',
            headers: ['Sign', 'Element', 'Energy', 'Best For'],
            rows: [
              ['Aries', 'Fire', 'Action', 'New beginnings, courage'],
              ['Taurus', 'Earth', 'Stability', 'Money, comfort'],
              ['Gemini', 'Air', 'Mental', 'Communication, learning'],
              ['Cancer', 'Water', 'Nurturing', 'Home, family, emotions'],
              ['Leo', 'Fire', 'Creative', 'Confidence, creativity'],
              ['Virgo', 'Earth', 'Practical', 'Health, organization'],
              ['Libra', 'Air', 'Harmonious', 'Relationships, beauty'],
              ['Scorpio', 'Water', 'Intense', 'Transformation, secrets'],
              ['Sagittarius', 'Fire', 'Expansive', 'Travel, learning'],
              ['Capricorn', 'Earth', 'Ambitious', 'Career, goals'],
              ['Aquarius', 'Air', 'Innovative', 'Community, change'],
              ['Pisces', 'Water', 'Mystical', 'Spirituality, dreams'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'Moon',
          },
          {
            name: 'Zodiac Signs',
            href: '/grimoire/zodiac',
            type: 'Astrology',
          },
          {
            name: 'Full Moon Names',
            href: '/grimoire/moon/full-moons',
            type: 'Moon',
          },
          {
            name: 'Moon Overview',
            href: '/grimoire/moon',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Current Moon Sign', href: '/moon' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Birth Chart', href: '/birth-chart' },
        ]}
        ctaText='Want personalized Moon sign insights?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Moon in All 12 Signs
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any sign to explore how the Moon expresses through that
            zodiac energy.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {signs.map(([key, sign]) => (
              <Link
                key={key}
                href={`/grimoire/moon-in/${stringToKebabCase(key)}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-2xl'>
                    {zodiacUnicode[key as keyof typeof zodiacUnicode]}
                  </span>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-zinc-200 transition-colors'>
                    Moon in {sign.name}
                  </h3>
                </div>
                <p className='text-sm text-zinc-400'>{sign.element} sign</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Moon Sign Magic
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-red-400 font-medium'>Fire Moon Magic:</p>
              <p className='text-zinc-400'>
                Courage, new beginnings, passion, protection, success
              </p>
            </div>
            <div>
              <p className='text-emerald-400 font-medium'>Earth Moon Magic:</p>
              <p className='text-zinc-400'>
                Money, abundance, health, grounding, stability
              </p>
            </div>
            <div>
              <p className='text-cyan-400 font-medium'>Air Moon Magic:</p>
              <p className='text-zinc-400'>
                Communication, travel, learning, legal matters, clarity
              </p>
            </div>
            <div>
              <p className='text-blue-400 font-medium'>Water Moon Magic:</p>
              <p className='text-zinc-400'>
                Emotions, psychic work, healing, love, divination
              </p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
