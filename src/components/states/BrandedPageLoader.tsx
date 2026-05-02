'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

type Props = {
  /** Optional message under the logo. */
  message?: string;
};

/**
 * Full-screen branded loader.
 *
 * The Lunary logo sits at the centre, breathing softly. Two concentric
 * orbital rings sweep around it (slow + fast counter-rotation), with three
 * tiny "planet" dots riding the rings. A faint cosmic vignette sits behind
 * everything so the loader feels like a sky, not a spinner.
 *
 * Use this for AUTH / FULL-PAGE / app-boot loading states only — for
 * inline / per-component loading prefer <CosmicSpinner />.
 */
export function BrandedPageLoader({ message }: Props) {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-label={message || 'Loading'}
      className='fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-surface-base'
    >
      {/* Cosmic vignette */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(132,88,216,0.18) 0%, rgba(10,10,15,0.95) 70%)',
        }}
      />

      {/* Orbiting rings + logo */}
      <div className='relative h-44 w-44 sm:h-52 sm:w-52'>
        {/* Outer orbit ring */}
        <motion.div
          aria-hidden
          className='absolute inset-0 rounded-full border border-lunary-primary/25'
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <span className='absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lunary-primary shadow-[0_0_10px_rgba(138,107,255,0.7)]' />
        </motion.div>

        {/* Inner orbit ring (counter-rotates) */}
        <motion.div
          aria-hidden
          className='absolute inset-4 rounded-full border border-lunary-accent/20'
          animate={{ rotate: -360 }}
          transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
        >
          <span className='absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-lunary-accent shadow-[0_0_8px_rgba(255,196,138,0.7)]' />
        </motion.div>

        {/* Innermost orbit ring */}
        <motion.div
          aria-hidden
          className='absolute inset-9 rounded-full border border-lunary-rose/15'
          animate={{ rotate: 360 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
        >
          <span className='absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 translate-y-1/2 rounded-full bg-lunary-rose shadow-[0_0_6px_rgba(238,120,158,0.7)]' />
        </motion.div>

        {/* Logo — gentle breath + soft halo */}
        <motion.div
          className='absolute inset-0 flex items-center justify-center'
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className='relative'>
            <div
              aria-hidden
              className='absolute inset-0 rounded-full'
              style={{
                background:
                  'radial-gradient(circle, rgba(138,107,255,0.45) 0%, rgba(138,107,255,0) 70%)',
                filter: 'blur(8px)',
                transform: 'scale(1.6)',
              }}
            />
            <Image
              src='/logo-alpha.png'
              alt=''
              width={84}
              height={84}
              priority
              className='relative h-20 w-20 sm:h-24 sm:w-24 select-none'
            />
          </div>
        </motion.div>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className='relative mt-8 text-sm text-content-muted'
        >
          {message}
        </motion.p>
      )}

      <span className='sr-only'>{message || 'Loading'}</span>
    </div>
  );
}

export default BrandedPageLoader;
