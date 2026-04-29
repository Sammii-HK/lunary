'use client';

import { motion } from 'motion/react';
import classNames from 'classnames';

type Size = 'sm' | 'md' | 'lg';

interface CosmicSpinnerProps {
  size?: Size;
  className?: string;
  /** Optional accessible label. Defaults to 'Loading'. */
  label?: string;
}

const SIZE_PX: Record<Size, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

/**
 * Tiny SVG spinner — three orbiting "planet" dots on different rings.
 * Self-contained, themed with Lunary tokens, mobile-first.
 */
export function CosmicSpinner({
  size = 'md',
  className,
  label = 'Loading',
}: CosmicSpinnerProps) {
  const px = SIZE_PX[size];
  // ViewBox is fixed at -50..50 so geometry stays crisp at every size.
  return (
    <span
      role='status'
      aria-label={label}
      className={classNames(
        'inline-block align-middle text-lunary-primary',
        className,
      )}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox='-50 -50 100 100'
        width={px}
        height={px}
        aria-hidden='true'
        focusable='false'
      >
        {/* Faint orbit rings */}
        <circle
          cx='0'
          cy='0'
          r='36'
          fill='none'
          stroke='currentColor'
          strokeOpacity='0.18'
          strokeWidth='1'
        />
        <circle
          cx='0'
          cy='0'
          r='24'
          fill='none'
          stroke='currentColor'
          strokeOpacity='0.14'
          strokeWidth='1'
        />
        <circle
          cx='0'
          cy='0'
          r='12'
          fill='none'
          stroke='currentColor'
          strokeOpacity='0.10'
          strokeWidth='1'
        />

        {/* Outer planet — slowest */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx='36' cy='0' r='3.4' fill='currentColor' />
        </motion.g>

        {/* Middle planet — medium */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx='0' cy='-24' r='2.6' fill='currentColor' opacity='0.85' />
        </motion.g>

        {/* Inner planet — fastest */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx='-12' cy='0' r='1.8' fill='currentColor' opacity='0.7' />
        </motion.g>
      </svg>
      <span className='sr-only'>{label}</span>
    </span>
  );
}

export default CosmicSpinner;
