import { Observer } from 'astronomy-engine';
import {
  MONTH_DISPLAY_NAMES,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  type Month,
  type ZodiacSign,
} from '@/constants/seo/monthly-horoscope';
import { getAccurateMoonPhase } from '../../../utils/astrology/astronomical-data';
import {
  getAstrologicalChart,
  type AstroChartInformation,
} from '../../../utils/astrology/astrology';

type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

type SignTransit = {
  planet: string;
  transitSign: string;
  aspect: AspectType;
  retrograde: boolean;
  degree?: string;
};

type InfluenceSummary = {
  planet: string;
  aspect: AspectType;
  transitSign: string;
  days: number;
  retrogradeDays: number;
};

type MonthlyEvent = {
  dateLabel: string;
  title: string;
  meaning: string;
};

export type MonthlyForecast = {
  summary: string;
  tldr: string;
  whatToExpect: string;
  focus: string;
  challenge: string;
  opportunity: string;
  timing: string;
  love: string;
  career: string;
  wellbeing: string;
  faqs: Array<{ question: string; answer: string }>;
  emotionalThemes: string[];
  tableRows: string[][];
  keyEvents: MonthlyEvent[];
};

export type TransitWindowSnapshot = {
  summary: string;
  focus: string;
  challenge: string;
  opportunity: string;
  moonTone: string;
};

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);
const TRANSIT_BODIES = new Set([
  'Sun',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
]);

const ZODIAC_ORDER = [
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

const ASPECTS: { name: AspectType; offset: number }[] = [
  { name: 'conjunction', offset: 0 },
  { name: 'sextile', offset: 2 },
  { name: 'square', offset: 3 },
  { name: 'trine', offset: 4 },
  { name: 'opposition', offset: 6 },
  { name: 'sextile', offset: 10 },
  { name: 'square', offset: 9 },
  { name: 'trine', offset: 8 },
];

const ASPECT_WEIGHTS: Record<AspectType, number> = {
  conjunction: 3,
  sextile: 2,
  trine: 3,
  square: 5,
  opposition: 4,
};

const PLANET_THEMES: Record<string, string> = {
  Sun: 'visibility, confidence, and the part of life that needs clear ownership',
  Mercury: 'conversations, paperwork, planning, and mental bandwidth',
  Venus: 'relationships, attraction, values, and what feels worth your energy',
  Mars: 'drive, conflict tolerance, physical energy, and timing',
  Jupiter: 'growth, generosity, openings, and where life wants to widen',
  Saturn: 'responsibility, boundaries, discipline, and what needs to mature',
};

const ASPECT_VERBS: Record<AspectType, string> = {
  conjunction: 'intensifies',
  sextile: 'opens',
  trine: 'supports',
  square: 'pressurises',
  opposition: 'mirrors',
};

const ASPECT_INTERPRETATION: Record<AspectType, string> = {
  conjunction: 'turns the volume up and makes the theme unavoidable',
  sextile: 'creates a workable opening if you act on it',
  trine: 'helps momentum flow with less resistance',
  square: 'creates friction that forces adjustment',
  opposition: 'puts the issue across the table so balance matters',
};

const MONTH_CHECKPOINT_LABELS = ['start', 'mid-month', 'end'] as const;

function getMonthDate(year: number, month: Month, day: number): Date {
  const monthIndex = MONTHS.indexOf(month);
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
}

function toUtcNoon(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0,
    ),
  );
}

function getDaysInMonth(year: number, month: Month): number {
  const monthIndex = MONTHS.indexOf(month);
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function getAspectForSign(
  targetSign: string,
  transitSign: string,
): AspectType | null {
  const targetIdx = ZODIAC_ORDER.indexOf(
    targetSign as (typeof ZODIAC_ORDER)[number],
  );
  const transitIdx = ZODIAC_ORDER.indexOf(
    transitSign as (typeof ZODIAC_ORDER)[number],
  );
  if (targetIdx === -1 || transitIdx === -1) return null;

  for (const aspect of ASPECTS) {
    if ((targetIdx + aspect.offset) % 12 === transitIdx) {
      return aspect.name;
    }
  }

  return null;
}

function getSignTransitsForDate(sign: ZodiacSign, date: Date): SignTransit[] {
  const targetSign = SIGN_DISPLAY_NAMES[sign];
  const currentSky = getAstrologicalChart(date, DEFAULT_OBSERVER);

  return currentSky
    .filter((body) => TRANSIT_BODIES.has(String(body.body)))
    .map((body) => {
      const aspect = getAspectForSign(targetSign, body.sign);
      if (!aspect) return null;

      return {
        planet: String(body.body),
        transitSign: body.sign,
        aspect,
        retrograde: body.retrograde,
        degree: body.formattedDegree
          ? `${body.formattedDegree.degree}°${String(body.formattedDegree.minute).padStart(2, '0')}`
          : undefined,
      };
    })
    .filter((item): item is SignTransit => Boolean(item));
}

function summariseInfluence(influence: InfluenceSummary): string {
  const retrogradeBit =
    influence.retrogradeDays > 0
      ? ` and spends part of the month retrograde`
      : '';
  return `${influence.planet} ${ASPECT_VERBS[influence.aspect]} from ${influence.transitSign}, so ${PLANET_THEMES[influence.planet]} stay active for roughly ${influence.days} days${retrogradeBit}.`;
}

function findTopInfluences(
  sign: ZodiacSign,
  year: number,
  month: Month,
): InfluenceSummary[] {
  const counts = new Map<string, InfluenceSummary>();
  const totalDays = getDaysInMonth(year, month);

  for (let day = 1; day <= totalDays; day += 1) {
    const date = getMonthDate(year, month, day);
    const transits = getSignTransitsForDate(sign, date);

    for (const transit of transits) {
      const key = `${transit.planet}:${transit.aspect}:${transit.transitSign}`;
      const current = counts.get(key) ?? {
        planet: transit.planet,
        aspect: transit.aspect,
        transitSign: transit.transitSign,
        days: 0,
        retrogradeDays: 0,
      };

      current.days += 1;
      if (transit.retrograde) current.retrogradeDays += 1;
      counts.set(key, current);
    }
  }

  return [...counts.values()]
    .sort((a, b) => {
      const scoreA = a.days * ASPECT_WEIGHTS[a.aspect];
      const scoreB = b.days * ASPECT_WEIGHTS[b.aspect];
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

function findTopInfluencesForWindow(
  sign: ZodiacSign,
  startDate: Date,
  endDate: Date,
): InfluenceSummary[] {
  const counts = new Map<string, InfluenceSummary>();
  const cursor = toUtcNoon(startDate);
  const finalDate = toUtcNoon(endDate);

  while (cursor.getTime() <= finalDate.getTime()) {
    const transits = getSignTransitsForDate(sign, cursor);

    for (const transit of transits) {
      const key = `${transit.planet}:${transit.aspect}:${transit.transitSign}`;
      const current = counts.get(key) ?? {
        planet: transit.planet,
        aspect: transit.aspect,
        transitSign: transit.transitSign,
        days: 0,
        retrogradeDays: 0,
      };

      current.days += 1;
      if (transit.retrograde) current.retrogradeDays += 1;
      counts.set(key, current);
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return [...counts.values()]
    .sort((a, b) => {
      const scoreA = a.days * ASPECT_WEIGHTS[a.aspect];
      const scoreB = b.days * ASPECT_WEIGHTS[b.aspect];
      return scoreB - scoreA;
    })
    .slice(0, 4);
}

function buildKeyEvents(
  sign: ZodiacSign,
  year: number,
  month: Month,
): MonthlyEvent[] {
  const totalDays = getDaysInMonth(year, month);
  const events: MonthlyEvent[] = [];
  let previousChart: AstroChartInformation[] | null = null;

  for (let day = 1; day <= totalDays; day += 1) {
    const date = getMonthDate(year, month, day);
    const currentChart = getAstrologicalChart(date, DEFAULT_OBSERVER).filter(
      (body) => TRANSIT_BODIES.has(String(body.body)),
    );

    if (previousChart) {
      for (const current of currentChart) {
        const previous = previousChart.find(
          (body) => String(body.body) === String(current.body),
        );
        if (!previous) continue;

        const planet = String(current.body);
        const relation = getAspectForSign(
          SIGN_DISPLAY_NAMES[sign],
          current.sign,
        );
        const changedSign = previous.sign !== current.sign;
        const changedRetrograde = previous.retrograde !== current.retrograde;

        if (!relation) continue;

        if (changedSign) {
          events.push({
            dateLabel: formatDayLabel(date),
            title: `${planet} enters ${current.sign}`,
            meaning: `${planet} now ${ASPECT_VERBS[relation]} ${sign} themes from ${current.sign}, which ${ASPECT_INTERPRETATION[relation]}.`,
          });
        } else if (changedRetrograde) {
          events.push({
            dateLabel: formatDayLabel(date),
            title: `${planet} stations ${current.retrograde ? 'retrograde' : 'direct'} in ${current.sign}`,
            meaning: `${planet} shifts pace while still ${ASPECT_VERBS[relation]} ${sign} themes from ${current.sign}, so ${PLANET_THEMES[planet]} need a different tempo.`,
          });
        }
      }
    }

    previousChart = currentChart;
  }

  return events.slice(0, 4);
}

function buildCheckpointLines(sign: ZodiacSign, year: number, month: Month) {
  const totalDays = getDaysInMonth(year, month);
  const checkpoints = [1, Math.max(2, Math.ceil(totalDays / 2)), totalDays];

  return checkpoints.map((day, index) => {
    const date = getMonthDate(year, month, day);
    const moon = getAccurateMoonPhase(date);
    const sky = getAstrologicalChart(date, DEFAULT_OBSERVER);
    const moonSign = sky.find((body) => String(body.body) === 'Moon')?.sign;
    const strongest = getSignTransitsForDate(sign, date)
      .sort((a, b) => ASPECT_WEIGHTS[b.aspect] - ASPECT_WEIGHTS[a.aspect])
      .slice(0, 2);

    const transitLine =
      strongest.length > 0
        ? strongest
            .map(
              (item) =>
                `${item.planet} ${item.aspect} from ${item.transitSign}`,
            )
            .join('; ')
        : 'the sky is comparatively quiet';

    return `${MONTH_CHECKPOINT_LABELS[index]}: ${moon.name}${moonSign ? ` in ${moonSign}` : ''}, with ${transitLine}.`;
  });
}

function pickInfluence(
  influences: InfluenceSummary[],
  preferred: AspectType[],
): InfluenceSummary | null {
  return influences.find((item) => preferred.includes(item.aspect)) ?? null;
}

function buildThemePill(
  label: string,
  influence: InfluenceSummary | null,
): string {
  if (!influence) return label;
  return `${label}: ${influence.planet} ${influence.aspect}`;
}

export function buildMonthlyForecast(
  sign: ZodiacSign,
  year: number,
  month: Month,
): MonthlyForecast {
  const signName = SIGN_DISPLAY_NAMES[sign];
  const monthName = MONTH_DISPLAY_NAMES[month];
  const influences = findTopInfluences(sign, year, month);
  const supportive =
    pickInfluence(influences, ['trine', 'sextile', 'conjunction']) ??
    influences[0] ??
    null;
  const challenging =
    pickInfluence(influences, ['square', 'opposition']) ??
    influences[1] ??
    null;
  const checkpointLines = buildCheckpointLines(sign, year, month);
  const keyEvents = buildKeyEvents(sign, year, month);
  const monthMidpoint = getMonthDate(
    year,
    month,
    Math.max(2, Math.ceil(getDaysInMonth(year, month) / 2)),
  );
  const midpointMoon = getAccurateMoonPhase(monthMidpoint);
  const midpointSky = getAstrologicalChart(monthMidpoint, DEFAULT_OBSERVER);
  const midpointMoonSign =
    midpointSky.find((body) => String(body.body) === 'Moon')?.sign ??
    'unknown sign';

  const focus = supportive
    ? `${supportive.planet} is the cleanest helper for ${signName} this month. Because it ${ASPECT_VERBS[supportive.aspect]} from ${supportive.transitSign}, ${PLANET_THEMES[supportive.planet]} are where you get traction fastest.`
    : `${monthName} asks ${signName} to stay close to what feels real, paced, and actionable.`;

  const challenge = challenging
    ? `${challenging.planet} is the pressure point. It ${ASPECT_VERBS[challenging.aspect]} from ${challenging.transitSign}, so ${PLANET_THEMES[challenging.planet]} may feel noisy until you tighten your boundaries and timing.`
    : `${monthName} is less about crisis than consistency; the main risk is scattering your attention across too many priorities.`;

  const opportunity =
    supportive && challenging
      ? `The opening is to use ${supportive.planet.toLowerCase()} well while ${challenging.planet.toLowerCase()} keeps you honest. If you build around the supportive current instead of reacting to the tense one, ${monthName} becomes constructive rather than draining.`
      : supportive
        ? `The strongest opening comes through ${PLANET_THEMES[supportive.planet]}. ${monthName} rewards deliberate moves, not vague intention.`
        : `${monthName} rewards selective effort. Pick the part of life you can actually move and let the rest wait.`;

  const timing = checkpointLines.join(' ');

  const love =
    supportive?.planet === 'Venus'
      ? `Relationships are easier to move forward when you say the simple thing clearly and early. Venus is active for ${signName}, so attraction and values are not abstract topics this month; they want decisions.`
      : challenging?.planet === 'Venus'
        ? `Love is less about chasing intensity and more about noticing where expectations and reality diverge. If something feels off, slow the pace long enough to name it properly.`
        : `In love, ${signName} does better with steadiness than drama this month. Small honest adjustments will matter more than one big declaration.`;

  const career =
    supportive?.planet === 'Saturn' || challenging?.planet === 'Saturn'
      ? `Work and money respond to structure. Saturn is involved, which usually means the month gets better when you narrow scope, define the actual deliverable, and stop negotiating with vague deadlines.`
      : supportive?.planet === 'Jupiter'
        ? `Career momentum comes from visibility and useful expansion. Jupiter is helping, so pitches, publishing, and asking for a bigger container all make more sense than playing small.`
        : `Career matters improve when you focus on one measurable priority at a time. The month is less about dramatic wins and more about compounding clean decisions.`;

  const wellbeing =
    midpointMoon.name && midpointMoonSign
      ? `Your bandwidth is tied closely to the lunar rhythm. Around mid-month the Moon is ${midpointMoon.name} in ${midpointMoonSign}, so watch how your energy changes around that pivot instead of pushing through it blindly.`
      : `Your body will tell you the truth faster than your plans do this month. Build in more recovery than your ambitious brain thinks you need.`;

  const summary =
    supportive && challenging
      ? `${monthName} ${year} is not random for ${signName}: ${supportive.planet} helps, ${challenging.planet} tests, and the quality of the month depends on whether you work with the supportive current before the tense one hijacks your attention.`
      : `${monthName} ${year} asks ${signName} to be selective, responsive, and properly timed rather than generic.`;

  const tldr =
    supportive && challenging
      ? `${signName}: ${supportive.planet} gives you momentum, ${challenging.planet} adds pressure, and the win is using the opening before the friction turns into noise.`
      : `${signName}: the month works better when you stay precise about what matters and let the sky set the tempo.`;

  const whatToExpect = supportive
    ? `${monthName} ${year} for ${signName} is shaped most clearly by ${supportive.planet} in ${supportive.transitSign}, which ${ASPECT_VERBS[supportive.aspect]} your sign and keeps ${PLANET_THEMES[supportive.planet]} on the front burner.`
    : `${monthName} ${year} for ${signName} is more about timing and selective focus than one dominant transit.`;

  const tableRows: string[][] = [
    [
      'Strongest support',
      supportive
        ? summariseInfluence(supportive)
        : 'No single supportive transit dominates the month.',
    ],
    [
      'Main pressure point',
      challenging
        ? summariseInfluence(challenging)
        : 'No single tense transit dominates the month.',
    ],
    [
      'Mid-month lunar tone',
      `${midpointMoon.name} in ${midpointMoonSign} — useful for checking the emotional pace of the month before you overcommit.`,
    ],
    ['Start / middle / end', checkpointLines.join(' ')],
  ];

  return {
    summary,
    tldr,
    whatToExpect,
    focus,
    challenge,
    opportunity,
    timing,
    love,
    career,
    wellbeing,
    faqs: [
      {
        question: `What can ${signName} expect in ${monthName} ${year}?`,
        answer: summary,
      },
      {
        question: `What is the main challenge for ${signName} in ${monthName} ${year}?`,
        answer: challenge,
      },
      {
        question: `What is the main opportunity for ${signName} in ${monthName} ${year}?`,
        answer: opportunity,
      },
    ],
    emotionalThemes: [
      buildThemePill('Support', supportive),
      buildThemePill('Pressure', challenging),
      `Moon pivot: ${midpointMoon.name}`,
      `Timing: ${monthName} wants response, not autopilot`,
    ],
    tableRows,
    keyEvents,
  };
}

export function buildTransitWindowSnapshot(
  sign: ZodiacSign,
  startDate: Date,
  endDate: Date,
  label: string,
): TransitWindowSnapshot {
  const signName = SIGN_DISPLAY_NAMES[sign];
  const influences = findTopInfluencesForWindow(sign, startDate, endDate);
  const supportive =
    pickInfluence(influences, ['trine', 'sextile', 'conjunction']) ??
    influences[0] ??
    null;
  const challenging =
    pickInfluence(influences, ['square', 'opposition']) ??
    influences[1] ??
    null;
  const moon = getAccurateMoonPhase(toUtcNoon(startDate));
  const moonSky = getAstrologicalChart(toUtcNoon(startDate), DEFAULT_OBSERVER);
  const moonSign =
    moonSky.find((body) => String(body.body) === 'Moon')?.sign ??
    'unknown sign';

  return {
    summary:
      supportive && challenging
        ? `${label} for ${signName} is shaped by ${supportive.planet} giving you room to move while ${challenging.planet} applies pressure.`
        : `${label} for ${signName} is more about timing and selectivity than dramatic sky events.`,
    focus: supportive
      ? `${supportive.planet} is the cleanest support. It ${ASPECT_VERBS[supportive.aspect]} from ${supportive.transitSign}, so ${PLANET_THEMES[supportive.planet]} are where your best leverage sits.`
      : `${label} rewards precision and follow-through over emotional overreach.`,
    challenge: challenging
      ? `${challenging.planet} is the friction point. It ${ASPECT_VERBS[challenging.aspect]} from ${challenging.transitSign}, so ${PLANET_THEMES[challenging.planet]} need more discipline than instinct.`
      : `The main risk is scattering energy across too many open loops.`,
    opportunity:
      supportive && challenging
        ? `Use the ${supportive.planet.toLowerCase()} opening before the ${challenging.planet.toLowerCase()} pressure becomes the loudest thing in the room.`
        : supportive
          ? `Put your energy where ${supportive.planet.toLowerCase()} is already helping rather than forcing the month to behave differently.`
          : `Keep the scope tight and act on the signal that feels concrete instead of waiting for certainty.`,
    moonTone: `${moon.name} in ${moonSign} sets the emotional tone at the start of ${label.toLowerCase()}.`,
  };
}
