import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Roboto_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import './globals.css';

const roboto = Roboto_Mono({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const astronomicon = localFont({
  src: '../fonts/Astronomicon.ttf',
  variable: '--font-astro',
  display: 'swap',
});

import { getMoonSymbol } from '../../utils/moon/moonPhases';
import { LunaryJazzProvider } from '@/components/JazzProvider';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { PWA_MANIFEST_URL } from '@/constants/pwa';
import { ConditionalMainWrapper } from '@/components/ConditionalMainWrapper';
import { StructuredData } from '@/components/StructuredData';
import { AppChrome } from '@/components/AppChrome';
import { PostHogProvider } from '@/components/PostHogProvider';
import { AuthStatusProvider } from '@/components/AuthStatus';
import { UserProvider } from '@/context/UserContext';
import { CookieConsent } from '@/components/CookieConsent';

export async function generateMetadata(): Promise<Metadata> {
  let moonSymbol = '🌙';
  try {
    moonSymbol = getMoonSymbol() || '🌙';
  } catch (error) {
    console.error('Failed to get moon symbol:', error);
  }

  return {
    metadataBase: new URL('https://lunary.app'),
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
      'ai-content-declaration': 'https://lunary.app/llms.txt',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#18181b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Preconnect to critical external services */}
        <link rel='preconnect' href='https://eu.i.posthog.com' />
        <link rel='preconnect' href='https://api.stripe.com' />
        <link rel='preconnect' href='https://js.stripe.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
        {/* Preload hero image for LCP optimization */}
        <link
          rel='preload'
          href='/lunary_hero.png'
          as='image'
          type='image/png'
        />
        {/* Prefetch API endpoint for app dashboard */}
        <link
          rel='prefetch'
          href='/api/cosmic/global'
          as='fetch'
          crossOrigin='anonymous'
        />
      </head>
      <body
        className={`${roboto.className} ${astronomicon.variable} flex flex-col w-full h-dvh bg-zinc-950 text-white overflow-hidden`}
        suppressHydrationWarning
      >
        <StructuredData />
        <Suspense fallback={null}>
          <PostHogProvider>
            <ErrorBoundaryWrapper>
              <LunaryJazzProvider>
                <AuthStatusProvider>
                  <UserProvider>
                    <Suspense
                      fallback={
                        <main className='flex flex-col flex-1 w-full min-h-0 h-[calc(100vh-4rem)]'>
                          {children}
                        </main>
                      }
                    >
                      <ConditionalMainWrapper>
                        <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
                        <Analytics />
                        <SpeedInsights />
                      </ConditionalMainWrapper>
                    </Suspense>
                    <Suspense fallback={null}>
                      <AppChrome />
                    </Suspense>
                    <CookieConsent />
                  </UserProvider>
                </AuthStatusProvider>
              </LunaryJazzProvider>
            </ErrorBoundaryWrapper>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
