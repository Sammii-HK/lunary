'use client';

import { useAccount } from 'jazz-tools/react-core';
import { getBirthChartFromProfile } from '../../utils/astrology/birthChart';
import { buildUserPersonalization } from '../../utils/personalization';

export const LuckyElements = () => {
  const { me } = useAccount();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const birthChart = getBirthChartFromProfile(me?.profile);
  const today = new Date();

  const personalization = buildUserPersonalization(
    {
      name: userName,
      birthday: userBirthday,
      birthChart,
    },
    today,
  );

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
      <div className='grid grid-cols-2 gap-2 text-xs text-zinc-400'>
        <div className='border border-stone-800 rounded-md p-2'>
          <div className='text-zinc-200 mb-1'>Lucky Numbers</div>
          <div>{personalization.numbers.join(' • ')}</div>
        </div>
        <div className='border border-stone-800 rounded-md p-2'>
          <div className='text-zinc-200 mb-1'>Lucky Colors</div>
          <div>{personalization.colors.join(' • ')}</div>
        </div>
        <div className='border border-stone-800 rounded-md p-2'>
          <div className='text-zinc-200 mb-1'>Element</div>
          <div>{personalization.element}</div>
        </div>
        <div className='border border-stone-800 rounded-md p-2'>
          <div className='text-zinc-200 mb-1'>Daily Rune</div>
          <div>{personalization.rune.name}</div>
        </div>
      </div>
    </div>
  );
};
