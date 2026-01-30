/**
 * Calculate meaningful card frequency statistics
 */

export interface FrequencyStats {
  count: number;
  percentageOfReadings?: number; // What % of readings had this card
  percentageOfCards?: number; // What % of all cards drawn
  displayText: string; // Human-readable frequency
}

/**
 * Calculate card frequency based on available data
 */
export function calculateCardFrequency(
  cardCount: number,
  totalReadings?: number,
  totalCardsDrawn?: number,
): FrequencyStats {
  const stats: FrequencyStats = {
    count: cardCount,
    displayText: `Appeared ${cardCount}x`,
  };

  // If we know total readings, show percentage of readings
  if (totalReadings && totalReadings > 0) {
    const percentOfReadings = (cardCount / totalReadings) * 100;
    stats.percentageOfReadings = Math.round(percentOfReadings * 10) / 10;
    stats.displayText = `Appeared in ${cardCount} of ${totalReadings} readings`;

    if (percentOfReadings >= 10) {
      stats.displayText += ` (${Math.round(percentOfReadings)}%)`;
    }
  }
  // If we know total cards drawn, show as fraction
  else if (totalCardsDrawn && totalCardsDrawn > 0) {
    const percentOfCards = (cardCount / totalCardsDrawn) * 100;
    stats.percentageOfCards = Math.round(percentOfCards * 10) / 10;

    // Only show percentage if it's significant (>5%)
    if (percentOfCards >= 5) {
      stats.displayText += ` (${Math.round(percentOfCards)}%)`;
    }
  }

  return stats;
}

/**
 * Format frequency for display
 */
export function formatCardFrequency(
  cardCount: number,
  totalReadings?: number,
): string {
  if (!totalReadings || totalReadings === 0) {
    return `Appeared ${cardCount}x`;
  }

  const percentage = (cardCount / totalReadings) * 100;

  // If appeared in most readings, emphasize that
  if (percentage >= 80) {
    return `Appeared in ${cardCount} of ${totalReadings} readings (very frequent)`;
  } else if (percentage >= 50) {
    return `Appeared in ${cardCount} of ${totalReadings} readings (frequent)`;
  } else if (percentage >= 20) {
    return `Appeared in ${cardCount} of ${totalReadings} readings`;
  } else {
    return `Appeared ${cardCount}x`;
  }
}
