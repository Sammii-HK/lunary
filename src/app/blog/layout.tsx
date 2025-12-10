import { Metadata } from 'next';

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Weekly Astrology Forecast ${year}: Transits, Moon Phases & More - Lunary`,
  description: `Weekly astrology updates for ${year}. This week's planetary transits, moon phases, retrogrades & cosmic events. Your personalized cosmic forecast.`,
  openGraph: {
    title: `Weekly Astrology Forecast ${year} - Lunary`,
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
