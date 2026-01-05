import type { Metadata } from 'next';

import AppDashboardClient from './AppDashboardClient';

const APP_TITLE = 'Lunary | Daily Cosmic Dashboard';
const APP_DESCRIPTION =
  'Stay grounded in real astronomy with Lunary—track moon phases, transits, and personalized insights every day.';

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: 'https://www.lunary.app/app',
    siteName: 'Lunary',
    type: 'website',
    images: [
      {
        url: '/api/og/cosmic?format=landscape',
        width: 1200,
        height: 630,
        alt: 'Lunary cosmic overview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ['/api/og/cosmic?format=landscape'],
  },
};

export default function AppDashboardPage() {
  return <AppDashboardClient />;
}
