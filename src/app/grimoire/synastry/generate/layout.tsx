import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generate Synastry Chart: Compare Birth Charts | Lunary',
  description:
    'Generate a synastry chart to compare two birth charts and discover relationship compatibility, strengths, and growth areas.',
  openGraph: {
    title: 'Generate Synastry Chart | Lunary',
    description:
      'Compare two birth charts to discover relationship compatibility.',
    url: 'https://lunary.app/grimoire/synastry/generate',
    images: [
      {
        url: '/api/og/grimoire/synastry',
        width: 1200,
        height: 630,
        alt: 'Synastry Chart Generator - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generate Synastry Chart | Lunary',
    description:
      'Compare two birth charts to discover relationship compatibility.',
    images: ['/api/og/grimoire/synastry'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/synastry/generate',
  },
};

export default function SynastryGenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
