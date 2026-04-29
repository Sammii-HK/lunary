'use client';

import { motion } from 'motion/react';
import classNames from 'classnames';
import type { ReactNode } from 'react';

type EmptyVariant =
  | 'birthtime'
  | 'friends'
  | 'journal'
  | 'transits'
  | 'generic';

interface EmptyStateProps {
  /** Optional custom icon. If omitted, the variant's themed SVG is used. */
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: EmptyVariant;
  className?: string;
}

/**
 * Generic empty-state card with cosmic-themed hero illustrations per variant.
 * All copy passed in is rendered as-is — keep it warm, not generic.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'generic',
  className,
}: EmptyStateProps) {
  const hero = icon ?? <VariantHero variant={variant} />;

  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center text-center',
        'rounded-2xl border border-stroke-subtle bg-surface-elevated/60',
        'px-5 py-7 sm:px-7 sm:py-9',
        'gap-4 sm:gap-5',
        className,
      )}
    >
      <div className='flex items-center justify-center text-lunary-primary'>
        {hero}
      </div>
      <div className='space-y-1.5 max-w-sm'>
        <h3 className='text-base sm:text-lg font-medium text-content-primary'>
          {title}
        </h3>
        <p className='text-sm text-content-secondary leading-relaxed'>
          {description}
        </p>
      </div>
      {action && (
        <button
          type='button'
          onClick={action.onClick}
          className={classNames(
            'inline-flex items-center justify-center',
            'rounded-full px-5 py-2 text-sm font-medium',
            'bg-lunary-primary text-white',
            'shadow-sm hover:bg-lunary-primary-600 active:bg-lunary-primary-700',
            'transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant heroes — small, gently animated SVGs.                       */
/* ------------------------------------------------------------------ */

function VariantHero({ variant }: { variant: EmptyVariant }) {
  switch (variant) {
    case 'birthtime':
      return <BirthtimeHero />;
    case 'friends':
      return <FriendsHero />;
    case 'journal':
      return <JournalHero />;
    case 'transits':
      return <TransitsHero />;
    case 'generic':
    default:
      return <GenericHero />;
  }
}

function BirthtimeHero() {
  return (
    <svg
      viewBox='-40 -40 80 80'
      width='84'
      height='84'
      aria-hidden='true'
      focusable='false'
    >
      <motion.circle
        cx='0'
        cy='0'
        r='30'
        fill='none'
        stroke='currentColor'
        strokeOpacity='0.35'
        strokeWidth='1.5'
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* clock ticks */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = Math.cos(rad) * 26;
        const y1 = Math.sin(rad) * 26;
        const x2 = Math.cos(rad) * 30;
        const y2 = Math.sin(rad) * 30;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke='currentColor'
            strokeOpacity='0.55'
            strokeWidth='1.2'
            strokeLinecap='round'
          />
        );
      })}
      {/* question mark */}
      <motion.text
        x='0'
        y='6'
        textAnchor='middle'
        fontSize='22'
        fontWeight='600'
        fill='currentColor'
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ?
      </motion.text>
    </svg>
  );
}

function FriendsHero() {
  return (
    <svg
      viewBox='-50 -30 100 60'
      width='110'
      height='66'
      aria-hidden='true'
      focusable='false'
    >
      <motion.line
        x1='-28'
        y1='0'
        x2='28'
        y2='0'
        stroke='currentColor'
        strokeOpacity='0.35'
        strokeWidth='1'
        strokeDasharray='2 3'
        animate={{ strokeOpacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Star cx={-28} cy={0} r={8} />
      </motion.g>
      <motion.g
        animate={{ y: [0, 1.5, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      >
        <Star cx={28} cy={0} r={8} />
      </motion.g>
    </svg>
  );
}

function JournalHero() {
  return (
    <svg
      viewBox='-40 -32 80 64'
      width='100'
      height='80'
      aria-hidden='true'
      focusable='false'
    >
      {/* pages */}
      <motion.g
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d='M -28 -18 Q 0 -22 28 -18 L 28 18 Q 0 14 -28 18 Z'
          fill='currentColor'
          fillOpacity='0.10'
          stroke='currentColor'
          strokeOpacity='0.45'
          strokeWidth='1'
        />
        <line
          x1='0'
          y1='-20'
          x2='0'
          y2='16'
          stroke='currentColor'
          strokeOpacity='0.35'
          strokeWidth='0.8'
        />
        {/* moon shape on the right page */}
        <motion.path
          d='M 14 -2 a 7 7 0 1 0 0 4 a 5 5 0 1 1 0 -4 z'
          fill='currentColor'
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>
    </svg>
  );
}

function TransitsHero() {
  return (
    <svg
      viewBox='-44 -44 88 88'
      width='96'
      height='96'
      aria-hidden='true'
      focusable='false'
    >
      <circle
        cx='0'
        cy='0'
        r='34'
        fill='none'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='0.8'
        strokeDasharray='2 4'
      />
      <circle cx='0' cy='0' r='3' fill='currentColor' opacity='0.7' />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx='34' cy='0' r='2.6' fill='currentColor' />
      </motion.g>
    </svg>
  );
}

function GenericHero() {
  // Single moon phase — gently breathing.
  return (
    <svg
      viewBox='-30 -30 60 60'
      width='80'
      height='80'
      aria-hidden='true'
      focusable='false'
    >
      <motion.g
        animate={{ scale: [0.96, 1.02, 0.96] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '0px 0px' }}
      >
        <circle
          cx='0'
          cy='0'
          r='22'
          fill='currentColor'
          fillOpacity='0.12'
          stroke='currentColor'
          strokeOpacity='0.5'
          strokeWidth='1'
        />
        <path
          d='M 8 -20 a 22 22 0 1 0 0 40 a 16 16 0 1 1 0 -40 z'
          fill='currentColor'
          fillOpacity='0.85'
        />
      </motion.g>
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // Five-pointed star at (cx,cy) sized r.
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill='currentColor'
      fillOpacity='0.85'
      stroke='currentColor'
      strokeOpacity='0.6'
      strokeWidth='0.6'
      strokeLinejoin='round'
    />
  );
}

export default EmptyState;
