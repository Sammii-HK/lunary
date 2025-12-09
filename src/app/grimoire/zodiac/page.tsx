import { Metadata } from 'next';
import Link from 'next/link';
import { zodiacSigns, zodiacSymbol } from '../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../utils/string';

export const metadata: Metadata = {
  title: 'Zodiac Signs: Complete Guide to All 12 Signs - Lunary',
  description:
    "Explore all 12 zodiac signs. Learn about each sign's traits, elements, ruling planets, and compatibility. Comprehensive astrology guide.",
  openGraph: {
    title: 'Zodiac Signs: Complete Guide - Lunary',
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

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='flex items-center gap-2 text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>Zodiac Signs</span>
        </nav>

        <header className='mb-12'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            The 12 Zodiac Signs
          </h1>
          <p className='text-lg text-zinc-400'>
            Explore the unique traits, elements, and ruling planets of each
            zodiac sign.
          </p>
        </header>

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
                    <p className='text-sm text-zinc-500'>
                      {sign.dates} • {sign.element} • {sign.modality}
                    </p>
                  </div>
                </div>
                <p className='mt-3 text-sm text-zinc-400 line-clamp-2'>
                  {sign.description}
                </p>
              </Link>
            );
          })}
        </div>

        <section className='mt-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Understanding the Zodiac
          </h2>
          <div className='grid md:grid-cols-2 gap-6 text-sm text-zinc-400'>
            <div>
              <h3 className='font-medium text-zinc-300 mb-2'>Elements</h3>
              <ul className='space-y-1'>
                <li>
                  🜂 <strong>Fire:</strong> Aries, Leo, Sagittarius
                </li>
                <li>
                  🜃 <strong>Earth:</strong> Taurus, Virgo, Capricorn
                </li>
                <li>
                  🜁 <strong>Air:</strong> Gemini, Libra, Aquarius
                </li>
                <li>
                  🜄 <strong>Water:</strong> Cancer, Scorpio, Pisces
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

        <section className='mt-8 text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            View Your Birth Chart
          </Link>
          <p className='mt-2 text-sm text-zinc-500'>
            Discover which signs are in your planets and houses
          </p>
        </section>
      </div>
    </div>
  );
}
