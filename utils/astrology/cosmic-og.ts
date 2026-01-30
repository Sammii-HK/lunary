// Import shared astronomical utilities
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  formatDegreeMinutes,
  getZodiacSign,
  checkSeasonalEvents,
  checkSignIngress,
  checkRetrogradeEvents,
  checkRetrogradeIngress,
  getSignDescription,
} from './astronomical-data';

// Export shared utilities for backward compatibility
export {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  getZodiacSign,
  checkSeasonalEvents,
  checkSignIngress,
  checkRetrogradeEvents,
  checkRetrogradeIngress,
  getSignDescription,
  formatDegreeMinutes,
};

// OG IMAGE-SPECIFIC FUNCTIONS ONLY (rendering symbols and fonts)

// Helper functions for image display
export function getPlanetSymbol(planetName: string): string {
  const symbols: { [key: string]: string } = {
    Sun: 'S',
    Moon: 'R',
    Mercury: 'T',
    Venus: 'Q',
    Mars: 'U',
    Jupiter: 'V',
    Saturn: 'W',
    Uranus: 'X',
    Neptune: 'Y',
    Pluto: 'Z',
  };
  return symbols[planetName] || 'S';
}

export function getZodiacSymbol(sign: string): string {
  const symbols: { [key: string]: string } = {
    Aries: 'A',
    Taurus: 'B',
    Gemini: 'C',
    Cancer: 'D',
    Leo: 'E',
    Virgo: 'F',
    Libra: 'G',
    Scorpio: 'H',
    Sagittarius: 'I',
    Capricorn: 'J',
    Aquarius: 'K',
    Pisces: 'L',
  };
  return symbols[sign] || 'A';
}

export function getAspectGlyph(aspect: string): string {
  const glyphs: { [key: string]: string } = {
    conjunction: '!',
    sextile: '%',
    square: '#',
    trine: '$',
    opposition: '"',
  };
  return glyphs[aspect] || '!';
}

// module-scope cache to avoid refetching
let astroFontP: Promise<ArrayBuffer> | null = null;
let robotoFontP: Promise<ArrayBuffer> | null = null;

// Font loading functions
export async function loadAstronomiconFont(request: Request) {
  if (!astroFontP) {
    const url = new URL('/fonts/Astronomicon.ttf', request.url);
    astroFontP = fetch(url, { cache: 'force-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Astronomicon fetch ${r.status}`);
      return r.arrayBuffer();
    });
  }
  return astroFontP;
}

export async function loadGoogleFont(request: Request) {
  if (!robotoFontP) {
    const url = new URL(`/fonts/RobotoMono-Regular.ttf`, request.url);
    robotoFontP = fetch(url, { cache: 'force-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Roboto Mono font fetch ${r.status}`);
      return r.arrayBuffer();
    });
  }
  return robotoFontP;
}

// Generate flowing horoscope-style guidance for ALL the day's events
export function generateDayGuidanceSummary(
  topEvents: any[],
  positions: any,
  moonPhase: any,
): string {
  const primaryEvent = topEvents[0];
  const secondaryEvents = topEvents.slice(1, 3);

  // Get current sun and moon signs for context
  const moonSign = positions.Moon.sign;

  // Start with more conversational, engaging guidance
  let guidance = '';

  if (primaryEvent.type === 'moon') {
    if (primaryEvent.name.includes('New')) {
      guidance = `The New Moon in ${moonSign} marks a powerful reset point for manifestation and new beginnings. This lunar phase offers optimal conditions for setting intentions and initiating projects aligned with your deeper purpose.`;
    } else if (
      primaryEvent.name.includes('Full') ||
      (primaryEvent.name.includes('Moon') &&
        !primaryEvent.name.includes('New') &&
        !primaryEvent.name.includes('Quarter'))
    ) {
      // This covers "Full Moon", "Hunter Moon", "Blood Moon", etc.
      guidance = `The ${primaryEvent.name} in ${moonSign} reaches peak illumination, highlighting completion and culmination. This phase brings clarity to what has been accomplished while revealing areas ready for release and transformation.`;
    } else if (primaryEvent.name.includes('Quarter')) {
      guidance = `The ${primaryEvent.name} in ${moonSign} presents a critical decision point in the lunar cycle. This dynamic phase supports decisive action and breakthrough moments that align with your authentic path.`;
    }
  } else if (primaryEvent.aspect) {
    const planetAName = primaryEvent.planetA?.name || primaryEvent.planetA;
    const planetBName = primaryEvent.planetB?.name || primaryEvent.planetB;

    if (primaryEvent.aspect === 'conjunction') {
      if (
        (planetAName === 'Saturn' && planetBName === 'Neptune') ||
        (planetAName === 'Neptune' && planetBName === 'Saturn')
      ) {
        guidance = `Saturn and Neptune form a rare conjunction, merging practical structure with mystical vision. This alignment supports giving tangible form to dreams while remaining receptive to spiritual guidance.`;
      } else if (
        (planetAName === 'Venus' && planetBName === 'Mars') ||
        (planetAName === 'Mars' && planetBName === 'Venus')
      ) {
        guidance = `Venus and Mars unite in conjunction, harmonizing the principles of love and action. This passionate alignment favors creative endeavors, romantic initiatives, and projects requiring both heart and courage.`;
      } else {
        guidance = `${planetAName} and ${planetBName} unite in conjunction, creating integrated opportunities for purposeful growth and aligned action.`;
      }
    } else if (primaryEvent.aspect === 'trine') {
      guidance = `${planetAName} forms a harmonious trine with ${planetBName}, creating effortless flow and natural synchronicity. This supportive aspect encourages trusting instincts and allowing opportunities to unfold organically.`;
    } else if (primaryEvent.aspect === 'square') {
      guidance = `${planetAName} forms a dynamic square with ${planetBName}, generating creative tension that can fuel breakthrough moments. This challenging aspect supports channeling resistance into constructive action and innovative solutions.`;
    } else if (primaryEvent.aspect === 'sextile') {
      guidance = `${planetAName} forms a supportive sextile with ${planetBName}, opening doors to collaborative opportunities and harmonious growth.`;
    } else if (primaryEvent.aspect === 'opposition') {
      guidance = `${planetAName} and ${planetBName} form an opposition, inviting balance between polarities and integration of complementary energies.`;
    }
  } else if (primaryEvent.type === 'seasonal') {
    guidance = `The ${primaryEvent.name} marks a significant turning point in the seasonal cycle. This celestial milestone invites alignment with natural rhythms and conscious engagement with transformative seasonal energies.`;
  } else {
    guidance = `Today's planetary configuration supports conscious evolution and spiritual growth through natural celestial rhythms.`;
  }

  // Add secondary events with informed perspective
  if (secondaryEvents.length > 0) {
    const secondaryGuidance: string[] = [];

    secondaryEvents.forEach((event) => {
      const evtPlanetA = event.planetA?.name || event.planetA;
      const evtPlanetB = event.planetB?.name || event.planetB;

      if (event.aspect === 'trine') {
        if (
          (evtPlanetA === 'Sun' && evtPlanetB === 'Moon') ||
          (evtPlanetA === 'Moon' && evtPlanetB === 'Sun')
        ) {
          secondaryGuidance.push('emotional and conscious alignment');
        } else if (
          (evtPlanetA === 'Moon' && evtPlanetB === 'Mercury') ||
          (evtPlanetA === 'Mercury' && evtPlanetB === 'Moon')
        ) {
          secondaryGuidance.push('enhanced intuitive communication');
        } else {
          secondaryGuidance.push('harmonious planetary flow');
        }
      } else if (event.aspect === 'sextile') {
        secondaryGuidance.push('cooperative planetary opportunities');
      } else if (event.aspect === 'square') {
        secondaryGuidance.push('dynamic growth-oriented tension');
      } else if (event.type === 'ingress') {
        secondaryGuidance.push('significant planetary transitions');
      }
    });

    if (secondaryGuidance.length > 0) {
      guidance += ` Additional cosmic currents include ${secondaryGuidance.join(' and ')}, creating a rich tapestry of astrological influences.`;
    }
  }

  // Add moon phase context if not primary
  if (primaryEvent.type !== 'moon') {
    if (moonPhase.illumination > 80) {
      guidance += ` The waxing lunar energy amplifies intentions and supports decisive action.`;
    } else if (moonPhase.illumination < 20) {
      guidance += ` The waning lunar phase encourages reflection and conscious release.`;
    } else {
      guidance += ` The current lunar phase supports steady progress and mindful development.`;
    }
  }

  return guidance;
}
