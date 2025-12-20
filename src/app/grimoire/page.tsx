import { Metadata } from 'next';

import GrimoireLayout from './GrimoireLayout';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Lunary Grimoire - Complete Digital Grimoire | Astrology, Tarot, Crystals',
  description:
    'Complete digital grimoire with 500+ articles on tarot, crystals, astrology, moon phases, spells, and magical practice.',
  keywords: [
    'grimoire',
    'astrology',
    'tarot',
    'crystals',
    'moon phases',
    'spells',
    'witchcraft',
    'numerology',
    'birth chart',
  ],
  openGraph: {
    title: 'Lunary Grimoire - Complete Digital Grimoire',
    description:
      'Complete digital grimoire with 500+ articles on tarot, crystals, astrology, moon phases, spells, and magical practice.',
    url: 'https://lunary.app/grimoire',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire',
  },
};

const grimoireCategories = [
  {
    name: 'Zodiac Signs',
    url: 'https://lunary.app/grimoire/zodiac',
    description: 'Explore all 12 zodiac signs and their meanings',
  },
  {
    name: 'Tarot Cards',
    url: 'https://lunary.app/grimoire/tarot',
    description: 'Complete guide to all 78 tarot cards',
  },
  {
    name: 'Crystals',
    url: 'https://lunary.app/grimoire/crystals',
    description: 'Crystal meanings, properties, and healing uses',
  },
  {
    name: 'Moon Phases',
    url: 'https://lunary.app/grimoire/moon',
    description: 'Moon phases, rituals, and lunar magic',
  },
  {
    name: 'Birth Chart',
    url: 'https://lunary.app/grimoire/birth-chart',
    description: 'Learn to read your natal chart',
  },
  {
    name: 'Runes',
    url: 'https://lunary.app/grimoire/runes',
    description: 'Elder Futhark rune meanings and divination',
  },
  {
    name: 'Numerology',
    url: 'https://lunary.app/grimoire/numerology',
    description: 'Life path numbers, angel numbers, and more',
  },
  {
    name: 'Candle Magic',
    url: 'https://lunary.app/grimoire/candle-magic',
    description: 'Candle colors, rituals, and spellwork',
  },
  {
    name: 'Correspondences',
    url: 'https://lunary.app/grimoire/correspondences',
    description:
      'Magical correspondences for elements, colors, herbs, and more',
  },
  {
    name: 'Witchcraft Practices',
    url: 'https://lunary.app/grimoire/practices',
    description:
      'Complete guide to spells, meditation, divination, shadow work, and more',
  },
  {
    name: 'Spells',
    url: 'https://lunary.app/grimoire/spells',
    description: 'Protection, love, prosperity, and healing spells',
  },
];

const GrimoireHome = () => {
  const grimoireListSchema = createItemListSchema({
    name: 'Lunary Grimoire',
    description:
      'Complete digital grimoire with 500+ articles on tarot, crystals, astrology, moon phases, spells, and magical practice.',
    url: 'https://lunary.app/grimoire',
    items: grimoireCategories,
  });

  return (
    <div className='h-full w-full'>
      {renderJsonLd(grimoireListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([{ name: 'Grimoire', url: '/grimoire' }]),
      )}
      <GrimoireLayout />
    </div>
  );
};

export default GrimoireHome;
