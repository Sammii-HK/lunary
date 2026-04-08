'use client';

import React, { useEffect, useState } from 'react';
import type { Aspect } from '@/hooks/useAspects';
import classNames from 'classnames';
import styles from './BirthChart.module.css';

const cx = classNames;

interface AspectLinesProps {
  aspects: Aspect[];
  visible?: boolean;
  highlightedPlanet?: string | null;
  opacity?: number;
  onAspectClick?: (aspect: Aspect) => void;
}

export function AspectLines({
  aspects,
  visible = true,
  highlightedPlanet = null,
  opacity = 0.15,
  onAspectClick,
}: AspectLinesProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect dark mode from prefers-color-scheme or html class
    const checkDarkMode = () => {
      const prefersDark =
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      setIsDarkMode(prefersDark);
    };

    checkDarkMode();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    // Listen for class changes (theme toggle)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  if (!visible) return null;

  // Use higher opacity for dark mode so lines are visible
  const baseOpacity = isDarkMode ? 0.35 : opacity;

  return (
    <g className='aspect-lines'>
      {aspects.map((aspect, i) => {
        const { planet1, planet2, color, type, x1, y1, x2, y2 } = aspect;
        const isHighlighted =
          highlightedPlanet === planet1 || highlightedPlanet === planet2;
        const lineOpacity = isHighlighted ? 0.6 : baseOpacity;

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
            className={cx(
              'transition-all duration-200 cursor-pointer hover:opacity-100',
              styles.aspectLine,
              {
                [styles.highlighted]: isHighlighted,
              },
            )}
            onClick={() => onAspectClick?.(aspect)}
          />
        );
      })}
    </g>
  );
}
