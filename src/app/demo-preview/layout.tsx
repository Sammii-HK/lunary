import { ReactNode } from 'react';
import type { Metadata } from 'next';
import '../globals.css'; // Import your main styles

export const metadata: Metadata = {
  title: 'Demo Preview',
  robots: 'noindex',
};

// Minimal layout for fastest load
export default function DemoPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang='en' className='h-full dark'>
      <body className='h-full m-0 p-0 overflow-hidden bg-zinc-950 text-zinc-50 antialiased'>
        {children}
      </body>
    </html>
  );
}
