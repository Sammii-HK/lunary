import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Star,
  TrendingUp,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

function convertDatesToObjects(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDatesToObjects);
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime()) && value.includes('T')) {
          converted[key] = date;
        } else {
          converted[key] = value;
        }
      } else if (typeof value === 'object') {
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
  const [weekNumber, year] = week.split('-');
  const startOfYear = new Date(parseInt(year), 0, 1);
  const weekStartDate = new Date(startOfYear);
  weekStartDate.setDate(
    weekStartDate.getDate() + (parseInt(weekNumber) - 1) * 7,
  );

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : 'http://localhost:3000';

  const response = await fetch(
    `${baseUrl}/api/blog/weekly?date=${weekStartDate.toISOString().split('T')[0]}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch blog data');
  }

  const result = await response.json();
  return convertDatesToObjects(result.data);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { week } = await params;
  const blogData = await getBlogData(week);

  const weekRange = `${blogData.weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })} - ${blogData.weekEnd.toLocaleDateString('en-US', {
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
            <Badge variant='outline'>Week {blogData.weekNumber}</Badge>
            <span>•</span>
            <span>{blogData.year}</span>
            <span>•</span>
            <time dateTime={blogData.weekStart.toISOString()}>{weekRange}</time>
          </div>

          <h1 className='text-4xl font-bold'>{blogData.title}</h1>
          <p className='text-xl text-muted-foreground italic'>
            {blogData.subtitle}
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
          <p className='text-lg leading-relaxed'>{blogData.summary}</p>
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
                              {highlight.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })}
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
                                {highlight.details.toSign} brings transformative
                                energy.
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
                            {change.date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
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
                        {phase.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {phase.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className='text-sm'>{phase.description}</p>
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
                        {aspect.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
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
              {blogData.dailyForecasts.map((forecast: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      {forecast.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='mb-2'>{forecast.energy}</p>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {forecast.guidance}
                    </p>
                    {forecast.bestFor && forecast.bestFor.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        <span className='text-xs text-muted-foreground mr-2'>
                          Best for:
                        </span>
                        {forecast.bestFor.map(
                          (item: string, itemIndex: number) => (
                            <Badge key={itemIndex} variant='outline'>
                              {item}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                    {forecast.avoid && forecast.avoid.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
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
              ))}
            </div>
          </section>
        )}

        {blogData.bestDaysFor && (
          <section className='space-y-6'>
            <h2 className='text-3xl font-bold'>Best Days For</h2>
            <div className='grid gap-4 md:grid-cols-2'>
              {Object.entries(blogData.bestDaysFor).map(
                ([category, days]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className='text-lg capitalize'>
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {days?.dates &&
                      Array.isArray(days.dates) &&
                      days.dates.length > 0 ? (
                        <>
                          <p className='text-sm mb-2'>
                            {days.dates
                              .map((d: Date) =>
                                d.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                }),
                              )
                              .join(', ')}
                          </p>
                          {days?.reason && (
                            <p className='text-xs text-muted-foreground italic'>
                              {days.reason}
                            </p>
                          )}
                        </>
                      ) : (
                        days?.reason && (
                          <p className='text-sm text-muted-foreground'>
                            {days.reason}
                          </p>
                        )
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>
        )}

        {blogData.crystalRecommendations &&
          blogData.crystalRecommendations.length > 0 && (
            <section className='space-y-6'>
              <h2 className='text-3xl font-bold'>Crystal Recommendations</h2>
              <div className='grid gap-4 md:grid-cols-2'>
                {blogData.crystalRecommendations.map(
                  (crystal: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          {crystal.crystal}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm mb-2'>{crystal.reason}</p>
                        <p className='text-xs text-muted-foreground mb-2'>
                          {crystal.usage}
                        </p>
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {crystal.intention && (
                            <Badge variant='secondary'>
                              {crystal.intention}
                            </Badge>
                          )}
                          {crystal.chakra && (
                            <Badge variant='outline'>{crystal.chakra}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>
          )}
      </article>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: blogData.title,
            description: blogData.subtitle,
            image: `https://lunary.app/api/og/cosmic?date=${blogData.weekStart.toISOString().split('T')[0]}`,
            datePublished: blogData.weekStart.toISOString(),
            dateModified: blogData.generatedAt,
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
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { week } = await params;
  const blogData = await getBlogData(week);

  const weekRange = `${blogData.weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })} - ${blogData.weekEnd.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const url = `https://lunary.app/blog/week/${week}`;
  const ogImage = `https://lunary.app/api/og/cosmic?date=${blogData.weekStart.toISOString().split('T')[0]}`;

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
      publishedTime: blogData.weekStart.toISOString(),
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
      'article:published_time': blogData.weekStart.toISOString(),
      'article:modified_time': blogData.generatedAt,
      'article:author': 'Lunary Cosmic Team',
      'article:section': 'Weekly Forecast',
    },
  };
}
