import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Birth Chart Analysis - Lunary | Complete Natal Chart Reading',
  description:
    'Get your complete birth chart analysis with precise planetary positions, houses, aspects, and interpretations. Calculated from your exact birth time, date, and location using real astronomical data. Free monthly or annual trial.',
  keywords: [
    'birth chart',
    'natal chart',
    'birth chart analysis',
    'astrology birth chart',
    'natal chart reading',
    'birth chart calculator',
    'astrological chart',
    'planetary positions',
    'astrology houses',
    'birth chart interpretation',
    'astrological aspects',
    'cosmic blueprint',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/birth-chart',
  },
  openGraph: {
    title: 'Birth Chart Analysis - Lunary | Complete Natal Chart Reading',
    description:
      'Get your complete birth chart analysis with precise planetary positions, houses, aspects, and interpretations. Calculated from your exact birth time, date, and location.',
    url: 'https://lunary.app/birth-chart',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Birth Chart Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birth Chart Analysis - Lunary | Complete Natal Chart Reading',
    description:
      'Get your complete birth chart analysis with precise planetary positions, houses, aspects, and interpretations.',
    images: ['/api/og/cosmic'],
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
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
