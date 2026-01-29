/**
 * Pattern description and formatting utilities
 */

import { PATTERN_TEMPLATES } from '../core/constants';
import type { PatternType, TimeWindow } from '../types';

/**
 * Generate user-friendly pattern description using templates
 */
export function formatPatternDescription(
  type: PatternType,
  data: Record<string, any>,
): string {
  const template = PATTERN_TEMPLATES[type];
  if (!template) {
    return 'Pattern detected in your cosmic activity';
  }

  try {
    return template(data);
  } catch (error) {
    console.error(`Error formatting pattern description for ${type}:`, error);
    return 'Pattern detected in your cosmic activity';
  }
}

/**
 * Format pattern title
 */
export function formatPatternTitle(
  type: PatternType,
  data: Record<string, any>,
): string {
  const titles: Record<string, (data: any) => string> = {
    tarot_moon_phase: (d) => `Tarot pulls during ${d.moonPhase}`,
    emotion_moon_phase: (d) => `${capitalize(d.emotion)} during ${d.moonPhase}`,
    tarot_planetary_position: (d) => `Tarot when ${d.planet} in ${d.sign}`,
    emotion_planetary_position: (d) =>
      `${capitalize(d.emotion)} when ${d.planet} in ${d.sign}`,
    tarot_planetary_aspect: (d) =>
      `Tarot during ${d.planet1}-${d.planet2} ${d.aspectType}`,
    emotion_planetary_aspect: (d) =>
      `${capitalize(d.emotion)} during ${d.planet1}-${d.planet2} ${d.aspectType}`,
    tarot_natal_transit: (d) =>
      `Tarot during ${d.transitingPlanet} ${d.aspectType} natal ${d.natalPlanet}`,
    emotion_natal_transit: (d) =>
      `${capitalize(d.emotion)} during ${d.transitingPlanet} ${d.aspectType} natal ${d.natalPlanet}`,
  };

  const titleFn = titles[type];
  if (!titleFn) {
    return 'Cosmic Pattern';
  }

  try {
    return titleFn(data);
  } catch (error) {
    console.error(`Error formatting pattern title for ${type}:`, error);
    return 'Cosmic Pattern';
  }
}

/**
 * Format time window as human-readable string
 */
export function formatTimeWindow(timeWindow: TimeWindow): string {
  const { startDate, endDate, daysAnalyzed } = timeWindow;

  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${start} - ${end} (${daysAnalyzed} days)`;
}

/**
 * Format confidence score as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(
  confidence: number,
): 'low' | 'medium' | 'high' | 'very-high' {
  if (confidence >= 0.9) return 'very-high';
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Capitalize first letter of string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format percentage with sign
 */
export function formatPercentageChange(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(0)}%`;
}

/**
 * Pluralize word based on count
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
