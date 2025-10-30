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

export const metadata: Metadata = {
  title: `${getMoonSymbol()} Lunary`,
  description: 'Your Lunar Diary',
  manifest: '/manifest.json',
  themeColor: '#18181b',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
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
        <LunaryJazzProvider>
          <main className='flex flex-col h-full max-w-md w-full items-center justify-between font-mono text-sm gap-4 overflow-auto px-4 align-self-middle justify-self-center'>
            {children}
            <Analytics />
          </main>
          <Navbar />
          <PWAHandler />
          <NotificationManager />
        </LunaryJazzProvider>
      </body>
    </html>
  );
}
