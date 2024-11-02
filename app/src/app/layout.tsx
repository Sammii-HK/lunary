import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { getMoonSymbol } from '../../utils/moon/moonPhases';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: `${getMoonSymbol()} Lunary`,
  description: 'Your Lunar Diary',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full h-screen flex flex-col align-middle items-center`}>
        <main className='flex flex-col h-full max-w-md w-auto items-center justify-between font-mono text-sm gap-4 overflow-auto p-4 align-self-middle justify-self-center'>
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}
