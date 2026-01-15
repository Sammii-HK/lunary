import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY,
  SIGN_SYMBOLS,
  getDecanData,
  ZodiacSign,
} from '@/constants/seo/decans';

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({ sign }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;

  if (!ZODIAC_SIGNS.includes(sign as ZodiacSign)) {
    return { title: 'Sign Not Found | Lunary' };
  }

  const signName = SIGN_DISPLAY[sign as ZodiacSign];
  const title = `${signName} Decans: All Three Decans Explained | Lunary`;
  const description = `Explore the three decans of ${signName}. Learn how each decan modifies ${signName} traits with different subrulers and date ranges.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} decans`,
      `${signName.toLowerCase()} first decan`,
      `${signName.toLowerCase()} second decan`,
      `${signName.toLowerCase()} third decan`,
      'zodiac decans',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/decans/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/decans/${sign}`,
    },
  };
}

export default async function SignDecansPage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;

  if (!ZODIAC_SIGNS.includes(sign as ZodiacSign)) {
    notFound();
  }

  const signName = SIGN_DISPLAY[sign as ZodiacSign];
  const symbol = SIGN_SYMBOLS[sign as ZodiacSign];

  const decans = [1, 2, 3].map((num) => ({
    number: num,
    name: num === 1 ? 'First' : num === 2 ? 'Second' : 'Third',
    ...getDecanData(sign as ZodiacSign, num as 1 | 2 | 3),
  }));

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <span className='text-6xl'>{symbol}</span>
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Each zodiac sign is divided into three decans of 10 degrees each. Your
        decan reveals more nuanced traits based on your birth date.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='what-are-decans'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          What Are Decans?
        </h2>
        <p className='text-zinc-400'>
          Decans divide each 30-degree zodiac sign into three 10-degree
          sections. Each decan has a co-ruler that modifies the sign&apos;s
          expression, adding depth to your astrological profile.
        </p>
      </section>

      <section id='decan-list' className='mb-12'>
        <div className='space-y-4'>
          {decans.map((decan) => (
            <Link
              key={decan.number}
              href={`/grimoire/decans/${sign}/${decan.number}`}
              className='group block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <Star className='w-5 h-5 text-lunary-primary-400' />
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {decan.name} Decan
                  </h3>
                </div>
                <span className='text-sm text-zinc-400'>{decan.dateRange}</span>
              </div>
              <p className='text-sm text-zinc-400 mb-2'>
                Subruler: {decan.subruler}
              </p>
              <div className='flex flex-wrap gap-2'>
                {decan.traits.slice(0, 3).map((trait) => (
                  <span
                    key={trait}
                    className='text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded'
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div id='related-resources' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>
          Related Resources
        </h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/decans'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            All Decans
          </Link>
          <Link
            href={`/grimoire/zodiac/${sign}`}
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            {signName} Overview
          </Link>
          <Link
            href='/grimoire/zodiac'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            All Signs
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`${signName} Decans: All Three Decans Explained | Lunary`}
        h1={`${signName} Decans`}
        description={`Explore the three decans of ${signName} and how each subruler reshapes ${signName} energy.`}
        keywords={[
          `${signName.toLowerCase()} decans`,
          `${signName.toLowerCase()} first decan`,
          `${signName.toLowerCase()} second decan`,
          `${signName.toLowerCase()} third decan`,
          'zodiac decans',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/decans/${sign}`}
        intro={`${signName} decans reveal the three distinct expressions within this sign. Each 10-degree segment is co-ruled by another planet, adding nuance to ${signName}'s core traits. If you were born under ${signName}, your decan can explain why you feel more intense, more grounded, or more visionary than others with the same Sun sign.`}
        tldr={`${signName} has three decans, each spanning about 10 degrees. The decan you are born under adds a subruler influence that shapes your personality, strengths, and timing. Explore each decan to find the one that matches your birth date and energy.`}
        meaning={`Decans divide each zodiac sign into three 10-degree sections. While the sign's primary ruler sets the foundation, the decan's subruler adds a distinct flavor. This is why two ${signName} individuals can feel very different even with the same Sun sign.

Decan study is especially useful for self-awareness. It helps you understand why certain traits are stronger, where your natural gifts live, and how to work with the energy of your season. For example, a first decan typically feels more "pure" to the sign, while later decans blend in the subruler's influence.

You can also apply decans to the Moon, Rising sign, and personal planets. This adds a deeper layer to your birth chart reading and makes compatibility and timing more precise.`}
        tableOfContents={[
          { label: 'What Are Decans?', href: '#what-are-decans' },
          { label: 'Decan List', href: '#decan-list' },
          { label: 'Related Resources', href: '#related-resources' },
        ]}
        heroContent={heroContent}
        howToWorkWith={[
          'Identify your decan by birth date and compare it to your traits.',
          'Use the subruler planet to guide self-development and goals.',
          'Track your energy during your decan season each year.',
          'Explore how your Moon and Rising decans modify your core personality.',
          'Use decan insights to refine relationship and career choices.',
        ]}
        journalPrompts={[
          `Which ${signName} traits feel strongest for me, and why?`,
          'Where do I see my subruler influence in my personality?',
          'What strengths emerge when I lean into my decan energy?',
          'How does my decan show up in relationships?',
        ]}
        faqs={[
          {
            question: `What is a ${signName} decan?`,
            answer: `A ${signName} decan is one of three 10-degree divisions within ${signName}. Each decan has a subruler planet that subtly changes how ${signName} energy is expressed.`,
          },
          {
            question: 'How do I find my decan?',
            answer:
              'Find your birth date range and match it to the first, second, or third decan listed below. Exact birth time can help refine your degree if you are near a boundary.',
          },
          {
            question: 'Do decans change my Sun sign?',
            answer:
              'No. Decans add nuance to your Sun sign but do not change it. Think of them as a detailed sub-style within the main sign.',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Decans', href: '/grimoire/decans' },
          { label: `${signName} Decans` },
        ]}
        internalLinks={[
          { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Astrology Transits', href: '/grimoire/transits' },
        ]}
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
