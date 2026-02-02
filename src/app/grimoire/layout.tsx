import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Grimoire [500+ Spells, Crystals, Tarot & More] | Lunary',
  description:
    'Complete digital grimoire with 78 tarot cards, 50+ crystals, 24 runes, 12 zodiac signs, moon phases, candle magic & correspondences. Free access to centuries of mystical knowledge.',
  keywords: [
    'grimoire',
    'digital grimoire',
    'book of shadows',
    'tarot meanings',
    'crystal guide',
    'rune meanings',
    'moon phases',
    'candle magic',
    'magical correspondences',
    'witchcraft guide',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  openGraph: {
    title: 'Free Grimoire [500+ Spells, Crystals, Tarot & More] | Lunary',
    description:
      'Complete digital grimoire with 78 tarot cards, 50+ crystals, 24 runes, moon phases, candle magic & correspondences. Free access.',
    url: 'https://lunary.app/grimoire',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire',
        width: 1200,
        height: 630,
        alt: 'Lunary Grimoire - 500+ Spells, Crystals, Tarot & More',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Grimoire [500+ Spells, Crystals, Tarot & More] | Lunary',
    description:
      '78 tarot cards, 50+ crystals, 24 runes, moon phases, candle magic & correspondences. Complete digital grimoire.',
    images: ['/api/og/grimoire'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire',
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

export default function GrimoireLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
