import { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour for blog content

import {
  ArrowLeft,
  ArrowRight,
  Star,
  TrendingUp,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { CrossPlatformCTA } from '@/components/CrossPlatformCTA';
import { getContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { InlineContextualNudge } from '@/components/grimoire/InlineContextualNudge';
import { ContextualNudgeSection } from '@/components/ui/ContextualNudgeSection';
import { getInlineCtaVariant } from '@/lib/ab-tests-server';
import {
  QuickStats,
  AspectNatureBadge,
  CrystalCards,
  WeekTimeline,
  WeeklyAffirmation,
  TarotOfWeek,
  WeeklyNumerology,
  VOCMoonSchedule,
} from '@/components/blog';
import { getPlanetSymbol, getAspectSymbol } from '@/constants/symbols';

interface BlogPostPageProps {
  params: Promise<{ week: string }>;
  searchParams: Promise<{ from?: string }>;
}

interface WeekInfo {
  weekNumber: number;
  year: number;
  slug: string;
}

function parseWeekParam(weekParam: string): WeekInfo {
  if (!weekParam) {
    throw new Error('Week parameter is required');
  }

  const numericTokens = weekParam.match(/\d+/g);
  if (!numericTokens || numericTokens.length === 0) {
    throw new Error(
      `Invalid week parameter "${weekParam}". Expected format like "12-2025".`,
    );
  }

  const weekNumber = parseInt(numericTokens[0], 10);
  const currentYear = new Date().getFullYear();
  const yearToken = numericTokens[1];
  const parsedYear = yearToken ? parseInt(yearToken, 10) : NaN;
  const year =
    !Number.isNaN(parsedYear) && parsedYear >= 1900 ? parsedYear : currentYear;

  if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 53) {
    throw new Error(
      `Invalid week number "${numericTokens[0]}". Use values between 1 and 53.`,
    );
  }

  return {
    weekNumber,
    year,
    slug: `week-${weekNumber}-${year}`,
  };
}

function getPlanetColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: 'text-lunary-accent',
    Moon: 'text-lunary-secondary',
    Mercury: 'text-gray-400',
    Venus: 'text-lunary-rose',
    Mars: 'text-lunary-error',
    Jupiter: 'text-lunary-highlight',
    Saturn: 'text-lunary-primary',
    Uranus: 'text-lunary-secondary',
    Neptune: 'text-lunary-secondary',
    Pluto: 'text-lunary-highlight',
  };
  return colors[planet] || 'text-zinc-300';
}

function getPlanetBorderColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: 'border-lunary-accent-800',
    Moon: 'border-lunary-secondary-800',
    Mercury: 'border-gray-400/30',
    Venus: 'border-lunary-rose-800',
    Mars: 'border-lunary-error-700/30',
    Jupiter: 'border-lunary-highlight-700/30',
    Saturn: 'border-lunary-primary-800',
    Uranus: 'border-lunary-secondary-800',
    Neptune: 'border-lunary-secondary-800',
    Pluto: 'border-lunary-highlight-800',
  };
  return colors[planet] || 'border-zinc-700';
}

function getPlanetBgColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: 'bg-lunary-accent-950',
    Moon: 'bg-lunary-secondary-950',
    Mercury: 'bg-gray-400/10',
    Venus: 'bg-lunary-rose-950',
    Mars: 'bg-lunary-error-900/10',
    Jupiter: 'bg-lunary-highlight-900/10',
    Saturn: 'bg-lunary-primary-950',
    Uranus: 'bg-lunary-secondary-950',
    Neptune: 'bg-lunary-secondary-950',
    Pluto: 'bg-lunary-highlight-950',
  };
  return colors[planet] || 'bg-zinc-800/50';
}

const BLOG_SECTION_LIMITS = {
  planetaryHighlights: 3,
  retrogradeChanges: 2,
  moonPhases: 2,
  majorAspects: 3,
  crystalRecommendations: 7,
  bestDays: 3,
};

// Ensure blog data contains only serializable primitives before rendering
function serializeDates(value: any): any {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDates(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const key in value) {
      result[key] = serializeDates(value[key]);
    }
    return result;
  }

  return value;
}

function getFirstSentences(text: string, maxSentences = 2): string {
  if (!text) return '';
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, maxSentences);
  return sentences.join(' ').trim();
}

// Helper to check if a string is a placeholder
function isPlaceholder(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return true;
  const lower = str.toLowerCase().trim();
  return (
    lower === '' ||
    lower === 'tbd' ||
    lower === 'unknown' ||
    lower.includes('enters sign') ||
    lower.includes('sun enters sign') ||
    /enters\s+\[?placeholder\]?/i.test(lower)
  );
}

// Generate generic fallback description for aspects when energy/guidance are missing
// Keep descriptions minimal, factual, and safe - no invented outcomes
function getAspectDescriptionFallback(
  aspectType: string,
  planetA: string,
  planetB: string,
): string {
  // Map aspect types to neutral keywords (no promises, no hype)
  const aspectKeywords: Record<string, string> = {
    conjunction: 'focus and amplification',
    opposition: 'tension and adjustment',
    trine: 'support and ease',
    square: 'tension and adjustment',
    sextile: 'support and ease',
  };

  const keyword = aspectKeywords[aspectType] || 'cosmic influence';

  return `This ${aspectType} between ${planetA} and ${planetB} highlights themes of ${keyword}. Notice where this shows up in your conversations and choices.`;
}

// Generate a weekly affirmation based on the dominant energy
function generateWeeklyAffirmation(
  moonPhases: any[],
  highlights: any[],
  retrogrades: any[],
): string {
  // Find the major moon phase
  const majorMoon = moonPhases.find(
    (m) => m.phase?.includes('Full') || m.phase?.includes('New'),
  );

  // Affirmations by moon phase
  const moonAffirmations: Record<string, string> = {
    'Full Moon':
      'I release what no longer serves me and welcome the clarity this illumination brings.',
    'New Moon':
      'I plant seeds of intention with trust, knowing they will blossom in divine timing.',
  };

  if (majorMoon?.phase) {
    for (const [phase, affirmation] of Object.entries(moonAffirmations)) {
      if (majorMoon.phase.includes(phase)) {
        return affirmation;
      }
    }
  }

  // Retrograde affirmation
  if (retrogrades.length > 0) {
    return 'I embrace this period of reflection and trust that revisiting the past leads to wiser choices ahead.';
  }

  // Default affirmations based on highlights
  const generalAffirmations = [
    'I move with the cosmic currents, trusting my inner wisdom to guide each step.',
    'I am aligned with the universe, open to the opportunities this week brings.',
    'I embrace change as a catalyst for growth and welcome new beginnings.',
  ];

  // Pick based on week number for consistency
  const weekBasedIndex = highlights.length % generalAffirmations.length;
  return generalAffirmations[weekBasedIndex];
}

// Build timeline events from blog data
interface TimelineEvent {
  date: Date;
  type: 'ingress' | 'retrograde' | 'direct' | 'moon-phase' | 'aspect';
  title: string;
  planet?: string;
  planetB?: string;
  aspect?: string;
  sign?: string;
  phase?: string;
}

function buildTimelineEvents(
  highlights: any[],
  moonPhases: any[],
  retrogrades: any[],
  aspects: any[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Add planetary highlights (ingresses)
  highlights.forEach((h) => {
    const eventDate = h.date instanceof Date ? h.date : new Date(h.date);
    if (h.event === 'enters-sign' && h.details?.toSign) {
      events.push({
        date: eventDate,
        type: 'ingress',
        title: `${h.planet} enters ${h.details.toSign}`,
        planet: h.planet,
        sign: h.details.toSign,
      });
    }
  });

  // Add moon phases
  moonPhases.forEach((m) => {
    const eventDate = m.date instanceof Date ? m.date : new Date(m.date);
    events.push({
      date: eventDate,
      type: 'moon-phase',
      title: m.phase,
      phase: m.phase,
      sign: m.sign,
    });
  });

  // Add retrogrades
  retrogrades.forEach((r) => {
    const eventDate = r.date instanceof Date ? r.date : new Date(r.date);
    events.push({
      date: eventDate,
      type: r.type === 'station-direct' ? 'direct' : 'retrograde',
      title: `${r.planet} ${r.type === 'station-direct' ? 'stations direct' : 'goes retrograde'}`,
      planet: r.planet,
    });
  });

  // Add major aspects (limit to avoid clutter)
  aspects.slice(0, 3).forEach((a) => {
    const eventDate = a.date instanceof Date ? a.date : new Date(a.date);
    events.push({
      date: eventDate,
      type: 'aspect',
      title: `${a.planetA} ${a.aspect} ${a.planetB}`,
      planet: a.planetA,
      planetB: a.planetB,
      aspect: a.aspect,
    });
  });

  return events;
}

async function getBlogData(weekInfo: WeekInfo) {
  const startOfYear = new Date(weekInfo.year, 0, 1);
  const weekStartDate = new Date(startOfYear);
  weekStartDate.setDate(
    weekStartDate.getDate() + (weekInfo.weekNumber - 1) * 7,
  );

  try {
    console.log(
      '[getBlogData] Generating weekly content for:',
      weekInfo.slug,
      weekStartDate.toISOString(),
    );
    const startTime = Date.now();
    const weeklyData = await generateWeeklyContent(weekStartDate);
    const duration = Date.now() - startTime;
    console.log(
      `[getBlogData] Weekly content generated for ${weekInfo.slug} in ${duration}ms`,
    );
    // Serialize any Date instances so React never receives raw Date objects
    return serializeDates(weeklyData);
  } catch (error) {
    console.error(
      `[getBlogData] Error generating blog data for ${weekInfo.slug}:`,
      error,
    );
    console.error(
      '[getBlogData] Error stack:',
      error instanceof Error ? error.stack : 'No stack',
    );
    throw new Error(
      `Failed to generate blog data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export default async function BlogPostPage({
  params,
  searchParams,
}: BlogPostPageProps) {
  let rawWeekParam: string | undefined;
  let weekInfo: WeekInfo | null = null;

  const resolvedSearchParams = await searchParams;
  const fromParam = resolvedSearchParams?.from;
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  try {
    const resolvedParams = await params;
    rawWeekParam = resolvedParams.week;
    weekInfo = parseWeekParam(rawWeekParam);
    const canonicalWeekSlug = weekInfo.slug;

    console.log('[BlogPostPage] Starting render for week:', canonicalWeekSlug);
    console.log(
      '[BlogPostPage] Fetching blog data for week:',
      canonicalWeekSlug,
    );
    const blogData = await getBlogData(weekInfo);
    console.log('[BlogPostPage] Blog data fetched, processing dates...');

    // Validate and clean data - remove placeholder strings (case-insensitive, pattern-based)
    const cleanedHighlights = (blogData.planetaryHighlights || []).filter(
      (h: any) => {
        // Filter out highlights with placeholder descriptions
        if (isPlaceholder(h.description)) {
          return false;
        }
        // Filter out placeholder planet/event names
        if (isPlaceholder(h.planet) || isPlaceholder(h.event)) {
          return false;
        }
        // Ensure event descriptions are valid
        if (h.event === 'enters-sign' && !h.details?.toSign) {
          return false;
        }
        // Filter out if toSign is a placeholder
        if (h.details?.toSign && isPlaceholder(h.details.toSign)) {
          return false;
        }
        return true;
      },
    );

    const displayedHighlights = cleanedHighlights.slice(
      0,
      BLOG_SECTION_LIMITS.planetaryHighlights,
    );
    const displayedRetrogrades =
      blogData.retrogradeChanges?.slice(
        0,
        BLOG_SECTION_LIMITS.retrogradeChanges,
      ) || [];
    const displayedMoonPhases =
      blogData.moonPhases?.slice(0, BLOG_SECTION_LIMITS.moonPhases) || [];
    const displayedAspects =
      blogData.majorAspects?.slice(0, BLOG_SECTION_LIMITS.majorAspects) || [];
    const displayedCrystals =
      blogData.crystalRecommendations?.slice(
        0,
        BLOG_SECTION_LIMITS.crystalRecommendations,
      ) || [];
    const bestDaysEntries = Object.entries(blogData.bestDaysFor || {})
      .filter(
        ([, days]: [string, any]) =>
          days?.dates && Array.isArray(days.dates) && days.dates.length > 0,
      )
      .slice(0, BLOG_SECTION_LIMITS.bestDays);

    // Build intro from actual displayed events only - never invent data
    const eventList: string[] = [];

    // Extract valid planetary highlights (only if they have proper details)
    displayedHighlights.forEach((h: any) => {
      if (h.event === 'enters-sign' && h.details?.toSign) {
        eventList.push(`${h.planet} enters ${h.details.toSign}`);
      } else if (h.event === 'goes-retrograde' && h.details?.sign) {
        eventList.push(`${h.planet} stations retrograde`);
      } else if (h.event === 'goes-direct' && h.details?.sign) {
        eventList.push(`${h.planet} stations direct`);
      }
    });

    // Build summary intro - only state what's present
    let curatedSummaryIntro = '';
    if (displayedHighlights.length > 0 || displayedRetrogrades.length > 0) {
      const parts: string[] = [];
      if (displayedHighlights.length > 0) {
        parts.push(
          displayedHighlights.length === 1
            ? 'a major planetary shift'
            : `${displayedHighlights.length} major planetary shifts`,
        );
      }
      if (displayedRetrogrades.length > 0) {
        parts.push(
          displayedRetrogrades.length === 1
            ? 'a retrograde change'
            : `${displayedRetrogrades.length} retrograde changes`,
        );
      }

      if (parts.length > 0) {
        if (parts.length === 1) {
          curatedSummaryIntro = `This week features ${parts[0]}.`;
        } else {
          curatedSummaryIntro = `This week features ${parts[0]} and ${parts[1]}.`;
        }

        // Add specific events if we have valid ones
        if (eventList.length > 0 && eventList.length <= 2) {
          curatedSummaryIntro += ` Notable shifts include ${eventList.join(' and ')}.`;
        }
      }
    }

    // Clean base summary - remove placeholder patterns
    let baseSummary =
      getFirstSentences(blogData.summary, 2) ||
      'Weekly cosmic insights and guidance.';

    // Remove placeholder patterns from summary
    baseSummary = baseSummary
      .replace(
        /This week brings \d+ significant cosmic events that will influence our collective and personal energy\.\s*/gi,
        '',
      )
      .replace(/Key planetary movements include Sun enters sign\./gi, '')
      .replace(
        /Key planetary movements include/gi,
        'Notable planetary movements include',
      )
      .replace(/enters sign/gi, '') // Remove any remaining placeholder text
      .trim();

    const summaryText = [curatedSummaryIntro, baseSummary]
      .filter(Boolean)
      .join(' ');
    console.log('[BlogPostPage] Dates processed, rendering page...');
    console.log(
      '[BlogPostPage] crystalRecommendations count:',
      blogData.crystalRecommendations?.length || 0,
    );
    if (
      blogData.crystalRecommendations &&
      blogData.crystalRecommendations.length > 0
    ) {
      console.log(
        '[BlogPostPage] All crystal dates:',
        blogData.crystalRecommendations.map((c: any) => ({
          date:
            c.date instanceof Date
              ? c.date.toDateString()
              : new Date(c.date).toDateString(),
          crystal: c.crystal,
          rawDate: c.date,
        })),
      );
    }
    if (blogData.dailyForecasts && blogData.dailyForecasts.length > 0) {
      console.log(
        '[BlogPostPage] All forecast dates:',
        blogData.dailyForecasts.map((f: any) => ({
          date:
            f.date instanceof Date
              ? f.date.toDateString()
              : new Date(f.date).toDateString(),
          rawDate: f.date,
        })),
      );
    }

    // Validate required fields
    if (!blogData || !blogData.weekStart || !blogData.weekEnd) {
      throw new Error(
        'Blog data is missing required fields (weekStart, weekEnd)',
      );
    }

    if (!blogData.title || !blogData.subtitle || !blogData.summary) {
      throw new Error(
        'Blog data is missing required content fields (title, subtitle, summary)',
      );
    }

    // Ensure weekStart and weekEnd are Date objects before calling toLocaleDateString
    const weekStart =
      blogData.weekStart instanceof Date
        ? blogData.weekStart
        : new Date(blogData.weekStart);
    const weekEnd =
      blogData.weekEnd instanceof Date
        ? blogData.weekEnd
        : new Date(blogData.weekEnd);

    // Validate dates
    if (isNaN(weekStart.getTime()) || isNaN(weekEnd.getTime())) {
      throw new Error('Invalid dates in blog data');
    }

    const weekRange = `${weekStart.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })} - ${weekEnd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`;

    return (
      <div className='container mx-auto p-4 max-w-4xl'>
        <Link
          href={`/blog${linkSuffix}`}
          className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Blog
        </Link>

        <article className='space-y-8'>
          <header className='space-y-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Badge variant='outline'>Week {blogData.weekNumber || '?'}</Badge>
              <span>•</span>
              <span>{blogData.year || new Date().getFullYear()}</span>
              <span>•</span>
              <time dateTime={weekStart.toISOString()}>{weekRange}</time>
            </div>

            <h1 className='text-4xl font-bold'>
              {blogData.title || 'Weekly Cosmic Forecast'}
            </h1>
            <p className='text-xl text-muted-foreground italic'>
              {blogData.subtitle || ''}
            </p>
          </header>

          {/* Quick Stats Summary */}
          <QuickStats
            retrogradeCount={displayedRetrogrades.length}
            retrogradePlanets={displayedRetrogrades.map((r: any) => r.planet)}
            majorMoonPhase={
              displayedMoonPhases.find(
                (m: any) =>
                  m.phase?.includes('Full') || m.phase?.includes('New'),
              )
                ? {
                    phase:
                      displayedMoonPhases.find(
                        (m: any) =>
                          m.phase?.includes('Full') || m.phase?.includes('New'),
                      )?.phase || '',
                    sign:
                      displayedMoonPhases.find(
                        (m: any) =>
                          m.phase?.includes('Full') || m.phase?.includes('New'),
                      )?.sign || '',
                  }
                : undefined
            }
            planetaryHighlightCount={displayedHighlights.length}
            aspectCount={displayedAspects.length}
          />

          {/* Week Timeline */}
          {(() => {
            const timelineEvents = buildTimelineEvents(
              displayedHighlights,
              displayedMoonPhases,
              displayedRetrogrades,
              displayedAspects,
            );
            return timelineEvents.length > 0 ? (
              <WeekTimeline
                weekStart={weekStart}
                weekEnd={weekEnd}
                events={timelineEvents}
              />
            ) : null;
          })()}

          <div className='prose prose-invert max-w-none'>
            <p className='text-lg leading-relaxed'>{summaryText}</p>
          </div>

          {/* Inline Contextual CTA - personalisation hook after summary */}
          {await (async () => {
            const contextualNudge = getContextualNudge(
              `/blog/week/${canonicalWeekSlug}`,
            );
            const inlineCtaVariant = await getInlineCtaVariant();
            return contextualNudge ? (
              <InlineContextualNudge
                nudge={contextualNudge}
                location='blog_inline_post_summary'
                serverVariant={inlineCtaVariant}
              />
            ) : null;
          })()}

          {/* Weekly Affirmation */}
          <WeeklyAffirmation
            affirmation={generateWeeklyAffirmation(
              displayedMoonPhases,
              displayedHighlights,
              displayedRetrogrades,
            )}
            weekTitle={blogData.title}
          />

          {/* Tarot Card of the Week */}
          <TarotOfWeek
            weekNumber={blogData.weekNumber || 1}
            year={blogData.year || new Date().getFullYear()}
            dominantPlanet={
              displayedHighlights[0]?.planet || displayedRetrogrades[0]?.planet
            }
            variant='full'
            weekTitle={blogData.title}
          />

          {/* Weekly Numerology */}
          <WeeklyNumerology weekStart={weekStart} variant='full' />

          {displayedHighlights.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Star className='h-8 w-8' />
                Major Planetary Highlights
              </h2>
              <div className='space-y-6'>
                {displayedHighlights.map((highlight: any, index: number) => {
                  const planetColor = getPlanetColor(highlight.planet);
                  const borderColor = getPlanetBorderColor(highlight.planet);
                  const bgColor = getPlanetBgColor(highlight.planet);

                  const getEventTitle = () => {
                    if (
                      highlight.event === 'enters-sign' &&
                      highlight.details?.toSign
                    ) {
                      return `${highlight.planet} enters ${highlight.details.toSign}`;
                    }
                    return `${highlight.planet} ${highlight.event.replace('-', ' ')}`;
                  };

                  return (
                    <Card
                      key={index}
                      className={`border ${borderColor} ${bgColor}`}
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <CardTitle className={`text-xl ${planetColor}`}>
                            {getEventTitle()}
                          </CardTitle>
                          <Badge variant='secondary'>
                            {highlight.date instanceof Date
                              ? highlight.date.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : new Date(highlight.date).toLocaleDateString(
                                  'en-US',
                                  {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                  },
                                )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <p className='text-sm text-muted-foreground italic'>
                          Significance:{' '}
                          <span className='capitalize'>
                            {highlight.significance}
                          </span>
                        </p>
                        {highlight.details?.fromSign &&
                          highlight.details?.toSign && (
                            <p className='text-sm'>
                              This transition from {highlight.details.fromSign}{' '}
                              to {highlight.details.toSign} brings
                              transformative energy.
                            </p>
                          )}
                        {highlight.description &&
                          !highlight.description.includes(highlight.planet) &&
                          !highlight.description.includes(
                            highlight.details?.toSign || '',
                          ) && <p>{highlight.description}</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {displayedRetrogrades.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <TrendingUp className='h-8 w-8' />
                Retrograde Activity
              </h2>
              <div className='space-y-4'>
                {displayedRetrogrades.map((change: any, index: number) => {
                  const planetColor = getPlanetColor(change.planet);
                  const borderColor = getPlanetBorderColor(change.planet);
                  const bgColor = getPlanetBgColor(change.planet);

                  return (
                    <Card
                      key={index}
                      className={`border ${borderColor} ${bgColor}`}
                    >
                      <CardHeader>
                        <CardTitle className={`text-xl ${planetColor}`}>
                          {change.planet}{' '}
                          {change.type === 'station-direct'
                            ? 'Stations Direct'
                            : 'Stations Retrograde'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-muted-foreground mb-2'>
                          {change.date instanceof Date
                            ? change.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })
                            : new Date(change.date).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                },
                              )}
                        </p>
                        <p>{change.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {displayedMoonPhases.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Moon className='h-8 w-8' />
                Moon Phases
              </h2>
              <div className='grid gap-4 md:grid-cols-2'>
                {displayedMoonPhases.map((phase: any, index: number) => {
                  const moonColor = getPlanetColor('Moon');
                  const borderColor = getPlanetBorderColor('Moon');
                  const bgColor = getPlanetBgColor('Moon');

                  return (
                    <Card
                      key={index}
                      className={`border ${borderColor} ${bgColor}`}
                    >
                      <CardHeader>
                        <CardTitle className={`text-lg ${moonColor}`}>
                          {phase.phase || phase.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-muted-foreground mb-2'>
                          {phase.date instanceof Date
                            ? phase.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })
                            : new Date(phase.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })}
                          {phase.time && ` at ${phase.time}`}
                        </p>
                        <p className='text-sm mb-2'>
                          {phase.energy || phase.description}
                        </p>
                        {phase.guidance && (
                          <p className='text-xs text-muted-foreground mb-2'>
                            {phase.guidance}
                          </p>
                        )}
                        {phase.sign && (
                          <Badge variant='outline' className='text-xs'>
                            Moon in {phase.sign}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {displayedCrystals.length > 0 && (
            <CrystalCards crystals={displayedCrystals} />
          )}

          {/* Void of Course Moon Schedule */}
          {blogData.magicalTiming?.voidOfCourseMoon?.length > 0 && (
            <VOCMoonSchedule
              voidPeriods={blogData.magicalTiming.voidOfCourseMoon}
              variant='full'
            />
          )}

          {displayedAspects.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Sparkles className='h-8 w-8' />
                Major Aspects
              </h2>
              <div className='space-y-4'>
                {displayedAspects.map((aspect: any, index: number) => {
                  const planetAColor = getPlanetColor(aspect.planetA);
                  const planetBColor = getPlanetColor(aspect.planetB);
                  const borderColor = 'border-zinc-700';
                  const bgColor = 'bg-zinc-800/50';

                  return (
                    <Card
                      key={index}
                      className={`border ${borderColor} ${bgColor}`}
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <CardTitle className='text-xl'>
                            <span className={planetAColor}>
                              {getPlanetSymbol(aspect.planetA)} {aspect.planetA}
                            </span>{' '}
                            <span className='text-zinc-400'>
                              {getAspectSymbol(aspect.aspect)}
                            </span>{' '}
                            <span className={planetBColor}>
                              {getPlanetSymbol(aspect.planetB)} {aspect.planetB}
                            </span>
                          </CardTitle>
                          <AspectNatureBadge aspect={aspect.aspect} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-muted-foreground mb-2'>
                          {aspect.date instanceof Date
                            ? aspect.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })
                            : new Date(aspect.date).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                },
                              )}
                        </p>
                        {aspect.description ? (
                          <p>{aspect.description}</p>
                        ) : aspect.energy || aspect.guidance ? (
                          <div>
                            {aspect.energy && (
                              <p className='mb-2'>{aspect.energy}</p>
                            )}
                            {aspect.guidance && (
                              <p className='text-sm text-muted-foreground'>
                                {aspect.guidance}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            {getAspectDescriptionFallback(
                              aspect.aspect,
                              aspect.planetA,
                              aspect.planetB,
                            )}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {bestDaysEntries.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold'>Best Days For</h2>
              <div className='grid gap-4 md:grid-cols-2'>
                {bestDaysEntries.map(([category, days]: [string, any]) => {
                  // Deduplicate dates by converting to date strings and back
                  const dateStrings = days.dates
                    .map((d: any) => {
                      const date = d instanceof Date ? d : new Date(d);
                      if (isNaN(date.getTime())) return null;
                      return date.toISOString().split('T')[0]; // Use YYYY-MM-DD for deduplication
                    })
                    .filter((ds: string | null): ds is string => ds !== null);

                  const uniqueDateStrings = Array.from(
                    new Set(dateStrings),
                  ) as string[];
                  const uniqueDates = uniqueDateStrings
                    .map((dateStr: string) => new Date(dateStr))
                    .sort((a, b) => a.getTime() - b.getTime());

                  // Format dates for display
                  const formattedDates = uniqueDates.map((date) =>
                    date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    }),
                  );

                  // Collapse long lists (show first 5-7, then "and X more")
                  const maxVisible = 7;
                  const displayDates =
                    formattedDates.length > maxVisible
                      ? [
                          ...formattedDates.slice(0, maxVisible),
                          `and ${formattedDates.length - maxVisible} more`,
                        ]
                      : formattedDates;

                  // Update reason to match deduplicated count - MUST use same array as rendering
                  // Rule: count must come from the same uniqueDates array used for display
                  const uniqueCount = uniqueDates.length; // This is the source of truth
                  let reason = days.reason || '';

                  if (reason && uniqueCount > 0) {
                    // Replace numeric counts with actual deduplicated count from same array
                    if (/\d+ day/.test(reason)) {
                      reason = reason.replace(
                        /\d+ day/,
                        `${uniqueCount} day${uniqueCount !== 1 ? 's' : ''}`,
                      );
                    }
                  } else if (!reason && uniqueCount > 0) {
                    // Fallback if no reason provided - use non-numeric if count uncertain
                    if (uniqueCount > 0) {
                      reason = `Several days this week support ${category
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                        .toLowerCase()}.`;
                    }
                  }

                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className='text-lg capitalize'>
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <p className='text-sm'>
                          {displayDates.length > 0
                            ? displayDates.join(', ')
                            : 'No specific dates this week'}
                        </p>
                        {reason && (
                          <p className='text-xs text-muted-foreground italic'>
                            {reason}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </article>

        {/* Contextual Nudge Section - personalisation CTA */}
        {(() => {
          const contextualNudge = getContextualNudge(
            `/blog/week/${canonicalWeekSlug}`,
          );
          return contextualNudge ? (
            <ContextualNudgeSection
              nudge={contextualNudge}
              location='blog_contextual_nudge'
            />
          ) : null;
        })()}

        {/* App CTA Section */}
        <section className='mt-8 pt-8 border-t border-zinc-800'>
          <CrossPlatformCTA variant='app' source='blog_post' />
        </section>

        {/* Social Sharing Section */}
        <section className='mt-8 pt-8 border-t border-zinc-800'>
          <h2 className='text-xl font-semibold mb-4'>Share This Forecast</h2>
          <SocialShareButtons
            url={`https://lunary.app/blog/week/${canonicalWeekSlug}`}
            title={blogData.title}
          />
        </section>

        {/* Related Posts Section */}
        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <h2 className='text-2xl font-semibold mb-6'>
            Related Weekly Forecasts
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {(() => {
              const currentWeekNum = blogData.weekNumber || 1;
              const currentYear = blogData.year || 2025;
              const relatedWeeks = [
                {
                  week: currentWeekNum - 1,
                  year: currentYear,
                  label: 'Previous Week',
                },
                {
                  week: currentWeekNum + 1,
                  year: currentYear,
                  label: 'Next Week',
                },
                {
                  week: currentWeekNum - 4,
                  year: currentYear,
                  label: 'Last Month',
                },
              ].filter((w) => w.week > 0);

              return relatedWeeks.map((related) => {
                const weekSlug = `week-${related.week}-${related.year}`;
                return (
                  <Link
                    key={weekSlug}
                    href={`/blog/week/${weekSlug}${linkSuffix}`}
                    className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all group'
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge variant='outline' className='text-xs'>
                        Week {related.week}
                      </Badge>
                      <span className='text-xs text-zinc-400'>
                        {related.year}
                      </span>
                    </div>
                    <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-1'>
                      {related.label}
                    </h3>
                    <p className='text-sm text-zinc-400'>
                      {related.week === currentWeekNum - 1
                        ? 'Previous cosmic forecast'
                        : related.week === currentWeekNum + 1
                          ? 'Upcoming cosmic forecast'
                          : 'Earlier cosmic forecast'}
                    </p>
                  </Link>
                );
              });
            })()}
          </div>
          <div className='mt-6'>
            <Link
              href={`/blog${linkSuffix}`}
              className='inline-flex items-center gap-2 text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors text-sm font-medium'
            >
              View All Weekly Forecasts
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </section>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Learn More in the Grimoire
          </h2>
          <p className='text-sm text-zinc-400 mb-6'>
            Deepen your understanding of the cosmic energies mentioned in this
            forecast.
          </p>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            <Link
              href='/grimoire/astronomy/planets'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Planetary Meanings
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Understand planet influences
              </p>
            </Link>
            <Link
              href='/grimoire/moon/phases'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Moon Phases</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Work with lunar energy
              </p>
            </Link>
            <Link
              href='/grimoire/astronomy/retrogrades'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Retrogrades Guide
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Navigate retrograde periods
              </p>
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Zodiac Signs</span>
              <p className='text-xs text-zinc-500 mt-1'>Explore all 12 signs</p>
            </Link>
            <Link
              href='/grimoire/aspects/types'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Aspect Types</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Learn about planetary aspects
              </p>
            </Link>
            <Link
              href='/birth-chart'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Your Birth Chart
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Personalized cosmic insights
              </p>
            </Link>
          </div>
        </section>

        {/* Breadcrumb Schema */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://lunary.app',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Blog',
                  item: 'https://lunary.app/blog',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: blogData.title,
                  item: `https://lunary.app/blog/week/${canonicalWeekSlug}`,
                },
              ],
            }),
          }}
        />

        {/* Article Schema */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: blogData.title,
              description: blogData.subtitle,
              image: `https://lunary.app/api/og/cosmic?date=${weekStart.toISOString().split('T')[0]}`,
              datePublished: weekStart.toISOString(),
              dateModified:
                typeof blogData.generatedAt === 'string'
                  ? blogData.generatedAt
                  : blogData.generatedAt instanceof Date
                    ? blogData.generatedAt.toISOString()
                    : new Date(blogData.generatedAt).toISOString(),
              author: {
                '@type': 'Organization',
                name: 'Lunary Cosmic Team',
                url: 'https://lunary.app',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Lunary',
                url: 'https://lunary.app',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://lunary.app/logo.png',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://lunary.app/blog/week/${canonicalWeekSlug}`,
              },
              articleSection: 'Weekly Forecast',
              keywords: [
                'astrology',
                'weekly forecast',
                'horoscope',
                'planetary transits',
                'moon phases',
                `week ${blogData.weekNumber} ${blogData.year}`,
              ],
              wordCount:
                blogData.summary.split(' ').length +
                (blogData.planetaryHighlights?.length || 0) * 50,
            }),
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('[BlogPostPage] Error rendering blog post page:', error);
    console.error(
      '[BlogPostPage] Error name:',
      error instanceof Error ? error.name : 'Unknown',
    );
    console.error(
      '[BlogPostPage] Error message:',
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      '[BlogPostPage] Error stack:',
      error instanceof Error ? error.stack : 'No stack',
    );

    // Log blogData structure if available
    try {
      if (weekInfo) {
        const blogDataRaw = await getBlogData(weekInfo).catch(() => null);
        if (blogDataRaw) {
          console.error('[BlogPostPage] Blog data structure:', {
            hasWeekStart: !!blogDataRaw.weekStart,
            hasWeekEnd: !!blogDataRaw.weekEnd,
            hasTitle: !!blogDataRaw.title,
            hasSubtitle: !!blogDataRaw.subtitle,
            hasSummary: !!blogDataRaw.summary,
            planetaryHighlightsLength: blogDataRaw.planetaryHighlights?.length,
            retrogradeChangesLength: blogDataRaw.retrogradeChanges?.length,
            moonPhasesLength: blogDataRaw.moonPhases?.length,
            majorAspectsLength: blogDataRaw.majorAspects?.length,
            dailyForecastsLength: blogDataRaw.dailyForecasts?.length,
          });
        }
      }
    } catch (e) {
      console.error('[BlogPostPage] Could not log blog data structure:', e);
    }

    return (
      <div className='container mx-auto p-4 max-w-4xl'>
        <h1 className='text-2xl font-bold mb-4'>Error loading blog post</h1>
        <p className='text-muted-foreground mb-4'>
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        {error instanceof Error && error.stack && (
          <pre className='text-xs bg-zinc-900 p-4 rounded overflow-auto max-h-96'>
            {error.stack}
          </pre>
        )}
        <p className='text-sm text-muted-foreground mt-4'>
          Check the browser console and server logs for more details.
        </p>
      </div>
    );
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { week } = await params;
  const weekInfo = parseWeekParam(week);
  const blogData = await getBlogData(weekInfo);

  // Ensure weekStart and weekEnd are Date objects before calling toLocaleDateString
  const weekStart =
    blogData.weekStart instanceof Date
      ? blogData.weekStart
      : new Date(blogData.weekStart);
  const weekEnd =
    blogData.weekEnd instanceof Date
      ? blogData.weekEnd
      : new Date(blogData.weekEnd);

  const weekRange = `${weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })} - ${weekEnd.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const canonicalPath = `/blog/week/${weekInfo.slug}`;
  const url = `https://lunary.app${canonicalPath}`;
  const ogImage = `https://lunary.app/api/og/educational/blog?title=${encodeURIComponent(blogData.title)}&subtitle=${encodeURIComponent(`Week of ${weekRange}`)}&format=landscape`;

  const keywords = [
    'astrology',
    'weekly forecast',
    'horoscope',
    'planetary transits',
    'moon phases',
    'astrological guidance',
    'cosmic insights',
    `week ${blogData.weekNumber} ${blogData.year}`,
    'retrograde',
    'astrological aspects',
    'lunar calendar',
  ];

  const shortWeekRange = `${weekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${weekEnd.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  return {
    title: `Weekly Astrology Forecast: ${shortWeekRange} | Lunary`,
    description: `This week's key transits: ${blogData.subtitle} Best & worst days for love, money & decisions — free weekly forecast.`,
    keywords: [
      'weekly astrology forecast',
      'astrology timing',
      'planetary transits',
      'moon phases',
      'best days astrology',
      'weekly horoscope timing',
      'astrological guidance',
      `week ${blogData.weekNumber} ${blogData.year}`,
      'retrogrades',
      'astrological aspects',
    ],
    authors: [{ name: 'Lunary Cosmic Team' }],
    creator: 'Lunary',
    publisher: 'Lunary',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${blogData.title} | ${weekRange}`,
      description: `What's happening in the stars ${weekRange}? ${blogData.subtitle} Best days for love, career & decisions.`,
      url,
      siteName: 'Lunary',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blogData.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: weekStart.toISOString(),
      modifiedTime: blogData.generatedAt,
      authors: ['Lunary Cosmic Team'],
      section: 'Weekly Astrology',
      tags: [
        'weekly astrology',
        'planetary transits',
        'moon phases',
        'best days astrology',
        'astrological timing',
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blogData.title} | ${weekRange}`,
      description: `What's cosmically in store this week? Best days for love, career & big decisions. Free forecast.`,
      images: [ogImage],
      creator: '@lunaryapp',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
