import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Horoscope [Personalized to Your Birth Chart] | Lunary',
  description:
    'Not generic zodiac predictions. Get YOUR daily horoscope calculated from your exact birth time, date & location. Real planetary transits affecting YOU today. Try free for 7 days.',
  keywords: [
    'personalized horoscope',
    'daily horoscope',
    'birth chart horoscope',
    'astrology horoscope',
    'personalized astrology',
    'natal chart horoscope',
    'daily astrology',
    'cosmic guidance',
    'astrological insights',
    'personalized cosmic guidance',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/horoscope',
  },
  openGraph: {
    title: 'Daily Horoscope [Personalized to Your Birth Chart] | Lunary',
    description:
      'Not generic zodiac predictions. Get YOUR daily horoscope calculated from your exact birth time. Real planetary transits affecting YOU today.',
    url: 'https://lunary.app/horoscope',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/horoscope',
        width: 1200,
        height: 630,
        alt: 'Lunary Personalized Horoscope',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Horoscope [Personalized to Your Birth Chart] | Lunary',
    description:
      'Not generic zodiac predictions. YOUR daily horoscope calculated from your exact birth time. Try free for 7 days.',
    images: ['/api/og/horoscope'],
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

export default function HoroscopeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
