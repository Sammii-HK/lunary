'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Aspect } from '@/hooks/useAspects';

interface AspectLinesProps {
  aspects: Aspect[];
  visible?: boolean;
  highlightedPlanet?: string | null;
  opacity?: number;
  onAspectClick?: (aspect: Aspect) => void;
  innerRadius?: number;
}

const HARMONIOUS = new Set(['Trine', 'Sextile', 'Conjunction']);

function aspectPath(a: Aspect, innerRadius: number) {
  const { x1, y1, x2, y2, type } = a;

  if (type === 'Conjunction') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const dist = Math.hypot(x2 - x1, y2 - y1);

  const harmonious = HARMONIOUS.has(type);
  const bulge = harmonious ? dist * 0.12 : -dist * 0.06;

  const fromCenter = Math.hypot(mx, my) || 1;
  const cx = mx + (-mx / fromCenter) * bulge;
  const cy = my + (-my / fromCenter) * bulge;

  const r = innerRadius;
  const scale1 = Math.min(1, r / (Math.hypot(x1, y1) || 1));
  const scale2 = Math.min(1, r / (Math.hypot(x2, y2) || 1));
  const sx = x1 * scale1;
  const sy = y1 * scale1;
  const ex = x2 * scale2;
  const ey = y2 * scale2;

  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
}

export function AspectLines({
  aspects,
  visible = true,
  highlightedPlanet = null,
  opacity = 0.3,
  onAspectClick,
  innerRadius = 60,
}: AspectLinesProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const check = () => {
      const prefersDark =
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      setIsDarkMode(prefersDark);
    };
    check();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', check);
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true });
    return () => {
      mq.removeEventListener('change', check);
      obs.disconnect();
    };
  }, []);

  if (!visible) return null;

  const baseOpacity = isDarkMode ? Math.max(0.35, opacity) : opacity;

  return (
    <g className='aspect-lines'>
      <AnimatePresence>
        {aspects.map((aspect, i) => {
          const { planet1, planet2, color, orb, type } = aspect;
          const selected = highlightedPlanet != null;
          const isHighlighted =
            highlightedPlanet === planet1 || highlightedPlanet === planet2;
          const lineOpacity = selected
            ? isHighlighted
              ? 0.85
              : 0.05
            : baseOpacity;
          const isTight = orb < 1.5;
          const d = aspectPath(aspect, innerRadius);
          const key = `${planet1}-${planet2}-${type}`;

          return (
            <motion.g key={key} style={{ pointerEvents: 'all' }}>
              {isTight && (
                <motion.path
                  d={d}
                  fill='none'
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap='round'
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.08, 0.22, 0.08],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ filter: 'blur(1.8px)' }}
                />
              )}
              <motion.path
                d={d}
                fill='none'
                stroke={color}
                strokeWidth={isHighlighted ? 1.6 : isTight ? 1.2 : 0.9}
                strokeLinecap='round'
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: lineOpacity }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{
                  pathLength: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.35 },
                }}
                onClick={() => onAspectClick?.(aspect)}
                style={{ cursor: 'pointer' }}
              />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </g>
  );
}
