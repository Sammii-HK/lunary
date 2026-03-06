/**
 * generate-yearly-horoscope-snippets.ts
 *
 * Reads slow-planet-sign-changes.json and generates per-sign, per-year
 * astrological snippets based on actual slow-planet transits.
 *
 * Run: npx tsx scripts/generate-yearly-horoscope-snippets.ts
 * Output: src/data/yearly-horoscope-snippets.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// --- Types ---

interface Segment {
  start: string;
  end: string;
}

interface SlowPlanetData {
  generated: string;
  scanRange: { start: string; end: string };
  segments: Record<string, Record<string, Segment[]>>;
}

type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx' | 'semisextile' | 'none';

interface ActiveTransit {
  planet: string;
  inSign: string;
  aspect: AspectType;
  monthsActive: string; // e.g. "Jan–Jun" or "all year"
  overlap: number; // days overlapping with the year
}

interface YearSignSnippet {
  snippet: string;
  transits: ActiveTransit[];
}

// --- Constants ---

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_INDEX: Record<string, number> = Object.fromEntries(
  ZODIAC_SIGNS.map((s, i) => [s, i]),
);

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PLANET_THEMES: Record<string, {
  inSign: string;
  opposition: string;
  square: string;
  trine: string;
  sextile: string;
}> = {
  Jupiter: {
    inSign: 'bringing expansion, confidence, and genuine opportunity — this is a year to move boldly',
    opposition: 'in {inSign} reflects growth back through partnerships and key relationships',
    square: 'in {inSign} creates productive friction — the push to grow beyond your comfort zone',
    trine: 'in {inSign} flows supportive energy your way, easing progress and opening doors',
    sextile: 'in {inSign} offers quiet opportunity where effort is rewarded more readily than usual',
    semisextile: 'in {inSign} sits just beside your sign, adding a background note of gentle expansion',
    quincunx: 'in {inSign} calls for subtle adjustments — small recalibrations that quietly improve direction',
  },
  Saturn: {
    inSign: 'calling for discipline, commitment, and long-term building — foundations laid now last',
    opposition: 'in {inSign} creates a relational reckoning — long-standing commitments are tested and clarified',
    square: 'in {inSign} applies pressure that demands maturity, structure, and honest self-assessment',
    trine: 'in {inSign} rewards consistent effort and steady systems with tangible, lasting results',
    sextile: 'in {inSign} supports careful planning and incremental progress in practical areas',
    semisextile: 'in {inSign} sits close, lending a quiet steadying influence to daily decisions',
    quincunx: 'in {inSign} asks for a recalibration of responsibilities and long-term commitments',
  },
  Uranus: {
    inSign: 'bringing disruption, liberation, and the kind of reinvention that cannot be planned for',
    opposition: 'in {inSign} shakes up relationships and partnerships with sudden realisations or reversals',
    square: 'in {inSign} forces a break from the past — change that resists becomes change that overwhelms',
    trine: 'in {inSign} brings exciting breakthroughs and room to experiment without destabilising your core',
    sextile: 'in {inSign} opens small windows of innovation and creative departure from routine',
    semisextile: 'in {inSign} hums quietly nearby, nudging curiosity and a readiness for small experiments',
    quincunx: 'in {inSign} introduces subtle restlessness — a background pull toward the unconventional',
  },
  Neptune: {
    inSign: 'dissolving old identities and deepening intuition — clarity emerges slowly but meaningfully',
    opposition: 'in {inSign} blurs the line between self and other — clarity in relationships takes conscious effort',
    square: 'in {inSign} creates subtle confusion or idealisation; grounding and discernment are essential',
    trine: 'in {inSign} lifts creative and spiritual life with gentle inspiration and intuitive ease',
    sextile: 'in {inSign} adds a quiet poetic quality to intuition, creativity, and inner reflection',
    semisextile: 'in {inSign} drifts close, softening the edges of daily life with dreamlike sensitivity',
    quincunx: 'in {inSign} calls for honest clarity around where idealism has become avoidance',
  },
  Pluto: {
    inSign: 'in a long arc of deep transformation and power reclamation — nothing stays the same',
    opposition: 'in {inSign} exposes power dynamics in relationships and institutions — what must change, changes',
    square: 'in {inSign} compels confrontation with buried patterns, fear, and inherited limitations',
    trine: 'in {inSign} supports deep, lasting change that emerges from readiness rather than crisis',
    sextile: 'in {inSign} facilitates quiet but meaningful shifts in values, purpose, and inner authority',
    semisextile: 'in {inSign} sits adjacent, keeping a low pressure on deeper questions of power and purpose',
    quincunx: 'in {inSign} quietly demands integration of what has been avoided or left unresolved',
  },
};

// --- Helpers ---

function getAspect(signA: string, signB: string): AspectType {
  const a = SIGN_INDEX[signA];
  const b = SIGN_INDEX[signB];
  if (a === undefined || b === undefined) return 'none';
  const diff = Math.min(Math.abs(a - b), 12 - Math.abs(a - b));
  switch (diff) {
    case 0: return 'conjunction';
    case 1: return 'semisextile';
    case 2: return 'sextile';
    case 3: return 'square';
    case 4: return 'trine';
    case 5: return 'quincunx';
    case 6: return 'opposition';
    default: return 'none';
  }
}

function getMonthRange(startMs: number, endMs: number, yearStart: number, yearEnd: number): string {
  const clampedStart = Math.max(startMs, yearStart);
  const clampedEnd = Math.min(endMs, yearEnd);
  const startDate = new Date(clampedStart);
  const endDate = new Date(clampedEnd - 1); // -1ms to land in correct month

  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();

  if (startMonth === 0 && endMonth === 11) return 'all year';
  if (startMonth === endMonth) return MONTHS_SHORT[startMonth];
  return `${MONTHS_SHORT[startMonth]}–${MONTHS_SHORT[endMonth]}`;
}

function getOverlapDays(
  segStart: string,
  segEnd: string,
  yearStart: number,
  yearEnd: number,
): number {
  const s = Math.max(new Date(segStart).getTime(), yearStart);
  const e = Math.min(new Date(segEnd).getTime(), yearEnd);
  return e > s ? Math.round((e - s) / 86400000) : 0;
}

function getActiveTransits(
  segments: Record<string, Record<string, Segment[]>>,
  targetSign: string,
  year: number,
): ActiveTransit[] {
  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
  const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`).getTime();
  const results: ActiveTransit[] = [];

  for (const [planet, signSegments] of Object.entries(segments)) {
    for (const [inSign, segs] of Object.entries(signSegments)) {
      const aspect = getAspect(targetSign, inSign);
      if (aspect === 'none') continue;

      for (const seg of segs) {
        const overlap = getOverlapDays(seg.start, seg.end, yearStart, yearEnd);
        if (overlap < 14) continue; // ignore transits under 2 weeks

        const monthsActive = getMonthRange(
          new Date(seg.start).getTime(),
          new Date(seg.end).getTime(),
          yearStart,
          yearEnd,
        );

        results.push({ planet, inSign, aspect, monthsActive, overlap });
      }
    }
  }

  // Sort: lead with positive aspects, push challenging ones to mid/end
  // conjunction > trine > sextile > opposition > square > quincunx > semisextile
  const aspectOrder: Record<AspectType, number> = {
    conjunction: 0, trine: 1, sextile: 2, opposition: 3, square: 4, quincunx: 5, semisextile: 6, none: 9,
  };
  results.sort((a, b) => {
    const ao = aspectOrder[a.aspect] ?? 9;
    const bo = aspectOrder[b.aspect] ?? 9;
    if (ao !== bo) return ao - bo;
    return b.overlap - a.overlap;
  });

  return results;
}

function buildSnippet(sign: string, year: number, transits: ActiveTransit[]): string {
  if (transits.length === 0) {
    return `${year} is a year of personal consolidation for ${sign}. With no slow planets directly activating your sign, the focus turns inward — review what you have built, refine your direction, and prepare for the cycles ahead.`;
  }

  const sentences: string[] = [];
  const used = new Set<string>();

  // Lead with the most impactful transit (conjunction or opposition first)
  for (const t of transits.slice(0, 3)) {
    const key = `${t.planet}-${t.inSign}`;
    if (used.has(key)) continue;
    used.add(key);

    const themeKey = t.aspect === 'conjunction' ? 'inSign' : t.aspect;
    const theme = PLANET_THEMES[t.planet]?.[themeKey];
    if (!theme) continue;

    const timeQualifier = t.monthsActive === 'all year'
      ? `all year`
      : t.monthsActive;

    const resolved = theme.replace('{inSign}', t.inSign);

    if (t.aspect === 'conjunction') {
      const timing = t.monthsActive === 'all year' ? `all of ${year}` : `${timeQualifier} of ${year}`;
      sentences.push(`${t.planet} moves through ${sign} for ${timing}, ${resolved}.`);
    } else {
      const timing = t.monthsActive === 'all year' ? `throughout ${year}` : `from ${timeQualifier}`;
      sentences.push(`${t.planet} ${resolved} ${timing}.`);
    }

    if (sentences.length >= 3) break;
  }

  return sentences.join(' ');
}

// --- Main ---

function main() {
  const dataPath = resolve(__dirname, '../src/data/slow-planet-sign-changes.json');
  const outPath = resolve(__dirname, '../src/data/yearly-horoscope-snippets.json');

  const raw = readFileSync(dataPath, 'utf-8');
  const data: SlowPlanetData = JSON.parse(raw);

  const years = Array.from({ length: 10 }, (_, i) => 2025 + i); // 2025–2034

  const output: Record<string, Record<string, YearSignSnippet>> = {};

  for (const year of years) {
    output[year] = {};
    for (const sign of ZODIAC_SIGNS) {
      const transits = getActiveTransits(data.segments, sign, year);
      const snippet = buildSnippet(sign, year, transits);
      output[year][sign.toLowerCase()] = { snippet, transits };
    }
  }

  const result = {
    generated: new Date().toISOString().split('T')[0],
    sourceData: data.generated,
    years: output,
  };

  writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
  console.log(`Wrote ${outPath}`);

  // Preview a couple of entries
  for (const sign of ['Capricorn', 'Leo', 'Aries']) {
    console.log(`\n--- ${sign} 2027 ---`);
    console.log(output[2027][sign.toLowerCase()].snippet);
    console.log('Transits:', output[2027][sign.toLowerCase()].transits.map(t => `${t.planet} in ${t.inSign} (${t.aspect}, ${t.monthsActive})`).join(', '));
  }
}

main();
