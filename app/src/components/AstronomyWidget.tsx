"use client"

import { getCurrentAstrologicalChart, planetSymbol, zodiacSymbol } from "../../utils/zodiac/zodiac";

export const AstronomyWidget = () => {  
  const astrologicalChart = getCurrentAstrologicalChart();

  return (
    <div className="py-5 p-x-2 border border-stone-800 rounded-md grid grid-cols-10">
      <p className="mb-3 col-span-10">Astronomy</p>
      {astrologicalChart.map(({degree, sign, body}, index) => {
        
        return (
          <div key={body} className="col-span-1">
            <div className="flex justify-center flex-col align-middle text-center">
              <p>{planetSymbol[body.toLowerCase() as keyof typeof planetSymbol]}</p>
              <p className="text-xs"><span className="text-[8px]">{degree}°</span> {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
};
