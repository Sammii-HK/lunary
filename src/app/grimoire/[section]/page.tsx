import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { grimoire } from '@/constants/grimoire';
import {
  slugToSection,
  isValidGrimoireSection,
  getAllGrimoireSectionSlugs,
} from '@/utils/grimoire';
import GrimoireLayout from '../GrimoireLayout';

const sectionDescriptions: Record<string, string> = {
  moon: "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
  'wheel-of-the-year':
    'Discover the Wheel of the Year, Sabbats, and seasonal celebrations. Connect with ancient traditions and cosmic cycles.',
  astronomy:
    'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world.',
  tarot:
    'Comprehensive tarot guide with Major and Minor Arcana, spreads, and interpretations. Master the art of tarot reading.',
  runes:
    'Explore ancient runic alphabets and their meanings. Learn runic divination and magical practices.',
  chakras:
    'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers.',
  numerology:
    'Discover core numbers, master numbers, planetary days, and numerological calculations. Understand the power of numbers.',
  crystals:
    'Comprehensive crystal guide with daily selections, categories, and how to work with crystals for healing and magic.',
  correspondences:
    'Magical correspondences including elements, colors, days, deities, flowers, numbers, wood, herbs, and animals.',
  practices:
    'Spells, rituals, protection, love magic, prosperity, healing, cleansing, divination, manifestation, and banishing practices.',
  'birth-chart':
    'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted.',
  'candle-magic':
    'Complete guide to candle magic: color meanings, carving techniques, anointing with oils, lighting candles on altar, incantations by color, safety practices, and candle rituals.',
  divination:
    'Explore divination methods beyond tarot: pendulum reading, scrying, dream interpretation, and reading omens from nature.',
  'modern-witchcraft':
    'Discover different paths of modern witchcraft, essential tools, ethics, coven vs solitary practice, and creating your Book of Shadows.',
  meditation:
    'Meditation and mindfulness practices for spiritual growth: techniques, breathwork, grounding exercises, centering, and magical journaling.',
  'compatibility-chart':
    'Interactive compatibility chart for zodiac signs, elements, moon phases, and crystal categories. Discover how different energies interact and complement each other.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const section = slugToSection(sectionSlug);
  const sectionData = grimoire[section];

  if (!sectionData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${sectionData.title} - Lunary Grimoire`;
  const description =
    sectionDescriptions[sectionSlug] ||
    `Explore ${sectionData.title} in the Lunary Grimoire. Comprehensive mystical knowledge and cosmic wisdom.`;

  // Generate rich keywords based on section
  const sectionKeywords: Record<string, string[]> = {
    moon: [
      'moon phases',
      'lunar cycles',
      'lunar calendar',
      'full moon',
      'new moon',
      'moon magic',
      'lunar wisdom',
      'moon rituals',
      'moon signs',
      'void of course moon',
      'lunar eclipse',
    ],
    'wheel-of-the-year': [
      'wheel of the year',
      'sabbats',
      'pagan holidays',
      'seasonal celebrations',
      'imbolc',
      'beltane',
      'samhain',
      'yule',
      'witchcraft holidays',
      'pagan calendar',
    ],
    astronomy: [
      'astronomy',
      'astrology',
      'planets',
      'zodiac signs',
      'astronomical knowledge',
      'astronomical data',
      'cosmic forces',
      'planetary influences',
      'astrological signs',
      'celestial bodies',
      'astronomical calculations',
    ],
    tarot: [
      'tarot cards',
      'tarot reading',
      'major arcana',
      'minor arcana',
      'tarot spreads',
      'tarot interpretation',
      'divination',
      'tarot guide',
    ],
    runes: [
      'runes',
      'runic alphabet',
      'elder futhark',
      'rune meanings',
      'runic divination',
      'norse runes',
      'rune magic',
    ],
    chakras: [
      'chakras',
      'energy centers',
      'chakra balancing',
      'chakra healing',
      'spiritual energy',
      'seven chakras',
      'chakra colors',
      'chakra meditation',
    ],
    numerology: [
      'numerology',
      'life path number',
      'master numbers',
      'numerological calculations',
      'number meanings',
      'planetary days',
    ],
    crystals: [
      'crystals',
      'crystal healing',
      'crystal meanings',
      'crystal properties',
      'crystal magic',
      'gemstones',
      'crystal guide',
    ],
    correspondences: [
      'magical correspondences',
      'elemental correspondences',
      'astrological correspondences',
      'elements',
      'colors',
      'herbs',
      'planetary days',
      'deities',
      'magical associations',
    ],
    practices: [
      'spells',
      'rituals',
      'witchcraft',
      'witchcraft practices',
      'magic practices',
      'magical practices',
      'spellcraft',
      'protection spells',
      'protection magic',
      'love magic',
      'prosperity spells',
    ],
    'birth-chart': [
      'birth chart',
      'astrology chart',
      'natal chart',
      'astrological chart',
      'birth chart reading',
      'planets',
      'houses',
      'aspects',
      'astrological interpretation',
    ],
    'candle-magic': [
      'candle magic',
      'candle spells',
      'candle colors',
      'candle rituals',
      'candle carving',
      'candle anointing',
    ],
    divination: [
      'divination',
      'pendulum',
      'pendulum reading',
      'scrying',
      'dream interpretation',
      'omen reading',
      'psychic abilities',
    ],
    'modern-witchcraft': [
      'modern witchcraft',
      'witchcraft',
      'witch types',
      'witchcraft tools',
      'witchcraft ethics',
      'book of shadows',
      'coven',
      'solitary witch',
    ],
    meditation: [
      'meditation',
      'mindfulness',
      'breathwork',
      'grounding',
      'grounding exercises',
      'centering',
      'spiritual practice',
      'spiritual meditation',
      'meditation techniques',
    ],
  };

  const keywords = [
    ...(sectionKeywords[sectionSlug] || []),
    'grimoire',
    'mystical knowledge',
    'cosmic wisdom',
    'astrology guide',
    'spiritual guide',
  ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Lunary' }],
    creator: 'Lunary',
    publisher: 'Lunary',
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/${sectionSlug}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${sectionData.title} - Lunary Grimoire`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/${sectionSlug}`,
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
}

export async function generateStaticParams() {
  return getAllGrimoireSectionSlugs().map((slug) => ({
    section: slug,
  }));
}

export default async function GrimoireSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isValidGrimoireSection(section)) {
    notFound();
  }

  return <GrimoireLayout currentSectionSlug={section} />;
}
