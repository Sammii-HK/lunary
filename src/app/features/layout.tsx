import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features — Your Complete Cosmic Toolkit | Lunary',
  description:
    'Complete astrology toolkit: birth charts, pattern recognition, synastry analysis, tarot spreads, transit calendar, and 2,000+ free educational articles. Learn by doing.',
  openGraph: {
    title: 'Features — Your Complete Cosmic Toolkit | Lunary',
    description:
      'Complete astrology toolkit: birth charts, pattern recognition, synastry analysis, tarot spreads, transit calendar, and 2,000+ free educational articles.',
    url: 'https://lunary.app/features',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features — Your Complete Cosmic Toolkit | Lunary',
    description:
      'Complete astrology toolkit: birth charts, pattern recognition, synastry analysis, tarot spreads, transit calendar, and 2,000+ free educational articles.',
  },
  alternates: {
    canonical: 'https://lunary.app/features',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
