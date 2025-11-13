import {
  WeeklyCosmicData,
  PlanetaryHighlight,
  MajorAspect,
} from '../blog/weeklyContentGenerator';

export function generateExtendedPlanetaryAnalysis(
  data: WeeklyCosmicData,
): string {
  if (data.planetaryHighlights.length === 0) {
    return '## 🌟 Extended Planetary Analysis\n\nNo major planetary movements this week - a time for steady cosmic flow and integration of recent shifts.';
  }

  const analyses = data.planetaryHighlights.map((highlight) =>
    generatePlanetaryDeepDive(highlight),
  );

  return `## 🌟 Extended Planetary Analysis\n\n${analyses.join('\n\n')}`;
}

function generatePlanetaryDeepDive(highlight: PlanetaryHighlight): string {
  const dateStr = highlight.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  let analysis = `### ${highlight.planet} ${highlight.event.replace('-', ' ')}\n**${dateStr}**\n\n`;

  analysis += `${highlight.description}\n\n`;

  if (highlight.details.fromSign && highlight.details.toSign) {
    analysis += `**Sign Transition:** ${highlight.details.fromSign} → ${highlight.details.toSign}\n\n`;
    analysis += `This planetary shift from ${highlight.details.fromSign} to ${highlight.details.toSign} represents a significant change in how ${highlight.planet}'s energy manifests in our lives. `;
    analysis += `${highlight.details.fromSign} energy is ${getSignEnergy(highlight.details.fromSign)}, while ${highlight.details.toSign} brings ${getSignEnergy(highlight.details.toSign)}. `;
    analysis += `This transition invites us to ${getTransitionGuidance(highlight.details.fromSign, highlight.details.toSign)}.\n\n`;
  }

  analysis += `**Significance Level:** ${highlight.significance.toUpperCase()}\n\n`;

  analysis += `**Historical Context:** ${getHistoricalContext(highlight.planet, highlight.event)}\n\n`;

  analysis += `**Personal Impact:** ${getPersonalImpact(highlight.planet, highlight.event, highlight.significance)}\n\n`;

  return analysis;
}

export function generateDetailedTransitInterpretations(
  data: WeeklyCosmicData,
): string {
  if (data.majorAspects.length === 0) {
    return '## 🔄 Detailed Transit Interpretations\n\nNo major aspects this week - planets move independently, allowing for focused individual work.';
  }

  const interpretations = data.majorAspects.map((aspect) =>
    generateAspectInterpretation(aspect),
  );

  return `## 🔄 Detailed Transit Interpretations\n\n${interpretations.join('\n\n')}`;
}

function generateAspectInterpretation(aspect: MajorAspect): string {
  const dateStr = aspect.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  let interpretation = `### ${aspect.planetA} ${aspect.aspect} ${aspect.planetB}\n`;
  interpretation += `**${dateStr}${aspect.exactTime ? ` at ${aspect.exactTime}` : ''}**\n\n`;

  interpretation += `**Aspect Type:** ${aspect.aspect}\n\n`;
  interpretation += `**Significance:** ${aspect.significance.toUpperCase()}\n\n`;

  interpretation += `**Energetic Signature:** ${aspect.energy}\n\n`;

  interpretation += `**Orb Calculation:** ${calculateOrb(aspect.aspect)}\n\n`;

  interpretation += `**Guidance:** ${aspect.guidance}\n\n`;

  interpretation += `**How to Work With This Transit:**\n`;
  interpretation += getTransitWorkGuidance(aspect);

  return interpretation;
}

function getSignEnergy(sign: string): string {
  const energies: Record<string, string> = {
    Aries: 'fiery, assertive, and action-oriented',
    Taurus: 'grounded, sensual, and stable',
    Gemini: 'curious, communicative, and adaptable',
    Cancer: 'nurturing, emotional, and intuitive',
    Leo: 'creative, confident, and expressive',
    Virgo: 'analytical, practical, and detail-oriented',
    Libra: 'harmonious, diplomatic, and relationship-focused',
    Scorpio: 'intense, transformative, and deeply emotional',
    Sagittarius: 'adventurous, philosophical, and expansive',
    Capricorn: 'ambitious, disciplined, and structured',
    Aquarius: 'innovative, independent, and humanitarian',
    Pisces: 'dreamy, compassionate, and spiritually attuned',
  };
  return energies[sign] || 'unique and transformative';
}

function getTransitionGuidance(fromSign: string, toSign: string): string {
  return `shift from ${getSignEnergy(fromSign)} to ${getSignEnergy(toSign)}, embracing the new energetic qualities while honoring what we've learned`;
}

function getHistoricalContext(planet: string, event: string): string {
  const contexts: Record<string, string> = {
    'Mercury-enters-sign':
      'Mercury changes signs approximately every 3-4 weeks, creating regular shifts in communication and thought patterns.',
    'Venus-enters-sign':
      'Venus changes signs approximately every 3-4 weeks, influencing our values, relationships, and aesthetic preferences.',
    'Mars-enters-sign':
      'Mars changes signs approximately every 6-7 weeks, affecting our drive, energy, and how we take action.',
    'Jupiter-enters-sign':
      'Jupiter changes signs approximately once per year, bringing expansion and growth to new areas of life.',
    'Saturn-enters-sign':
      'Saturn changes signs approximately every 2.5 years, marking significant periods of structure and responsibility.',
    'goes-retrograde':
      "This retrograde period offers a chance to review, revise, and integrate lessons related to this planet's domain.",
    'goes-direct':
      'This direct station marks a shift from internal reflection to external action and forward movement.',
  };

  const key = `${planet}-${event}`;
  return (
    contexts[key] ||
    contexts[event] ||
    `This ${planet} ${event} represents a significant shift in cosmic energy patterns.`
  );
}

function getPersonalImpact(
  planet: string,
  event: string,
  significance: string,
): string {
  const planetDomains: Record<string, string> = {
    Mercury: 'communication, thinking, learning, and daily routines',
    Venus: 'relationships, values, beauty, and what we attract',
    Mars: 'action, desire, energy, and how we assert ourselves',
    Jupiter: 'expansion, growth, wisdom, and opportunities',
    Saturn: 'structure, responsibility, discipline, and long-term goals',
    Uranus: 'innovation, freedom, sudden changes, and awakening',
    Neptune: 'intuition, dreams, spirituality, and illusion',
    Pluto: 'transformation, power, regeneration, and deep change',
  };

  const domain = planetDomains[planet] || 'your cosmic experience';

  if (significance === 'extraordinary' || significance === 'high') {
    return `This transit will significantly impact ${domain}. Expect noticeable shifts and opportunities for growth. Pay attention to synchronicities and inner guidance during this period.`;
  } else if (significance === 'medium') {
    return `This transit will moderately influence ${domain}. While not dramatic, it offers opportunities for conscious alignment and intentional action.`;
  } else {
    return `This transit subtly influences ${domain}. It's a good time for gentle adjustments and awareness of the shifting energies.`;
  }
}

function calculateOrb(aspect: string): string {
  const orbs: Record<string, string> = {
    conjunction: '0° (exact alignment)',
    opposition: '180° ± 8°',
    trine: '120° ± 8°',
    square: '90° ± 8°',
    sextile: '60° ± 6°',
    quincunx: '150° ± 3°',
  };
  return orbs[aspect] || 'Standard orb applies';
}

function getTransitWorkGuidance(aspect: MajorAspect): string {
  const guidance: Record<string, string> = {
    conjunction:
      'Focus on integration and new beginnings. This is a powerful time to set intentions aligned with these planetary energies.',
    opposition:
      'Balance and integration are key. Work with both sides of this dynamic tension to find harmony.',
    trine:
      'This harmonious aspect supports flow and ease. Take action on projects and trust the natural support available.',
    square:
      'This challenging aspect requires conscious action. Face obstacles directly and use the tension as fuel for growth.',
    sextile:
      'Opportunities are available. Take practical steps toward your goals and be open to new connections.',
    quincunx:
      'Adjustment and fine-tuning are needed. Make small corrections and pay attention to details.',
  };

  return (
    guidance[aspect.aspect] ||
    'Work consciously with this transit, paying attention to how these planetary energies manifest in your life.'
  );
}
