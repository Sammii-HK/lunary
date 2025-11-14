import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { getMoonSymbol } from '../../utils/moon/moonPhases';
import { LunaryJazzProvider } from '@/components/JazzProvider';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { PWA_MANIFEST_URL } from '@/constants/pwa';
import { ConditionalMainWrapper } from '@/components/ConditionalMainWrapper';
import { StructuredData } from '@/components/StructuredData';
import { AppChrome } from '@/components/AppChrome';

export async function generateMetadata(): Promise<Metadata> {
  let moonSymbol = '🌙';
  try {
    moonSymbol = getMoonSymbol() || '🌙';
  } catch (error) {
    console.error('Failed to get moon symbol:', error);
  }

  return {
    title: `${moonSymbol} Lunary`,
    description:
      'Your Lunar Diary - Astrology based on real astronomical data. Personalized birth chart analysis, daily horoscopes, tarot readings, moon phases, and cosmic guidance. Free 7-day trial - credit card required but no payment taken.',
    manifest: PWA_MANIFEST_URL,
    keywords: [
      'astrology',
      'birth chart',
      'horoscope',
      'moon phases',
      'tarot',
      'astronomy',
      'cosmic guidance',
      'natal chart',
      'planetary transits',
      'lunar calendar',
    ],
    authors: [{ name: 'Lunary' }],
    creator: 'Lunary',
    publisher: 'Lunary',
    alternates: {
      canonical: 'https://lunary.app',
    },
    openGraph: {
      title: 'Lunary - Your Daily Cosmic Guide',
      description:
        'Astrology based on real astronomical data. Personalized birth chart analysis, daily insights, and cosmic guidance.',
      url: 'https://lunary.app',
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: 'Lunary - Your Daily Cosmic Guide',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lunary - Your Daily Cosmic Guide',
      description:
        'Astrology based on real astronomical data. Personalized birth chart analysis and daily insights.',
      images: ['/api/og/cosmic'],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Lunary',
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'Lunary',
      'application-name': 'Lunary',
      'msapplication-TileColor': '#18181b',
      'msapplication-config': '/browserconfig.xml',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#18181b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.className} w-full h-screen flex flex-col align-middle items-center bg-zinc-950 text-white`}
        suppressHydrationWarning
      >
        <StructuredData />
        <ErrorBoundaryWrapper>
          <LunaryJazzProvider>
            <ConditionalMainWrapper>
              <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
              <Analytics />
            </ConditionalMainWrapper>
            <AppChrome />
          </LunaryJazzProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
