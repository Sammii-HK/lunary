import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { CrystalWidget } from '@/components/CrystalWidget';
import { MoonSpellsWidget } from '@/components/MoonSpellsWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import EphemerisWidget from '@/components/EphemerisWidget';
import { Metadata } from 'next';
import ConditionalWheel from '@/components/ConditionalWheel';
// import { LuckyElements } from '@/components/LuckyElements';

export const metadata: Metadata = {
  title: 'Lunary - Your Daily Cosmic Guide',
  description:
    "Discover today's cosmic alignments, moon phases, planetary positions, and personalized astrological insights.",
  openGraph: {
    title: 'Lunary - Your Daily Cosmic Guide',
    description:
      "Discover today's cosmic alignments, moon phases, and personalized astrological insights.",
    url: 'https://lunary.app',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: "Today's Cosmic Alignments - Lunary",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary - Your Daily Cosmic Guide',
    description:
      "Discover today's cosmic alignments, moon phases, and personalized astrological insights.",
    images: ['/api/og/cosmic'],
  },
};

export default function Home() {
  return (
    <div className='flex h-fit-content w-full flex-col gap-6 max-w-7xl mx-auto px-4'>
      <AstronomyContextProvider>
        {/* Top Row - Date and Astronomy (always full width) */}
        <div className='w-full space-y-4'>
          <DateWidget />
          <AstronomyWidget />
        </div>

        {/* Main Content Grid - Responsive 2-Column Layout */}
        {/* Mobile: Single column maintains natural order */}
        {/* Desktop: 2 columns - flows naturally */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full'>
          <div className='flex flex-col h-full'>
            <MoonWidget />
          </div>
          <div className='flex flex-col h-full'>
            <CrystalWidget />
          </div>
          <div className='flex flex-col h-full'>
            <TarotWidget />
          </div>
          <div className='flex flex-col h-full'>
            <HoroscopeWidget />
          </div>
          <ConditionalWheel />
          <div className='flex flex-col h-full'>
            <MoonSpellsWidget />
          </div>
          <div className='flex flex-col h-full'>
            <EphemerisWidget />
          </div>
        </div>
      </AstronomyContextProvider>
    </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute
