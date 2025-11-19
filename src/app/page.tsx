import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import WelcomePage from './welcome/page';

export const metadata: Metadata = {
  title: 'Your AI-Powered Astral Guide | Lunary - Personalized Astrology',
  description:
    "Your AI-powered astral guide for personalized astrology, tarot, and cosmic insight. Built around your birth chart, your energy, and the sky today. Understand today's energy based on your birth chart. Daily tarot, lunar cycles and planetary transits personalized to you.",
  keywords: [
    'AI astrology',
    'personalized astrology',
    'AI astral guide',
    'personalized horoscope',
    'birth chart astrology',
    'tarot readings',
    'lunar cycles',
    'planetary transits',
    'cosmic guidance',
    'astrological insights',
    'personalized tarot',
    'astrology app',
    'natal chart analysis',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app',
  },
  openGraph: {
    title: 'Your AI-Powered Astral Guide | Lunary - Personalized Astrology',
    description:
      'Your AI-powered astral guide for personalized astrology, tarot, and cosmic insight. Built around your birth chart, your energy, and the sky today.',
    url: 'https://lunary.app',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary - Your AI-Powered Astral Guide',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your AI-Powered Astral Guide | Lunary - Personalized Astrology',
    description:
      'Your AI-powered astral guide for personalized astrology, tarot, and cosmic insight. Built around your birth chart, your energy, and the sky today.',
    images: ['/api/og/cosmic'],
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
