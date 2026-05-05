import { Metadata } from 'next';
import Link from 'next/link';
import { zodiacSigns, zodiacSymbol } from '../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../utils/string';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'All 12 Zodiac Signs: Dates, Traits & Compatibility - Lunary',
  description:
    "Explore all 12 zodiac signs. Learn about each sign's traits, elements, ruling planets, and compatibility. Comprehensive astrology guide.",
  keywords: [
    'zodiac signs',
    'astrology signs',
    'zodiac meanings',
    'zodiac compatibility',
    'zodiac elements',
    'zodiac traits',
  ],
  openGraph: {
    title: 'All 12 Zodiac Signs: Dates, Traits & Compatibility - Lunary',
    description:
      'Explore all 12 zodiac signs and their unique characteristics.',
    url: 'https://lunary.app/grimoire/zodiac',
    images: [
      {
        url: '/api/og/grimoire/zodiac',
        width: 1200,
        height: 630,
        alt: 'All 12 Zodiac Signs - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 12 Zodiac Signs: Dates, Traits & Compatibility - Lunary',
    description:
      'Explore all 12 zodiac signs. Learn about each sign\u2019s traits, elements, ruling planets, and compatibility.',
    images: ['/api/og/grimoire/zodiac'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/zodiac',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ZodiacIndexPage() {
  const signs = Object.entries(zodiacSigns);

  const zodiacListSchema = createItemListSchema({
    name: 'The 12 Zodiac Signs',
    description:
      'Complete guide to all 12 zodiac signs with traits, elements, modalities, and ruling planets.',
    url: 'https://lunary.app/grimoire/zodiac',
    items: signs.map(([key, sign]) => ({
      name: sign.name,
      url: `https://lunary.app/grimoire/zodiac/${stringToKebabCase(key)}`,
      description: `${sign.name} (${sign.dates}) - ${sign.element} sign`,
    })),
  });

  return (
    <>
      {renderJsonLd(zodiacListSchema)}
      <SEOContentTemplate
        title='All 12 Zodiac Signs: Dates, Traits & Compatibility'
        h1='The 12 Zodiac Signs'
        description='Explore the unique traits, elements, and ruling planets of each zodiac sign.'
        keywords={[
          'zodiac signs',
          'astrology signs',
          'zodiac meanings',
          'zodiac elements',
          'zodiac modalities',
        ]}
        canonicalUrl='https://lunary.app/grimoire/zodiac'
        whatIs={{
          question: 'What are the 12 zodiac signs?',
          answer:
            'The 12 zodiac signs are Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces. Each sign occupies 30 degrees of the celestial ecliptic and is associated with specific personality traits, an element (Fire, Earth, Air, Water), a modality (Cardinal, Fixed, Mutable), and a ruling planet.',
        }}
        tldr='The zodiac has 12 signs divided by elements (Fire, Earth, Air, Water) and modalities (Cardinal, Fixed, Mutable). Each sign has unique traits, a ruling planet, and represents different life themes. Your Sun sign is determined by your birth date.'
        intro='The zodiac is divided into 12 signs, each with unique personality traits, strengths, and challenges. Signs are grouped by element (Fire, Earth, Air, Water) which describes their core nature, and modality (Cardinal, Fixed, Mutable) which describes how they express energy. Understanding your Sun sign is just the beginning — your full birth chart reveals how all 12 signs influence different areas of your life.'
        meaning='The zodiac signs are not twelve personality boxes. They are twelve styles of expression. In real chart reading, the sign tells you how a planet behaves, not what the whole person is. That is why the same sign can feel different when it appears as a Sun sign, Moon sign, Rising sign, chart ruler, or house cusp.

Elements describe the basic temperament of a sign: Fire acts, Earth stabilizes, Air thinks, and Water feels. Modalities describe how the sign moves: Cardinal initiates, Fixed sustains, and Mutable adapts. Once you understand those two layers, the signs stop being random trait lists and start becoming a usable interpretation framework.

Lunary uses the zodiac as one layer in a bigger method: planet first, sign second, house third, aspect fourth. That order is what turns astrology from generic sign content into actual chart reading.'
        howToWorkWith={[
          'Start with the sign as a style of expression, not the entire reading.',
          'Pair every sign with the planet occupying it or ruling it.',
          'Use element and modality first before reaching for generic sign stereotypes.',
          'Check decans and house placement when you need more precision.',
          'Compare Sun, Moon, and Rising versions of the same sign to understand how context changes meaning.',
        ]}
        faqs={[
          {
            question: 'What are the four elements in astrology?',
            answer:
              'Fire signs (Aries, Leo, Sagittarius) are passionate and energetic. Earth signs (Taurus, Virgo, Capricorn) are practical and grounded. Air signs (Gemini, Libra, Aquarius) are intellectual and communicative. Water signs (Cancer, Scorpio, Pisces) are emotional and intuitive.',
          },
          {
            question: 'What are the three modalities?',
            answer:
              'Cardinal signs (Aries, Cancer, Libra, Capricorn) initiate and lead. Fixed signs (Taurus, Leo, Scorpio, Aquarius) are stable and persistent. Mutable signs (Gemini, Virgo, Sagittarius, Pisces) are adaptable and flexible.',
          },
          {
            question: 'How do I find my zodiac sign?',
            answer:
              'Your Sun sign is determined by your birth date. The Sun moves through each zodiac sign for about 30 days. For the most accurate sign placement, especially if born on a cusp, calculate your full birth chart with your exact birth time.',
          },
        ]}
        relatedItems={[
          { name: 'Birth Chart', href: '/grimoire/birth-chart', type: 'guide' },
          {
            name: '2026 Horoscopes',
            href: '/grimoire/horoscopes',
            type: 'topic',
          },
          {
            name: 'Planets',
            href: '/grimoire/astronomy/planets',
            type: 'topic',
          },
          { name: 'Houses', href: '/grimoire/houses', type: 'topic' },
          {
            name: 'Compatibility',
            href: '/grimoire/compatibility',
            type: 'topic',
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
          { text: 'Rising Signs', href: '/grimoire/rising' },
          { text: 'Moon in Signs', href: '/grimoire/moon-in' },
          { text: 'Decans', href: '/grimoire/decans' },
          { text: 'Planetary Placements', href: '/grimoire/placements' },
        ]}
        sources={[
          {
            name: 'Lunary zodiac interpretation framework',
            url: 'https://lunary.app/about/methodology',
          },
          {
            name: 'Traditional zodiac sign and rulership doctrine',
          },
          {
            name: 'Astronomy Engine planetary calculations',
            url: 'https://github.com/cosinekitty/astronomy',
          },
        ]}
      >
        <div className='space-y-12'>
          <div className='grid md:grid-cols-2 gap-4'>
            {signs.map(([key, sign]) => {
              const symbol = zodiacSymbol[key as keyof typeof zodiacSymbol];
              return (
                <Link
                  key={key}
                  href={`/grimoire/zodiac/${stringToKebabCase(key)}`}
                  className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 hover:bg-surface-elevated transition-all group'
                >
                  <div className='flex items-center gap-4'>
                    <span className='text-4xl font-astro'>{symbol}</span>
                    <div>
                      <h2 className='text-xl font-medium text-content-primary group-hover:text-content-brand transition-colors'>
                        {sign.name}
                      </h2>
                      <p className='text-sm text-content-muted'>
                        {sign.dates} • {sign.element}
                      </p>
                    </div>
                  </div>
                  <p className='mt-3 text-sm text-content-muted line-clamp-2'>
                    {sign.mysticalProperties}
                  </p>
                </Link>
              );
            })}
          </div>

          <section className='p-6 rounded-lg border border-lunary-primary-800/50 bg-layer-base/10'>
            <h2 className='text-xl font-medium text-content-primary mb-2'>
              2026 Horoscope Overview
            </h2>
            <p className='text-sm text-content-muted mb-4'>
              Discover what the cosmos has in store for each sign this year.
            </p>
            <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-3'>
              {signs.map(([key, sign]) => {
                const symbol = zodiacSymbol[key as keyof typeof zodiacSymbol];
                return (
                  <Link
                    key={`horoscope-${key}`}
                    href={`/grimoire/horoscopes/${stringToKebabCase(key)}/2026`}
                    className='p-3 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 hover:bg-surface-elevated transition-all group'
                  >
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-lg font-astro'>{symbol}</span>
                      <span className='text-sm font-medium text-content-primary group-hover:text-content-brand transition-colors'>
                        {sign.name} 2026
                      </span>
                    </div>
                    <p className='text-xs text-content-muted'>
                      View yearly forecast →
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/30'>
            <h2 className='text-xl font-medium text-content-primary mb-4'>
              Understanding the Zodiac
            </h2>
            <div className='grid md:grid-cols-2 gap-6 text-sm text-content-muted'>
              <div>
                <h3 className='font-medium text-content-secondary mb-2'>
                  Elements
                </h3>
                <ul className='space-y-1'>
                  <li>
                    <strong>Fire:</strong> Aries, Leo, Sagittarius
                  </li>
                  <li>
                    <strong>Earth:</strong> Taurus, Virgo, Capricorn
                  </li>
                  <li>
                    <strong>Air:</strong> Gemini, Libra, Aquarius
                  </li>
                  <li>
                    <strong>Water:</strong> Cancer, Scorpio, Pisces
                  </li>
                </ul>
              </div>
              <div>
                <h3 className='font-medium text-content-secondary mb-2'>
                  Modalities
                </h3>
                <ul className='space-y-1'>
                  <li>
                    <strong>Cardinal:</strong> Aries, Cancer, Libra, Capricorn
                  </li>
                  <li>
                    <strong>Fixed:</strong> Taurus, Leo, Scorpio, Aquarius
                  </li>
                  <li>
                    <strong>Mutable:</strong> Gemini, Virgo, Sagittarius, Pisces
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/40'>
            <h2 className='text-xl font-medium text-content-primary mb-4'>
              How to use signs in a real chart
            </h2>
            <ul className='list-disc pl-5 space-y-2 text-sm text-content-muted'>
              <li>
                Read the planet first, then let the sign describe its style.
              </li>
              <li>Use the house to see where that sign expression shows up.</li>
              <li>
                Use the ruler of the sign to trace the story elsewhere in the
                chart.
              </li>
              <li>
                Use decans when two people share a sign but still feel
                different.
              </li>
            </ul>
          </section>

          <section className='text-center'>
            <Link
              href='/grimoire/birth-chart'
              className='inline-flex px-6 py-3 rounded-lg bg-layer-base/20 hover:bg-layer-base/30 border border-lunary-primary-700 text-content-brand font-medium transition-colors'
            >
              View Your Birth Chart
            </Link>
            <p className='mt-2 text-sm text-content-muted'>
              Discover which signs are in your planets and houses
            </p>
          </section>
        </div>
      </SEOContentTemplate>
    </>
  );
}
