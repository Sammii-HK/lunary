import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing [Free Trial, Cancel Anytime] | Lunary',
  description:
    'Try Lunary free with a 7-day monthly or 14-day annual trial. No payment during trial. Plans from $4.99/month. Includes personalized horoscopes, daily tarot, birth chart analysis & AI astral guide. 10,000+ cosmic explorers.',
  keywords: [
    'astrology app pricing',
    'personalized astrology subscription',
    'astrology app cost',
    'birth chart app pricing',
    'horoscope app subscription',
    'tarot app pricing',
    'astrology free trial',
    'cosmic guidance pricing',
    'astrological insights subscription',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app/pricing',
  },
  openGraph: {
    title: 'Pricing [Free Trial, Cancel Anytime] | Lunary',
    description:
      'Try Lunary free with a 7-day monthly or 14-day annual trial. No payment during trial. Plans from $4.99/month. Personalized horoscopes, daily tarot & birth chart analysis.',
    url: 'https://lunary.app/pricing',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Pricing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing [Free Trial, Cancel Anytime] | Lunary',
    description:
      'Try Lunary free with a 7-day monthly or 14-day annual trial. No payment during trial. Plans from $4.99/month. Cancel anytime.',
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

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
