import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
// import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between gap-4 ">
      {/* bg-stone-900 bg-neutral-950 */}
      {/* // <div className="flex max-h-screen min-w-full flex-col z-10 max-w-md w-screen min-h-screen items-center justify-between font-mono text-sm gap-4 overflow-auto"> */}
      {/* <div className="z-10 max-w-md w-screen min-h-screen items-center justify-between font-mono text-sm gap-4 overflow-auto"> */}
      {/* <Layout> */}
      <AstronomyContextProvider>
        <DateWidget />
        <AstronomyWidget />
        <MoonWidget />
        <TarotWidget />
        <HoroscopeWidget />
      </AstronomyContextProvider>
      {/* </Layout>  */}
    </div>
    // </div>
  );
}

export const revalidate = 60; // never cache for longer than a minute