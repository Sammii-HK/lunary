import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lunary - Astrology Based on Real Data',
  description:
    'Your complete birth chart, calculated with astronomical precision. Daily insights that consider your unique cosmic signature. Real guidance, thoughtfully presented. Free 7-day trial - credit card required but no payment taken.',
  openGraph: {
    title: 'Lunary - Astrology Based on Real Data',
    description:
      'Your complete birth chart, calculated with astronomical precision. Daily insights that consider your unique cosmic signature.',
    url: 'https://lunary.app/welcome',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary - Astrology Based on Real Data',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary - Astrology Based on Real Data',
    description:
      'Your complete birth chart, calculated with astronomical precision. Daily insights that consider your unique cosmic signature.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/welcome',
  },
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
