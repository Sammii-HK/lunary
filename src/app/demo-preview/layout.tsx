import { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Demo Preview',
  robots: 'noindex',
  other: {
    // Edge caching for fast global delivery
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },
};

// Override root layout to prevent font class hydration issues
export default function DemoPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* Preload critical resources */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='dns-prefetch' href='https://fonts.googleapis.com' />

      {/* Preload critical fonts if you have them */}
      {/* <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      /> */}

      {/* Performance monitoring */}
      <Script id='perf-mark' strategy='beforeInteractive'>
        {`
          if (typeof performance !== 'undefined') {
            performance.mark('demo-page-start');
          }
        `}
      </Script>

      <div className='h-screen w-screen overflow-hidden bg-zinc-950'>
        {children}
      </div>
    </>
  );
}
