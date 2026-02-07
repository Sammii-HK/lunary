import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Birth Chart Calculator & Natal Chart Reading | Lunary',
  description:
    'Get your free birth chart analysis with precise planetary positions for 24+ celestial bodies, 12 house placements, aspects, dignities, and personalized interpretations. Calculated from real astronomical data with arcminute accuracy.',
  keywords: [
    'birth chart',
    'natal chart',
    'birth chart calculator',
    'free birth chart',
    'astrology birth chart',
    'natal chart reading',
    'birth chart interpretation',
    'astrological chart',
    'planetary positions',
    'astrology houses',
    'birth chart analysis',
    'cosmic blueprint',
    'sun moon rising',
    'big three astrology',
    'chart ruler',
    'planetary aspects',
    'stellium astrology',
    'planetary dignities',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/birth-chart',
  },
  openGraph: {
    title: 'Free Birth Chart Calculator & Natal Chart Reading | Lunary',
    description:
      'Get your complete birth chart analysis with 24+ celestial bodies, house placements, aspects, and personalized interpretations. Calculated from real astronomical data.',
    url: 'https://lunary.app/birth-chart',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Birth Chart Calculator - Free Natal Chart Reading',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Birth Chart Calculator & Natal Chart Reading | Lunary',
    description:
      'Get your complete birth chart with 24+ celestial bodies, aspects, and interpretations. Real astronomical data, arcminute accuracy.',
    images: ['/api/og/cosmic'],
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

export default function BirthChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
