import type {
  BirthChartData,
  BirthChartResult,
} from '@utils/astrology/birthChart';
import { getHouse, getPlanetInSign, getRisingSign } from '../grimoire-lookup';
import { getRulingPlanet, normalizeSign } from '../rulers';
import type { HouseNumber, PlanetKey, QuizResult, QuizSection } from '../types';

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

export function composeChartRulerResult(
  chart: BirthChartResult,
): QuizResult | null {
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

  const planetDisplay = PLANET_DISPLAY[rulerPlanet];
  const rulerSignDisplay = rulerBody.sign;
  const risingSignDisplay = ascendant.sign;
  const houseDisplay = rulerHouse ? `${ordinal(rulerHouse)} house` : 'chart';

  const sections: QuizSection[] = [];

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

  if (houseEntry) {
    sections.push({
      heading: `Focused through your ${houseEntry.name.toLowerCase()}`,
      body: houseEntry.description,
      highlight: `Life area: ${houseEntry.lifeArea}.`,
    });
  }

  if (planetInSign?.strengths) {
    sections.push({
      heading: 'Your strengths through this chart ruler',
      body: 'Sign in to unlock the full strengths profile, the challenges to work with, and how this placement shows up in your career and relationships.',
      bullets: (planetInSign.strengths as string[]).slice(0, 2),
      locked: true,
    });
  }

  const tease = `You've just seen three insights from your chart ruler. Your full Lunary reading includes the six other patterns this configuration creates, plus the live transits activating it right now.`;

  const chartKey = [
    risingSignKey,
    rulerPlanet,
    rulerSignKey,
    rulerHouse ?? 0,
  ].join('_');

  return {
    quizSlug: 'chart-ruler',
    hero: {
      eyebrow: 'Your Chart Ruler Profile',
      headline: `${planetDisplay} in ${rulerSignDisplay}, in your ${houseDisplay}`,
      subhead: `Your ${risingSignDisplay} Rising is ruled by ${planetDisplay}. That means ${planetDisplay}'s placement is the hidden director of your chart.`,
    },
    sections,
    shareCard: {
      title: `Chart Ruler: ${planetDisplay} in ${rulerSignDisplay}`,
      subtitle: `${risingSignDisplay} Rising · ${rulerHouse ? ordinal(rulerHouse) + ' house' : 'chart'}`,
    },
    tease,
    meta: {
      generatedAt: new Date().toISOString(),
      chartKey,
    },
  };
}
