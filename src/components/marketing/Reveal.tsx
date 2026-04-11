'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { useMotionEnabled } from '@/hooks/useMotionEnabled';
import type { ReactNode, ElementType, CSSProperties } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Delay in milliseconds, useful for staggered siblings */
  delayMs?: number;
  /** Tailwind/CSS class overrides for the wrapper */
  className?: string;
  /** Render as a different element (default: div) */
  as?: ElementType;
  /** Vertical translate distance in px (default 28) */
  distance?: number;
  /**
   * Override intersection root margin.
   *
   * The default (`0px 0px 0px 0px`) triggers the reveal exactly when an
   * element's edge crosses the viewport, so the animation plays out
   * while the element is actually visible. A negative bottom value
   * (e.g. `-10% 0px`) delays the trigger until the element is already
   * partway into view — useful for short elements that would otherwise
   * animate before they're noticed. A positive bottom value expands the
   * root downwards so triggers fire before the element reaches the
   * viewport — useful for small hero-style elements.
   */
  rootMargin?: string;
}

const DURATION_MS = 750;

/**
 * Scroll-reveal wrapper. Fades + translates children into place the first
 * time they cross into view. When the user's device/preferences ask for
 * reduced motion (see {@link useMotionEnabled}), it becomes a pass-through —
 * no observer, no transform, children render in their resting state.
 *
 * Once the entrance animation has finished, all inline transform/opacity
 * styles are cleared so that CSS hover transitions on the same element
 * (e.g. `hover:-translate-y-0.5`) can take effect without fighting the
 * inline style.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
  as: Tag = 'div',
  distance = 28,
  rootMargin = '0px 0px -25% 0px',
}: RevealProps) {
  const motionEnabled = useMotionEnabled();
  const [settled, setSettled] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin,
    skip: !motionEnabled,
  });

  useEffect(() => {
    if (!inView || settled) return;
    const timeout = window.setTimeout(
      () => setSettled(true),
      DURATION_MS + delayMs + 50,
    );
    return () => window.clearTimeout(timeout);
  }, [inView, settled, delayMs]);

  if (!motionEnabled) {
    const StaticTag = Tag as ElementType;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const style: CSSProperties = settled
    ? {}
    : {
        transitionDelay: `${delayMs}ms`,
        transform: inView
          ? 'translate3d(0, 0, 0)'
          : `translate3d(0, ${distance}px, 0)`,
        opacity: inView ? 1 : 0,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${DURATION_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: inView ? 'auto' : 'opacity, transform',
      };

  const AnimatedTag = Tag as ElementType;
  return (
    <AnimatedTag ref={ref} className={cn(className)} style={style}>
      {children}
    </AnimatedTag>
  );
}
