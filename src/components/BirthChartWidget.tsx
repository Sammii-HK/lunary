'use client';

import { SmartTrialButton } from './SmartTrialButton';
import { useUser } from '@/context/UserContext';
import { bodiesSymbols, zodiacSymbol } from '../../utils/zodiac/zodiac';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import Link from 'next/link';

export const BirthChartWidget = () => {
  const { user } = useUser();
  const subscription = useSubscription();
  const userBirthday = user?.birthday;
  const birthChart = user?.birthChart;

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  // If user doesn't have birth chart access, show paywall
  if (!hasChartAccess) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='font-bold'>Birth Chart Analysis</h3>
            <span className='text-lg'>⭐</span>
          </div>

          <div className='bg-gradient-to-r from-lunary-primary-900/30 to-pink-900/30 rounded-lg p-4 border border-lunary-primary/30'>
            <h4 className='text-white font-medium mb-2'>
              🌟 Your Cosmic Blueprint
            </h4>
            <p className='text-lunary-primary-200 text-sm mb-2 font-medium'>
              ✨ Your birth chart has been calculated
            </p>
            <p className='text-zinc-300 text-sm mb-3'>
              Unlock it now to see your complete planetary positions, aspects,
              and detailed interpretations of your cosmic nature.
            </p>
            <ul className='text-xs text-zinc-400 space-y-1 mb-3'>
              <li>• Sun, Moon, and Rising sign placements</li>
              <li>• Planetary positions in zodiac signs</li>
              <li>• Cosmic aspects and their meanings</li>
              <li>• Detailed personality insights</li>
            </ul>
            <SmartTrialButton size='sm' />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userBirthday) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Birth Chart</h3>
          <p className='text-zinc-400 text-xs mb-2'>
            Add your birthday to see your natal placements
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

  if (!birthChart || birthChart.length === 0) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Birth Chart</h3>
          <span className='text-xs text-lunary-primary-400'>Personalised</span>
          <p className='text-zinc-400 text-xs'>Generating chart...</p>
        </div>
      </div>
    );
  }

  const keyPlacements = ['Sun', 'Moon', 'Mercury']
    .map((bodyName) => birthChart.find((planet) => planet.body === bodyName))
    .filter((planet): planet is NonNullable<typeof planet> => Boolean(planet));

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
      <div className='text-center mb-3'>
        <h3 className='font-bold'>Birth Chart</h3>
        {user.name && (
          <p className='text-zinc-400 text-xs'>
            {user.name}&apos;s Natal Placements
          </p>
        )}
      </div>

      <div className='grid grid-cols-3 gap-2'>
        {keyPlacements.slice(0, 3).map((planet) => (
          <div key={planet.body} className='text-center'>
            <div className='font-astro text-lg mb-1'>
              {
                bodiesSymbols[
                  planet.body.toLowerCase() as keyof typeof bodiesSymbols
                ]
              }
            </div>
            <div className='text-xs'>
              <div className='font-astro'>
                {
                  zodiacSymbol[
                    planet.sign.toLowerCase() as keyof typeof zodiacSymbol
                  ]
                }
              </div>
              <div className='text-zinc-400'>{planet.degree}°</div>
            </div>
          </div>
        ))}
      </div>

      <div className='text-center mt-3'>
        <Link
          href='/birth-chart'
          className='text-lunary-accent text-xs underline'
        >
          View Full Chart
        </Link>
      </div>
    </div>
  );
};
