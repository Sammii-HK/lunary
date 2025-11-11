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

interface BlogPostPageProps {
  params: Promise<{ week: string }>;
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

// Helper function to safely convert any value to string for rendering
function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function convertDatesToObjects(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // If it's already a Date object, return it as-is (we'll handle conversion at render time)
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDatesToObjects);
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      const value = obj[key];
      // If it's already a Date object, keep it (we'll convert at render time)
      if (value instanceof Date) {
        converted[key] = value;
      } else if (typeof value === 'string') {
        // Try to parse as date if it looks like an ISO date string
        const date = new Date(value);
        if (
          !isNaN(date.getTime()) &&
          (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))
        ) {
          converted[key] = date;
        } else {
          converted[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = convertDatesToObjects(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  return obj;
}

async function getBlogData(week: string) {
  // Check cache first
  if (blogDataCache.has(week)) {
    const cached = await blogDataCache.get(week)!;
    console.log(
      '[getBlogData] Using cached data, crystal count:',
      cached.crystalRecommendations?.length || 0,
    );
    return cached;
  }

  // Create promise for this week
  const promise = (async () => {
    const [weekNumber, year] = week.split('-');
    const startOfYear = new Date(parseInt(year), 0, 1);
    const weekStartDate = new Date(startOfYear);
    weekStartDate.setDate(
      weekStartDate.getDate() + (parseInt(weekNumber) - 1) * 7,
    );

    try {
      console.log(
        '[getBlogData] Generating weekly content for:',
        weekStartDate.toISOString(),
      );
      const startTime = Date.now();
      // Call the function directly instead of making an HTTP request
      const weeklyData = await generateWeeklyContent(weekStartDate);
      const duration = Date.now() - startTime;
      console.log(`[getBlogData] Weekly content generated in ${duration}ms`);
      // Dates are already Date objects when calling directly, but ensure they're properly formatted
      // Convert any nested date strings that might exist
      return convertDatesToObjects(weeklyData);
    } catch (error) {
      console.error('[getBlogData] Error generating blog data:', error);
      console.error(
        '[getBlogData] Error stack:',
        error instanceof Error ? error.stack : 'No stack',
      );
      // Remove from cache on error
      blogDataCache.delete(week);
      throw new Error(
        `Failed to generate blog data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  })();

  // Store in cache
  blogDataCache.set(week, promise);

  // Clean up cache after 1 hour to prevent memory leaks
  setTimeout(
    () => {
      blogDataCache.delete(week);
    },
    60 * 60 * 1000,
  );

  return promise;
}

// Helper to ensure all Date objects in nested structures are properly handled
function ensureDatesAreObjects(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(ensureDatesAreObjects);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      const value = obj[key];
      if (value instanceof Date) {
        result[key] = value;
      } else if (
        typeof value === 'string' &&
        (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))
      ) {
        // Try to parse as date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          result[key] = date;
        } else {
          result[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = ensureDatesAreObjects(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return obj;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let week: string | undefined;
  try {
    const resolvedParams = await params;
    week = resolvedParams.week;
    console.log('[BlogPostPage] Starting render for week:', week);
    console.log('[BlogPostPage] Fetching blog data for week:', week);
    const blogDataRaw = await getBlogData(week);
    console.log('[BlogPostPage] Blog data fetched, processing dates...');

    // Ensure all dates are properly converted
    const blogData = ensureDatesAreObjects(blogDataRaw);
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
                {blogData.planetaryHighlights?.length || 0} planetary events
              </span>
              <span className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4' />
                {blogData.retrogradeChanges?.length || 0} retrograde changes
              </span>
              <span className='flex items-center gap-1'>
                <Moon className='h-4 w-4' />
                {blogData.moonPhases?.length || 0} moon phases
              </span>
              <span className='flex items-center gap-1'>
                <Sparkles className='h-4 w-4' />
                {blogData.majorAspects?.length || 0} major aspects
              </span>
            </div>
          </header>

          <div className='prose prose-invert max-w-none'>
            <p className='text-lg leading-relaxed'>
              {blogData.summary || 'Weekly cosmic insights and guidance.'}
            </p>
          </div>

          {blogData.planetaryHighlights &&
            blogData.planetaryHighlights.length > 0 && (
              <section className='space-y-6'>
                <h2 className='text-3xl font-bold flex items-center gap-2'>
                  <Star className='h-8 w-8' />
                  Major Planetary Highlights
                </h2>
                <div className='space-y-6'>
                  {blogData.planetaryHighlights.map(
                    (highlight: any, index: number) => {
                      const planetColor = getPlanetColor(highlight.planet);
                      const borderColor = getPlanetBorderColor(
                        highlight.planet,
                      );
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
                                  This transition from{' '}
                                  {highlight.details.fromSign} to{' '}
                                  {highlight.details.toSign} brings
                                  transformative energy.
                                </p>
                              )}
                            {highlight.description &&
                              !highlight.description.includes(
                                highlight.planet,
                              ) &&
                              !highlight.description.includes(
                                highlight.details?.toSign || '',
                              ) && <p>{highlight.description}</p>}
                          </CardContent>
                        </Card>
                      );
                    },
                  )}
                </div>
              </section>
            )}

          {blogData.retrogradeChanges &&
            blogData.retrogradeChanges.length > 0 && (
              <section className='space-y-6'>
                <h2 className='text-3xl font-bold flex items-center gap-2'>
                  <TrendingUp className='h-8 w-8' />
                  Retrograde Activity
                </h2>
                <div className='space-y-4'>
                  {blogData.retrogradeChanges.map(
                    (change: any, index: number) => {
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
                    },
                  )}
                </div>
              </section>
            )}

          {blogData.moonPhases && blogData.moonPhases.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Moon className='h-8 w-8' />
                Moon Phases
              </h2>
              <div className='grid gap-4 md:grid-cols-2'>
                {blogData.moonPhases.map((phase: any, index: number) => {
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

          {blogData.majorAspects && blogData.majorAspects.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Sparkles className='h-8 w-8' />
                Major Aspects
              </h2>
              <div className='space-y-4'>
                {blogData.majorAspects.map((aspect: any, index: number) => {
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

          {blogData.dailyForecasts && blogData.dailyForecasts.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold flex items-center gap-2'>
                <Calendar className='h-8 w-8' />
                Daily Forecasts
              </h2>
              <div className='space-y-4'>
                {blogData.dailyForecasts.map((forecast: any, index: number) => {
                  // Find matching crystal recommendation for this day
                  // Ensure dates are Date objects before comparison
                  const forecastDate =
                    forecast.date instanceof Date
                      ? forecast.date
                      : new Date(forecast.date);

                  // Debug logging
                  if (index === 0) {
                    console.log(
                      '[BlogPostPage] crystalRecommendations:',
                      blogData.crystalRecommendations?.length || 0,
                    );
                    console.log(
                      '[BlogPostPage] First forecast date:',
                      forecastDate.toDateString(),
                    );
                    if (
                      blogData.crystalRecommendations &&
                      blogData.crystalRecommendations.length > 0
                    ) {
                      console.log(
                        '[BlogPostPage] First crystal date:',
                        blogData.crystalRecommendations[0].date instanceof Date
                          ? blogData.crystalRecommendations[0].date.toDateString()
                          : new Date(
                              blogData.crystalRecommendations[0].date,
                            ).toDateString(),
                      );
                    }
                  }

                  const crystal = blogData.crystalRecommendations?.find(
                    (c: any) => {
                      if (!c || !c.date) return false;
                      // Use toDateString() for comparison (same as blog manager)
                      const cDateStr = new Date(c.date).toDateString();
                      const forecastDateStr = forecastDate.toDateString();
                      const match = cDateStr === forecastDateStr;
                      if (index === 0) {
                        console.log(
                          `[BlogPostPage] Comparing forecast ${forecastDateStr} with crystal ${cDateStr}: ${match ? 'MATCH' : 'NO MATCH'} (${c.crystal})`,
                        );
                      }
                      return match;
                    },
                  );

                  if (index === 0) {
                    console.log(
                      `[BlogPostPage] Result for first forecast: ${crystal ? `Found crystal: ${crystal.crystal}` : 'NO CRYSTAL FOUND'}`,
                    );
                  }

                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          {forecastDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        <div>
                          <p className='mb-2'>{forecast.energy}</p>
                          <p className='text-sm text-muted-foreground mb-2'>
                            {forecast.guidance}
                          </p>
                        </div>

                        {crystal && (
                          <div className='pt-3 border-t border-zinc-700'>
                            <div className='flex items-start gap-2 mb-2'>
                              <Sparkles className='h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0' />
                              <div className='flex-1'>
                                <p className='text-sm font-medium mb-1'>
                                  Crystal: {crystal.crystal}
                                </p>
                                <p className='text-xs text-muted-foreground mb-2'>
                                  {crystal.reason}
                                </p>
                                <p className='text-xs text-muted-foreground mb-2'>
                                  {crystal.usage}
                                </p>
                                <div className='flex flex-wrap gap-2'>
                                  {crystal.chakra && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {crystal.chakra} Chakra
                                    </Badge>
                                  )}
                                  {crystal.intention && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {crystal.intention}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {forecast.avoid && forecast.avoid.length > 0 && (
                          <div className='flex flex-wrap gap-2'>
                            <span className='text-xs text-muted-foreground mr-2'>
                              Avoid:
                            </span>
                            {forecast.avoid.map(
                              (item: string, itemIndex: number) => (
                                <Badge key={itemIndex} variant='secondary'>
                                  {item}
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {blogData.bestDaysFor &&
            (() => {
              // Filter to only show categories that have actual dates
              const entriesWithDates = Object.entries(
                blogData.bestDaysFor,
              ).filter(([, days]: [string, any]) => {
                return (
                  days?.dates &&
                  Array.isArray(days.dates) &&
                  days.dates.length > 0
                );
              });

              // Only render section if there are entries with dates
              if (entriesWithDates.length === 0) return null;

              return (
                <section className='space-y-6'>
                  <h2 className='text-3xl font-bold'>Best Days For</h2>
                  <div className='grid gap-4 md:grid-cols-2'>
                    {entriesWithDates.map(([category, days]: [string, any]) => (
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
                                // Ensure we have a Date object
                                const date =
                                  d instanceof Date ? d : new Date(d);
                                // Check if date is valid
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
              );
            })()}
        </article>

        {/* Social Sharing Section */}
        <section className='mt-8 pt-8 border-t border-zinc-800'>
          <h2 className='text-xl font-semibold mb-4'>Share This Forecast</h2>
          <div className='flex flex-wrap gap-3'>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.title)}&url=${encodeURIComponent(`https://lunary.app/blog/week/${week}`)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
              Share on X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://lunary.app/blog/week/${week}`)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
              </svg>
              Share on Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://lunary.app/blog/week/${week}`)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
              </svg>
              Share on LinkedIn
            </a>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `https://lunary.app/blog/week/${week}`,
                  );
                  alert('Link copied to clipboard!');
                } catch (err) {
                  console.error('Failed to copy:', err);
                }
              }}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
              Copy Link
            </button>
          </div>
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
                  item: `https://lunary.app/blog/week/${week}`,
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
                '@id': `https://lunary.app/blog/week/${week}`,
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
      if (week) {
        const blogDataRaw = await getBlogData(week).catch(() => null);
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
  const blogData = await getBlogData(week);

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

  const url = `https://lunary.app/blog/week/${week}`;
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
