import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { Observer } from 'astronomy-engine';
import { getBirthChartFromProfile } from './birthChart';

dayjs.extend(dayOfYear);

type FocusArea = {
  area: 'love' | 'work' | 'inner';
  title: string;
  guidance: string;
};

type EnhancedHoroscopeReading = {
  sunSign: string;
  moonPhase: string;
  // New structured fields
  headline: string;
  overview: string;
  focusAreas: FocusArea[];
  tinyAction: string;
  // Legacy fields (kept for backwards compatibility)
  dailyGuidance: string;
  personalInsight: string;
  luckyElements: string[];
  cosmicHighlight: string;
  dailyAffirmation: string;
};

// Day of week planetary rulers
const dayRulers = {
  0: 'Sun', // Sunday
  1: 'Moon', // Monday
  2: 'Mars', // Tuesday
  3: 'Mercury', // Wednesday
  4: 'Jupiter', // Thursday
  5: 'Venus', // Friday
  6: 'Saturn', // Saturday
};

// Get daily numerology
const getDailyNumerology = (date: dayjs.Dayjs) => {
  const dateString = date.format('MM/DD/YYYY');
  const digits = dateString.replace(/\D/g, '').split('').map(Number);
  let sum = digits.reduce((acc, digit) => acc + digit, 0);

  // Reduce to single digit unless master number
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0);
  }

  return sum;
};

// Get current moon phase with more detail
const getDetailedMoonPhase = (date: Date): string => {
  // Simplified moon phase calculation - in real app would use proper ephemeris
  const lunarMonth = 29.53;
  const knownNewMoon = new Date('2024-01-11'); // Known new moon date
  const daysSinceNew = Math.floor(
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24),
  );
  const phase = (daysSinceNew % lunarMonth) / lunarMonth;

  if (phase < 0.1 || phase > 0.9) return 'New Moon';
  if (phase < 0.25) return 'Waxing Crescent';
  if (phase < 0.35) return 'First Quarter';
  if (phase < 0.65) return 'Waxing Gibbous';
  if (phase < 0.75) return 'Full Moon';
  if (phase < 0.9) return 'Waning Gibbous';
  return 'Last Quarter';
};

// Enhanced daily guidance that changes based on multiple factors
const generateEnhancedDailyGuidance = (
  currentChart: AstroChartInformation[],
  birthChart: any,
  userName?: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  const name = userName || 'dear soul';
  const dayOfWeek = today.day();
  const dayRuler = dayRulers[dayOfWeek as keyof typeof dayRulers];
  const universalDay = getDailyNumerology(today);

  // Get current planetary positions
  const currentSun = currentChart.find((p) => p.body === 'Sun');
  const currentMoon = currentChart.find((p) => p.body === 'Moon');

  // Get birth chart planets if available
  const birthSun = birthChart?.find((p: any) => p.body === 'Sun');

  // Create dynamic guidance based on multiple factors
  const dayInfluence = getDayOfWeekInfluence(dayOfWeek, dayRuler);
  const numerologyInsight = getNumerologyInsight(universalDay);
  const planetaryAspect = getPlanetaryAspect(currentSun, currentMoon, birthSun);

  return `${dayInfluence} ${planetaryAspect} ${numerologyInsight} The cosmic currents favor ${getActionGuidance(dayRuler, currentMoon?.sign || 'transition')} today.`;
};

const getDayOfWeekInfluence = (dayOfWeek: number, ruler: string): string => {
  const influences = {
    0: `this Sunday's Solar energy illuminates new possibilities and personal power.`, // Sun
    1: `this Monday's Lunar influence heightens intuition and emotional awareness.`, // Moon
    2: `this Tuesday's Martian fire energizes action and courage.`, // Mars
    3: `this Wednesday's Mercurial energy sharpens communication and learning.`, // Mercury
    4: `this Thursday's Jupiterian expansion brings wisdom and opportunities.`, // Jupiter
    5: `this Friday's Venusian grace enhances love, beauty, and creativity.`, // Venus
    6: `this Saturday's Saturnian structure supports discipline and practical achievements.`, // Saturn
  };

  return influences[dayOfWeek as keyof typeof influences];
};

const getNumerologyInsight = (universalDay: number): string => {
  const insights = {
    1: "Today's vibration (1) calls for leadership and new beginnings.",
    2: "Today's vibration (2) emphasizes cooperation and balance.",
    3: "Today's vibration (3) sparks creativity and self-expression.",
    4: "Today's vibration (4) grounds you in practical matters.",
    5: "Today's vibration (5) brings freedom and adventure.",
    6: "Today's vibration (6) focuses on nurturing and responsibility.",
    7: "Today's vibration (7) deepens spiritual understanding.",
    8: "Today's vibration (8) manifests material success.",
    9: "Today's vibration (9) completes cycles and serves others.",
    11: "Today's master vibration (11) channels divine inspiration.",
    22: "Today's master vibration (22) builds lasting foundations.",
    33: "Today's master vibration (33) radiates healing energy.",
  };

  return (
    insights[universalDay as keyof typeof insights] ||
    "Today's energy supports personal growth."
  );
};

const getPlanetaryAspect = (
  currentSun: any,
  currentMoon: any,
  birthSun: any,
): string => {
  if (!birthSun)
    return 'The current planetary alignment supports your natural rhythms.';

  const sunInSameSign = currentSun?.sign === birthSun.sign;
  const moonAspect = currentMoon?.sign;

  if (sunInSameSign) {
    return `With the Sun returning to your birth sign of ${birthSun.sign}, this is your personal new year - a time of renewal and fresh starts.`;
  }

  return `The Sun in ${currentSun?.sign || 'transition'} activates ${getSignInteraction(currentSun?.sign, birthSun.sign)} while the Moon in ${moonAspect} colors your emotional landscape.`;
};

const getSignInteraction = (currentSign: string, birthSign: string): string => {
  // Simplified sign interaction - could be expanded with full aspect calculations
  return `different energies than your natal ${birthSign}`;
};

const getActionGuidance = (dayRuler: string, moonSign: string): string => {
  const actions = {
    Sun: 'self-expression and leadership',
    Moon: 'introspection and emotional healing',
    Mars: 'taking decisive action',
    Mercury: 'learning and communication',
    Jupiter: 'expansion and philosophical thinking',
    Venus: 'love, beauty, and artistic pursuits',
    Saturn: 'discipline and long-term planning',
  };

  return (
    actions[dayRuler as keyof typeof actions] || 'following your intuition'
  );
};

// Calculate which house a planet is in using Whole Sign Houses
// In Whole Sign Houses, the entire sign containing the Ascendant is the 1st house
const calculateHouseWholeSig = (
  planetLongitude: number,
  ascendantLongitude: number,
): number => {
  const ascendantSign = Math.floor(ascendantLongitude / 30);
  const planetSign = Math.floor(planetLongitude / 30);

  let house = ((planetSign - ascendantSign + 12) % 12) + 1;
  return house;
};

// Get house meaning (full description for context)
const getHouseMeaning = (house: number): string => {
  const meanings: Record<number, string> = {
    1: 'identity, confidence, how you present yourself',
    2: 'finances, self-worth, possessions',
    3: 'communication, learning, siblings',
    4: 'home, family, inner foundation',
    5: 'creativity, joy, romance, children',
    6: 'health, habits, work environment',
    7: 'partnerships, marriage, collaboration',
    8: 'intimacy, shared money, transformation',
    9: 'travel, philosophy, beliefs, education',
    10: 'career, reputation, leadership',
    11: 'community, friends, social causes',
    12: 'subconscious, solitude, healing',
  };
  return meanings[house] || 'personal growth';
};

// Get sign tone modifier
const getSignTone = (planet: string, sign: string): string => {
  const signModifiers: Record<string, Record<string, string>> = {
    Mars: {
      Aries: 'bold and impatient',
      Taurus: 'steady and determined',
      Gemini: 'quick and versatile',
      Cancer: 'protective and emotional',
      Leo: 'dramatic and proud',
      Virgo: 'precise and methodical',
      Libra: 'diplomatic but indecisive',
      Scorpio: 'intense and strategic',
      Sagittarius: 'adventurous and direct',
      Capricorn: 'disciplined and strategic',
      Aquarius: 'unconventional and detached',
      Pisces: 'subtle and emotionally-driven',
    },
    Venus: {
      Aries: 'passionate and direct',
      Taurus: 'sensual and stable',
      Gemini: 'playful and communicative',
      Cancer: 'nurturing and emotional',
      Leo: 'dramatic and generous',
      Virgo: 'practical and refined',
      Libra: 'harmonious and beautiful',
      Scorpio: 'intense and transformative',
      Sagittarius: 'optimistic and adventurous',
      Capricorn: 'serious and traditional',
      Aquarius: 'unconventional and friendly',
      Pisces: 'romantic and idealistic',
    },
    Jupiter: {
      Aries: 'boldly optimistic',
      Taurus: 'steadily abundant',
      Gemini: 'expansively curious',
      Cancer: 'nurturingly generous',
      Leo: 'confidently generous',
      Virgo: 'practically wise',
      Libra: 'harmoniously abundant',
      Scorpio: 'deeply transformative',
      Sagittarius: 'philosophically expansive',
      Capricorn: 'strategically ambitious',
      Aquarius: 'innovatively forward-thinking',
      Pisces: 'compassionately spiritual',
    },
    Mercury: {
      Aries: 'direct and assertive',
      Taurus: 'steady and practical',
      Gemini: 'quick and versatile',
      Cancer: 'emotional and intuitive',
      Leo: 'dramatic and expressive',
      Virgo: 'analytical and precise',
      Libra: 'diplomatic and balanced',
      Scorpio: 'deep and probing',
      Sagittarius: 'philosophical and broad',
      Capricorn: 'strategic and serious',
      Aquarius: 'innovative and detached',
      Pisces: 'intuitive and dreamy',
    },
    Sun: {
      Aries: 'boldly confident',
      Taurus: 'steadily grounded',
      Gemini: 'curiously versatile',
      Cancer: 'emotionally nurturing',
      Leo: 'dramatically expressive',
      Virgo: 'practically refined',
      Libra: 'harmoniously balanced',
      Scorpio: 'intensely transformative',
      Sagittarius: 'optimistically adventurous',
      Capricorn: 'ambitiously disciplined',
      Aquarius: 'innovatively independent',
      Pisces: 'compassionately intuitive',
    },
    Moon: {
      Aries: 'impulsively emotional',
      Taurus: 'steadily comfort-seeking',
      Gemini: 'restlessly curious',
      Cancer: 'deeply nurturing',
      Leo: 'dramatically expressive',
      Virgo: 'anxiously practical',
      Libra: 'harmoniously balanced',
      Scorpio: 'intensely emotional',
      Sagittarius: 'optimistically restless',
      Capricorn: 'emotionally reserved',
      Aquarius: 'detachedly intuitive',
      Pisces: 'deeply compassionate',
    },
    Saturn: {
      Aries: 'disciplined and assertive',
      Taurus: 'patiently building',
      Gemini: 'seriously focused',
      Cancer: 'emotionally structured',
      Leo: 'responsibly confident',
      Virgo: 'meticulously organized',
      Libra: 'diplomatically balanced',
      Scorpio: 'intensely transformative',
      Sagittarius: 'philosophically disciplined',
      Capricorn: 'authoritatively structured',
      Aquarius: 'systematically innovative',
      Pisces: 'spiritually bounded',
    },
    Uranus: {
      Aries: 'suddenly revolutionary',
      Taurus: 'unexpectedly stable',
      Gemini: 'rapidly innovative',
      Cancer: 'unconventionally emotional',
      Leo: 'dramatically independent',
      Virgo: 'systematically rebellious',
      Libra: 'uniquely balanced',
      Scorpio: 'deeply transformative',
      Sagittarius: 'philosophically radical',
      Capricorn: 'traditionally disruptive',
      Aquarius: 'uniquely innovative',
      Pisces: 'intuitively awakened',
    },
    Neptune: {
      Aries: 'idealistically bold',
      Taurus: 'dreamily stable',
      Gemini: 'illusions of communication',
      Cancer: 'compassionately nurturing',
      Leo: 'creatively inspired',
      Virgo: 'practically confused',
      Libra: 'harmoniously idealistic',
      Scorpio: 'deeply mystical',
      Sagittarius: 'spiritually expansive',
      Capricorn: 'dreamily ambitious',
      Aquarius: 'visionarily innovative',
      Pisces: 'deeply spiritual',
    },
    Pluto: {
      Aries: 'powerfully transformative',
      Taurus: 'deeply material changes',
      Gemini: 'communication transformation',
      Cancer: 'emotional rebirth',
      Leo: 'creative power shifts',
      Virgo: 'practical regeneration',
      Libra: 'relationship transformation',
      Scorpio: 'intensely regenerative',
      Sagittarius: 'philosophical rebirth',
      Capricorn: 'structural transformation',
      Aquarius: 'revolutionary change',
      Pisces: 'spiritual transformation',
    },
  };

  return signModifiers[planet]?.[sign] || '';
};

// Comprehensive planet-house transit meanings (based on astrological framework)
const getPlanetHouseInsight = (planet: string, house: number): string => {
  const planetHouseMap: Record<string, Record<number, string>> = {
    Mars: {
      1: 'your personal drive and confidence are heightened',
      2: 'you feel motivated to earn more and prove your self-worth',
      3: 'your mind is busy and your communication becomes more assertive',
      4: 'there may be tension or initiative needed at home or with family',
      5: 'passion and creativity rise while romance heats up',
      6: 'you focus strongly on work and health routines',
      7: 'you may experience conflict or passion in relationships',
      8: 'deep sensual energy activates and shared finances come into focus',
      9: 'you feel driven to explore, travel, or study',
      10: 'your ambition drives you toward visible career achievements',
      11: 'your social life becomes active and you may take leadership in groups',
      12: 'hidden effort may lead to burnout if you push too hard',
    },
    Venus: {
      1: 'your charm and personal appeal are enhanced',
      2: 'you experience abundance in finances or self-worth',
      3: 'communication and learning flow with harmony',
      4: 'beauty and harmony find their way into your home',
      5: 'romance, creativity, and joy flourish',
      6: 'you find pleasure in work and daily routines',
      7: 'harmony and attraction flow in your partnerships',
      8: 'your intimate connections deepen',
      9: 'you feel drawn to travel, philosophy, and learning',
      10: 'you receive recognition and harmony in your career',
      11: 'your social connections and friendships flourish',
      12: 'you may find yourself in compassionate service or experiencing hidden love',
    },
    Jupiter: {
      1: 'your personal growth and opportunities expand',
      2: 'you experience growth in income or self-confidence, but watch for overspending',
      3: 'your learning and communication expand',
      4: 'your home expands and your family grows',
      5: 'you enjoy creative abundance and joyful experiences',
      6: 'opportunities arise in work and wellness',
      7: 'you experience positive partnerships and collaborations',
      8: 'your shared resources and transformation grow',
      9: 'you expand through learning, travel, and philosophy',
      10: 'your career advances and you receive recognition',
      11: 'your community involvement and aspirations grow',
      12: 'your spiritual growth and compassion deepen',
    },
    Mercury: {
      1: 'your mind is active and your self-expression is clear',
      2: 'you focus on financial communication and values',
      3: 'your communication and learning are heightened',
      4: 'important conversations arise about home and family',
      5: 'you express yourself creatively and playfully',
      6: 'your thinking focuses on work and health',
      7: 'important conversations emerge in partnerships',
      8: 'you gain deep insights about shared resources',
      9: 'you experience philosophical insights and plan travel',
      10: 'career-related communications and strategy come to the forefront',
      11: 'you engage in social networking and group communication',
      12: 'intuitive insights arise through inner reflection',
    },
    Sun: {
      1: 'this is your personal new year with fresh starts and vitality',
      2: 'you focus on values, finances, and self-worth',
      3: 'ideas and communication are illuminated',
      4: 'emphasis is placed on home, family, and foundation',
      5: 'creative expression and joyful confidence shine',
      6: 'you receive recognition for work and health routines',
      7: 'partnerships and balance come into focus',
      8: 'transformation and shared resources are highlighted',
      9: 'philosophical exploration and travel call to you',
      10: 'your career is in the spotlight and you receive public recognition',
      11: 'social goals and community involvement take center stage',
      12: 'spiritual reflection and inner work deepen',
    },
    Moon: {
      1: 'your emotional awareness and sensitivity are heightened',
      2: 'emotional needs arise around security and values',
      3: 'emotional communication and learning flow',
      4: 'your emotional focus turns to home and security',
      5: 'emotional creativity and romantic feelings emerge',
      6: 'daily routines and health needs are emphasized',
      7: 'emotional needs surface in relationships',
      8: 'you experience deep emotional transformation',
      9: 'you explore your beliefs emotionally',
      10: 'public emotional expression becomes important',
      11: 'emotional connections deepen with friends',
      12: 'deep inner reflection and healing unfold',
    },
    Saturn: {
      1: 'discipline and responsibility shape your personal expression',
      2: 'lessons arise about finances and self-worth',
      3: 'you focus seriously on communication and learning',
      4: 'responsibilities or lessons emerge around home and family',
      5: 'structure is needed in creativity and romance',
      6: 'discipline is required in work and health',
      7: 'commitment and responsibility deepen in partnerships',
      8: 'deep transformation unfolds through shared resources',
      9: 'philosophical discipline and structured beliefs take hold',
      10: 'career responsibilities and long-term goals demand attention',
      11: 'structure is needed in friendships and goals',
      12: 'karmic lessons and spiritual discipline emerge',
    },
    Uranus: {
      1: 'sudden changes arise in your identity and self-expression',
      2: 'unexpected shifts occur in finances and values',
      3: 'revolutionary ideas transform your communication',
      4: 'sudden changes emerge at home or with family',
      5: 'innovative creativity and unexpected romance surprise you',
      6: 'sudden changes occur in work routines or health habits',
      7: 'unexpected shifts arise in partnerships',
      8: 'radical transformation of shared resources unfolds',
      9: 'you experience breakthroughs in philosophy or travel',
      10: 'sudden career changes or recognition appear',
      11: 'innovative social connections and goals emerge',
      12: 'spiritual awakening and liberation unfold',
    },
    Neptune: {
      1: 'idealism colors your identity and self-expression',
      2: 'confusion or idealism surrounds finances',
      3: 'illusions or inspiration flow through communication',
      4: 'idealistic or confusing situations arise at home',
      5: 'romantic idealization and creative inspiration emerge',
      6: 'confusion surrounds work and health routines',
      7: 'idealistic or confusing situations arise in partnerships',
      8: 'mystical transformation of shared resources unfolds',
      9: 'spiritual exploration brings confusion or clarity about beliefs',
      10: 'idealized career goals or confusion emerges',
      11: 'idealistic friendships and social causes call to you',
      12: 'deep spiritual connection and compassion deepen',
    },
    Pluto: {
      1: 'profound transformation of your identity and personal power unfolds',
      2: 'deep transformation of finances and self-worth occurs',
      3: 'powerful transformation flows through communication',
      4: 'deep emotional transformation happens at home',
      5: 'transformative creativity and romance emerge',
      6: 'deep changes occur in work and health',
      7: 'powerful transformation unfolds in partnerships',
      8: 'intense regeneration of shared resources takes place',
      9: 'profound transformation of beliefs and philosophy occurs',
      10: 'deep career transformation and power shifts emerge',
      11: 'transformative social connections and goals unfold',
      12: 'spiritual transformation and karmic release occur',
    },
  };

  return (
    planetHouseMap[planet]?.[house] || 'bringing focus to this area of life'
  );
};

// Get transit-to-house insight
const getTransitToHouseInsight = (
  transitPlanet: AstroChartInformation,
  natalChart: any,
): {
  planet: string;
  house: number;
  houseMeaning: string;
  insight: string;
  sign: string;
} | null => {
  const ascendant = natalChart.find((p: any) => p.body === 'Ascendant');

  // If no ascendant, use Sun-based approximation (less accurate)
  if (!ascendant) {
    const natalSun = natalChart.find((p: any) => p.body === 'Sun');
    if (!natalSun) return null;

    // Whole Sign approximation using Sun as reference
    const house = calculateHouseWholeSig(
      transitPlanet.eclipticLongitude,
      natalSun.eclipticLongitude,
    );
    const houseMeaning = `${getHouseMeaning(house)} (approximate - add birth time for accuracy)`;
    const sign = transitPlanet.sign;

    const insight = getPlanetHouseInsight(transitPlanet.body, house);

    return {
      planet: transitPlanet.body,
      house,
      houseMeaning,
      insight,
      sign,
    };
  }

  // Use actual ascendant with Whole Sign Houses
  const house = calculateHouseWholeSig(
    transitPlanet.eclipticLongitude,
    ascendant.eclipticLongitude,
  );
  const houseMeaning = getHouseMeaning(house);
  const sign = transitPlanet.sign;

  const insight = getPlanetHouseInsight(transitPlanet.body, house);

  return {
    planet: transitPlanet.body,
    house,
    houseMeaning,
    insight,
    sign,
  };
};

const getOrdinalSuffix = (n: number): string => {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

// Format transit insight into natural, flowing language
const formatTransitInsight = (transit: any, isFirst: boolean): string => {
  const houseOrdinal = `${transit.house}${getOrdinalSuffix(transit.house)}`;
  const signTone = getSignTone(transit.planet, transit.sign);

  // Build natural sentence - make sure insights flow as complete thoughts
  let sentence = '';

  // Capitalize the planet name for better readability
  const planetName = transit.planet;

  if (isFirst) {
    if (signTone) {
      sentence = `${planetName} in ${transit.sign} brings ${signTone} energy to your ${houseOrdinal} house, ${transit.insight}`;
    } else {
      sentence = `${planetName} in ${transit.sign} activates your ${houseOrdinal} house, ${transit.insight}`;
    }
  } else {
    if (signTone) {
      sentence = `Meanwhile, ${planetName} in ${transit.sign} brings ${signTone} focus to your ${houseOrdinal} house, ${transit.insight}`;
    } else {
      sentence = `Meanwhile, ${planetName} in ${transit.sign} focuses on your ${houseOrdinal} house, ${transit.insight}`;
    }
  }

  // Ensure sentence starts with capital and ends with period
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  if (!sentence.endsWith('.')) {
    sentence += '.';
  }

  return sentence;
};

// Enhanced personal insight with transit-to-house information
const generateEnhancedPersonalInsight = (
  natalChart: any,
  currentChart: AstroChartInformation[],
  userName?: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  if (!natalChart || natalChart.length === 0) {
    const seasonalInsight = getSeasonalInsight(today);
    return `While your birth chart isn't available, ${seasonalInsight} Trust in the natural cycles and your inner wisdom.`;
  }

  const transits: any[] = [];

  // Get key transiting planets (prioritize personal planets, then social, then outer)
  const transitMars = currentChart.find((planet) => planet.body === 'Mars');
  const transitVenus = currentChart.find((planet) => planet.body === 'Venus');
  const transitMercury = currentChart.find(
    (planet) => planet.body === 'Mercury',
  );
  const transitJupiter = currentChart.find(
    (planet) => planet.body === 'Jupiter',
  );
  const transitSaturn = currentChart.find((planet) => planet.body === 'Saturn');
  const transitUranus = currentChart.find((planet) => planet.body === 'Uranus');
  const transitNeptune = currentChart.find(
    (planet) => planet.body === 'Neptune',
  );
  const transitPluto = currentChart.find((planet) => planet.body === 'Pluto');

  // Prioritize Mars and Venus for most relevant daily insights
  if (transitMars) {
    const marsTransit = getTransitToHouseInsight(transitMars, natalChart);
    if (marsTransit) transits.push(marsTransit);
  }

  if (transitVenus && transits.length < 2) {
    const venusTransit = getTransitToHouseInsight(transitVenus, natalChart);
    if (venusTransit) transits.push(venusTransit);
  }

  // Add Mercury for communication focus
  if (transitMercury && transits.length < 2) {
    const mercuryTransit = getTransitToHouseInsight(transitMercury, natalChart);
    if (mercuryTransit) transits.push(mercuryTransit);
  }

  // Add Jupiter for expansion opportunities
  if (transitJupiter && transits.length < 2) {
    const jupiterTransit = getTransitToHouseInsight(transitJupiter, natalChart);
    if (jupiterTransit) transits.push(jupiterTransit);
  }

  // Fallback to Saturn if needed (slower moving but significant)
  if (transits.length === 0 && transitSaturn) {
    const saturnTransit = getTransitToHouseInsight(transitSaturn, natalChart);
    if (saturnTransit) transits.push(saturnTransit);
  }

  // Format insights into natural, flowing prose
  if (transits.length > 0) {
    if (transits.length === 1) {
      return formatTransitInsight(transits[0], true);
    } else {
      return `${formatTransitInsight(transits[0], true)} ${formatTransitInsight(transits[1], false)}`;
    }
  }

  // Fallback to original logic if no house transits found
  const natalSun = natalChart.find((planet: any) => planet.body === 'Sun');
  const natalMoon = natalChart.find((planet: any) => planet.body === 'Moon');
  const currentMoon = currentChart.find((planet) => planet.body === 'Moon');
  const currentVenus = currentChart.find((planet) => planet.body === 'Venus');

  const moonConnection = getMoonConnection(natalMoon, currentMoon);
  const venusInfluence = getVenusInfluence(currentVenus, natalSun);

  return `${moonConnection} ${venusInfluence} This is an excellent time for ${getPersonalFocus(natalSun?.sign, today)}.`;
};

const getMoonConnection = (natalMoon: any, currentMoon: any): string => {
  if (!natalMoon || !currentMoon)
    return 'The lunar energies are supporting your emotional growth.';

  if (natalMoon.sign === currentMoon.sign) {
    return `The Moon returns to your birth Moon sign of ${natalMoon.sign}, heightening your natural emotional instincts.`;
  }

  return `Your natal Moon in ${natalMoon.sign} receives supportive energy from today's Moon in ${currentMoon.sign}.`;
};

const getVenusInfluence = (currentVenus: any, natalSun: any): string => {
  if (!currentVenus || !natalSun)
    return 'Venus is bringing harmony to your relationships.';

  return `Venus in ${currentVenus.sign} is ${getVenusAspect(currentVenus.sign, natalSun.sign)} your Sun sign energy.`;
};

const getVenusAspect = (venusSign: string, sunSign: string): string => {
  return venusSign === sunSign ? 'amplifying' : 'harmonizing with';
};

const getPersonalFocus = (sunSign: string, today: dayjs.Dayjs): string => {
  const focuses = {
    Aries: 'initiating new projects',
    Taurus: 'building stability',
    Gemini: 'connecting and learning',
    Cancer: 'nurturing relationships',
    Leo: 'creative self-expression',
    Virgo: 'organizing and perfecting',
    Libra: 'seeking balance and beauty',
    Scorpio: 'deep transformation',
    Sagittarius: 'expanding horizons',
    Capricorn: 'achieving goals',
    Aquarius: 'innovative thinking',
    Pisces: 'spiritual connection',
  };

  return focuses[sunSign as keyof typeof focuses] || 'personal growth';
};

const getSeasonalInsight = (today: dayjs.Dayjs): string => {
  const month = today.month();

  if (month >= 2 && month <= 4)
    return "spring's renewal energy is awakening fresh possibilities.";
  if (month >= 5 && month <= 7)
    return "summer's vibrant energy supports growth and expansion.";
  if (month >= 8 && month <= 10)
    return "autumn's wisdom encourages reflection and harvest.";
  return "winter's introspective energy supports inner work and planning.";
};

// Enhanced lucky elements with daily variation (no crystals/metals)
const generateEnhancedLuckyElements = (
  sunSign: string,
  moonPhase: string,
  today: dayjs.Dayjs = dayjs(),
  birthChart?: any,
): string[] => {
  const dayOfWeek = today.day();
  const universalDay = getDailyNumerology(today);

  const elements: string[] = [];

  // Base lucky numbers by sun sign
  const baseLuckyNumbers = {
    Aries: 'Number 1',
    Taurus: 'Number 6',
    Gemini: 'Number 5',
    Cancer: 'Number 2',
    Leo: 'Number 1',
    Virgo: 'Number 6',
    Libra: 'Number 7',
    Scorpio: 'Number 8',
    Sagittarius: 'Number 9',
    Capricorn: 'Number 10',
    Aquarius: 'Number 11',
    Pisces: 'Number 12',
  };

  elements.push(
    baseLuckyNumbers[sunSign as keyof typeof baseLuckyNumbers] || 'Number 7',
  );

  // Day-specific colors
  const dayColors = [
    'Sunday color: Gold',
    'Monday color: Silver',
    'Tuesday color: Red',
    'Wednesday color: Yellow',
    'Thursday color: Purple',
    'Friday color: Green',
    'Saturday color: Indigo',
  ];
  elements.push(dayColors[dayOfWeek]);

  // Moon phase herbs/scents
  const moonScents = {
    'New Moon': 'Sage for clearing',
    'Waxing Crescent': 'Mint for growth',
    'First Quarter': 'Lemon for clarity',
    'Waxing Gibbous': 'Orange for abundance',
    'Full Moon': 'Jasmine for manifestation',
    'Waning Gibbous': 'Lavender for release',
    'Last Quarter': 'Cedar for grounding',
  };

  elements.push(
    moonScents[moonPhase as keyof typeof moonScents] || 'Rose for love',
  );

  // Numerology-based herb
  elements.push(
    `Universal Day ${universalDay} herb: ${getNumerologyHerb(universalDay)}`,
  );

  // Birth chart specific guidance (if available)
  if (birthChart) {
    const venus = birthChart.find((p: any) => p.body === 'Venus');
    if (venus) {
      elements.push(
        `Venus in ${venus.sign} theme: ${getVenusTheme(venus.sign)}`,
      );
    }
  }

  // Time-based element
  const hour = today.hour();
  if (hour >= 6 && hour < 12) {
    elements.push('Morning energy: Fresh intentions');
  } else if (hour >= 12 && hour < 18) {
    elements.push('Afternoon energy: Active manifestation');
  } else if (hour >= 18 && hour < 22) {
    elements.push('Evening energy: Reflection and gratitude');
  } else {
    elements.push('Night energy: Dreams and intuition');
  }

  return elements;
};

const getNumerologyHerb = (number: number): string => {
  const herbs = {
    1: 'Cinnamon',
    2: 'Jasmine',
    3: 'Mint',
    4: 'Sage',
    5: 'Lavender',
    6: 'Rose',
    7: 'Frankincense',
    8: 'Basil',
    9: 'Sandalwood',
    11: 'Myrrh',
    22: 'Cedar',
    33: 'Lotus',
  };

  return herbs[number as keyof typeof herbs] || 'Rosemary';
};

const getVenusTheme = (venusSign: string): string => {
  const themes = {
    Aries: 'Passionate pursuits',
    Taurus: 'Sensual pleasures',
    Gemini: 'Social connections',
    Cancer: 'Emotional nurturing',
    Leo: 'Creative expression',
    Virgo: 'Practical beauty',
    Libra: 'Harmony and balance',
    Scorpio: 'Deep intimacy',
    Sagittarius: 'Adventure and freedom',
    Capricorn: 'Traditional values',
    Aquarius: 'Unique perspectives',
    Pisces: 'Spiritual love',
  };

  return themes[venusSign as keyof typeof themes] || 'Beauty and love';
};

// Generate cosmic highlight - a special daily insight
const generateCosmicHighlight = (
  currentChart: AstroChartInformation[],
  today: dayjs.Dayjs = dayjs(),
): string => {
  const dayOfWeek = today.day();
  const universalDay = getDailyNumerology(today);

  const mercury = currentChart.find((p) => p.body === 'Mercury');
  const mars = currentChart.find((p) => p.body === 'Mars');

  // Create unique daily highlight
  const highlights = [
    `Mercury in ${mercury?.sign || 'transition'} enhances communication and learning opportunities.`,
    `Mars in ${mars?.sign || 'motion'} energizes your drive and ambition.`,
    `The cosmic dance today favors ${getDayOfWeekFocus(dayOfWeek)}.`,
    `Universal Day ${universalDay} brings ${getNumerologyTheme(universalDay)} to the forefront.`,
  ];

  // Rotate based on day of year for variety
  const highlightIndex = today.dayOfYear() % highlights.length;
  return highlights[highlightIndex];
};

const getDayOfWeekFocus = (dayOfWeek: number): string => {
  const focuses = [
    'self-discovery and leadership',
    'emotional healing and intuition',
    'action and courage',
    'learning and communication',
    'expansion and wisdom',
    'love and creativity',
    'structure and achievement',
  ];

  return focuses[dayOfWeek];
};

const getNumerologyTheme = (number: number): string => {
  const themes = {
    1: 'new beginnings and independence',
    2: 'cooperation and partnership',
    3: 'creativity and joy',
    4: 'stability and hard work',
    5: 'freedom and adventure',
    6: 'love and responsibility',
    7: 'spirituality and introspection',
    8: 'material success and power',
    9: 'completion and service',
    11: 'inspiration and enlightenment',
    22: 'master building and manifestation',
    33: 'healing and compassion',
  };

  return themes[number as keyof typeof themes] || 'personal growth';
};

// Generate daily affirmation - rotates based on day of year
const generateDailyAffirmation = (
  sunSign: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  const affirmations: Record<string, string[]> = {
    Aries: [
      'I embrace my pioneering spirit and lead with courage.',
      'My passion ignites positive change in the world.',
      'I trust my instincts and take bold action.',
      'My enthusiasm is contagious and uplifts those around me.',
      'I am a fearless trailblazer on my own path.',
      'Every challenge strengthens my warrior spirit.',
      'I channel my fire into creative accomplishments.',
    ],
    Taurus: [
      'I am grounded in abundance and trust in natural timing.',
      'My steady presence creates security for myself and others.',
      'I savor the beauty in each moment.',
      'My patience allows the best outcomes to unfold.',
      'I deserve comfort, pleasure, and prosperity.',
      'My determination builds lasting foundations.',
      'I trust my senses to guide me wisely.',
    ],
    Gemini: [
      'I communicate with clarity and embrace new learning.',
      'My curiosity opens doors to infinite possibilities.',
      "I adapt with grace to life's ever-changing flow.",
      'My words have the power to heal and connect.',
      'I celebrate the duality within me.',
      'My quick mind serves my highest purpose.',
      'I find joy in exploring new ideas and perspectives.',
    ],
    Cancer: [
      'I nurture myself and others with loving compassion.',
      'My emotional depth is a source of strength.',
      'I create safe spaces wherever I go.',
      'My intuition guides me toward what truly matters.',
      'I honor my needs while caring for others.',
      'My home is a sanctuary of peace and love.',
      'I embrace my sensitivity as a gift.',
    ],
    Leo: [
      'I shine my authentic light and inspire others.',
      'My creativity flows abundantly from my heart.',
      'I am worthy of love, recognition, and success.',
      'My generosity returns to me multiplied.',
      'I lead with warmth and integrity.',
      'My confidence empowers those around me.',
      'I celebrate my uniqueness without apology.',
    ],
    Virgo: [
      'I perfect my craft with patience and dedication.',
      'My attention to detail creates excellence.',
      'I serve others while honoring my own wellbeing.',
      'My analytical mind solves problems with grace.',
      'I release the need for perfection and embrace progress.',
      'My practical wisdom guides me daily.',
      'I find peace in purposeful routine.',
    ],
    Libra: [
      'I create harmony and beauty in all I do.',
      'My relationships reflect the love I give.',
      'I make decisions that honor my truth.',
      'My diplomacy brings peace to challenging situations.',
      'I balance giving and receiving with ease.',
      'My appreciation for beauty enriches my life.',
      'I stand firmly in my values while respecting others.',
    ],
    Scorpio: [
      'I transform challenges into wisdom and strength.',
      'My depth of feeling is my superpower.',
      'I release what no longer serves my growth.',
      'My intuition reveals hidden truths.',
      'I embrace rebirth in every ending.',
      'My passion fuels meaningful transformation.',
      'I trust the process of healing and renewal.',
    ],
    Sagittarius: [
      'I expand my horizons with optimism and faith.',
      'My adventures bring wisdom and joy.',
      'I speak my truth with kindness and conviction.',
      'My optimism opens doors of opportunity.',
      'I embrace freedom while honoring my commitments.',
      'My philosophical mind seeks higher understanding.',
      'I trust the journey even when the destination is unclear.',
    ],
    Capricorn: [
      'I achieve my goals through persistent effort.',
      'My discipline creates the life I envision.',
      'I balance ambition with self-compassion.',
      'My integrity is the foundation of my success.',
      'I climb my mountain one step at a time.',
      'My wisdom comes from experience and reflection.',
      'I build legacies that outlast my lifetime.',
    ],
    Aquarius: [
      'I innovate for the highest good of all.',
      'My uniqueness contributes to collective evolution.',
      'I embrace my role as a change-maker.',
      'My vision inspires others to think differently.',
      'I honor both my independence and my community.',
      'My humanitarian heart guides my actions.',
      'I trust my unconventional path leads to progress.',
    ],
    Pisces: [
      'I trust my intuition and flow with divine guidance.',
      'My compassion heals myself and others.',
      'I embrace my dreams as messages from my soul.',
      'My creativity channels universal inspiration.',
      'I set healthy boundaries while remaining open-hearted.',
      'My spiritual connection guides my earthly journey.',
      'I find strength in surrender and acceptance.',
    ],
  };

  const signAffirmations = affirmations[sunSign] || [
    'I am aligned with my highest potential.',
  ];
  const dayOfYear = today.dayOfYear();
  const index = dayOfYear % signAffirmations.length;

  return signAffirmations[index];
};

// Generate a concise, evocative headline based on chart context
const generateHeadline = (
  currentChart: AstroChartInformation[],
  birthChart: any,
  moonPhase: string,
  today: dayjs.Dayjs,
): string => {
  const currentMoon = currentChart.find((p) => p.body === 'Moon');
  const currentSun = currentChart.find((p) => p.body === 'Sun');
  const natalSun = birthChart?.find((p: any) => p.body === 'Sun');

  // Check for special alignments
  if (natalSun && currentSun?.sign === natalSun.sign) {
    return `Your Solar Season: A Day of Personal Power`;
  }

  // Moon phase based headlines
  const phaseHeadlines: Record<string, string[]> = {
    'New Moon': [
      'Seeds in the Dark: Plant Your Intentions',
      'The Void Speaks: Listen Inward',
      'Beginnings Stir Beneath the Surface',
    ],
    'Full Moon': [
      'Illumination Arrives: What Do You See?',
      'The Light Reveals: Harvest Your Truth',
      'Culmination and Release',
    ],
    'Waxing Crescent': [
      'Momentum Builds: Take Your First Step',
      'The Spark Catches: Nurture Your Vision',
    ],
    'First Quarter': [
      'A Crossroads Moment: Choose Your Path',
      'Obstacles Become Openings',
    ],
    'Waxing Gibbous': [
      'Refining Your Approach: Almost There',
      'The Details Matter Now',
    ],
    'Waning Gibbous': [
      'Gratitude and Wisdom: Share What You Know',
      'The Teaching Moon: Integrate and Offer',
    ],
    'Last Quarter': [
      'Release What Weighs: Clear the Way',
      'Letting Go Creates Space',
    ],
    'Waning Crescent': [
      'Rest Before Renewal: Honor the Pause',
      'The Sacred Retreat: Dream and Restore',
    ],
  };

  const headlines = phaseHeadlines[moonPhase] || ['A Day of Cosmic Flow'];
  const dayIndex = today.dayOfYear() % headlines.length;

  // Add Moon sign flavor
  const moonSign = currentMoon?.sign;
  if (moonSign) {
    return `${headlines[dayIndex]} (Moon in ${moonSign})`;
  }

  return headlines[dayIndex];
};

// Generate the main overview - personal and chart-referenced
const generateOverview = (
  currentChart: AstroChartInformation[],
  birthChart: any,
  moonPhase: string,
  userName?: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  const natalSun = birthChart?.find((p: any) => p.body === 'Sun');
  const natalMoon = birthChart?.find((p: any) => p.body === 'Moon');
  const natalAsc = birthChart?.find((p: any) => p.body === 'Ascendant');
  const currentMoon = currentChart.find((p) => p.body === 'Moon');
  const currentSun = currentChart.find((p) => p.body === 'Sun');

  const parts: string[] = [];

  // Opening that references actual chart
  if (natalSun && currentSun) {
    if (currentSun.sign === natalSun.sign) {
      parts.push(
        `With the Sun in your birth sign of ${natalSun.sign}, this is your time to shine authentically.`,
      );
    } else {
      const houseArea = getSignHouseRelation(currentSun.sign, natalSun.sign);
      parts.push(
        `The Sun in ${currentSun.sign} activates ${houseArea} for you, ${natalSun.sign}.`,
      );
    }
  }

  // Moon influence - specific to user's chart
  if (currentMoon && natalMoon) {
    if (currentMoon.sign === natalMoon.sign) {
      parts.push(
        `The Moon returns to your natal ${natalMoon.sign}, amplifying your emotional instincts and inner knowing.`,
      );
    } else {
      const moonRelation = getElementRelation(currentMoon.sign, natalMoon.sign);
      parts.push(
        `Today's ${currentMoon.sign} Moon ${moonRelation} your ${natalMoon.sign} emotional nature.`,
      );
    }
  } else if (currentMoon) {
    parts.push(
      `The Moon in ${currentMoon.sign} colors your emotional landscape with ${getSignQuality(currentMoon.sign)} energy.`,
    );
  }

  // Add rising sign context if available
  if (natalAsc) {
    const ascContext = getAscendantContext(natalAsc.sign, currentChart, today);
    if (ascContext) {
      parts.push(ascContext);
    }
  }

  return parts.join(' ');
};

// Helper functions for overview generation
const getSignHouseRelation = (
  transitSign: string,
  natalSign: string,
): string => {
  const relations: Record<string, string> = {
    same: 'your sense of identity and self-expression',
    next: 'matters of resources and self-worth',
    opposite: 'your relationships and how you partner',
  };
  // Simplified - in full implementation would calculate actual house
  return 'themes of growth and expansion';
};

const getElementRelation = (
  moonSign: string,
  natalMoonSign: string,
): string => {
  const elements: Record<string, string> = {
    Fire: 'Aries,Leo,Sagittarius',
    Earth: 'Taurus,Virgo,Capricorn',
    Air: 'Gemini,Libra,Aquarius',
    Water: 'Cancer,Scorpio,Pisces',
  };

  const getMoonElement = (sign: string): string => {
    for (const [element, signs] of Object.entries(elements)) {
      if (signs.includes(sign)) return element;
    }
    return 'Earth';
  };

  const transitElement = getMoonElement(moonSign);
  const natalElement = getMoonElement(natalMoonSign);

  if (transitElement === natalElement) {
    return 'harmonizes beautifully with';
  }

  const compatible: Record<string, string> = {
    Fire: 'Air',
    Air: 'Fire',
    Earth: 'Water',
    Water: 'Earth',
  };

  if (compatible[transitElement] === natalElement) {
    return 'gently supports';
  }

  return 'brings a different texture to';
};

const getSignQuality = (sign: string): string => {
  const qualities: Record<string, string> = {
    Aries: 'bold and initiating',
    Taurus: 'grounded and sensual',
    Gemini: 'curious and versatile',
    Cancer: 'nurturing and intuitive',
    Leo: 'warm and expressive',
    Virgo: 'discerning and practical',
    Libra: 'harmonious and relational',
    Scorpio: 'deep and transformative',
    Sagittarius: 'expansive and philosophical',
    Capricorn: 'structured and ambitious',
    Aquarius: 'innovative and humanitarian',
    Pisces: 'dreamy and compassionate',
  };
  return qualities[sign] || 'flowing';
};

const getAscendantContext = (
  ascSign: string,
  currentChart: AstroChartInformation[],
  today: dayjs.Dayjs,
): string | null => {
  const dayOfWeek = today.day();
  // Only add ascending context some days to avoid repetition
  if (dayOfWeek % 3 !== 0) return null;

  return `Your ${ascSign} rising invites you to approach the day with ${getSignQuality(ascSign)} presence.`;
};

// Generate focus areas for love, work, and inner world
const generateFocusAreas = (
  currentChart: AstroChartInformation[],
  birthChart: any,
  today: dayjs.Dayjs,
): FocusArea[] => {
  const areas: FocusArea[] = [];
  const venus = currentChart.find((p) => p.body === 'Venus');
  const mars = currentChart.find((p) => p.body === 'Mars');
  const mercury = currentChart.find((p) => p.body === 'Mercury');
  const currentMoon = currentChart.find((p) => p.body === 'Moon');
  const natalVenus = birthChart?.find((p: any) => p.body === 'Venus');
  const natalMars = birthChart?.find((p: any) => p.body === 'Mars');

  // Love focus (Venus-based)
  if (venus) {
    const loveGuidance = natalVenus
      ? `Venus in ${venus.sign} interacts with your natal Venus in ${natalVenus.sign}, ${getVenusInteraction(venus.sign, natalVenus.sign)}.`
      : `Venus in ${venus.sign} invites ${getVenusThemeShort(venus.sign)} in your connections today.`;

    areas.push({
      area: 'love',
      title: 'Relationships & Connection',
      guidance: loveGuidance,
    });
  }

  // Work focus (Mars + Mercury)
  if (mars || mercury) {
    const workPlanet = mars || mercury;
    const workGuidance =
      natalMars && mars
        ? `Mars in ${mars.sign} energizes your natal Mars in ${natalMars.sign}, ${getMarsInteraction(mars.sign, natalMars.sign)}.`
        : `${workPlanet?.body} in ${workPlanet?.sign} supports ${getWorkFocus(workPlanet?.sign || 'Aries')} today.`;

    areas.push({
      area: 'work',
      title: 'Work & Action',
      guidance: workGuidance,
    });
  }

  // Inner world focus (Moon-based)
  if (currentMoon) {
    areas.push({
      area: 'inner',
      title: 'Inner World',
      guidance: `The Moon in ${currentMoon.sign} asks you to ${getInnerWorldFocus(currentMoon.sign)}.`,
    });
  }

  return areas;
};

const getVenusInteraction = (
  transitSign: string,
  natalSign: string,
): string => {
  if (transitSign === natalSign) {
    return 'amplifying your natural way of giving and receiving love';
  }
  return 'inviting you to explore new dimensions of connection';
};

const getVenusThemeShort = (sign: string): string => {
  const themes: Record<string, string> = {
    Aries: 'bold declarations and spontaneous affection',
    Taurus: 'sensual presence and steady devotion',
    Gemini: 'playful conversation and curious connection',
    Cancer: 'nurturing gestures and emotional safety',
    Leo: 'generous appreciation and heartfelt recognition',
    Virgo: 'thoughtful acts of service and practical care',
    Libra: 'harmonious partnership and aesthetic beauty',
    Scorpio: 'depth, intensity, and transformative bonding',
    Sagittarius: 'adventurous connection and philosophical sharing',
    Capricorn: 'commitment, loyalty, and building together',
    Aquarius: 'friendship-based love and unconventional connection',
    Pisces: 'spiritual union and compassionate tenderness',
  };
  return themes[sign] || 'heart-centered connection';
};

const getMarsInteraction = (transitSign: string, natalSign: string): string => {
  if (transitSign === natalSign) {
    return 'giving you extra drive and confidence in your actions';
  }
  return 'channeling your energy in a different but productive direction';
};

const getWorkFocus = (sign: string): string => {
  const focuses: Record<string, string> = {
    Aries: 'initiating bold moves and leading with confidence',
    Taurus: 'steady progress and building lasting results',
    Gemini: 'multitasking, networking, and sharing ideas',
    Cancer: 'nurturing projects and caring for your team',
    Leo: 'creative leadership and visible accomplishment',
    Virgo: 'detailed work, organization, and refinement',
    Libra: 'collaboration, diplomacy, and fair dealing',
    Scorpio: 'strategic depth and transformative projects',
    Sagittarius: 'big-picture thinking and expansive goals',
    Capricorn: 'disciplined execution and long-term planning',
    Aquarius: 'innovation, technology, and unconventional solutions',
    Pisces: 'intuitive work, creativity, and compassionate service',
  };
  return focuses[sign] || 'focused effort';
};

const getInnerWorldFocus = (moonSign: string): string => {
  const focuses: Record<string, string> = {
    Aries: 'honor your need for independence and trust your impulses',
    Taurus: 'slow down, ground yourself, and savor simple pleasures',
    Gemini: 'let your mind wander freely and follow your curiosity',
    Cancer: 'tend to your emotional needs and seek comfort',
    Leo: 'celebrate yourself and let your heart lead',
    Virgo: 'find peace in useful activity and gentle self-improvement',
    Libra: 'seek balance and beauty in your inner landscape',
    Scorpio: 'go deep, process what is hidden, and trust transformation',
    Sagittarius: 'expand your perspective and find meaning',
    Capricorn: 'honor your ambitions and set quiet intentions',
    Aquarius: 'embrace your uniqueness and envision the future',
    Pisces: 'dream, rest, and connect with your spiritual nature',
  };
  return focuses[moonSign] || 'tend to your inner world with care';
};

// Generate tiny action - one sentence anchor for the day
const generateTinyAction = (
  currentChart: AstroChartInformation[],
  birthChart: any,
  moonPhase: string,
  today: dayjs.Dayjs,
): string => {
  const currentMoon = currentChart.find((p) => p.body === 'Moon');
  const natalSun = birthChart?.find((p: any) => p.body === 'Sun');

  // Phase-based anchors
  const phaseAnchors: Record<string, string[]> = {
    'New Moon': [
      'Write down one intention you want to grow.',
      'Spend five minutes in stillness.',
      'Plant a seed—literal or metaphorical.',
    ],
    'Full Moon': [
      'Name one thing you are ready to release.',
      'Celebrate a recent accomplishment, however small.',
      'Share gratitude with someone who matters.',
    ],
    'Waxing Crescent': [
      'Take one small step toward a recent goal.',
      'Nurture something you have started.',
    ],
    'First Quarter': [
      'Face one small challenge you have been avoiding.',
      'Make a decision you have been postponing.',
    ],
    'Waxing Gibbous': [
      'Refine one detail in an ongoing project.',
      'Ask yourself: what needs adjusting?',
    ],
    'Waning Gibbous': [
      'Share a piece of wisdom with someone who needs it.',
      'Practice gratitude for lessons learned.',
    ],
    'Last Quarter': [
      'Let go of one expectation that no longer serves you.',
      'Clear one small space in your life.',
    ],
    'Waning Crescent': [
      'Give yourself permission to rest.',
      'Spend time in reflection without agenda.',
    ],
  };

  const anchors = phaseAnchors[moonPhase] || [
    'Move through the day with presence.',
  ];
  const dayIndex = today.dayOfYear() % anchors.length;

  // Add sign-specific flavor if we have natal data
  if (natalSun && currentMoon) {
    return `Today's anchor: ${anchors[dayIndex]} Your ${natalSun.sign} spirit knows how.`;
  }

  return `Today's anchor: ${anchors[dayIndex]}`;
};

export const getEnhancedPersonalizedHoroscope = (
  userBirthday?: string,
  userName?: string,
  profile?: any,
  selectedDate?: Date,
): EnhancedHoroscopeReading => {
  const today = selectedDate ? dayjs(selectedDate) : dayjs();
  const birthDate = userBirthday ? dayjs(userBirthday) : null;

  // Default observer
  const observer = new Observer(51.4769, 0.0005, 0);

  // Get current astrological chart
  const currentChart = getAstrologicalChart(today.toDate(), observer);

  // Get birth chart from profile
  const birthChart = getBirthChartFromProfile(profile);

  // Determine sun sign
  const sunSign = birthDate
    ? getSunSign(birthDate.month() + 1, birthDate.date())
    : 'Unknown';

  // Get detailed moon phase
  const moonPhase = getDetailedMoonPhase(today.toDate());

  // Generate enhanced content
  const dailyGuidance = generateEnhancedDailyGuidance(
    currentChart,
    birthChart,
    userName,
    today,
  );
  const personalInsight = generateEnhancedPersonalInsight(
    birthChart,
    currentChart,
    userName,
    today,
  );
  const luckyElements = generateEnhancedLuckyElements(
    sunSign,
    moonPhase,
    today,
    birthChart,
  );
  const cosmicHighlight = generateCosmicHighlight(currentChart, today);
  const dailyAffirmation = generateDailyAffirmation(sunSign, today);

  // Generate new structured fields
  const headline = generateHeadline(currentChart, birthChart, moonPhase, today);
  const overview = generateOverview(
    currentChart,
    birthChart,
    moonPhase,
    userName,
    today,
  );
  const focusAreas = generateFocusAreas(currentChart, birthChart, today);
  const tinyAction = generateTinyAction(
    currentChart,
    birthChart,
    moonPhase,
    today,
  );

  return {
    sunSign,
    moonPhase,
    // New structured fields
    headline,
    overview,
    focusAreas,
    tinyAction,
    // Legacy fields
    dailyGuidance,
    personalInsight,
    luckyElements,
    cosmicHighlight,
    dailyAffirmation,
  };
};

const getSunSign = (month: number, day: number): string => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return 'Aquarius';
  return 'Pisces';
};
