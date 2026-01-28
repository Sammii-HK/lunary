import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Star } from 'lucide-react';

import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY,
  SIGN_SYMBOLS,
  getDecanData,
  ZodiacSign,
} from '@/constants/seo/decans';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

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

  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Decans', url: '/grimoire/decans' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <span className='text-6xl'>{symbol}</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            {signName} Decans
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Each zodiac sign is divided into three decans of 10 degrees each.
            Your decan reveals more nuanced traits based on your birth date.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            What Are Decans?
          </h2>
          <p className='text-zinc-400'>
            Decans divide each 30-degree zodiac sign into three 10-degree
            sections. Each decan has a co-ruler that modifies the sign&apos;s
            expression, adding depth to your astrological profile.
          </p>
        </div>

        <section className='mb-12'>
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
                  <span className='text-sm text-zinc-400'>
                    {decan.dateRange}
                  </span>
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

        <div className='border-t border-zinc-800 pt-8'>
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
        <ExploreGrimoire />
      </div>
    </div>
  );
}
