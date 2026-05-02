'use client';

import { useEffect, useRef, useState } from 'react';

interface VoiceWaveformProps {
  /** Whether the underlying recognition is actively listening. */
  listening: boolean;
  /**
   * Optional intensity multiplier in `[0, 1]`. Useful if a future audio
   * analyser feeds real volume in. Defaults to 1.
   */
  intensity?: number;
  className?: string;
  /** Number of bars to render. Clamped to [7, 12]. Defaults to 9. */
  barCount?: number;
}

const BAR_WIDTH = 4;
const BAR_GAP = 6;
const VIEWBOX_HEIGHT = 40;
const MAX_BAR_HEIGHT = 32;
const MIN_BAR_HEIGHT = 4;

/**
 * Pure SVG bouncing-bars waveform. No audio analyser required — the bars
 * pseudo-randomly bounce when `listening` is true and gently decay when not,
 * which is a faithful approximation of the iOS Siri / Google Assistant idle
 * waveform without forcing us to wire up an `AudioContext` (which would also
 * require a second mic permission prompt on some browsers).
 */
export function VoiceWaveform({
  listening,
  intensity = 1,
  className = '',
  barCount = 9,
}: VoiceWaveformProps) {
  const clampedCount = Math.max(7, Math.min(12, Math.round(barCount)));
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: clampedCount }, () => MIN_BAR_HEIGHT),
  );
  const rafRef = useRef<number | null>(null);
  const heightsRef = useRef<number[]>(heights);
  heightsRef.current = heights;

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const current = heightsRef.current;
      const next = current.map((h, i) => {
        if (listening) {
          // Per-bar phase produces a coordinated but not synchronous bounce.
          const phase = (Date.now() / 180 + i * 0.7) % (Math.PI * 2);
          const noise = Math.random() * 0.35;
          const wave = (Math.sin(phase) + 1) / 2; // 0..1
          const target =
            MIN_BAR_HEIGHT +
            (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) *
              Math.min(1, Math.max(0.15, wave * 0.85 + noise)) *
              Math.max(0, Math.min(1, intensity));
          // Ease toward the target so motion stays smooth.
          return h + (target - h) * 0.35;
        }
        // Gentle decay back to rest.
        return h + (MIN_BAR_HEIGHT - h) * 0.15;
      });
      setHeights(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [listening, intensity]);

  const totalWidth = clampedCount * BAR_WIDTH + (clampedCount - 1) * BAR_GAP;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role='presentation'
      aria-hidden='true'
    >
      <svg
        viewBox={`0 0 ${totalWidth} ${VIEWBOX_HEIGHT}`}
        width={totalWidth}
        height={VIEWBOX_HEIGHT}
        className='overflow-visible'
      >
        {heights.map((h, i) => {
          const x = i * (BAR_WIDTH + BAR_GAP);
          const y = (VIEWBOX_HEIGHT - h) / 2;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={h}
              rx={BAR_WIDTH / 2}
              ry={BAR_WIDTH / 2}
              className={
                listening ? 'fill-lunary-primary' : 'fill-lunary-primary/40'
              }
            />
          );
        })}
      </svg>
    </div>
  );
}

export default VoiceWaveform;
