'use client';

import Link from 'next/link';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ZODIAC_SEASONS } from '@/constants/seo/zodiac-seasons';

type HappeningNowCard = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
  priority: number;
};

function getCurrentZodiacSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // JS months are 0-indexed
  const day = now.getDate();

  for (const season of ZODIAC_SEASONS) {
    // Handle Capricorn which spans year boundary
    if (season.startMonth > season.endMonth) {
      if (
        (month === season.startMonth && day >= season.startDay) ||
        (month === season.endMonth && day <= season.endDay) ||
        month > season.startMonth ||
        month < season.endMonth
      ) {
        return season;
      }
    } else {
      if (
        (month === season.startMonth && day >= season.startDay) ||
        (month === season.endMonth && day <= season.endDay) ||
        (month > season.startMonth && month < season.endMonth)
      ) {
        return season;
      }
    }
  }

  return ZODIAC_SEASONS[0]; // Fallback to Aries
}

// Check if we're near a full or new moon (within ±1 day)
// Simple approximation based on lunar cycle (~29.5 days)
function getMoonPhaseInfo(): {
  isFullMoon: boolean;
  isNewMoon: boolean;
  phaseName: string;
} {
  const now = new Date();
  // Known full moon date: January 13, 2025
  const knownFullMoon = new Date('2025-01-13T22:27:00Z');
  const lunarCycle = 29.53059; // days

  const daysSinceKnownFullMoon =
    (now.getTime() - knownFullMoon.getTime()) / (1000 * 60 * 60 * 24);
  const cyclePosition = daysSinceKnownFullMoon % lunarCycle;
  const normalizedPosition =
    cyclePosition < 0 ? cyclePosition + lunarCycle : cyclePosition;

  // Full moon is around day 0/29.5 (±1.5 days for "near full")
  const isFullMoon =
    normalizedPosition <= 1.5 || normalizedPosition >= lunarCycle - 1.5;

  // New moon is around day 14.76 (±1.5 days for "near new")
  const halfCycle = lunarCycle / 2;
  const isNewMoon =
    normalizedPosition >= halfCycle - 1.5 &&
    normalizedPosition <= halfCycle + 1.5;

  let phaseName = 'Waxing';
  if (isFullMoon) phaseName = 'Full Moon';
  else if (isNewMoon) phaseName = 'New Moon';
  else if (normalizedPosition < halfCycle) phaseName = 'Waxing';
  else phaseName = 'Waning';

  return { isFullMoon, isNewMoon, phaseName };
}

export function HappeningNowSection() {
  const [cards, setCards] = useState<HappeningNowCard[]>([]);

  useEffect(() => {
    const happeningNow: HappeningNowCard[] = [];

    // Check moon phase
    const moonInfo = getMoonPhaseInfo();

    if (moonInfo.isFullMoon || moonInfo.isNewMoon) {
      const zodiacSeason = getCurrentZodiacSeason();
      happeningNow.push({
        id: 'moon-circle',
        title: `${moonInfo.phaseName} in ${zodiacSeason.displayName}`,
        subtitle: 'Share your reflections with the community',
        href: '/moon-circles?nav=app',
        cta: 'Join Moon Circle',
        icon: <Moon className='w-5 h-5' />,
        priority: 1,
      });
    }

    // Always show current zodiac season as a lower priority card
    const currentSeason = getCurrentZodiacSeason();
    happeningNow.push({
      id: 'zodiac-season',
      title: `${currentSeason.displayName} Season ${currentSeason.symbol}`,
      subtitle: currentSeason.theme,
      href: `/shop?season=${currentSeason.sign}&nav=app`,
      cta: 'Shop Season Pack',
      icon: <Sun className='w-5 h-5' />,
      priority: 2,
    });

    // Sort by priority and take max 2
    setCards(happeningNow.sort((a, b) => a.priority - b.priority).slice(0, 2));
  }, []);

  if (cards.length === 0) return null;

  return (
    <section>
      <h2 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
        Happening Now
      </h2>
      <div className='space-y-2'>
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className='flex items-center gap-4 p-4 rounded-lg border border-lunary-primary-700/50 bg-gradient-to-r from-lunary-primary-950/40 to-zinc-900/80 hover:border-lunary-primary-500 hover:from-lunary-primary-900/40 transition-all group'
          >
            <div className='p-2.5 rounded-lg bg-lunary-primary-900/40 text-lunary-primary-300'>
              {card.icon}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {card.title}
              </h3>
              <p className='text-xs text-zinc-400'>{card.subtitle}</p>
            </div>
            <span className='text-xs font-medium text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors whitespace-nowrap'>
              {card.cta}
            </span>
            <ChevronRight className='w-4 h-4 text-lunary-primary-500 group-hover:text-lunary-primary-300 transition-colors' />
          </Link>
        ))}
      </div>
    </section>
  );
}
