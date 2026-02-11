'use client';

import { Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zodiacSymbol, bodiesSymbols } from '@utils/zodiac/zodiac';

interface SpaceHeaderProps {
  title: string;
  description: string | null;
  memberCount: number;
  postCount: number;
  sign?: string | null;
  planet?: string | null;
  slug?: string;
  spaceType?: string;
  className?: string;
}

function getHeaderSymbols(
  sign: string | null | undefined,
  planet: string | null | undefined,
  slug: string | undefined,
  spaceType: string | undefined,
): string[] {
  if (spaceType === 'saturn_return') {
    return [bodiesSymbols.saturn];
  }
  if (spaceType === 'retrograde_checkin' && planet) {
    const key = planet.toLowerCase() as keyof typeof bodiesSymbols;
    if (bodiesSymbols[key]) return [bodiesSymbols[key]];
  }

  const symbols: string[] = [];

  // For sun/moon sign spaces, show the body symbol alongside the zodiac symbol
  if (slug?.endsWith('-sun')) {
    symbols.push(bodiesSymbols.sun);
  } else if (slug?.endsWith('-moon')) {
    symbols.push(bodiesSymbols.moon);
  }

  if (sign) {
    const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
    if (zodiacSymbol[key]) symbols.push(zodiacSymbol[key]);
  }

  return symbols;
}

export function SpaceHeader({
  title,
  description,
  memberCount,
  postCount,
  sign,
  planet,
  slug,
  spaceType,
  className,
}: SpaceHeaderProps) {
  const symbols = getHeaderSymbols(sign, planet, slug, spaceType);

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <h1 className='text-xl font-semibold text-zinc-100'>
          {symbols.length > 0 && (
            <span className='font-astro mr-2 text-lunary-primary-400'>
              {symbols.join('')}
            </span>
          )}
          {title}
        </h1>
        {description && (
          <p className='text-sm text-zinc-400 mt-1'>{description}</p>
        )}
      </div>

      <div className='flex items-center gap-4 text-xs text-zinc-500'>
        <div className='flex items-center gap-1'>
          <Users className='w-3.5 h-3.5' />
          <span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        <div className='flex items-center gap-1'>
          <MessageCircle className='w-3.5 h-3.5' />
          <span>
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>
    </div>
  );
}
