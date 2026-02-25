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

import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { PWA_MANIFEST_URL } from '@/constants/pwa';
import { ConditionalMainWrapper } from '@/components/ConditionalMainWrapper';
import { StructuredData } from '@/components/StructuredData';
import { AppChrome } from '@/components/AppChrome';
import { AuthStatusProvider } from '@/components/AuthStatus';
import { UserProvider } from '@/context/UserContext';
import { CookieConsent } from '@/components/CookieConsent';
import { AppOpenedTracker } from '@/components/AppOpenedTracker';
import { AttributionCapture } from '@/components/AttributionCapture';
import { AstronomyProviderWrapper } from '@/components/AstronomyProviderWrapper';
import { PostHogProvider } from '@/components/PostHogProvider';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://lunary.app'),
    title: 'Lunary',
    description:
      'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis. 2,000+ free astrology articles.',
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
      title: 'Lunary - Learn to Read Your Own Chart',
      description:
        'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis. 2,000+ free astrology articles.',
      url: 'https://lunary.app',
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: 'Lunary - The astrology app that teaches you to read your own chart',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@LunaryApp',
      title: 'Lunary - Learn to Read Your Own Chart',
      description:
        'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis.',
      images: [
        {
          url: '/api/og/cosmic',
          width: 2400,
          height: 1260,
          alt: 'Lunary - The astrology app that teaches you to read your own chart',
        },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Lunary',
    },
    icons: {
      apple: '/apple-touch-icon.png',
    },
    other: {
      'mobile-web-app-capable': 'yes',
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
        {/* Polyfill crypto.randomUUID for older Android WebViews */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
                crypto.randomUUID = function() {
                  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                  });
                };
              }
            `,
          }}
        />
        {/* Preconnect to critical external services */}
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
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
        {/* Auto-recover from stale chunk errors after deploys */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = (e.message || '') + (e.filename || '');
                if (
                  msg.indexOf('ChunkLoadError') !== -1 ||
                  msg.indexOf('Loading chunk') !== -1 ||
                  msg.indexOf('Failed to fetch dynamically imported module') !== -1 ||
                  (e.filename && e.filename.indexOf('/_next/') !== -1 && e.message && e.message.indexOf('is not a function') !== -1)
                ) {
                  var key = 'lunary_chunk_reload';
                  var last = sessionStorage.getItem(key);
                  var now = Date.now();
                  if (!last || now - parseInt(last, 10) > 10000) {
                    sessionStorage.setItem(key, String(now));
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
        <StructuredData />
        <Suspense fallback={null}>
          <AttributionCapture />
          <AuthStatusProvider>
            <PostHogProvider>
              <ErrorBoundaryWrapper>
                <UserProvider>
                  <AstronomyProviderWrapper>
                    <AppOpenedTracker />
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
                  </AstronomyProviderWrapper>
                </UserProvider>
              </ErrorBoundaryWrapper>
            </PostHogProvider>
          </AuthStatusProvider>
        </Suspense>
      </body>
    </html>
  );
}
