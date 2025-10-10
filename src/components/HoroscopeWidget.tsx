'use client';

import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from './SmartTrialButton';
import {
  getBirthChartFromProfile,
  hasBirthChart,
  BirthChartData,
} from '../../utils/astrology/birthChart';
import { getAstrologicalChart } from '../../utils/astrology/astrology';
import { getGeneralHoroscope } from '../../utils/astrology/generalHoroscope';
import { Observer } from 'astronomy-engine';
import { bodiesSymbols } from '../../utils/zodiac/zodiac';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import dayjs from 'dayjs';
import Link from 'next/link';

const generatePersonalizedHoroscope = (
  birthChart: BirthChartData[],
  currentTransits: any[],
  userName?: string,
  userBirthday?: string,
): string => {
  const today = dayjs();

  // Find user's key natal placements
  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Aries';
  const risingSign =
    birthChart.find((p) => p.body === 'Ascendant')?.sign || sunSign;

  // Get current transiting planets
  const transitSun = currentTransits.find((p) => p.body === 'Sun');
  const transitMoon = currentTransits.find((p) => p.body === 'Moon');
  const transitMercury = currentTransits.find((p) => p.body === 'Mercury');
  const transitVenus = currentTransits.find((p) => p.body === 'Venus');
  const transitMars = currentTransits.find((p) => p.body === 'Mars');
  const transitJupiter = currentTransits.find((p) => p.body === 'Jupiter');

  // Calculate aspects between transiting planets and natal planets
  const aspects = calculateKeyAspects(birthChart, currentTransits);

  // Generate comprehensive horoscope
  const horoscopeElements = [];

  // Opening - Daily energy overview
  const dayOfWeek = today.format('dddd');
  const numerologyInfluence = getDailyNumerology(today);

  horoscopeElements.push(
    `${dayOfWeek} brings ${numerologyInfluence.meaning} to your ${sunSign} nature.`,
  );

  // Sun transit influence - Core energy
  if (transitSun) {
    if (transitSun.sign === sunSign) {
      horoscopeElements.push(
        `With the Sun illuminating your natal sign, this is your season of maximum vitality and authentic self-expression. Your natural ${sunSign} qualities are magnified, making this an ideal time to step into leadership roles and pursue goals that align with your core identity.`,
      );
    } else {
      horoscopeElements.push(
        `Sun in ${transitSun.sign} highlights ${getSunTransitMeaning(transitSun.sign, sunSign)}.`,
      );
    }
  }

  // Moon influence - Emotional landscape
  if (transitMoon) {
    if (transitMoon.sign === moonSign) {
      horoscopeElements.push(
        `The Moon's return to your natal ${moonSign} creates an emotionally familiar and comfortable atmosphere. Your instinctive responses are heightened, and you may find yourself naturally gravitating toward activities that nurture your soul. Trust these intuitive pulls.`,
      );
    } else {
      horoscopeElements.push(
        `Moon in ${transitMoon.sign} ${getMoonInfluence(transitMoon.sign)}.`,
      );
    }
  }

  // Primary aspect - Most significant influence
  const primaryAspect = aspects[0];
  if (primaryAspect) {
    const birthPlanetSign = getBirthPlanetSign(
      primaryAspect.natalPlanet,
      birthChart,
    );
    horoscopeElements.push(
      `Today's most significant cosmic influence is ${primaryAspect.transitPlanet} in ${getCurrentTransitSign(primaryAspect.transitPlanet, currentTransits)} ${getAspectDescription(primaryAspect)} your birth ${primaryAspect.natalPlanet} in ${birthPlanetSign}. ${getDetailedAspectMeaning(primaryAspect)} This creates a powerful focus on ${getPlanetTheme(primaryAspect.natalPlanet)} in your life.`,
    );
  }

  // Secondary aspect - Additional influence
  const secondaryAspect = aspects[1];
  if (secondaryAspect) {
    const birthPlanetSign = getBirthPlanetSign(
      secondaryAspect.natalPlanet,
      birthChart,
    );
    horoscopeElements.push(
      `A secondary influence comes from ${secondaryAspect.transitPlanet} ${getAspectDescription(secondaryAspect)} your birth ${secondaryAspect.natalPlanet} in ${birthPlanetSign}, adding ${getAspectQuality(secondaryAspect.type)} energy to ${getPlanetTheme(secondaryAspect.natalPlanet)} matters.`,
    );
  }

  // Mercury influence - Mental/communication focus
  if (transitMercury) {
    const mercuryAspect = aspects.find((a) => a.transitPlanet === 'Mercury');
    if (mercuryAspect) {
      horoscopeElements.push(
        `Mercury's current position particularly emphasizes ${getMercuryGuidance(transitMercury.sign)}, while its connection to your natal chart suggests this is an especially significant day for mental clarity and purposeful communication.`,
      );
    } else {
      horoscopeElements.push(
        `With Mercury in ${transitMercury.sign}, the intellectual atmosphere supports ${getMercuryGuidance(transitMercury.sign)}. Consider how this mental energy can serve your broader ${sunSign} goals.`,
      );
    }
  }

  // Venus influence - Only if aspecting (avoid redundancy)
  const venusAspect = aspects.find((a) => a.transitPlanet === 'Venus');
  if (venusAspect && transitVenus) {
    horoscopeElements.push(
      `Venus in ${transitVenus.sign} highlights ${getVenusGuidance(transitVenus.sign)} in ${getPlanetTheme(venusAspect.natalPlanet)}.`,
    );
  }

  // Mars influence - Only if aspecting (avoid redundancy)
  const marsAspect = aspects.find((a) => a.transitPlanet === 'Mars');
  if (marsAspect && transitMars) {
    horoscopeElements.push(
      `Mars in ${transitMars.sign} energizes ${getPlanetTheme(marsAspect.natalPlanet)}. Channel this drive constructively.`,
    );
  }

  // Retrograde influences - Major impact on daily energy
  const retrogradeInfluences = getRetrogradeInfluences(
    currentTransits,
    birthChart,
  );
  if (retrogradeInfluences.length > 0) {
    horoscopeElements.push(retrogradeInfluences.join(' '));
  }

  // Jupiter influence - Only if aspecting
  const jupiterAspect = aspects.find((a) => a.transitPlanet === 'Jupiter');
  if (jupiterAspect) {
    horoscopeElements.push(
      `Jupiter opens doorways for growth and broader perspectives.`,
    );
  }

  // Personal Numerology Guidance - Only if different from universal day
  if (userBirthday) {
    const personalDay = getPersonalDayNumber(userBirthday, today);
    if (personalDay.number !== numerologyInfluence.number) {
      horoscopeElements.push(
        `Personal day ${personalDay.number} (${personalDay.meaning}).`,
      );
    }
  }

  // Practical guidance - Only if there are significant aspects
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

  // Concise closing guidance - rotate based on day to avoid repetition
  const closingOptions = [
    `Trust your ${sunSign} instincts today.`,
    `Honor your ${moonSign} emotional wisdom.`,
    `The cosmic currents support your growth.`,
    `Trust your ${sunSign} nature.`,
  ];

  const closingIndex = today.dayOfYear() % closingOptions.length;
  horoscopeElements.push(closingOptions[closingIndex]);

  // Combine all elements
  return horoscopeElements.join(' ');
};

const calculateKeyAspects = (
  birthChart: BirthChartData[],
  currentTransits: any[],
) => {
  const aspects = [];

  // Check transiting planets against natal planets
  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      // Check for major aspects (with wider orbs for transits)
      if (Math.abs(diff - 0) <= 10) {
        // Conjunction
        aspects.push({
          type: 'conjunction',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 0),
          intensity: 10 - Math.abs(diff - 0),
        });
      } else if (Math.abs(diff - 180) <= 10) {
        // Opposition
        aspects.push({
          type: 'opposition',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 180),
          intensity: 10 - Math.abs(diff - 180),
        });
      } else if (Math.abs(diff - 120) <= 8) {
        // Trine
        aspects.push({
          type: 'trine',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 120),
          intensity: 8 - Math.abs(diff - 120),
        });
      } else if (Math.abs(diff - 90) <= 8) {
        // Square
        aspects.push({
          type: 'square',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 90),
          intensity: 8 - Math.abs(diff - 90),
        });
      }
    }
  }

  // Sort by intensity (closest aspects first)
  return aspects.sort((a, b) => b.intensity - a.intensity);
};

const getSunTransitMeaning = (
  transitSign: string,
  natalSunSign: string,
): string => {
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

const getMarsGuidance = (marsSign: string): string => {
  const guidance: Record<string, string> = {
    Aries: 'pioneering action and competitive drive',
    Taurus: 'steady persistence and determined effort',
    Gemini: 'multitasking and intellectual pursuits',
    Cancer: 'protective action and emotional motivation',
    Leo: 'creative expression and confident leadership',
    Virgo: 'precise execution and detailed work',
    Libra: 'diplomatic action and collaborative effort',
    Scorpio: 'intense focus and transformative power',
    Sagittarius: 'adventurous pursuit and expansive action',
    Capricorn: 'strategic planning and goal achievement',
    Aquarius: 'innovative action and group cooperation',
    Pisces: 'intuitive action and compassionate service',
  };

  return guidance[marsSign] || 'motivated action and assertive energy';
};

const getAspectDescription = (aspect: any): string => {
  const orbDescription =
    aspect.orb <= 3 ? 'closely' : aspect.orb <= 6 ? 'moderately' : 'loosely';

  const descriptions: Record<string, string> = {
    conjunction: `is ${orbDescription} conjunct (within ${Math.round(aspect.orb)}° of the same position as)`,
    opposition: `is ${orbDescription} opposite (180° away from)`,
    trine: `forms a ${orbDescription} supportive trine (120° away from)`,
    square: `forms a ${orbDescription} challenging square (90° away from)`,
    sextile: `forms a ${orbDescription} helpful sextile (60° away from)`,
  };

  return (
    descriptions[aspect.type] || `aspects (at ${Math.round(aspect.orb)}° orb)`
  );
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
  return planet?.sign || '';
};

const getRetrogradeInfluences = (
  currentTransits: any[],
  birthChart: BirthChartData[],
): string[] => {
  const influences: string[] = [];

  // Check for currently retrograde planets
  const retrogradeTransits = currentTransits.filter(
    (transit) => transit.retrograde,
  );

  retrogradeTransits.forEach((transit) => {
    // Find if this retrograde planet aspects any birth planets
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
      const retroMessage = getRetrogradeMessage(transit.body, transit.sign);
      influences.push(
        `${transit.body} is currently retrograde in ${transit.sign}, ${retroMessage}`,
      );
    } else {
      // General retrograde influence
      const generalMessage = getGeneralRetrogradeMessage(
        transit.body,
        transit.sign,
      );
      influences.push(generalMessage);
    }
  });

  return influences.slice(0, 2); // Limit to most significant retrogrades
};

const getRetrogradeMessage = (planet: string, sign: string): string => {
  const messages: Record<string, string> = {
    Mercury: `encouraging you to review communication patterns, double-check details, and reflect on how you express your thoughts`,
    Venus: `inviting you to reconsider your values, relationships, and what truly brings you joy and beauty`,
    Mars: `asking you to redirect your energy inward, reassess your goals, and approach action with more thoughtfulness`,
    Jupiter: `prompting you to reassess your beliefs, philosophies, and approach to growth and expansion`,
    Saturn: `encouraging deep reflection on your responsibilities, structures, and long-term commitments`,
    Uranus: `bringing unconventional insights and encouraging you to break free from outdated patterns`,
    Neptune: `enhancing intuition while requiring discernment between illusion and spiritual truth`,
    Pluto: `intensifying transformation processes and bringing hidden truths to the surface`,
  };

  return (
    messages[planet] ||
    `encouraging reflection and internal processing of ${planet.toLowerCase()} themes`
  );
};

const getGeneralRetrogradeMessage = (planet: string, sign: string): string => {
  const general: Record<string, string> = {
    Mercury: `Mercury retrograde in ${sign} creates a contemplative atmosphere around communication and thinking.`,
    Venus: `Venus retrograde in ${sign} brings a reflective quality to relationships and values.`,
    Mars: `Mars retrograde in ${sign} encourages a more thoughtful approach to action and motivation.`,
    Jupiter: `Jupiter retrograde in ${sign} invites philosophical reflection and inner growth.`,
    Saturn: `Saturn retrograde in ${sign} provides an opportunity to reassess structures and responsibilities.`,
    Uranus: `Uranus retrograde in ${sign} brings innovative insights through internal reflection.`,
    Neptune: `Neptune retrograde in ${sign} enhances spiritual clarity and intuitive understanding.`,
    Pluto: `Pluto retrograde in ${sign} intensifies transformational processes on a deep level.`,
  };

  return (
    general[planet] ||
    `${planet} retrograde in ${sign} brings introspective energy to the day.`
  );
};

const getDailyNumerology = (
  date: dayjs.Dayjs,
): { number: number; meaning: string } => {
  // Calculate the daily number by reducing the full date
  const dateString = date.format('DDMMYYYY');
  let sum = 0;

  for (let i = 0; i < dateString.length; i++) {
    sum += parseInt(dateString[i]);
  }

  // Reduce to single digit (except master numbers 11, 22, 33)
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

const getDayOfWeekEnergy = (dayName: string): string => {
  const dayEnergies: Record<string, string> = {
    Monday: "lunar intuition and emotional sensitivity (Moon's day)",
    Tuesday: "martial action and assertive drive (Mars' day)",
    Wednesday: "mercurial communication and mental agility (Mercury's day)",
    Thursday: "jovial expansion and philosophical thinking (Jupiter's day)",
    Friday: "venusian love, beauty, and social harmony (Venus' day)",
    Saturday: "saturnian structure, discipline, and reflection (Saturn's day)",
    Sunday: "solar vitality, confidence, and self-expression (Sun's day)",
  };

  return dayEnergies[dayName] || 'unique cosmic energy';
};

const getPersonalDayNumber = (
  birthdate: string,
  currentDate: dayjs.Dayjs,
): { number: number; meaning: string } => {
  // Personal Day = Birth Month + Birth Day + Current Year + Current Month + Current Day
  const birth = dayjs(birthdate);
  const birthMonth = birth.month() + 1;
  const birthDay = birth.date();
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month() + 1;
  const currentDay = currentDate.date();

  let sum = birthMonth + birthDay + currentYear + currentMonth + currentDay;

  // Reduce to single digit
  while (sum > 9) {
    const digits = sum.toString().split('');
    sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  const personalDayMeanings: Record<number, string> = {
    1: 'new beginnings',
    2: 'cooperation',
    3: 'creativity',
    4: 'organization',
    5: 'change',
    6: 'service',
    7: 'reflection',
    8: 'leadership',
    9: 'completion',
  };

  return {
    number: sum,
    meaning: personalDayMeanings[sum] || 'personal growth and development',
  };
};

const getAspectInterpretation = (aspect: any): string => {
  const transit = aspect.transitPlanet;
  const natal = aspect.natalPlanet;
  const type = aspect.type;

  const interpretations: Record<string, Record<string, string>> = {
    conjunction: {
      'Sun-Sun': 'Your authentic self shines brightly today',
      'Moon-Moon': 'Emotional clarity and intuitive insights flow naturally',
      'Mercury-Mercury': 'Communication and mental clarity are enhanced',
      'Venus-Venus': 'Love, beauty, and relationships take center stage',
      'Mars-Mars': 'Your energy and motivation reach peak levels',
      default: `${transit} activates your natal ${natal}, bringing fresh energy to this area`,
    },
    trine: {
      'Sun-Moon': 'Your emotions and identity align harmoniously',
      'Venus-Mars': 'Passion and affection blend beautifully',
      'Mercury-Jupiter': 'Expansive thinking and positive communication flow',
      default: `${transit} supports your natal ${natal} with flowing, positive energy`,
    },
    square: {
      'Mars-Sun': 'Channel assertive energy constructively',
      'Saturn-Moon': 'Emotional discipline may be required',
      default: `${transit} challenges your natal ${natal}, prompting growth through action`,
    },
    opposition: {
      'Sun-Moon': 'Balance self-expression with emotional needs',
      'Mars-Venus': 'Navigate between desire and harmony',
      default: `${transit} creates awareness around your natal ${natal} themes`,
    },
  };

  const aspectKey = `${natal}-${transit}`;
  const reverseKey = `${transit}-${natal}`;

  return (
    interpretations[type][aspectKey] ||
    interpretations[type][reverseKey] ||
    interpretations[type]['default'] ||
    `${transit} aspects your natal ${natal}, bringing significant influence`
  );
};

export const HoroscopeWidget = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  const hasChartAccess = hasBirthChartAccess(subscription.status);

  // If user doesn't have birth chart access, show general horoscope
  if (!hasChartAccess) {
    const generalHoroscope = getGeneralHoroscope();
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            {/* <h3 className='font-bold'>Daily Cosmic Energy</h3> */}
            {/* <span className='text-xs text-zinc-500'>
              {generalHoroscope.moonPhase}
            </span> */}
          </div>

          <div className='space-y-2 text-xs'>
            <p className='text-zinc-300 leading-relaxed'>
              {generalHoroscope.reading}
            </p>
          </div>

          <div className='bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded p-2 border border-purple-500/20'>
            {/* <p className='text-xs text-purple-200 mb-1'>
              🌟 Start Your Free Trial
            </p> */}
            <p className='text-xs text-zinc-400 mb-2'>
              Unlock horoscopes tailored to YOUR birth chart. Experience the
              difference personalized astrology makes!
            </p>
            <SmartTrialButton
              size='sm'
              variant='primary'
              className='text-xs underline font-medium bg-transparent hover:bg-purple-600/20 px-2 py-1'
            >
              Start Your Free Trial
            </SmartTrialButton>
          </div>
        </div>
      </div>
    );
  }

  // For premium users, we need both profile data AND subscription access
  if (!me || !userBirthday) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Horoscope</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
          <p className='text-zinc-400 text-xs mb-2'>
            Add your birthday for personalized cosmic insights
          </p>
          <Link href='/profile' className='text-blue-400 text-xs underline'>
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  const hasBirthChartData = hasBirthChart(me.profile);
  const birthChart = hasBirthChartData
    ? getBirthChartFromProfile(me.profile)
    : null;

  if (!birthChart) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Horoscope</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
          <p className='text-zinc-400 text-xs'>
            Calculating your cosmic influences...
          </p>
        </div>
      </div>
    );
  }

  // Get current planetary positions
  const today = new Date();
  const observer = new Observer(51.4769, 0.0005, 0); // Default location
  const currentTransits = getAstrologicalChart(today, observer);

  // Generate personalized horoscope
  const horoscope = generatePersonalizedHoroscope(
    birthChart,
    currentTransits,
    userName,
    userBirthday,
  );

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Horoscope</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
        </div>
        <div className='text-center text-sm text-zinc-300 leading-relaxed max-h-48 overflow-y-auto'>
          {horoscope}
        </div>
      </div>
    </div>
  );
};
