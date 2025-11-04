import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grimoire - Lunary',
  description:
    'Explore mystical knowledge, cosmic wisdom, tarot, crystals, runes, chakras, moon phases, and astrological correspondences in the Lunary Grimoire.',
  openGraph: {
    title: 'Grimoire - Lunary',
    description:
      'Explore mystical knowledge, cosmic wisdom, tarot, crystals, runes, chakras, moon phases, and astrological correspondences.',
    url: 'https://lunary.app/grimoire',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Grimoire',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grimoire - Lunary',
    description:
      'Explore mystical knowledge, cosmic wisdom, tarot, crystals, runes, chakras, moon phases, and astrological correspondences.',
    images: ['/api/og/cosmic'],
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

export default function GrimoireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
