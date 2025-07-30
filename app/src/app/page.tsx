import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
// import { HoroscopeWidget } from '@/components/HoroscopeWidget';

export default function Home() {
  return (
    <div className='flex h-fit-content w-full flex-col items-center justify-between gap-4'>
      <AstronomyContextProvider>
        <DateWidget />
        <AstronomyWidget />
        <MoonWidget />
        <TarotWidget />
        {/* <HoroscopeWidget /> */}
      </AstronomyContextProvider>
    </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute
