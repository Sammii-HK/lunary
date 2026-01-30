import React from 'react';
import type { Aspect } from '@/hooks/useAspects';

interface AspectLinesProps {
  aspects: Aspect[];
  visible?: boolean;
  highlightedPlanet?: string | null;
  opacity?: number;
}

export function AspectLines({
  aspects,
  visible = true,
  highlightedPlanet = null,
  opacity = 0.15,
}: AspectLinesProps) {
  if (!visible) return null;

  return (
    <g className='aspect-lines'>
      {aspects.map(({ planet1, planet2, color, type, x1, y1, x2, y2 }, i) => {
        const isHighlighted =
          highlightedPlanet === planet1 || highlightedPlanet === planet2;
        const lineOpacity = isHighlighted ? 0.6 : opacity;

        return (
          <line
            key={`aspect-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={isHighlighted ? 1.5 : 1}
            opacity={lineOpacity}
            className='transition-all duration-200'
          />
        );
      })}
    </g>
  );
}
