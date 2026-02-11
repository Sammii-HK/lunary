'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMoonData } from '@/context/AstronomyContext';
import { MoonPhaseLabels } from '../../../utils/moon/moonPhases';
import { bodiesSymbols, zodiacSymbol } from '@/constants/symbols';
import {
  ExpandableCard,
  ExpandableCardHeader,
} from '@/components/ui/expandable-card';
import { useUser } from '@/context/UserContext';
import { getPersonalizedHoroscope } from '../../../utils/astrology/personalizedHoroscope';
import { isInDemoMode } from '@/lib/demo-mode';
import { DailyCache } from '@/lib/cache/dailyCache';
import { getZodiacSymbol } from 'utils/astrology/cosmic-og';
import { ShareMoonPhase } from '@/components/share/ShareMoonPhase';

const ZODIAC_ELEMENTS: Record<string, string> = {
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

const NAMED_FULL_MOONS = [
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

function getMoonPhaseIconPath(phase: string | undefined): string {
  if (!phase) return 'full-moon';
  const lower = phase.toLowerCase();
  if (NAMED_FULL_MOONS.some((name) => lower.includes(name))) return 'full-moon';
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
}

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
  const signKey = sign.toLowerCase();
  const element = ZODIAC_ELEMENTS[signKey] || 'Unknown';

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
    element,
    elementSymbol: elementSymbols[element] || '',
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

interface MoonPreviewProps {
  isExpanded?: boolean; // Optional controlled state from parent
  onToggle?: (isExpanded: boolean) => void; // Optional callback when toggled
}

export const MoonPreview = ({
  isExpanded,
  onToggle,
}: MoonPreviewProps = {}) => {
  const { user } = useUser();
  const {
    currentMoonPhase,
    currentMoonConstellationPosition,
    moonIllumination,
    moonAge,
  } = useMoonData();
  const iconPath = getMoonPhaseIconPath(currentMoonPhase);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);

  // Detect mobile or demo mode to show compact symbol display
  const [isMobile, setIsMobile] = useState(false);
  const isDemoMode = isInDemoMode();

  // Check if viewport is mobile-sized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    };

    checkMobile();
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    mediaQuery.addEventListener('change', checkMobile);
    return () => mediaQuery.removeEventListener('change', checkMobile);
  }, []);

  const nextPhaseInfo = getDaysUntilNextPhase(currentMoonPhase, moonAge);
  const zodiacInfo = getZodiacInfo(currentMoonConstellationPosition || '');

  // Show zodiac symbol only on mobile or in demo mode
  const shouldShowSymbolOnly = isMobile || isDemoMode;
  const moonPhaseConstellation =
    shouldShowSymbolOnly && currentMoonConstellationPosition ? (
      <span className='font-astro'>
        {getZodiacSymbol(currentMoonConstellationPosition)}
      </span>
    ) : (
      currentMoonConstellationPosition
    );
  const illuminationDisplay = Math.round(moonIllumination);

  const personalizedHoroscope = user?.birthday
    ? getPersonalizedHoroscope(user.birthday)
    : null;
  const lunarPhaseDay = personalizedHoroscope?.lunarPhaseDay;
  const lunarCycleProgress = personalizedHoroscope?.lunarCycleProgress;
  const cycleLine =
    lunarPhaseDay && currentMoonPhase
      ? `Day ${lunarPhaseDay} of the ${currentMoonPhase}${
          typeof lunarCycleProgress === 'number'
            ? ` · ${lunarCycleProgress}% through the lunar cycle`
            : ''
        }`
      : null;

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

    // Check cache first
    const cacheKey = `spells_${normalizedPhase}`;
    const cached = DailyCache.get<Spell[]>(cacheKey);

    if (cached) {
      setSpells(cached.slice(0, 3));
      setLoading(false);
      return;
    }

    // Cache miss, fetch from API
    fetch(
      `/api/grimoire/spells?moonPhase=${encodeURIComponent(normalizedPhase)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        // Cache all 3 but display count is controlled by isMobile in render
        const spellData = (data || []).slice(0, 3);
        DailyCache.set(cacheKey, data || [], 'daily');
        setSpells(spellData);
        setLoading(false);
      })
      .catch(() => {
        setSpells([]);
        setLoading(false);
      });
  }, [currentMoonPhase]);

  if (!currentMoonPhase) {
    return (
      <div className='py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md animate-pulse'>
        <div className='h-5 w-32 bg-zinc-800 rounded' />
      </div>
    );
  }

  const preview = (
    <>
      <ExpandableCardHeader
        icon={
          <Image
            src={`/icons/moon-phases/${iconPath}.svg`}
            alt={currentMoonPhase}
            width={24}
            height={24}
          />
        }
        title={currentMoonPhase}
        subtitle={
          currentMoonConstellationPosition ? (
            <>
              in {moonPhaseConstellation} {illuminationDisplay}% illuminated
            </>
          ) : (
            <>{illuminationDisplay}% illuminated</>
          )
        }
        action={
          <div onClick={(e) => e.stopPropagation()}>
            <ShareMoonPhase
              moonPhase={currentMoonPhase}
              moonSign={currentMoonConstellationPosition || undefined}
              illumination={illuminationDisplay}
              compact
            />
          </div>
        }
      />
      {cycleLine && <p className='text-xs text-zinc-400 mt-1'>{cycleLine}</p>}
      <p className='text-xs text-zinc-400 mt-1'>
        Next shift in {nextPhaseInfo.days}{' '}
        {nextPhaseInfo.days === 1 ? 'day' : 'days'}
      </p>
    </>
  );

  const expanded = (
    <div className='pt-3 space-y-4'>
      {currentMoonConstellationPosition && (
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
          <h4 className='text-xs text-lunary-accent-300 capitalize tracking-wide mb-2'>
            Recommended Spells
          </h4>
          <div className='space-y-2'>
            {spells.slice(0, isMobile ? 1 : 3).map((spell) => (
              <Link
                key={spell.id}
                href={`/grimoire/spells/${spell.id}`}
                className='block p-2 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors'
              >
                <p className='text-sm text-zinc-200'>{spell.title}</p>
                <p className='text-xs text-zinc-400'>{spell.purpose}</p>
              </Link>
            ))}
          </div>
          <Link
            href='/grimoire/spells'
            className='inline-block text-xs text-lunary-accent hover:text-lunary-accent-300 transition-colors mt-2'
          >
            Browse all spells
          </Link>
        </div>
      ) : null}

      <Link
        href='/grimoire/moon'
        className='inline-block text-xs text-lunary-accent hover:text-lunary-accent-300 transition-colors'
      >
        Learn more about moon phases
      </Link>
    </div>
  );

  return (
    <ExpandableCard
      preview={preview}
      expanded={expanded}
      autoExpandOnDesktop
      isExpanded={isExpanded}
      onToggle={onToggle}
      className='moon-preview-card'
      data-testid='moon-phase-card'
    />
  );
};
