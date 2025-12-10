import { Metadata } from 'next';
import Link from 'next/link';
import { zodiacSigns, zodiacSymbol } from '../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../utils/string';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

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
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/zodiac',
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
          { name: 'Birth Chart', href: '/birth-chart', type: 'tool' },
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
      >
        <div className='space-y-12'>
          <div className='grid md:grid-cols-2 gap-4'>
            {signs.map(([key, sign]) => {
              const symbol = zodiacSymbol[key as keyof typeof zodiacSymbol];
              return (
                <Link
                  key={key}
                  href={`/grimoire/zodiac/${stringToKebabCase(key)}`}
                  className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all group'
                >
                  <div className='flex items-center gap-4'>
                    <span className='text-4xl font-astro'>{symbol}</span>
                    <div>
                      <h2 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                        {sign.name}
                      </h2>
                      <p className='text-sm text-zinc-400'>
                        {sign.dates} • {sign.element}
                      </p>
                    </div>
                  </div>
                  <p className='mt-3 text-sm text-zinc-400 line-clamp-2'>
                    {sign.mysticalProperties}
                  </p>
                </Link>
              );
            })}
          </div>

          <section className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <h2 className='text-xl font-medium text-zinc-100 mb-4'>
              Understanding the Zodiac
            </h2>
            <div className='grid md:grid-cols-2 gap-6 text-sm text-zinc-400'>
              <div>
                <h3 className='font-medium text-zinc-300 mb-2'>Elements</h3>
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
                <h3 className='font-medium text-zinc-300 mb-2'>Modalities</h3>
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

          <section className='text-center'>
            <Link
              href='/birth-chart'
              className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
            >
              View Your Birth Chart
            </Link>
            <p className='mt-2 text-sm text-zinc-400'>
              Discover which signs are in your planets and houses
            </p>
          </section>
        </div>
      </SEOContentTemplate>
    </>
  );
}
