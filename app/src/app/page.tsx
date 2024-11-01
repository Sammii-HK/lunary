import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
// import { HoroscopeWidget } from '@/components/HoroscopeWidget';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 lg:p-24">
      <div className="z-10 max-w-md w-full h-100 items-center justify-between font-mono text-sm gap-4 grid">
        <AstronomyContextProvider>
          <DateWidget />
          <AstronomyWidget />
          <MoonWidget />
          <TarotWidget />
          <HoroscopeWidget />
        </AstronomyContextProvider>
      </div>
    </main>
  );
}

export const revalidate = 60; // never cache for longer than a minute