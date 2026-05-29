/**
 * @jest-environment node
 *
 * VITAL OP #9 - Free-chart funnel (#270).
 *
 * The free-chart preview (/free-chart, no account needed) is the low-commitment
 * top of the funnel. PR #270 wired it in two places:
 *
 *   1. The contextual-nudge `previewHref` ("see a free preview") is attached to
 *      ONLY the 4 info-hub types where a cold reader is looking at chart-shaped
 *      content — planets, houses, aspects, transits — and always points to
 *      /free-chart. Every other hub keeps the signup-first CTA with no preview.
 *   2. The birth-chart hero adds a free-preview CTA pointing to /free-chart.
 *
 * These tests pin both the data invariant (config) and that getContextualNudge
 * surfaces previewHref through to the renderer, plus structural guards on the
 * render component and the birth-chart hero. No network, no DB.
 */
import * as fs from 'fs';
import * as path from 'path';
import nudgesConfig from '@/constants/contextual-nudges.json';
import {
  getContextualNudge,
  getContextualHub,
} from '@/lib/grimoire/getContextualNudge';

const readSource = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');

type NudgeEntry = { previewHref?: string; href?: string };
type Config = {
  ctaNudges: Record<string, NudgeEntry[]>;
  rules: { match: string; hub: string }[];
};
const config = nudgesConfig as unknown as Config;

const HUBS_WITH_PREVIEW = ['planets', 'houses', 'aspects', 'transits'];

describe('VITAL #9 free-chart preview is scoped to exactly the 4 info hubs', () => {
  const hubsWithPreview = Object.entries(config.ctaNudges)
    .filter(([, entries]) => entries.some((n) => Boolean(n.previewHref)))
    .map(([hub]) => hub)
    .sort();

  it('only planets/houses/aspects/transits carry a previewHref', () => {
    expect(hubsWithPreview).toEqual([...HUBS_WITH_PREVIEW].sort());
  });

  it('every previewHref on those hubs points to /free-chart (no other route)', () => {
    for (const hub of HUBS_WITH_PREVIEW) {
      const previews = config.ctaNudges[hub]
        .map((n) => n.previewHref)
        .filter(Boolean);
      expect(previews.length).toBeGreaterThan(0);
      for (const href of previews) {
        expect(href).toBe('/free-chart');
      }
    }
  });

  it('no OTHER hub leaks a free-preview CTA (signup-first stays intact)', () => {
    for (const [hub, entries] of Object.entries(config.ctaNudges)) {
      if (HUBS_WITH_PREVIEW.includes(hub)) continue;
      const anyPreview = entries.some((n) => Boolean(n.previewHref));
      expect(anyPreview).toBe(false);
    }
  });
});

describe('VITAL #9 getContextualNudge surfaces previewHref for the info hubs', () => {
  it('a planets path resolves the planets hub and exposes /free-chart preview', () => {
    const hub = getContextualHub('/grimoire/astronomy/planets/mars');
    expect(hub).toBe('planets');
    const nudge = getContextualNudge('/grimoire/astronomy/planets/mars');
    expect(nudge.hub).toBe('planets');
    expect(nudge.previewHref).toBe('/free-chart');
  });

  it.each(['houses', 'aspects', 'transits'])(
    'the %s hub exposes a /free-chart previewHref through getContextualNudge',
    (hub) => {
      // Drive selection deterministically across every variant in the pool so a
      // single non-preview variant cannot slip through.
      const pool = config.ctaNudges[hub];
      for (let seed = 0; seed < pool.length + 3; seed += 1) {
        const nudge = getContextualNudge(`/grimoire/${hub}`, `seed-${seed}`);
        expect(nudge.hub).toBe(hub);
        expect(nudge.previewHref).toBe('/free-chart');
      }
    },
  );

  it('a non-info hub (e.g. tarot) does NOT expose a previewHref', () => {
    const nudge = getContextualNudge('/grimoire/tarot');
    expect(nudge.previewHref).toBeUndefined();
  });

  it('the universal fallback hub does NOT expose a previewHref', () => {
    const nudge = getContextualNudge('/some/unmatched/path');
    expect(nudge.hub).toBe('universal');
    expect(nudge.previewHref).toBeUndefined();
  });
});

describe('VITAL #9 the nudge renderer only shows the preview link when set', () => {
  const source = readSource('src/components/ui/ContextualNudgeSection.tsx');

  it('renders the free-preview link conditionally on nudge.previewHref', () => {
    expect(source).toContain('{nudge.previewHref && (');
    expect(source).toContain('href={nudge.previewHref}');
    expect(source).toContain('see a free preview');
  });
});

describe('VITAL #9 the birth-chart hero offers a no-account free preview', () => {
  const source = readSource('src/app/birth-chart/page.tsx');

  it('hero links to /free-chart with a source tag and no-account copy', () => {
    expect(source).toContain("href='/free-chart?source=birth_chart_hero'");
    expect(source).toContain('see a free preview, no account needed');
  });

  it('hero still keeps the primary signup CTA (preview is additive, not a replacement)', () => {
    expect(source).toContain('/signup/chart?hub=birth-chart');
  });
});
