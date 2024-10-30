import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { getMoonSymbol } from '../../utils/moon/moonPhases';

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
