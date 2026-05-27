import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBirthChartWithHouses } from 'utils/astrology/birthChart';
import { checkRateLimit } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  name: z.string().trim().max(80).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  birthLocation: z.string().trim().min(2).max(200),
  birthTimezone: z.string().trim().max(80).optional(),
  campaignKey: z.string().trim().max(120).optional(),
  keyword: z.string().trim().max(40).optional(),
  source: z.string().trim().max(120).optional(),
  focusTitle: z.string().trim().max(140).optional(),
  focusSign: z
    .enum([
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
    ])
    .optional(),
  focusPlanet: z.string().trim().max(40).optional(),
  focusDate: z.string().trim().max(40).optional(),
});

const ELEMENT_BY_SIGN: Record<string, string> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
};

const MODALITY_BY_SIGN: Record<string, string> = {
  Aries: 'Cardinal',
  Cancer: 'Cardinal',
  Libra: 'Cardinal',
  Capricorn: 'Cardinal',
  Taurus: 'Fixed',
  Leo: 'Fixed',
  Scorpio: 'Fixed',
  Aquarius: 'Fixed',
  Gemini: 'Mutable',
  Virgo: 'Mutable',
  Sagittarius: 'Mutable',
  Pisces: 'Mutable',
};

const RULER_BY_SIGN: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

const PLANET_COPY: Record<string, string> = {
  Sun: 'your central direction and the part of you that wants to grow into itself',
  Moon: 'your emotional weather, needs, instincts, and what helps you feel safe',
  Ascendant:
    'the doorway of your chart: how life meets you and how you move first',
  Mercury:
    'your thinking style, communication habits, and how you make sense of things',
  Venus:
    'your taste, attraction patterns, pleasure, money style, and what feels worth choosing',
  Mars: 'your drive, friction point, courage, and how you act when something matters',
  Jupiter: 'where growth, belief, generosity, and opportunity tend to expand',
  Saturn:
    'where you build maturity, boundaries, discipline, and long-term trust',
  Midheaven:
    'your public direction, visible work, reputation, and long-range calling',
};

const ELEMENT_COPY: Record<string, string> = {
  Fire: 'quick instinct, creative spark, courage, and visible momentum',
  Earth: 'practical focus, embodiment, reliability, and tangible proof',
  Air: 'ideas, language, pattern recognition, connection, and perspective shifts',
  Water: 'feeling, intuition, memory, sensitivity, and emotional truth',
};

const MODALITY_COPY: Record<string, string> = {
  Cardinal:
    'starts motion and tends to feel better when there is a clear next step',
  Fixed:
    'holds energy steadily and tends to need depth, loyalty, and real buy-in',
  Mutable:
    'adapts quickly and tends to learn through movement, variety, and translation',
};

const CORE_BODIES = [
  'Sun',
  'Moon',
  'Ascendant',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Midheaven',
];

const HOUSE_TRANSIT_CARD_COPY: Record<
  number,
  { watchFor: string; tryThis: string; journalPrompt: string }
> = {
  1: {
    watchFor:
      'A shift in identity, visibility, confidence, or how you enter the room.',
    tryThis:
      'Choose one visible action that reflects the version of you that is arriving.',
    journalPrompt:
      'What do I want people to understand about me before I explain myself?',
  },
  2: {
    watchFor:
      'A shift around money, values, appetite, security, or what feels worth protecting.',
    tryThis:
      'Name the one practical resource that would make you feel more grounded this week.',
    journalPrompt:
      'What am I treating as valuable because it truly supports me?',
  },
  3: {
    watchFor:
      'A shift in language, learning, messages, siblings, neighbours, or daily decisions.',
    tryThis:
      'Write the sentence you keep avoiding, then simplify it until it is honest.',
    journalPrompt: 'What needs to be said plainly instead of perfectly?',
  },
  4: {
    watchFor:
      'A shift in home, privacy, memory, family patterns, or emotional foundations.',
    tryThis:
      'Make one small private change that helps your nervous system feel safer.',
    journalPrompt:
      'What do I need at home that I have been trying to source elsewhere?',
  },
  5: {
    watchFor:
      'A shift in creativity, romance, pleasure, play, or the courage to be seen.',
    tryThis:
      'Make one thing for pleasure before you optimise it for usefulness.',
    journalPrompt: 'Where have I mistaken being impressive for being alive?',
  },
  6: {
    watchFor:
      'A shift in work rhythms, health habits, maintenance, service, or daily load.',
    tryThis: 'Remove one unnecessary step from a routine you repeat every day.',
    journalPrompt:
      'What would feel lighter if I stopped overcomplicating the system?',
  },
  7: {
    watchFor:
      'A shift in partnership, close bonds, contracts, mirrors, or direct conversations.',
    tryThis:
      'Ask for the clearest version of what you need, without making it a test.',
    journalPrompt:
      'What am I learning about myself through the people closest to me?',
  },
  8: {
    watchFor:
      'A shift in trust, intimacy, shared resources, grief, debt, or deep repair.',
    tryThis:
      'Name the boundary, truth, or support structure that would make trust cleaner.',
    journalPrompt: 'What am I ready to stop carrying alone?',
  },
  9: {
    watchFor:
      'A shift in belief, travel, study, publishing, teaching, or wider meaning.',
    tryThis:
      'Choose one idea worth testing in the real world instead of only thinking about it.',
    journalPrompt:
      'What belief is becoming too small for the life I am building?',
  },
  10: {
    watchFor:
      'A shift in career, reputation, visibility, leadership, or public contribution.',
    tryThis:
      'Make one public move that matches the work you want to be known for.',
    journalPrompt:
      'What do I want my work to prove without me having to overexplain it?',
  },
  11: {
    watchFor:
      'A shift in community, networks, audience, hopes, groups, or shared futures.',
    tryThis:
      'Reach towards one person, space, or audience that matches the future you want.',
    journalPrompt: 'Where am I ready to be known by the right people?',
  },
  12: {
    watchFor:
      'A shift in rest, closure, dreams, hidden patterns, healing, or private processing.',
    tryThis:
      'Create one hour with less input so the pattern can come to the surface.',
    journalPrompt:
      'What becomes obvious when I stop filling every quiet space?',
  },
};

function houseName(house?: number) {
  if (!house) return null;
  const names: Record<number, string> = {
    1: 'identity and self-presentation',
    2: 'money, values, body, and security',
    3: 'voice, learning, siblings, and daily communication',
    4: 'home, roots, privacy, and emotional foundations',
    5: 'creativity, romance, pleasure, and self-expression',
    6: 'workflows, health habits, service, and maintenance',
    7: 'partnerships, mirrors, contracts, and close bonds',
    8: 'intimacy, shared resources, trust, and transformation',
    9: 'belief, travel, study, publishing, and wider meaning',
    10: 'career, reputation, visibility, and public contribution',
    11: 'community, networks, hopes, and collective work',
    12: 'rest, closure, hidden patterns, healing, and the unconscious',
  };
  return names[house] ?? null;
}

function degreeLabel(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `${Math.floor(value)}°`;
}

function signupUrl(input: z.infer<typeof RequestSchema>, reportId: string) {
  const params = new URLSearchParams({
    hub: 'free-chart',
    location: 'free_chart_report',
    pagePath: '/free-chart',
    birthDate: input.birthDate,
    headline: 'Save your free chart report',
    subline:
      'Create your Lunary account to save your chart, unlock houses, and see current transits against your placements.',
    campaignKey: input.campaignKey || 'lunary-free-chart-report',
    reportId,
  });
  if (input.birthTime) params.set('birthTime', input.birthTime);
  if (input.birthLocation) params.set('birthLocation', input.birthLocation);
  if (input.birthTimezone) params.set('birthTimezone', input.birthTimezone);
  if (input.keyword) params.set('keyword', input.keyword);
  return `/signup/chart?${params.toString()}`;
}

function placementCopy(body: string, sign: string, house?: number) {
  const houseText = houseName(house);
  const base = PLANET_COPY[body] ?? 'one of your chart signals';
  if (!houseText) {
    return `${body} in ${sign} points to ${base}. Add birth time to connect this placement to a life area.`;
  }
  return `${body} in ${sign} in the ${house} house connects ${base} with ${houseText}.`;
}

function buildFocusCheck({
  focusTitle,
  focusSign,
  focusPlanet,
  focusDate,
  hasBirthTime,
  houses,
}: {
  focusTitle?: string;
  focusSign?: string;
  focusPlanet?: string;
  focusDate?: string;
  hasBirthTime: boolean;
  houses: Array<{ house: number; sign: string }>;
}) {
  if (!focusSign) return null;

  const matchedHouse = hasBirthTime
    ? houses.find((house) => house.sign === focusSign)
    : null;
  const houseTheme = matchedHouse ? houseName(matchedHouse.house) : null;
  const title =
    focusTitle ||
    `${focusPlanet ? `${focusPlanet} in ` : ''}${focusSign} in your chart`;

  return {
    title,
    sign: focusSign,
    planet: focusPlanet || null,
    date: focusDate || null,
    house: matchedHouse?.house ?? null,
    houseTheme,
    note:
      hasBirthTime && matchedHouse
        ? `${title} lands in your ${matchedHouse.house} house: ${houseTheme}. This is the personal doorway for the public sky event.`
        : 'Add birth time to see the house this lands in. Without birth time, Lunary can show the sign story but not the exact life area.',
  };
}

function buildPersonalTransitCard({
  keyword,
  focusTitle,
  focusSign,
  focusPlanet,
  focusDate,
  hasBirthTime,
  houses,
}: {
  keyword?: string;
  focusTitle?: string;
  focusSign?: string;
  focusPlanet?: string;
  focusDate?: string;
  hasBirthTime: boolean;
  houses: Array<{ house: number; sign: string }>;
}) {
  if (keyword?.trim().toUpperCase() !== 'SAVE' || !focusSign) return null;

  const matchedHouse = hasBirthTime
    ? houses.find((house) => house.sign === focusSign)
    : null;
  const houseTheme = matchedHouse ? houseName(matchedHouse.house) : null;
  const cardCopy = matchedHouse
    ? HOUSE_TRANSIT_CARD_COPY[matchedHouse.house]
    : null;
  const title =
    focusTitle ||
    `${focusPlanet ? `${focusPlanet} in ` : ''}${focusSign} transit card`;

  return {
    label: 'personal transit card',
    title,
    sign: focusSign,
    planet: focusPlanet || null,
    date: focusDate || null,
    house: matchedHouse?.house ?? null,
    houseTheme,
    watchFor:
      cardCopy?.watchFor ||
      'Add birth time to make this card specific to the house it activates.',
    tryThis:
      cardCopy?.tryThis ||
      'Save your chart in Lunary so the next card can use your houses.',
    journalPrompt:
      cardCopy?.journalPrompt ||
      'What changes when this sky event becomes personal instead of generic?',
  };
}

function leadCaptureForInput(input: z.infer<typeof RequestSchema>) {
  const keyword = input.keyword?.trim().toUpperCase();
  if (keyword === 'SAVE') {
    return {
      emailTag: 'lead:personal-transit-card',
      source: input.source || 'personal_transit_card',
    };
  }
  if (keyword === 'WHERE' || input.focusSign) {
    return {
      emailTag: 'lead:transit-house-check',
      source: input.source || 'transit_house_check',
    };
  }
  if (keyword === 'RULER') {
    return {
      emailTag: 'lead:chart-ruler',
      source: input.source || 'chart_ruler_starter',
    };
  }
  if (keyword === 'RISING') {
    return {
      emailTag: 'lead:rising-sign',
      source: input.source || 'rising_sign_unlock',
    };
  }
  return {
    emailTag: 'lead:free-chart-report',
    source: input.source || 'free_chart_report',
  };
}

function buildRisingUnlock({
  keyword,
  hasBirthTime,
  ascendant,
  chartRuler,
  chartRulerPlacement,
}: {
  keyword?: string;
  hasBirthTime: boolean;
  ascendant?: { sign: string; house?: number };
  chartRuler: string | null;
  chartRulerPlacement?: { sign: string; house?: number } | null;
}) {
  if (keyword?.trim().toUpperCase() !== 'RISING') return null;

  if (!hasBirthTime || !ascendant) {
    return {
      label: 'rising sign unlock',
      title: 'Add birth time to unlock your rising sign',
      sign: null,
      house: null,
      chartRuler: null,
      chartRulerSign: null,
      chartRulerHouse: null,
      note: 'Your rising sign needs birth time because it changes through the day. Add it to see the doorway of the chart and the planet that leads it.',
    };
  }

  const chartRulerText = chartRulerPlacement
    ? `${chartRuler} in ${chartRulerPlacement.sign}${
        chartRulerPlacement.house ? `, H${chartRulerPlacement.house}` : ''
      }`
    : chartRuler;

  return {
    label: 'rising sign unlock',
    title: `${ascendant.sign} rising`,
    sign: ascendant.sign,
    house: ascendant.house ?? null,
    chartRuler,
    chartRulerSign: chartRulerPlacement?.sign ?? null,
    chartRulerHouse: chartRulerPlacement?.house ?? null,
    note: `Your ${ascendant.sign} rising is the front door of your chart: how life meets you first. ${
      chartRulerText
        ? `${chartRulerText} shows the first thread to follow.`
        : 'Save the full chart to inspect its ruling planet.'
    }`,
  };
}

function buildPattern({
  sunSign,
  moonSign,
  ascendantSign,
  hasBirthTime,
}: {
  sunSign?: string;
  moonSign?: string;
  ascendantSign?: string;
  hasBirthTime: boolean;
}) {
  const sunElement = sunSign ? ELEMENT_BY_SIGN[sunSign] : null;
  const moonElement = moonSign ? ELEMENT_BY_SIGN[moonSign] : null;
  const sunModality = sunSign ? MODALITY_BY_SIGN[sunSign] : null;

  const title =
    hasBirthTime && ascendantSign
      ? `${ascendantSign} rising, ${sunSign ?? 'unknown'} Sun, ${moonSign ?? 'unknown'} Moon`
      : `${sunSign ?? 'Your'} Sun with ${moonSign ?? 'your'} Moon`;

  const signals = [
    sunElement
      ? `Your Sun carries ${sunElement.toLowerCase()} energy: ${ELEMENT_COPY[sunElement]}.`
      : null,
    sunModality
      ? `${sunSign} is ${sunModality.toLowerCase()}: it ${MODALITY_COPY[sunModality]}.`
      : null,
    moonElement
      ? `Your Moon brings ${moonElement.toLowerCase()} needs: ${ELEMENT_COPY[moonElement]}.`
      : null,
  ].filter(Boolean);

  return {
    title,
    body: hasBirthTime
      ? 'The useful starting point is not one placement. It is how your identity, emotional needs, and rising-sign doorway work together.'
      : 'This is the honest partial version. The planets are useful, but your rising sign, houses, and exact personal timing need birth time and place.',
    signals,
  };
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const { allowed } = checkRateLimit(
    `free-chart-report:${ip}`,
    8,
    10 * 60 * 1000,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const birthDate = new Date(`${input.birthDate}T00:00:00.000Z`);
  const isValidBirthDate =
    !Number.isNaN(birthDate.getTime()) &&
    birthDate.toISOString().slice(0, 10) === input.birthDate;
  const year = birthDate.getUTCFullYear();
  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  if (!isValidBirthDate || year < 1900 || birthDate > todayUtc) {
    return NextResponse.json(
      { error: 'Birth date must be between 1900 and today.' },
      { status: 400 },
    );
  }

  const hasBirthTime = Boolean(input.birthTime);
  const reportId = crypto.randomUUID();
  const leadCapture = leadCaptureForInput(input);

  try {
    const chart = await generateBirthChartWithHouses(
      input.birthDate,
      input.birthTime,
      input.birthLocation,
      input.birthTimezone,
    );

    const core = chart.planets
      .filter((planet) => CORE_BODIES.includes(planet.body))
      .filter((planet) =>
        hasBirthTime ? true : !['Ascendant', 'Midheaven'].includes(planet.body),
      )
      .map((planet) => ({
        body: planet.body,
        sign: planet.sign,
        degree: degreeLabel(planet.degree),
        house: hasBirthTime ? planet.house : undefined,
        headline: `${planet.body} in ${planet.sign}`,
        meaning: placementCopy(
          planet.body,
          planet.sign,
          hasBirthTime ? planet.house : undefined,
        ),
      }));

    const sun = core.find((planet) => planet.body === 'Sun');
    const moon = core.find((planet) => planet.body === 'Moon');
    const ascendant = hasBirthTime
      ? core.find((planet) => planet.body === 'Ascendant')
      : undefined;
    const chartRuler = ascendant?.sign ? RULER_BY_SIGN[ascendant.sign] : null;
    const chartRulerPlacement = chartRuler
      ? core.find((planet) => planet.body === chartRuler)
      : null;

    return NextResponse.json({
      schemaVersion: '2026-05-23.4',
      reportId,
      generatedAt: new Date().toISOString(),
      campaignKey: input.campaignKey || 'lunary-free-chart-report',
      accuracy: {
        level: hasBirthTime ? 'chart-ready-preview' : 'partial-date-preview',
        hasBirthTime,
        hasBirthLocation: Boolean(input.birthLocation),
        note: hasBirthTime
          ? 'This preview can include rising sign, houses, and chart-ruler context. Save your chart in Lunary to unlock the full reading.'
          : 'This preview uses date and place, but no birth time. Moon, rising sign, houses, and timing may be incomplete.',
      },
      greeting: input.name ? `${input.name}, start here.` : 'Start here.',
      placements: core,
      pattern: buildPattern({
        sunSign: sun?.sign,
        moonSign: moon?.sign,
        ascendantSign: ascendant?.sign,
        hasBirthTime,
      }),
      focus: buildFocusCheck({
        focusTitle: input.focusTitle,
        focusSign: input.focusSign,
        focusPlanet: input.focusPlanet,
        focusDate: input.focusDate,
        hasBirthTime,
        houses: chart.houses,
      }),
      personalTransitCard: buildPersonalTransitCard({
        keyword: input.keyword,
        focusTitle: input.focusTitle,
        focusSign: input.focusSign,
        focusPlanet: input.focusPlanet,
        focusDate: input.focusDate,
        hasBirthTime,
        houses: chart.houses,
      }),
      risingUnlock: buildRisingUnlock({
        keyword: input.keyword,
        hasBirthTime,
        ascendant,
        chartRuler,
        chartRulerPlacement,
      }),
      chartRuler: chartRuler
        ? {
            planet: chartRuler,
            sign: chartRulerPlacement?.sign ?? null,
            house: chartRulerPlacement?.house ?? null,
            note: chartRulerPlacement
              ? `Your ${ascendant?.sign} rising points to ${chartRuler} as your chart ruler. Its placement shows the thread to follow first.`
              : `Your ${ascendant?.sign} rising points to ${chartRuler} as your chart ruler. Save your full chart to inspect it properly.`,
          }
        : null,
      nextSteps: [
        hasBirthTime
          ? 'Save this chart so Lunary can show where current transits land in your houses.'
          : 'Add your birth time to unlock rising sign, houses, chart ruler, and more exact timing.',
        'Use your Sun, Moon, and Rising together before reading single-placement astrology.',
        'Check current transits against your chart instead of reading generic sky updates.',
      ],
      leadCapture: {
        emailTag: leadCapture.emailTag,
        source: leadCapture.source,
        commentKeywords: [
          {
            keyword: 'CHART',
            promise: 'free birth chart quickstart',
          },
          {
            keyword: 'WHERE',
            promise: 'where the current transit lands in your chart',
          },
          {
            keyword: 'RISING',
            promise: 'your rising sign and chart ruler starter',
          },
          {
            keyword: 'SAVE',
            promise: 'a personal transit card to keep',
          },
          {
            keyword: 'RULER',
            promise: 'your chart ruler starter map',
          },
        ],
      },
      signupUrl: signupUrl(input, reportId),
      disclaimer:
        'Astrology is a reflective tool, not a deterministic prediction. Lunary uses astronomy-backed calculations and keeps date-specific sky claims separate from chart meanings.',
    });
  } catch (error) {
    console.error('[free-chart-report] failed');
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json(
      { error: 'Could not generate your chart preview.' },
      { status: 500 },
    );
  }
}
