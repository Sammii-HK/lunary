/**
 * Novelty context utilities for varying content
 */

import type { NoveltyContext } from './types';

/**
 * Hook style variations to rotate through
 */
const HOOK_STYLE_EXAMPLES = [
  'question (ask something specific)',
  'statement (make a bold, direct claim)',
  'scenario (describe a specific situation)',
  'contrarian take (challenge common assumptions)',
  'direct definition (clear, no fluff)',
  'observation (share something you noticed)',
];

/**
 * Build novelty instruction for AI prompt
 */
export const buildNoveltyInstruction = (context?: NoveltyContext): string => {
  if (!context) return '';
  const recent = (context.recentTexts || []).slice(-4);
  const openings = (context.recentOpenings || []).slice(-4);

  const lines: string[] = [];

  // Add variety requirements
  lines.push('VARIETY REQUIREMENTS:');
  lines.push(
    '- Your post MUST use a completely different angle than recent posts - not just rephrased versions',
  );
  lines.push(
    '- Alternate between: formal/casual, long/short, metaphorical/literal',
  );
  lines.push('- Never repeat the same sentence structure twice in a set');

  // Suggest a hook style to use
  const randomStyle =
    HOOK_STYLE_EXAMPLES[Math.floor(Math.random() * HOOK_STYLE_EXAMPLES.length)];
  lines.push(`- For this post, try using a ${randomStyle} approach`);

  if (recent.length > 0) {
    lines.push('');
    lines.push(
      'Recent posts to AVOID repeating (use completely different phrasing, structure, and angle):',
    );
    recent.forEach((text) => lines.push(`- "${text.slice(0, 100)}..."`));
  }

  if (openings.length > 0 && !recent.length) {
    lines.push('');
    lines.push('Recent openings to AVOID (use a different opening style):');
    openings.forEach((opening) => lines.push(`- "${opening}"`));
  }

  return lines.join('\n');
};
