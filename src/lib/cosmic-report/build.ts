import { CosmicReportData, CosmicReportSection } from './types';
import { buildLunaryContext } from '@/lib/ai/context';
import { getMoonEventsForYear } from '@/lib/moon/events';
import {
  checkActiveRetrogrades,
  getRealPlanetaryPositions,
} from '../../../utils/astrology/astronomical-data';
import {
  getNatalChartArray,
  buildNatalSection,
  enrichTransitSection,
} from './personalisation';

/**
 * Cosmic Report builder.
 *
 * Extracted from the generate route so the same personalised report can be
 * produced from two entry points:
 *   1. the authenticated generator (Pro perk + buy-once teaser), and
 *   2. the one-time purchase fulfilment in the shop webhook.
 *
 * The report weaves the buyer's natal chart and house-specific transit guidance
 * on top of the live cosmic data, so the paid artefact is unambiguously richer
 * than the free birth chart.
 */

export const DEFAULT_SECTIONS: Record<string, string[]> = {
  weekly: ['transits', 'moon', 'tarot', 'mood'],
  monthly: ['transits', 'moon', 'tarot', 'mood', 'rituals'],
  custom: ['transits', 'moon', 'tarot', 'mood', 'rituals'],
};

export function getDateRange(
  reportType: string,
  dateRange?: { start?: string; end?: string },
): { start: Date; end: Date } {
  const now = new Date();

  if (dateRange?.start && dateRange?.end) {
    return { start: new Date(dateRange.start), end: new Date(dateRange.end) };
  }

  if (reportType === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  }

  // Default: this week (Mon-Sun)
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export async function buildReportData({
  userId,
  reportType,
  dateRange,
  includeSections,
  generatedFor,
}: {
  userId: string;
  reportType: 'weekly' | 'monthly' | 'custom';
  dateRange?: { start?: string; end?: string };
  includeSections?: string[];
  generatedFor?: string;
}): Promise<CosmicReportData> {
  const sectionKeys =
    includeSections && includeSections.length > 0
      ? includeSections
      : DEFAULT_SECTIONS[reportType];

  const range = getDateRange(reportType, dateRange);

  // Fetch real cosmic data for the user
  const { context } = await buildLunaryContext({
    userId,
    tz: 'Europe/London',
    locale: 'en-GB',
    includeMood: sectionKeys.includes('mood'),
    now: new Date(),
    useCache: true,
  });

  // Fetch the buyer's stored natal chart. This drives the personalisation that
  // makes the paid report unambiguously richer than the free birth chart:
  // a "Your Chart Signature" section plus house-specific transit guidance.
  // Degrades gracefully — if it is null the report still renders the generic
  // sections, it just won't add the natal / house depth.
  const natalChart = await getNatalChartArray(userId);

  // Get moon events for the date range
  const moonEvents = getMoonEventsForYear(range.start.getFullYear());
  const upcomingFullMoons = moonEvents.fullMoons.filter((m) => {
    const d = new Date(m.timestamp);
    return d >= range.start && d <= range.end;
  });
  const upcomingNewMoons = moonEvents.newMoons.filter((m) => {
    const d = new Date(m.timestamp);
    return d >= range.start && d <= range.end;
  });

  // Get active retrogrades
  const positions = getRealPlanetaryPositions(new Date());
  const retrogrades = checkActiveRetrogrades(positions);

  // Build sections from real data
  const sections: CosmicReportSection[] = [];

  for (const key of sectionKeys) {
    switch (key) {
      case 'transits': {
        const transits = context.currentTransits || [];
        const highlights = transits.slice(0, 6).map((t) => {
          const label = `${t.from} ${t.aspect} ${t.to}`;
          if (t.applying) return `${label} (forming)`;
          return `${label} (exact)`;
        });

        // Add retrogrades
        if (retrogrades.length > 0) {
          highlights.push(
            ...retrogrades.map(
              (r: { planet: string; sign: string }) =>
                `${r.planet} retrograde in ${r.sign}`,
            ),
          );
        }

        const transitSection: CosmicReportSection = {
          key: 'transits',
          title: 'Planetary Transits',
          summary:
            transits.length > 0
              ? `${transits.length} active transit${transits.length === 1 ? '' : 's'} shaping your cosmic weather. ${transits.filter((t) => !t.applying).length} exact, ${transits.filter((t) => t.applying).length} forming.`
              : 'No major transits detected for this period.',
          highlights:
            highlights.length > 0
              ? highlights
              : ['No significant transits active'],
          energyLevel:
            transits.filter((t) => !t.applying).length > 2
              ? 'high'
              : transits.length > 0
                ? 'medium'
                : 'low',
        };

        // Weave the buyer's own houses + duration + actionable guidance into
        // the transit section so it reads "this lands in YOUR 7th house".
        sections.push(
          enrichTransitSection(transitSection, natalChart, range.start),
        );
        break;
      }

      case 'moon': {
        const moon = context.moon;
        const highlights: string[] = [];

        if (moon) {
          highlights.push(
            `Current: ${moon.phase} in ${moon.sign} (${Math.round(moon.illumination * 100)}% illuminated)`,
          );
        }

        upcomingFullMoons.forEach((m) => {
          highlights.push(`${m.name} in ${m.sign} - ${m.dateLabel}`);
        });
        upcomingNewMoons.forEach((m) => {
          highlights.push(`New Moon in ${m.sign} - ${m.dateLabel}`);
        });

        if (highlights.length === 0) {
          highlights.push('No major lunar events in this period');
        }

        const phaseEnergy = moon?.phase?.toLowerCase().includes('full')
          ? 'high'
          : moon?.phase?.toLowerCase().includes('new')
            ? 'low'
            : 'medium';

        sections.push({
          key: 'moon',
          title: 'Lunar Weather',
          summary: moon
            ? `The Moon is currently in ${moon.phase} phase, ${moon.sign}. ${upcomingFullMoons.length + upcomingNewMoons.length} lunar event${upcomingFullMoons.length + upcomingNewMoons.length === 1 ? '' : 's'} in this period.`
            : 'Lunar data unavailable for this period.',
          highlights,
          energyLevel: phaseEnergy as 'low' | 'medium' | 'high',
        });
        break;
      }

      case 'tarot': {
        const tarot = context.tarot;
        const highlights: string[] = [];

        if (tarot?.daily) {
          highlights.push(
            `Daily card: ${tarot.daily.name}${tarot.daily.keywords?.length ? ` - ${tarot.daily.keywords.slice(0, 3).join(', ')}` : ''}`,
          );
        }
        if (tarot?.weekly) {
          highlights.push(
            `Weekly card: ${tarot.weekly.name}${tarot.weekly.keywords?.length ? ` - ${tarot.weekly.keywords.slice(0, 3).join(', ')}` : ''}`,
          );
        }
        if (tarot?.patternAnalysis?.dominantThemes?.length) {
          highlights.push(
            `Themes: ${tarot.patternAnalysis.dominantThemes.slice(0, 3).join(', ')}`,
          );
        }
        if (tarot?.patternAnalysis?.patternInsights?.length) {
          highlights.push(...tarot.patternAnalysis.patternInsights.slice(0, 2));
        }

        if (highlights.length === 0) {
          highlights.push(
            'No tarot readings recorded yet. Pull a daily card to populate this section.',
          );
        }

        sections.push({
          key: 'tarot',
          title: 'Tarot Archetypes',
          summary:
            tarot?.daily || tarot?.weekly
              ? 'Your recent tarot pulls and emerging patterns, connected to your current cosmic weather.'
              : 'Start pulling daily cards to see tarot insights in your report.',
          highlights,
        });
        break;
      }

      case 'mood': {
        const mood = context.mood;
        const highlights: string[] = [];

        if (mood?.last7d?.length) {
          const tags = mood.last7d.map((m) => m.tag);
          const tagCounts: Record<string, number> = {};
          tags.forEach((t) => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          });
          const sorted = Object.entries(tagCounts).sort(
            ([, a], [, b]) => b - a,
          );
          highlights.push(
            `${mood.last7d.length} mood entries in the last 7 days`,
          );
          sorted.slice(0, 3).forEach(([tag, count]) => {
            highlights.push(`${tag}: ${count} time${count === 1 ? '' : 's'}`);
          });
        }

        if (highlights.length === 0) {
          highlights.push(
            'No mood entries yet. Log your mood daily to see trends here.',
          );
        }

        sections.push({
          key: 'mood',
          title: 'Mood and Energy',
          summary: mood?.last7d?.length
            ? 'Your emotional landscape over the past week, mapped against cosmic influences.'
            : 'Start logging your mood to see how it correlates with planetary transits.',
          highlights,
          energyLevel:
            mood?.last7d?.length && mood.last7d.length >= 5
              ? 'high'
              : mood?.last7d?.length
                ? 'medium'
                : 'low',
        });
        break;
      }

      case 'rituals': {
        const moon = context.moon;
        const highlights: string[] = [];

        if (moon) {
          const phase = moon.phase?.toLowerCase() || '';
          if (phase.includes('new')) {
            highlights.push(
              'Set intentions and plant seeds for new beginnings',
            );
            highlights.push(
              'Journal prompt: What do I want to manifest this cycle?',
            );
          } else if (phase.includes('waxing')) {
            highlights.push('Build momentum and take action on intentions');
            highlights.push(
              'Journal prompt: What steps am I taking towards my goals?',
            );
          } else if (phase.includes('full')) {
            highlights.push(
              'Celebrate progress and release what no longer serves',
            );
            highlights.push('Journal prompt: What am I ready to let go of?');
          } else if (phase.includes('waning')) {
            highlights.push('Rest, reflect and prepare for the next cycle');
            highlights.push(
              'Journal prompt: What lessons has this cycle taught me?',
            );
          }
        }

        if (retrogrades.length > 0) {
          highlights.push(
            `Retrograde ritual: Review and revisit during ${retrogrades.map((r: { planet: string }) => r.planet).join(', ')} retrograde`,
          );
        }

        if (highlights.length === 0) {
          highlights.push(
            'Connect with the current cosmic energy through mindful practice',
          );
        }

        sections.push({
          key: 'rituals',
          title: 'Ritual Blueprint',
          summary:
            'Practices aligned with the current lunar phase and planetary weather.',
          highlights,
        });
        break;
      }
    }
  }

  const rangeLabel = `${formatDateLabel(range.start)} - ${formatDateLabel(range.end)}`;

  // Lead with the personalised chart signature so the paid report opens with
  // depth the free chart preview never has. Prepended (not toggled) because it
  // is the backbone every other section is interpreted against.
  const natalSection = natalChart ? buildNatalSection(natalChart) : null;
  const orderedSections = natalSection ? [natalSection, ...sections] : sections;

  return {
    title: `Cosmic ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
    subtitle: `${rangeLabel} | Generated from live astronomical data`,
    reportType,
    generatedFor,
    dateRange: {
      start: range.start.toISOString().split('T')[0],
      end: range.end.toISOString().split('T')[0],
    },
    sections: orderedSections,
    metadata: {
      generatedAt: new Date().toISOString(),
      dataSource: 'astronomy-engine',
      personalised: Boolean(natalChart),
    },
  };
}
