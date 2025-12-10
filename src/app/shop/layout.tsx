import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lunary Shop: Digital Moon Packs, Grimoire Guides & PDFs',
  description:
    'Digital moon phase packs, grimoire guides, spell collections & cosmic calendars. Instant PDF downloads for your spiritual practice.',
  openGraph: {
    title: 'Lunary Shop: Digital Moon Packs & Grimoire Guides',
    description:
      'Digital grimoire packs, moon phase guides, spell collections, and cosmic resources.',
    url: 'https://lunary.app/shop',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Shop',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop - Lunary',
    description:
      'Digital grimoire packs, moon phase guides, spell collections, and cosmic resources.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/shop',
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
    'digital grimoire',
    'moon phase guides',
    'spell collections',
    'cosmic resources',
    'witchcraft guides',
    'astrology PDFs',
    'magical practice',
    'spiritual resources',
  ],
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
