import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Lunary - Frequently Asked Questions',
  description:
    'Find answers to common questions about Lunary: how it works, features, pricing, privacy, patterns, and more. Comprehensive searchable FAQ covering everything from getting started to advanced astrology features.',
  keywords: [
    'lunary faq',
    'astrology app questions',
    'how lunary works',
    'lunary features explained',
    'birth chart questions',
    'personal astrology help',
    'lunary pricing',
    'pattern recognition astrology',
    'tarot readings faq',
    'astrology privacy',
  ],
  openGraph: {
    title: 'Frequently Asked Questions | Lunary',
    description:
      'Get answers to all your questions about Lunary—from getting started to advanced features, pricing, privacy, and patterns.',
    url: 'https://lunary.app/faq',
    siteName: 'Lunary',
    type: 'website',
    images: [
      {
        url: 'https://lunary.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lunary - Personal Astrology & Daily Cosmic Guidance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Lunary',
    description:
      'Get answers to all your questions about Lunary—from getting started to advanced features.',
    images: ['https://lunary.app/og-image.png'],
  },
  alternates: {
    canonical: 'https://lunary.app/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
