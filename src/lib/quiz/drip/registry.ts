import type { DripConfig } from './types';
import { chartRulerDripConfig } from './chart-ruler';

/**
 * Quiz drip registry.
 *
 * Each quiz that wants a personalised Day 2 / Day 5 sequence registers a
 * DripConfig here. The welcome-drip cron reads this registry and, for any
 * user with a recorded quiz claim, routes to that quiz's sequence instead
 * of the generic welcome drip.
 *
 * To add a new quiz:
 *   1. Create a new file in this folder (e.g. shadow-placement.ts)
 *   2. Export a DripConfig with quizSlug + day2 + day5 render functions
 *   3. Import it and add to the configs array below
 *
 * No cron changes needed — the dispatch loop is quiz-agnostic.
 */
const configs: DripConfig[] = [chartRulerDripConfig];

export function getDripConfig(quizSlug: string): DripConfig | null {
  return configs.find((c) => c.quizSlug === quizSlug) ?? null;
}

export function listRegisteredQuizSlugs(): string[] {
  return configs.map((c) => c.quizSlug);
}
