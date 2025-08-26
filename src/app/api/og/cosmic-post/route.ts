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

// Approximate planetary positions (for display purposes)
function getApproximatePlanetaryData(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
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
      longitude: (dayOfYear * 1.4) % 360,
      sign: getZodiacSign((dayOfYear * 1.4) % 360)
    },
    venus: {
      longitude: (dayOfYear * 0.7) % 360,
      sign: getZodiacSign((dayOfYear * 0.7) % 360)
    },
    mars: {
      longitude: (dayOfYear * 0.5) % 360,
      sign: getZodiacSign((dayOfYear * 0.5) % 360)
    },
    jupiter: {
      longitude: (dayOfYear * 0.08) % 360,
      sign: getZodiacSign((dayOfYear * 0.08) % 360)
    },
    saturn: {
      longitude: (dayOfYear * 0.033) % 360,
      sign: getZodiacSign((dayOfYear * 0.033) % 360)
    },
    uranus: {
      longitude: (dayOfYear * 0.012) % 360,
      sign: getZodiacSign((dayOfYear * 0.012) % 360)
    },
    neptune: {
      longitude: (dayOfYear * 0.006) % 360,
      sign: getZodiacSign((dayOfYear * 0.006) % 360)
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
    events.push({ name: 'Saturn Opposition', energy: 'Structure Illuminated', priority: 8 });
  }
  
  // LUNAR PHENOMENA - Traditional full moon names (Priority 7-8) - 1 day each
  if (month === 1 && day === 2) {
    events.push({ name: 'Wolf Moon', energy: 'Survival Instincts', priority: 8 });
  }
  if (month === 2 && day === 1) {
    events.push({ name: 'Snow Moon', energy: 'Inner Reflection', priority: 8 });
  }
  if (month === 3 && day === 2) {
    events.push({ name: 'Worm Moon', energy: 'Earth Awakening', priority: 8 });
  }
  if (month === 4 && day === 1) {
    events.push({ name: 'Pink Moon', energy: 'Blooming Potential', priority: 8 });
  }
  if (month === 5 && day === 1) {
    events.push({ name: 'Flower Moon', energy: 'Fertile Growth', priority: 8 });
  }
  if (month === 6 && day === 2) {
    events.push({ name: 'Strawberry Moon', energy: 'Sweet Abundance', priority: 8 });
  }
  if (month === 7 && day === 1) {
    events.push({ name: 'Buck Moon', energy: 'Wild Freedom', priority: 8 });
  }
  if (month === 8 && day === 1) {
    events.push({ name: 'Sturgeon Moon', energy: 'Ancient Wisdom', priority: 8 });
  }
  if (month === 9 && day === 1) {
    events.push({ name: 'Harvest Moon', energy: 'Abundance Gathering', priority: 8 });
  }
  if (month === 10 && day === 1) {
    events.push({ name: 'Hunter Moon', energy: 'Preparation Focus', priority: 8 });
  }
  if (month === 11 && day === 1) {
    events.push({ name: 'Beaver Moon', energy: 'Winter Preparation', priority: 8 });
  }
  if (month === 12 && day === 1) {
    events.push({ name: 'Cold Moon', energy: 'Inner Stillness', priority: 8 });
  }
  
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

  // PLANETARY EVENTS - when planets are primary (matching image API naming)
  if (eventName.includes('Venus Rising')) {
    return `♀ Venus Rising in ${planets.venus.sign} activates love, beauty, and values - this inner planet's 8-month cycle brings harmony to relationships and artistic expression`;
  }
  if (eventName.includes('Mars Power')) {
    return `♂ Mars Power in ${planets.mars.sign} drives action and courage - this red planet's 26-month cycle energizes initiative, competition, and bold decision-making`;
  }
  if (eventName.includes('Jupiter Expansion')) {
    return `♃ Jupiter Expansion in ${planets.jupiter.sign} amplifies growth and opportunity - this benefic giant's 12-year cycle governs wisdom, abundance, and philosophical development`;
  }
  if (eventName.includes('Mercury Clarity')) {
    return `☿ Mercury Clarity in ${planets.mercury.sign} sharpens communication and mental processing - this swift planet's 88-day cycle enhances learning, writing, and logical thinking`;
  }
  if (eventName.includes('Saturn Focus')) {
    return `♄ Saturn Focus in ${planets.saturn.sign} emphasizes structure and long-term goals - this taskmaster's 29-year cycle teaches discipline, responsibility, and authentic achievement`;
  }
  if (eventName.includes('Neptune Dreams')) {
    return `♆ Neptune Dreams in ${planets.neptune.sign} heightens intuition and spiritual vision - this outer planet's 165-year cycle dissolves boundaries and inspires transcendence`;
  }
  if (eventName.includes('Uranus Innovation')) {
    return `⛢ Uranus Innovation in ${planets.uranus.sign} sparks revolutionary change and breakthroughs - this disruptor's 84-year cycle brings unexpected liberation and technological advancement`;
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

// Generate brief, enticing cosmic highlights - PLANET & ALIGNMENT FOCUSED  
function generateCosmicHighlights(primaryEvent: any, planets: any, date: Date): string[] {
  const highlights = [];
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // PRIMARY EVENT - add expanded description instead of repetitive info
  highlights.push(getExpandedEventDescription(primaryEvent, planets));
  
  // PLANETARY POSITIONS - specific astronomical information
  const planetaryHighlights = [
    `☿ Mercury in ${planets.mercury.sign} at ${Math.round(planets.mercury.longitude)}° - Communication patterns shift`,
    `♀ Venus in ${planets.venus.sign} at ${Math.round(planets.venus.longitude)}° - Relationship dynamics activate`,
    `♂ Mars in ${planets.mars.sign} at ${Math.round(planets.mars.longitude)}° - Energy patterns intensify`,
    `♃ Jupiter in ${planets.jupiter.sign} at ${Math.round(planets.jupiter.longitude)}° - Growth opportunities emerge`,
    `♄ Saturn in ${planets.saturn.sign} at ${Math.round(planets.saturn.longitude)}° - Structure and discipline emphasized`,
    `♆ Neptune in ${planets.neptune.sign} at ${Math.round(planets.neptune.longitude)}° - Intuition and dreams heightened`
  ];

  // CONSTELLATION AND ALIGNMENT FOCUS
  const alignmentHighlights = [
    `Sun in ${planets.sun.sign} conjunction creates ${getSignDescription(planets.sun.sign)} energy patterns`,
    `Current stellium in ${getMostPopulatedSign(planets)} concentrates planetary energy`,
    `Mercury-Venus ${getAspectType(Math.abs(planets.mercury.longitude - planets.venus.longitude))} influences communication`,
    `Mars-Jupiter ${getAspectType(Math.abs(planets.mars.longitude - planets.jupiter.longitude))} affects action and expansion`,
    `Solar longitude ${Math.round(planets.sun.longitude)}° marks seasonal transition point`,
    `${getRetrogradePlanet(dayOfYear)} retrograde period brings review and reflection`
  ];
  
  // Then add planetary information
  if (primaryEvent.name.includes('Equinox')) {
    highlights.push(`🌍 ${primaryEvent.name} - Sun crosses celestial equator at 0° longitude`);
  } else if (primaryEvent.name.includes('Solstice')) {
    highlights.push(`☀️ ${primaryEvent.name} - Sun reaches maximum declination`);
  } else if (primaryEvent.name.includes('Meteors')) {
    highlights.push(`💫 ${primaryEvent.name} peak - Earth passes through cosmic debris field`);
  } else {
    // Use planetary highlight as secondary
    highlights.push(planetaryHighlights[dayOfYear % planetaryHighlights.length]);
  }
  
  // Add alignment information
  highlights.push(alignmentHighlights[(dayOfYear + 1) % alignmentHighlights.length]);
  
  // Add specific planetary aspect
  const aspectHighlights = [
    `Venus-Mars ${getAspectType(Math.abs(planets.venus.longitude - planets.mars.longitude))} creates tension in relationships`,
    `Sun-Mercury ${getAspectType(Math.abs(planets.sun.longitude - planets.mercury.longitude))} enhances mental clarity`,
    `Jupiter-Saturn ${getAspectType(Math.abs(planets.jupiter.longitude - planets.saturn.longitude))} tests growth vs limits`,
    `Mars-Neptune ${getAspectType(Math.abs(planets.mars.longitude - planets.neptune.longitude))} blends action with intuition`
  ];
  
  highlights.push(aspectHighlights[(dayOfYear + 2) % aspectHighlights.length]);
  
  return highlights;
}

// Helper functions for more specific content
function getSignDescription(sign: string): string {
  const descriptions: { [key: string]: string } = {
    'Aries': 'initiating and pioneering',
    'Taurus': 'stabilizing and grounding',
    'Gemini': 'communicative and adaptable', 
    'Cancer': 'nurturing and protective',
    'Leo': 'creative and expressive',
    'Virgo': 'analytical and perfecting',
    'Libra': 'harmonizing and balancing',
    'Scorpio': 'transformative and intense',
    'Sagittarius': 'expanding and philosophical',
    'Capricorn': 'structuring and ambitious',
    'Aquarius': 'innovative and humanitarian',
    'Pisces': 'intuitive and transcendent'
  };
  return descriptions[sign] || 'transformative';
}

function getAspectType(degrees: number): string {
  if (degrees < 8) return 'conjunction';
  if (degrees >= 82 && degrees <= 98) return 'square';
  if (degrees >= 172 && degrees <= 188) return 'opposition';
  if (degrees >= 112 && degrees <= 128) return 'trine';
  if (degrees >= 52 && degrees <= 68) return 'sextile';
  return 'aspect';
}

function getMostPopulatedSign(planets: any): string {
  const signs = Object.values(planets).map((p: any) => p.sign);
  const counts = signs.reduce((acc: any, sign) => {
    acc[sign] = (acc[sign] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function getRetrogradePlanet(dayOfYear: number): string {
  const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  return planets[dayOfYear % planets.length];
}

// Generate GUIDANCE snippet focused specifically on the main event
function generateHoroscopeSnippet(primaryEvent: any, planets: any, date: Date): string {
  const eventName = primaryEvent.name;

  // SEASONAL MARKERS - Guidance for major seasonal shifts
  if (eventName.includes('Spring Equinox')) {
    return `Today's perfect balance of light and dark invites you to find equilibrium in your own life. Use this powerful reset energy to plant seeds for new projects and release what no longer serves you.`;
  }
  if (eventName.includes('Summer Solstice')) {
    return `Peak solar energy today amplifies your personal power and vitality. Focus on celebrating achievements, expressing your authentic self, and channeling this abundant energy into meaningful action.`;
  }
  if (eventName.includes('Autumn Equinox')) {
    return `Today's harvest energy calls for gratitude and reflection on your year's growth. Take time to appreciate what you've accomplished and prepare for the introspective season ahead.`;
  }
  if (eventName.includes('Winter Solstice')) {
    return `The longest night brings inner light renewal. Focus on quiet contemplation, setting intentions for the returning light, and connecting with your deepest wisdom and intuition.`;
  }

  // CROSS-QUARTER DAYS - Ancient wisdom guidance
  if (eventName.includes('Imbolc')) {
    return `First stirrings of spring inspire new creative projects and fresh perspectives. Trust the subtle signs of growth in your life and nurture emerging ideas with patience and care.`;
  }
  if (eventName.includes('Beltane')) {
    return `Peak fertility energy supports passionate pursuits and creative collaboration. Embrace joy, celebrate life's abundance, and channel this vibrant energy into meaningful connections.`;
  }
  if (eventName.includes('Lughnasadh')) {
    return `First harvest time encourages you to appreciate your hard work and skills. Share your talents with others and celebrate the fruits of your dedication and perseverance.`;
  }
  if (eventName.includes('Samhain')) {
    return `The thinning veil between worlds enhances intuition and ancestral wisdom. Honor your roots, trust your inner knowing, and embrace transformation as a natural life cycle.`;
  }

  // METEOR SHOWERS - Cosmic inspiration guidance
  if (eventName.includes('Meteors')) {
    return `Cosmic debris creates celestial fireworks, inspiring breakthrough moments and divine downloads. Stay open to sudden insights, make wishes on shooting stars, and trust the universe's guidance.`;
  }

  // PLANETARY PHENOMENA - Specific guidance for planetary events
  if (eventName.includes('Earth Perihelion')) {
    return `Our closest approach to the Sun intensifies life force energy. Use this concentrated solar power to fuel your most important goals and strengthen your core vitality.`;
  }
  if (eventName.includes('Earth Aphelion')) {
    return `Maximum distance from the Sun encourages independence and self-reliance. Trust your inner strength, embrace solitude for reflection, and cultivate your unique gifts.`;
  }
  if (eventName.includes('Mercury Maximum Elongation')) {
    return `Mercury's greatest visibility enhances communication clarity and mental agility. Perfect time for important conversations, signing contracts, and making well-informed decisions.`;
  }
  if (eventName.includes('Venus Maximum Elongation')) {
    return `Venus shines brightest as the evening or morning star, amplifying love and beauty in your life. Focus on relationships, artistic pursuits, and appreciating life's pleasures.`;
  }
  if (eventName.includes('Mars Opposition')) {
    return `Mars at its closest approach energizes your warrior spirit and drive for achievement. Channel this powerful force constructively through physical activity, courage, and decisive action.`;
  }
  if (eventName.includes('Jupiter Opposition')) {
    return `Jupiter's optimal viewing position expands opportunities and philosophical understanding. Embrace growth, seek knowledge, and trust in life's abundant possibilities.`;
  }
  if (eventName.includes('Saturn Opposition')) {
    return `Saturn's maximum visibility illuminates life structures and long-term goals. Focus on discipline, responsibility, and building lasting foundations for your future success.`;
  }

  // TRADITIONAL FULL MOONS - Seasonal guidance
  if (eventName.includes('Wolf Moon')) {
    return `January's Wolf Moon awakens your survival instincts and pack loyalty. Trust your primal wisdom, strengthen family bonds, and courageously face winter challenges ahead.`;
  }
  if (eventName.includes('Snow Moon')) {
    return `February's Snow Moon invites deep introspection during the cold season. Use this quiet time for inner healing, releasing old patterns, and preparing for spring's renewal.`;
  }
  if (eventName.includes('Worm Moon')) {
    return `March's Worm Moon signals Earth's awakening and your own rebirth. Embrace new beginnings, plant seeds of intention, and trust the natural cycles of growth and renewal.`;
  }
  if (eventName.includes('Pink Moon')) {
    return `April's Pink Moon blooms with spring potential and fresh possibilities. Focus on growth, creativity, and nurturing the beautiful new projects emerging in your life.`;
  }
  if (eventName.includes('Flower Moon')) {
    return `May's Flower Moon celebrates fertility and abundant growth. Channel this creative energy into artistic pursuits, relationship building, and manifesting your heart's desires.`;
  }
  if (eventName.includes('Strawberry Moon')) {
    return `June's Strawberry Moon brings sweetness and summer abundance. Celebrate achievements, share joy with loved ones, and savor the fruits of your dedicated efforts.`;
  }
  if (eventName.includes('Buck Moon')) {
    return `July's Buck Moon inspires wild freedom and natural strength. Break free from limitations, embrace your authentic power, and boldly pursue your wildest dreams.`;
  }
  if (eventName.includes('Sturgeon Moon')) {
    return `August's Sturgeon Moon connects you with ancient wisdom and deep knowledge. Dive beneath surface appearances to discover profound truths and lasting insights.`;
  }
  if (eventName.includes('Harvest Moon')) {
    return `September's Harvest Moon illuminates the rewards of your hard work. Gather the fruits of your labor, express gratitude for abundance, and share your success generously.`;
  }
  if (eventName.includes('Hunter Moon')) {
    return `October's Hunter Moon sharpens your focus and strategic planning. Pursue goals with determined precision, prepare for challenges ahead, and trust your hunting instincts.`;
  }
  if (eventName.includes('Beaver Moon')) {
    return `November's Beaver Moon encourages industrious preparation for winter. Focus on building security, strengthening foundations, and creating warm, protective spaces for loved ones.`;
  }
  if (eventName.includes('Cold Moon')) {
    return `December's Cold Moon brings stillness and inner contemplation. Embrace the quiet season for reflection, meditation, and connecting with your deepest spiritual wisdom.`;
  }

  // STELLAR EVENTS - Star wisdom guidance
  if (eventName.includes('Sirius')) {
    return `The brightest star's return guides you toward your own brilliant potential. Focus on leadership, spiritual awakening, and shining your light to inspire others.`;
  }
  if (eventName.includes('Pleiades')) {
    return `The Seven Sisters cluster encourages sisterhood, collaboration, and collective wisdom. Work harmoniously with others and trust in the power of unified purpose.`;
  }
  if (eventName.includes('Regulus')) {
    return `The heart of the lion star amplifies courage and noble leadership. Step into your royal power, lead with integrity, and courageously pursue your highest calling.`;
  }

  // GALACTIC EVENTS - Cosmic perspective guidance
  if (eventName.includes('Milky Way')) {
    return `Our galaxy's heart becomes visible, expanding your cosmic perspective and spiritual connection. Meditate on your place in the universe and trust in divine timing.`;
  }
  if (eventName.includes('Andromeda')) {
    return `Our sister galaxy rises, reminding you of infinite possibilities beyond current limitations. Dream big, embrace cosmic consciousness, and trust in universal support.`;
  }

  // PLANETARY DAILY THEMES - Practical guidance
  if (eventName.includes('Venus Rising')) {
    return `Venus energy enhances love, beauty, and harmony today. Focus on relationships, creative expression, and bringing more beauty into your daily environment.`;
  }
  if (eventName.includes('Mars Power')) {
    return `Mars energy fuels courage, action, and determination today. Take bold steps toward your goals, exercise your body, and channel warrior energy constructively.`;
  }
  if (eventName.includes('Jupiter Expansion')) {
    return `Jupiter energy brings growth, optimism, and good fortune today. Embrace new opportunities, expand your horizons, and trust in life's abundant blessings.`;
  }
  if (eventName.includes('Mercury Clarity')) {
    return `Mercury energy sharpens communication and mental agility today. Perfect time for important conversations, learning new skills, and making clear decisions.`;
  }
  if (eventName.includes('Saturn Focus')) {
    return `Saturn energy supports discipline, structure, and long-term planning today. Focus on responsibilities, build solid foundations, and work steadily toward your goals.`;
  }
  if (eventName.includes('Neptune Dreams')) {
    return `Neptune energy enhances intuition, creativity, and spiritual connection today. Trust your dreams, meditate deeply, and follow your artistic inspirations.`;
  }
  if (eventName.includes('Uranus Innovation')) {
    return `Uranus energy sparks innovation, freedom, and breakthrough moments today. Embrace change, try new approaches, and trust your unique revolutionary spirit.`;
  }

  // DEFAULT - Universal guidance
  return `Today's cosmic alignment invites you to trust your inner wisdom and embrace the natural flow of life. Stay present, follow your intuition, and remain open to unexpected blessings.`;
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
  
  // Calculate moon phase (simplified version) - now just a note, not main focus unless significant
  const knownNewMoon = new Date('2024-08-04');
  const daysSinceNew = Math.floor((targetDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24));
  const lunarCycle = 29.530588853;
  const lunarDay = daysSinceNew % lunarCycle;

  let moonPhase;
  let isSignificant = false; // Only show moon phases when no other events exist

  if (lunarDay < 1) {
    moonPhase = { name: 'New Moon', energy: 'New Beginnings', priority: 1 }; // LOW priority
    isSignificant = false; // Never significant on its own
  } else if (lunarDay < 7.4) {
    const dayPhase = Math.floor(lunarDay) + 1;
    moonPhase = { name: `Waxing Crescent (Day ${dayPhase})`, energy: 'Growing Energy', priority: 1 };
    isSignificant = false; // Never significant on its own
  } else if (lunarDay < 9.2) {
    moonPhase = { name: 'First Quarter', energy: 'Decision Making', priority: 1 }; // LOW priority
    isSignificant = false; // Never significant on its own
  } else if (lunarDay < 14.8) {
    const dayPhase = Math.floor(lunarDay - 9) + 1;
    moonPhase = { name: `Waxing Gibbous (Day ${dayPhase})`, energy: 'Building Energy', priority: 1 };
    isSignificant = false;
  } else if (lunarDay < 16.2) {
    moonPhase = { name: 'Full Moon', energy: 'Peak Power', priority: 1 }; // LOW priority
    isSignificant = false; // Never significant on its own
  } else if (lunarDay < 22) {
    const dayPhase = Math.floor(lunarDay - 16) + 1;
    moonPhase = { name: `Waning Gibbous (Day ${dayPhase})`, energy: 'Gratitude & Wisdom', priority: 1 };
    isSignificant = false;
  } else if (lunarDay < 24) {
    moonPhase = { name: 'Third Quarter', energy: 'Release & Letting Go', priority: 1 }; // LOW priority
    isSignificant = false; // Never significant on its own
  } else {
    const dayPhase = Math.floor(lunarDay - 24) + 1;
    moonPhase = { name: `Waning Crescent (Day ${dayPhase})`, energy: 'Rest & Reflection', priority: 1 };
    isSignificant = false;
  }

  // Determine primary event - unique astronomical events take priority
  let allEvents = [...astronomicalEvents];

  // NEVER add calculated moon phases as primary events - only as fallback
  // The traditional moon names (Wolf Moon, Snow Moon, etc.) are already in astronomicalEvents with high priority

  // Add planetary event for current day if no astronomical events exist
  if (allEvents.length === 0) {
    const dayOfWeek = targetDate.getDay();
    const planetaryEvents = [
      { name: 'Venus Rising', energy: 'Love & Beauty', priority: 3 },
      { name: 'Mars Power', energy: 'Action & Courage', priority: 3 },
      { name: 'Jupiter Expansion', energy: 'Growth & Abundance', priority: 3 },
      { name: 'Mercury Clarity', energy: 'Communication', priority: 3 },
      { name: 'Saturn Focus', energy: 'Structure & Goals', priority: 2 },
      { name: 'Neptune Dreams', energy: 'Intuition & Vision', priority: 2 },
      { name: 'Uranus Innovation', energy: 'Change & Revolution', priority: 2 }
    ];

    if (dayOfWeek >= 0 && dayOfWeek < planetaryEvents.length) {
      allEvents.push(planetaryEvents[dayOfWeek]);
    }
  }

  // Only use moon phase as absolute last resort
  if (allEvents.length === 0) {
    allEvents.push(moonPhase);
  }

  allEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = allEvents[0] || { name: 'Cosmic Flow', energy: 'Universal Harmony', priority: 1 };
  
  // Generate unique post content
  const highlights = generateCosmicHighlights(primaryEvent, planets, targetDate);
  const horoscopeSnippet = generateHoroscopeSnippet(primaryEvent, planets, targetDate);
  
  // Add moon phase as a simple note (not main focus)
  const moonNote = `🌙 ${moonPhase.name} - ${Math.round(((lunarDay / lunarCycle) * 100) % 100)}% illuminated`;
  
  const postContent = {
    date: targetDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    primaryEvent: {
      name: primaryEvent.name,
      energy: primaryEvent.energy
    },
    highlights: [...highlights, moonNote], // Moon as final note
    horoscopeSnippet,
    callToAction: "✨ Get your personal cosmic analysis at lunary.app"
  };
  
  return NextResponse.json(postContent);
} 