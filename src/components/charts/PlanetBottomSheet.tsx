'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { bodiesSymbols, zodiacSymbol } from '@/constants/symbols';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type { Aspect } from '@/hooks/useAspects';

type Props = {
  planet: BirthChartData | null;
  aspects?: Aspect[];
  onClose: () => void;
  interpretation?: string;
};

function symbolFor(body: string) {
  const k = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  return bodiesSymbols[k] || body.charAt(0);
}

const PLANET_BLURBS: Record<string, string> = {
  Sun: 'Your core identity and creative life-force.',
  Moon: 'Inner life, feelings, emotional muscle memory.',
  Mercury: 'How you think, speak, learn, connect dots.',
  Venus: 'What you love, how you love, what you find beautiful.',
  Mars: 'Drive, desire, how you go after what you want.',
  Jupiter: 'Growth, luck, the stories that expand you.',
  Saturn: 'Structure, discipline, the gift in the limit.',
  Uranus: 'Lightning, rebellion, sudden becoming.',
  Neptune: 'Dream, myth, dissolving boundary.',
  Pluto: 'Power, depth, the soul\u2019s cauldron.',
};

export function PlanetBottomSheet({
  planet,
  aspects = [],
  onClose,
  interpretation,
}: Props) {
  useEffect(() => {
    if (!planet) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [planet, onClose]);

  const relevant = aspects.filter(
    (a) => planet && (a.planet1 === planet.body || a.planet2 === planet.body),
  );

  return (
    <AnimatePresence>
      {planet && (
        <>
          <motion.div
            key='backdrop'
            className='fixed inset-0 z-[110] bg-transparent'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key='sheet'
            role='dialog'
            aria-modal='true'
            aria-label={`${planet.body} details`}
            className='fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-[120] mx-auto max-h-[72dvh] max-w-2xl overflow-y-auto rounded-t-2xl border border-stroke-default bg-surface-elevated px-5 pb-8 pt-3 shadow-2xl'
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className='mx-auto mb-3 h-1 w-10 rounded-full bg-stroke-default' />
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <span className='font-astro text-3xl text-lunary-primary'>
                  {symbolFor(planet.body)}
                </span>
                <div>
                  <h3 className='text-lg font-semibold text-content-primary'>
                    {planet.body}
                  </h3>
                  {planet.sign && (
                    <p className='text-sm text-content-secondary'>
                      {Math.floor(planet.degree ?? 0)}&deg;
                      {String(Math.floor(planet.minute ?? 0)).padStart(2, '0')}
                      &apos;
                      {' in '}
                      <span className='font-astro'>
                        {
                          zodiacSymbol[
                            planet.sign.toLowerCase() as keyof typeof zodiacSymbol
                          ]
                        }
                      </span>{' '}
                      {planet.sign}
                      {planet.retrograde && (
                        <span className='ml-1 text-red-400'>&#8478;</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className='rounded-full p-1.5 text-content-muted hover:bg-surface-muted hover:text-content-primary'
                aria-label='Close'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <p className='mt-4 text-sm leading-relaxed text-content-secondary'>
              {interpretation ||
                PLANET_BLURBS[planet.body] ||
                'A point of cosmic emphasis in your chart.'}
            </p>

            {relevant.length > 0 && (
              <div className='mt-5'>
                <h4 className='mb-2 text-xs font-semibold uppercase tracking-wide text-content-muted'>
                  Aspects to {planet.body}
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {relevant.map((a, i) => {
                    const other =
                      a.planet1 === planet.body ? a.planet2 : a.planet1;
                    return (
                      <span
                        key={i}
                        className='rounded-full px-2.5 py-1 text-xs font-medium'
                        style={{
                          backgroundColor: `${a.color}22`,
                          color: a.color,
                          borderColor: `${a.color}55`,
                          borderWidth: 1,
                        }}
                      >
                        {a.type} {other}{' '}
                        <span className='opacity-60'>
                          {a.orb.toFixed(1)}&deg;
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {planet.house && (
              <div className='mt-4 rounded-lg bg-surface-muted px-3 py-2 text-xs text-content-secondary'>
                <span className='font-medium text-content-primary'>
                  House {planet.house}
                </span>
                {' \u2014 the life area where this energy wants expression.'}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
