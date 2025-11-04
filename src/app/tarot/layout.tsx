import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarot Readings - Lunary',
  description:
    'Personalized tarot readings based on your birth chart and cosmic signature. Daily and weekly cards, pattern analysis, and spiritual guidance.',
  openGraph: {
    title: 'Tarot Readings - Lunary',
    description:
      'Personalized tarot readings based on your birth chart and cosmic signature. Daily and weekly cards, pattern analysis, and spiritual guidance.',
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
    title: 'Tarot Readings - Lunary',
    description:
      'Personalized tarot readings based on your birth chart and cosmic signature.',
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
