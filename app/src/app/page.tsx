import { TarotWidget } from "@/components/TarotWidget";
import { MoonWidget } from "../components/MoonWidget"
import { AstronomyWidget } from "@/components/AstronomyWidget";
import { DateWidget } from "@/components/DateWidget";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-8 lg:p-24">
			<div className="z-10 max-w-md w-full h-100 items-center justify-between font-mono text-sm gap-4 grid">
        <DateWidget />
        <AstronomyWidget />
        <MoonWidget />
        <TarotWidget />
			</div>
		</main>
	);
}

export const revalidate = 60; // never cache for longer than a minute