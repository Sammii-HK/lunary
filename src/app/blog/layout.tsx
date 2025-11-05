import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Lunary',
  description:
    'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance. Stay connected to the cosmos with our weekly blog posts.',
  openGraph: {
    title: 'Blog - Lunary',
    description:
      'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance.',
    url: 'https://lunary.app/blog',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Lunary',
    description:
      'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/blog',
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
  keywords: [
    'astrology blog',
    'weekly horoscope',
    'planetary transits',
    'moon phases',
    'astrological guidance',
    'cosmic insights',
    'weekly forecast',
    'astrology weekly',
  ],
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
