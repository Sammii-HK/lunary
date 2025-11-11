import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Lunary',
  description:
    'Simple, transparent pricing for personalized astrology. Start your free 7-day trial, no credit card required. Cancel anytime. Get birth chart analysis, daily horoscopes, and cosmic guidance.',
  openGraph: {
    title: 'Pricing - Lunary',
    description:
      'Simple, transparent pricing. Start your free trial. No credit card required. Cancel anytime.',
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
      'Simple, transparent pricing. Start your free trial. No credit card required.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
