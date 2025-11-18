import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Lunary | Personalized Astrology Plans',
  description:
    'Simple, transparent pricing for personalized astrology. Start your free 7-day trial - credit card required but no payment taken. Cancel anytime. Get personalized horoscopes, tarot readings, birth chart analysis, and cosmic insights.',
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
    title: 'Pricing - Lunary | Personalized Astrology Plans',
    description:
      'Simple, transparent pricing for personalized astrology. Start your free 7-day trial - credit card required but no payment taken. Cancel anytime.',
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
    title: 'Pricing - Lunary | Personalized Astrology Plans',
    description:
      'Simple, transparent pricing for personalized astrology. Start your free 7-day trial - credit card required but no payment taken.',
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
