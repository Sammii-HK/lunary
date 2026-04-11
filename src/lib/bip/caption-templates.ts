/**
 * Build in Public — Caption Templates
 *
 * Template-based caption generation with rotation. No AI dependency = fast,
 * reliable, zero cost. Templates are selected deterministically by hashing
 * the week label or milestone key so the same input always gives the same
 * output (no duplicates on Vercel retries).
 */

import type { VisibleMetric } from './metric-thresholds';

// ---------------------------------------------------------------------------
// Hash for deterministic rotation
// ---------------------------------------------------------------------------

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: string): T {
  return items[simpleHash(seed) % items.length];
}

// ---------------------------------------------------------------------------
// Weekly caption templates
// ---------------------------------------------------------------------------

const WEEKLY_HOOKS = [
  (hero: string, label: string) =>
    `Lunary hit ${hero} ${label} this week. No ads, just content.`,
  (hero: string, label: string) =>
    `${hero} ${label}. SEO is doing the heavy lifting right now.`,
  (hero: string, label: string, weekLabel: string) =>
    `${weekLabel.charAt(0).toUpperCase() + weekLabel.slice(1)}: ${hero} ${label} and the curve is still going up.`,
  (hero: string, label: string) =>
    `${hero} ${label} this week at Lunary. All organic.`,
  (hero: string, label: string) =>
    `Another week shipping Lunary. ${hero} ${label}, no paid acquisition.`,
  (hero: string, label: string) =>
    `${hero} ${label}. Turns out showing up every day compounds.`,
  (hero: string, label: string, weekLabel: string) =>
    `${weekLabel.charAt(0).toUpperCase() + weekLabel.slice(1)} and Lunary just crossed ${hero} ${label}.`,
  (hero: string, label: string) =>
    `Quiet week of building. ${hero} ${label} says it's working.`,
];

const WEEKLY_CLOSERS = [
  'What is your biggest growth channel right now?',
  'Anyone else finding SEO compounds faster than they expected?',
  'Still early days. What are you building?',
  'Curious what other indie founders are seeing for organic traffic.',
  'What is the one metric you actually care about?',
  'Would love to hear what is working for others right now.',
];

// ---------------------------------------------------------------------------
// Milestone caption templates
// ---------------------------------------------------------------------------

const MILESTONE_TEMPLATES = [
  (threshold: string, label: string) =>
    `${threshold} ${label}. No ads. No paid acquisition. Just content and patience.\n\nBuilding in public.`,
  (threshold: string, label: string) =>
    `Just crossed ${threshold} ${label}. Started from nothing. This is what showing up every day looks like.\n\nBuilding in public.`,
  (threshold: string, label: string) =>
    `Milestone: ${threshold} ${label}. Every one of these is organic.\n\nBuilding in public.`,
  (threshold: string, label: string) =>
    `${threshold} ${label}. Still processing that. SEO is a slow game until it isn't.\n\nBuilding in public.`,
  (threshold: string, label: string) =>
    `First time hitting ${threshold} ${label}. The compound effect is real.\n\nBuilding in public.`,
];

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export interface WeeklyCaptionInput {
  weekLabel: string;
  hero: VisibleMetric;
  visible: VisibleMetric[];
}

/**
 * Build a weekly BIP caption from templates.
 *
 * Structure:
 *   {hook with hero stat}
 *   {2-3 visible metric bullets}
 *   {closing question}
 */
export function buildWeeklyCaption(input: WeeklyCaptionInput): string {
  const { weekLabel, hero, visible } = input;

  // Hook line
  const hookFn = pick(WEEKLY_HOOKS, weekLabel);
  const hook = hookFn(hero.formatted, hero.label, weekLabel);

  // Bullet metrics (exclude the hero — it's already in the hook)
  const bullets = visible
    .filter((m) => m.key !== hero.key)
    .slice(0, 3)
    .map((m) => {
      const deltaStr =
        m.delta && m.delta !== 0
          ? ` (${m.delta > 0 ? '+' : ''}${m.delta}% WoW)`
          : '';
      return `${m.formatted} ${m.label}${deltaStr}`;
    });

  // Closer
  const closer = pick(WEEKLY_CLOSERS, weekLabel + '-closer');

  const lines = [hook, ''];
  for (const b of bullets) {
    lines.push(b);
  }
  if (bullets.length > 0) lines.push('');
  lines.push(closer);

  return lines.join('\n');
}

export interface MilestoneCaptionInput {
  metric: string;
  label: string;
  threshold: number;
  currentValue: number;
}

/**
 * Build a milestone celebration caption from templates.
 */
export function buildMilestoneCaption(input: MilestoneCaptionInput): string {
  const { metric, threshold } = input;
  const seed = `${metric}-${threshold}`;
  const templateFn = pick(MILESTONE_TEMPLATES, seed);
  return templateFn(threshold.toLocaleString('en-GB'), input.label);
}
