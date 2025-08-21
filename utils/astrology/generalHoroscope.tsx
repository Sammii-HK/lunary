import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { getAstrologicalChart } from './astrology';
import { Observer } from 'astronomy-engine';
import { getMoonPhase } from '../../utils/moon/moonPhases';

dayjs.extend(dayOfYear);

export type GeneralHoroscopeReading = {
  date: string;
  moonPhase: string;
  reading: string;
  generalAdvice: string;
};

const getComprehensiveReading = (currentChart: any[], moonPhase: string, dayOfWeek: string): string => {
  const sun = currentChart.find((p) => p.body === 'Sun');
  const moon = currentChart.find((p) => p.body === 'Moon');
  const mercury = currentChart.find((p) => p.body === 'Mercury');
  const venus = currentChart.find((p) => p.body === 'Venus');
  const mars = currentChart.find((p) => p.body === 'Mars');
  const jupiter = currentChart.find((p) => p.body === 'Jupiter');
  const saturn = currentChart.find((p) => p.body === 'Saturn');

  const readingParts = [];

  // Sun and Moon influence
  if (sun && moon) {
    readingParts.push(
      `The Sun in ${sun.sign} illuminates themes of ${getSunInfluence(sun.sign)}, while the Moon in ${moon.sign} brings emotional energy around ${getMoonInfluence(moon.sign)}.`
    );
  }

  // Moon phase integration
  const phaseGuidance = getMoonPhaseGuidance(moonPhase);
  if (phaseGuidance) {
    readingParts.push(phaseGuidance + '.');
  }

  // Mercury influence
  if (mercury) {
    if (mercury.retrograde) {
      readingParts.push(
        `Mercury retrograde in ${mercury.sign} encourages reflection and review in communication and thinking, offering an opportunity to revisit and refine your approach.`
      );
    } else {
      readingParts.push(
        `Mercury in ${mercury.sign} enhances ${getMercuryInfluence(mercury.sign)}, supporting clear expression and mental clarity.`
      );
    }
  }

  // Venus and Mars
  if (venus && mars) {
    readingParts.push(
      `Venus in ${venus.sign} influences relationships and values with ${venus.retrograde ? 'introspective and reviewing' : 'harmonious and attractive'} energy, while Mars in ${mars.sign} brings ${mars.retrograde ? 'reflective and cautious' : 'dynamic and motivated'} energy to your actions and desires.`
    );
  }

  // Jupiter and Saturn
  if (jupiter) {
    readingParts.push(
      `Jupiter in ${jupiter.sign} expands opportunities in areas related to ${getJupiterInfluence(jupiter.sign)}.`
    );
  }

  if (saturn) {
    readingParts.push(
      `Saturn in ${saturn.sign} ${saturn.retrograde ? 'retrograde ' : ''}brings lessons in ${getSaturnInfluence(saturn.sign)}, encouraging patience and responsibility.`
    );
  }

  // Day of week energy
  const dayGuidance = getDayGuidance(dayOfWeek);
  if (dayGuidance) {
    readingParts.push(dayGuidance);
  }

  // Cosmic highlight
  const highlight = getCosmicHighlight(currentChart);
  readingParts.push(highlight);

  return readingParts.join(' ');
};

const getDayGuidance = (dayOfWeek: string): string => {
  const dayGuidance: { [key: string]: string } = {
    Monday: 'Monday\'s Moon energy supports intuition and emotional reflection, making it ideal for inner work and setting intentions.',
    Tuesday: 'Tuesday\'s Mars energy encourages action and courage, perfect for tackling challenges and moving projects forward.',
    Wednesday: 'Wednesday\'s Mercury energy enhances communication and learning, favoring important conversations and new information.',
    Thursday: 'Thursday\'s Jupiter energy expands opportunities and wisdom, opening doors for growth and understanding.',
    Friday: 'Friday\'s Venus energy highlights love, beauty, and relationships, drawing focus to harmony and connection.',
    Saturday: 'Saturday\'s Saturn energy supports structure and discipline, excellent for organization and long-term planning.',
    Sunday: 'Sunday\'s Sun energy illuminates purpose and vitality, encouraging self-expression and creative pursuits.',
  };

  return dayGuidance[dayOfWeek] || '';
};

const getMoonPhaseGuidance = (moonPhase: string): string => {
  const phaseGuidance: { [key: string]: string } = {
    'New Moon': 'This is a time for setting intentions and planting seeds for the future. Focus on new beginnings and what you want to manifest',
    'Waxing Crescent': 'Energy is building and taking action on your intentions feels natural. Small steps lead to big changes',
    'First Quarter': 'A time of decision and action where challenges offer opportunities for growth and learning',
    'Waxing Gibbous': 'Refinement and adjustment are key as you fine-tune your approach and prepare for culmination',
    'Full Moon': 'Emotions and energy peak, making this a time of completion, celebration, and releasing what no longer serves',
    'Waning Gibbous': 'Gratitude and sharing wisdom flow naturally as you reflect on achievements and knowledge gained',
    'Third Quarter': 'Release and forgiveness become important as old patterns make way for new growth',
    'Waning Crescent': 'Rest and reflection prepare you for the next cycle through introspection and self-care',
  };
  
  return phaseGuidance[moonPhase] || '';
};

const getSunInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'leadership, new beginnings, and taking initiative',
    Taurus: 'stability, practical matters, and material security',
    Gemini: 'communication, learning, and social connections',
    Cancer: 'home, family, and emotional nurturing',
    Leo: 'creativity, self-expression, and recognition',
    Virgo: 'organization, health, and attention to detail',
    Libra: 'relationships, balance, and harmony',
    Scorpio: 'transformation, depth, and hidden truths',
    Sagittarius: 'expansion, adventure, and higher learning',
    Capricorn: 'achievement, structure, and long-term goals',
    Aquarius: 'innovation, friendship, and humanitarian ideals',
    Pisces: 'intuition, spirituality, and compassion',
  };
  return influences[sign] || 'personal growth and self-discovery';
};

const getMoonInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'bold action and emotional courage',
    Taurus: 'comfort, stability, and sensual pleasures',
    Gemini: 'curiosity, communication, and mental stimulation',
    Cancer: 'nurturing, intuition, and emotional depth',
    Leo: 'creativity, drama, and heartfelt expression',
    Virgo: 'practical care, health, and helpful service',
    Libra: 'partnership, beauty, and social harmony',
    Scorpio: 'intensity, transformation, and emotional truth',
    Sagittarius: 'freedom, optimism, and philosophical insights',
    Capricorn: 'discipline, responsibility, and emotional structure',
    Aquarius: 'independence, originality, and collective consciousness',
    Pisces: 'empathy, dreams, and spiritual connection',
  };
  return influences[sign] || 'emotional balance and inner wisdom';
};

const getMercuryInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'quick thinking and direct communication',
    Taurus: 'practical reasoning and steady communication',
    Gemini: 'versatile thinking and lively conversation',
    Cancer: 'intuitive communication and emotional intelligence',
    Leo: 'confident expression and creative thinking',
    Virgo: 'analytical thinking and precise communication',
    Libra: 'diplomatic communication and balanced thinking',
    Scorpio: 'deep investigation and transformative insights',
    Sagittarius: 'philosophical thinking and inspiring communication',
    Capricorn: 'strategic thinking and authoritative communication',
    Aquarius: 'innovative ideas and progressive communication',
    Pisces: 'intuitive insights and compassionate communication',
  };
  return influences[sign] || 'clear thinking and meaningful communication';
};

const getGeneralGuidance = (moonPhase: string, dayOfWeek: string): string => {
  const dayGuidance: { [key: string]: string } = {
    Monday: 'Moon day energy supports intuition and emotional reflection, making it ideal for inner work and setting intentions.',
    Tuesday: 'Mars energy encourages action and courage, perfect for tackling challenges and moving projects forward.',
    Wednesday: 'Mercury energy enhances communication and learning, favoring important conversations and new information.',
    Thursday: 'Jupiter energy expands opportunities and wisdom, opening doors for growth and understanding.',
    Friday: 'Venus energy highlights love, beauty, and relationships, drawing focus to harmony and connection.',
    Saturday: 'Saturn energy supports structure and discipline, excellent for organization and long-term planning.',
    Sunday: 'Sun energy illuminates purpose and vitality, encouraging self-expression and creative pursuits.',
  };

  return dayGuidance[dayOfWeek] || 'Trust your intuition and stay present to the cosmic energies surrounding you.';
};

const getEnergyForecast = (currentChart: any[]): string => {
  const aspects = [];
  const mars = currentChart.find((p) => p.body === 'Mars');
  const venus = currentChart.find((p) => p.body === 'Venus');
  const jupiter = currentChart.find((p) => p.body === 'Jupiter');

  if (mars) {
    aspects.push(
      `Mars in ${mars.sign} brings ${mars.retrograde ? 'reflective and cautious' : 'dynamic and motivated'} energy to action and personal drive`,
    );
  }

  if (venus) {
    aspects.push(
      `Venus in ${venus.sign} influences relationships and values with ${venus.retrograde ? 'introspective and reviewing' : 'harmonious and attractive'} energy`,
    );
  }

  if (jupiter) {
    aspects.push(
      `Jupiter in ${jupiter.sign} expands opportunities in areas related to ${getJupiterInfluence(jupiter.sign)}`,
    );
  }

  return aspects.slice(0, 2).join('. ') + '.';
};

// New function for expanded planetary insights
const getPlanetaryInsights = (currentChart: any[]): string => {
  const insights = [];
  const saturn = currentChart.find((p) => p.body === 'Saturn');
  const uranus = currentChart.find((p) => p.body === 'Uranus');
  const neptune = currentChart.find((p) => p.body === 'Neptune');
  const pluto = currentChart.find((p) => p.body === 'Pluto');

  if (saturn) {
    insights.push(
      `Saturn in ${saturn.sign} ${saturn.retrograde ? 'retrograde ' : ''}brings lessons in ${getSaturnInfluence(saturn.sign)}, encouraging patience and responsibility`
    );
  }

  if (uranus) {
    insights.push(
      `Uranus in ${uranus.sign} sparks innovation and change in areas of ${getUranusInfluence(uranus.sign)}`
    );
  }

  if (neptune) {
    insights.push(
      `Neptune in ${neptune.sign} dissolves boundaries around ${getNeptuneInfluence(neptune.sign)}, inviting spiritual awareness`
    );
  }

  if (pluto) {
    insights.push(
      `Pluto in ${pluto.sign} transforms deep structures related to ${getPlutoInfluence(pluto.sign)}`
    );
  }

  return insights.slice(0, 2).join('. ') + '.';
};

const getSaturnInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'leadership and personal initiative',
    Taurus: 'material security and practical foundations',
    Gemini: 'communication and learning structures',
    Cancer: 'emotional security and family traditions',
    Leo: 'creative expression and authentic leadership',
    Virgo: 'health, work, and daily routines',
    Libra: 'relationships and social justice',
    Scorpio: 'transformation and emotional depth',
    Sagittarius: 'beliefs, education, and philosophical frameworks',
    Capricorn: 'career achievement and social status',
    Aquarius: 'innovation and humanitarian ideals',
    Pisces: 'spirituality and compassionate service',
  };
  return influences[sign] || 'discipline and long-term structure';
};

const getUranusInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'personal independence and pioneering spirit',
    Taurus: 'material values and earth-conscious innovation',
    Gemini: 'communication technology and mental liberation',
    Cancer: 'family structures and emotional freedom',
    Leo: 'creative expression and individual uniqueness',
    Virgo: 'work methods and health innovations',
    Libra: 'relationship patterns and social justice',
    Scorpio: 'power structures and transformational healing',
    Sagittarius: 'belief systems and educational reform',
    Capricorn: 'authority structures and institutional change',
    Aquarius: 'collective consciousness and technological advancement',
    Pisces: 'spiritual awakening and artistic inspiration',
  };
  return influences[sign] || 'progressive change and freedom';
};

const getNeptuneInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'spiritual leadership and intuitive action',
    Taurus: 'material attachment and earth spirituality',
    Gemini: 'communication and mental clarity',
    Cancer: 'emotional boundaries and family mysticism',
    Leo: 'creative inspiration and heart-centered expression',
    Virgo: 'service and practical spirituality',
    Libra: 'relationship ideals and artistic beauty',
    Scorpio: 'hidden truths and mystical transformation',
    Sagittarius: 'spiritual seeking and higher knowledge',
    Capricorn: 'material illusions and spiritual authority',
    Aquarius: 'collective dreams and humanitarian vision',
    Pisces: 'universal compassion and divine connection',
  };
  return influences[sign] || 'spiritual awareness and intuition';
};

const getPlutoInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'personal power and individual transformation',
    Taurus: 'material values and resource transformation',
    Gemini: 'communication power and mental transformation',
    Cancer: 'emotional depth and family transformation',
    Leo: 'creative power and self-expression transformation',
    Virgo: 'work and health transformation',
    Libra: 'relationship power and social transformation',
    Scorpio: 'deep psychological and spiritual transformation',
    Sagittarius: 'belief systems and educational transformation',
    Capricorn: 'power structures and institutional transformation',
    Aquarius: 'collective consciousness and technological transformation',
    Pisces: 'spiritual evolution and universal consciousness',
  };
  return influences[sign] || 'deep transformation and renewal';
};

const getJupiterInfluence = (sign: string): string => {
  const influences: { [key: string]: string } = {
    Aries: 'leadership and pioneering ventures',
    Taurus: 'financial growth and material abundance',
    Gemini: 'learning, communication, and short-distance travel',
    Cancer: 'home, family, and emotional security',
    Leo: 'creativity, entertainment, and self-expression',
    Virgo: 'health, work, and service to others',
    Libra: 'partnerships, justice, and artistic pursuits',
    Scorpio: 'transformation, research, and shared resources',
    Sagittarius: 'higher education, philosophy, and long-distance travel',
    Capricorn: 'career advancement and public recognition',
    Aquarius: 'innovation, friendship, and humanitarian causes',
    Pisces: 'spirituality, compassion, and artistic inspiration',
  };
  return influences[sign] || 'personal growth and expansion';
};

const getCosmicHighlight = (currentChart: any[]): string => {
  const highlights = [
    'The cosmic energies invite you to embrace both stability and change, finding wisdom in the dance between security and growth.',
    'Planetary alignments support growth through authentic self-expression, encouraging you to share your unique gifts with the world.',
    'The universe encourages balance between action and reflection, showing that both movement and stillness have their place.',
    'Cosmic influences favor connections that inspire and uplift, drawing meaningful relationships into your experience.',
    'Stellar energies support manifestation through aligned intention, helping you create reality from authentic desire.',
    'The celestial dance reminds you of your place in the greater cosmic story, connecting you to something larger than yourself.',
    'Planetary wisdom flows through mindful awareness and presence, revealing insights in each moment of conscious attention.',
    'Universal energies support healing through self-compassion and understanding, encouraging gentle transformation.',
  ];

  // Use a simple hash of the chart to get consistent but varied highlights
  const chartHash = currentChart.reduce(
    (acc, planet) => acc + planet.eclipticLongitude,
    0,
  );
  const index = Math.floor(chartHash % highlights.length);

  return highlights[index];
};

export const getGeneralHoroscope = (): GeneralHoroscopeReading => {
  const today = dayjs();
  const observer = new Observer(51.4769, 0.0005, 0); // Default location
  const currentChart = getAstrologicalChart(today.toDate(), observer);
  const moonPhase = getMoonPhase(today.toDate());
  const dayOfWeek = today.format('dddd');

  return {
    date: today.format('MMMM D, YYYY'),
    moonPhase,
    reading: getComprehensiveReading(currentChart, moonPhase, dayOfWeek),
    generalAdvice:
      'Remember that you are part of the cosmic dance. Trust your intuition, stay present, and allow the universe to guide you toward your highest good.',
  };
};
