import { Metadata } from 'next';
import CirclePage from '@/components/pages/CirclePage';

export const metadata: Metadata = {
  title: 'Cosmic Circle | Lunary - Connect, Compare Charts & Find Best Times',
  description:
    'Connect with friends and see how your charts interact. Full synastry analysis, Best Times to Connect, and Shared Cosmic Events. Know when cosmic timing supports connection.',
  keywords: [
    'astrology friends',
    'synastry analysis',
    'relationship astrology',
    'astrology compatibility',
    'best times to connect',
    'cosmic circle',
    'chart comparison',
    'synastry aspects',
    'relationship timing',
    'astrology social',
  ],
  openGraph: {
    title: 'Cosmic Circle | Connect & Compare Charts',
    description:
      'Connect with friends and see how your charts interact. Full synastry analysis, Best Times to Connect, and Shared Cosmic Events.',
    url: 'https://lunary.app/circle',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Circle | Connect & Compare Charts',
    description:
      'Connect with friends and see how your charts interact. Full synastry analysis, Best Times to Connect, and Shared Cosmic Events.',
  },
  alternates: {
    canonical: 'https://lunary.app/circle',
  },
};

export default CirclePage;
