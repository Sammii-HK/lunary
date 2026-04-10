'use client';

import { useEffect, useRef } from 'react';
import { useMotionEnabled } from '@/hooks/useMotionEnabled';

/**
 * Thin fixed progress bar at the top of the viewport. Uses a single
 * transform: scaleX update per animation frame, so it stays on the
 * compositor and never touches layout or paint.
 *
 * Renders nothing when motion is gated off.
 */
export function ScrollProgressBar() {
  const motionEnabled = useMotionEnabled();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionEnabled) return;

    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [motionEnabled]);

  if (!motionEnabled) return null;

  return (
    <div
      aria-hidden
      className='fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none'
    >
      <div
        ref={barRef}
        className='h-full w-full bg-lunary-primary-400 origin-left'
        style={{ transform: 'scaleX(0)', willChange: 'transform' }}
      />
    </div>
  );
}
