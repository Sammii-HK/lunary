'use client';
import { useAstronomyContext } from '@/context/AstronomyContext';

export const TarotWidget = () => {
  const { currentTarotCard } = useAstronomyContext();

  return (
    <div className="p-5 border border-stone-800 rounded-md">
      <p className="mb-3">{currentTarotCard.name}</p>
      {/* <p className="w-full">{currentTarotCard.keywords.map((keyword: string) => `${keyword} `)}</p> */}
      <p className="mt-3 text-[12px]">{currentTarotCard.information}</p>
    </div>
  );
};