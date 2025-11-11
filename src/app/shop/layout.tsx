import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Lunary',
  description:
    'Digital grimoire packs, moon phase guides, spell collections, and cosmic resources. Downloadable PDF guides for your spiritual practice. Enhance your magical journey.',
  openGraph: {
    title: 'Shop - Lunary',
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
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
