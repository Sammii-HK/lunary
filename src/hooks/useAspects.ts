import { useMemo } from 'react';
import type { BirthChartData } from '../../utils/astrology/birthChart';

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  color: string;
  orb: number;
  angle1: number;
  x1: number;
  y1: number;
  angle2: number;
  x2: number;
  y2: number;
}

interface AspectChartData extends BirthChartData {
  angle?: number;
  x?: number;
  y?: number;
}

const MAJOR_ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8, color: '#C77DFF' },
  { name: 'Opposition', angle: 180, orb: 8, color: '#ffd6a3' },
  { name: 'Trine', angle: 120, orb: 6, color: '#7BFFB8' },
  { name: 'Square', angle: 90, orb: 6, color: '#f87171' },
  { name: 'Sextile', angle: 60, orb: 4, color: '#94d1ff' },
];

export function useAspects(birthChart: AspectChartData[]): Aspect[] {
  return useMemo(() => {
    const aspects: Aspect[] = [];

    // Only calculate aspects for bodies with position data
    const validBodies = birthChart.filter(
      (body) =>
        body.x !== undefined &&
        body.y !== undefined &&
        body.angle !== undefined,
    );

    for (let i = 0; i < validBodies.length; i++) {
      for (let j = i + 1; j < validBodies.length; j++) {
        const planet1 = validBodies[i];
        const planet2 = validBodies[j];

        let diff = Math.abs(
          planet1.eclipticLongitude - planet2.eclipticLongitude,
        );
        if (diff > 180) diff = 360 - diff;

        for (const aspect of MAJOR_ASPECTS) {
          const orb = Math.abs(diff - aspect.angle);
          if (orb <= aspect.orb) {
            aspects.push({
              planet1: planet1.body,
              planet2: planet2.body,
              type: aspect.name,
              color: aspect.color,
              orb,
              angle1: planet1.angle!,
              x1: planet1.x!,
              y1: planet1.y!,
              angle2: planet2.angle!,
              x2: planet2.x!,
              y2: planet2.y!,
            });
            break;
          }
        }
      }
    }

    return aspects;
  }, [birthChart]);
}

export function isHarmoniousAspect(aspectType: string): boolean {
  return ['Trine', 'Sextile', 'Conjunction'].includes(aspectType);
}

export function isChallengingAspect(aspectType: string): boolean {
  return ['Square', 'Opposition'].includes(aspectType);
}
