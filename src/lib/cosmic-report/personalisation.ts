import { sql } from '@vercel/postgres';
import {
  getPersonalTransitImpacts,
  type PersonalTransitImpact,
} from '../../../utils/astrology/personalTransits';
import { getUpcomingTransits } from '../../../utils/astrology/transitCalendar';
import type { CosmicReportSection } from './types';
import dayjs from 'dayjs';

/**
 * Personalisation layer for the Cosmic Report.
 *
 * The free birth chart already gives a user their own rising, Big 3 and houses,
 * so a paid report MUST be unambiguously richer than that to honour the
 * app-first rule. These helpers weave the buyer's stored natal chart and
 * house-specific personal transit guidance ("this transit lands in YOUR 7th
 * house for the next 18 days, here is what to do") into the report sections.
 *
 * Everything here degrades gracefully: if a user has no stored natal chart the
 * report still renders the generic sections — it just won't add the natal /
 * house-specific depth.
 */

// A stored natal chart row is an array of placement objects. We only rely on
// the small, stable subset the transit engine and the natal summary need.
export type NatalPlacement = {
  body: string;
  sign?: string;
  eclipticLongitude?: number;
  house?: number;
  formattedDegree?: { degree?: number } | string;
  retrograde?: boolean;
};

export type NatalChartArray = NatalPlacement[];

// Bodies that anchor a chart summary, in the order a reader expects them.
const SUMMARY_BODIES = [
  'Sun',
  'Moon',
  'Ascendant',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
] as const;

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity and how you meet the world',
  2: 'money, values and self-worth',
  3: 'communication, learning and your local world',
  4: 'home, family and your inner foundation',
  5: 'creativity, romance and play',
  6: 'work, health and daily routine',
  7: 'partnership and one-to-one relationships',
  8: 'intimacy, shared resources and transformation',
  9: 'travel, study and belief',
  10: 'career, reputation and direction',
  11: 'friendships, community and hopes',
  12: 'rest, retreat and the inner world',
};

/**
 * Fetch the buyer's stored natal chart from `user_profiles.birth_chart`.
 * Mirrors the canonical loader used by the personal-transits calendar feed so
 * the report and the calendar agree on the same source of truth.
 */
export async function getNatalChartArray(
  userId: string,
): Promise<NatalChartArray | null> {
  try {
    const result = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    const chart = result.rows[0]?.birth_chart;
    if (!chart || !Array.isArray(chart) || chart.length === 0) {
      return null;
    }
    return chart as NatalChartArray;
  } catch (error) {
    console.error('[cosmic-report] Failed to fetch natal chart', {
      userId,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
}

function findPlacement(
  chart: NatalChartArray,
  body: string,
): NatalPlacement | undefined {
  return chart.find((p) => p.body === body);
}

function placementLabel(p: NatalPlacement): string {
  const house = p.house ? `, ${p.house}${ordinalSuffix(p.house)} house` : '';
  const retro = p.retrograde ? ' (retrograde)' : '';
  return `${p.body} in ${p.sign ?? 'an unknown sign'}${house}${retro}`;
}

function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
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

/**
 * Build the natal "Your Chart Signature" section. This is the personalisation
 * backbone of the paid report — the part the generic free preview never has.
 */
export function buildNatalSection(
  chart: NatalChartArray,
): CosmicReportSection | null {
  const sun = findPlacement(chart, 'Sun');
  const moon = findPlacement(chart, 'Moon');
  const rising = findPlacement(chart, 'Ascendant');

  // Without a Sun placement the chart data is too thin to be meaningful.
  if (!sun) return null;

  const bigThree: string[] = [];
  if (sun?.sign) bigThree.push(`Sun in ${sun.sign}`);
  if (moon?.sign) bigThree.push(`Moon in ${moon.sign}`);
  if (rising?.sign) bigThree.push(`${rising.sign} rising`);

  const highlights: string[] = [];
  for (const body of SUMMARY_BODIES) {
    const placement = findPlacement(chart, body);
    if (placement?.sign) {
      highlights.push(placementLabel(placement));
    }
  }

  const summary = bigThree.length
    ? `Your chart signature: ${bigThree.join(', ')}. Every transit in this report is read against these placements and your houses, so the guidance is yours, not a generic sun-sign read.`
    : 'Your personalised chart placements, used to interpret every transit in this report against your own houses.';

  return {
    key: 'natal',
    title: 'Your Chart Signature',
    summary,
    highlights: highlights.length
      ? highlights
      : ['Add your birth time and place in Lunary for full house detail.'],
  };
}

/**
 * Compute house-specific personal transit impacts for the report window and
 * fold them back into the transit section: each highlight names the house the
 * transit lands in plus a one-line "what to do", and the duration becomes an
 * action step. Returns the enriched section (a new object — never mutates).
 */
export function enrichTransitSection(
  section: CosmicReportSection,
  chart: NatalChartArray | null,
  windowStart?: Date,
  limit = 8,
): CosmicReportSection {
  if (!chart || chart.length === 0) return section;

  let impacts: PersonalTransitImpact[] = [];
  try {
    const start = windowStart ? dayjs(windowStart).startOf('day') : undefined;
    const upcoming = getUpcomingTransits(start);
    impacts = getPersonalTransitImpacts(
      upcoming,
      chart as unknown as any[],
      limit,
    );
  } catch (error) {
    console.error('[cosmic-report] Failed to compute personal transits', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return section;
  }

  if (impacts.length === 0) return section;

  const personalHighlights: string[] = [];
  const actionSteps: string[] = [];

  for (const impact of impacts) {
    const houseLabel =
      impact.house != null
        ? `your ${impact.house}${ordinalSuffix(impact.house)} house (${
            impact.houseMeaning ?? HOUSE_MEANINGS[impact.house] ?? 'a key area'
          })`
        : null;

    const datePart = impact.date ? impact.date.format('D MMM') : '';
    const durationPart = impact.duration?.displayText
      ? ` for ${impact.duration.displayText}`
      : '';

    if (houseLabel) {
      personalHighlights.push(
        `${impact.planet} ${impact.event} lands in ${houseLabel}${durationPart}${
          datePart ? ` (around ${datePart})` : ''
        }`,
      );
    } else if (datePart) {
      personalHighlights.push(
        `${impact.planet} ${impact.event} around ${datePart}`,
      );
    }

    if (impact.actionableGuidance) {
      actionSteps.push(impact.actionableGuidance);
    }
  }

  return {
    ...section,
    summary:
      `${section.summary} The breakdown below maps each movement onto your own houses.`.trim(),
    // Lead with the personalised, house-specific highlights, then keep the
    // original generic highlights underneath for context.
    highlights: [...personalHighlights, ...section.highlights],
    actionSteps: actionSteps.length
      ? [...new Set(actionSteps)].slice(0, 6)
      : section.actionSteps,
  };
}
