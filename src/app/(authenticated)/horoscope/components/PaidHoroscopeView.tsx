'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { Share2 } from 'lucide-react';
import { getEnhancedPersonalizedHoroscope } from '../../../../../utils/astrology/enhancedHoroscope';
import {
  getBirthChartFromProfile,
  BirthChartData,
} from '../../../../../utils/astrology/birthChart';
import { getAstrologicalChart } from '../../../../../utils/astrology/astrology';
import { getSolarReturnInsights } from '../../../../../utils/astrology/transitCalendar';
import { getPersonalTransitImpacts } from '../../../../../utils/astrology/personalTransits';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { PersonalTransitImpactCard } from './PersonalTransitImpact';
import { TodaysAspects } from './TodaysAspects';
import { TransitWisdom } from './TransitWisdom';

const GuideNudge = dynamic(
  () =>
    import('@/components/GuideNudge').then((m) => ({
      default: m.GuideNudge,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);
import { PremiumPathway } from '@/components/PremiumPathway';
import { getPersonalDayNumber } from '@/lib/numerology/personalNumbers';
import {
  getNumerologyDetail,
  type NumerologyDetailContext,
} from '@/lib/numerology/numerologyDetails';
import {
  buildHoroscopeNumerologyShareUrl,
  getShareOrigin,
  type NumerologyShareNumber,
} from '@/lib/og/horoscopeShare';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import {
  NumerologyInfoModal,
  type NumerologyModalPayload,
} from '@/components/grimoire/NumerologyInfoModal';

interface PaidHoroscopeViewProps {
  userBirthday?: string;
  userName?: string;
  profile: any;
}

const generatePersonalizedHoroscope = (
  birthChart: BirthChartData[],
  currentTransits: any[],
  userName?: string,
  userBirthday?: string,
): string => {
  const today = dayjs();

  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Aries';

  const transitSun = currentTransits.find((p) => p.body === 'Sun');
  const transitMoon = currentTransits.find((p) => p.body === 'Moon');
  const transitMercury = currentTransits.find((p) => p.body === 'Mercury');
  const transitVenus = currentTransits.find((p) => p.body === 'Venus');
  const transitMars = currentTransits.find((p) => p.body === 'Mars');

  const aspects = calculateKeyAspects(birthChart, currentTransits);
  const horoscopeElements: string[] = [];

  const dayOfWeek = today.format('dddd');
  const numerologyInfluence = getDailyNumerology(today);

  horoscopeElements.push(
    `${dayOfWeek} brings ${numerologyInfluence.meaning} to your ${sunSign} nature.`,
  );

  if (transitSun) {
    if (transitSun.sign === sunSign) {
      horoscopeElements.push(
        `With the Sun illuminating your natal sign, this is your season of maximum vitality and authentic self-expression. Your natural ${sunSign} qualities are magnified, making this an ideal time to step into leadership roles and pursue goals that align with your core identity.`,
      );
    } else {
      horoscopeElements.push(
        `Sun in ${transitSun.sign} highlights ${getSunTransitMeaning(transitSun.sign)}.`,
      );
    }
  }

  if (transitMoon) {
    if (transitMoon.sign === moonSign) {
      horoscopeElements.push(
        `The Moon's return to your natal ${moonSign} creates an emotionally familiar and comfortable atmosphere. Your instinctive responses are heightened, and you may find yourself naturally gravitating toward activities that nurture your soul.`,
      );
    } else {
      horoscopeElements.push(
        `Moon in ${transitMoon.sign} ${getMoonInfluence(transitMoon.sign)}.`,
      );
    }
  }

  const primaryAspect = aspects[0];
  if (primaryAspect) {
    const birthPlanetSign = getBirthPlanetSign(
      primaryAspect.natalPlanet,
      birthChart,
    );
    horoscopeElements.push(
      `Today's most significant cosmic influence is ${primaryAspect.transitPlanet} ${getAspectDescription(primaryAspect)} your birth ${primaryAspect.natalPlanet} at ${birthPlanetSign}. ${getDetailedAspectMeaning(primaryAspect)} This creates a powerful focus on ${getPlanetTheme(primaryAspect.natalPlanet)} in your life.`,
    );
  }

  const secondaryAspect = aspects[1];
  if (secondaryAspect) {
    const birthPlanetSign = getBirthPlanetSign(
      secondaryAspect.natalPlanet,
      birthChart,
    );
    horoscopeElements.push(
      `A secondary influence comes from ${secondaryAspect.transitPlanet} ${getAspectDescription(secondaryAspect)} your birth ${secondaryAspect.natalPlanet} at ${birthPlanetSign}, adding ${getAspectQuality(secondaryAspect.type)} energy to ${getPlanetTheme(secondaryAspect.natalPlanet)} matters.`,
    );
  }

  if (transitMercury) {
    const mercuryAspect = aspects.find((a) => a.transitPlanet === 'Mercury');
    if (mercuryAspect) {
      horoscopeElements.push(
        `Mercury's current position particularly emphasizes ${getMercuryGuidance(transitMercury.sign)}, while its connection to your natal chart suggests this is an especially significant day for mental clarity and purposeful communication.`,
      );
    } else {
      horoscopeElements.push(
        `With Mercury in ${transitMercury.sign}, the intellectual atmosphere supports ${getMercuryGuidance(transitMercury.sign)}.`,
      );
    }
  }

  const venusAspect = aspects.find((a) => a.transitPlanet === 'Venus');
  if (venusAspect && transitVenus) {
    horoscopeElements.push(
      `Venus in ${transitVenus.sign} highlights ${getVenusGuidance(transitVenus.sign)} in ${getPlanetTheme(venusAspect.natalPlanet)}.`,
    );
  }

  const marsAspect = aspects.find((a) => a.transitPlanet === 'Mars');
  if (marsAspect && transitMars) {
    horoscopeElements.push(
      `Mars in ${transitMars.sign} energizes ${getPlanetTheme(marsAspect.natalPlanet)}. Channel this drive constructively.`,
    );
  }

  const retrogradeInfluences = getRetrogradeInfluences(
    currentTransits,
    birthChart,
  );
  if (retrogradeInfluences.length > 0) {
    horoscopeElements.push(retrogradeInfluences.join(' '));
  }

  const jupiterAspect = aspects.find((a) => a.transitPlanet === 'Jupiter');
  if (jupiterAspect) {
    horoscopeElements.push(
      `Jupiter opens doorways for growth and broader perspectives.`,
    );
  }

  if (aspects.length > 1) {
    const hasChallengingAspects = aspects.some(
      (a) => a.type === 'square' || a.type === 'opposition',
    );
    const hasHarmoniousAspects = aspects.some(
      (a) => a.type === 'trine' || a.type === 'sextile',
    );

    if (hasChallengingAspects && hasHarmoniousAspects) {
      horoscopeElements.push(`Mixed energies today.`);
    } else if (hasChallengingAspects) {
      horoscopeElements.push(
        `Growth emerges from today's constructive challenges.`,
      );
    } else if (hasHarmoniousAspects) {
      horoscopeElements.push(`Harmonious energies support advancement today.`);
    }
  }

  const closingOptions = [
    `Trust your ${sunSign} instincts today.`,
    `Honor your ${moonSign} emotional wisdom.`,
    `The cosmic currents support your growth.`,
    `Trust your ${sunSign} nature.`,
  ];

  const closingIndex = today.dayOfYear() % closingOptions.length;
  horoscopeElements.push(closingOptions[closingIndex]);

  return horoscopeElements.join(' ');
};

const formatDegreeForText = (longitude: number): string => {
  const degreeInSign = longitude % 30;
  const wholeDegree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - wholeDegree) * 60);
  return `${wholeDegree}°${minutes.toString().padStart(2, '0')}'`;
};

const calculateKeyAspects = (
  birthChart: BirthChartData[],
  currentTransits: any[],
) => {
  const aspects: any[] = [];

  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      const baseAspect = {
        transitPlanet: transit.body,
        transitSign: transit.sign,
        transitDegree: formatDegreeForText(transit.eclipticLongitude),
        natalPlanet: natal.body,
        natalSign: natal.sign,
        natalDegree: formatDegreeForText(natal.eclipticLongitude),
      };

      if (Math.abs(diff - 0) <= 10) {
        aspects.push({
          ...baseAspect,
          type: 'conjunction',
          orb: Math.abs(diff - 0),
          intensity: 10 - Math.abs(diff - 0),
        });
      } else if (Math.abs(diff - 180) <= 10) {
        aspects.push({
          ...baseAspect,
          type: 'opposition',
          orb: Math.abs(diff - 180),
          intensity: 10 - Math.abs(diff - 180),
        });
      } else if (Math.abs(diff - 120) <= 8) {
        aspects.push({
          ...baseAspect,
          type: 'trine',
          orb: Math.abs(diff - 120),
          intensity: 8 - Math.abs(diff - 120),
        });
      } else if (Math.abs(diff - 90) <= 8) {
        aspects.push({
          ...baseAspect,
          type: 'square',
          orb: Math.abs(diff - 90),
          intensity: 8 - Math.abs(diff - 90),
        });
      }
    }
  }

  return aspects.sort((a, b) => b.intensity - a.intensity);
};

const getSunTransitMeaning = (transitSign: string): string => {
  const meanings: Record<string, string> = {
    Aries: 'new beginnings and taking initiative',
    Taurus: 'stability and material security',
    Gemini: 'communication and learning',
    Cancer: 'home and emotional connections',
    Leo: 'creativity and self-expression',
    Virgo: 'organization and health matters',
    Libra: 'relationships and balance',
    Scorpio: 'transformation and depth',
    Sagittarius: 'adventure and higher learning',
    Capricorn: 'career and long-term goals',
    Aquarius: 'innovation and friendship',
    Pisces: 'spirituality and compassion',
  };
  return meanings[transitSign] || 'personal growth';
};

const getMoonInfluence = (moonSign: string): string => {
  const influences: Record<string, string> = {
    Aries: 'encourages bold emotional expressions',
    Taurus: 'brings stability to your feelings',
    Gemini: 'stimulates curiosity and conversation',
    Cancer: 'heightens intuition and sensitivity',
    Leo: 'amplifies dramatic and generous feelings',
    Virgo: 'focuses on practical emotional needs',
    Libra: 'seeks harmony in relationships',
    Scorpio: 'intensifies emotional depth',
    Sagittarius: 'inspires optimistic expansion',
    Capricorn: 'grounds emotions in reality',
    Aquarius: 'detaches from conventional feelings',
    Pisces: 'enhances empathy and imagination',
  };
  return influences[moonSign] || 'influences your emotional state';
};

const getMercuryGuidance = (mercurySign: string): string => {
  const guidance: Record<string, string> = {
    Aries: 'direct communication and quick decisions',
    Taurus: 'practical thinking and steady planning',
    Gemini: 'versatile communication and idea sharing',
    Cancer: 'intuitive thinking and emotional intelligence',
    Leo: 'confident expression and creative communication',
    Virgo: 'detailed analysis and precise communication',
    Libra: 'diplomatic conversation and fair consideration',
    Scorpio: 'deep investigation and transformative thinking',
    Sagittarius: 'big picture thinking and philosophical discussion',
    Capricorn: 'structured communication and goal-oriented planning',
    Aquarius: 'innovative ideas and unique perspectives',
    Pisces: 'intuitive communication and creative expression',
  };
  return guidance[mercurySign] || 'clear thinking and communication';
};

const getVenusGuidance = (venusSign: string): string => {
  const guidance: Record<string, string> = {
    Aries: 'passionate attraction and bold romantic gestures',
    Taurus: 'sensual pleasure and stable affection',
    Gemini: 'intellectual connection and playful romance',
    Cancer: 'emotional intimacy and nurturing love',
    Leo: 'dramatic expression and generous affection',
    Virgo: 'practical service and thoughtful care',
    Libra: 'harmonious partnership and aesthetic beauty',
    Scorpio: 'intense bonding and transformative relationships',
    Sagittarius: 'adventurous love and philosophical connection',
    Capricorn: 'committed partnership and traditional values',
    Aquarius: 'friendship-based love and unconventional attraction',
    Pisces: 'spiritual connection and compassionate love',
  };
  return guidance[venusSign] || 'love and aesthetic appreciation';
};

const getAspectDescription = (aspect: any): string => {
  const orbRounded = Math.round(aspect.orb * 10) / 10;
  const orbDescription =
    aspect.orb <= 3 ? 'closely' : aspect.orb <= 6 ? 'moderately' : 'loosely';

  const descriptions: Record<string, string> = {
    conjunction: `at ${aspect.transitDegree} ${aspect.transitSign} is ${orbDescription} conjunct (${orbRounded}° orb)`,
    opposition: `at ${aspect.transitDegree} ${aspect.transitSign} is ${orbDescription} opposite (${orbRounded}° orb)`,
    trine: `at ${aspect.transitDegree} ${aspect.transitSign} forms a ${orbDescription} supportive trine (${orbRounded}° orb) with`,
    square: `at ${aspect.transitDegree} ${aspect.transitSign} forms a ${orbDescription} challenging square (${orbRounded}° orb) with`,
    sextile: `at ${aspect.transitDegree} ${aspect.transitSign} forms a ${orbDescription} helpful sextile (${orbRounded}° orb) with`,
  };

  return descriptions[aspect.type] || `aspects`;
};

const getPlanetTheme = (planet: string): string => {
  const themes: Record<string, string> = {
    Sun: 'identity and self-expression',
    Moon: 'emotions and intuition',
    Mercury: 'communication and thinking',
    Venus: 'relationships and values',
    Mars: 'action and motivation',
    Jupiter: 'growth and expansion',
    Saturn: 'responsibility and structure',
    Uranus: 'innovation and change',
    Neptune: 'dreams and spirituality',
    Pluto: 'transformation and power',
  };
  return themes[planet] || 'personal development';
};

const getCurrentTransitSign = (planetName: string, transits: any[]): string => {
  const transit = transits.find((t) => t.body === planetName);
  return transit?.sign || '';
};

const getDetailedAspectMeaning = (aspect: any): string => {
  const meanings: Record<string, string> = {
    conjunction:
      'When planets are in the same area of the sky, their energies blend and amplify each other.',
    opposition: 'Opposition creates tension requiring balance.',
    trine:
      'When planets are 120° apart, they create easy, flowing energy that supports natural talents.',
    square:
      'When planets are 90° apart, they create friction that pushes you to grow and take action.',
    sextile:
      'When planets are 60° apart, they offer helpful opportunities and cooperative energy.',
  };
  return (
    meanings[aspect.type] ||
    'This planetary relationship brings significant influence.'
  );
};

const getAspectQuality = (aspectType: string): string => {
  const qualities: Record<string, string> = {
    conjunction: 'intensified',
    opposition: 'balancing',
    trine: 'harmonious',
    square: 'challenging yet motivating',
    sextile: 'supportive',
  };
  return qualities[aspectType] || 'significant';
};

const getBirthPlanetSign = (
  planetName: string,
  birthChart: BirthChartData[],
): string => {
  const planet = birthChart.find((p) => p.body === planetName);
  if (!planet) return '';
  const degree = formatDegreeForText(planet.eclipticLongitude);
  return `${degree} ${planet.sign}`;
};

const getRetrogradeInfluences = (
  currentTransits: any[],
  birthChart: BirthChartData[],
): string[] => {
  const influences: string[] = [];
  const retrogradeTransits = currentTransits.filter(
    (transit) => transit.retrograde,
  );

  retrogradeTransits.forEach((transit) => {
    const aspects = birthChart.filter((birthPlanet) => {
      let diff = Math.abs(
        transit.eclipticLongitude - birthPlanet.eclipticLongitude,
      );
      if (diff > 180) diff = 360 - diff;
      return (
        Math.abs(diff - 0) <= 10 ||
        Math.abs(diff - 180) <= 10 ||
        Math.abs(diff - 120) <= 8 ||
        Math.abs(diff - 90) <= 8
      );
    });

    if (aspects.length > 0) {
      const retroMessage = getRetrogradeMessage(transit.body);
      influences.push(
        `${transit.body} is currently retrograde in ${transit.sign}, ${retroMessage}`,
      );
    } else {
      influences.push(
        `${transit.body} retrograde in ${transit.sign} brings introspective energy.`,
      );
    }
  });

  return influences.slice(0, 2);
};

const getRetrogradeMessage = (planet: string): string => {
  const messages: Record<string, string> = {
    Mercury: `encouraging you to review communication patterns and double-check details`,
    Venus: `inviting you to reconsider your values and what truly brings you joy`,
    Mars: `asking you to redirect your energy inward and reassess your goals`,
    Jupiter: `prompting you to reassess your beliefs and approach to growth`,
    Saturn: `encouraging deep reflection on your responsibilities and structures`,
    Uranus: `bringing unconventional insights and encouraging you to break free from outdated patterns`,
    Neptune: `enhancing intuition while requiring discernment between illusion and truth`,
    Pluto: `intensifying transformation processes and bringing hidden truths to the surface`,
  };
  return (
    messages[planet] ||
    `encouraging reflection on ${planet.toLowerCase()} themes`
  );
};

const getDailyNumerology = (
  date: dayjs.Dayjs,
): { number: number; meaning: string } => {
  const dateString = date.format('DDMMYYYY');
  let sum = 0;

  for (let i = 0; i < dateString.length; i++) {
    sum += parseInt(dateString[i]);
  }

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    const digits = sum.toString().split('');
    sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  const numerologyMeanings: Record<number, string> = {
    1: 'leadership energy and new beginnings',
    2: 'cooperation, balance, and partnership',
    3: 'creativity, communication, and joy',
    4: 'stability, hard work, and foundation-building',
    5: 'freedom, adventure, and dynamic change',
    6: 'nurturing, responsibility, and healing',
    7: 'spiritual insight, introspection, and wisdom',
    8: 'material success, power, and achievement',
    9: 'completion, compassion, and universal love',
    11: 'master intuition and spiritual illumination',
    22: 'master builder energy and manifestation power',
    33: 'master teacher vibration and selfless service',
  };

  return {
    number: sum,
    meaning: numerologyMeanings[sum] || 'transformative energy',
  };
};

// Type for cached horoscope from API
interface CachedHoroscope {
  sunSign: string;
  moonPhase: string;
  headline: string;
  overview: string;
  focusAreas: Array<{
    area: 'love' | 'work' | 'inner';
    title: string;
    guidance: string;
  }>;
  tinyAction: string;
  dailyGuidance: string;
  personalInsight: string;
  luckyElements: string[];
  cosmicHighlight: string;
  dailyAffirmation: string;
  cached?: boolean;
}

export function PaidHoroscopeView({
  userBirthday,
  userName,
  profile,
}: PaidHoroscopeViewProps) {
  const [observer, setObserver] = useState<any>(null);
  const [fullHoroscope, setFullHoroscope] = useState<string | null>(null);
  const [currentTransits, setCurrentTransits] = useState<any[]>([]);
  const [horoscope, setHoroscope] = useState<CachedHoroscope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [numerologyModal, setNumerologyModal] =
    useState<NumerologyModalPayload | null>(null);
  const {
    shareTarget,
    sharePreviewUrl,
    shareLoading,
    shareError,
    isOpen: isShareModalOpen,
    openShareModal,
    closeShareModal,
    handleShareImage,
    handleDownloadShareImage,
    handleCopyShareLink,
  } = useOgShareModal();

  const birthChart = getBirthChartFromProfile(profile);

  // Fetch cached horoscope from API
  useEffect(() => {
    async function fetchHoroscope() {
      try {
        const response = await fetch('/api/horoscope/daily');
        if (response.ok) {
          const data = await response.json();
          setHoroscope(data);
        } else {
          // Fallback to client-side generation if API fails
          const fallback = getEnhancedPersonalizedHoroscope(
            userBirthday,
            userName,
            profile,
          );
          setHoroscope(fallback);
        }
      } catch (error) {
        console.error('[Horoscope] API fetch failed, using fallback:', error);
        // Fallback to client-side generation
        const fallback = getEnhancedPersonalizedHoroscope(
          userBirthday,
          userName,
          profile,
        );
        setHoroscope(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHoroscope();
  }, [userBirthday, userName, profile]);

  const today = dayjs();
  const universalDay = getDailyNumerology(today);
  const personalDay = userBirthday
    ? getPersonalDayNumber(userBirthday, today)
    : null;
  const openNumerologyModal = (
    contextLabel: string,
    number: number,
    meaning: string,
    contextDetail?: string,
    contextType: NumerologyDetailContext = 'lifePath',
  ) => {
    const detail = getNumerologyDetail(contextType, number);
    setNumerologyModal({
      number,
      contextLabel,
      meaning,
      contextDetail,
      description: detail?.description,
      energy: detail?.energy,
      energyLabel: contextType === 'lifePath' ? 'Daily energy' : undefined,
      keywords: detail?.keywords,
      sections: detail?.sections,
      extraNote: detail?.extraNote,
    });
  };
  const getPageUrl = () =>
    typeof window !== 'undefined'
      ? window.location.href
      : `${getShareOrigin()}/horoscope`;

  const handleShareHoroscope = () => {
    if (!horoscope) return;
    const numbers: NumerologyShareNumber[] = [
      {
        label: 'Universal Day',
        value: universalDay.number,
        meaning: universalDay.meaning,
      },
    ];
    if (personalDay) {
      numbers.push({
        label: 'Personal Day',
        value: personalDay.number,
        meaning: personalDay.meaning,
      });
    }
    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: userName ? `${userName}'s Horoscope` : 'Your Horoscope',
      highlight: horoscope.cosmicHighlight,
      highlightSubtitle: horoscope.dailyGuidance,
      date: dayjs().format('MMMM D, YYYY'),
      name: userName,
      variant: 'horoscope',
      numbers,
    });
    openShareModal({
      title: userName ? `${userName}'s Horoscope` : 'Your Horoscope',
      description: horoscope.cosmicHighlight,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  const shareNumberTile = (label: string, number: number, meaning?: string) => {
    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: label,
      highlight: meaning ?? label,
      date: dayjs().format('MMMM D, YYYY'),
      variant: 'numerology-card',
      numbers: [
        {
          label,
          value: number,
          meaning,
        },
      ],
    });
    openShareModal({
      title: label,
      description: meaning ?? label,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };
  const solarReturnData = userBirthday
    ? getSolarReturnInsights(userBirthday)
    : null;
  const upcomingTransits = getUpcomingTransits();
  // Filter out moon phases for personal transits (they're universal, not personal)
  // Prioritize planetary transits that actually affect the birth chart
  const nonLunarTransits = upcomingTransits.filter(
    (transit) => transit.type !== 'lunar_phase',
  );
  const personalTransitImpacts = birthChart
    ? getPersonalTransitImpacts(
        nonLunarTransits.length > 0 ? nonLunarTransits : upcomingTransits,
        birthChart,
        15, // Increased limit to get more diverse planets
      )
    : [];

  useEffect(() => {
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, []);

  useEffect(() => {
    if (!observer || !birthChart) return;

    const normalizedDate = new Date(dayjs().format('YYYY-MM-DD') + 'T12:00:00');
    const transits = getAstrologicalChart(normalizedDate, observer);
    setCurrentTransits(transits);

    if (userBirthday) {
      const generatedHoroscope = generatePersonalizedHoroscope(
        birthChart,
        transits,
        userName,
        userBirthday,
      );
      setFullHoroscope(generatedHoroscope);
    }
  }, [observer, birthChart, userBirthday, userName]);

  // Show loading skeleton while fetching
  if (isLoading) {
    return (
      <div className='h-full space-y-6 p-4 pb-16 md:pb-20 overflow-auto'>
        <div className='pt-6'>
          <div className='h-8 bg-zinc-800 rounded animate-pulse w-48 mb-2' />
          <div className='h-4 bg-zinc-800 rounded animate-pulse w-64' />
        </div>
        <div className='space-y-4'>
          <div className='h-32 bg-zinc-800/50 rounded-xl animate-pulse' />
          <div className='h-24 bg-zinc-800/50 rounded-xl animate-pulse' />
        </div>
      </div>
    );
  }

  return (
    <div className='h-full space-y-6 p-4 pb-16 md:pb-20 overflow-auto'>
      <div className='pt-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
              {userName ? `${userName}'s Horoscope` : 'Your Horoscope'}
            </h1>
            <p className='text-sm text-zinc-400'>
              Personalised guidance based on your birth chart
            </p>
          </div>
          <button
            type='button'
            onClick={handleShareHoroscope}
            disabled={!horoscope}
            className='inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-zinc-200 transition hover:border-lunary-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Share2 className='h-4 w-4' />
            Share horoscope
          </button>
        </div>
      </div>

      {horoscope && (
        <div className='space-y-6'>
          <div className='rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900/70 via-zinc-950/70 to-lunary-primary-950 p-5 space-y-4'>
            <p className='text-[11px] font-semibold tracking-[0.3em] uppercase text-zinc-400'>
              Cosmic Highlight
            </p>
            <p className='text-2xl font-light text-zinc-100'>
              {horoscope.cosmicHighlight}
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {horoscope.dailyGuidance}
            </p>
            <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() =>
                    openNumerologyModal(
                      'Universal Day',
                      universalDay.number,
                      universalDay.meaning,
                      'Daily universal numerology energy',
                    )
                  }
                  className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center transition hover:border-lunary-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-400 w-full'
                >
                  <div className='text-xs uppercase tracking-widest text-zinc-400'>
                    Universal Day
                  </div>
                  <div className='text-3xl font-semibold text-lunary-accent-300'>
                    {universalDay.number}
                  </div>
                  <p className='text-[11px] text-zinc-300'>
                    {universalDay.meaning}
                  </p>
                </button>
                <button
                  type='button'
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    shareNumberTile(
                      'Universal Day',
                      universalDay.number,
                      universalDay.meaning,
                    );
                  }}
                  className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/50 text-zinc-400 transition hover:border-lunary-primary-500 hover:text-white'
                  aria-label='Share Universal Day'
                >
                  <Share2 className='h-4 w-4' />
                </button>
              </div>
              {personalDay ? (
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() =>
                      openNumerologyModal(
                        'Personal Day',
                        personalDay.number,
                        personalDay.meaning,
                        'Your personal day numerology focus',
                      )
                    }
                    className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center transition hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 w-full'
                  >
                    <div className='text-xs uppercase tracking-widest text-zinc-400'>
                      Personal Day
                    </div>
                    <div className='text-3xl font-semibold text-emerald-300'>
                      {personalDay.number}
                    </div>
                    <p className='text-[11px] text-zinc-300'>
                      {personalDay.meaning}
                    </p>
                  </button>
                  <button
                    type='button'
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      shareNumberTile(
                        'Personal Day',
                        personalDay.number,
                        personalDay.meaning,
                      );
                    }}
                    className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/50 text-zinc-400 transition hover:border-emerald-400 hover:text-white'
                    aria-label='Share Personal Day'
                  >
                    <Share2 className='h-4 w-4' />
                  </button>
                </div>
              ) : (
                <div className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center'>
                  <div className='text-xs uppercase tracking-widest text-zinc-400'>
                    Personal Day
                  </div>
                  <div className='text-3xl font-semibold text-zinc-500'>?</div>
                  <p className='text-[11px] text-zinc-500'>
                    Add your birthday to reveal this daily number.
                  </p>
                </div>
              )}
            </div>
            <p className='text-xs text-zinc-400'>
              Highlight refreshes each sunrise with new numerology, moon, and
              transit energy—baseline for everything you read today.
            </p>
          </div>

          {/* <HoroscopeSection title="Today's Horoscope" color='purple'>
            {horoscope.headline ? (
              <>
                {/* Headline */}
          {/* <h2 className='text-lg font-medium text-zinc-100 mb-3'>
                  {horoscope.headline}
                </h2> */}

          {/* Overview - the main reading */}
          {/* <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
                  {horoscope.overview || fullHoroscope}
                </p> */}

          {/* Tiny Action anchor */}
          {/* {horoscope.tinyAction && (
                  <div className='p-3 rounded-lg bg-lunary-primary-950/50 border border-lunary-primary-900/50 mb-4'>
                    <p className='text-sm text-lunary-primary-300 italic'>
                      {horoscope.tinyAction}
                    </p>
                  </div>
                )} */}

          {/* Collapsible "More for today" section */}
          {/* {horoscope.focusAreas && horoscope.focusAreas.length > 0 && (
                  <MoreForToday focusAreas={horoscope.focusAreas} />
                )}

                <div className='pt-3 border-t border-zinc-800/50 space-y-3'>
                  <div className='flex flex-wrap gap-3 text-xs'>
                    <Link
                      href='/grimoire/horoscopes/weekly'
                      className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
                    >
                      Week ahead →
                    </Link>
                  </div>
                  <ReflectionBox />
                </div>
              </>
            ) : fullHoroscope ? (
              <>
                <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
                  {fullHoroscope}
                </p>
                <div className='pt-3 border-t border-zinc-800/50 space-y-3'>
                  <div className='flex flex-wrap gap-3 text-xs'>
                    <Link
                      href='/grimoire/horoscopes/weekly'
                      className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
                    >
                      Week ahead →
                    </Link>
                  </div>
                  <ReflectionBox />
                </div>
              </>
            ) : (
              <div className='space-y-2'>
                <div className='h-4 bg-zinc-800 rounded animate-pulse' />
                <div className='h-4 bg-zinc-800 rounded animate-pulse w-5/6' />
                <div className='h-4 bg-zinc-800 rounded animate-pulse w-4/6' />
              </div>
            )}
          </HoroscopeSection> */}

          <GuideNudge location='horoscope' />

          {birthChart && currentTransits.length > 0 && (
            <HoroscopeSection title='Transit Wisdom' color='indigo'>
              <p className='text-sm text-zinc-400 mb-4'>
                Today&apos;s most significant transits to your birth chart
              </p>
              <TransitWisdom
                birthChart={birthChart}
                currentTransits={currentTransits}
                maxItems={3}
              />
            </HoroscopeSection>
          )}

          {birthChart && currentTransits.length > 0 && (
            <HoroscopeSection
              title="Today's Aspects to Your Chart"
              color='zinc'
            >
              <p className='text-sm text-zinc-400 mb-4'>
                How today&apos;s planetary positions align with your birth chart
              </p>
              <TodaysAspects
                birthChart={birthChart}
                currentTransits={currentTransits}
              />
            </HoroscopeSection>
          )}

          <HoroscopeSection title='Personal Transit Impact' color='zinc'>
            <p className='text-sm text-zinc-400 mb-4'>
              How upcoming transits specifically affect your birth chart
            </p>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {personalTransitImpacts.length > 0 ? (
                personalTransitImpacts.map((impact, index) => (
                  <PersonalTransitImpactCard key={index} impact={impact} />
                ))
              ) : (
                <p className='text-zinc-400 text-center py-4 text-sm'>
                  No significant personal transits in the next 30 days
                </p>
              )}
            </div>
          </HoroscopeSection>

          {!userBirthday && (
            <HoroscopeSection title='Complete Your Profile' color='amber'>
              <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
                Add your birthday to get more personalized and accurate
                astrological insights.
              </p>
              <Link
                href='/profile'
                className='inline-block rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 hover:bg-lunary-accent-900 text-lunary-accent-300 px-4 py-2 text-sm font-medium transition-colors'
              >
                Update Profile
              </Link>
            </HoroscopeSection>
          )}

          {solarReturnData && (
            <HoroscopeSection title='Solar Return Insights' color='amber'>
              <div className='space-y-3 pt-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-300'>
                    Next Solar Return:
                  </span>
                  <span className='text-sm font-medium text-zinc-100'>
                    {solarReturnData.nextSolarReturn.format('MMM DD, YYYY')}
                    <span className='text-xs text-zinc-400 ml-2'>
                      ({solarReturnData.daysTillReturn} days)
                    </span>
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-300'>Personal Year:</span>
                  <span className='text-sm font-medium text-zinc-100'>
                    {solarReturnData.personalYear}
                  </span>
                </div>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {solarReturnData.insights}
                </p>
                <div>
                  <h4 className='text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide'>
                    Year Themes
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {solarReturnData.themes.map((theme, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 rounded border border-lunary-accent-700 bg-lunary-accent-950 text-xs text-zinc-300'
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </HoroscopeSection>
          )}

          <PremiumPathway variant='transits' className='mt-6' />
        </div>
      )}
      <NumerologyInfoModal
        isOpen={!!numerologyModal}
        onClose={() => setNumerologyModal(null)}
        number={numerologyModal?.number ?? 0}
        contextLabel={numerologyModal?.contextLabel ?? ''}
        meaning={numerologyModal?.meaning ?? ''}
        energy={numerologyModal?.energy}
        keywords={numerologyModal?.keywords}
      />
      <ShareImageModal
        isOpen={isShareModalOpen}
        target={shareTarget}
        previewUrl={sharePreviewUrl}
        loading={shareLoading}
        error={shareError}
        onClose={closeShareModal}
        onShare={handleShareImage}
        onDownload={handleDownloadShareImage}
        onCopy={handleCopyShareLink}
      />
    </div>
  );
}
