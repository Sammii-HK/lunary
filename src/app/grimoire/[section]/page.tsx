import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { grimoire } from '@/constants/grimoire';
import { slugToSection, isValidGrimoireSection } from '@/utils/grimoire';
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

  return {
    title,
    description,
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
  const grimoireItems = Object.keys(grimoire);
  return grimoireItems.map((item) => ({
    section: item
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, ''),
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
