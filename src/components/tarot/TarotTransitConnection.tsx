'use client';

import { useEffect, useState } from 'react';
import type { BirthChartPlacement } from '@/context/UserContext';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import { generateTarotTransitConnection } from '@/lib/tarot/generate-transit-connection';
import type { AstroChartInformation } from '../../../utils/astrology/astrology';

interface TarotTransitConnectionProps {
  cardName: string;
  birthChart: BirthChartPlacement[] | undefined;
  userBirthday: string | undefined;
  currentTransits: AstroChartInformation[];
  variant?: 'compact' | 'inDepth';
}

export function TarotTransitConnection({
  cardName,
  birthChart,
  userBirthday,
  currentTransits,
  variant = 'inDepth',
}: TarotTransitConnectionProps) {
  const [connection, setConnection] = useState<{
    compact: string;
    inDepth: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !birthChart ||
      !birthChart.length ||
      !userBirthday ||
      !cardName ||
      !currentTransits?.length
    ) {
      setConnection(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Calculate transit aspects
    const aspects = calculateTransitAspects(
      birthChart as any,
      currentTransits as any,
    );

    if (aspects.length === 0) {
      setConnection(null);
      setLoading(false);
      return;
    }

    // Convert birth chart to snapshot format
    const birthChartSnapshot = {
      date: userBirthday,
      time: '12:00',
      lat: 0,
      lon: 0,
      placements: birthChart.map((p: any) => ({
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        degree: p.degree,
      })),
    };

    // Generate transit connection
    generateTarotTransitConnection(cardName, birthChartSnapshot, aspects)
      .then((result) => {
        setConnection(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to generate transit connection:', err);
        setConnection(null);
        setLoading(false);
      });
  }, [cardName, birthChart, userBirthday, currentTransits]);

  if (loading) {
    return (
      <div className='mt-4 pt-4 border-t border-zinc-800'>
        <div className='flex items-center gap-2 text-xs text-zinc-500'>
          <div className='w-3 h-3 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin' />
          <span>Calculating chart connections...</span>
        </div>
      </div>
    );
  }

  if (!connection) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className='mt-4 pt-4 border-t border-zinc-800'>
        <p className='text-xs text-lunary-accent-300 leading-relaxed'>
          {connection.compact}
        </p>
      </div>
    );
  }

  // In-depth variant
  return (
    <div className='mt-6 rounded-lg border border-lunary-primary-800/30 bg-lunary-primary-950/20 p-4'>
      <h4 className='text-sm font-medium text-lunary-accent-200 mb-3'>
        In Your Chart Today
      </h4>
      <p className='text-sm text-zinc-300 leading-relaxed'>{connection.inDepth}</p>
    </div>
  );
}
