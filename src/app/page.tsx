import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { CrystalWidget } from '@/components/CrystalWidget';
import { WheelOfTheYearWidget } from '@/components/WheelOfTheYearWidget';
import { MoonSpellsWidget } from '@/components/MoonSpellsWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import EphemerisWidget from '@/components/EphemerisWidget';
import { Metadata } from 'next';
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
    <div className='flex h-fit-content w-full flex-col items-center justify-between gap-4'>
      <AstronomyContextProvider>
        <DateWidget />
        <AstronomyWidget />
        <MoonWidget />
        <HoroscopeWidget />
        {/* <LuckyElements /> */}
        <CrystalWidget />
        <TarotWidget />
        <WheelOfTheYearWidget />
        <MoonSpellsWidget />
        <EphemerisWidget />
      </AstronomyContextProvider>
    </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute
