/**
 * Novelty context utilities for varying content
 */

import type { NoveltyContext } from './types';

/**
 * Build novelty instruction for AI prompt
 */
export const buildNoveltyInstruction = (context?: NoveltyContext): string => {
  if (!context) return '';
  const recent = (context.recentTexts || []).slice(-4);
  const openings = (context.recentOpenings || []).slice(-4);

  const lines: string[] = [];
  if (recent.length > 0) {
    lines.push(
      `For variety, here are recent posts - use different phrasing and angles:`,
    );
    recent.forEach((text) => lines.push(`• ${text.slice(0, 100)}`));
  }
  if (openings.length > 0 && !recent.length) {
    lines.push('Vary your opening from these recent ones:');
    openings.forEach((opening) => lines.push(`• ${opening}`));
  }
  return lines.length > 0 ? lines.join('\n') : '';
};
