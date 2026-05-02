'use client';

import { motion } from 'motion/react';
import classNames from 'classnames';
import type { CSSProperties } from 'react';

type SkeletonVariant = 'circle' | 'rect' | 'text';

interface CosmicSkeletonProps {
  variant?: SkeletonVariant;
  /** Pixels or any valid CSS length. Defaults vary per variant. */
  width?: number | string;
  height?: number | string;
  /** Border radius override (px or CSS length). Ignored for circle. */
  radius?: number | string;
  className?: string;
  /** Tailwind class for accessibility label, defaults to 'Loading content'. */
  label?: string;
}

function toCss(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

/**
 * Cosmic-tinted skeleton with a gradient shimmer overlay.
 * Replaces grey skeletons with a subtle violet wash.
 */
export function CosmicSkeleton({
  variant = 'rect',
  width,
  height,
  radius,
  className,
  label = 'Loading content',
}: CosmicSkeletonProps) {
  const baseStyle: CSSProperties = {};

  if (variant === 'circle') {
    const size = toCss(width ?? height ?? 40);
    baseStyle.width = size;
    baseStyle.height = size;
    baseStyle.borderRadius = '9999px';
  } else if (variant === 'text') {
    baseStyle.width = toCss(width ?? '100%');
    baseStyle.height = toCss(height ?? 12);
    baseStyle.borderRadius = toCss(radius ?? 4);
  } else {
    // rect
    baseStyle.width = toCss(width ?? '100%');
    baseStyle.height = toCss(height ?? 80);
    baseStyle.borderRadius = toCss(radius ?? 12);
  }

  return (
    <span
      role='status'
      aria-label={label}
      aria-busy='true'
      className={classNames(
        'relative block overflow-hidden bg-surface-elevated/40',
        className,
      )}
      style={baseStyle}
    >
      <motion.span
        aria-hidden='true'
        className='absolute inset-0 block bg-gradient-to-r from-transparent via-lunary-primary/10 to-transparent'
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 0.2,
        }}
      />
      <span className='sr-only'>{label}</span>
    </span>
  );
}

export default CosmicSkeleton;
