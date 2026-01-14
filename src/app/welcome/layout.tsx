import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personalized Astrology App [Based on YOUR Birth Chart] | Lunary',
  description:
    'Get daily horoscopes, tarot readings & cosmic insights calculated from YOUR exact birth time. Real astronomical data, not generic zodiac signs. Join 10,000+ cosmic explorers. Try a free monthly or annual trial.',
  keywords: [
    'AI astrology',
    'personalized astrology',
    'AI astral guide',
    'personalized horoscope',
    'birth chart astrology',
    'tarot readings',
    'lunar cycles',
    'planetary transits',
    'cosmic guidance',
    'astrological insights',
    'personalized tarot',
    'astrology app',
    'natal chart analysis',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/welcome',
  },
  openGraph: {
    title: 'Personalized Astrology App [Based on YOUR Birth Chart] | Lunary',
    description:
      'Daily horoscopes, tarot readings & cosmic insights calculated from YOUR exact birth time. Real astronomical data, not generic zodiac signs. Try a free monthly or annual trial.',
    url: 'https://lunary.app/welcome',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary - Your AI-Powered Astral Guide',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personalized Astrology App [Based on YOUR Birth Chart] | Lunary',
    description:
      'Daily horoscopes, tarot readings & cosmic insights calculated from YOUR exact birth time. Real astronomical data. Try a free monthly or annual trial.',
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
