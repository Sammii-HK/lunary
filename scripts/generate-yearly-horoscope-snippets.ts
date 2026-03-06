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
    opposition: 'reflects growth back through your closest partnerships and key relationships',
    square: 'creates productive friction this year — the push to grow beyond your current comfort zone',
    trine: 'sends supportive energy your way, easing progress and opening doors',
    sextile: 'offers quiet opportunity where effort is rewarded more readily than usual',
    semisextile: 'adds a background note of gentle expansion to the year',
    quincunx: 'calls for small recalibrations — subtle course corrections that quietly improve your direction',
  },
  Saturn: {
    inSign: 'calling for discipline, commitment, and long-term building — foundations laid now last',
    opposition: 'brings a relational reckoning this year — long-standing commitments are tested and clarified',
    square: 'applies steady pressure that demands maturity, structure, and honest self-assessment',
    trine: 'rewards consistent effort and steady systems with tangible, lasting results',
    sextile: 'supports careful planning and incremental progress in practical areas of life',
    semisextile: 'lends a quiet steadying influence to daily decisions throughout the year',
    quincunx: 'asks for a recalibration of responsibilities — what you commit to now shapes the years ahead',
  },
  Uranus: {
    inSign: 'bringing disruption, liberation, and the kind of reinvention that cannot be planned for',
    opposition: 'shakes up partnerships and key relationships with sudden realisations or unexpected reversals',
    square: 'forces a necessary break from the past — change that is resisted tends to arrive anyway',
    trine: 'brings exciting breakthroughs and room to experiment without destabilising your core',
    sextile: 'opens small windows of innovation and creative departure from routine',
    semisextile: 'hums quietly in the background, nudging curiosity and a readiness for small experiments',
    quincunx: 'introduces subtle restlessness — a background pull toward something more authentic',
  },
  Neptune: {
    inSign: 'dissolving old identities and deepening intuition — clarity emerges slowly but meaningfully',
    opposition: 'blurs the line between self and other this year — clarity in close relationships takes conscious effort',
    square: 'softens boundaries in ways that require grounding — discernment is your most useful tool',
    trine: 'lifts creative and spiritual life with gentle inspiration and intuitive ease',
    sextile: 'adds a quiet poetic quality to intuition, creativity, and inner reflection',
    semisextile: 'softens the edges of daily life with a dreamlike sensitivity that feeds creativity',
    quincunx: 'calls for honest clarity around where inspiration has drifted into avoidance',
  },
  Pluto: {
    inSign: 'moving through a long arc of deep transformation and power reclamation — nothing stays the same',
    opposition: 'exposes hidden power dynamics in relationships and structures — what must change, changes',
    square: 'compels a confrontation with buried patterns and inherited limitations you have outgrown',
    trine: 'supports deep, lasting change that emerges from a place of readiness rather than crisis',
    sextile: 'facilitates quiet but meaningful shifts in values, purpose, and inner authority',
    semisextile: 'keeps a low, steady pressure on deeper questions of power and purpose',
    quincunx: 'quietly demands integration of what has been set aside or left unresolved',
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
  const usedPlanets = new Set<string>();
  let challengingCount = 0;
  const CHALLENGING: AspectType[] = ['square', 'opposition'];

  for (const t of transits) {
    if (sentences.length >= 3) break;
    const key = `${t.planet}-${t.inSign}`;
    if (used.has(key)) continue;
    if (usedPlanets.has(t.planet)) continue; // no duplicate planets
    if (CHALLENGING.includes(t.aspect) && challengingCount >= 1) continue; // max one challenging aspect
    used.add(key);
    usedPlanets.add(t.planet);

    const themeKey = t.aspect === 'conjunction' ? 'inSign' : t.aspect;
    const theme = PLANET_THEMES[t.planet]?.[themeKey];
    if (!theme) continue;

    const timeQualifier = t.monthsActive === 'all year'
      ? `all year`
      : t.monthsActive;

    if (t.aspect === 'conjunction') {
      const timing = t.monthsActive === 'all year' ? `all of ${year}` : `${timeQualifier} of ${year}`;
      sentences.push(`${t.planet} moves through ${sign} for ${timing}, ${theme}.`);
    } else {
      const timing = t.monthsActive === 'all year' ? `throughout ${year}` : `from ${timeQualifier}`;
      sentences.push(`${t.planet} ${theme} ${timing}.`);
    }

    if (CHALLENGING.includes(t.aspect)) challengingCount++;
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
