import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { CrystalWidget } from '@/components/CrystalWidget';
import { WheelOfTheYearWidget } from '@/components/WheelOfTheYearWidget';
import { MoonSpellsWidget } from '@/components/MoonSpellsWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
// import { LuckyElements } from '@/components/LuckyElements';

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
      </AstronomyContextProvider>
    </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute
