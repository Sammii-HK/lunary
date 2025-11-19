import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Lunary',
  description:
    'Simple, transparent pricing for personalized astrology. Start your free 7-day trial - credit card required but no payment taken. Cancel anytime. Get birth chart analysis, daily horoscopes, and cosmic guidance.',
  openGraph: {
    title: 'Pricing - Lunary',
    description:
      'Simple, transparent pricing. Start your free trial - credit card required but no payment taken. Cancel anytime.',
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
    title: 'Pricing - Lunary',
    description:
      'Simple, transparent pricing. Start your free trial - credit card required but no payment taken.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/pricing',
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
    'astrology pricing',
    'birth chart pricing',
    'horoscope subscription',
    'astrology app pricing',
    'cosmic guidance pricing',
    'personalized astrology',
    'astrology trial',
    'free astrology trial',
  ],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
