import { Metadata } from 'next';
import FeaturesPage from '@/components/pages/FeaturesPage';

export const metadata: Metadata = {
  title: 'Features | Lunary - Your Complete Cosmic Toolkit',
  description:
    "Explore all Lunary features: daily cosmic dashboard, birth chart calculator, personal horoscopes, tarot spreads, AI chat, pattern tracking, and more. See what's included with each plan.",
  keywords: [
    'lunary features',
    'astrology app features',
    'birth chart calculator',
    'personal horoscope',
    'tarot spreads',
    'astrology chat',
    'pattern tracking',
  ],
  openGraph: {
    title: 'All Features | Lunary',
    description:
      'Your complete cosmic toolkit: daily dashboard, birth chart, horoscopes, tarot, AI chat, journaling, and pattern tracking.',
    url: 'https://lunary.app/features',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Features | Lunary',
    description:
      'Your complete cosmic toolkit: daily dashboard, birth chart, horoscopes, tarot, AI chat, journaling, and pattern tracking.',
  },
  alternates: {
    canonical: 'https://lunary.app/features',
  },
};

export default FeaturesPage;
