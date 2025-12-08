'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { MoonPhaseLabels } from '../../../utils/moon/moonPhases';
import {
  zodiacSigns,
  bodiesSymbols,
  zodiacSymbol,
} from '../../../utils/zodiac/zodiac';
import {
  ExpandableCard,
  ExpandableCardHeader,
} from '@/components/ui/expandable-card';

interface Spell {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  purpose: string;
}

const getMoonPhaseGuidance = (phase: MoonPhaseLabels, sign: string): string => {
  const phaseEnergy: Record<MoonPhaseLabels, string> = {
    'New Moon':
      'A time of new beginnings and potential. The darkness holds space for what wants to emerge.',
    'Waxing Crescent':
      'Energy is building. Ideas planted at the new moon begin to take shape and form.',
    'First Quarter':
      'A point of tension and decision. Challenges may surface that clarify direction.',
    'Waxing Gibbous':
      'Momentum continues to build. Refinement and adjustment happen naturally as things develop.',
    'Full Moon':
      'Maximum illumination. What was hidden becomes visible. Emotions and insights peak.',
    'Waning Gibbous':
      'The height has passed. A natural time for reflection on what has unfolded.',
    'Last Quarter':
      'Release energy. Old patterns and attachments naturally fall away.',
    'Waning Crescent':
      'The quietest phase. Rest, dreams, and the unconscious are especially accessible.',
  };

  const signEnergy: Record<string, string> = {
    Aries: 'Aries brings courage, independence, and pioneering spirit.',
    Taurus: 'Taurus emphasizes stability, comfort, and what is truly valued.',
    Gemini: 'Gemini heightens curiosity, communication, and mental agility.',
    Cancer:
      'Cancer deepens intuition, emotional awareness, and nurturing instincts.',
    Leo: 'Leo amplifies creativity, self-expression, and generous warmth.',
    Virgo:
      'Virgo sharpens attention to detail, analysis, and practical service.',
    Libra: 'Libra seeks balance, harmony, and connection in relationships.',
    Scorpio: 'Scorpio intensifies depth, transformation, and emotional truth.',
    Sagittarius:
      'Sagittarius expands horizons, meaning, and adventurous spirit.',
    Capricorn: 'Capricorn grounds ambition, discipline, and long-term vision.',
    Aquarius: 'Aquarius sparks innovation, community, and unique perspectives.',
    Pisces:
      'Pisces dissolves boundaries, heightening dreams, intuition, and compassion.',
  };

  const phaseText = phaseEnergy[phase] || '';
  const signText = signEnergy[sign] || '';

  if (phaseText && signText) {
    return `${phaseText} ${signText}`;
  }
  return phaseText || signText || '';
};

const getZodiacInfo = (sign: string) => {
  const signKey = sign.toLowerCase() as keyof typeof zodiacSigns;
  const signData = zodiacSigns[signKey];

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

  const elementSymbols: Record<string, string> = {
    Fire: '🜂',
    Earth: '🜃',
    Air: '🜁',
    Water: '🜄',
  };

  const modalitySymbols: Record<string, string> = {
    Cardinal: '🜍',
    Fixed: '🜔',
    Mutable: '🜕',
  };

  const signZodiacSymbol =
    zodiacSymbol[signKey as keyof typeof zodiacSymbol] || '';

  return {
    element: signData?.element || 'Unknown',
    elementSymbol: elementSymbols[signData?.element || ''] || '',
    rulingPlanet: rulingPlanets[signKey] || 'Unknown',
    rulingPlanetSymbol:
      bodiesSymbols[
        rulingPlanets[signKey]?.toLowerCase() as keyof typeof bodiesSymbols
      ] || '',
    modality: modalities[signKey] || 'Unknown',
    modalitySymbol: modalitySymbols[modalities[signKey] || ''] || '',
    symbol: symbols[signKey] || 'Unknown',
    zodiacSymbol: signZodiacSymbol,
  };
};

const getDaysUntilNextPhase = (
  currentPhase: MoonPhaseLabels,
  moonAge: number,
): { phase: string; days: number } => {
  const phaseOrder: MoonPhaseLabels[] = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];

  const phaseBoundaries = [0, 1.84, 7.38, 11.07, 14.76, 18.45, 22.14, 25.83];
  const lunarCycle = 29.53;

  const currentIndex = phaseOrder.indexOf(currentPhase);
  const nextIndex = (currentIndex + 1) % 8;
  const nextPhase = phaseOrder[nextIndex];

  const nextBoundary =
    nextIndex === 0 ? lunarCycle : phaseBoundaries[nextIndex];
  const daysUntil = Math.max(1, Math.ceil(nextBoundary - moonAge));

  return {
    phase: nextPhase,
    days: daysUntil > 7 ? Math.ceil(daysUntil % 7) || 1 : daysUntil,
  };
};

export const MoonPreview = () => {
  const {
    currentMoonPhase,
    currentMoonConstellationPosition,
    symbol,
    moonIllumination,
    moonAge,
  } = useAstronomyContext();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);

  const nextPhaseInfo = getDaysUntilNextPhase(currentMoonPhase, moonAge);
  const zodiacInfo = getZodiacInfo(currentMoonConstellationPosition || '');
  const illuminationDisplay = Math.round(moonIllumination);

  useEffect(() => {
    if (!currentMoonPhase) return;

    // Normalize named moons to base phase for spell lookup
    const namedFullMoons = [
      'wolf moon',
      'snow moon',
      'worm moon',
      'pink moon',
      'flower moon',
      'strawberry moon',
      'buck moon',
      'sturgeon moon',
      'harvest moon',
      'hunter moon',
      'beaver moon',
      'cold moon',
    ];
    const phaseLower = currentMoonPhase.toLowerCase();
    const normalizedPhase = namedFullMoons.some((name) =>
      phaseLower.includes(name),
    )
      ? 'Full Moon'
      : currentMoonPhase;

    fetch(
      `/api/grimoire/spells?moonPhase=${encodeURIComponent(normalizedPhase)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setSpells((data || []).slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        setSpells([]);
        setLoading(false);
      });
  }, [currentMoonPhase]);

  if (!currentMoonPhase) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md animate-pulse'>
        <div className='h-5 w-32 bg-zinc-800 rounded' />
      </div>
    );
  }

  const preview = (
    <>
      <ExpandableCardHeader
        icon={<span className='text-xl'>{symbol}</span>}
        title={currentMoonPhase}
        subtitle={
          currentMoonConstellationPosition
            ? `in ${currentMoonConstellationPosition} · ${illuminationDisplay}%`
            : `${illuminationDisplay}% illuminated`
        }
      />
      <p className='text-xs text-zinc-500 mt-1'>
        {nextPhaseInfo.days} {nextPhaseInfo.days === 1 ? 'day' : 'days'} until{' '}
        {nextPhaseInfo.phase}
      </p>
    </>
  );

  const expanded = (
    <div className='pt-3 space-y-4'>
      {currentMoonConstellationPosition && (
        <div className='grid grid-cols-4 gap-2 text-center'>
          <div>
            <span className='block text-base'>{zodiacInfo.elementSymbol}</span>
            <span className='text-xs text-zinc-500'>{zodiacInfo.element}</span>
          </div>
          <div>
            <span className='block text-base font-astro'>
              {zodiacInfo.rulingPlanetSymbol}
            </span>
            <span className='text-xs text-zinc-500'>
              {zodiacInfo.rulingPlanet}
            </span>
          </div>
          <div>
            <span className='block text-base'>{zodiacInfo.modalitySymbol}</span>
            <span className='text-xs text-zinc-500'>{zodiacInfo.modality}</span>
          </div>
          <div>
            <span className='block text-base font-astro'>
              {zodiacInfo.zodiacSymbol}
            </span>
            <span className='text-xs text-zinc-500'>{zodiacInfo.symbol}</span>
          </div>
        </div>
      )}

      <p className='text-sm text-zinc-300 leading-relaxed'>
        {getMoonPhaseGuidance(
          currentMoonPhase as MoonPhaseLabels,
          currentMoonConstellationPosition || '',
        )}
      </p>

      {loading ? (
        <div className='space-y-2'>
          <div className='h-4 w-full bg-zinc-800 rounded animate-pulse' />
          <div className='h-4 w-3/4 bg-zinc-800 rounded animate-pulse' />
        </div>
      ) : spells.length > 0 ? (
        <div>
          <h4 className='text-xs font-medium text-lunary-accent uppercase tracking-wide mb-2'>
            Recommended Spells
          </h4>
          <div className='space-y-2'>
            {spells.map((spell) => (
              <Link
                key={spell.id}
                href={`/grimoire/practices#${spell.id}`}
                className='block p-2 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors'
              >
                <p className='text-sm text-zinc-200'>{spell.title}</p>
                <p className='text-xs text-zinc-500'>{spell.purpose}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <Link
        href='/grimoire/moon'
        className='inline-block text-xs text-lunary-accent hover:text-lunary-accent-300 transition-colors'
      >
        Learn more about moon phases →
      </Link>
    </div>
  );

  return (
    <ExpandableCard preview={preview} expanded={expanded} autoExpandOnDesktop />
  );
};
