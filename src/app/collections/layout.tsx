import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections: Your Cosmic Journal - Lunary',
  description:
    'Save and organize your tarot readings, journal entries, and cosmic insights. Track patterns in your spiritual journey over time.',
  keywords: [
    'astrology journal',
    'tarot journal',
    'cosmic collections',
    'spiritual journal',
    'astrology tracking',
  ],
  alternates: {
    canonical: 'https://lunary.app/collections',
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
