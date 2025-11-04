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
    <div className='flex h-fit-content w-full flex-col gap-6 max-w-7xl'>
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
          {/* Mobile order: Moon, Tarot, Crystal, Horoscope, Wheel, Spells, Ephemeris */}
          {/* Desktop: Natural flow - Col1: Moon, Tarot, Wheel. Col2: Crystal, Horoscope, Spells */}
          <div>
            <MoonWidget />
          </div>
          <div className='md:col-start-2'>
            <CrystalWidget />
          </div>
          <div>
            <TarotWidget />
          </div>
          <div className='md:col-start-2'>
            <HoroscopeWidget />
          </div>
          <ConditionalWheel />
          <div>
            <MoonSpellsWidget />
          </div>
          <div>
            <EphemerisWidget />
          </div>
        </div>
      </AstronomyContextProvider>
    </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute
