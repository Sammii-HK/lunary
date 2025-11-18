import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your AI-Powered Astral Guide | Lunary - Personalized Astrology',
  description:
    "Your AI-powered astral guide for personalized astrology, tarot, and cosmic insight. Built around your birth chart, your energy, and the sky today. Understand today's energy based on your birth chart. Daily tarot, lunar cycles and planetary transits personalized to you.",
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
    title: 'Your AI-Powered Astral Guide | Lunary - Personalized Astrology',
    description:
      'Your AI-powered astral guide for personalized astrology, tarot, and cosmic insight. Built around your birth chart, your energy, and the sky today.',
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
    title: 'Your AI-Powered Astral Guide | Lunary - Personalized Astrology',
    description:
      'Your AI-powered astral guide for personalized astrology, tarot, and cosmic insight. Built around your birth chart, your energy, and the sky today.',
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
