import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import WelcomePage from './welcome/page';

export const metadata: Metadata = {
  title: 'Lunary: Personal Astrology App | Birth Chart, Horoscopes & Tarot',
  description:
    'Your personal astrology companion. Daily horoscopes, birth chart analysis, tarot readings & moon phases based on real astronomy. AI-powered insights from your natal chart. Free to start.',
  keywords: [
    'personalised astrology app',
    'birth chart astrology',
    'AI astrology',
    'tarot and astrology app',
    'moon phase astrology',
    'daily astrology based on birth chart',
    'intelligent astrology',
    'spiritual self reflection app',
    'personalized horoscope',
    'lunar cycles',
    'planetary transits',
    'cosmic guidance',
    'natal chart analysis',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app',
  },
  openGraph: {
    title: 'Lunary: Your Personal Astrology Companion',
    description:
      'Daily guidance based on your birth chart, the sky today and intelligent insight. No generic horoscopes. Only clarity.',
    url: 'https://lunary.app',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/homepage',
        width: 1200,
        height: 630,
        alt: 'Lunary - Personalised astrology for clarity and self understanding',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary: Your Personal Astrology Companion',
    description:
      'Daily guidance based on your birth chart, the sky today and intelligent insight. No generic horoscopes. Only clarity.',
    images: ['/api/og/homepage'],
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
};

export default async function HomePage() {
  const cookieStore = await cookies();

  // Build cookie header string for Better Auth
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    // Check if user is authenticated
    const sessionResponse = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieHeader,
      }),
    });

    // Check if session exists and has user
    const user = sessionResponse?.user;

    if (user?.id) {
      // User is authenticated, redirect to app dashboard
      redirect('/app');
    }
  } catch (error) {
    // Not authenticated or error checking session, continue to show welcome page
    // This is expected for unauthenticated users and Google crawlers
  }

  // Show welcome page for unauthenticated users (and Google crawlers)
  return <WelcomePage />;
}
