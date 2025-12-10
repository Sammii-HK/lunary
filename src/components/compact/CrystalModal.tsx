'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { X, Gem, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { getAstrologicalChart } from '../../../utils/astrology/astrology';
import { getGeneralCrystalRecommendation } from '../../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../../utils/crystals/personalizedCrystals';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { useAstronomyContext } from '../../context/AstronomyContext';
import dayjs from 'dayjs';

export const CrystalPreview = () => {
  const { user } = useUser();
  const subscription = useSubscription();
  const { currentDateTime } = useAstronomyContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observer, setObserver] = useState<any>(null);

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const normalizedDate = useMemo(() => {
    const dateStr = dayjs(currentDateTime).format('YYYY-MM-DD');
    return new Date(dateStr + 'T12:00:00');
  }, [currentDateTime]);

  useEffect(() => {
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, []);

  const birthChart = user?.birthChart;
  const userBirthday = user?.birthday;

  const generalCrystal = useMemo(() => {
    if (hasChartAccess) return null;
    return getGeneralCrystalRecommendation(normalizedDate);
  }, [hasChartAccess, normalizedDate]);

  const crystalData = useMemo(() => {
    if (!hasChartAccess) return null;
    if (!birthChart || !observer) return null;

    const currentTransits = getAstrologicalChart(normalizedDate, observer);
    const { crystal, reasons } = calculateCrystalRecommendation(
      birthChart,
      currentTransits,
      normalizedDate,
      userBirthday,
    );

    const guidance = getCrystalGuidance(crystal, birthChart);

    return {
      crystal,
      reasons,
      guidance,
    };
  }, [hasChartAccess, birthChart, observer, normalizedDate, userBirthday]);

  const crystalName = hasChartAccess
    ? crystalData?.crystal.name
    : generalCrystal?.name;

  const crystalReason = hasChartAccess
    ? crystalData?.guidance
    : generalCrystal?.reason;

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, closeModal]);

  if (!crystalName) {
    return (
      <div className='py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md animate-pulse min-h-16'>
        <div className='h-5 w-24 bg-zinc-800 rounded' />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className='w-full h-full py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group text-left min-h-16'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2'>
                <Gem className='w-4 h-4 text-lunary-accent-200' />
                <span className='text-sm font-medium text-zinc-200'>
                  {crystalName}
                </span>
              </div>
              {hasChartAccess && (
                <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                  For you
                </span>
              )}
            </div>
            <p className='text-xs text-zinc-400 line-clamp-2'>
              {crystalReason}
            </p>
            {!hasChartAccess && (
              <div className='flex items-center gap-1.5 mt-2 text-xs text-lunary-primary-200 group-hover:text-lunary-primary-100'>
                <Lock className='w-3 h-3' />
                <span>Unlock personalized crystal</span>
              </div>
            )}
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-200 transition-colors flex-shrink-0 mt-1' />
        </div>
      </button>

      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50'
          onClick={closeModal}
        >
          <div
            className='bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full relative'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-lunary-primary-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Gem className='w-8 h-8 text-lunary-accent' />
              </div>
              <h2 className='text-xl font-semibold text-white mb-1'>
                {crystalName}
              </h2>
              {hasChartAccess && (
                <p className='text-xs text-lunary-accent'>
                  Personalized for your chart
                </p>
              )}
            </div>

            <div className='space-y-4'>
              <div>
                <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2'>
                  Why this crystal today
                </h3>
                {hasChartAccess && crystalData?.reasons ? (
                  <ul className='space-y-1.5'>
                    {crystalData.reasons.map((reason, idx) => (
                      <li
                        key={idx}
                        className='text-sm text-zinc-300 flex items-center gap-2'
                      >
                        <span className='w-1.5 h-1.5 bg-lunary-accent rounded-full flex-shrink-0' />
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm text-zinc-300'>{crystalReason}</p>
                )}
              </div>

              {crystalData?.crystal && (
                <>
                  <div>
                    <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                      Intention
                    </h3>
                    <p className='text-sm text-zinc-300 italic'>
                      "{crystalData.crystal.intention}"
                    </p>
                  </div>
                  <div>
                    <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                      Properties
                    </h3>
                    <p className='text-sm text-zinc-400'>
                      {crystalData.crystal.properties.join(' • ')} •{' '}
                      {crystalData.crystal.chakra} Chakra
                    </p>
                  </div>
                </>
              )}

              {!hasChartAccess && (
                <Link
                  href='/pricing'
                  className='flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-lunary-primary to-lunary-highlight rounded-lg text-white font-medium hover:from-lunary-primary-400 hover:to-lunary-highlight-400 transition-all'
                  onClick={() => setIsModalOpen(false)}
                >
                  <Sparkles className='w-4 h-4' />
                  Get personalized crystals
                </Link>
              )}

              <Link
                href='/grimoire/crystals'
                className='block w-full py-2 text-center text-sm text-lunary-accent hover:text-lunary-accent-300 transition-colors'
                onClick={() => setIsModalOpen(false)}
              >
                Explore all crystals →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
