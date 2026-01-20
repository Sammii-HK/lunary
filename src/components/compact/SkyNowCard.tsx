'use client';

import { useMemo, useState } from 'react';
import { Check, Map, MapPin, Telescope, X } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { BirthChartPlacement, useUser } from '@/context/UserContext';
import { ChartWheelSvg } from '@/app/birth-chart/chart-wheel-svg';
import {
  ZODIAC_SIGNS,
  bodiesSymbols,
  zodiacSymbol,
} from '../../../utils/zodiac/zodiac';
import {
  ExpandableCard,
  ExpandableCardHeader,
} from '@/components/ui/expandable-card';

const getPlanetMeaning = (planet: string, sign: string): string => {
  const planetMeanings: Record<string, Record<string, string>> = {
    Sun: {
      Aries: 'Bold self-expression, pioneering energy',
      Taurus: 'Steady determination, sensual appreciation',
      Gemini: 'Curious communication, adaptable thinking',
      Cancer: 'Emotional depth, nurturing focus',
      Leo: 'Creative confidence, generous spirit',
      Virgo: 'Practical service, analytical mind',
      Libra: 'Harmonious relationships, aesthetic appreciation',
      Scorpio: 'Transformative intensity, deep insight',
      Sagittarius: 'Adventurous optimism, philosophical growth',
      Capricorn: 'Ambitious discipline, long-term goals',
      Aquarius: 'Innovative thinking, humanitarian ideals',
      Pisces: 'Intuitive compassion, spiritual connection',
    },
    Moon: {
      Aries: 'Quick emotional responses, need for independence',
      Taurus: 'Emotional stability, comfort-seeking',
      Gemini: 'Emotionally curious, need for variety',
      Cancer: 'Deep sensitivity, nurturing instincts',
      Leo: 'Dramatic feelings, need for appreciation',
      Virgo: 'Analytical emotions, service-oriented',
      Libra: 'Balanced feelings, relationship focus',
      Scorpio: 'Intense emotions, transformative depth',
      Sagittarius: 'Optimistic feelings, need for freedom',
      Capricorn: 'Reserved emotions, practical approach',
      Aquarius: 'Detached perspective, unique responses',
      Pisces: 'Empathic sensitivity, intuitive flow',
    },
    Mercury: {
      Aries: 'Direct communication, quick thinking',
      Taurus: 'Deliberate thinking, practical ideas',
      Gemini: 'Versatile communication, curious mind',
      Cancer: 'Intuitive thinking, emotional intelligence',
      Leo: 'Confident expression, creative ideas',
      Virgo: 'Precise analysis, detailed thinking',
      Libra: 'Diplomatic communication, balanced views',
      Scorpio: 'Deep investigation, penetrating insight',
      Sagittarius: 'Big-picture thinking, philosophical ideas',
      Capricorn: 'Structured thinking, goal-oriented plans',
      Aquarius: 'Innovative ideas, unconventional thinking',
      Pisces: 'Imaginative thinking, intuitive communication',
    },
    Venus: {
      Aries: 'Passionate attraction, bold in love',
      Taurus: 'Sensual pleasure, stable affection',
      Gemini: 'Playful flirtation, intellectual connection',
      Cancer: 'Nurturing love, emotional bonding',
      Leo: 'Generous romance, dramatic affection',
      Virgo: 'Practical love, thoughtful care',
      Libra: 'Harmonious partnership, refined taste',
      Scorpio: 'Intense bonding, deep commitment',
      Sagittarius: 'Adventurous love, philosophical connection',
      Capricorn: 'Committed partnership, traditional values',
      Aquarius: 'Friendship-based love, unique attraction',
      Pisces: 'Spiritual love, compassionate connection',
    },
    Mars: {
      Aries: 'Direct action, competitive drive',
      Taurus: 'Steady persistence, determined effort',
      Gemini: 'Mental energy, versatile action',
      Cancer: 'Protective action, emotional motivation',
      Leo: 'Confident leadership, creative drive',
      Virgo: 'Precise execution, practical effort',
      Libra: 'Diplomatic action, collaborative effort',
      Scorpio: 'Intense focus, strategic power',
      Sagittarius: 'Adventurous pursuit, expansive action',
      Capricorn: 'Disciplined drive, strategic planning',
      Aquarius: 'Unconventional action, group cooperation',
      Pisces: 'Intuitive action, compassionate effort',
    },
    Jupiter: {
      Aries: 'Bold expansion, pioneering growth',
      Taurus: 'Abundance through patience, material growth',
      Gemini: 'Intellectual expansion, diverse opportunities',
      Cancer: 'Emotional growth, family blessings',
      Leo: 'Creative fortune, generous success',
      Virgo: 'Growth through service, practical wisdom',
      Libra: 'Relationship blessings, harmonious growth',
      Scorpio: 'Transformative growth, deep wisdom',
      Sagittarius: 'Expansive optimism, philosophical fortune',
      Capricorn: 'Disciplined success, structured growth',
      Aquarius: 'Innovative expansion, humanitarian vision',
      Pisces: 'Spiritual abundance, compassionate wisdom',
    },
    Saturn: {
      Aries: 'Disciplined initiative, structured courage',
      Taurus: 'Patient building, lasting foundations',
      Gemini: 'Focused communication, mental discipline',
      Cancer: 'Emotional boundaries, family responsibility',
      Leo: 'Creative discipline, humble leadership',
      Virgo: 'Meticulous work, health discipline',
      Libra: 'Relationship karma, balanced commitment',
      Scorpio: 'Deep responsibility, transformative limits',
      Sagittarius: 'Philosophical tests, disciplined freedom',
      Capricorn: 'Mastery through effort, ambitious goals',
      Aquarius: 'Structured innovation, social responsibility',
      Pisces: 'Spiritual discipline, compassionate boundaries',
    },
    Uranus: {
      default: 'Innovation, awakening, and sudden change',
    },
    Neptune: {
      default: 'Dreams, intuition, and spiritual connection',
    },
    Pluto: {
      default: 'Deep transformation, power, and renewal',
    },
  };

  const planetData = planetMeanings[planet];
  if (!planetData) return 'Cosmic influence';
  return planetData[sign] || planetData.default || 'Cosmic influence';
};

const getRetrogradeGuidance = (planet: string, sign: string): string => {
  const guidance: Record<string, string> = {
    Mercury: `Communication slows down in ${sign}. Double-check messages, revisit old ideas, and avoid signing contracts if possible. Great for editing and reconnecting with old friends.`,
    Venus: `Love and finances get a second look in ${sign}. Reconnect with what you truly value. Ex-partners may resurface. Avoid major purchases or style changes.`,
    Mars: `Energy turns inward in ${sign}. Frustrations may simmer. Channel action into completing old projects rather than starting new ones. Avoid conflict.`,
    Jupiter: `Growth slows for inner expansion in ${sign}. Reassess your beliefs and long-term goals. Luck comes from revisiting past opportunities.`,
    Saturn: `Karma returns in ${sign}. Past responsibilities demand attention. Restructure commitments and learn from delays. Patience is essential.`,
    Uranus: `Unexpected changes reverse course in ${sign}. Innovation requires reflection. Freedom issues need internal resolution first.`,
    Neptune: `Illusions clarify in ${sign}. Dreams reveal deeper truths. Creative projects benefit from revision. Trust your intuition more than external input.`,
    Pluto: `Deep transformation intensifies in ${sign}. Power dynamics shift internally. Shadow work becomes essential. Release what no longer serves you.`,
  };
  return (
    guidance[planet] ||
    `${planet} retrograde invites reflection and review of its themes.`
  );
};

const getPlanetSymbol = (planet: string): string => {
  const key = planet.toLowerCase() as keyof typeof bodiesSymbols;
  return bodiesSymbols[key] || planet.charAt(0);
};

const getZodiacSymbol = (sign: string): string => {
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] || sign.charAt(0);
};

const normalizeSignName = (sign?: string): string => {
  if (!sign) return '';
  const lower = sign.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

type HouseCusp = {
  house: number;
  eclipticLongitude: number;
};

const calculateWholeSignHouses = (ascendantLongitude: number): HouseCusp[] => {
  const houses: HouseCusp[] = [];
  const ascSign = Math.floor(ascendantLongitude / 30);
  for (let i = 0; i < 12; i += 1) {
    const sign = (ascSign + i) % 12;
    houses.push({
      house: i + 1,
      eclipticLongitude: (sign * 30) % 360,
    });
  }
  return houses;
};

const getHouseForLongitude = (
  longitude: number,
  houses: HouseCusp[],
): number => {
  for (let i = 0; i < 12; i += 1) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];
    const start = currentHouse.eclipticLongitude;
    const end = nextHouse.eclipticLongitude;

    if (end <= start) {
      if (longitude >= start || longitude < end) {
        return currentHouse.house;
      }
    } else if (longitude >= start && longitude < end) {
      return currentHouse.house;
    }
  }
  return 1;
};

type NatalHouseInfo = {
  houses: HouseCusp[];
  bodyLookup: Record<string, number>;
  signLookup: Record<string, number>;
};

const buildNatalHouseInfo = (
  birthChart?: BirthChartPlacement[] | null,
): NatalHouseInfo | null => {
  if (!birthChart) return null;
  const ascendant = birthChart.find(
    (placement) => placement.body === 'Ascendant',
  );
  if (!ascendant) return null;

  const houses = calculateWholeSignHouses(ascendant.eclipticLongitude);
  const bodyLookup: Record<string, number> = {};
  birthChart.forEach((placement) => {
    if (placement.body) {
      bodyLookup[placement.body] =
        placement.house ??
        getHouseForLongitude(placement.eclipticLongitude, houses);
    }
  });

  const signLookup: Record<string, number> = {};
  houses.forEach((house) => {
    const signIndex = Math.floor(house.eclipticLongitude / 30) % 12;
    const signName = ZODIAC_SIGNS[signIndex];
    if (signName) {
      signLookup[signName] = house.house;
    }
  });

  return {
    houses,
    bodyLookup,
    signLookup,
  };
};

export const SkyNowCard = () => {
  const { user } = useUser();
  const { currentAstrologicalChart } = useAstronomyContext();
  const {
    requestLocation,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const [showLocationFeedback, setShowLocationFeedback] = useState(false);
  const [refreshState, setRefreshState] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [showChartModal, setShowChartModal] = useState(false);
  const handleRefreshLocation = async () => {
    setRefreshState('idle');
    try {
      await requestLocation();
      setRefreshState('success');
    } catch {
      setRefreshState('error');
    } finally {
      setShowLocationFeedback(true);
      setTimeout(() => {
        setShowLocationFeedback(false);
        setRefreshState('idle');
      }, 2000);
    }
  };

  const planets = useMemo(() => {
    if (!currentAstrologicalChart || currentAstrologicalChart.length === 0) {
      return [];
    }
    return currentAstrologicalChart;
  }, [currentAstrologicalChart]);

  const retrogradeCount = useMemo(() => {
    return planets.filter((p) => p.retrograde).length;
  }, [planets]);

  const chartData = useMemo(() => {
    return planets.map((planet) => ({
      body: planet.body,
      sign: planet.sign,
      degree: planet.formattedDegree?.degree ?? 0,
      minute: planet.formattedDegree?.minute ?? 0,
      eclipticLongitude: planet.eclipticLongitude,
      retrograde: planet.retrograde,
    }));
  }, [planets]);

  const natalHouseInfo = useMemo(
    () => buildNatalHouseInfo(user?.birthChart),
    [user?.birthChart],
  );
  const natalHouseLookup = natalHouseInfo?.bodyLookup ?? {};
  const natalSignHouseLookup = natalHouseInfo?.signLookup ?? {};
  const natalHouses = natalHouseInfo?.houses;

  if (planets.length === 0) {
    return (
      <div className='py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md animate-pulse'>
        <div className='h-5 w-32 bg-zinc-800 rounded' />
      </div>
    );
  }

  const preview = (
    <div className='w-full'>
      <ExpandableCardHeader
        icon={<Telescope className='w-4 h-4 text-lunary-secondary-300' />}
        title='Sky Now'
        badge={
          retrogradeCount > 0 ? `${retrogradeCount} Retrograde` : undefined
        }
        badgeVariant={retrogradeCount > 0 ? 'danger' : 'default'}
        action={
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={async (event) => {
                event.stopPropagation();
                await handleRefreshLocation();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  void handleRefreshLocation();
                }
              }}
              aria-label='Refresh location used for Sky Now'
              title='Refresh my location'
              className='p-0.5 rounded-full border border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors relative'
            >
              {refreshState === 'success' ? (
                <Check className='w-3 h-3 text-lunary-success' />
              ) : (
                <MapPin
                  className={`w-3 h-3 ${locationLoading ? 'animate-pulse' : ''}`}
                />
              )}
              {showLocationFeedback && locationError && (
                <span className='absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-zinc-300'>
                  Failed
                </span>
              )}
            </button>
            <button
              type='button'
              onClick={(event) => {
                event.stopPropagation();
                setShowChartModal(true);
              }}
              className='p-0.5 rounded-full border border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors'
              aria-label='Open chart modal'
              title='Open chart modal'
            >
              <Map className='w-3 h-3' />
            </button>
          </div>
        }
      />
      <div className='mt-2 space-y-1 w-full'>
        <div className='grid grid-cols-10 gap-y-2 w-full text-center'>
          {planets.map((planet) => (
            <div
              key={planet.body}
              className='flex flex-col items-center justify-center gap-0'
            >
              <span
                className={`font-astro text-base ${planet.retrograde ? 'text-lunary-error-300' : 'text-zinc-300'}`}
                title={planet.body}
              >
                {getPlanetSymbol(planet.body)}
              </span>
              <span
                className={`text-xs font-astro tracking-wider ${
                  planet.retrograde ? 'text-lunary-error-300' : 'text-zinc-400'
                }`}
              >
                {getZodiacSymbol(planet.sign)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const expanded = (
    <div className='pt-3 space-y-4'>
      <div className='space-y-2'>
        {planets.map((planet) => {
          const normalizedSign = normalizeSignName(planet.sign);
          return (
            <div
              key={planet.body}
              className={`py-2 border-b border-zinc-800/30 last:border-0 ${planet.retrograde ? 'text-lunary-error-200' : ''}`}
            >
              <div className='flex items-baseline gap-2'>
                <span
                  className={`font-astro text-lg ${planet.retrograde ? 'text-lunary-error-300' : 'text-lunary-secondary-300'}`}
                >
                  {getPlanetSymbol(planet.body)}
                </span>
                <span className='text-sm font-medium text-zinc-200'>
                  {planet.body}
                </span>
                <span className='font-astro text-zinc-400'>
                  {getZodiacSymbol(planet.sign)}
                </span>
                <span className='text-sm text-zinc-400'>
                  {planet.sign} {planet.formattedDegree?.degree || 0}°
                  {planet.formattedDegree?.minute !== undefined &&
                    `${planet.formattedDegree.minute}'`}
                </span>
                {natalSignHouseLookup[normalizedSign] != null && (
                  <span className='text-xs uppercase text-zinc-500'>
                    {natalSignHouseLookup[normalizedSign]}H
                  </span>
                )}
                {planet.retrograde && (
                  <span className='text-xs text-lunary-error-300 font-medium'>
                    ℞
                  </span>
                )}
              </div>
              <p className='text-xs text-zinc-400 mt-1 ml-7'>
                {getPlanetMeaning(planet.body, planet.sign)}
              </p>
              {planet.retrograde && (
                <p className='text-xs text-lunary-error-300/80 mt-1 ml-7 leading-relaxed'>
                  {getRetrogradeGuidance(planet.body, planet.sign)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <ExpandableCard
        preview={preview}
        expanded={expanded}
        autoExpandOnDesktop
      />
      {showChartModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'
          role='presentation'
          onClick={() => setShowChartModal(false)}
        >
          <div
            className='relative w-[min(90vw,560px)] rounded-[32px] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl'
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type='button'
              className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-200'
              onClick={() => setShowChartModal(false)}
            >
              <X className='w-4 h-4' />
            </button>
            <div className='flex justify-center'>
              <ChartWheelSvg
                birthChart={chartData}
                size={420}
                houses={natalHouses as HouseCusp[] | null}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
