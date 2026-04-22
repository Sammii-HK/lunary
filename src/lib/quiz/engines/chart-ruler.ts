import type {
  BirthChartData,
  BirthChartResult,
} from '@utils/astrology/birthChart';
import { getHouse, getPlanetInSign, getRisingSign } from '../grimoire-lookup';
import { getRulingPlanet, normalizeSign } from '../rulers';
import { getDignity } from '../dignities';
import { getHouseNature } from '../chart-analysis';
import { selectArchetype } from '../archetypes';
import { findAspect, getAspectInterpretation } from '../aspects';
import type { HouseNumber, PlanetKey, QuizResult, QuizSection } from '../types';

const OUTER_PLANETS: PlanetKey[] = ['uranus', 'neptune', 'pluto'];

// For the aspect section, we consider the chart ruler's aspects to the
// seven traditional planets (minus itself if it happens to be one of them).
const ASPECT_TARGETS: { key: PlanetKey; display: string }[] = [
  { key: 'sun', display: 'Sun' },
  { key: 'moon', display: 'Moon' },
  { key: 'mercury', display: 'Mercury' },
  { key: 'venus', display: 'Venus' },
  { key: 'mars', display: 'Mars' },
  { key: 'jupiter', display: 'Jupiter' },
  { key: 'saturn', display: 'Saturn' },
];

function cohortWindow(planet: PlanetKey, sign: string): string {
  // Rough generational windows for outer planets in each sign. Precise-enough
  // for cohort framing; not meant for strict astro calculations.
  const windows = {
    uranus: {
      Aries: '2010–2018',
      Taurus: '2018–2026',
      Gemini: '2026–2033',
      Cancer: '1949–1956',
      Leo: '1956–1962',
      Virgo: '1962–1969',
      Libra: '1969–1975',
      Scorpio: '1975–1981',
      Sagittarius: '1981–1988',
      Capricorn: '1988–1996',
      Aquarius: '1996–2003',
      Pisces: '2003–2011',
    },
    neptune: {
      Aries: '2025–2039',
      Taurus: '1874–1889',
      Gemini: '1887–1902',
      Cancer: '1901–1915',
      Leo: '1914–1929',
      Virgo: '1928–1943',
      Libra: '1942–1957',
      Scorpio: '1955–1970',
      Sagittarius: '1970–1984',
      Capricorn: '1984–1998',
      Aquarius: '1998–2012',
      Pisces: '2011–2025',
    },
    pluto: {
      Aries: '2023–2044',
      Taurus: '1851–1884',
      Gemini: '1882–1914',
      Cancer: '1913–1939',
      Leo: '1937–1958',
      Virgo: '1956–1972',
      Libra: '1971–1984',
      Scorpio: '1983–1995',
      Sagittarius: '1995–2008',
      Capricorn: '2008–2024',
      Aquarius: '2023–2044',
      Pisces: '',
    },
  } as Partial<Record<PlanetKey, Record<string, string>>>;
  return windows[planet]?.[sign] ?? '';
}

const PLANET_DISPLAY: Record<PlanetKey, string> = {
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
};

function findBody(
  chart: BirthChartResult,
  body: string,
): BirthChartData | undefined {
  return chart.planets.find((p) => p.body === body);
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = ['th', 'st', 'nd', 'rd'][mod10] ?? 'th';
  return `${n}${mod10 > 3 ? 'th' : suffix}`;
}

export type ChartRulerOptions = {
  unlocked?: boolean;
};

export function composeChartRulerResult(
  chart: BirthChartResult,
  options: ChartRulerOptions = {},
): QuizResult | null {
  const unlocked = options.unlocked === true;
  const ascendant = findBody(chart, 'Ascendant');
  if (!ascendant) return null;

  const risingSignKey = normalizeSign(ascendant.sign);
  if (!risingSignKey) return null;

  const rulerPlanet = getRulingPlanet(risingSignKey);
  const rulerBody = findBody(chart, PLANET_DISPLAY[rulerPlanet]);
  if (!rulerBody) return null;

  const rulerSignKey = normalizeSign(rulerBody.sign);
  if (!rulerSignKey) return null;

  const rulerHouse = rulerBody.house as HouseNumber | undefined;
  const planetInSign = getPlanetInSign(rulerPlanet, rulerSignKey);
  const houseEntry = rulerHouse ? getHouse(rulerHouse) : null;
  const risingEntry = getRisingSign(risingSignKey);

  // --- Derived signals ---
  const dignity = getDignity(rulerPlanet, rulerSignKey);
  const houseNature = rulerHouse ? getHouseNature(rulerHouse) : 'cadent';
  const rulerInRising = rulerSignKey === risingSignKey;
  const retrograde = rulerBody.retrograde === true;

  const archetype = selectArchetype({
    dignity,
    houseNature,
    houseNumber: rulerHouse ?? null,
    rulerInRising,
    retrograde,
  });

  const planetDisplay = PLANET_DISPLAY[rulerPlanet];
  const rulerSignDisplay = rulerBody.sign;
  const risingSignDisplay = ascendant.sign;
  const houseDisplay = rulerHouse ? `${ordinal(rulerHouse)} house` : 'chart';

  // Build the flavour tags shown in the headline chip row
  const headlineTags: string[] = [];
  if (dignity === 'domicile') headlineTags.push('In rulership');
  else if (dignity === 'exaltation') headlineTags.push('Exalted');
  else if (dignity === 'detriment') headlineTags.push('In detriment');
  else if (dignity === 'fall') headlineTags.push('In fall');
  if (rulerInRising) headlineTags.push('Rules itself');
  if (houseNature === 'angular') headlineTags.push('Angular');
  if (retrograde) headlineTags.push('Retrograde');

  const sections: QuizSection[] = [];

  // --- Section: practical translation of the signals ---
  // This section never re-states what the hero already said. It translates each
  // detected signal into "because X, your lived experience is Y". No technical
  // terminology unless the reader needs it to decode a single specific phrase.
  const practicalParts: string[] = [];
  if (dignity === 'domicile') {
    practicalParts.push(
      `Because ${planetDisplay} is in its own sign, this side of you doesn't feel performed or translated. It's your default mode, not an effort. You don't "switch on" to be ${rulerSignDisplay} — you are.`,
    );
  } else if (dignity === 'exaltation') {
    practicalParts.push(
      `Because ${planetDisplay} is exalted here, you show this side of yourself at its brightest. When you lean into it, people respond with unusual clarity — they recognise the signal, even if they can't name it.`,
    );
  } else if (dignity === 'detriment') {
    practicalParts.push(
      `Because ${planetDisplay} operates against the grain of ${rulerSignDisplay}, you've had to reshape the standard ${rulerSignDisplay} template to fit what ${planetDisplay} actually wants. It's more work, but it's also why you don't read as a ${rulerSignDisplay} stereotype.`,
    );
  } else if (dignity === 'fall') {
    practicalParts.push(
      `Because ${planetDisplay} is in fall here, this is the placement you grow through. It's the source of your most transformative work — usually the hard way, first. But the depth you build here is legitimately rare.`,
    );
  }

  if (rulerInRising) {
    practicalParts.push(
      `Because your chart ruler is in the sign that also rises for you, there is no translation layer between who you appear to be and who you actually are. Your rising isn't a mask over a different core. It's the same signal twice.`,
    );
  }

  if (houseNature === 'angular') {
    practicalParts.push(
      `Because it sits in an angular house, people pick up on this about you fast — often within minutes of meeting you. It's visible before you've said anything. You can't hide it, and you probably shouldn't try.`,
    );
  } else if (houseNature === 'succedent') {
    practicalParts.push(
      `Because it sits in a succedent house, this side of you builds and accumulates rather than announces. It shows up in what you have, what you've made, what you've held on to — not in the first impression.`,
    );
  } else if (houseNature === 'cadent') {
    practicalParts.push(
      `Because it sits in a cadent house, this side of you runs behind the scenes. It processes more than it performs. People who meet you casually may miss it entirely; people who know you long-term build their whole picture from it.`,
    );
  }

  if (retrograde) {
    practicalParts.push(
      `Because ${planetDisplay} is retrograde at your birth, you process this side of you internally before you show it. What looks spontaneous in you has almost always been chewed on quietly first.`,
    );
  }

  if (practicalParts.length > 0) {
    sections.push({
      heading: 'What this actually means for you',
      body: practicalParts.join(' '),
    });
  }

  // --- Section: rising sign framing ---
  if (risingEntry) {
    sections.push({
      heading: `Your ${risingSignDisplay} Rising sets the stage`,
      body: risingEntry.firstImpression,
      highlight:
        risingEntry.coreTraits[0] !== undefined
          ? `First impression: ${risingEntry.coreTraits[0]}.`
          : undefined,
    });
  }

  // --- Section: chart ruler interpretation ---
  if (planetInSign) {
    const body =
      (planetInSign.lifeThemes as string) ??
      (planetInSign.coreTraits
        ? `Core traits: ${(planetInSign.coreTraits as string[]).join(', ')}.`
        : `${planetDisplay} in ${rulerSignDisplay} shapes how your chart ruler shows up.`);
    sections.push({
      heading: `${planetDisplay} in ${rulerSignDisplay} runs the show`,
      body,
      bullets: (planetInSign.coreTraits as string[] | undefined)?.slice(0, 4),
    });
  }

  // --- Section: house context ---
  if (houseEntry) {
    sections.push({
      heading: `Focused through your ${houseEntry.name.toLowerCase()}`,
      body: houseEntry.description,
      highlight: `Life area: ${houseEntry.lifeArea}.`,
    });
  }

  if (unlocked) {
    // --- Full unlock: physical presence (from rising sign) ---
    if (risingEntry?.physicalAppearance) {
      sections.push({
        heading: 'How you physically show up',
        body: risingEntry.physicalAppearance,
      });
    }

    // --- Full unlock: how others see you (from rising sign) ---
    if (risingEntry?.howOthersSeeYou) {
      sections.push({
        heading: 'How others see you',
        body: risingEntry.howOthersSeeYou,
      });
    }

    // --- Full unlock: your life approach (from rising sign) ---
    if (risingEntry?.lifeApproach) {
      sections.push({
        heading: 'How you approach life',
        body: risingEntry.lifeApproach,
      });
    }

    // --- Full unlock: aspects to the chart ruler ---
    // Pull the top 3 tightest aspects between the chart ruler and the
    // traditional seven (minus itself). These are the "secondary threads"
    // shaping how the chart ruler actually expresses.
    const rulerLongitude = rulerBody.eclipticLongitude;
    type AspectEntry = {
      targetDisplay: string;
      aspectType: string;
      orb: number;
      meaning: string;
      description: string;
    };
    const aspectEntries: AspectEntry[] = [];
    for (const target of ASPECT_TARGETS) {
      if (target.key === rulerPlanet) continue;
      const targetBody = findBody(chart, target.display);
      if (!targetBody) continue;
      const aspect = findAspect(rulerLongitude, targetBody.eclipticLongitude);
      if (!aspect) continue;
      const interp = getAspectInterpretation(
        planetDisplay,
        target.display,
        aspect.type,
      );
      if (!interp) continue;
      aspectEntries.push({
        targetDisplay: target.display,
        aspectType: aspect.type,
        orb: aspect.orb,
        meaning: interp.meaning,
        description: interp.description,
      });
    }
    aspectEntries.sort((a, b) => a.orb - b.orb);
    const topAspects = aspectEntries.slice(0, 3);
    if (topAspects.length > 0) {
      sections.push({
        heading: `Aspects shaping your ${planetDisplay}`,
        body: `These are the three tightest aspects your chart ruler makes with the classical seven. They colour how ${planetDisplay} actually shows up day to day.`,
        bullets: topAspects.map(
          (a) =>
            `${planetDisplay} ${a.aspectType.toLowerCase()} ${a.targetDisplay} (${a.meaning}): ${a.description}`,
        ),
      });
    }

    // --- Full unlock: strengths ---
    if (planetInSign?.strengths) {
      sections.push({
        heading: 'Your strengths through this chart ruler',
        body: `How ${planetDisplay} in ${rulerSignDisplay} shows up at its best.`,
        bullets: planetInSign.strengths as string[],
      });
    }

    // --- Full unlock: challenges ---
    if (planetInSign?.challenges) {
      sections.push({
        heading: 'The growth edge',
        body: `Where this configuration asks for conscious work. These aren't flaws — they're the places your chart ruler's expression gets sharper with attention.`,
        bullets: planetInSign.challenges as string[],
      });
    }

    // --- Full unlock: career ---
    if (planetInSign?.careerPaths) {
      sections.push({
        heading: 'Where this lands in career',
        body: planetInSign.careerPaths as string,
      });
    }

    // --- Full unlock: others who share this chart ruler ---
    // Chart ruler is determined by rising sign. So the people who genuinely
    // share YOUR chart ruler are people with the same rising — not people
    // who share your specific planet-in-sign placement (that's a different
    // axis). rising-signs.json has curated famous examples by rising sign.
    if (risingEntry?.famousExamples) {
      sections.push({
        heading: 'Others who share this chart ruler',
        body: `Anyone with ${risingSignDisplay} Rising has ${planetDisplay} as their chart ruler — the exact sign and house their ${planetDisplay} sits in will differ from yours, but the planet directing their chart is the same. Known ${risingSignDisplay} Risings include ${risingEntry.famousExamples}.`,
      });
    }

    // --- Full unlock: generation context (outer planets only) ---
    // For Uranus/Neptune/Pluto rulers, the planet-in-sign placement is
    // generational. This section clarifies that your SPECIFIC placement is
    // cohort-wide, but your chart ruler is still personal because of your
    // rising sign. No celebrity list here — we don't know the risings of
    // celebrities born in this window, so naming them would be misleading.
    if (OUTER_PLANETS.includes(rulerPlanet)) {
      const window = cohortWindow(rulerPlanet, rulerSignDisplay);
      sections.push({
        heading: 'Your generation',
        body: `${planetDisplay} in ${rulerSignDisplay} is a generational placement — ${planetDisplay} stays in one sign for years at a time. ${planetDisplay} was in ${rulerSignDisplay} roughly ${window || 'for over a decade'}, so everyone born in that span shares that placement. What makes it specifically YOUR chart ruler is your ${risingSignDisplay} Rising — a roughly two-hour window per day per location. The intersection (generational placement + personal rising) is what makes your chart ruler both cohort-wide in one sense and distinctly yours in another.`,
      });
    }
  } else {
    // --- Teaser mode (locked) ---
    if (planetInSign?.strengths) {
      sections.push({
        heading: 'Your strengths and challenges through this chart ruler',
        body: 'Sign in to unlock the full strengths profile, the challenges to work with, and how this placement shows up in your career and relationships — plus the live transits activating your chart ruler right now.',
        bullets: (planetInSign.strengths as string[]).slice(0, 2),
        locked: true,
      });
    }
  }

  const tease = unlocked
    ? `This is your full chart ruler reading. Your three most active transits are waiting in the app, along with the aspects shaping how your chart ruler expresses day to day.`
    : `You've just seen why your configuration is unusual. Your full Lunary reading covers the three live transits activating your chart ruler, the aspects shaping its expression, and how to work with it day-to-day.`;

  const chartKey = [
    risingSignKey,
    rulerPlanet,
    rulerSignKey,
    rulerHouse ?? 0,
    dignity ?? 'none',
    retrograde ? 'rx' : 'direct',
  ].join('_');

  const subheadBase = `Your ${risingSignDisplay} Rising is ruled by ${planetDisplay}. That means ${planetDisplay}'s placement is the hidden director of your chart.`;

  const shareCardTags: string[] = [];
  if (dignity === 'domicile') shareCardTags.push('domicile');
  if (dignity === 'exaltation') shareCardTags.push('exalted');
  if (rulerInRising) shareCardTags.push('rules itself');
  if (houseNature === 'angular') shareCardTags.push('angular');
  if (retrograde) shareCardTags.push('retrograde');

  const shareSubtitle = [
    `${risingSignDisplay} Rising`,
    rulerHouse ? `${ordinal(rulerHouse)} house` : null,
    shareCardTags.length > 0 ? shareCardTags.join(' · ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    quizSlug: 'chart-ruler',
    archetype,
    hero: {
      eyebrow: 'Your Chart Ruler Profile',
      headline: `${planetDisplay} in ${rulerSignDisplay}, in your ${houseDisplay}${
        headlineTags.length > 0
          ? ` — ${headlineTags.join(', ').toLowerCase()}`
          : ''
      }`,
      subhead: subheadBase,
    },
    sections,
    shareCard: {
      title: archetype.label,
      subtitle: shareSubtitle,
    },
    tease,
    meta: {
      generatedAt: new Date().toISOString(),
      chartKey,
      signals: {
        dignity,
        houseNature,
        houseNumber: rulerHouse ?? null,
        rulerInRising,
        retrograde,
      },
    },
  };
}
