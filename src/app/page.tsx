import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import WelcomePage from '@/components/pages/WelcomePage';

export const metadata: Metadata = {
  title:
    'Lunary: Learn to Read Your Birth Chart | Astrology App with Pattern Tracking',
  description:
    'Learn to read your own birth chart through daily practice. Track patterns, interpret transits, and understand relationships with full synastry analysis. 2,000+ free astrology articles.',
  keywords: [
    'learn astrology app',
    'birth chart reading',
    'astrology pattern tracking',
    'synastry analysis app',
    'relationship astrology',
    'transit tracking',
    'personalised astrology app',
    'birth chart astrology',
    'daily astrology based on birth chart',
    'personalized horoscope',
    'lunar cycles',
    'planetary transits',
    'cosmic guidance',
    'natal chart analysis',
    'best times to connect',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  alternates: {
    canonical: 'https://lunary.app',
  },
  openGraph: {
    title: 'Lunary: The Astrology App That Teaches You to Read Your Chart',
    description:
      'Track how planets affect YOU specifically. Pattern recognition, full synastry analysis, and 2,000+ free articles. After 2-3 months, interpret transits without generic predictions.',
    url: 'https://lunary.app',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/homepage',
        width: 1200,
        height: 630,
        alt: 'Lunary - Learn to read your own birth chart',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary: The Astrology App That Teaches You to Read Your Chart',
    description:
      'Track how planets affect YOU specifically. Pattern recognition, full synastry analysis, and 2,000+ free articles. After 2-3 months, interpret transits without generic predictions.',
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
