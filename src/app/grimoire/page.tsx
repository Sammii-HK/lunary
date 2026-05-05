import { Metadata } from 'next';

import GrimoireLayout from './GrimoireLayout';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Lunary Grimoire: Astrology, Birth Charts, Houses & Transits',
  description:
    'Astrology learning hub for birth charts, planets, houses, aspects, decans, moon phases, zodiac signs, compatibility, and transit timing.',
  keywords: [
    'astrology',
    'birth chart',
    'chart reading',
    'astrology houses',
    'astrology aspects',
    'planetary placements',
    'decans',
    'moon phases',
    'planetary transits',
    'numerology',
    'zodiac signs',
  ],
  openGraph: {
    title: 'Lunary Grimoire: Astrology, Birth Charts, Houses & Transits',
    description:
      'Astrology learning hub for birth charts, planets, houses, aspects, decans, moon phases, zodiac signs, compatibility, and transit timing.',
    url: 'https://lunary.app/grimoire',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire',
  },
};

const grimoireCategories = [
  {
    name: 'Astrology',
    url: 'https://lunary.app/grimoire/astrology',
    description: 'Birth charts, houses, aspects, and timing',
  },
  {
    name: 'Birth Chart',
    url: 'https://lunary.app/grimoire/birth-chart',
    description: 'Learn to read your natal chart',
  },
  {
    name: 'Planets',
    url: 'https://lunary.app/grimoire/planets',
    description: 'Planet meanings, dignity, and chart interpretation',
  },
  {
    name: 'Houses',
    url: 'https://lunary.app/grimoire/houses',
    description: 'The 12 houses and planet-in-house placements',
  },
  {
    name: 'Aspects',
    url: 'https://lunary.app/grimoire/aspects',
    description: 'How planetary angles create support and pressure',
  },
  {
    name: 'Decans',
    url: 'https://lunary.app/grimoire/decans',
    description: 'Degree-based sign subdivisions for deeper readings',
  },
  {
    name: 'Moon Phases',
    url: 'https://lunary.app/grimoire/moon',
    description: 'Moon phases, signs, and lunar timing',
  },
  {
    name: 'Numerology',
    url: 'https://lunary.app/grimoire/numerology',
    description: 'Core numbers, life paths, and timing cycles',
  },
];

const GrimoireHome = () => {
  const grimoireListSchema = createItemListSchema({
    name: 'Lunary Grimoire',
    description:
      'Astrology learning hub for birth charts, planets, houses, aspects, decans, moon phases, zodiac signs, compatibility, and transit timing.',
    url: 'https://lunary.app/grimoire',
    items: grimoireCategories,
  });
  const breadcrumbItems = [{ name: 'Grimoire', url: '/grimoire' }];

  return (
    <div className='h-full w-full'>
      {renderJsonLd(grimoireListSchema)}
      <GrimoireLayout pathname='/grimoire' />
    </div>
  );
};

export default GrimoireHome;
