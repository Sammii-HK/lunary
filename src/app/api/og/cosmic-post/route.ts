import { NextRequest, NextResponse } from 'next/server';

// Server-side zodiac calculation
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const index = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return signs[index];
}

// Get descriptive qualities for zodiac signs
function getSignDescription(sign: string): string {
  const descriptions: { [key: string]: string } = {
    'Aries': 'initiating and pioneering',
    'Taurus': 'grounding and stabilizing', 
    'Gemini': 'communicating and adapting',
    'Cancer': 'nurturing and protective',
    'Leo': 'creative and expressive',
    'Virgo': 'practical and analytical',
    'Libra': 'harmonizing and diplomatic',
    'Scorpio': 'transforming and intense',
    'Sagittarius': 'expanding and philosophical',
    'Capricorn': 'structuring and ambitious',
    'Aquarius': 'innovative and independent',
    'Pisces': 'intuitive and compassionate'
  };
  return descriptions[sign] || 'cosmic';
}

// Helper function to determine aspect type based on angular separation
function getAspectType(angle: number): string {
  if (angle < 10) return 'conjunction';
  if (angle < 70) return 'sextile';
  if (angle < 110) return 'square';
  if (angle < 130) return 'trine';
  return 'opposition';
}

// Find the zodiac sign with the most planets
function getMostPopulatedSign(planets: any): string {
  const signCount: { [key: string]: number } = {};
  Object.values(planets).forEach((planet: any) => {
    signCount[planet.sign] = (signCount[planet.sign] || 0) + 1;
  });
  
  let maxCount = 0;
  let mostPopulated = 'Aries';
  Object.entries(signCount).forEach(([sign, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopulated = sign;
    }
  });
  
  return mostPopulated;
}

// Get a retrograde planet based on day of year
function getRetrogradePlanet(dayOfYear: number): string {
  const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  return planets[dayOfYear % planets.length];
}

// Approximate planetary positions (for display purposes)
function getApproximatePlanetaryData(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Starting positions for 2024-2025 (approximate)
  const year = date.getFullYear();
  const baseYear = 2024;
  const yearOffset = year - baseYear;
  
  return {
    sun: {
      longitude: (dayOfYear * 0.986) % 360,
      sign: getZodiacSign((dayOfYear * 0.986) % 360)
    },
    moon: {
      longitude: (dayOfYear * 13.176) % 360,
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

// Check for major astronomical events AND planetary events (to match image API)
function getSignificantAstronomicalEvents(date: Date, planets: any) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const events: Array<{ name: string; energy: string; priority: number }> = [];
  
  // SEASONAL MARKERS - Equinoxes & Solstices (Priority 10) - 1 day each
  if (month === 3 && day === 20) {
    events.push({ name: 'Spring Equinox', energy: 'Balance & New Growth', priority: 10 });
  }
  if (month === 6 && day === 21) {
    events.push({ name: 'Summer Solstice', energy: 'Maximum Solar Power', priority: 10 });
  }
  if (month === 9 && day === 23) {
    events.push({ name: 'Autumn Equinox', energy: 'Harvest & Reflection', priority: 10 });
  }
  if (month === 12 && day === 21) {
    events.push({ name: 'Winter Solstice', energy: 'Inner Light & Renewal', priority: 10 });
  }
  
  // CROSS-QUARTER DAYS (Priority 9) - 1 day each
  if (month === 2 && day === 4) {
    events.push({ name: 'Imbolc Cross-Quarter', energy: 'Midwinter Light', priority: 9 });
  }
  if (month === 5 && day === 6) {
    events.push({ name: 'Beltane Cross-Quarter', energy: 'Spring Peak', priority: 9 });
  }
  if (month === 8 && day === 7) {
    events.push({ name: 'Lughnasadh Cross-Quarter', energy: 'Summer Harvest', priority: 9 });
  }
  if (month === 10 && day === 31) {
    events.push({ name: 'Samhain Cross-Quarter', energy: 'Veil Thinning', priority: 9 });
  }
  
  // MAJOR METEOR SHOWERS (Priority 8-9) - 1-2 days each, spread throughout year
  if (month === 1 && day === 3) {
    events.push({ name: 'Quadrantid Meteors', energy: 'New Year Clarity', priority: 9 });
  }
  if (month === 4 && day === 22) {
    events.push({ name: 'Lyrid Meteors', energy: 'Spring Awakening', priority: 8 });
  }
  if (month === 5 && day === 5) {
    events.push({ name: 'Eta Aquariid Meteors', energy: 'Comet Wisdom', priority: 8 });
  }
  if (month === 8 && day === 12) {
    events.push({ name: 'Perseid Meteors', energy: 'Cosmic Inspiration', priority: 9 });
  }
  if (month === 10 && day === 8) {
    events.push({ name: 'Draconid Meteors', energy: 'Dragon Fire', priority: 8 });
  }
  if (month === 10 && day === 21) {
    events.push({ name: 'Orionid Meteors', energy: 'Hunter\'s Vision', priority: 8 });
  }
  if (month === 11 && day === 17) {
    events.push({ name: 'Leonid Meteors', energy: 'Cosmic Awakening', priority: 8 });
  }
  if (month === 12 && day === 14) {
    events.push({ name: 'Geminid Meteors', energy: 'Divine Connection', priority: 9 });
  }
  if (month === 12 && day === 22) {
    events.push({ name: 'Ursid Meteors', energy: 'Bear Spirit', priority: 8 });
  }
  
  // PLANETARY PHENOMENA (Priority 7-8) - 1 day each, spread throughout year
  if (month === 1 && day === 4) {
    events.push({ name: 'Earth Perihelion', energy: 'Closest Solar Bond', priority: 8 });
  }
  if (month === 7 && day === 5) {
    events.push({ name: 'Earth Aphelion', energy: 'Solar Independence', priority: 8 });
  }
  if (month === 3 && day === 17) {
    events.push({ name: 'Mercury Maximum Elongation', energy: 'Mental Clarity Peak', priority: 7 });
  }
  if (month === 6 && day === 18) {
    events.push({ name: 'Venus Maximum Elongation', energy: 'Love\'s Greatest Reach', priority: 7 });
  }
  if (month === 9 && day === 18) {
    events.push({ name: 'Mars Opposition', energy: 'Warrior\'s Strength', priority: 8 });
  }
  if (month === 11 && day === 3) {
    events.push({ name: 'Jupiter Opposition', energy: 'Expansion Peak', priority: 8 });
  }
  if (month === 8 && day === 27) {
    events.push({ name: 'Saturn Opposition', energy: 'Structure Illuminated', priority: 6 }); // Reduced priority - single day astronomical event
  }
  
  // TRADITIONAL FULL MOONS - removed fixed dates, now handled in main GET function during actual full moons
  
  // STELLAR EVENTS (Priority 6-7) - 1 day each, spread throughout year
  if (month === 1 && day === 12) {
    events.push({ name: 'Sirius Heliacal Rising', energy: 'Dog Star Power', priority: 7 });
  }
  if (month === 7 && day === 24) {
    events.push({ name: 'Regulus Solar Conjunction', energy: 'Heart of Lion', priority: 7 });
  }
  if (month === 9 && day === 7) {
    events.push({ name: 'Spica Culmination', energy: 'Harvest Star', priority: 6 });
  }
  if (month === 11 && day === 12) {
    events.push({ name: 'Pleiades Opposition', energy: 'Seven Sisters', priority: 7 });
  }
  if (month === 12 && day === 7) {
    events.push({ name: 'Aldebaran Maximum', energy: 'Bull\'s Eye Focus', priority: 6 });
  }
  
  // GALACTIC EVENTS (Priority 6) - 1 day each
  if (month === 4 && day === 12) {
    events.push({ name: 'Virgo Galaxy Cluster', energy: 'Cosmic Abundance', priority: 6 });
  }
  if (month === 8 && day === 3) {
    events.push({ name: 'Milky Way Center', energy: 'Galactic Heart', priority: 6 });
  }
  if (month === 10 && day === 17) {
    events.push({ name: 'Andromeda Rising', energy: 'Sister Galaxy', priority: 6 });
  }
  
  // ZODIACAL PHENOMENA (Priority 6) - 1 day each
  if (month === 2 && day === 25) {
    events.push({ name: 'Zodiacal Light Dawn', energy: 'Morning Pyramid', priority: 6 });
  }
  if (month === 9 && day === 25) {
    events.push({ name: 'Zodiacal Light Dusk', energy: 'Evening Pyramid', priority: 6 });
  }
  
  // ADDITIONAL UNIQUE EVENTS to fill gaps (Priority 6-7)
  if (month === 1 && day === 15) {
    events.push({ name: 'Capella Transit', energy: 'Charioteer\'s Guide', priority: 6 });
  }
  if (month === 2 && day === 15) {
    events.push({ name: 'Canopus Culmination', energy: 'Southern Navigator', priority: 6 });
  }
  if (month === 3 && day === 15) {
    events.push({ name: 'Vega Rising', energy: 'Future Pole Star', priority: 6 });
  }
  if (month === 4 && day === 15) {
    events.push({ name: 'Arcturus Peak', energy: 'Bear Guardian', priority: 6 });
  }
  if (month === 5 && day === 15) {
    events.push({ name: 'Antares Opposition', energy: 'Rival of Mars', priority: 7 });
  }
  if (month === 6 && day === 15) {
    events.push({ name: 'Vernal Point Transit', energy: 'Cosmic Coordinates', priority: 6 });
  }
  if (month === 7 && day === 15) {
    events.push({ name: 'Summer Triangle Peak', energy: 'Stellar Navigation', priority: 6 });
  }
  if (month === 8 && day === 15) {
    events.push({ name: 'Altair Culmination', energy: 'Eagle\'s Flight', priority: 6 });
  }
  if (month === 9 && day === 15) {
    events.push({ name: 'Fomalhaut Rising', energy: 'Solitary Watcher', priority: 6 });
  }
  if (month === 10 && day === 15) {
    events.push({ name: 'Deneb Maximum', energy: 'Swan\'s Tail', priority: 6 });
  }
  if (month === 11 && day === 15) {
    events.push({ name: 'Polaris Alignment', energy: 'True North Star', priority: 6 });
  }
  if (month === 12 && day === 15) {
    events.push({ name: 'Winter Hexagon', energy: 'Stellar Crown', priority: 7 });
  }
  
  // Add planetary events to match image API (only if no high-priority events)
  const dayOfWeek = date.getDay();
  const planetaryEvents = [
    { name: 'Venus Rising', energy: 'Love & Beauty', priority: 3 },
    { name: 'Mars Power', energy: 'Action & Courage', priority: 3 },
    { name: 'Jupiter Expansion', energy: 'Growth & Abundance', priority: 3 },
    { name: 'Mercury Clarity', energy: 'Communication', priority: 3 },
    { name: 'Saturn Focus', energy: 'Structure & Goals', priority: 2 },
    { name: 'Neptune Dreams', energy: 'Intuition & Vision', priority: 2 },
    { name: 'Uranus Innovation', energy: 'Change & Revolution', priority: 2 }
  ];
  
  // Only add planetary event if no high-priority events exist (matching image API logic)
  if (events.length === 0 || events[0].priority < 5) {
    if (dayOfWeek >= 0 && dayOfWeek < planetaryEvents.length) {
      events.push(planetaryEvents[dayOfWeek]);
    }
  }
  
  return events.sort((a, b) => b.priority - a.priority);
}

// Generate expanded description for the main event (not just repeating image info)
function getExpandedEventDescription(primaryEvent: any, planets: any): string {
  const eventName = primaryEvent.name;

  // EQUINOXES & SOLSTICES - astronomical significance
  if (eventName.includes('Spring Equinox')) {
    return `🌍 Spring Equinox marks equal day/night globally as Earth's axis tilts neither toward nor away from the Sun - triggering renewal cycles in nature and consciousness`;
  }
  if (eventName.includes('Summer Solstice')) {
    return `☀️ Summer Solstice brings maximum daylight hours in the Northern Hemisphere - the Sun reaches its highest point at 23.5°N latitude, energizing growth and manifestation`;
  }
  if (eventName.includes('Autumn Equinox')) {
    return `🍂 Autumn Equinox creates perfect light/dark balance as the Sun crosses the celestial equator southbound - nature demonstrates the wisdom of release and preparation`;
  }
  if (eventName.includes('Winter Solstice')) {
    return `❄️ Winter Solstice marks the year's shortest day as Earth's North Pole tilts furthest from the Sun - ancient cultures recognized this as the rebirth of light itself`;
  }

  // METEOR SHOWERS - cosmic debris and timing
  if (eventName.includes('Perseid')) {
    return `💫 Perseid Meteors peak as Earth passes through Comet Swift-Tuttle's debris trail - up to 60 meteors per hour visible, best viewed after midnight away from city lights`;
  }
  if (eventName.includes('Geminid')) {
    return `✨ Geminid Meteors originate from asteroid 3200 Phaethon's rocky debris - this December shower often produces the year's most spectacular meteor displays`;
  }
  if (eventName.includes('Leonid')) {
    return `🦁 Leonid Meteors radiate from Leo constellation as Earth encounters Comet Tempel-Tuttle's particle stream - historically produced legendary meteor storms`;
  }

  // MOON PHASES - lunar mechanics and effects
  if (eventName.includes('New Moon')) {
    return `🌑 New Moon occurs when Luna aligns between Earth and Sun, making the lunar surface invisible - this astronomical reset triggers new growth cycles and fresh intentions`;
  }
  if (eventName.includes('Full Moon')) {
    return `🌕 Full Moon happens when Earth sits between Sun and Luna, fully illuminating the lunar surface - gravitational forces peak, affecting tides and biological rhythms`;
  }
  if (eventName.includes('First Quarter')) {
    return `🌓 First Quarter Moon shows exactly half the lunar surface illuminated - this 90° Sun-Moon angle creates maximum gravitational tension, perfect for decision-making`;
  }
  if (eventName.includes('Third Quarter')) {
    return `🌗 Third Quarter Moon displays the opposite half illuminated from First Quarter - this waning phase supports release work as lunar energy decreases toward New Moon`;
  }
  if (eventName.includes('Waxing Crescent')) {
    const dayMatch = eventName.match(/Day (\d+)/);
    const day = dayMatch ? dayMatch[1] : '1';
    return `🌒 Waxing Crescent Day ${day} shows ${Math.round(((parseInt(day) + 1) / 29.53) * 100)}% lunar illumination - optimal timing for setting intentions and planting seeds as lunar energy builds`;
  }
  if (eventName.includes('Waning Crescent')) {
    const dayMatch = eventName.match(/Day (\d+)/);
    const day = dayMatch ? dayMatch[1] : '1';
    return `🌘 Waning Crescent Day ${day} displays ${Math.round((26 - parseInt(day)) / 29.53 * 100)}% illumination - final release phase before New Moon, ideal for clearing away what no longer serves`;
  }
  if (eventName.includes('Waxing Gibbous')) {
    return `🌔 Waxing Gibbous phase shows 75%+ lunar illumination as the Moon approaches fullness - energy intensifies for final preparations and refinement of goals`;
  }
  if (eventName.includes('Waning Gibbous')) {
    return `🌖 Waning Gibbous phase displays decreasing illumination after Full Moon - this is the gratitude phase for harvesting wisdom and sharing knowledge gained`;
  }

  // PLANETARY CONJUNCTIONS - educational descriptions about what each combination means
  if (eventName.includes('Mercury-Venus conjunction')) {
    return `☿♀ Mercury-Venus conjunction unites the mind and heart in ${planets.mercury.sign} - when the messenger planet meets the love planet, communication becomes more harmonious, artistic, and diplomatic. This rare alignment enhances writing, negotiation, and expressing feelings with eloquence.`;
  }
  if (eventName.includes('Sun-Mercury conjunction')) {
    return `☉☿ Sun-Mercury conjunction merges identity with intellect in ${planets.sun.sign} - when our core self aligns with communication, thoughts become clearer, self-expression more authentic, and mental focus intensifies. Ancient astrologers called this the "heart of the sun" placement.`;
  }
  if (eventName.includes('Venus-Mars conjunction')) {
    return `♀♂ Venus-Mars conjunction balances receptive and active energies in ${planets.venus.sign} - when the relationship planet meets the action planet, passionate creativity emerges. This powerful combination harmonizes desire with action, perfect for artistic endeavors and romantic initiatives.`;
  }
  if (eventName.includes('Sun-Jupiter conjunction')) {
    return `☉♃ Sun-Jupiter conjunction amplifies confidence and opportunity in ${planets.sun.sign} - when our core identity aligns with the planet of expansion, natural leadership emerges. This fortunate aspect traditionally brings recognition, growth, and successful ventures.`;
  }
  if (eventName.includes('Mars-Jupiter trine')) {
    return `♂♃ Mars-Jupiter trine creates effortless action and growth - when the warrior planet flows harmoniously with the expansion planet, endeavors succeed with minimal resistance. This aspect supports athletic achievement, business growth, and adventurous pursuits.`;
  }
  if (eventName.includes('Venus-Neptune trine')) {
    return `♀♆ Venus-Neptune trine dissolves boundaries around love and beauty - when the relationship planet flows with the transcendence planet, romantic idealism and artistic inspiration reach sublime heights. Perfect for creative collaboration and spiritual romance.`;
  }
  if (eventName.includes('Jupiter-Saturn Great Conjunction')) {
    return `♃♄ Jupiter-Saturn Great Conjunction occurs only every 20 years, marking major societal shifts - when expansion meets structure, old systems transform. This historic alignment in ${planets.jupiter.sign} reshapes economic, political, and social foundations for the next two decades.`;
  }
  if (eventName.includes('Jupiter-Uranus Great Conjunction')) {
    return `♃⛢ Jupiter-Uranus Great Conjunction brings revolutionary breakthroughs every 14 years - when expansion meets innovation, sudden opportunities for freedom and progress emerge. This rare alignment in ${planets.jupiter.sign} catalyzes technological and social advancement.`;
  }
  if (eventName.includes('Saturn-Neptune Great Conjunction')) {
    return `♄♆ Saturn-Neptune Great Conjunction balances reality with dreams every 36 years - when structure meets transcendence, spiritual ideals must find practical form. This generational aspect in ${planets.saturn.sign} tests whether visions can manifest in the material world.`;
  }

  // PLANETARY EVENTS - when planets are primary (matching image API naming)
  if (eventName.includes('Venus Rising')) {
    return `♀ Venus in ${planets.venus.sign} emphasizes relationships and aesthetics - ${planets.venus.sign} brings ${getSignDescription(planets.venus.sign)} qualities to matters of love, beauty, and values`;
  }
  if (eventName.includes('Mars Power')) {
    return `♂ Mars in ${planets.mars.sign} activates warrior energy - ${planets.mars.sign} channels ${getSignDescription(planets.mars.sign)} approaches to action, ambition, and conflict resolution`;
  }
  if (eventName.includes('Jupiter Expansion')) {
    return `♃ Jupiter in ${planets.jupiter.sign} amplifies growth opportunities - ${planets.jupiter.sign} expands ${getSignDescription(planets.jupiter.sign)} themes of wisdom, abundance, and philosophical development`;
  }
  if (eventName.includes('Mercury Clarity')) {
    return `☿ Mercury in ${planets.mercury.sign} sharpens communication - ${planets.mercury.sign} influences ${getSignDescription(planets.mercury.sign)} mental processing, learning, and information exchange`;
  }
  if (eventName.includes('Saturn Focus')) {
    return `♄ Saturn in ${planets.saturn.sign} emphasizes structure and goals - ${planets.saturn.sign} applies ${getSignDescription(planets.saturn.sign)} discipline to long-term achievements and responsibilities`;
  }
  if (eventName.includes('Neptune Dreams')) {
    return `♆ Neptune in ${planets.neptune.sign} heightens intuition and vision - ${planets.neptune.sign} dissolves ${getSignDescription(planets.neptune.sign)} boundaries while inspiring transcendent experiences`;
  }
  if (eventName.includes('Uranus Innovation')) {
    return `⛢ Uranus in ${planets.uranus.sign} sparks revolutionary change - ${planets.uranus.sign} brings ${getSignDescription(planets.uranus.sign)} breakthroughs and unexpected liberation from old patterns`;
  }

  // CROSS-QUARTER DAYS - Celtic/astronomical markers
  if (eventName.includes('Imbolc Cross-Quarter')) {
    return `🕯️ Imbolc Cross-Quarter marks the midpoint between Winter Solstice and Spring Equinox - ancient cultures celebrated this as the first stirring of spring when daylight notably increases`;
  }
  if (eventName.includes('Beltane Cross-Quarter')) {
    return `🌸 Beltane Cross-Quarter occurs halfway between Spring Equinox and Summer Solstice - this marks the peak of spring fertility when life force energy reaches maximum growth potential`;
  }
  if (eventName.includes('Lughnasadh Cross-Quarter')) {
    return `🌾 Lughnasadh Cross-Quarter falls midway between Summer Solstice and Autumn Equinox - ancient harvest festival marking when early grains ripen and summer's peak begins to wane`;
  }
  if (eventName.includes('Samhain Cross-Quarter')) {
    return `🍂 Samhain Cross-Quarter bisects Autumn Equinox and Winter Solstice - traditional "Day of the Dead" when the veil between worlds was believed thinnest, marking winter's approach`;
  }

  // ADDITIONAL METEOR SHOWERS - Comet debris encounters
  if (eventName.includes('Quadrantid')) {
    return `💫 Quadrantid Meteors peak as Earth passes through debris from extinct comet 2003 EH1 - this sharp, intense shower produces up to 40 meteors per hour from the Boötes constellation`;
  }
  if (eventName.includes('Lyrid')) {
    return `🌟 Lyrid Meteors occur when Earth encounters debris from Comet Thatcher - this ancient shower has been observed for 2,700 years, radiating from the constellation Lyra`;
  }
  if (eventName.includes('Eta Aquariid')) {
    return `☄️ Eta Aquariid Meteors result from Earth passing through Halley's Comet debris trail - these swift meteors appear to radiate from Aquarius and peak in pre-dawn skies`;
  }
  if (eventName.includes('Draconid')) {
    return `🐉 Draconid Meteors originate from Comet Giacobini-Zinner's debris field - unique among meteor showers for peaking in early evening rather than pre-dawn hours`;
  }
  if (eventName.includes('Orionid')) {
    return `🏹 Orionid Meteors are another gift from Halley's Comet, encountered as Earth crosses its orbital path twice yearly - these fast meteors often leave glowing trails`;
  }
  if (eventName.includes('Ursid')) {
    return `🐻 Ursid Meteors conclude the year's meteor activity, originating from Comet Tuttle's debris - though modest in number, they offer a final celestial celebration before year's end`;
  }

  // PLANETARY PHENOMENA - Orbital mechanics
  if (eventName.includes('Earth Perihelion')) {
    return `🌍 Earth Perihelion occurs when our planet reaches its closest point to the Sun at 91.4 million miles - counterintuitively, this happens during Northern Hemisphere winter`;
  }
  if (eventName.includes('Earth Aphelion')) {
    return `🌍 Earth Aphelion marks our planet's farthest point from the Sun at 94.5 million miles - this 3% distance variation affects seasonal intensity and orbital velocity`;
  }
  if (eventName.includes('Mercury Maximum Elongation')) {
    return `☿ Mercury reaches Maximum Elongation when it appears farthest from the Sun in our sky - this swift planet's best viewing opportunities occur during these 28° separations`;
  }
  if (eventName.includes('Venus Maximum Elongation')) {
    return `♀ Venus Maximum Elongation provides optimal viewing when our sister planet reaches 47° separation from the Sun - appearing as brilliant "morning star" or "evening star"`;
  }
  if (eventName.includes('Mars Opposition')) {
    return `♂ Mars Opposition occurs when Earth sits between Mars and the Sun - the red planet appears largest, brightest, and closest, reaching magnitude -2.9 visibility`;
  }
  if (eventName.includes('Jupiter Opposition')) {
    return `♃ Jupiter Opposition brings the giant planet to its closest approach to Earth - this optimal viewing time reveals the planet's cloud bands and four largest moons most clearly`;
  }
  if (eventName.includes('Saturn Opposition')) {
    return `♄ Saturn Opposition offers the best views of the ringed planet when Earth aligns between Saturn and the Sun - ring tilt and brightness reach optimal viewing conditions`;
  }

  // LUNAR PHENOMENA - Traditional full moon names
  if (eventName.includes('Wolf Moon')) {
    return `🐺 Wolf Moon, January's traditional full moon name, comes from hungry wolf packs howling near villages during harsh winter months - the year's first supermoon often occurs now`;
  }
  if (eventName.includes('Snow Moon')) {
    return `❄️ Snow Moon, February's full moon, earned its name from heavy snowfall typical of North America's coldest month - also called Hunger Moon during scarce times`;
  }
  if (eventName.includes('Worm Moon')) {
    return `🪱 Worm Moon, March's full moon, signals earthworms emerging as soil thaws - Native American tribes observed this as the final full moon of winter meteorological season`;
  }
  if (eventName.includes('Pink Moon')) {
    return `🌸 Pink Moon, April's full moon, takes its name from early spring's pink phlox wildflowers - despite the name, the moon appears its normal color unless atmospheric effects occur`;
  }
  if (eventName.includes('Flower Moon')) {
    return `🌺 Flower Moon, May's full moon, celebrates the abundant blooming of spring flowers - this moon occurs during peak flower season in most temperate Northern Hemisphere regions`;
  }
  if (eventName.includes('Strawberry Moon')) {
    return `🍓 Strawberry Moon, June's full moon, marks wild strawberry harvesting time in northeastern North America - often coincides with summer solstice, creating the lowest full moon of the year`;
  }
  if (eventName.includes('Buck Moon')) {
    return `🦌 Buck Moon, July's full moon, named for when male deer grow new antlers - this summer moon rises during the hottest part of the year when wildlife activity peaks`;
  }
  if (eventName.includes('Sturgeon Moon')) {
    return `🐟 Sturgeon Moon, August's full moon, comes from large sturgeon fish being most easily caught in the Great Lakes during this time - also called Grain Moon for harvest season`;
  }
  if (eventName.includes('Harvest Moon')) {
    return `🌾 Harvest Moon, September's full moon closest to autumn equinox, rises shortly after sunset for several nights - providing extra light for farmers harvesting crops into evening`;
  }
  if (eventName.includes('Hunter Moon')) {
    return `🏹 Hunter Moon, October's full moon, traditionally signaled time to hunt and store meat for winter - follows Harvest Moon with bright light for tracking game`;
  }
  if (eventName.includes('Beaver Moon')) {
    return `🦫 Beaver Moon, November's full moon, marks when beavers prepare winter lodges and trappers set beaver traps - the final full moon before winter's harsh grip`;
  }
  if (eventName.includes('Cold Moon')) {
    return `❄️ Cold Moon, December's full moon, coincides with winter's longest nights and coldest temperatures - also called Long Night Moon for extended darkness hours`;
  }

  // STELLAR EVENTS - Fixed star phenomena  
  if (eventName.includes('Sirius Heliacal Rising')) {
    return `⭐ Sirius Heliacal Rising occurs when the brightest star reappears in dawn sky after solar conjunction - ancient Egyptians used this event to predict Nile River flooding`;
  }
  if (eventName.includes('Regulus Solar Conjunction')) {
    return `🦁 Regulus Solar Conjunction happens when the "heart of the lion" star aligns behind the Sun - this royal star's annual solar meeting was significant to ancient astrologers`;
  }
  if (eventName.includes('Spica Culmination')) {
    return `🌾 Spica Culmination marks when this harvest star reaches its highest point during evening hours - Spica's blue-white light guided ancient navigators and farmers alike`;
  }
  if (eventName.includes('Pleiades Opposition')) {
    return `✨ Pleiades Opposition brings the Seven Sisters star cluster to optimal viewing when it rises opposite the setting Sun - this open cluster contains over 1,000 hot young stars`;
  }
  if (eventName.includes('Aldebaran Maximum')) {
    return `🔴 Aldebaran Maximum occurs when the "eye of the bull" red giant star reaches its most prominent evening position - though it appears in the Hyades, it's actually much closer`;
  }
  if (eventName.includes('Capella Transit')) {
    return `⭐ Capella Transit marks when the sixth brightest star reaches its highest point - this yellow giant system in Auriga was crucial for ancient navigation in northern latitudes`;
  }
  if (eventName.includes('Canopus Culmination')) {
    return `🌟 Canopus Culmination brings the second brightest star to its peak southern visibility - this white supergiant in Carina is invisible from most northern locations`;
  }
  if (eventName.includes('Vega Rising')) {
    return `💫 Vega Rising highlights the future pole star as it reaches prominence - in 13,727 CE, this blue giant will replace Polaris due to Earth's axial precession`;
  }
  if (eventName.includes('Arcturus Peak')) {
    return `🐻 Arcturus Peak showcases the fourth brightest star when it culminates - this orange giant in Boötes moves unusually fast through our galaxy at 122 km/second`;
  }
  if (eventName.includes('Antares Opposition')) {
    return `🔴 Antares Opposition brings the red supergiant "rival of Mars" to optimal viewing - this massive star is 700 times the Sun's diameter and will explode as a supernova`;
  }
  if (eventName.includes('Vernal Point Transit')) {
    return `📍 Vernal Point Transit marks when the celestial coordinate system's origin crosses the meridian - this fundamental reference point defines astronomical positions worldwide`;
  }
  if (eventName.includes('Summer Triangle Peak')) {
    return `🔺 Summer Triangle Peak occurs when the asterism formed by Vega, Altair, and Deneb reaches its highest position - this prominent star pattern dominates northern summer skies`;
  }
  if (eventName.includes('Altair Culmination')) {
    return `🦅 Altair Culmination brings the "eagle star" to its highest point - this nearby star in Aquila is one of the closest stars visible to the naked eye at 16.7 light-years`;
  }
  if (eventName.includes('Fomalhaut Rising')) {
    return `👁️ Fomalhaut Rising showcases the "solitary one" - this young star in Piscis Austrinus is surrounded by a debris disk potentially forming planets`;
  }
  if (eventName.includes('Deneb Maximum')) {
    return `🦢 Deneb Maximum highlights the most distant star visible to naked eye - this blue supergiant in Cygnus lies 2,600 light-years away yet still shines brightly`;
  }
  if (eventName.includes('Polaris Alignment')) {
    return `🧭 Polaris Alignment celebrates our current pole star's precise positioning - this yellow supergiant will remain our north star for several more centuries`;
  }
  if (eventName.includes('Winter Hexagon')) {
    return `❄️ Winter Hexagon forms when six bright stars create a massive asterism - Sirius, Rigel, Aldebaran, Capella, Pollux, and Procyon outline winter's stellar crown`;
  }

  // GALACTIC EVENTS - Deep space phenomena
  if (eventName.includes('Virgo Galaxy Cluster')) {
    return `🌌 Virgo Galaxy Cluster reaches optimal visibility containing over 1,300 galaxies including M87 with its supermassive black hole - the nearest large galaxy cluster to Earth`;
  }
  if (eventName.includes('Milky Way Center')) {
    return `🌠 Milky Way Center becomes most prominent when Sagittarius constellation rises highest - our galaxy's heart lies 26,000 light-years away behind dense star clouds and cosmic dust`;
  }
  if (eventName.includes('Andromeda Rising')) {
    return `🌌 Andromeda Galaxy rises to optimal viewing position as our nearest major galactic neighbor at 2.5 million light-years distance - on collision course with the Milky Way`;
  }

  // ZODIACAL PHENOMENA - Solar system dust
  if (eventName.includes('Zodiacal Light Dawn') || eventName.includes('Zodiacal Light Dusk')) {
    return `🌅 Zodiacal Light appears as a faint triangular glow extending from the horizon - sunlight scattered by interplanetary dust creates this ghostly pyramid best seen in dark skies`;
  }

  // GENERIC COSMIC FLOW - fallback with planetary context
  return `✨ Today's cosmic configuration features ${planets.sun.sign} Sun at ${Math.round(planets.sun.longitude)}° creating ${getSignDescription(planets.sun.sign)} themes while ${planets.moon.sign} Moon adds ${getSignDescription(planets.moon.sign)} emotional undertones`;
}

// Enhanced astrological aspects with glyphs - ALL 7 MAJOR ASPECTS + GREAT CONJUNCTIONS
function generateMainAstronomicalEvent(date: Date, planets: any): any {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // ALL 7 MAJOR ASTROLOGICAL ASPECTS with proper glyphs and meanings
  const aspects = [
    // GREAT CONJUNCTIONS - rarest and most powerful (priority 10)
    {
      name: 'Jupiter-Saturn Great Conjunction',
      energy: 'Era-Defining Alignment',
      priority: 10,
      aspect: 'great-conjunction',
      planetA: 'Jupiter',
      planetB: 'Saturn',
      signA: planets.jupiter.sign,
      signB: planets.saturn.sign
    },
    {
      name: 'Jupiter-Uranus Great Conjunction',
      energy: 'Revolutionary Expansion',
      priority: 10,
      aspect: 'great-conjunction',
      planetA: 'Jupiter',
      planetB: 'Uranus',
      signA: planets.jupiter.sign,
      signB: planets.uranus.sign
    },
    {
      name: 'Saturn-Neptune Great Conjunction',
      energy: 'Structure Meets Dreams',
      priority: 10,
      aspect: 'great-conjunction',
      planetA: 'Saturn',
      planetB: 'Neptune',
      signA: planets.saturn.sign,
      signB: planets.neptune.sign
    },
    
    // REGULAR CONJUNCTIONS - harmonious unity (priority 8)
    {
      name: 'Mercury-Venus conjunction',
      energy: 'Mind & Heart Unite',
      priority: 8,
      aspect: 'conjunction',
      planetA: 'Mercury',
      planetB: 'Venus',
      signA: planets.mercury.sign,
      signB: planets.venus.sign
    },
    {
      name: 'Sun-Mercury conjunction',
      energy: 'Clarity & Expression',
      priority: 8,
      aspect: 'conjunction',
      planetA: 'Sun',
      planetB: 'Mercury',
      signA: planets.sun.sign,
      signB: planets.mercury.sign
    },
    {
      name: 'Venus-Mars conjunction',
      energy: 'Love & Passion Unite',
      priority: 8,
      aspect: 'conjunction',
      planetA: 'Venus',
      planetB: 'Mars',
      signA: planets.venus.sign,
      signB: planets.mars.sign
    },
    {
      name: 'Sun-Jupiter conjunction',
      energy: 'Confidence & Expansion',
      priority: 8,
      aspect: 'conjunction',
      planetA: 'Sun',
      planetB: 'Jupiter',
      signA: planets.sun.sign,
      signB: planets.jupiter.sign
    },
    
    // TRINES - harmonious flow (priority 7)
    {
      name: 'Mars-Jupiter trine',
      energy: 'Action & Growth Flow',
      priority: 7,
      aspect: 'trine',
      planetA: 'Mars',
      planetB: 'Jupiter',
      signA: planets.mars.sign,
      signB: planets.jupiter.sign
    },
    {
      name: 'Venus-Neptune trine',
      energy: 'Love & Dreams Flow',
      priority: 7,
      aspect: 'trine',
      planetA: 'Venus',
      planetB: 'Neptune',
      signA: planets.venus.sign,
      signB: planets.neptune.sign
    },
    {
      name: 'Sun-Jupiter trine',
      energy: 'Confidence & Luck Flow',
      priority: 7,
      aspect: 'trine',
      planetA: 'Sun',
      planetB: 'Jupiter',
      signA: planets.sun.sign,
      signB: planets.jupiter.sign
    },
    
    // SEXTILES - cooperative opportunity (priority 6)
    {
      name: 'Mercury-Mars sextile',
      energy: 'Mind & Action Cooperate',
      priority: 6,
      aspect: 'sextile',
      planetA: 'Mercury',
      planetB: 'Mars',
      signA: planets.mercury.sign,
      signB: planets.mars.sign
    },
    {
      name: 'Venus-Jupiter sextile',
      energy: 'Beauty & Abundance Cooperate',
      priority: 6,
      aspect: 'sextile',
      planetA: 'Venus',
      planetB: 'Jupiter',
      signA: planets.venus.sign,
      signB: planets.jupiter.sign
    },
    
    // SQUARES - dynamic tension (priority 5)
    {
      name: 'Mars-Saturn square',
      energy: 'Drive vs Discipline',
      priority: 5,
      aspect: 'square',
      planetA: 'Mars',
      planetB: 'Saturn',
      signA: planets.mars.sign,
      signB: planets.saturn.sign
    },
    {
      name: 'Mercury-Neptune square',
      energy: 'Logic vs Intuition',
      priority: 5,
      aspect: 'square',
      planetA: 'Mercury',
      planetB: 'Neptune',
      signA: planets.mercury.sign,
      signB: planets.neptune.sign
    },
    
    // OPPOSITIONS - balance and awareness (priority 5)
    {
      name: 'Jupiter-Saturn opposition',
      energy: 'Growth vs Structure',
      priority: 5,
      aspect: 'opposition',
      planetA: 'Jupiter',
      planetB: 'Saturn',
      signA: planets.jupiter.sign,
      signB: planets.saturn.sign
    },
    {
      name: 'Venus-Mars opposition',
      energy: 'Love vs Desire',
      priority: 5,
      aspect: 'opposition',
      planetA: 'Venus',
      planetB: 'Mars',
      signA: planets.venus.sign,
      signB: planets.mars.sign
    },
    
    // QUINCUNX - adjustment and growth (priority 4)
    {
      name: 'Sun-Neptune quincunx',
      energy: 'Identity Adjusts to Vision',
      priority: 4,
      aspect: 'quincunx',
      planetA: 'Sun',
      planetB: 'Neptune',
      signA: planets.sun.sign,
      signB: planets.neptune.sign
    },
    {
      name: 'Mercury-Saturn quincunx',
      energy: 'Mind Adjusts to Structure',
      priority: 4,
      aspect: 'quincunx',
      planetA: 'Mercury',
      planetB: 'Saturn',
      signA: planets.mercury.sign,
      signB: planets.saturn.sign
    },
    
    // SEMI-SEXTILE - subtle opportunity (priority 3)
    {
      name: 'Mercury-Venus semi-sextile',
      energy: 'Mind & Heart Subtly Connect',
      priority: 3,
      aspect: 'semi-sextile',
      planetA: 'Mercury',
      planetB: 'Venus',
      signA: planets.mercury.sign,
      signB: planets.venus.sign
    },
    {
      name: 'Sun-Mars semi-sextile',
      energy: 'Identity & Action Gently Align',
      priority: 3,
      aspect: 'semi-sextile',
      planetA: 'Sun',
      planetB: 'Mars',
      signA: planets.sun.sign,
      signB: planets.mars.sign
    }
  ];
  
  // Select aspect based on day for variety, but prioritize higher aspects
  const sortedAspects = aspects.sort((a, b) => b.priority - a.priority);
  return sortedAspects[dayOfYear % sortedAspects.length];
}

// Generate brief, enticing cosmic highlights - ASPECTS AS MAIN, PLANETS SUCCINCT  
function generateCosmicHighlights(primaryEvent: any, planets: any, date: Date): string[] {
  const highlights = [];
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // MAIN EVENT - now aspects are main, so make them detailed
  if (primaryEvent.aspect) {
    // This is an astrological aspect - give detailed description
    const aspectDesc = {
      'great-conjunction': 'unite in rare era-defining alignment',
      'conjunction': 'unite energies in powerful alignment',
      'opposition': 'create dynamic tension requiring balance', 
      'trine': 'flow harmoniously supporting growth',
      'sextile': 'offer cooperative opportunities',
      'square': 'generate creative friction and motivation',
      'quincunx': 'adjust and realign for spiritual growth',
      'semi-sextile': 'create subtle opportunities for harmony'
    };
    highlights.push(`${primaryEvent.name} - ${primaryEvent.signA} and ${primaryEvent.signB} ${aspectDesc[primaryEvent.aspect] || 'interact cosmically'}`);
  } else {
    // Traditional astronomical events or moon phases
    highlights.push(getExpandedEventDescription(primaryEvent, planets));
  }
  
  // SECONDARY ASPECTS - use other aspects from the system, avoiding planets in main event
  const usedPlanets: string[] = [];
  if (primaryEvent.planetA) usedPlanets.push(primaryEvent.planetA.toLowerCase());
  if (primaryEvent.planetB) usedPlanets.push(primaryEvent.planetB.toLowerCase());
  
  // Secondary aspects that don't involve the same planets as primary event
  const secondaryAspects = [
    { name: 'Mercury-Mars sextile', planets: ['mercury', 'mars'], desc: 'Quick decisions and mental action' },
    { name: 'Venus-Jupiter trine', planets: ['venus', 'jupiter'], desc: 'Love and abundance flow' },
    { name: 'Sun-Neptune square', planets: ['sun', 'neptune'], desc: 'Identity meets spiritual vision' },
    { name: 'Mars-Saturn opposition', planets: ['mars', 'saturn'], desc: 'Drive balances with discipline' },
    { name: 'Mercury-Neptune square', planets: ['mercury', 'neptune'], desc: 'Logic challenges intuition' },
    { name: 'Venus-Uranus trine', planets: ['venus', 'uranus'], desc: 'Love meets innovation' },
    { name: 'Sun-Mars conjunction', planets: ['sun', 'mars'], desc: 'Will and action unite' },
    { name: 'Jupiter-Neptune sextile', planets: ['jupiter', 'neptune'], desc: 'Expansion supports dreams' }
  ];
  
  // Find aspects that don't conflict with primary event planets
  const availableAspects = secondaryAspects.filter(aspect => 
    !aspect.planets.some(planet => usedPlanets.includes(planet))
  );
  
  // Add a secondary aspect if available
  if (availableAspects.length > 0) {
    const chosenAspect = availableAspects[dayOfYear % availableAspects.length];
    highlights.push(`${chosenAspect.name} - ${chosenAspect.desc}`);
  } else {
    // Fallback if all aspects conflict - use constellation info
    highlights.push(`Current stellium in ${getMostPopulatedSign(planets)} concentrates planetary energy`);
  }

  // CONSTELLATION INGRESS - when planets enter new signs (avoid main event planets)
  const allIngressHighlights = [
    { planet: 'mercury', text: `Mercury enters ${planets.mercury.sign} - Communication style shifts` },
    { planet: 'venus', text: `Venus enters ${planets.venus.sign} - Relationship approach changes` },
    { planet: 'mars', text: `Mars enters ${planets.mars.sign} - Action patterns transform` },
    { planet: 'jupiter', text: `Jupiter enters ${planets.jupiter.sign} - Growth focus expands` },
    { planet: 'saturn', text: `Saturn enters ${planets.saturn.sign} - Structural themes mature` },
    { planet: 'uranus', text: `Uranus enters ${planets.uranus.sign} - Revolutionary changes begin` },
    { planet: 'neptune', text: `Neptune enters ${planets.neptune.sign} - Mystical themes deepen` }
  ];
  
  // Find ingress that doesn't involve main event planets
  const availableIngress = allIngressHighlights.filter(ingress => 
    !usedPlanets.includes(ingress.planet)
  );
  
  // Add ingress info that doesn't duplicate main event
  if (availableIngress.length > 0) {
    const chosenIngress = availableIngress[dayOfYear % availableIngress.length];
    highlights.push(chosenIngress.text);
  } else {
    // Fallback if all planets are used - use retrograde info
    highlights.push(`${getRetrogradePlanet(dayOfYear)} retrograde period brings review and reflection`);
  }
  
  return highlights;
}

// Helper function to convert planet names to Title Case
function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Enhanced guidance function with practical wisdom for each event type
function generateHoroscopeSnippet(primaryEvent: any, planets: any, targetDate: Date): string {
  const eventName = primaryEvent.name;
  
  // CONJUNCTION GUIDANCE - practical applications for each planetary combination
  if (primaryEvent.aspect === 'conjunction' || primaryEvent.aspect === 'great-conjunction') {
    const planetA = primaryEvent.planetA;
    const planetB = primaryEvent.planetB;
    const signA = primaryEvent.signA;
    const signB = primaryEvent.signB;
    
    if (eventName.includes('Mercury-Venus')) {
      return `Write, create, and communicate with grace today. Mercury-Venus in ${signA} enhances artistic expression and diplomatic conversations. Perfect timing for important emails, creative projects, or heart-to-heart discussions that require both logic and compassion.`;
    }
    if (eventName.includes('Sun-Mercury')) {
      return `Speak your truth with confidence and clarity. Sun-Mercury in ${signA} aligns your identity with your message. Ideal for presentations, interviews, important decisions, or any situation where authentic self-expression matters most.`;
    }
    if (eventName.includes('Venus-Mars')) {
      return `Balance passion with purpose in relationships and creative endeavors. Venus-Mars in ${signA} harmonizes desire with action. Take initiative in love, start artistic projects, or pursue goals that require both heart and courage.`;
    }
    if (eventName.includes('Jupiter-Saturn Great Conjunction')) {
      return `Build new foundations for long-term success. This historic conjunction in ${signA} reshapes your approach to growth and responsibility. Set ambitious but realistic goals, invest in education or property, and commit to changes that mature over decades.`;
    }
    if (eventName.includes('Sun-Jupiter')) {
      return `Step into leadership and expand your horizons. Sun-Jupiter in ${signA} brings opportunities for recognition and growth. Apply for promotions, start new ventures, travel, or take on teaching roles where your confidence can inspire others.`;
    }
    // Generic conjunction guidance
    return `Unite the energies of ${planetA} and ${planetB} in ${signA}. Focus initiatives that combine ${planetA.toLowerCase()} themes with ${planetB.toLowerCase()} energy. This alignment supports integrated approaches to personal growth and goal achievement.`;
  }
  
  // ASPECT GUIDANCE - practical applications for other aspects
  if (primaryEvent.aspect) {
    const aspectGuidance = {
      'trine': `Work with natural flow and effortless progress. This harmonious energy supports activities that align with your authentic self. Trust your instincts, collaborate with others, and allow opportunities to unfold organically.`,
      
      'sextile': `Network, collaborate, and seize cooperative opportunities. This supportive energy rewards teamwork and communication. Reach out to allies, join groups with shared interests, or start projects that benefit from diverse perspectives.`,
      
      'square': `Channel tension into breakthrough action. This dynamic energy motivates change through constructive challenge. Push through resistance, tackle difficult conversations, or use pressure as fuel for innovative solutions.`,
      
      'opposition': `Seek balance and integration between opposing forces. This energy highlights the need for compromise and perspective. Mediate conflicts, find middle ground in debates, or balance different aspects of your life for greater harmony.`,
      
      'quincunx': `Make subtle adjustments for spiritual growth. This energy calls for fine-tuning and adaptation. Pay attention to recurring patterns, adjust your approach slightly, or release outdated methods that no longer serve your evolution.`,
      
      'semi-sextile': `Notice gentle opportunities and quiet synchronicities. This subtle energy works behind the scenes. Trust your intuition, follow small signs, or plant seeds for future growth through patient, consistent action.`
    };
    
    return aspectGuidance[primaryEvent.aspect] || `Navigate today's planetary interaction with awareness and intention.`;
  }
  
  // MOON PHASE GUIDANCE - practical lunar applications
  if (eventName.includes('Full Moon') || eventName.includes('Harvest') || eventName.includes('Wolf') || eventName.includes('Snow')) {
    return `Harness peak lunar energy for completion and manifestation. This Full Moon in ${planets.moon.sign} amplifies emotions and intuition. Finish important projects, celebrate achievements, practice gratitude, or release what no longer serves your highest good.`;
  }
  if (eventName.includes('New Moon')) {
    return `Plant seeds of intention for new beginnings. This New Moon in ${planets.moon.sign} supports fresh starts and goal-setting. Write down intentions, start new habits, begin creative projects, or initiate conversations that open new possibilities.`;
  }
  if (eventName.includes('Quarter')) {
    return `Take decisive action and overcome obstacles. This Quarter Moon in ${planets.moon.sign} provides energy for important decisions. Address challenges directly, make necessary course corrections, or push through resistance with determined effort.`;
  }
  
  // ASTRONOMICAL EVENT GUIDANCE - seasonal and cosmic timing
  if (eventName.includes('Equinox') || eventName.includes('Solstice')) {
    return `Embrace seasonal transformation and cosmic timing. This celestial turning point supports major life transitions and new chapters. Set intentions aligned with natural cycles, adjust your daily rhythms, or make commitments that honor seasonal energy.`;
  }
  
  if (eventName.includes('Opposition') && !primaryEvent.aspect) {
    return `Observe celestial beauty and contemplate cosmic perspective. This astronomical event offers optimal viewing conditions and reminds us of our place in the universe. Spend time stargazing, practicing meditation, or gaining fresh perspective on earthly concerns.`;
  }
  
  if (eventName.includes('Meteors') || eventName.includes('Star')) {
    return `Make wishes and set intentions under cosmic messengers. This stellar event connects us to galactic energy and ancient wisdom. Practice manifestation techniques, spend time in nature, or use this cosmic window to align with your deepest desires.`;
  }
  
  // PLANETARY FOCUS GUIDANCE - when individual planets are primary
  if (eventName.includes('Venus Rising')) {
    return `Focus on relationships, beauty, and values. Venus energy supports love, creativity, and financial matters. Schedule romantic time, invest in art or beauty, negotiate partnerships, or clarify what truly matters to your heart.`;
  }
  if (eventName.includes('Mars Power')) {
    return `Channel energy into decisive action and courage. Mars energy supports initiative, competition, and bold moves. Start challenging projects, have difficult conversations, exercise vigorously, or take the first step toward ambitious goals.`;
  }
  if (eventName.includes('Jupiter Expansion')) {
    return `Expand your horizons and embrace growth opportunities. Jupiter energy supports learning, travel, and philosophical development. Take courses, explore new cultures, share knowledge, or invest in long-term growth strategies.`;
  }
  
  // FALLBACK - general cosmic guidance
  return `Navigate today's cosmic energies with intention and awareness. Pay attention to synchronicities, trust your intuition, and take inspired action that aligns with your authentic path and highest purpose.`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    targetDate = new Date();
  }
  
  const planets = getApproximatePlanetaryData(targetDate);
  const astronomicalEvents = getSignificantAstronomicalEvents(targetDate, planets);
  
  // Calculate moon phase with PRECISE TIMING AND ACCURATE EMOJIS
  const knownNewMoon = new Date('2024-08-04');
  const daysSinceNew = Math.floor((targetDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24));
  const lunarCycle = 29.530588853;
  const lunarDay = daysSinceNew % lunarCycle;

  let moonPhase;
  let isSignificant = false;

  if (lunarDay >= 0 && lunarDay < 0.5) {
    moonPhase = { name: 'New Moon', energy: 'New Beginnings', priority: 5, emoji: '🌑' }; // Only exact day
    isSignificant = true;
  } else if (lunarDay >= 7.3 && lunarDay < 7.8) {
    moonPhase = { name: 'First Quarter', energy: 'Action & Decision', priority: 5, emoji: '🌓' }; // Only exact day
    isSignificant = true;
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
    
    moonPhase = { name: moonName, energy: moonEnergy, priority: 8, emoji: '🌕' }; // Higher priority for named moons
    isSignificant = true;
  } else if (lunarDay >= 22.1 && lunarDay < 22.6) {
    moonPhase = { name: 'Third Quarter', energy: 'Release & Letting Go', priority: 5, emoji: '🌗' }; // Only exact day
    isSignificant = true;
  } else if (lunarDay < 7) {
    const dayPhase = Math.floor(lunarDay) + 1;
    moonPhase = { name: `Waxing Crescent (Day ${dayPhase})`, energy: 'Growing Energy', priority: 2, emoji: '🌒' };
    isSignificant = false;
  } else if (lunarDay < 14) {
    const dayPhase = Math.floor(lunarDay - 7) + 1;
    moonPhase = { name: `Waxing Gibbous (Day ${dayPhase})`, energy: 'Building Power', priority: 2, emoji: '🌔' };
    isSignificant = false;
  } else if (lunarDay < 22) {
    const dayPhase = Math.floor(lunarDay - 15) + 1;
    moonPhase = { name: `Waning Gibbous (Day ${dayPhase})`, energy: 'Gratitude & Wisdom', priority: 2, emoji: '🌖' };
    isSignificant = false;
  } else {
    const dayPhase = Math.floor(lunarDay - 22) + 1;
    moonPhase = { name: `Waning Crescent (Day ${dayPhase})`, energy: 'Rest & Reflection', priority: 2, emoji: '🌘' };
    isSignificant = false;
  }

  // Determine primary event - ASPECTS FIRST with high priority
  let allEvents = [...astronomicalEvents];

  // Add significant moon phases (Full, New, Quarters) as high-priority events
  if (isSignificant) {
    allEvents.push(moonPhase);
  }

  // ALWAYS generate and add main astrological aspect (higher priority than basic planetary)
  const mainAspect = generateMainAstronomicalEvent(targetDate, planets);
  allEvents.push(mainAspect);

  // Only add basic planetary events as absolute last resort if NO other events
  if (allEvents.length === 1 && allEvents[0] === mainAspect) {
    const dayOfWeek = targetDate.getDay();
    const planetaryEvents = [
      { name: 'Venus Rising', energy: 'Love & Beauty', priority: 1 }, // Lower priority
      { name: 'Mars Power', energy: 'Action & Courage', priority: 1 },
      { name: 'Jupiter Expansion', energy: 'Growth & Abundance', priority: 1 },
      { name: 'Mercury Clarity', energy: 'Communication', priority: 1 },
      { name: 'Saturn Focus', energy: 'Structure & Goals', priority: 1 },
      { name: 'Neptune Dreams', energy: 'Intuition & Vision', priority: 1 },
      { name: 'Uranus Innovation', energy: 'Change & Revolution', priority: 1 }
    ];

    if (dayOfWeek >= 0 && dayOfWeek < planetaryEvents.length) {
      allEvents.push(planetaryEvents[dayOfWeek]);
    }
  }

  // If still no events, add non-significant moon phase as last resort
  if (allEvents.length === 0) {
    allEvents.push(moonPhase);
  }

  allEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = allEvents[0] || { name: 'Cosmic Flow', energy: 'Universal Harmony', priority: 1 };
  
  // Generate unique post content
  const highlights = generateCosmicHighlights(primaryEvent, planets, targetDate);
  const horoscopeSnippet = generateHoroscopeSnippet(primaryEvent, planets, targetDate);
  
  // Calculate ACCURATE moon illumination percentage
  let illuminationPercent: number;
  if (lunarDay < 14.7) {
    // Waxing phase: 0% to 100%
    illuminationPercent = Math.round((lunarDay / 14.7) * 100);
  } else {
    // Waning phase: 100% to 0%
    illuminationPercent = Math.round(((29.53 - lunarDay) / 14.7) * 100);
  }
  
  // Ensure realistic bounds
  illuminationPercent = Math.max(0, Math.min(100, illuminationPercent));

  const moonNote = `${moonPhase.emoji} ${moonPhase.name} - ${illuminationPercent}% illuminated`;
  
  const postContent = {
    date: targetDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    primaryEvent: {
      name: primaryEvent.name,
      energy: primaryEvent.energy
    },
    highlights: [...highlights, moonNote], // Moon as final note
    horoscopeSnippet,
    callToAction: "Discover your personalized cosmic guidance at Lunary ✨"
  };
  
  return NextResponse.json(postContent);
} 