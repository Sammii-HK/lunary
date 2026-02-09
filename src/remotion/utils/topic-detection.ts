import type { AudioSegment } from './timing';

/**
 * Detect which topic/planet/event is currently being discussed
 * based on the active subtitle segments at the current time
 */
export function detectCurrentTopic(
  currentTime: number,
  segments: AudioSegment[],
): string | null {
  // Find all active segments at current time (including forward context for persistence)
  const contextWindow = 5; // Look back/forward 5 seconds for full topic context
  const relevantSegments = segments.filter(
    (seg) =>
      seg.endTime >= currentTime - contextWindow &&
      seg.startTime <= currentTime + contextWindow,
  );

  if (relevantSegments.length === 0) {
    return null;
  }

  // Combine text from relevant segments
  const combinedText = relevantSegments
    .map((s) => s.text)
    .join(' ')
    .toLowerCase();

  // Priority 1: Detect specific planetary transits (e.g., "Saturn enters Aries")
  const planetTransitPattern =
    /(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\s+(enters?|moves? into|in)\s+(\w+)/i;
  const transitMatch = combinedText.match(planetTransitPattern);
  if (transitMatch) {
    const planet = transitMatch[1];
    const sign = transitMatch[3];
    return `${planet} enters ${sign}`;
  }

  // Priority 2: Detect aspects (e.g., "Venus square Saturn")
  const aspectPattern =
    /(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\s+(conjunction|conjunct|square|squares|trine|trines|opposition|opposite|sextile|sextiles)\s+(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)/i;
  const aspectMatch = combinedText.match(aspectPattern);
  if (aspectMatch) {
    const planet1 = aspectMatch[1];
    const aspect = aspectMatch[2].replace(/s$/, ''); // Remove plural
    const planet2 = aspectMatch[3];
    return `${planet1} ${aspect} ${planet2}`;
  }

  // Priority 3: Detect moon phases
  const moonPhasePattern =
    /(new moon|full moon|first quarter|last quarter|waxing crescent|waxing gibbous|waning crescent|waning gibbous)/i;
  const phaseMatch = combinedText.match(moonPhasePattern);
  if (phaseMatch) {
    // Check if there's a sign mentioned nearby
    const signPattern =
      /in\s+(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)/i;
    const signMatch = combinedText.match(signPattern);
    if (signMatch) {
      return `${phaseMatch[1]} in ${signMatch[1]}`;
    }
    return phaseMatch[1];
  }

  // Priority 4: Individual planets mentioned
  const planetPattern =
    /\b(saturn|jupiter|mars|venus|mercury|uranus|neptune|pluto)\b/i;
  const planetMatch = combinedText.match(planetPattern);
  if (planetMatch) {
    return planetMatch[1];
  }

  // Priority 5: Zodiac signs
  const signPattern =
    /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i;
  const signMatch = combinedText.match(signPattern);
  if (signMatch) {
    return signMatch[1];
  }

  return null;
}

/**
 * Detect if the current segment is the outro/conclusion
 * Returns true when keywords like "more context", "visit lunary", etc. are spoken
 */
export function isOutroSegment(
  currentTime: number,
  segments: AudioSegment[],
): boolean {
  const contextWindow = 2;
  const relevantSegments = segments.filter(
    (seg) =>
      seg.startTime <= currentTime &&
      seg.endTime >= currentTime - contextWindow,
  );

  if (relevantSegments.length === 0) {
    return false;
  }

  const combinedText = relevantSegments
    .map((s) => s.text)
    .join(' ')
    .toLowerCase();

  // Outro keywords
  const outroKeywords = [
    'more context',
    'full breakdown',
    'dive deeper',
    'visit lunary',
    'lunary.app',
    'birth chart',
    'personal insight',
    'further context',
    'learn more',
    'subscribe',
    'follow',
  ];

  return outroKeywords.some((keyword) => combinedText.includes(keyword));
}
