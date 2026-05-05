import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Astrology Grimoire: Birth Charts, Planets, Houses & Transits | Lunary',
  description:
    'Learn astrology through birth charts, planets, houses, aspects, decans, moon phases, zodiac signs, and transit timing grounded in astronomical calculations.',
  keywords: [
    'astrology grimoire',
    'birth chart guide',
    'chart reading',
    'astrology houses',
    'astrology aspects',
    'planetary transits',
    'decans astrology',
    'moon phases',
    'zodiac signs',
    'astrology learning',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  openGraph: {
    title:
      'Astrology Grimoire: Birth Charts, Planets, Houses & Transits | Lunary',
    description:
      'Learn astrology through birth charts, planets, houses, aspects, decans, moon phases, zodiac signs, and transit timing.',
    url: 'https://lunary.app/grimoire',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire',
        width: 1200,
        height: 630,
        alt: 'Lunary Astrology Grimoire - Birth Charts, Planets, Houses and Transits',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Astrology Grimoire: Birth Charts, Planets, Houses & Transits | Lunary',
    description:
      'Birth charts, planets, houses, aspects, decans, moon phases, zodiac signs, and transit timing.',
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
