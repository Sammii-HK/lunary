'use client';

import { useMemo, useState, useEffect } from 'react';
import { SmartTrialButton } from './SmartTrialButton';
import { conversionTracking } from '../lib/analytics';
import { useUser } from '@/context/UserContext';
import { getAstrologicalChart } from '../../utils/astrology/astrology';
import { getGeneralCrystalRecommendation } from '../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../utils/crystals/personalizedCrystals';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess, hasDateAccess } from '../../utils/pricing';
import { useAstronomyContext } from '../context/AstronomyContext';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Popover } from '@base-ui-components/react/popover';
import { Paywall } from './Paywall';

export const CrystalWidget = () => {
  const { user } = useUser();
  const subscription = useSubscription();
  const { currentDateTime } = useAstronomyContext();
  const userBirthday = user?.birthday;
  const birthChart = user?.birthChart;
  const [observer, setObserver] = useState<any>(null);

  useEffect(() => {
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, []);

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const normalizedDate = useMemo(() => {
    const dateStr = dayjs(currentDateTime).format('YYYY-MM-DD');
    return new Date(dateStr + 'T12:00:00');
  }, [currentDateTime]);

  const canAccessDate = hasDateAccess(normalizedDate, subscription.status);

  // Memoize general crystal for non-premium users
  const generalCrystal = useMemo(() => {
    if (hasChartAccess) return null;
    if (!canAccessDate) return null; // Don't show general crystal if date is paywalled
    return getGeneralCrystalRecommendation(normalizedDate);
  }, [hasChartAccess, canAccessDate, normalizedDate]);

  const crystalData = useMemo(() => {
    if (!birthChart || !userBirthday || !observer) return null;
    if (!canAccessDate) return null;

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
      guidance,
    };
  }, [normalizedDate, userBirthday, observer, birthChart, canAccessDate]);

  useEffect(() => {
    if (crystalData && hasChartAccess && user?.id) {
      conversionTracking.crystalRecommendationsViewed(user.id);
    }
  }, [crystalData, hasChartAccess, user?.id]);

  // Check date access - show paywall if date is restricted
  if (!canAccessDate) {
    return (
      <Paywall feature='personalized_crystal_recommendations'>
        <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col min-h-64'>
          <div className='text-center'>
            <h3 className='font-bold mb-2'>Personal Crystal</h3>
            <span className='text-xs text-lunary-accent'>Personalised</span>
            <p className='text-zinc-400 text-xs mt-2'>
              Access to historical and future dates requires a subscription.
            </p>
          </div>
        </div>
      </Paywall>
    );
  }

  // If user doesn't have birth chart access, show general crystal recommendation
  if (!hasChartAccess) {
    if (!generalCrystal) {
      return (
        <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col min-h-64'>
          <div className='flex-1 flex items-center justify-center'>
            <div className='h-4 w-32 bg-zinc-800 rounded animate-pulse' />
          </div>
        </div>
      );
    }

    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col min-h-64'>
        <div className='space-y-2'>
          <div className='space-y-2'>
            <div className='text-center'>
              <h4 className='font-semibold text-lunary-accent-300'>
                {generalCrystal.name}
              </h4>
              <p className='text-xs text-zinc-400'>
                {generalCrystal.properties.slice(0, 3).join(' • ')}
              </p>
            </div>

            <p className='text-xs text-zinc-300'>{generalCrystal.reason}</p>
          </div>

          <div className='bg-gradient-to-r from-lunary-primary-900/20 to-lunary-highlight-900/20 rounded p-2 border border-lunary-primary-800'>
            <p className='text-xs text-zinc-400 mb-2'>
              Get crystals chosen specifically for YOUR birth chart. See what
              the universe has selected for you!
            </p>
            <SmartTrialButton size='sm' />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userBirthday) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col min-h-64'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Crystal</h3>
          <span className='text-xs text-lunary-accent'>Personalised</span>
          <div className='text-4xl mb-2'>💎</div>
          <p className='text-zinc-400 text-xs mb-2'>
            Add your birthday for personalized crystal guidance
          </p>
          <Link
            href='/profile'
            className='text-lunary-accent text-xs underline'
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!birthChart) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col min-h-64'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Crystal</h3>
          <span className='text-xs text-lunary-accent'>Personalised</span>
          <div className='text-4xl mb-2'>🔮</div>
          <p className='text-zinc-400 text-xs'>
            Calculating your crystal alignment...
          </p>
        </div>
      </div>
    );
  }

  if (!crystalData) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col min-h-64'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Crystal</h3>
          <span className='text-xs text-lunary-accent'>Personalised</span>
          <div className='text-4xl mb-2'>🔮</div>
          <p className='text-zinc-400 text-xs'>
            Calculating your crystal alignment...
          </p>
        </div>
      </div>
    );
  }

  const recommendedCrystal = crystalData.crystal;
  const guidance = crystalData.guidance;

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full relative min-h-64'>
      {/* Info Icon with Popover */}
      <Popover.Root>
        <Popover.Trigger className='absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-300 transition-colors'>
          <Info size={14} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup className='bg-zinc-800 border border-zinc-700 rounded-lg p-4 max-w-sm text-xs text-zinc-300 shadow-lg z-50'>
              <div className='space-y-3'>
                <div>
                  <h4 className='font-semibold text-white mb-2'>
                    Crystal Selection Process
                  </h4>
                  <p className='mb-2'>
                    Your daily crystal is calculated using:
                  </p>
                  <ul className='list-disc list-inside space-y-1 text-zinc-400'>
                    <li>Your birth chart placements (Sun, Moon, planets)</li>
                    <li>Current planetary positions and transits</li>
                    <li>Selected date&apos;s numerological vibration</li>
                    <li>Day-of-week planetary ruler energies</li>
                    <li>Astrological aspects and alignments</li>
                  </ul>
                </div>
                <div>
                  <p className='text-zinc-400'>
                    Each crystal&apos;s properties are matched against these
                    cosmic factors to find your most beneficial stone for the
                    selected date.
                  </p>
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Crystal</h3>
          <span className='text-xs text-lunary-accent'>Personalised</span>
        </div>

        <div className='text-center mb-3'>
          <div className='text-md font-semibold text-white'>
            {recommendedCrystal.name}
          </div>
          <div className='text-xs text-zinc-400 mb-2'>
            {recommendedCrystal.chakra} Chakra
          </div>
        </div>

        <div className='text-center text-sm text-zinc-300 leading-relaxed mb-3'>
          <p className='mb-2'>{recommendedCrystal.description}</p>
          <p className='text-xs text-zinc-400'>{guidance}</p>
        </div>

        <div className='text-center mb-3'>
          <div className='text-xs text-zinc-400 italic'>
            &quot;{recommendedCrystal.intention}&quot;
          </div>
        </div>
      </div>
    </div>
  );
};
