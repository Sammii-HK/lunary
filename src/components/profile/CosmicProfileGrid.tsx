'use client';

import Link from 'next/link';
import { Stars, Layers, Hash, Calendar } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { calculateLifePathNumber } from '../../../utils/personalization';
import { calculatePersonalYear } from '@/lib/numerology';

type PersonalCard = {
  name: string;
  keywords?: string[];
  information?: string;
  reason?: string;
};

type CosmicProfileGridProps = {
  birthday: string;
  personalCard?: PersonalCard | null;
  onPersonalCardClick: () => void;
};

export function CosmicProfileGrid({
  birthday,
  personalCard,
  onPersonalCardClick,
}: CosmicProfileGridProps) {
  const lifePathNumber = calculateLifePathNumber(birthday);
  const isMasterNumber = [11, 22, 33].includes(lifePathNumber);
  const currentYear = new Date().getFullYear();
  const personalYear = calculatePersonalYear(birthday, currentYear).result;

  return (
    <div className='w-full max-w-3xl'>
      <SectionTitle as='h2' className='mb-3'>
        Cosmic Profile
      </SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <Link
          href='/app/birth-chart'
          className='group rounded-xl border border-lunary-primary-700 bg-gradient-to-br from-lunary-primary-950/60 to-zinc-900 p-4 shadow-lg hover:border-lunary-primary-600 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium text-white group-hover:text-lunary-accent-300 transition-colors'>
                Birth Chart
              </h3>
              <p className='text-xs text-lunary-accent-200/70'>
                View your cosmic fingerprint
              </p>
            </div>
            <Stars className='w-6 h-6 text-lunary-accent' />
          </div>
        </Link>

        <button
          onClick={onPersonalCardClick}
          className='group rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-lg hover:border-lunary-primary-700 transition-colors text-left w-full'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium text-white group-hover:text-lunary-accent-300 transition-colors'>
                Personal Card
              </h3>
              <p className='text-xs text-zinc-400'>
                {personalCard ? personalCard.name : 'Your tarot signature'}
              </p>
            </div>
            <Layers className='w-6 h-6 text-lunary-accent' />
          </div>
        </button>

        <Link
          href={`/grimoire/life-path/${lifePathNumber}`}
          className='group rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-lg hover:border-lunary-secondary-600 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium text-white group-hover:text-lunary-secondary-300 transition-colors'>
                Life Path {lifePathNumber}
                {isMasterNumber && (
                  <span className='ml-2 text-xs text-lunary-accent-400'>
                    Master
                  </span>
                )}
              </h3>
              <p className='text-xs text-zinc-400'>Your numerology destiny</p>
            </div>
            <Hash className='w-6 h-6 text-lunary-secondary' />
          </div>
        </Link>

        <Link
          href={`/grimoire/numerology/year/${personalYear}`}
          className='group rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-lg hover:border-lunary-primary-600 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium text-white group-hover:text-lunary-primary-300 transition-colors'>
                Personal Year {personalYear}
              </h3>
              <p className='text-xs text-zinc-400'>
                Based on your birth date, not the universal year
              </p>
            </div>
            <Calendar className='w-6 h-6 text-lunary-primary-400' />
          </div>
        </Link>
      </div>
    </div>
  );
}
