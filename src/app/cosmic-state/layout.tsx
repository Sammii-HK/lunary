import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cosmic State: Your Personal Astrological Dashboard - Lunary',
  description:
    'Real-time cosmic influences on your birth chart. See how current transits, moon phases, and planetary positions affect you personally today.',
  keywords: [
    'cosmic state',
    'personal astrology dashboard',
    'current transits',
    'astrology today',
    'birth chart transits',
  ],
  alternates: {
    canonical: 'https://lunary.app/cosmic-state',
  },
};

export default function CosmicStateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
