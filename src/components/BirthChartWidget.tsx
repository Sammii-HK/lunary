'use client';

import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from './SmartTrialButton';
import {
  getBirthChartFromProfile,
  hasBirthChart,
} from '../../utils/astrology/birthChart';
import { bodiesSymbols, zodiacSymbol } from '../../utils/zodiac/zodiac';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import Link from 'next/link';

export const BirthChartWidget = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

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

          <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30'>
            <h4 className='text-white font-medium mb-2'>
              🌟 Your Cosmic Blueprint
            </h4>
            <p className='text-purple-200 text-sm mb-2 font-medium'>
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

  if (!me || !userBirthday) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Birth Chart</h3>
          <p className='text-zinc-400 text-xs mb-2'>
            Add your birthday to see your natal placements
          </p>
          <Link href='/profile' className='text-blue-400 text-xs underline'>
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  const hasBirthChartData = hasBirthChart(me.profile);
  const birthChartData = hasBirthChartData
    ? getBirthChartFromProfile(me.profile)
    : null;

  if (!birthChartData) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Birth Chart</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
          <p className='text-zinc-400 text-xs'>Generating chart...</p>
        </div>
      </div>
    );
  }

  // Get the most important placements (Sun, Moon, Rising - but we don't have rising, so Mercury)
  const keyPlacements = ['Sun', 'Moon', 'Mercury']
    .map((bodyName) =>
      birthChartData.find((planet) => planet.body === bodyName),
    )
    .filter((planet): planet is NonNullable<typeof planet> => Boolean(planet));

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
      <div className='text-center mb-3'>
        <h3 className='font-bold'>Birth Chart</h3>
        {userName && (
          <p className='text-zinc-400 text-xs'>
            {userName}&apos;s Natal Placements
          </p>
        )}
      </div>

      <div className='grid grid-cols-3 gap-2'>
        {keyPlacements.slice(0, 3).map((planet) => (
          <div key={planet.body} className='text-center'>
            <div className='text-lg mb-1'>
              {
                bodiesSymbols[
                  planet.body.toLowerCase() as keyof typeof bodiesSymbols
                ]
              }
            </div>
            <div className='text-xs'>
              <div>
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
        <Link href='/birth-chart' className='text-blue-400 text-xs underline'>
          View Full Chart
        </Link>
      </div>
    </div>
  );
};
