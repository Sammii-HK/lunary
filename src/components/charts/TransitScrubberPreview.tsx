'use client';

import { useRouter } from 'next/navigation';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { TransitScrubber } from '@/components/charts/TransitScrubber';

type Props = {
  birthChart: BirthChartData[];
};

export function TransitScrubberPreview({ birthChart }: Props) {
  const router = useRouter();
  return (
    <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-4 backdrop-blur'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-content-primary'>
          Today&apos;s sky
        </h3>
        <span className='text-[10px] uppercase tracking-wider text-content-muted'>
          Live
        </span>
      </div>
      <TransitScrubber
        birthChart={birthChart}
        compact
        onOpenFull={() => router.push('/horoscope')}
      />
    </div>
  );
}
