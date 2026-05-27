import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import WelcomePage from '@/components/pages/WelcomePage';

export const metadata: Metadata = {
  title: 'Astrology That Understands Your Life | Lunary',
  description:
    "Understand why today feels the way it does. Lunary connects today's sky to your full birth chart with real astronomy, transits, tarot, moon phases and free astrology education.",
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
    title: 'Astrology That Understands Your Life | Lunary',
    description:
      "Understand why today feels the way it does. Lunary connects today's sky to your full birth chart with real astronomy, transits, tarot and moon phases.",
    url: 'https://lunary.app',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/homepage',
        width: 1200,
        height: 630,
        alt: 'Lunary - Astrology that understands your life',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrology That Understands Your Life | Lunary',
    description:
      "Understand why today feels the way it does. Lunary connects today's sky to your full birth chart with real astronomy, transits, tarot and moon phases.",
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
  let isAuthenticated = false;

  // Build cookie header string for Better Auth
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Check if user is authenticated. Redirect outside the try block so Next's
  // redirect exception is not swallowed by the unauthenticated fallback.
  try {
    const sessionResponse = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieHeader,
      }),
    });

    // Check if session exists and has user
    const user = sessionResponse?.user;
    isAuthenticated = Boolean(user?.id);
  } catch (error) {
    // Not authenticated or error checking session, continue to show welcome page
    // This is expected for unauthenticated users and Google crawlers
  }

  if (isAuthenticated) {
    // User is authenticated, redirect to app dashboard
    redirect('/app');
  }

  // Show welcome page for unauthenticated users (and Google crawlers)
  return <WelcomePage />;
}
