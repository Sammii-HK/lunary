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
      longitude: (dayOfYear * 0.033) % 360, // ~29.5 year orbit
      sign: getZodiacSign((dayOfYear * 0.033) % 360)
    },
    uranus: {
      longitude: (dayOfYear * 0.012) % 360, // ~84 year orbit  
      sign: getZodiacSign((dayOfYear * 0.012) % 360)
    },
    neptune: {
      longitude: (dayOfYear * 0.006) % 360, // ~165 year orbit
      sign: getZodiacSign((dayOfYear * 0.006) % 360)
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
  
  // MAJOR METEOR SHOWERS (Priority 8-9) - 1 day each
  if (month === 1 && day === 3) {
    events.push({ name: 'Quadrantid Meteors', emoji: '💫', energy: 'New Year Clarity', description: 'Sharp intense shower', detail: '40 meteors/hour from Boötes', priority: 9 });
  }
  if (month === 4 && day === 22) {
    events.push({ name: 'Lyrid Meteors', emoji: '🌟', energy: 'Spring Awakening', description: 'Ancient meteor shower', detail: 'From Comet Thatcher debris', priority: 8 });
  }
  if (month === 5 && day === 5) {
    events.push({ name: 'Eta Aquariid Meteors', emoji: '☄️', energy: 'Comet Wisdom', description: 'Halley\'s debris trail', detail: 'Swift pre-dawn meteors', priority: 8 });
  }
  if (month === 8 && day === 12) {
    events.push({ name: 'Perseid Meteors', emoji: '💫', energy: 'Cosmic Inspiration', description: 'Peak meteor shower', detail: 'Swift-Tuttle debris field', priority: 9 });
  }
  if (month === 10 && day === 8) {
    events.push({ name: 'Draconid Meteors', emoji: '🐉', energy: 'Dragon Fire', description: 'Evening meteor show', detail: 'From Comet Giacobini-Zinner', priority: 8 });
  }
  if (month === 10 && day === 21) {
    events.push({ name: 'Orionid Meteors', emoji: '🏹', energy: 'Hunter\'s Vision', description: 'Fast glowing trails', detail: 'Another Halley\'s gift', priority: 8 });
  }
  if (month === 11 && day === 17) {
    events.push({ name: 'Leonid Meteors', emoji: '🦁', energy: 'Cosmic Awakening', description: 'Legendary meteor storms', detail: 'Comet Tempel-Tuttle stream', priority: 8 });
  }
  if (month === 12 && day === 14) {
    events.push({ name: 'Geminid Meteors', emoji: '✨', energy: 'Divine Connection', description: 'Year\'s best meteor shower', detail: 'Asteroid 3200 Phaethon debris', priority: 9 });
  }
  if (month === 12 && day === 22) {
    events.push({ name: 'Ursid Meteors', emoji: '🐻', energy: 'Bear Spirit', description: 'Year-end celestial finale', detail: 'Comet Tuttle debris', priority: 8 });
  }

  // PLANETARY PHENOMENA (Priority 7-8) - 1 day each
  if (month === 1 && day === 4) {
    events.push({ name: 'Earth Perihelion', emoji: '🌍', energy: 'Closest Solar Bond', description: 'Nearest point to Sun', detail: '91.4 million miles distance', priority: 8 });
  }
  if (month === 7 && day === 5) {
    events.push({ name: 'Earth Aphelion', emoji: '🌍', energy: 'Solar Independence', description: 'Farthest from Sun', detail: '94.5 million miles distance', priority: 8 });
  }
  if (month === 3 && day === 17) {
    events.push({ name: 'Mercury Maximum Elongation', emoji: '☿', energy: 'Mental Clarity Peak', description: 'Best Mercury viewing', detail: '28° separation from Sun', priority: 7 });
  }
  if (month === 6 && day === 18) {
    events.push({ name: 'Venus Maximum Elongation', emoji: '♀', energy: 'Love\'s Greatest Reach', description: 'Brilliant morning/evening star', detail: '47° separation from Sun', priority: 7 });
  }
  if (month === 9 && day === 18) {
    events.push({ name: 'Mars Opposition', emoji: '♂', energy: 'Warrior\'s Strength', description: 'Red planet closest', detail: 'Magnitude -2.9 brightness', priority: 8 });
  }
  if (month === 11 && day === 3) {
    events.push({ name: 'Jupiter Opposition', emoji: '♃', energy: 'Expansion Peak', description: 'Giant planet optimal', detail: 'Cloud bands and moons visible', priority: 8 });
  }
  if (month === 8 && day === 27) {
    events.push({ name: 'Saturn Opposition', emoji: '♄', energy: 'Structure Illuminated', description: 'Ringed planet showcase', detail: 'Optimal ring visibility', priority: 8 });
  }

  // LUNAR PHENOMENA - Traditional full moon names (Priority 7-8) - 1 day each
  if (month === 1 && day === 2) {
    events.push({ name: 'Wolf Moon', emoji: '🐺', energy: 'Survival Instincts', description: 'January\'s full moon', detail: 'Hungry wolves howling', priority: 8 });
  }
  if (month === 2 && day === 1) {
    events.push({ name: 'Snow Moon', emoji: '❄️', energy: 'Inner Reflection', description: 'February\'s full moon', detail: 'Heavy snowfall season', priority: 8 });
  }
  if (month === 3 && day === 2) {
    events.push({ name: 'Worm Moon', emoji: '🪱', energy: 'Earth Awakening', description: 'March\'s full moon', detail: 'Earthworms emerge from thaw', priority: 8 });
  }
  if (month === 4 && day === 1) {
    events.push({ name: 'Pink Moon', emoji: '🌸', energy: 'Blooming Potential', description: 'April\'s full moon', detail: 'Pink phlox wildflowers', priority: 8 });
  }
  if (month === 5 && day === 1) {
    events.push({ name: 'Flower Moon', emoji: '🌺', energy: 'Fertile Growth', description: 'May\'s full moon', detail: 'Abundant spring blooms', priority: 8 });
  }
  if (month === 6 && day === 2) {
    events.push({ name: 'Strawberry Moon', emoji: '🍓', energy: 'Sweet Abundance', description: 'June\'s full moon', detail: 'Wild strawberry harvest', priority: 8 });
  }
  if (month === 7 && day === 1) {
    events.push({ name: 'Buck Moon', emoji: '🦌', energy: 'Wild Freedom', description: 'July\'s full moon', detail: 'Male deer grow antlers', priority: 8 });
  }
  if (month === 8 && day === 1) {
    events.push({ name: 'Sturgeon Moon', emoji: '🐟', energy: 'Ancient Wisdom', description: 'August\'s full moon', detail: 'Great Lakes sturgeon season', priority: 8 });
  }
  if (month === 9 && day === 1) {
    events.push({ name: 'Harvest Moon', emoji: '🌾', energy: 'Abundance Gathering', description: 'September\'s full moon', detail: 'Extra light for harvest', priority: 8 });
  }
  if (month === 10 && day === 1) {
    events.push({ name: 'Hunter Moon', emoji: '🏹', energy: 'Preparation Focus', description: 'October\'s full moon', detail: 'Time to hunt and store', priority: 8 });
  }
  if (month === 11 && day === 1) {
    events.push({ name: 'Beaver Moon', emoji: '🦫', energy: 'Winter Preparation', description: 'November\'s full moon', detail: 'Beavers prepare lodges', priority: 8 });
  }
  if (month === 12 && day === 1) {
    events.push({ name: 'Cold Moon', emoji: '❄️', energy: 'Inner Stillness', description: 'December\'s full moon', detail: 'Winter\'s longest nights', priority: 8 });
  }

  // STELLAR EVENTS (Priority 6-7) - 1 day each
  if (month === 1 && day === 12) {
    events.push({ name: 'Sirius Heliacal Rising', emoji: '⭐', energy: 'Dog Star Power', description: 'Brightest star returns', detail: 'Ancient flood predictor', priority: 7 });
  }
  if (month === 7 && day === 24) {
    events.push({ name: 'Regulus Solar Conjunction', emoji: '🦁', energy: 'Heart of Lion', description: 'Royal star alignment', detail: 'Behind the Sun meeting', priority: 7 });
  }
  if (month === 9 && day === 7) {
    events.push({ name: 'Spica Culmination', emoji: '🌾', energy: 'Harvest Star', description: 'Blue-white navigation star', detail: 'Evening peak position', priority: 6 });
  }
  if (month === 11 && day === 12) {
    events.push({ name: 'Pleiades Opposition', emoji: '✨', energy: 'Seven Sisters', description: 'Star cluster showcase', detail: '1,000+ hot young stars', priority: 7 });
  }
  if (month === 12 && day === 7) {
    events.push({ name: 'Aldebaran Maximum', emoji: '🔴', energy: 'Bull\'s Eye Focus', description: 'Red giant prominence', detail: 'Eye of Taurus peak', priority: 6 });
  }

  // GALACTIC EVENTS (Priority 6) - 1 day each
  if (month === 4 && day === 12) {
    events.push({ name: 'Virgo Galaxy Cluster', emoji: '🌌', energy: 'Cosmic Abundance', description: '1,300+ galaxies visible', detail: 'Nearest large cluster', priority: 6 });
  }
  if (month === 8 && day === 3) {
    events.push({ name: 'Milky Way Center', emoji: '🌠', energy: 'Galactic Heart', description: 'Galaxy center prominent', detail: '26,000 light-years away', priority: 6 });
  }
  if (month === 10 && day === 17) {
    events.push({ name: 'Andromeda Rising', emoji: '🌌', energy: 'Sister Galaxy', description: 'Nearest major galaxy', detail: '2.5 million light-years', priority: 6 });
  }

  // ZODIACAL PHENOMENA (Priority 6) - 1 day each
  if (month === 2 && day === 25) {
    events.push({ name: 'Zodiacal Light Dawn', emoji: '🌅', energy: 'Morning Pyramid', description: 'Pre-dawn dust glow', detail: 'Triangular interplanetary light', priority: 6 });
  }
  if (month === 9 && day === 25) {
    events.push({ name: 'Zodiacal Light Dusk', emoji: '🌅', energy: 'Evening Pyramid', description: 'Post-sunset dust display', detail: 'Triangular cosmic glow', priority: 6 });
  }
  
  // ADDITIONAL UNIQUE EVENTS (Priority 6-7) - 1 day each
  if (month === 1 && day === 15) {
    events.push({ name: 'Capella Transit', emoji: '⭐', energy: 'Charioteer\'s Guide', description: 'Sixth brightest star peak', detail: 'Northern navigation star', priority: 6 });
  }
  if (month === 2 && day === 15) {
    events.push({ name: 'Canopus Culmination', emoji: '🌟', energy: 'Southern Navigator', description: 'Second brightest star', detail: 'Southern hemisphere guide', priority: 6 });
  }
  if (month === 3 && day === 15) {
    events.push({ name: 'Vega Rising', emoji: '💫', energy: 'Future Pole Star', description: 'Next north star', detail: 'Will replace Polaris in 13,727 CE', priority: 6 });
  }
  if (month === 4 && day === 15) {
    events.push({ name: 'Arcturus Peak', emoji: '🐻', energy: 'Bear Guardian', description: 'Fourth brightest star', detail: 'Fast-moving orange giant', priority: 6 });
  }
  if (month === 5 && day === 15) {
    events.push({ name: 'Antares Opposition', emoji: '🔴', energy: 'Rival of Mars', description: 'Red supergiant showcase', detail: '700x Sun\'s diameter', priority: 7 });
  }
  if (month === 6 && day === 15) {
    events.push({ name: 'Vernal Point Transit', emoji: '📍', energy: 'Cosmic Coordinates', description: 'Celestial origin point', detail: 'Astronomical reference system', priority: 6 });
  }
  if (month === 7 && day === 15) {
    events.push({ name: 'Summer Triangle Peak', emoji: '🔺', energy: 'Stellar Navigation', description: 'Three-star asterism', detail: 'Vega, Altair, Deneb pattern', priority: 6 });
  }
  if (month === 8 && day === 15) {
    events.push({ name: 'Altair Culmination', emoji: '🦅', energy: 'Eagle\'s Flight', description: 'Nearby eagle star', detail: '16.7 light-years distant', priority: 6 });
  }
  if (month === 9 && day === 15) {
    events.push({ name: 'Fomalhaut Rising', emoji: '👁️', energy: 'Solitary Watcher', description: 'Southern autumn star', detail: 'Planet-forming debris disk', priority: 6 });
  }
  if (month === 10 && day === 15) {
    events.push({ name: 'Deneb Maximum', emoji: '🦢', energy: 'Swan\'s Tail', description: 'Most distant visible star', detail: '2,600 light-years away', priority: 6 });
  }
  if (month === 11 && day === 15) {
    events.push({ name: 'Polaris Alignment', emoji: '🧭', energy: 'True North Star', description: 'Current pole star', detail: 'Navigation reference point', priority: 6 });
  }
  if (month === 12 && day === 15) {
    events.push({ name: 'Winter Hexagon', emoji: '❄️', energy: 'Stellar Crown', description: 'Six-star winter pattern', detail: 'Massive seasonal asterism', priority: 7 });
  }
  
  return events;
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

  // Determine primary event - unique astronomical events take priority
  let allEvents = [...astronomicalEvents];

  // NEVER add calculated moon phases as primary events - only as fallback
  // The traditional moon names (Wolf Moon, Snow Moon, etc.) are already in astronomicalEvents with high priority

  // Add planetary event for current day if no astronomical events exist
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

  // Only use moon phase as absolute last resort
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
      { background: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)', accentColor: '#b19cd9' }, // Pastel purple
      { background: 'linear-gradient(135deg, #1a1a2e, #2d3561)', accentColor: '#87ceeb' }, // Pastel blue  
      { background: 'linear-gradient(135deg, #2c3e50, #34495e)', accentColor: '#dda0dd' }, // Pastel plum
      { background: 'linear-gradient(135deg, #1e2a3a, #2c3e50)', accentColor: '#87cefa' }, // Light sky blue
      { background: 'linear-gradient(135deg, #1a2332, #1e3c72)', accentColor: '#f0a0a0' }  // Pastel coral
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
            textAlign: 'center',
            maxWidth: '1000px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              color: theme.accentColor,
              marginBottom: '40px',
              letterSpacing: '3px',
              fontWeight: 'bold',
              textShadow: theme.textShadow,
            }}
          >
            LUNARY
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '60px',
              letterSpacing: '1px',
            }}
          >
            {dateStr}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '200px',
              marginBottom: '60px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
              color: Object.values(planetSymbols).includes(primaryEvent.emoji) ? 'white' : 'inherit',
            }}
          >
            {primaryEvent.emoji}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '30px',
              letterSpacing: '1px',
              textShadow: theme.textShadow,
              lineHeight: '1.1',
            }}
          >
            {primaryEvent.name}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              color: theme.accentColor,
              marginBottom: '30px',
              letterSpacing: '1px',
              fontWeight: '500',
            }}
          >
            {primaryEvent.energy}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: '0.5px',
              fontStyle: 'italic',
            }}
          >
            {primaryEvent.detail}
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
