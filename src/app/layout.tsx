import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { getMoonSymbol } from '../../utils/moon/moonPhases';
import { Navbar } from '@/components/Navbar';
import { LunaryJazzProvider } from '@/components/JazzProvider';
import { PWAHandler } from '@/components/PWAHandler';
import { NotificationManager } from '@/components/NotificationManager';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { PWA_MANIFEST_URL } from '@/constants/pwa';
import { ConditionalMainWrapper } from '@/components/ConditionalMainWrapper';
import { StructuredData } from '@/components/StructuredData';

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
      'Your Lunar Diary - Astrology based on real astronomical data. Personalized birth chart analysis, daily insights, and cosmic guidance.',
    manifest: PWA_MANIFEST_URL,
    themeColor: '#18181b',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${inter.className} w-full h-screen flex flex-col align-middle items-center bg-zinc-950 text-white`}
      >
        <StructuredData />
        <ErrorBoundaryWrapper>
          <LunaryJazzProvider>
            <ConditionalMainWrapper>
              <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
              <Analytics />
            </ConditionalMainWrapper>
            <Navbar />
            <ErrorBoundaryWrapper>
              <PWAHandler />
              <NotificationManager />
            </ErrorBoundaryWrapper>
          </LunaryJazzProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
