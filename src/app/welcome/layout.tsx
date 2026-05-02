import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lunary | Personalized Astrology App for Your Birth Chart',
  description:
    'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis. 2,000+ free astrology articles.',
  keywords: [
    'personalized astrology',
    'birth chart astrology',
    'learn astrology',
    'synastry analysis',
    'daily horoscopes',
    'tarot readings',
    'planetary transits',
    'astrology app',
    'astrological insights',
    'natal chart analysis',
    'real astronomical data',
    'free astrology articles',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/welcome',
  },
  openGraph: {
    title: 'Lunary | Personalized Astrology App for Your Birth Chart',
    description:
      'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis. 2,000+ free astrology articles.',
    url: 'https://lunary.app/welcome',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary - Personalized Astrology App for Your Birth Chart',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary | Personalized Astrology App for Your Birth Chart',
    description:
      'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis.',
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

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
