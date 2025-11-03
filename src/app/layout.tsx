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
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PWADebugInline } from '@/components/PWADebugInline';
import { PWAInstallGuard } from '@/components/PWAInstallGuard';

export async function generateMetadata(): Promise<Metadata> {
  let moonSymbol = '🌙';
  try {
    moonSymbol = getMoonSymbol() || '🌙';
  } catch (error) {
    console.error('Failed to get moon symbol:', error);
  }

  return {
    title: `${moonSymbol} Lunary`,
    description: 'Your Lunar Diary',
    manifest: '/manifest.json',
    themeColor: '#18181b',
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
        <ErrorBoundary>
          <LunaryJazzProvider>
            <main className='flex flex-col h-full max-w-md w-full items-center justify-between font-mono text-sm gap-4 overflow-auto px-4 align-self-middle justify-self-center'>
              <ErrorBoundary>{children}</ErrorBoundary>
              <Analytics />
            </main>
            <Navbar />
            <ErrorBoundary>
              <PWAInstallGuard />
              <PWAHandler />
              <NotificationManager />
              <PWADebugInline />
            </ErrorBoundary>
          </LunaryJazzProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
