import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FreeChartClient } from './FreeChartClient';

export const metadata: Metadata = {
  title: 'Free Birth Chart Report | Lunary',
  description:
    'Get a free, capped Lunary birth chart report with your core placements, first pattern, and a direct handoff into your saved chart.',
  alternates: {
    canonical: 'https://lunary.app/free-chart',
  },
  openGraph: {
    title: 'Free Birth Chart Report | Lunary',
    description:
      'Start with the useful pattern in your birth chart, then save the full map in Lunary.',
    url: 'https://lunary.app/free-chart',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Birth Chart Report | Lunary',
    description:
      'Start with the useful pattern in your birth chart, then save the full map in Lunary.',
  },
};

export default function FreeChartPage() {
  return (
    <Suspense fallback={null}>
      <FreeChartClient />
    </Suspense>
  );
}
