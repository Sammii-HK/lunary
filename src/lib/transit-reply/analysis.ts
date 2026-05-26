import { Observer } from 'astronomy-engine';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { getAstrologicalChart } from '../../../utils/astrology/astrology';

export type TransitReplyAspect = {
  transitPlanet: string;
  transitSign: string;
  transitDegree: number;
  aspect: 'Conjunction' | 'Opposition' | 'Square' | 'Trine' | 'Sextile';
  aspectGlyph: string;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  natalHouse: number | null;
  natalHouseTheme: string | null;
  orb: number;
  house: number | null;
  houseTheme: string | null;
  houseIsApproximate?: boolean;
  score: number;
  sentence: string;
};

export type TransitReplyAnalysis = {
  date: string;
  currentSky: BirthChartData[];
  transits: TransitReplyAspect[];
  summary: string;
  houseSource:
    | 'supplied-cusps'
    | 'supplied-placement-houses'
    | 'whole-sign-approximation';
};

export type TransitReplyHouseCusp = {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
};

export type ChartReplyAnalysis = {
  summary: string;
  placements: Array<{
    body: string;
    sign: string;
    degree: number;
    house: number | null;
    houseTheme: string | null;
    sentence: string;
  }>;
  houseSource: TransitReplyAnalysis['houseSource'];
};

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const SIGN_INDEX = Object.fromEntries(
  SIGNS.map((sign, index) => [sign.toLowerCase(), index]),
) as Record<string, number>;

const SIGN_GLYPHS: Record<string, (typeof SIGNS)[number]> = {
  '♈': 'Aries',
  '♉': 'Taurus',
  '♊': 'Gemini',
  '♋': 'Cancer',
  '♌': 'Leo',
  '♍': 'Virgo',
  '♎': 'Libra',
  '♏': 'Scorpio',
  '♐': 'Sagittarius',
  '♑': 'Capricorn',
  '♒': 'Aquarius',
  '♓': 'Pisces',
};

const SIGN_ALIASES: Record<string, (typeof SIGNS)[number]> = {
  ari: 'Aries',
  tau: 'Taurus',
  gem: 'Gemini',
  can: 'Cancer',
  leo: 'Leo',
  vir: 'Virgo',
  lib: 'Libra',
  sco: 'Scorpio',
  sag: 'Sagittarius',
  cap: 'Capricorn',
  aqu: 'Aquarius',
  pis: 'Pisces',
};

const BODY_ALIASES: Record<string, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  asc: 'Ascendant',
  ac: 'Ascendant',
  ascendant: 'Ascendant',
  rising: 'Ascendant',
  dsc: 'Descendant',
  dc: 'Descendant',
  desc: 'Descendant',
  descendant: 'Descendant',
  mc: 'Midheaven',
  midheaven: 'Midheaven',
  ic: 'Imum Coeli',
  'imum coeli': 'Imum Coeli',
  chiron: 'Chiron',
  node: 'North Node',
  'north node': 'North Node',
};

const NATAL_FOCUS = new Set([
  'Sun',
  'Moon',
  'Ascendant',
  'Midheaven',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'North Node',
  'Chiron',
  'Descendant',
  'Imum Coeli',
]);

const TRANSIT_WEIGHTS: Record<string, number> = {
  Pluto: 26,
  Neptune: 23,
  Uranus: 22,
  Saturn: 24,
  Jupiter: 20,
  Mars: 15,
  Venus: 10,
  Mercury: 10,
  Sun: 9,
  Moon: 7,
};

const NATAL_WEIGHTS: Record<string, number> = {
  Ascendant: 24,
  Descendant: 22,
  Midheaven: 22,
  'Imum Coeli': 20,
  Sun: 22,
  Moon: 22,
  Venus: 16,
  Mars: 16,
  Mercury: 13,
  Saturn: 13,
  Jupiter: 12,
  'North Node': 11,
  Chiron: 10,
};

const HOUSE_THEMES: Record<number, string> = {
  1: 'identity, confidence, and how you meet the world',
  2: 'self-worth, money, stability, and resources',
  3: 'communication, thinking, learning, and local life',
  4: 'home, family, roots, and emotional foundations',
  5: 'creativity, romance, pleasure, and self-expression',
  6: 'work, health, routines, and daily repair',
  7: 'partnerships, mirroring, and one-to-one dynamics',
  8: 'intimacy, shared resources, fear, and transformation',
  9: 'beliefs, travel, study, and wider meaning',
  10: 'career, reputation, responsibility, and visibility',
  11: 'friends, community, networks, and future plans',
  12: 'rest, closure, subconscious material, and healing',
};

const ASPECTS = [
  {
    aspect: 'Conjunction',
    glyph: '☌',
    angle: 0,
    orb: 7,
    verb: 'is sitting on',
    score: 22,
  },
  {
    aspect: 'Opposition',
    glyph: '☍',
    angle: 180,
    orb: 7,
    verb: 'is opposing',
    score: 21,
  },
  {
    aspect: 'Square',
    glyph: '□',
    angle: 90,
    orb: 6,
    verb: 'is squaring',
    score: 20,
  },
  {
    aspect: 'Trine',
    glyph: '△',
    angle: 120,
    orb: 5,
    verb: 'is trining',
    score: 14,
  },
  {
    aspect: 'Sextile',
    glyph: '✶',
    angle: 60,
    orb: 4,
    verb: 'is sextiling',
    score: 11,
  },
] as const;

function normaliseDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function signFromLongitude(longitude: number) {
  return SIGNS[Math.floor(normaliseDegrees(longitude) / 30)];
}

function degreeInSign(longitude: number) {
  return Math.floor(normaliseDegrees(longitude) % 30);
}

function placementFromLongitude(
  source: BirthChartData,
  body: string,
  longitude: number,
  house: number,
): BirthChartData {
  const normalized = normaliseDegrees(longitude);
  const sign = signFromLongitude(normalized);
  const degreeFloat = normalized % 30;
  let degree = Math.floor(degreeFloat);
  let minute = Math.round((degreeFloat - degree) * 60);

  if (minute === 60) {
    degree += 1;
    minute = 0;
  }
  if (degree === 30) {
    degree = 0;
  }

  return {
    body,
    sign,
    degree,
    minute,
    eclipticLongitude: normalized,
    retrograde: source.retrograde,
    house,
  };
}

function withDefaultAxisHouse(placement: BirthChartData): BirthChartData {
  if (placement.house) return placement;
  if (placement.body === 'Ascendant') return { ...placement, house: 1 };
  if (placement.body === 'Descendant') return { ...placement, house: 7 };
  if (placement.body === 'Midheaven') return { ...placement, house: 10 };
  if (placement.body === 'Imum Coeli') return { ...placement, house: 4 };
  return placement;
}

export function completeChartAngles(
  birthChart: BirthChartData[],
): BirthChartData[] {
  const chart = birthChart.map(withDefaultAxisHouse);
  const bodies = new Set(chart.map((placement) => placement.body));
  const ascendant = chart.find((placement) => placement.body === 'Ascendant');
  const midheaven = chart.find((placement) => placement.body === 'Midheaven');

  if (ascendant && !bodies.has('Descendant')) {
    chart.push(
      placementFromLongitude(
        ascendant,
        'Descendant',
        ascendant.eclipticLongitude + 180,
        7,
      ),
    );
  }
  if (midheaven && !bodies.has('Imum Coeli')) {
    chart.push(
      placementFromLongitude(
        midheaven,
        'Imum Coeli',
        midheaven.eclipticLongitude + 180,
        4,
      ),
    );
  }

  return chart;
}

function isForwardBetween(start: number, end: number, target: number) {
  const span = normaliseDegrees(end - start);
  const offset = normaliseDegrees(target - start);
  return offset > 0 && offset < span;
}

export function inferHouseNumberingDirection(
  birthChart: BirthChartData[],
  houseCusps: TransitReplyHouseCusp[] = [],
): 'clockwise' | 'counterclockwise' | 'unknown' {
  const house = (houseNumber: number) =>
    houseCusps.find((cusp) => cusp.house === houseNumber)?.eclipticLongitude;
  const point = (body: string) =>
    birthChart.find((placement) => placement.body === body)?.eclipticLongitude;

  const ascendant = house(1) ?? point('Ascendant');
  const descendant = house(7) ?? point('Descendant');
  const midheaven = house(10) ?? point('Midheaven');
  const imumCoeli = house(4) ?? point('Imum Coeli');

  if (!Number.isFinite(ascendant) || !Number.isFinite(descendant)) {
    return 'unknown';
  }

  if (
    Number.isFinite(imumCoeli) &&
    isForwardBetween(ascendant!, descendant!, imumCoeli!)
  ) {
    return 'clockwise';
  }
  if (
    Number.isFinite(midheaven) &&
    isForwardBetween(ascendant!, descendant!, midheaven!)
  ) {
    return 'counterclockwise';
  }

  return 'unknown';
}

function angularDistance(a: number, b: number) {
  let diff = Math.abs(normaliseDegrees(a) - normaliseDegrees(b));
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function houseForTransit(
  transitLongitude: number,
  birthChart: BirthChartData[],
  houseCusps?: TransitReplyHouseCusp[],
): { house: number | null; approximate?: boolean } {
  if (houseCusps && houseCusps.length === 12) {
    const sorted = [...houseCusps].sort((a, b) => a.house - b.house);
    for (let index = 0; index < sorted.length; index += 1) {
      const currentHouse = sorted[index];
      const nextHouse = sorted[(index + 1) % sorted.length];
      const start = normaliseDegrees(currentHouse.eclipticLongitude);
      const end = normaliseDegrees(nextHouse.eclipticLongitude);
      const longitude = normaliseDegrees(transitLongitude);

      if (end <= start) {
        if (longitude >= start || longitude < end) {
          return { house: currentHouse.house };
        }
      } else if (longitude >= start && longitude < end) {
        return { house: currentHouse.house };
      }
    }
  }

  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const fallbackSun = birthChart.find((p) => p.body === 'Sun');
  const reference = ascendant ?? fallbackSun;
  if (!reference) return { house: null };

  const referenceSign = Math.floor(
    normaliseDegrees(reference.eclipticLongitude) / 30,
  );
  const transitSign = Math.floor(normaliseDegrees(transitLongitude) / 30);
  return {
    house: ((transitSign - referenceSign + 12) % 12) + 1,
    approximate: !ascendant,
  };
}

function transitSentence(aspect: TransitReplyAspect) {
  const houseText =
    aspect.house && aspect.houseTheme
      ? `, activating the ${aspect.house}${ordinalSuffix(aspect.house)} house of ${aspect.houseTheme}`
      : '';
  const natalHouseText =
    aspect.natalHouse && aspect.natalHouseTheme
      ? ` while pressing on the natal ${aspect.natalHouse}${ordinalSuffix(aspect.natalHouse)} house of ${aspect.natalHouseTheme}`
      : '';
  return `${aspect.transitPlanet} in ${aspect.transitSign} ${aspectVerb(
    aspect.aspect,
  )} natal ${aspect.natalPlanet} in ${aspect.natalSign}${houseText}${natalHouseText}.`;
}

function aspectVerb(aspect: TransitReplyAspect['aspect']) {
  return ASPECTS.find((a) => a.aspect === aspect)?.verb ?? 'aspects';
}

function ordinalSuffix(value: number) {
  if (value >= 11 && value <= 13) return 'th';
  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function scoreAspect(args: {
  transitPlanet: string;
  natalPlanet: string;
  aspectScore: number;
  allowedOrb: number;
  orb: number;
}) {
  const tightness = Math.max(0, (args.allowedOrb - args.orb) / args.allowedOrb);
  return Math.round(
    args.aspectScore +
      tightness * 34 +
      (TRANSIT_WEIGHTS[args.transitPlanet] ?? 8) +
      (NATAL_WEIGHTS[args.natalPlanet] ?? 7),
  );
}

export function analyseTransitReply(
  birthChart: BirthChartData[],
  date = new Date(),
  limit = 4,
  houseCusps?: TransitReplyHouseCusp[],
): TransitReplyAnalysis {
  const currentSky = getAstrologicalChart(date, DEFAULT_OBSERVER);
  const currentSkyChart: BirthChartData[] = currentSky.map((placement) => ({
    body: String(placement.body),
    sign: placement.sign || signFromLongitude(placement.eclipticLongitude),
    degree: degreeInSign(placement.eclipticLongitude),
    minute: Math.floor(
      (normaliseDegrees(placement.eclipticLongitude) % 1) * 60,
    ),
    eclipticLongitude: placement.eclipticLongitude,
    retrograde: placement.retrograde,
  }));
  const rows: TransitReplyAspect[] = [];
  const natalChart = birthChart.filter((p) => NATAL_FOCUS.has(p.body));

  for (const transit of currentSky) {
    const transitPlanet = String(transit.body);
    const transitLongitude = transit.eclipticLongitude;
    const transitSign = transit.sign || signFromLongitude(transitLongitude);

    for (const natal of natalChart) {
      const distance = angularDistance(
        transitLongitude,
        natal.eclipticLongitude,
      );

      for (const aspectConfig of ASPECTS) {
        const orb = Math.abs(distance - aspectConfig.angle);
        if (orb > aspectConfig.orb) continue;

        const house = houseForTransit(transitLongitude, birthChart, houseCusps);
        const aspect: TransitReplyAspect = {
          transitPlanet,
          transitSign,
          transitDegree: degreeInSign(transitLongitude),
          aspect: aspectConfig.aspect,
          aspectGlyph: aspectConfig.glyph,
          natalPlanet: natal.body,
          natalSign: natal.sign,
          natalDegree: degreeInSign(natal.eclipticLongitude),
          natalHouse: natal.house ?? null,
          natalHouseTheme: natal.house ? HOUSE_THEMES[natal.house] : null,
          orb: Number(orb.toFixed(2)),
          house: house.house,
          houseTheme: house.house ? HOUSE_THEMES[house.house] : null,
          houseIsApproximate: house.approximate,
          score: scoreAspect({
            transitPlanet,
            natalPlanet: natal.body,
            aspectScore: aspectConfig.score,
            allowedOrb: aspectConfig.orb,
            orb,
          }),
          sentence: '',
        };
        aspect.sentence = transitSentence(aspect);
        rows.push(aspect);
        break;
      }
    }
  }

  const transits = rows
    .sort((a, b) => b.score - a.score || a.orb - b.orb)
    .slice(0, limit);

  return {
    date: date.toISOString().slice(0, 10),
    currentSky: currentSkyChart,
    transits,
    summary: buildTransitSummary(transits),
    houseSource:
      houseCusps?.length === 12
        ? 'supplied-cusps'
        : birthChart.some((placement) => placement.house)
          ? 'supplied-placement-houses'
          : 'whole-sign-approximation',
  };
}

export function buildTransitSummary(transits: TransitReplyAspect[]) {
  if (transits.length === 0) {
    return 'The current sky is not making tight major aspects to the visible natal placements, so the chart reads more like background weather than one sharp transit peak.';
  }

  const first = transits[0];
  const second = transits[1];
  const houseText =
    first.house && first.houseTheme
      ? ` This lands in the ${first.house}${ordinalSuffix(first.house)} house, so the pressure is most likely showing up through ${first.houseTheme}.`
      : '';
  const natalHouseText =
    first.natalHouse && first.natalHouseTheme
      ? ` It is also pressing on a natal ${first.natalHouse}${ordinalSuffix(first.natalHouse)} house placement, tying the story back to ${first.natalHouseTheme}.`
      : '';
  const secondText = second
    ? ` A second layer is ${second.transitPlanet} ${second.aspect.toLowerCase()} natal ${second.natalPlanet}, which adds ${second.aspect === 'Square' || second.aspect === 'Opposition' ? 'friction and contrast' : 'support and flow'} to the pattern.`
    : '';

  return `The clearest current transit is ${first.transitPlanet} in ${first.transitSign} ${first.aspect.toLowerCase()} natal ${first.natalPlanet} in ${first.natalSign}.${houseText}${natalHouseText}${secondText}`;
}

export function buildRedditTransitReply(args: {
  question?: string;
  transits: TransitReplyAspect[];
  shareUrl?: string;
}) {
  const { question, transits, shareUrl } = args;
  if (transits.length === 0) {
    return [
      question?.trim()
        ? 'I checked this against the current sky and I would read it as more diffuse background pressure than one exact transit.'
        : 'I checked the current sky against the chart and there is not one tight major aspect dominating the whole picture.',
      shareUrl ? `I made a quick transit overlay here: ${shareUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  const first = transits[0];
  const second = transits[1];
  const third = transits[2];
  const feelingFrame = question?.trim()
    ? 'For what you described, I would start with the live transits rather than reading the natal chart in isolation.'
    : 'I would start with the live transits rather than reading the natal chart in isolation.';
  const housePhrase =
    first.house && first.houseTheme
      ? ` Because it is moving through the ${first.house}${ordinalSuffix(first.house)} house, the feeling may be coming through ${first.houseTheme}.`
      : '';
  const secondPhrase = second
    ? ` I would also watch ${second.transitPlanet} in ${second.transitSign} ${second.aspect.toLowerCase()} natal ${second.natalPlanet}, which ${second.aspect === 'Square' || second.aspect === 'Opposition' ? 'adds pressure/contrast' : 'gives the chart a support channel'} around ${second.houseTheme ?? 'that same theme'}.`
    : '';
  const natalHousePhrase =
    first.natalHouse && first.natalHouseTheme
      ? ` Since the natal ${first.natalPlanet} is shown in the ${first.natalHouse}${ordinalSuffix(first.natalHouse)} house, I would read that natal house as part of why this is landing around ${first.natalHouseTheme}.`
      : '';
  const thirdPhrase = third
    ? ` The third layer is ${third.transitPlanet} ${third.aspect.toLowerCase()} natal ${third.natalPlanet}, so this is not just one random mood spike.`
    : '';
  const linkPhrase = shareUrl
    ? `\n\nI mapped the overlay here so you can see the natal placements inside and the current transits outside: ${shareUrl}`
    : '';

  return `${feelingFrame} The loudest contact I see is ${first.transitPlanet} in ${first.transitSign} ${first.aspect.toLowerCase()} your natal ${first.natalPlanet} in ${first.natalSign}, with about ${first.orb.toFixed(1)}° of orb.${housePhrase}${natalHousePhrase}${secondPhrase}${thirdPhrase}${linkPhrase}`;
}

const CHART_PLACEMENT_WEIGHTS: Record<string, number> = {
  Sun: 24,
  Moon: 24,
  Ascendant: 24,
  Mercury: 18,
  Venus: 18,
  Mars: 18,
  Saturn: 15,
  Jupiter: 14,
  Midheaven: 14,
  'North Node': 12,
  Chiron: 11,
};

function chartPlacementSentence(placement: BirthChartData) {
  const houseTheme = placement.house ? HOUSE_THEMES[placement.house] : null;
  const houseText =
    placement.house && houseTheme
      ? ` in the ${placement.house}${ordinalSuffix(placement.house)} house of ${houseTheme}`
      : '';
  return `${placement.body} in ${placement.sign}${houseText}`;
}

export function analyseBirthChartReply(
  birthChart: BirthChartData[],
): ChartReplyAnalysis {
  const placements = birthChart
    .filter((placement) => CHART_PLACEMENT_WEIGHTS[placement.body])
    .sort(
      (a, b) =>
        (CHART_PLACEMENT_WEIGHTS[b.body] ?? 0) -
        (CHART_PLACEMENT_WEIGHTS[a.body] ?? 0),
    )
    .slice(0, 6)
    .map((placement) => ({
      body: placement.body,
      sign: placement.sign,
      degree: placement.degree,
      house: placement.house ?? null,
      houseTheme: placement.house ? HOUSE_THEMES[placement.house] : null,
      sentence: chartPlacementSentence(placement),
    }));

  const [first, second, third] = placements;
  const summary = first
    ? [
        `The strongest starting point is ${first.sentence}.`,
        second ? `${second.sentence} adds the next layer.` : '',
        third
          ? `${third.sentence} gives the chart another visible emphasis.`
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    : 'The chart needs at least a few clear placements before I can give a grounded read.';

  return {
    summary,
    placements,
    houseSource: birthChart.some((placement) => placement.house)
      ? 'supplied-placement-houses'
      : 'whole-sign-approximation',
  };
}

export function buildRedditBirthChartReply(args: {
  question?: string;
  analysis: ChartReplyAnalysis;
  shareUrl?: string;
}) {
  const { question, analysis, shareUrl } = args;
  const [first, second, third] = analysis.placements;

  if (!first) {
    return [
      "I can give a cleaner chart read if you share the planet table or birth data. From the screenshot alone, I don't want to invent placements I can't read clearly.",
      shareUrl ? `I made a quick chart snapshot here: ${shareUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  const intro = question?.trim()
    ? 'For the chart read, I would start with the core placements rather than one isolated planet.'
    : 'I would start with the core placements rather than one isolated planet.';
  const secondPhrase = second
    ? ` ${second.sentence} is the second thing I would read, because it colours how the chart processes needs, communication, or attachment.`
    : '';
  const thirdPhrase = third
    ? ` ${third.sentence} gives another concrete house/sign emphasis, so I would not reduce this chart to the Sun sign.`
    : '';
  const linkPhrase = shareUrl
    ? `\n\nI mapped the chart snapshot here so you can see the placements cleanly: ${shareUrl}`
    : '';

  return `${intro} The loudest signature I see is ${first.sentence}, which makes that area a major lens for identity and lived experience.${secondPhrase}${thirdPhrase}${linkPhrase}`;
}

export function parsePlacementsText(input: string): BirthChartData[] {
  const placements: BirthChartData[] = [];
  const usedBodies = new Set<string>();

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const lower = line
      .toLowerCase()
      .replace(/[♈♉♊♋♌♍♎♏♐♑♒♓]/g, ' ');

    const body = Object.entries(BODY_ALIASES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([alias]) =>
        new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i').test(lower),
      )?.[1];
    const sign = findSignInLine(line);
    if (!body || !sign || usedBodies.has(body)) continue;

    const degreeMatch =
      line.match(/(\d{1,2})(?:\s*°|\s+deg|\s+degrees?)/i) ||
      line.match(
        /\b(\d{1,2})\s+(?:ari|tau|gem|can|leo|vir|lib|sco|sag|cap|aqu|pis)\b/i,
      ) ||
      line.match(new RegExp(`${sign}\\D{0,12}(\\d{1,2})`, 'i')) ||
      line.match(new RegExp(`(\\d{1,2})\\D{0,12}${sign}`, 'i'));
    const minuteMatch = line.match(/[°\s](\d{1,2})['’]/);
    const numericColumns = [...line.matchAll(/\b\d{1,2}\b/g)].map((match) =>
      Number(match[0]),
    );
    const degree = Math.min(29, Math.max(0, Number(degreeMatch?.[1] ?? 0)));
    const minute = Math.min(
      59,
      Math.max(0, Number(minuteMatch?.[1] ?? numericColumns[1] ?? 0)),
    );
    const eclipticLongitude =
      SIGN_INDEX[sign.toLowerCase()] * 30 + degree + minute / 60;

    placements.push({
      body,
      sign,
      degree,
      minute,
      eclipticLongitude,
      retrograde: /\b(rx|r|retrograde|℞)\b/i.test(line),
      house: parseHouseColumn(line),
    });
    usedBodies.add(body);
  }

  return completeChartAngles(placements);
}

function findSignInLine(line: string) {
  const namedSign = SIGNS.find((candidate) =>
    new RegExp(`\\b${candidate}\\b`, 'i').test(line),
  );
  if (namedSign) return namedSign;

  const glyphSign = Object.entries(SIGN_GLYPHS).find(([glyph]) =>
    line.includes(glyph),
  )?.[1];
  if (glyphSign) return glyphSign;

  return Object.entries(SIGN_ALIASES).find(([candidate]) =>
    new RegExp(`\\b${candidate}\\b`, 'i').test(line),
  )?.[1];
}

function parseHouseColumn(line: string) {
  const houseMatch = line.match(/(?:^|\s)(1[0-2]|[1-9])\s*$/);
  if (!houseMatch) return undefined;
  return Number(houseMatch[1]);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
