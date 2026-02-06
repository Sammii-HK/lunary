import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Birth Chart Analysis - Lunary',
  description:
    'Your complete birth chart analysis with precise planetary positions, houses, aspects, and interpretations.',
  alternates: {
    canonical: 'https://lunary.app/app/birth-chart',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthenticatedBirthChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
