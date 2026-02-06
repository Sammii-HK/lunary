import { Metadata } from 'next';
import FeaturesPage from '@/components/pages/FeaturesPage';

export const metadata: Metadata = {
  title: 'Features | Lunary - Your Complete Cosmic Toolkit',
  description:
    'Complete astrology toolkit: birth charts, full synastry analysis, pattern recognition, tarot spreads, transit calendar with durations, and 2,000+ free educational articles. Learn to read your own chart.',
  keywords: [
    'lunary features',
    'astrology app features',
    'birth chart calculator',
    'synastry analysis',
    'astrology compatibility',
    'personal horoscope',
    'tarot spreads',
    'astrology chat',
    'pattern tracking',
    'transit durations',
    'relationship astrology',
    'best times to connect',
    'cosmic circle',
  ],
  openGraph: {
    title: 'All Features | Lunary',
    description:
      'Complete astrology toolkit: birth charts, synastry analysis, pattern recognition, tarot, transit calendar, and 2,000+ free articles. Learn by doing.',
    url: 'https://lunary.app/features',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Features | Lunary',
    description:
      'Complete astrology toolkit: birth charts, synastry analysis, pattern recognition, tarot, transit calendar, and 2,000+ free articles. Learn by doing.',
  },
  alternates: {
    canonical: 'https://lunary.app/features',
  },
};

export default FeaturesPage;
