'use client';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useEffect } from 'react';

export const MoonConstellation = ({}: {}) => {
  const { currentMoonConstellationPosition, currentMoonPhase, symbol } =
    useAstronomyContext();
  useEffect(() => {}, [currentMoonConstellationPosition]);
  return (
    <div>
      <p className='self-center'>
        {symbol} {currentMoonPhase}{' '}
        {currentMoonConstellationPosition && (
          <> in {currentMoonConstellationPosition}</>
        )}
      </p>
    </div>
  );
};
