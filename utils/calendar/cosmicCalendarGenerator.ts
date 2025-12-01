// Cosmic Calendar Generator - Creates iCal files with moon phases, retrogrades, and cosmic events
import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
  Illumination,
  MoonPhase,
} from 'astronomy-engine';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

export interface CosmicEvent {
  date: Date;
  type:
    | 'moon_phase'
    | 'retrograde_start'
    | 'retrograde_end'
    | 'sign_ingress'
    | 'major_aspect'
    | 'eclipse';
  title: string;
  description: string;
  planet?: string;
  sign?: string;
}

function formatDateForICS(date: Date): string {
  // ICS format: YYYYMMDDTHHmmssZ
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

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
  const index = Math.floor(longitude / 30);
  return signs[index];
}

function getPlanetaryPositions(date: Date): any {
  const astroTime = new AstroTime(date);
  const astroTimePast = new AstroTime(
    new Date(date.getTime() - 24 * 60 * 60 * 1000),
  );
  const astroTimePastPast = new AstroTime(
    new Date(date.getTime() - 24 * 60 * 60 * 1000 * 2),
  );

  const planets = [
    { body: Body.Mercury, name: 'Mercury' },
    { body: Body.Venus, name: 'Venus' },
    { body: Body.Mars, name: 'Mars' },
    { body: Body.Jupiter, name: 'Jupiter' },
    { body: Body.Saturn, name: 'Saturn' },
    { body: Body.Uranus, name: 'Uranus' },
    { body: Body.Neptune, name: 'Neptune' },
    { body: Body.Pluto, name: 'Pluto' },
  ];

  const positions: any = {};

  planets.forEach(({ body, name }) => {
    const vectorNow = GeoVector(body, astroTime, true);
    const vectorPast = GeoVector(body, astroTimePast, true);
    const vectorPastPast = GeoVector(body, astroTimePastPast, true);

    const eclipticNow = Ecliptic(vectorNow);
    const eclipticPast = Ecliptic(vectorPast);
    const eclipticPastPast = Ecliptic(vectorPastPast);

    const longitude = eclipticNow.elon;
    const longitudePast = eclipticPast.elon;
    const longitudePastPast = eclipticPastPast.elon;

    // Check for retrograde motion
    let retrograde = false;
    let newRetrograde = false;
    let newDirect = false;

    if (Math.abs(longitude - longitudePast) < 180) {
      retrograde = longitude < longitudePast;
      newRetrograde =
        longitude < longitudePast && longitudePast > longitudePastPast;
      newDirect =
        longitude > longitudePast && longitudePast < longitudePastPast;
    } else {
      retrograde = longitude > longitudePast;
      newRetrograde =
        longitude > longitudePast && longitudePast < longitudePastPast;
      newDirect =
        longitude < longitudePast && longitudePast > longitudePastPast;
    }

    positions[name] = {
      longitude,
      sign: getZodiacSign(longitude),
      retrograde,
      newRetrograde,
      newDirect,
    };
  });

  return positions;
}

function getMoonPhase(date: Date): {
  name: string;
  emoji: string;
  illumination: number;
} {
  const astroTime = new AstroTime(date);
  const moonIllumination = Illumination(Body.Moon, astroTime);
  const moonPhaseAngle = MoonPhase(date);

  const illuminationPercent = moonIllumination.phase_fraction * 100;

  if (moonPhaseAngle >= 355 || moonPhaseAngle <= 5) {
    return { name: 'New Moon', emoji: '🌑', illumination: illuminationPercent };
  } else if (moonPhaseAngle >= 85 && moonPhaseAngle <= 95) {
    return {
      name: 'First Quarter Moon',
      emoji: '🌓',
      illumination: illuminationPercent,
    };
  } else if (moonPhaseAngle >= 175 && moonPhaseAngle <= 185) {
    return {
      name: 'Full Moon',
      emoji: '🌕',
      illumination: illuminationPercent,
    };
  } else if (moonPhaseAngle >= 265 && moonPhaseAngle <= 275) {
    return {
      name: 'Last Quarter Moon',
      emoji: '🌗',
      illumination: illuminationPercent,
    };
  } else if (moonPhaseAngle > 5 && moonPhaseAngle < 85) {
    return {
      name: 'Waxing Crescent Moon',
      emoji: '🌒',
      illumination: illuminationPercent,
    };
  } else if (moonPhaseAngle > 95 && moonPhaseAngle < 175) {
    return {
      name: 'Waxing Gibbous Moon',
      emoji: '🌔',
      illumination: illuminationPercent,
    };
  } else if (moonPhaseAngle > 185 && moonPhaseAngle < 265) {
    return {
      name: 'Waning Gibbous Moon',
      emoji: '🌖',
      illumination: illuminationPercent,
    };
  } else {
    return {
      name: 'Waning Crescent Moon',
      emoji: '🌘',
      illumination: illuminationPercent,
    };
  }
}

function checkSignIngress(positions: any, date: Date): CosmicEvent[] {
  const events: CosmicEvent[] = [];
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
  ];

  planets.forEach(({ body, name }) => {
    const vectorNow = GeoVector(body, astroTime, true);
    const vectorPast = GeoVector(body, astroTimePast, true);

    const eclipticNow = Ecliptic(vectorNow);
    const eclipticPast = Ecliptic(vectorPast);

    const signNow = getZodiacSign(eclipticNow.elon);
    const signPast = getZodiacSign(eclipticPast.elon);

    if (signNow !== signPast) {
      events.push({
        date,
        type: 'sign_ingress',
        title: `${name} enters ${signNow}`,
        description: `${name} moves from ${signPast} into ${signNow}. This shift brings new energy and themes related to ${signNow}.`,
        planet: name,
        sign: signNow,
      });
    }
  });

  return events;
}

export async function generateCosmicCalendar(year: number): Promise<{
  events: CosmicEvent[];
  icsContent: string;
}> {
  const events: CosmicEvent[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  let currentDate = new Date(startDate);
  let lastMoonPhase = '';
  let lastPlanetStates: {
    [key: string]: { retrograde: boolean; sign: string };
  } = {};

  // Initialize planet states
  const initialPositions = getPlanetaryPositions(startDate);
  Object.keys(initialPositions).forEach((planet) => {
    lastPlanetStates[planet] = {
      retrograde: initialPositions[planet].retrograde,
      sign: initialPositions[planet].sign,
    };
  });

  // Scan through the year day by day
  while (currentDate <= endDate) {
    const positions = getPlanetaryPositions(currentDate);
    const moonPhase = getMoonPhase(currentDate);

    // Check for moon phase changes (only New, Full, First Quarter, Last Quarter)
    if (
      moonPhase.name !== lastMoonPhase &&
      (moonPhase.name.includes('New Moon') ||
        moonPhase.name.includes('Full Moon') ||
        moonPhase.name.includes('First Quarter') ||
        moonPhase.name.includes('Last Quarter'))
    ) {
      events.push({
        date: new Date(currentDate),
        type: 'moon_phase',
        title: `${moonPhase.emoji} ${moonPhase.name}`,
        description: `${moonPhase.name} - ${Math.round(moonPhase.illumination)}% illuminated. A powerful time for intention setting and ritual work.`,
      });
      lastMoonPhase = moonPhase.name;
    }

    // Check for retrograde changes
    Object.keys(positions).forEach((planet) => {
      const currentState = positions[planet];
      const lastState = lastPlanetStates[planet];

      if (currentState.newRetrograde && !lastState.retrograde) {
        events.push({
          date: new Date(currentDate),
          type: 'retrograde_start',
          title: `🔴 ${planet} Retrograde Begins`,
          description: `${planet} begins its retrograde motion in ${currentState.sign}. A time for reflection, review, and revisiting ${planet.toLowerCase()}-related themes.`,
          planet,
          sign: currentState.sign,
        });
        lastPlanetStates[planet] = {
          retrograde: true,
          sign: currentState.sign,
        };
      } else if (currentState.newDirect && lastState.retrograde) {
        events.push({
          date: new Date(currentDate),
          type: 'retrograde_end',
          title: `🟢 ${planet} Retrograde Ends`,
          description: `${planet} ends its retrograde motion and goes direct in ${currentState.sign}. Forward momentum returns for ${planet.toLowerCase()}-related matters.`,
          planet,
          sign: currentState.sign,
        });
        lastPlanetStates[planet] = {
          retrograde: false,
          sign: currentState.sign,
        };
      } else if (currentState.sign !== lastState.sign) {
        // Sign ingress (only for non-retrograde planets or when entering new sign)
        if (!currentState.retrograde || currentState.sign !== lastState.sign) {
          events.push({
            date: new Date(currentDate),
            type: 'sign_ingress',
            title: `${planet} enters ${currentState.sign}`,
            description: `${planet} moves into ${currentState.sign}, bringing new energy and themes.`,
            planet,
            sign: currentState.sign,
          });
          lastPlanetStates[planet] = {
            retrograde: currentState.retrograde,
            sign: currentState.sign,
          };
        }
      }
    });

    // Move to next day
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Generate ICS content
  const now = new Date();
  const icsContent = generateICSContent(year, events, now);

  return { events, icsContent };
}

function generateICSContent(
  year: number,
  events: CosmicEvent[],
  generatedAt: Date,
): string {
  const lines: string[] = [];

  // Calendar header (ICS format - compatible with iCal, Google Calendar, Outlook, and all major calendar apps)
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Lunary//Cosmic Calendar//EN');
  lines.push(`CALSCALE:GREGORIAN`);
  lines.push(`METHOD:PUBLISH`);
  lines.push(`X-WR-CALNAME:Lunary Cosmic Calendar ${year}`);
  lines.push(
    `X-WR-CALDESC:Cosmic events for ${year} - Moon phases, retrogrades, and planetary transits. Compatible with Apple Calendar (iCal), Google Calendar, Outlook, and all major calendar apps.`,
  );
  lines.push(`X-WR-TIMEZONE:UTC`);

  // Add events
  events.forEach((event) => {
    const startDate = formatDateForICS(event.date);
    const endDate = formatDateForICS(
      new Date(event.date.getTime() + 60 * 60 * 1000),
    ); // 1 hour duration

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.date.getTime()}@lunary.app`);
    lines.push(`DTSTART:${startDate}`);
    lines.push(`DTEND:${endDate}`);
    lines.push(`DTSTAMP:${formatDateForICS(generatedAt)}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    lines.push(`LOCATION:Earth`);
    lines.push(`STATUS:CONFIRMED`);
    lines.push(`SEQUENCE:0`);
    lines.push(`CATEGORIES:Cosmic Events`);
    lines.push('END:VEVENT');
  });

  // Calendar footer
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
