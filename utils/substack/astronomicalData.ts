import { WeeklyCosmicData, MajorAspect } from '../blog/weeklyContentGenerator';
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

export function formatAstronomicalData(data: WeeklyCosmicData): string {
  if (data.majorAspects.length === 0 && data.planetaryHighlights.length === 0) {
    return '## 🔬 Behind-the-Scenes Astronomical Data\n\nStandard cosmic conditions apply this week.';
  }

  const sections: string[] = [];

  sections.push('## 🔬 Behind-the-Scenes Astronomical Data\n');
  sections.push('*Technical details for astronomy enthusiasts*\n');

  if (data.majorAspects.length > 0) {
    sections.push(formatAspectCalculations(data.majorAspects));
  }

  if (data.planetaryHighlights.length > 0) {
    sections.push(formatPlanetaryPositions(data));
  }

  if (data.moonPhases.length > 0) {
    sections.push(formatMoonPhaseCalculations(data.moonPhases));
  }

  sections.push(formatEphemerisData(data));

  return sections.join('\n\n');
}

function formatAspectCalculations(aspects: MajorAspect[]): string {
  let output = '### Aspect Calculations\n\n';

  aspects.forEach((aspect) => {
    const date = aspect.date;
    const time = new AstroTime(date);

    try {
      const planetAPos = getPlanetPosition(aspect.planetA, time);
      const planetBPos = getPlanetPosition(aspect.planetB, time);

      if (planetAPos && planetBPos) {
        const angle = calculateAngle(planetAPos, planetBPos);
        const expectedAngle = getExpectedAngle(aspect.aspect);

        output += `**${aspect.planetA} ${aspect.aspect} ${aspect.planetB}**\n`;
        output += `- Calculated Angle: ${angle.toFixed(2)}°\n`;
        output += `- Expected Angle: ${expectedAngle}°\n`;
        output += `- Orb: ${Math.abs(angle - expectedAngle).toFixed(2)}°\n`;
        output += `- ${aspect.planetA} Position: ${planetAPos.longitude.toFixed(2)}°\n`;
        output += `- ${aspect.planetB} Position: ${planetBPos.longitude.toFixed(2)}°\n`;
        output += `- Exact Time: ${aspect.exactTime || date.toISOString()}\n\n`;
      }
    } catch (error) {
      output += `**${aspect.planetA} ${aspect.aspect} ${aspect.planetB}**\n`;
      output += `- Aspect Type: ${aspect.aspect}\n`;
      output += `- Date: ${date.toLocaleDateString()}\n\n`;
    }
  });

  return output;
}

function formatPlanetaryPositions(data: WeeklyCosmicData): string {
  let output = '### Planetary Positions\n\n';
  output += '*Positions at week start*\n\n';

  const weekStart = new AstroTime(data.weekStart);
  const planets = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
  ];

  planets.forEach((planetName) => {
    try {
      const position = getPlanetPosition(planetName, weekStart);
      if (position) {
        const sign = getSignFromLongitude(position.longitude);
        output += `**${planetName}:**\n`;
        output += `- Longitude: ${position.longitude.toFixed(2)}°\n`;
        output += `- Sign: ${sign}\n`;
        output += `- Degree in Sign: ${(position.longitude % 30).toFixed(2)}°\n\n`;
      }
    } catch (error) {
      // Skip planets that can't be calculated
    }
  });

  return output;
}

function formatMoonPhaseCalculations(phases: any[]): string {
  let output = '### Moon Phase Calculations\n\n';

  phases.forEach((phase) => {
    const date = phase.date;
    const time = new AstroTime(date);

    try {
      const illumination = Illumination(Body.Moon, time);
      const moonPhase = MoonPhase(time);

      output += `**${phase.phase} - ${date.toLocaleDateString()}**\n`;
      output += `- Illumination: ${(illumination.phase * 100).toFixed(1)}%\n`;
      output += `- Phase Angle: ${illumination.angle.toFixed(2)}°\n`;
      output += `- Calculated Phase: ${moonPhase}\n`;
      output += `- Moon Sign: ${phase.sign}\n\n`;
    } catch (error) {
      output += `**${phase.phase} - ${date.toLocaleDateString()}**\n`;
      output += `- Moon Sign: ${phase.sign}\n\n`;
    }
  });

  return output;
}

function formatEphemerisData(data: WeeklyCosmicData): string {
  let output = '### Ephemeris Data\n\n';
  output += '*Key astronomical events*\n\n';

  output += `**Week Range:** ${data.weekStart.toLocaleDateString()} - ${data.weekEnd.toLocaleDateString()}\n\n`;

  output += `**Major Events Count:**\n`;
  output += `- Planetary Highlights: ${data.planetaryHighlights.length}\n`;
  output += `- Major Aspects: ${data.majorAspects.length}\n`;
  output += `- Moon Phases: ${data.moonPhases.length}\n`;
  output += `- Retrograde Changes: ${data.retrogradeChanges.length}\n\n`;

  output += `**Observer Location:** Greenwich, UK (51.4769°N, 0.0005°E)\n`;
  output += `*Note: Positions calculated for this location. Adjust for your local coordinates.*\n`;

  return output;
}

function getPlanetPosition(
  planetName: string,
  time: AstroTime,
): { longitude: number } | null {
  try {
    const bodyMap: Record<string, Body> = {
      Sun: Body.Sun,
      Moon: Body.Moon,
      Mercury: Body.Mercury,
      Venus: Body.Venus,
      Mars: Body.Mars,
      Jupiter: Body.Jupiter,
      Saturn: Body.Saturn,
      Uranus: Body.Uranus,
      Neptune: Body.Neptune,
      Pluto: Body.Pluto,
    };

    const body = bodyMap[planetName];
    if (!body) return null;

    const vector = GeoVector(body, time, false);
    const ecliptic = Ecliptic(vector);

    return {
      longitude: ecliptic.lon * (180 / Math.PI),
    };
  } catch (error) {
    return null;
  }
}

function calculateAngle(
  pos1: { longitude: number },
  pos2: { longitude: number },
): number {
  let angle = Math.abs(pos1.longitude - pos2.longitude);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

function getExpectedAngle(aspect: string): number {
  const angles: Record<string, number> = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
    quincunx: 150,
  };
  return angles[aspect] || 0;
}

function getSignFromLongitude(longitude: number): string {
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
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}
