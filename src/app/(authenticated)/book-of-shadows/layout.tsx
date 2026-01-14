import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book of Shadows - Lunary | AI Astral Guide & Magical Journal',
  description:
    "Your personal Book of Shadows with AI astral guide. Write, store, and analyze your magical practice. Have reflective conversations with Lunary's calm AI—every reply grounded in your birth chart, tarot, and today's moon. Free monthly or annual trial.",
  keywords: [
    'book of shadows',
    'magical journal',
    'AI astrology guide',
    'astrology journal',
    'spiritual journal',
    'magical practice',
    'witchcraft journal',
    'astrology AI',
    'cosmic journal',
    'spiritual practice',
    'astrological guidance',
    'magical diary',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/book-of-shadows',
  },
  openGraph: {
    title: 'Book of Shadows - Lunary | AI Astral Guide & Magical Journal',
    description:
      "Your personal Book of Shadows with AI astral guide. Write, store, and analyze your magical practice. Have reflective conversations grounded in your birth chart, tarot, and today's moon.",
    url: 'https://lunary.app/book-of-shadows',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Book of Shadows',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book of Shadows - Lunary | AI Astral Guide & Magical Journal',
    description:
      'Your personal Book of Shadows with AI astral guide. Write, store, and analyze your magical practice.',
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

export default function BookOfShadowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
