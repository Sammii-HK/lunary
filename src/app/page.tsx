import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import WelcomePage from '@/components/pages/WelcomePage';

export const metadata: Metadata = {
  title: 'Personalized Astrology App for Your Birth Chart | Lunary',
  description:
    'Get daily horoscopes, tarot readings, and cosmic insights from your exact birth chart. Real astronomical data, not generic zodiac signs. Free 7-day trial.',
  keywords: [
    'personalized astrology',
    'birth chart astrology',
    'personalized horoscope',
    'daily horoscopes',
    'tarot readings',
    'cosmic insights',
    'real astronomical data',
    'astrology app',
    'natal chart analysis',
    'planetary transits',
    'cosmic guidance',
    'astral guide',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app',
  },
  openGraph: {
    title: 'Personalized Astrology App for Your Birth Chart | Lunary',
    description:
      'Get daily horoscopes, tarot readings, and cosmic insights from your exact birth chart. Real astronomical data, not generic zodiac signs.',
    url: 'https://lunary.app',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/homepage',
        width: 1200,
        height: 630,
        alt: 'Lunary - Personalized Astrology App for Your Birth Chart',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personalized Astrology App for Your Birth Chart | Lunary',
    description:
      'Get daily horoscopes, tarot readings, and cosmic insights from your exact birth chart. Real astronomical data, not generic zodiac signs.',
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
