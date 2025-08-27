import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Server-side zodiac calculation
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const index = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return signs[index];
}

// Approximate planetary positions (for display purposes)
function getApproximatePlanetaryData(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Starting positions for 2024-2025 (approximate)
  const year = date.getFullYear();
  const baseYear = 2024;
  const yearOffset = year - baseYear;
  
  // Simple approximations for display (not astronomically precise)
  return {
    sun: {
      longitude: (dayOfYear * 0.986) % 360, // ~1° per day
      sign: getZodiacSign((dayOfYear * 0.986) % 360)
    },
    moon: {
      longitude: (dayOfYear * 13.176) % 360, // ~13° per day
      sign: getZodiacSign((dayOfYear * 13.176) % 360)
    },
    mercury: {
      longitude: (45 + dayOfYear * 1.4 + yearOffset * 360) % 360, // Fast orbit
      sign: getZodiacSign((45 + dayOfYear * 1.4 + yearOffset * 360) % 360)
    },
    venus: {
      longitude: (120 + dayOfYear * 0.7 + yearOffset * 225) % 360, // ~225° per year
      sign: getZodiacSign((120 + dayOfYear * 0.7 + yearOffset * 225) % 360)
    },
    mars: {
      longitude: (210 + dayOfYear * 0.5 + yearOffset * 190) % 360, // ~190° per year
      sign: getZodiacSign((210 + dayOfYear * 0.5 + yearOffset * 190) % 360)
    },
    jupiter: {
      longitude: (45 + dayOfYear * 0.08 + yearOffset * 30) % 360, // ~30° per year
      sign: getZodiacSign((45 + dayOfYear * 0.08 + yearOffset * 30) % 360)
    },
    saturn: {
      longitude: (330 + dayOfYear * 0.033 + yearOffset * 12) % 360, // ~12° per year
      sign: getZodiacSign((330 + dayOfYear * 0.033 + yearOffset * 12) % 360)
    },
    uranus: {
      longitude: (60 + dayOfYear * 0.012 + yearOffset * 4.3) % 360, // ~4.3° per year
      sign: getZodiacSign((60 + dayOfYear * 0.012 + yearOffset * 4.3) % 360)
    },
    neptune: {
      longitude: (350 + dayOfYear * 0.006 + yearOffset * 2.2) % 360, // ~2.2° per year
      sign: getZodiacSign((350 + dayOfYear * 0.006 + yearOffset * 2.2) % 360)
    }
  };
}

// Generate informative descriptions for each event type
function getEventDescription(eventType: string, planetData: any): string {
  const eventDescriptions = {
    'Venus Rising': `Venus in ${planetData.venus.sign} brings heightened sensitivity to beauty, relationships, and creative expression. This is an ideal time for romantic connections, artistic endeavors, and cultivating harmony in your personal relationships.`,
    
    'Mars Power': `Mars in ${planetData.mars.sign} activates your drive and determination. This fiery energy supports bold initiatives, physical activities, and asserting your will. Channel this dynamic force toward your most important goals.`,
    
    'Jupiter Expansion': `Jupiter in ${planetData.jupiter.sign} opens doors to growth, learning, and new opportunities. This expansive energy favors education, travel, spiritual development, and broadening your horizons in meaningful ways.`,
    
    'Mercury Clarity': `Mercury in ${planetData.mercury.sign} sharpens mental faculties and communication abilities. This is perfect timing for important conversations, writing, learning new skills, and making clear-minded decisions.`,
    
    'Saturn Focus': `Saturn's disciplined energy helps you build lasting structures and achieve long-term goals. This is a time for commitment, responsibility, and turning your dreams into concrete reality through steady effort.`,
    
    'Neptune Dreams': `Neptune's mystical influence heightens intuition, creativity, and spiritual awareness. Trust your inner wisdom, pay attention to dreams and synchronicities, and explore your connection to the divine.`,
    
    'Uranus Innovation': `Uranus in ${planetData.uranus.sign} brings revolutionary energy and sudden insights that can transform your perspective. This innovative planet encourages you to break free from limiting patterns and embrace unexpected opportunities for growth and change.`,
    
    'Cosmic Flow': `Universal energies create perfect alignment between your intentions and manifestation. This harmonious time supports effortless progress and natural synchronicity in all areas of life.`,
    
    'New Moon': `The New Moon in ${planetData.moon.sign} marks a powerful time for setting intentions and planting seeds for future growth. Focus your energy on new beginnings and manifestation work while the lunar energy supports fresh starts.`,
    
    'Full Moon': `The Full Moon in ${planetData.moon.sign} brings peak energy and culmination. This is a time of completion, release, and celebrating the fruition of your efforts. Emotional clarity and revelation are heightened under this illuminating lunar light.`,
    
    'First Quarter': `The First Quarter Moon in ${planetData.moon.sign} presents a moment of decision and action. Overcome obstacles with determination and make the choices that will propel your goals forward with focused lunar energy.`,
    
    'Third Quarter': `The Third Quarter Moon in ${planetData.moon.sign} calls for release and letting go. This powerful lunar phase supports breaking free from what no longer serves you and making space for new growth and opportunities.`,
    
    'Waxing Crescent (Day 1)': `The early Waxing Crescent Moon in ${planetData.moon.sign} supports building momentum on your new intentions. Take the first inspired actions and nurture the seeds you planted during the New Moon with gentle, consistent effort.`,
    
    'Waxing Crescent (Day 2)': `The growing Waxing Crescent Moon in ${planetData.moon.sign} encourages continued progress on your goals. This is a time for taking small but meaningful steps forward while staying connected to your original intentions.`,
    
    'Waxing Crescent (Day 3)': `The strengthening Waxing Crescent Moon in ${planetData.moon.sign} builds energy for manifestation. Focus on actions that align with your intentions and trust in the gradual unfolding of your plans.`,
    
    'Waxing Crescent (Day 4)': `The maturing Waxing Crescent Moon in ${planetData.moon.sign} provides steady energy for growth. Continue nurturing your projects with patience and persistence as lunar energy supports gradual development.`,
    
    'Waxing Crescent (Day 5)': `The advancing Waxing Crescent Moon in ${planetData.moon.sign} calls for sustained effort toward your goals. This phase supports building foundations and establishing routines that will serve your long-term vision.`,
    
    'Waxing Crescent (Day 6)': `The late Waxing Crescent Moon in ${planetData.moon.sign} prepares for the upcoming First Quarter energy. Use this time to refine your approach and prepare for the decisions and actions that lie ahead.`,
    
    'Waxing Crescent (Day 7)': `The final Waxing Crescent Moon in ${planetData.moon.sign} builds toward decision-making energy. Prepare to take more decisive action as the moon approaches its First Quarter phase of determined progress.`,
    
    'Waxing Gibbous (Day 1)': `The early Waxing Gibbous Moon in ${planetData.moon.sign} calls for refinement and adjustment. Fine-tune your approach and prepare for the culmination that the approaching Full Moon will bring.`,
    
    'Waxing Gibbous (Day 2)': `The building Waxing Gibbous Moon in ${planetData.moon.sign} supports perfecting your methods and making necessary adjustments. This phase encourages attention to detail as energy builds toward completion.`,
    
    'Waxing Gibbous (Day 3)': `The intensifying Waxing Gibbous Moon in ${planetData.moon.sign} brings focused energy for final preparations. Polish your projects and align your efforts with the powerful culmination energy approaching.`,
    
    'Waxing Gibbous (Day 4)': `The late Waxing Gibbous Moon in ${planetData.moon.sign} prepares for peak manifestation energy. Trust in your progress and prepare to celebrate the fruition of your dedicated efforts.`,
    
    'Waxing Gibbous (Day 5)': `The final Waxing Gibbous Moon in ${planetData.moon.sign} builds anticipation for the Full Moon culmination. Complete final details and prepare to witness the full flowering of your intentions.`,
    
    'Waning Gibbous (Day 1)': `The early Waning Gibbous Moon in ${planetData.moon.sign} brings gratitude and wisdom from recent culminations. This is a time for appreciating achievements and integrating the lessons learned from your Full Moon experiences.`,
    
    'Waning Gibbous (Day 2)': `The reflective Waning Gibbous Moon in ${planetData.moon.sign} encourages sharing wisdom and celebrating what has been accomplished. This phase supports teaching others and expressing gratitude for your journey.`,
    
    'Waning Gibbous (Day 3)': `The generous Waning Gibbous Moon in ${planetData.moon.sign} calls for giving back and sharing your abundance. This is an ideal time for mentoring, charitable acts, and spreading the wisdom you've gained.`,
    
    'Waning Gibbous (Day 4)': `The wise Waning Gibbous Moon in ${planetData.moon.sign} supports deep reflection and integration of recent experiences. Use this time for journaling, meditation, and processing the insights from your recent achievements.`,
    
    'Waning Gibbous (Day 5)': `The transitioning Waning Gibbous Moon in ${planetData.moon.sign} prepares for the release energy of the Third Quarter. Begin identifying what needs to be released to make space for your next cycle of growth.`,
    
    'Waning Gibbous (Day 6)': `The late Waning Gibbous Moon in ${planetData.moon.sign} encourages letting go of what has served its purpose. Prepare for the decisive release energy of the approaching Third Quarter Moon.`,
    
    'Waning Crescent (Day 1)': `The early Waning Crescent Moon in ${planetData.moon.sign} begins the final phase of rest and reflection. This is a time for deep introspection and preparing for the new cycle that approaches with the coming New Moon.`,
    
    'Waning Crescent (Day 2)': `The quiet Waning Crescent Moon in ${planetData.moon.sign} calls for solitude and inner contemplation. Use this peaceful energy for meditation, dream work, and connecting with your inner wisdom.`,
    
    'Waning Crescent (Day 3)': `The gentle Waning Crescent Moon in ${planetData.moon.sign} supports spiritual practices and intuitive development. This is an ideal time for energy healing, divination, and deep spiritual connection.`,
    
    'Waning Crescent (Day 4)': `The fading Waning Crescent Moon in ${planetData.moon.sign} encourages complete surrender and trust in the cosmic cycle. Release any remaining attachments and prepare for the fresh start of the approaching New Moon.`,
    
    'Waning Crescent (Day 5)': `The final Waning Crescent Moon in ${planetData.moon.sign} completes the lunar cycle with wisdom and peace. This is the perfect time for forgiveness, final releases, and setting intentions for your upcoming new beginning.`,
    
    'Spring Equinox': `The Spring Equinox marks perfect balance between light and dark, heralding new growth and fresh beginnings. This potent time of equilibrium supports planting seeds for future manifestations and embracing renewal in all areas of life.`,
    
    'Summer Solstice': `The Summer Solstice brings maximum solar power and the year's longest day. This peak solar energy amplifies manifestation abilities, creativity, and personal power. It's the perfect time to celebrate achievements and embrace your full potential.`,
    
    'Autumn Equinox': `The Autumn Equinox brings balance and harvest energy as day and night reach equilibrium. This is a time for gratitude, reflection on growth, and preparing for the introspective months ahead through wisdom and grounding.`,
    
    'Winter Solstice': `The Winter Solstice marks the return of light after the year's longest night. This sacred turning point celebrates inner illumination, spiritual renewal, and the promise of new cycles beginning through contemplation and hope.`,
    
    'Perseid Meteors': `The Perseid meteor shower brings swift cosmic inspiration as Earth passes through Comet Swift-Tuttle's debris trail. These brilliant shooting stars ignite intuition, spark creativity, and remind us of our connection to the greater cosmos.`,
    
    'Geminid Meteors': `The Geminid meteor shower offers the year's most spectacular celestial light show, with up to 120 meteors per hour. These brilliant fragments inspire communication, mental agility, and profound insights into life's dualities.`,
    
    'Leonid Meteors': `The Leonid meteors streak across the sky with leonine courage and transformative power. These swift celestial messengers inspire bold action, leadership qualities, and the courage to roar your truth into the universe.`
  };
  
  return eventDescriptions[eventType as keyof typeof eventDescriptions] || 
    'The cosmic energies support your spiritual growth and conscious evolution today.';
}

// Check for major astronomical events
function getSignificantAstronomicalEvents(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const events = [];
  
  // SEASONAL MARKERS - Equinoxes & Solstices (Priority 10) - 1 day each
  if (month === 3 && day === 20) {
    events.push({ name: 'Spring Equinox', emoji: '🌸', energy: 'Balance & New Growth', description: 'Day and night in perfect balance', detail: 'Solar longitude 0° - Spring begins', priority: 10 });
  }
  if (month === 6 && day === 21) {
    events.push({ name: 'Summer Solstice', emoji: '☀️', energy: 'Maximum Solar Power', description: 'Longest day of the year', detail: 'Solar longitude 90° - Peak solar energy', priority: 10 });
  }
  if (month === 9 && day === 23) {
    events.push({ name: 'Autumn Equinox', emoji: '🍂', energy: 'Harvest & Reflection', description: 'Day and night in perfect balance', detail: 'Solar longitude 180° - Autumn begins', priority: 10 });
  }
  if (month === 12 && day === 21) {
    events.push({ name: 'Winter Solstice', emoji: '❄️', energy: 'Inner Light & Renewal', description: 'Longest night of the year', detail: 'Solar longitude 270° - Return of the light', priority: 10 });
  }

  // CROSS-QUARTER DAYS (Priority 9) - 1 day each
  if (month === 2 && day === 4) {
    events.push({ name: 'Imbolc Cross-Quarter', emoji: '🕯️', energy: 'Midwinter Light', description: 'First stirring of spring', detail: 'Midpoint between Winter Solstice and Spring Equinox', priority: 9 });
  }
  if (month === 5 && day === 6) {
    events.push({ name: 'Beltane Cross-Quarter', emoji: '🌸', energy: 'Spring Peak', description: 'Peak fertility season', detail: 'Midpoint between Spring Equinox and Summer Solstice', priority: 9 });
  }
  if (month === 8 && day === 7) {
    events.push({ name: 'Lughnasadh Cross-Quarter', emoji: '🌾', energy: 'Summer Harvest', description: 'First harvest celebration', detail: 'Midpoint between Summer Solstice and Autumn Equinox', priority: 9 });
  }
  if (month === 10 && day === 31) {
    events.push({ name: 'Samhain Cross-Quarter', emoji: '🍂', energy: 'Veil Thinning', description: 'Boundary between worlds', detail: 'Midpoint between Autumn Equinox and Winter Solstice', priority: 9 });
  }
  
  return events;
}

// Enhanced astrological aspects with glyphs - ALL 7 MAJOR ASPECTS
function generateMainAstronomicalEvent(date: Date, planets: any): any {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // ALL 7 MAJOR ASTROLOGICAL ASPECTS with proper glyphs and meanings
  const aspects = [
    // GREAT CONJUNCTIONS - rarest and most powerful (priority 10)
    {
      name: 'Jupiter-Saturn Great Conjunction',
      emoji: '♃☌♄',
      glyph: '☌',
      energy: 'Era-Defining Alignment',
      description: 'The rarest of celestial meetings - reshaping society',
      detail: 'Once every 20 years - new era begins',
      priority: 10,
      aspect: 'great-conjunction'
    },
    {
      name: 'Jupiter-Uranus Great Conjunction',
      emoji: '♃☌⛢',
      glyph: '☌',
      energy: 'Revolutionary Expansion',
      description: 'Innovation meets abundance in rare alignment',
      detail: 'Breakthrough discoveries and social progress',
      priority: 10,
      aspect: 'great-conjunction'
    },
    
    // REGULAR CONJUNCTIONS - harmonious unity (priority 8)
    {
      name: 'Mercury-Venus conjunction',
      emoji: '☿♀',
      glyph: '☌',
      energy: 'Mind & Heart Unite',
      description: 'Communication flows with love and harmony',
      detail: 'Perfect alignment for creative expression',
      priority: 8,
      aspect: 'conjunction'
    },
    {
      name: 'Sun-Mercury conjunction',
      emoji: '☉☿',
      glyph: '☌',
      energy: 'Clarity & Expression',
      description: 'Identity and mind work in perfect harmony',
      detail: 'Brilliant communication and self-expression',
      priority: 8,
      aspect: 'conjunction'
    },
    {
      name: 'Venus-Mars conjunction',
      emoji: '♀♂',
      glyph: '☌',
      energy: 'Love & Passion Unite',
      description: 'Feminine and masculine energies merge powerfully',
      detail: 'Perfect balance of love and desire',
      priority: 8,
      aspect: 'conjunction'
    },
    
    // TRINES - harmonious flow (priority 7)
    {
      name: 'Mars-Jupiter trine',
      emoji: '♂♃',
      glyph: '△',
      energy: 'Action & Growth Flow',
      description: 'Warrior energy flows harmoniously with expansion',
      detail: 'Effortless achievement and growth',
      priority: 7,
      aspect: 'trine'
    },
    {
      name: 'Venus-Neptune trine',
      emoji: '♀♆',
      glyph: '△',
      energy: 'Love & Dreams Flow',
      description: 'Beauty meets spiritual vision in harmony',
      detail: 'Artistic inspiration and romance',
      priority: 7,
      aspect: 'trine'
    },
    {
      name: 'Sun-Jupiter trine',
      emoji: '☉♃',
      glyph: '△',
      energy: 'Confidence & Luck Flow',
      description: 'Self-expression supported by fortune',
      detail: 'Natural leadership and optimism',
      priority: 7,
      aspect: 'trine'
    },
    
    // SEXTILES - cooperative opportunity (priority 6)
    {
      name: 'Mercury-Mars sextile',
      emoji: '☿♂',
      glyph: '⚹',
      energy: 'Mind & Action Cooperate',
      description: 'Communication supports decisive action',
      detail: 'Perfect timing for important decisions',
      priority: 6,
      aspect: 'sextile'
    },
    {
      name: 'Venus-Jupiter sextile',
      emoji: '♀♃',
      glyph: '⚹',
      energy: 'Beauty & Abundance Cooperate',
      description: 'Love and prosperity work together',
      detail: 'Opportunities for joy and growth',
      priority: 6,
      aspect: 'sextile'
    },
    
    // SQUARES - dynamic tension (priority 5)
    {
      name: 'Mars-Saturn square',
      emoji: '♂♄',
      glyph: '□',
      energy: 'Drive vs Discipline',
      description: 'Action meets structure in creative tension',
      detail: 'Breakthrough through challenge',
      priority: 5,
      aspect: 'square'
    },
    {
      name: 'Mercury-Neptune square',
      emoji: '☿♆',
      glyph: '□',
      energy: 'Logic vs Intuition',
      description: 'Mind challenges dreams in productive tension',
      detail: 'Creative problem-solving emerges',
      priority: 5,
      aspect: 'square'
    },
    
    // OPPOSITIONS - balance and awareness (priority 5)
    {
      name: 'Jupiter-Saturn opposition',
      emoji: '♃♄',
      glyph: '☍',
      energy: 'Growth vs Structure',
      description: 'Expansion balances with discipline',
      detail: 'Finding balance between dreams and reality',
      priority: 5,
      aspect: 'opposition'
    },
    {
      name: 'Venus-Mars opposition',
      emoji: '♀♂',
      glyph: '☍',
      energy: 'Love vs Desire',
      description: 'Heart and passion seek perfect balance',
      detail: 'Relationship dynamics highlighted',
      priority: 5,
      aspect: 'opposition'
    },
    
    // QUINCUNX - adjustment and growth (priority 4)
    {
      name: 'Sun-Neptune quincunx',
      emoji: '☉♆',
      glyph: '⚼',
      energy: 'Identity Adjusts to Vision',
      description: 'Self adjusts to spiritual calling',
      detail: 'Personal growth through adaptation',
      priority: 4,
      aspect: 'quincunx'
    },
    
    // SEMI-SEXTILE - subtle opportunity (priority 3)
    {
      name: 'Mercury-Venus semi-sextile',
      emoji: '☿♀',
      glyph: '⚺',
      energy: 'Mind & Heart Subtly Connect',
      description: 'Gentle alignment of thought and feeling',
      detail: 'Quiet opportunities for harmony',
      priority: 3,
      aspect: 'semi-sextile'
    }
  ];
  
  // Select aspect based on day for variety, but prioritize higher aspects
  const sortedAspects = aspects.sort((a, b) => b.priority - a.priority);
  return sortedAspects[dayOfYear % sortedAspects.length];
}

export async function GET(request: NextRequest) {
  // Get date from query parameter or use current date
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let targetDate: Date;
  if (dateParam) {
    // Parse the YYYY-MM-DD date in GMT
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    // Use current date in GMT
    targetDate = new Date();
  }
  
  // Get approximate planetary data
  const planets = getApproximatePlanetaryData(targetDate);
  
  // Check for significant astronomical events first
  const astronomicalEvents = getSignificantAstronomicalEvents(targetDate);
  
  // Calculate moon phase (simplified version for reliability)
  const knownNewMoon = new Date('2024-08-04');
  const daysSinceNew = Math.floor((targetDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24));
  const lunarCycle = 29.530588853;
  const lunarDay = daysSinceNew % lunarCycle;

  let moonPhase;
  
  if (lunarDay < 1) {
    moonPhase = { name: 'New Moon', emoji: '🌑', energy: 'New Beginnings', description: 'Lunar reset cycle', detail: 'Moon invisible from Earth', priority: 1 }; // LOW priority
  } else if (lunarDay < 7.4) {
    const dayPhase = Math.floor(lunarDay) + 1;
    moonPhase = { name: `Waxing Crescent (Day ${dayPhase})`, emoji: '🌒', energy: 'Growing Energy', description: 'Building lunar energy', detail: `${Math.round((lunarDay / lunarCycle) * 100)}% illuminated`, priority: 1 };
  } else if (lunarDay < 9.2) {
    moonPhase = { name: 'First Quarter', emoji: '🌓', energy: 'Decision Making', description: 'Half moon rising', detail: '50% illuminated', priority: 1 }; // LOW priority
  } else if (lunarDay < 14.8) {
    const dayPhase = Math.floor(lunarDay - 9) + 1;
    moonPhase = { name: `Waxing Gibbous (Day ${dayPhase})`, emoji: '🌔', energy: 'Building Energy', description: 'Approaching fullness', detail: `${Math.round((lunarDay / lunarCycle) * 100)}% illuminated`, priority: 1 };
  } else if (lunarDay < 16.2) {
    moonPhase = { name: 'Full Moon', emoji: '🌕', energy: 'Peak Power', description: 'Maximum lunar energy', detail: '100% illuminated', priority: 1 }; // LOW priority
  } else if (lunarDay < 22) {
    const dayPhase = Math.floor(lunarDay - 16) + 1;
    moonPhase = { name: `Waning Gibbous (Day ${dayPhase})`, emoji: '🌖', energy: 'Gratitude & Wisdom', description: 'Releasing energy', detail: `${Math.round(((lunarCycle - lunarDay) / lunarCycle) * 100)}% illuminated`, priority: 1 };
  } else if (lunarDay < 24) {
    moonPhase = { name: 'Third Quarter', emoji: '🌗', energy: 'Release & Letting Go', description: 'Half moon setting', detail: '50% illuminated', priority: 1 }; // LOW priority
  } else {
    const dayPhase = Math.floor(lunarDay - 24) + 1;
    moonPhase = { name: `Waning Crescent (Day ${dayPhase})`, emoji: '🌘', energy: 'Rest & Reflection', description: 'Approaching new moon', detail: `${Math.round(((lunarCycle - lunarDay) / lunarCycle) * 100)}% illuminated`, priority: 1 };
  }

  // Determine primary event - SYNC WITH POST BUT PRIORITIZE MOON VISUALS FOR IMAGES
  let allEvents = [...astronomicalEvents];

  // Check for significant moon phases - if found, USE MOON FOR IMAGE (priority for visuals)
  let isMoonSignificant = false;
  if (lunarDay >= 0 && lunarDay < 0.5) {
    allEvents.push({ name: 'New Moon', emoji: '🌑', energy: 'New Beginnings', description: 'Lunar reset cycle', detail: 'Moon invisible from Earth', priority: 5 });
    isMoonSignificant = true;
  } else if (lunarDay >= 7.3 && lunarDay < 7.8) {
    allEvents.push({ name: 'First Quarter', emoji: '🌓', energy: 'Action & Decision', description: 'Half moon rising', detail: '50% illuminated', priority: 5 });
    isMoonSignificant = true;
  } else if (lunarDay >= 14.7 && lunarDay < 15.2) {
    // Use traditional full moon names based on month
    const month = targetDate.getMonth() + 1;
    let moonName = 'Full Moon';
    let moonEnergy = 'Peak Power';
    
    if (month === 1) {
      moonName = 'Wolf Moon';
      moonEnergy = 'Wild Instincts';
    } else if (month === 2) {
      moonName = 'Snow Moon';
      moonEnergy = 'Purification';
    } else if (month === 3) {
      moonName = 'Worm Moon';
      moonEnergy = 'Earth Awakening';
    } else if (month === 4) {
      moonName = 'Pink Moon';
      moonEnergy = 'Spring Bloom';
    } else if (month === 5) {
      moonName = 'Flower Moon';
      moonEnergy = 'Fertility & Growth';
    } else if (month === 6) {
      moonName = 'Strawberry Moon';
      moonEnergy = 'Summer Abundance';
    } else if (month === 7) {
      moonName = 'Buck Moon';
      moonEnergy = 'Wild Freedom';
    } else if (month === 8) {
      moonName = 'Sturgeon Moon';
      moonEnergy = 'Ancient Wisdom';
    } else if (month === 9) {
      moonName = 'Harvest Moon';
      moonEnergy = 'Abundance Gathering';
    } else if (month === 10) {
      moonName = 'Hunter Moon';
      moonEnergy = 'Preparation Focus';
    } else if (month === 11) {
      moonName = 'Beaver Moon';
      moonEnergy = 'Winter Preparation';
    } else if (month === 12) {
      moonName = 'Cold Moon';
      moonEnergy = 'Inner Stillness';
    }
    
    allEvents.push({ name: moonName, emoji: '🌕', energy: moonEnergy, description: 'Maximum lunar energy', detail: '100% illuminated', priority: 8 });
    isMoonSignificant = true;
  } else if (lunarDay >= 22.1 && lunarDay < 22.6) {
    allEvents.push({ name: 'Third Quarter', emoji: '🌗', energy: 'Release & Letting Go', description: 'Half moon setting', detail: '50% illuminated', priority: 5 });
    isMoonSignificant = true;
  }

  // If no astronomical events or significant moon phases, add main aspect to sync with post content
  if (allEvents.length === 0) {
    const mainAspect = generateMainAstronomicalEvent(targetDate, planets);
    allEvents.push(mainAspect);
  }

  // Only add basic planetary events as absolute last resort
  if (allEvents.length === 0) {
    const dayOfWeek = targetDate.getDay();
    const planetaryEvents = [
      { name: 'Venus Rising', emoji: '♀', energy: 'Love & Beauty', description: 'Planet of love prominent', detail: 'Evening star rising', priority: 3 },
      { name: 'Mars Power', emoji: '♂', energy: 'Action & Courage', description: 'Warrior planet active', detail: 'Red planet energy', priority: 3 },
      { name: 'Jupiter Expansion', emoji: '♃', energy: 'Growth & Abundance', description: 'Great benefic influence', detail: 'Giant planet blessing', priority: 3 },
      { name: 'Mercury Clarity', emoji: '☿', energy: 'Communication', description: 'Messenger planet clear', detail: 'Mental agility peak', priority: 3 },
      { name: 'Saturn Focus', emoji: '♄', energy: 'Structure & Goals', description: 'Taskmaster discipline', detail: 'Ringed planet guidance', priority: 2 },
      { name: 'Neptune Dreams', emoji: '♆', energy: 'Intuition & Vision', description: 'Mystical planet influence', detail: 'Oceanic consciousness', priority: 2 },
      { name: 'Uranus Innovation', emoji: '⛢', energy: 'Change & Revolution', description: 'Awakener planet active', detail: 'Electric transformation', priority: 2 }
    ];

    if (dayOfWeek >= 0 && dayOfWeek < planetaryEvents.length) {
      allEvents.push(planetaryEvents[dayOfWeek]);
    }
  }

  // If still no events, add regular moon phase as last resort
  if (allEvents.length === 0) {
    allEvents.push(moonPhase);
  }

  allEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = allEvents[0] || { name: 'Cosmic Flow', emoji: '✨', energy: 'Universal Harmony', description: 'Celestial balance', detail: 'Cosmic consciousness', priority: 1 };
  
  // Consistent planet symbols for rendering
  const planetSymbols = {
    venus: '♀',
    mars: '♂', 
    jupiter: '♃',
    mercury: '☿',
    saturn: '♄',
    neptune: '♆',
    uranus: '⛢'
  };

  // Get dynamic visual theme based on event type - clean and minimal with better legibility
  const getEventTheme = (event: any) => {
    // Clean, muted, minimal themes with darker backgrounds and pastel accents
    const dayVariation = daysSinceNew % 5;
        const themes = [
      { background: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)', accent: '#b19cd9' }, // Pastel purple
      { background: 'linear-gradient(135deg, #1a1a2e, #2d3561)', accent: '#87ceeb' }, // Pastel blue
      { background: 'linear-gradient(135deg, #2c3e50, #34495e)', accent: '#dda0dd' }, // Pastel plum
      { background: 'linear-gradient(135deg, #1e2a3a, #2c3e50)', accent: '#87cefa' }, // Light sky blue
      { background: 'linear-gradient(135deg, #1a2332, #1e3c72)', accent: '#f0a0a0' }  // Pastel coral
    ];
    
    return {
      ...themes[dayVariation],
      textShadow: '0 2px 8px rgba(0,0,0,0.8)' // Stronger shadow for legibility
    };
  };
  
  const theme = getEventTheme(primaryEvent);
  
  const dateStr = targetDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.background,
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '80px',
            background: theme.background,
            fontFamily: 'system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Decorative Stars */}
          <div style={{ position: 'absolute', top: '60px', left: '100px', fontSize: '24px', color: theme.accent, opacity: 0.4 }}>✦</div>
          <div style={{ position: 'absolute', top: '120px', right: '150px', fontSize: '18px', color: theme.accent, opacity: 0.3 }}>✧</div>
          <div style={{ position: 'absolute', bottom: '180px', left: '120px', fontSize: '20px', color: theme.accent, opacity: 0.3 }}>⋆</div>
          <div style={{ position: 'absolute', bottom: '100px', right: '100px', fontSize: '22px', color: theme.accent, opacity: 0.4 }}>✦</div>

          {/* Corner Accents */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', width: '40px', height: '40px', border: `2px solid ${theme.accent}`, borderRight: 'none', borderBottom: 'none', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', top: '40px', right: '40px', width: '40px', height: '40px', border: `2px solid ${theme.accent}`, borderLeft: 'none', borderBottom: 'none', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', width: '40px', height: '40px', border: `2px solid ${theme.accent}`, borderRight: 'none', borderTop: 'none', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '40px', height: '40px', border: `2px solid ${theme.accent}`, borderLeft: 'none', borderTop: 'none', opacity: 0.3 }}></div>

          {/* Header with Frame */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px 60px',
            border: `2px solid ${theme.accent}`,
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            marginBottom: '60px',
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: `0 2px 10px ${theme.accent}`,
              letterSpacing: '8px',
              marginBottom: '8px',
            }}>
              L U N A R Y
            </div>
            <div style={{
              fontSize: '16px',
              color: theme.accent,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              COSMIC GUIDANCE
            </div>
          </div>

          {/* Date Pill */}
          <div style={{
            fontSize: '20px',
            color: 'white',
            backgroundColor: theme.accent,
            padding: '12px 32px',
            borderRadius: '30px',
            border: `2px solid white`,
            marginBottom: '40px',
            fontWeight: '600',
            letterSpacing: '1px',
          }}>
            {dateStr}
          </div>

          {/* Main Event Emoji with Glow */}
          <div style={{
            fontSize: '220px',
            marginBottom: '20px',
            textShadow: `0 0 40px ${theme.accent}, 0 0 80px ${theme.accent}`,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
            color: 'white',
          }}>
            {primaryEvent.emoji}
          </div>

          {/* Aspect Glyph (if this is an aspect event) */}
          {primaryEvent.glyph && (
            <div style={{
              fontSize: '80px',
              color: theme.accent,
              marginBottom: '15px',
              textShadow: `0 0 20px ${theme.accent}, 0 4px 8px rgba(0,0,0,0.3)`,
              fontWeight: 'bold',
            }}>
              {primaryEvent.glyph}
            </div>
          )}

          {/* Mini Astro Chart (for aspect events) */}
          {primaryEvent.aspect && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '25px',
              gap: '30px',
            }}>
              {/* Planet A */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{ fontSize: '40px', color: 'white' }}>
                  {primaryEvent.emoji.charAt(0)}
                </div>
                <div style={{ fontSize: '14px', color: theme.accent, textAlign: 'center' }}>
                  {primaryEvent.signA || 'Cosmic'}
                </div>
              </div>

              {/* Aspect Line with Glyph */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
              }}>
                <div style={{
                  width: '100px',
                  height: '3px',
                  background: `linear-gradient(90deg, ${theme.accent}, white, ${theme.accent})`,
                  borderRadius: '2px',
                }}></div>
                <div style={{ fontSize: '24px', color: theme.accent }}>
                  {primaryEvent.glyph}
                </div>
              </div>

              {/* Planet B */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{ fontSize: '40px', color: 'white' }}>
                  {primaryEvent.emoji.charAt(1) || primaryEvent.emoji.charAt(0)}
                </div>
                <div style={{ fontSize: '14px', color: theme.accent, textAlign: 'center' }}>
                  {primaryEvent.signB || 'Cosmic'}
                </div>
              </div>
            </div>
          )}

          {/* Event Name with Decorative Lines */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '15px',
          }}>
            <div style={{ width: '80px', height: '2px', backgroundColor: theme.accent, opacity: 0.7 }}></div>
            <div style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              textShadow: `0 4px 12px ${theme.accent}, 0 2px 4px rgba(0,0,0,0.5)`,
              letterSpacing: '2px',
              lineHeight: '1.1',
            }}>
              {primaryEvent.name}
            </div>
            <div style={{ width: '80px', height: '2px', backgroundColor: theme.accent, opacity: 0.7 }}></div>
          </div>

          {/* Energy Text in Panel */}
          <div style={{
            fontSize: '32px',
            color: 'white',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '20px 40px',
            borderRadius: '15px',
            border: `2px solid ${theme.accent}`,
            marginBottom: '40px',
            textShadow: `0 2px 8px ${theme.accent}`,
            fontWeight: '500',
            letterSpacing: '1px',
          }}>
            {primaryEvent.energy}
          </div>

          {/* Subtle Bottom Accent */}
          <div style={{
            position: 'absolute',
            bottom: '60px',
            display: 'flex',
            gap: '15px',
            opacity: 0.4,
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accent }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.accent }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accent }}></div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    },
  );
}
