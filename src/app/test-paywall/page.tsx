'use client';

import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import {
  hasBirthChartAccess,
  canCollectBirthday,
} from '../../../utils/pricing';
import { HoroscopeWidget } from '../../components/HoroscopeWidget';
import { CrystalWidget } from '../../components/CrystalWidget';
import { TarotWidget } from '../../components/TarotWidget';
import { BirthChartWidget } from '../../components/BirthChartWidget';

export default function TestPaywallPage() {
  const subscription = useSubscription();
  const [mockStatus, setMockStatus] = useState<string | null>(null);

  // Use mock status if set, otherwise use real subscription
  const currentStatus = mockStatus || subscription.status;

  const hasChartAccess = hasBirthChartAccess(currentStatus);
  const canCollectBDay = canCollectBirthday(currentStatus);

  return (
    <div className='min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 p-6'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-light text-white mb-8'>
          Paywall Implementation Test
        </h1>

        {/* Status Controls */}
        <div className='bg-zinc-800/50 rounded-lg p-6 mb-8'>
          <h2 className='text-xl font-medium text-white mb-4'>
            Test Different Subscription States
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <button
              onClick={() => setMockStatus('free')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentStatus === 'free'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Free User
            </button>
            <button
              onClick={() => setMockStatus('trial')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentStatus === 'trial'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Trial User
            </button>
            <button
              onClick={() => setMockStatus('active')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Premium User
            </button>
            <button
              onClick={() => setMockStatus(null)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                mockStatus === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Real Status
            </button>
          </div>
        </div>

        {/* Current Status Display */}
        <div className='bg-zinc-800/50 rounded-lg p-6 mb-8'>
          <h2 className='text-xl font-medium text-white mb-4'>
            Current Status
          </h2>
          <div className='grid md:grid-cols-3 gap-4'>
            <div className='bg-zinc-700/50 rounded p-4'>
              <div className='text-zinc-400 text-sm'>Subscription Status</div>
              <div className='text-white text-lg font-medium'>
                {currentStatus}
              </div>
            </div>
            <div className='bg-zinc-700/50 rounded p-4'>
              <div className='text-zinc-400 text-sm'>Birth Chart Access</div>
              <div
                className={`text-lg font-medium ${hasChartAccess ? 'text-green-400' : 'text-red-400'}`}
              >
                {hasChartAccess ? 'Allowed' : 'Blocked'}
              </div>
            </div>
            <div className='bg-zinc-700/50 rounded p-4'>
              <div className='text-zinc-400 text-sm'>Birthday Collection</div>
              <div
                className={`text-lg font-medium ${canCollectBDay ? 'text-green-400' : 'text-red-400'}`}
              >
                {canCollectBDay ? 'Allowed' : 'Blocked'}
              </div>
            </div>
          </div>
        </div>

        {/* Widget Tests */}
        <div className='space-y-8'>
          <div>
            <h3 className='text-lg font-medium text-white mb-4'>
              Horoscope Widget
            </h3>
            <HoroscopeWidget />
          </div>

          <div>
            <h3 className='text-lg font-medium text-white mb-4'>
              Crystal Widget
            </h3>
            <CrystalWidget />
          </div>

          <div>
            <h3 className='text-lg font-medium text-white mb-4'>
              Tarot Widget
            </h3>
            <TarotWidget />
          </div>

          <div>
            <h3 className='text-lg font-medium text-white mb-4'>
              Birth Chart Widget
            </h3>
            <BirthChartWidget />
          </div>
        </div>

        {/* Feature Comparison */}
        <div className='bg-zinc-800/50 rounded-lg p-6 mt-8'>
          <h2 className='text-xl font-medium text-white mb-4'>
            Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-zinc-700'>
                  <th className='text-left py-2 text-zinc-300'>Feature</th>
                  <th className='text-center py-2 text-zinc-300'>Free</th>
                  <th className='text-center py-2 text-zinc-300'>Trial</th>
                  <th className='text-center py-2 text-zinc-300'>Premium</th>
                </tr>
              </thead>
              <tbody className='text-zinc-400'>
                <tr>
                  <td className='py-2'>General Horoscope</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>Personal Horoscope</td>
                  <td className='text-center'>❌</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>General Crystal Guidance</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>Personal Crystal Recommendations</td>
                  <td className='text-center'>❌</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>General Tarot Guidance</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>Personal Tarot Readings</td>
                  <td className='text-center'>❌</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>Birth Chart Analysis</td>
                  <td className='text-center'>❌</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
                <tr>
                  <td className='py-2'>Birthday Collection</td>
                  <td className='text-center'>❌</td>
                  <td className='text-center'>✅</td>
                  <td className='text-center'>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
