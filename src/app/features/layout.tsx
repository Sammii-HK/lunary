import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meet Celeste — Explore Lunary Features | Lunary',
  description:
    'See how Lunary connects your birth chart with real astronomical data. Meet Celeste, our reference persona, and explore personalised cosmic insights that update monthly with current transits.',
  openGraph: {
    title: 'Meet Celeste — Explore Lunary Features',
    description:
      'See how Lunary connects birth charts with real astronomical data for personalised cosmic insights.',
    url: 'https://lunary.app/features',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meet Celeste — Explore Lunary Features',
    description:
      'See how Lunary connects birth charts with real astronomical data for personalised cosmic insights.',
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
