import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
  Illumination,
  MoonPhase,
} from 'astronomy-engine';

// Default observer location (London, UK)
const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// Get zodiac sign from longitude
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return signs[index];
}

// Get REAL planetary positions using astronomy-engine (SAME AS POST ROUTE)
function getRealPlanetaryPositions(
  date: Date,
  observer: Observer = DEFAULT_OBSERVER,
) {
  const astroTime = new AstroTime(date);
  const astroTimePast = new AstroTime(
    new Date(date.getTime() - 24 * 60 * 60 * 1000),
  );

  const planets = [
    { body: Body.Sun, name: 'Sun' },
    { body: Body.Moon, name: 'Moon' },
    { body: Body.Mercury, name: 'Mercury' },
    { body: Body.Venus, name: 'Venus' },
    { body: Body.Mars, name: 'Mars' },
    { body: Body.Jupiter, name: 'Jupiter' },
    { body: Body.Saturn, name: 'Saturn' },
    { body: Body.Uranus, name: 'Uranus' },
    { body: Body.Neptune, name: 'Neptune' },
  ];

  const positions: any = {};

  planets.forEach(({ body, name }) => {
    const vectorNow = GeoVector(body, astroTime, true);
    const vectorPast = GeoVector(body, astroTimePast, true);

    const eclipticNow = Ecliptic(vectorNow);
    const eclipticPast = Ecliptic(vectorPast);

    const longitude = eclipticNow.elon;
    const longitudePast = eclipticPast.elon;

    // Check for retrograde motion (accounting for 0°/360° wraparound)
    let retrograde = false;
    if (Math.abs(longitude - longitudePast) < 180) {
      retrograde = longitude < longitudePast;
    } else {
      retrograde = longitude > longitudePast;
    }

    positions[name] = {
      longitude,
      sign: getZodiacSign(longitude),
      retrograde,
    };
  });

  return positions;
}

// Calculate real aspects between planets (SAME AS POST ROUTE)
function calculateRealAspects(positions: any): Array<any> {
  const aspects: Array<any> = [];
  const planetNames = Object.keys(positions);

  // Check all planet pairs for aspects
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planetA = planetNames[i];
      const planetB = planetNames[j];

      const longA = positions[planetA].longitude;
      const longB = positions[planetB].longitude;

      // Calculate angular separation
      let separation = Math.abs(longA - longB);
      if (separation > 180) {
        separation = 360 - separation;
      }

      // Determine aspect type based on separation
      let aspectType = null;
      let priority = 0;

      if (separation < 8) {
        aspectType = 'conjunction';
        priority =
          (planetA === 'Jupiter' && planetB === 'Saturn') ||
          (planetA === 'Saturn' && planetB === 'Jupiter')
            ? 9
            : 7;
      } else if (Math.abs(separation - 60) < 6) {
        aspectType = 'sextile';
        priority = 5;
      } else if (Math.abs(separation - 90) < 8) {
        aspectType = 'square';
        priority = 6;
      } else if (Math.abs(separation - 120) < 8) {
        aspectType = 'trine';
        priority = 6;
      } else if (Math.abs(separation - 180) < 8) {
        aspectType = 'opposition';
        priority = 6;
      }

      if (aspectType) {
        aspects.push({
          name: `${planetA}-${planetB} ${aspectType}`,
          aspect: aspectType,
          glyph: getAspectGlyph(aspectType),
          planetA: {
            name: planetA,
            symbol: getPlanetSymbol(planetA),
            planet: planetA.toLowerCase(),
            constellation: positions[planetA].sign,
            constellationSymbol: getZodiacSymbol(positions[planetA].sign),
          },
          planetB: {
            name: planetB,
            symbol: getPlanetSymbol(planetB),
            planet: planetB.toLowerCase(),
            constellation: positions[planetB].sign,
            constellationSymbol: getZodiacSymbol(positions[planetB].sign),
          },
          energy: `${planetA} ${aspectType} ${planetB}`,
          priority,
          separation: Math.round(separation * 10) / 10,
        });
      }
    }
  }

  return aspects.sort((a, b) => b.priority - a.priority);
}

// Helper functions for image display
function getPlanetSymbol(planetName: string): string {
  const symbols: { [key: string]: string } = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
  };
  return symbols[planetName] || '☉';
}

function getZodiacSymbol(sign: string): string {
  const symbols: { [key: string]: string } = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
  };
  return symbols[sign] || '♈';
}

function getAspectGlyph(aspect: string): string {
  const glyphs: { [key: string]: string } = {
    conjunction: '!',
    sextile: '%',
    square: '#',
    trine: '$',
    opposition: '"',
  };
  return glyphs[aspect] || '!';
}

// Calculate accurate moon phase using proper astronomy-engine functions
function getAccurateMoonPhase(date: Date): {
  name: string;
  energy: string;
  priority: number;
  emoji: string;
  illumination: number;
  age: number;
  isSignificant: boolean;
} {
  const astroTime = new AstroTime(date);
  const moonIllumination = Illumination(Body.Moon, astroTime);
  const moonPhaseAngle = MoonPhase(date); // This gives us the phase angle in degrees

  const illuminationPercent = moonIllumination.phase_fraction * 100;

  // Convert phase angle to moon age (0-29.53 days)
  // 0° = New Moon, 90° = First Quarter, 180° = Full Moon, 270° = Third Quarter
  const moonAge = (moonPhaseAngle / 360) * 29.530588853;

  // Determine moon phase based on angle with proper tolerances
  if (moonPhaseAngle >= 355 || moonPhaseAngle <= 5) {
    // New Moon: 355° - 5° (around 0°)
    return {
      name: 'New Moon',
      energy: 'New Beginnings',
      priority: 10,
      emoji: '🌑',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else if (moonPhaseAngle >= 85 && moonPhaseAngle <= 95) {
    // First Quarter: 85° - 95° (around 90°)
    return {
      name: 'First Quarter',
      energy: 'Action & Decision',
      priority: 10,
      emoji: '🌓',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else if (moonPhaseAngle >= 175 && moonPhaseAngle <= 185) {
    // Full Moon: 175° - 185° (around 180°)
    const month = date.getMonth() + 1;
    const moonNames: { [key: number]: string } = {
      1: 'Wolf Moon',
      2: 'Snow Moon',
      3: 'Worm Moon',
      4: 'Pink Moon',
      5: 'Flower Moon',
      6: 'Strawberry Moon',
      7: 'Buck Moon',
      8: 'Sturgeon Moon',
      9: 'Harvest Moon',
      10: 'Hunter Moon',
      11: 'Beaver Moon',
      12: 'Cold Moon',
    };
    const moonName = moonNames[month] || 'Full Moon';
    return {
      name: moonName,
      energy: 'Peak Power',
      priority: 10,
      emoji: '🌕',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else if (moonPhaseAngle >= 265 && moonPhaseAngle <= 275) {
    // Third Quarter: 265° - 275° (around 270°)
    return {
      name: 'Third Quarter',
      energy: 'Release & Letting Go',
      priority: 10,
      emoji: '🌗',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else {
    // Non-significant phases based on angle ranges
    if (moonPhaseAngle > 5 && moonPhaseAngle < 85) {
      return {
        name: 'Waxing Crescent',
        energy: 'Growing Energy',
        priority: 2,
        emoji: '🌒',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    } else if (moonPhaseAngle > 95 && moonPhaseAngle < 175) {
      return {
        name: 'Waxing Gibbous',
        energy: 'Building Power',
        priority: 2,
        emoji: '🌔',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    } else if (moonPhaseAngle > 185 && moonPhaseAngle < 265) {
      return {
        name: 'Waning Gibbous',
        energy: 'Gratitude & Wisdom',
        priority: 2,
        emoji: '🌖',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    } else {
      return {
        name: 'Waning Crescent',
        energy: 'Rest & Reflection',
        priority: 2,
        emoji: '🌘',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    }
  }
}

// Check for seasonal events (SAME AS POST ROUTE)
function checkSeasonalEvents(positions: any): Array<any> {
  const sunLongitude = positions.Sun.longitude;
  const events: Array<any> = [];

  // Exact seasonal markers (within 1 degree)
  if (Math.abs(sunLongitude - 0) < 1 || Math.abs(sunLongitude - 360) < 1) {
    events.push({
      name: 'Spring Equinox',
      energy: 'Balance & New Growth',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '🌸',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 0° - Spring begins',
    });
  } else if (Math.abs(sunLongitude - 90) < 1) {
    events.push({
      name: 'Summer Solstice',
      energy: 'Maximum Solar Power',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '☀️',
      description: 'Longest day of the year',
      detail: 'Solar longitude 90° - Peak solar energy',
    });
  } else if (Math.abs(sunLongitude - 180) < 1) {
    events.push({
      name: 'Autumn Equinox',
      energy: 'Harvest & Reflection',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '🍂',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 180° - Autumn begins',
    });
  } else if (Math.abs(sunLongitude - 270) < 1) {
    events.push({
      name: 'Winter Solstice',
      energy: 'Inner Light & Renewal',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '❄️',
      description: 'Longest night of the year',
      detail: 'Solar longitude 270° - Return of the light',
    });
  }

  return events;
}

// Font loading functions
async function loadAstronomiconFont() {
  try {
    const fs = require('fs');
    const path = require('path');
    const fontPath = path.join(
      process.cwd(),
      'src',
      'fonts',
      'Astronomicon.ttf',
    );
    const fontData = fs.readFileSync(fontPath);
    return fontData;
  } catch (error) {
    console.error('Failed to load Astronomicon font:', error);
    return null;
  }
}

async function loadGoogleFont(font: string, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/,
    );

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) {
        return await response.arrayBuffer();
      }
    }

    throw new Error('failed to load font data');
  } catch (error) {
    console.error('Failed to load Google font:', error);
    return null;
  }
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

  // Get REAL astronomical data (SAME AS POST ROUTE)
  const positions = getRealPlanetaryPositions(targetDate);
  const moonPhase = getAccurateMoonPhase(targetDate);
  const seasonalEvents = checkSeasonalEvents(positions);
  const aspects = calculateRealAspects(positions);

  // Determine primary event using SAME PRIORITY as post route
  let allEvents: Array<any> = [];

  // 1. MOON PHASES (Priority 10)
  if (moonPhase.isSignificant) {
    allEvents.push({
      name: moonPhase.name,
      energy: moonPhase.energy,
      priority: 10,
      type: 'moon',
      emoji: moonPhase.emoji,
    });
  }

  // 2. EXTRAORDINARY PLANETARY EVENTS (Priority 9)
  const extraordinaryAspects = aspects.filter((a) => a.priority >= 9);
  allEvents.push(...extraordinaryAspects);

  // 3. DAILY ASPECTS (Priority 5-7)
  const dailyAspects = aspects.filter((a) => a.priority < 9);
  allEvents.push(...dailyAspects);

  // 4. SEASONAL EVENTS (Priority 8)
  allEvents.push(...seasonalEvents);

  // 5. Cosmic flow fallback
  if (allEvents.length === 0) {
    allEvents.push({
      name: 'Cosmic Flow',
      energy: 'Universal Harmony',
      priority: 1,
      type: 'general',
    });
  }

  // Sort by priority
  allEvents.sort((a, b) => b.priority - a.priority);

  // CYCLING LOGIC: Always prioritize moon phases and equinoxes, but cycle through other events
  let primaryEvent;

  // Check for highest priority events (moon phases, equinoxes) - ALWAYS show these
  const highPriorityEvents = allEvents.filter((e) => e.priority >= 10);
  if (highPriorityEvents.length > 0) {
    primaryEvent = highPriorityEvents[0];
  } else {
    // For lower priority events, cycle through them for variety
    const dayOfYear = Math.floor(
      (targetDate.getTime() -
        new Date(targetDate.getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const availableEvents =
      allEvents.length > 0
        ? allEvents
        : [
            {
              name: 'Cosmic Flow',
              energy: 'Universal Harmony',
              priority: 1,
              type: 'general',
            },
          ];

    // Use day of year + hour to cycle through available events for more variety
    const hour = targetDate.getHours();
    const cycleIndex = (dayOfYear + hour) % availableEvents.length;
    primaryEvent = availableEvents[cycleIndex];
  }

  // Get dynamic visual theme
  const daysSinceEpoch = Math.floor(
    targetDate.getTime() / (1000 * 60 * 60 * 24),
  );
  const dayVariation = daysSinceEpoch % 5;
  const themes = [
    {
      background: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
      accent: '#b19cd9',
    },
    {
      background: 'linear-gradient(135deg, #1a1a2e, #2d3561)',
      accent: '#87ceeb',
    },
    {
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      accent: '#dda0dd',
    },
    {
      background: 'linear-gradient(135deg, #1e2a3a, #2c3e50)',
      accent: '#87cefa',
    },
    {
      background: 'linear-gradient(135deg, #1a2332, #1e3c72)',
      accent: '#f0a0a0',
    },
  ];

  const theme = {
    ...themes[dayVariation],
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
  };

  // Format date for display
  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  // Check event types for layout
  const isAspectEvent =
    primaryEvent.planetA && primaryEvent.planetB && primaryEvent.aspect;
  const isAstronomicalEvent =
    !isAspectEvent &&
    primaryEvent.emoji &&
    primaryEvent.description &&
    !primaryEvent.name.includes('Moon');
  const isMoonPhaseEvent = !isAspectEvent && primaryEvent.name.includes('Moon');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: theme.background,
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
          justifyContent: 'space-between',
        }}
      >
        {/* Event Title */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '40px',
            paddingTop: '100px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              fontFamily: 'Roboto Mono',
            }}
          >
            {primaryEvent.name}
          </div>
        </div>

        {isAspectEvent ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'stretch',
              width: '100%',
              flex: 1,
              padding: '0 200px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '200px',
                width: '100%',
                height: '90%',
              }}
            >
              {/* Planet A Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '50px',
                  }}
                >
                  {(primaryEvent as any).planetA.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '180px',
                    height: '180px',
                    borderRadius: '20px',
                    marginBottom: '70px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '222px',
                      color: 'white',
                      lineHeight: '1',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {(primaryEvent as any).planetA.symbol}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: '300',
                      color: 'white',
                      fontFamily: 'Roboto Mono',
                      paddingBottom: '10px',
                    }}
                  >
                    {(primaryEvent as any).planetA.constellation}
                  </div>
                  <div
                    style={{
                      fontSize: '72px',
                      color: 'white',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {(primaryEvent as any).planetA.constellationSymbol}
                  </div>
                </div>
              </div>

              {/* Aspect Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  flex: 1,
                  height: '400px',
                  marginTop: '-78px',
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    fontFamily: 'Roboto Mono',
                  }}
                >
                  {(primaryEvent as any).aspect?.replace('-', ' ') ||
                    'Conjunction'}
                </div>
                <div
                  style={{
                    fontSize: '222px',
                    color: 'white',
                    lineHeight: '1',
                    width: '180px',
                    height: '180px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Astronomicon',
                    marginBottom: '150px',
                    marginTop: '75px',
                  }}
                >
                  {(primaryEvent as any).glyph || '!'}
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    fontFamily: 'Roboto Mono',
                  }}
                >
                  {formattedDate}
                </div>
              </div>

              {/* Planet B Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '50px',
                  }}
                >
                  {(primaryEvent as any).planetB.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '180px',
                    height: '180px',
                    borderRadius: '20px',
                    marginBottom: '70px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '222px',
                      color: 'white',
                      lineHeight: '1',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {(primaryEvent as any).planetB.symbol}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: '300',
                      color: 'white',
                      fontFamily: 'Roboto Mono',
                      paddingBottom: '10px',
                    }}
                  >
                    {(primaryEvent as any).planetB.constellation}
                  </div>
                  <div
                    style={{
                      fontSize: '72px',
                      color: 'white',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {(primaryEvent as any).planetB.constellationSymbol}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isAstronomicalEvent ? (
          // Seasonal Event Layout
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '80px',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '200px', color: 'white', lineHeight: '1' }}>
              {primaryEvent.emoji}
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
                maxWidth: '800px',
                lineHeight: '1.2',
              }}
            >
              {primaryEvent.energy}
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
                maxWidth: '900px',
                lineHeight: '1.3',
                opacity: '0.9',
              }}
            >
              {primaryEvent.description}
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
              }}
            >
              {formattedDate}
            </div>
          </div>
        ) : isMoonPhaseEvent ? (
          // Moon Phase Layout with Constellation
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '60px',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '200px',
                color: 'white',
                lineHeight: '1',
              }}
            >
              {primaryEvent.emoji || moonPhase.emoji}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '36px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
                maxWidth: '800px',
                lineHeight: '1.2',
              }}
            >
              {primaryEvent.energy}
            </div>
            {/* Moon Constellation Display */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '300',
                  color: 'white',
                  fontFamily: 'Roboto Mono',
                  textAlign: 'center',
                }}
              >
                Moon in {positions.Moon.sign}
              </div>
              <div
                style={{
                  fontSize: '80px',
                  color: 'white',
                  fontFamily: 'Astronomicon',
                  lineHeight: '1',
                }}
              >
                {getZodiacSymbol(positions.Moon.sign)}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '28px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
              }}
            >
              {formattedDate}
            </div>
          </div>
        ) : (
          // Fallback Layout - Cosmic Flow
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '80px',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '200px',
                color: 'white',
                lineHeight: '1',
                fontFamily: 'Astronomicon',
              }}
            >
              R
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '36px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
              }}
            >
              {primaryEvent.energy || 'Universal Harmony'}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '28px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
              }}
            >
              {formattedDate}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: '300',
            color: 'white',
            letterSpacing: '1px',
            marginBottom: '40px',
          }}
        >
          lunary.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: [
        {
          name: 'Astronomicon',
          data: (await loadAstronomiconFont()) || new ArrayBuffer(0),
          style: 'normal',
        },
        {
          name: 'Roboto Mono',
          data: await loadGoogleFont(
            'Roboto+Mono:wght@300;400;700',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /.:',
          ),
          style: 'normal',
        },
      ],
    },
  );
}
