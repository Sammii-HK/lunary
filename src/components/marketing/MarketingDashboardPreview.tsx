'use client';

import { useState, useEffect, useRef } from 'react';
import ctaExamples from '@/lib/cta-examples.json';
import Image from 'next/image';
import { Sparkles, Layers, Gem, ChevronDown } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableCardHeader,
} from '@/components/ui/expandable-card';
import { zodiacSymbol, bodiesSymbols } from '@/constants/symbols';

const getMoonPhaseIconPath = (phase: string): string => {
  const lower = phase.toLowerCase();
  if (lower.includes('new')) return 'new-moon';
  if (lower.includes('waxing') && lower.includes('crescent'))
    return 'waxing-cresent-moon';
  if (lower.includes('first quarter')) return 'first-quarter';
  if (lower.includes('waxing') && lower.includes('gibbous'))
    return 'waxing-gibbous-moon';
  if (lower.includes('full')) return 'full-moon';
  if (lower.includes('waning') && lower.includes('gibbous'))
    return 'waning-gibbous-moon';
  if (lower.includes('last quarter') || lower.includes('third quarter'))
    return 'last-quarter';
  if (lower.includes('waning') && lower.includes('crescent'))
    return 'waning-cresent-moon';
  return 'full-moon';
};

const getZodiacInfo = (sign: string) => {
  const signKey = sign.toLowerCase();

  const elementMap: Record<string, string> = {
    aries: 'Fire',
    taurus: 'Earth',
    gemini: 'Air',
    cancer: 'Water',
    leo: 'Fire',
    virgo: 'Earth',
    libra: 'Air',
    scorpio: 'Water',
    sagittarius: 'Fire',
    capricorn: 'Earth',
    aquarius: 'Air',
    pisces: 'Water',
  };

  const rulingPlanets: Record<string, string> = {
    aries: 'Mars',
    taurus: 'Venus',
    gemini: 'Mercury',
    cancer: 'Moon',
    leo: 'Sun',
    virgo: 'Mercury',
    libra: 'Venus',
    scorpio: 'Pluto',
    sagittarius: 'Jupiter',
    capricorn: 'Saturn',
    aquarius: 'Uranus',
    pisces: 'Neptune',
  };

  const modalities: Record<string, string> = {
    aries: 'Cardinal',
    taurus: 'Fixed',
    gemini: 'Mutable',
    cancer: 'Cardinal',
    leo: 'Fixed',
    virgo: 'Mutable',
    libra: 'Cardinal',
    scorpio: 'Fixed',
    sagittarius: 'Mutable',
    capricorn: 'Cardinal',
    aquarius: 'Fixed',
    pisces: 'Mutable',
  };

  const symbols: Record<string, string> = {
    aries: 'Ram',
    taurus: 'Bull',
    gemini: 'Twins',
    cancer: 'Crab',
    leo: 'Lion',
    virgo: 'Maiden',
    libra: 'Scales',
    scorpio: 'Scorpion',
    sagittarius: 'Archer',
    capricorn: 'Goat',
    aquarius: 'Water Bearer',
    pisces: 'Fish',
  };

  const elementSymbols = { Fire: '🜂', Earth: '🜃', Air: '🜁', Water: '🜄' };
  const modalitySymbols = { Cardinal: '🜍', Fixed: '🜔', Mutable: '🜕' };

  const element = elementMap[signKey] || 'Unknown';
  const signZodiacSymbol =
    zodiacSymbol[signKey as keyof typeof zodiacSymbol] || '';

  return {
    element,
    elementSymbol: elementSymbols[element as keyof typeof elementSymbols] || '',
    rulingPlanet: rulingPlanets[signKey] || 'Unknown',
    rulingPlanetSymbol:
      bodiesSymbols[
        rulingPlanets[signKey]?.toLowerCase() as keyof typeof bodiesSymbols
      ] || '',
    modality: modalities[signKey] || 'Unknown',
    modalitySymbol:
      modalitySymbols[modalities[signKey] as keyof typeof modalitySymbols] ||
      '',
    symbol: symbols[signKey] || 'Unknown',
    zodiacSymbol: signZodiacSymbol,
  };
};

export function MarketingDashboardPreview() {
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [moonExpanded, setMoonExpanded] = useState(false);
  const [influenceExpanded, setInfluenceExpanded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-expand moon phase on first viewport entry
  useEffect(() => {
    if (hasAutoExpanded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoExpanded) {
            setTimeout(() => {
              setMoonExpanded(true);
              setHasAutoExpanded(true);

              setTimeout(() => {
                setShowScrollHint(true);
                setTimeout(() => setShowScrollHint(false), 3000);
              }, 2000);
            }, 1500);
          }
        });
      },
      { threshold: 0.3 },
    );

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, [hasAutoExpanded]);

  // Hide scroll hint on user scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showScrollHint) {
        setShowScrollHint(false);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [showScrollHint]);

  const { marketing } = ctaExamples;
  const iconPath = getMoonPhaseIconPath(marketing.moonPhase.phase);
  const zodiacInfo = getZodiacInfo(marketing.moonPhase.sign);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const moonPreview = (
    <>
      <ExpandableCardHeader
        icon={
          <Image
            src={`/icons/moon-phases/${iconPath}.svg`}
            alt={marketing.moonPhase.phase}
            width={24}
            height={24}
          />
        }
        title={marketing.moonPhase.phase}
        subtitle={`in ${marketing.moonPhase.sign}`}
      />
      <p className='text-xs text-zinc-400 mt-1'>
        Next shift in {marketing.moonPhase.daysUntilNext}{' '}
        {marketing.moonPhase.daysUntilNext === 1 ? 'day' : 'days'}
      </p>
    </>
  );

  const moonExpanded_content = (
    <div className='pt-3 space-y-4'>
      <div className='grid grid-cols-4 gap-2 text-center'>
        <div>
          <span className='block text-base'>{zodiacInfo.elementSymbol}</span>
          <span className='text-xs text-zinc-400'>{zodiacInfo.element}</span>
        </div>
        <div>
          <span className='block text-base font-astro'>
            {zodiacInfo.rulingPlanetSymbol}
          </span>
          <span className='text-xs text-zinc-400'>
            {zodiacInfo.rulingPlanet}
          </span>
        </div>
        <div>
          <span className='block text-base'>{zodiacInfo.modalitySymbol}</span>
          <span className='text-xs text-zinc-400'>{zodiacInfo.modality}</span>
        </div>
        <div>
          <span className='block text-base font-astro'>
            {zodiacInfo.zodiacSymbol}
          </span>
          <span className='text-xs text-zinc-400'>{zodiacInfo.symbol}</span>
        </div>
      </div>
      <div>
        <h4 className='text-xs font-medium text-lunary-accent-300 capitalize tracking-wide mb-2'>
          Recommended Spell
        </h4>
        <p className='text-sm text-zinc-300'>{marketing.moonPhase.spell}</p>
      </div>
    </div>
  );

  const influencePreview = (
    <>
      <ExpandableCardHeader
        icon={<Sparkles className='w-5 h-5 text-lunary-primary-400' />}
        title="Today's Influence"
      />
      <p className='text-sm text-zinc-300 leading-relaxed mt-1'>
        {marketing.todayTheme}
      </p>
    </>
  );

  const influenceExpanded_content = (
    <div className='pt-3 space-y-2'>
      <p className='text-xs text-zinc-500'>
        {marketing.todayTransit.planet} {marketing.todayTransit.aspectSymbol}{' '}
        {marketing.todayTransit.natalPlanet} · in your{' '}
        {marketing.todayTransit.house}
        {marketing.todayTransit.house === 1
          ? 'st'
          : marketing.todayTransit.house === 2
            ? 'nd'
            : marketing.todayTransit.house === 3
              ? 'rd'
              : 'th'}{' '}
        house
      </p>
      <p className='text-sm text-zinc-300 leading-relaxed'>
        {marketing.todayTransit.meaning}
      </p>
    </div>
  );

  return (
    <div
      ref={previewRef}
      className='relative w-full max-w-[393px] mx-auto'
      style={{ height: '750px' }}
    >
      {/* iPhone frame */}
      <div
        className='relative w-full h-full bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden'
        style={{
          boxShadow:
            '0 18px 28px rgba(0, 0, 0, 0.28), 0 0 22px rgba(178, 126, 255, 0.18)',
        }}
      >
        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          className='h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent px-4 py-6'
        >
          {/* Greeting header */}
          <div className='mb-6'>
            <h1 className='text-lg text-zinc-100'>
              Good morning, {marketing.persona.name}
            </h1>
            <p className='text-sm text-zinc-400'>{currentDate}</p>
          </div>

          {/* Moon Phase card - ExpandableCard */}
          <div className='mb-3'>
            <ExpandableCard
              preview={moonPreview}
              expanded={moonExpanded_content}
              defaultExpanded={moonExpanded}
              onToggle={setMoonExpanded}
            />
          </div>

          {/* Today's Influence card - ExpandableCard */}
          <div className='mb-3'>
            <ExpandableCard
              preview={influencePreview}
              expanded={influenceExpanded_content}
              defaultExpanded={influenceExpanded}
              onToggle={setInfluenceExpanded}
            />
          </div>

          {/* Tarot card - static */}
          <div className='mb-3 py-3 px-4 border border-zinc-800/50 rounded-md bg-lunary-bg'>
            <div className='flex items-center gap-2 mb-1'>
              <Layers className='w-4 h-4 text-lunary-accent-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Daily Card
              </span>
              <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                Personal
              </span>
            </div>
            <p className='text-sm text-white font-semibold'>
              {marketing.tarotCard.name}
            </p>
            <p className='text-xs text-zinc-400'>
              {marketing.tarotCard.keywords}
            </p>
          </div>

          {/* Crystal card - static */}
          <div className='mb-3 py-3 px-4 border border-zinc-800/50 rounded-md bg-lunary-bg'>
            <div className='flex items-center gap-2 mb-1'>
              <Gem className='w-4 h-4 text-lunary-accent-200' />
              <span className='text-sm font-medium text-zinc-200'>
                Personal Crystal
              </span>
              <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                Personal
              </span>
            </div>
            <div className='text-base font-semibold text-white'>
              {marketing.crystal.name}
            </div>
            <p className='text-xs text-zinc-400 mt-1'>
              {marketing.crystal.meaning}
            </p>
          </div>

          {/* Extra padding for scroll demonstration */}
          <div className='h-20'></div>
        </div>

        {/* Scroll hint */}
        {showScrollHint && (
          <div className='absolute bottom-4 left-0 right-0 flex flex-col items-center animate-in fade-in duration-500'>
            <p className='text-xs text-zinc-500 mb-1'>Scroll to explore</p>
            <ChevronDown className='w-4 h-4 text-zinc-500 animate-bounce' />
          </div>
        )}
      </div>
    </div>
  );
}
