import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarot Readings [78 Cards + Birth Chart Integration] | Lunary',
  description:
    'Daily tarot draws personalized to YOUR birth chart. Full 78-card deck with reversals, pattern tracking & cosmic timing. See which cards appear most in your readings. Try free.',
  keywords: [
    'personalized tarot',
    'tarot readings',
    'birth chart tarot',
    'daily tarot card',
    'tarot app',
    'tarot interpretation',
    'tarot patterns',
    'cosmic tarot',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  openGraph: {
    title: 'Tarot Readings [78 Cards + Birth Chart Integration] | Lunary',
    description:
      'Daily tarot draws personalized to YOUR birth chart. Full 78-card deck with reversals, pattern tracking & cosmic timing.',
    url: 'https://lunary.app/tarot',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Tarot Readings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarot Readings [78 Cards + Birth Chart Integration] | Lunary',
    description:
      'Daily tarot draws personalized to YOUR birth chart. Full 78-card deck with reversals & pattern tracking.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/tarot',
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

export default function TarotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
