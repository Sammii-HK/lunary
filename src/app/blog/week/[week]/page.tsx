import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Star,
  TrendingUp,
  Moon,
  Sparkles,
  Gem,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { CrossPlatformCTA } from '@/components/CrossPlatformCTA';

interface BlogPostPageProps {
  params: Promise<{ week: string }>;
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
    Sun: 'text-yellow-400',
    Moon: 'text-blue-400',
    Mercury: 'text-gray-400',
    Venus: 'text-pink-400',
    Mars: 'text-red-400',
    Jupiter: 'text-purple-400',
    Saturn: 'text-indigo-400',
    Uranus: 'text-cyan-400',
    Neptune: 'text-blue-500',
    Pluto: 'text-violet-600',
  };
  return colors[planet] || 'text-zinc-300';
}

function getPlanetBorderColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: 'border-yellow-400/30',
    Moon: 'border-blue-400/30',
    Mercury: 'border-gray-400/30',
    Venus: 'border-pink-400/30',
    Mars: 'border-red-400/30',
    Jupiter: 'border-purple-400/30',
    Saturn: 'border-indigo-400/30',
    Uranus: 'border-cyan-400/30',
    Neptune: 'border-blue-500/30',
    Pluto: 'border-violet-600/30',
  };
  return colors[planet] || 'border-zinc-700';
}

function getPlanetBgColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: 'bg-yellow-400/10',
    Moon: 'bg-blue-400/10',
    Mercury: 'bg-gray-400/10',
    Venus: 'bg-pink-400/10',
    Mars: 'bg-red-400/10',
    Jupiter: 'bg-purple-400/10',
    Saturn: 'bg-indigo-400/10',
    Uranus: 'bg-cyan-400/10',
    Neptune: 'bg-blue-500/10',
    Pluto: 'bg-violet-600/10',
  };
  return colors[planet] || 'bg-zinc-800/50';
}

// Cache for blog data to avoid regenerating for the same week
const blogDataCache = new Map<string, Promise<any>>();

const BLOG_SECTION_LIMITS = {
  planetaryHighlights: 3,
  retrogradeChanges: 2,
  moonPhases: 2,
  majorAspects: 3,
  crystalRecommendations: 3,
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

async function getBlogData(weekInfo: WeekInfo) {
  const cacheKey = weekInfo.slug;

  // Check cache first
  if (blogDataCache.has(cacheKey)) {
    const cached = await blogDataCache.get(cacheKey)!;
    console.log(
      '[getBlogData] Using cached data for week:',
      cacheKey,
      'crystal count:',
      cached.crystalRecommendations?.length || 0,
    );
    return cached;
  }

  // Create promise for this week
  const promise = (async () => {
    const startOfYear = new Date(weekInfo.year, 0, 1);
    const weekStartDate = new Date(startOfYear);
    weekStartDate.setDate(
      weekStartDate.getDate() + (weekInfo.weekNumber - 1) * 7,
    );

    try {
      console.log(
        '[getBlogData] Generating weekly content for:',
        cacheKey,
        weekStartDate.toISOString(),
      );
      const startTime = Date.now();
      // Call the function directly instead of making an HTTP request
      const weeklyData = await generateWeeklyContent(weekStartDate);
      const duration = Date.now() - startTime;
      console.log(
        `[getBlogData] Weekly content generated for ${cacheKey} in ${duration}ms`,
      );
      // Serialize any Date instances so React never receives raw Date objects
      return serializeDates(weeklyData);
    } catch (error) {
      console.error(
        `[getBlogData] Error generating blog data for ${cacheKey}:`,
        error,
      );
      console.error(
        '[getBlogData] Error stack:',
        error instanceof Error ? error.stack : 'No stack',
      );
      // Remove from cache on error
      blogDataCache.delete(cacheKey);
      throw new Error(
        `Failed to generate blog data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  })();

  // Store in cache
  blogDataCache.set(cacheKey, promise);

  // Clean up cache after 1 hour to prevent memory leaks
  setTimeout(
    () => {
      blogDataCache.delete(cacheKey);
    },
    60 * 60 * 1000,
  );

  return promise;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let rawWeekParam: string | undefined;
  let weekInfo: WeekInfo | null = null;

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
    const displayedHighlights =
      blogData.planetaryHighlights?.slice(
        0,
        BLOG_SECTION_LIMITS.planetaryHighlights,
      ) || [];
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

    const summaryIntroParts = [
      displayedHighlights.length
        ? `${displayedHighlights.length} major planetary shift${displayedHighlights.length > 1 ? 's' : ''}`
        : null,
      displayedRetrogrades.length
        ? `${displayedRetrogrades.length} retrograde moment${displayedRetrogrades.length > 1 ? 's' : ''}`
        : null,
      displayedMoonPhases.length
        ? `${displayedMoonPhases.length} lunar phase${displayedMoonPhases.length > 1 ? 's' : ''}`
        : null,
    ].filter(Boolean);

    const curatedSummaryIntro = summaryIntroParts.length
      ? `Top ${summaryIntroParts.join(', ')} guide this week.`
      : '';
    const baseSummary =
      getFirstSentences(blogData.summary, 2) ||
      'Weekly cosmic insights and guidance.';
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
      <div className='container mx-auto py-8 px-4 max-w-4xl'>
        <Link
          href='/blog'
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

            <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Star className='h-4 w-4' />
                {displayedHighlights.length} planetary events
              </span>
              <span className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4' />
                {displayedRetrogrades.length} retrograde changes
              </span>
              <span className='flex items-center gap-1'>
                <Moon className='h-4 w-4' />
                {displayedMoonPhases.length} moon phases
              </span>
              <span className='flex items-center gap-1'>
                <Sparkles className='h-4 w-4' />
                {displayedAspects.length} major aspects
              </span>
            </div>
          </header>

          <div className='prose prose-invert max-w-none'>
            <p className='text-lg leading-relaxed'>{summaryText}</p>
          </div>

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
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Gem className='h-8 w-8' />
                Weekly Crystal Companions
              </h2>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {displayedCrystals.map((crystal: any, index: number) => {
                  const crystalDate =
                    crystal.date instanceof Date
                      ? crystal.date
                      : new Date(crystal.date);
                  return (
                    <Card key={index} className='border border-purple-500/20'>
                      <CardHeader>
                        <CardTitle className='text-lg text-purple-200'>
                          {crystal.crystal}
                        </CardTitle>
                        <p className='text-sm text-zinc-400'>
                          {crystalDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </CardHeader>
                      <CardContent className='space-y-3 text-sm text-zinc-300'>
                        <p>{crystal.reason}</p>
                        {crystal.usage && (
                          <p className='text-xs text-zinc-400'>
                            {crystal.usage}
                          </p>
                        )}
                        <div className='flex flex-wrap gap-2'>
                          {crystal.chakra && (
                            <Badge variant='outline' className='text-xs'>
                              {crystal.chakra} Chakra
                            </Badge>
                          )}
                          {crystal.intention && (
                            <Badge variant='secondary' className='text-xs'>
                              {crystal.intention}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
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
                        <CardTitle className='text-xl'>
                          <span className={planetAColor}>{aspect.planetA}</span>{' '}
                          <span className='text-zinc-400'>{aspect.aspect}</span>{' '}
                          <span className={planetBColor}>{aspect.planetB}</span>
                        </CardTitle>
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
                        <p>{aspect.description}</p>
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
                {bestDaysEntries.map(([category, days]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className='text-lg capitalize'>
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm mb-2'>
                        {days.dates
                          .map((d: any) => {
                            const date = d instanceof Date ? d : new Date(d);
                            if (isNaN(date.getTime())) {
                              return '';
                            }
                            return date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            });
                          })
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {days?.reason && (
                        <p className='text-xs text-muted-foreground italic'>
                          {days.reason}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </article>

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
                    href={`/blog/week/${weekSlug}`}
                    className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all group'
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge variant='outline' className='text-xs'>
                        Week {related.week}
                      </Badge>
                      <span className='text-xs text-zinc-500'>
                        {related.year}
                      </span>
                    </div>
                    <h3 className='font-medium text-zinc-100 group-hover:text-purple-300 transition-colors mb-1'>
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
              href='/blog'
              className='inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium'
            >
              View All Weekly Forecasts
              <ArrowRight className='h-4 w-4' />
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
      <div className='container mx-auto py-8 px-4 max-w-4xl'>
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

  const url = `https://lunary.app/blog/week/${weekInfo.slug}`;
  const ogImage = `https://lunary.app/api/og/cosmic?date=${weekStart.toISOString().split('T')[0]}`;

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

  return {
    title: `${blogData.title} | Lunary Blog`,
    description: `${blogData.subtitle} Week of ${weekRange}. ${blogData.summary.substring(0, 120)}...`,
    keywords,
    authors: [{ name: 'Lunary Cosmic Team' }],
    creator: 'Lunary',
    publisher: 'Lunary',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: blogData.title,
      description: `${blogData.subtitle} Week of ${weekRange}`,
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
      section: 'Weekly Forecast',
      tags: keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: blogData.title,
      description: `${blogData.subtitle} Week of ${weekRange}`,
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
    other: {
      'article:published_time': weekStart.toISOString(),
      'article:modified_time': blogData.generatedAt,
      'article:author': 'Lunary Cosmic Team',
      'article:section': 'Weekly Forecast',
    },
  };
}
