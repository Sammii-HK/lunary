import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { CrystalWidget } from '@/components/CrystalWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';

export default function Home() {
  return (
    <div className='flex h-fit-content w-full flex-col items-center justify-between gap-4'>
      <AstronomyContextProvider>
        <DateWidget />
        <AstronomyWidget />
        <MoonWidget />
        <HoroscopeWidget />
        <CrystalWidget />
        <TarotWidget />
      </AstronomyContextProvider>
    </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute
