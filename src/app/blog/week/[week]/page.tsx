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
  return result.data;
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
            <span>{weekRange}</span>
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
                  (highlight: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <CardTitle className='text-xl'>
                            {highlight.planet}{' '}
                            {highlight.event.replace('-', ' ')}
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
                        <p>{highlight.description}</p>
                        <p className='text-sm text-muted-foreground italic'>
                          Significance: {highlight.significance}
                        </p>
                        {highlight.details?.fromSign &&
                          highlight.details?.toSign && (
                            <p className='text-sm'>
                              This transition from {highlight.details.fromSign}{' '}
                              to {highlight.details.toSign} brings
                              transformative energy.
                            </p>
                          )}
                      </CardContent>
                    </Card>
                  ),
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
                  (change: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className='text-xl'>
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
                  ),
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
              {blogData.moonPhases.map((phase: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className='text-lg'>{phase.name}</CardTitle>
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
              ))}
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
              {blogData.majorAspects.map((aspect: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className='text-xl'>
                      {aspect.planetA} {aspect.aspect} {aspect.planetB}
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
              ))}
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
                    <p className='mb-2'>{forecast.summary}</p>
                    {forecast.themes && forecast.themes.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {forecast.themes.map(
                          (theme: string, themeIndex: number) => (
                            <Badge key={themeIndex} variant='outline'>
                              {theme}
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
                      <p className='text-sm'>
                        {Array.isArray(days)
                          ? days
                              .map((d: any) =>
                                d.date.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                }),
                              )
                              .join(', ')
                          : 'Check your personalized forecast'}
                      </p>
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
                          {crystal.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm mb-2'>{crystal.guidance}</p>
                        {crystal.properties &&
                          crystal.properties.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                              {crystal.properties.map(
                                (prop: string, propIndex: number) => (
                                  <Badge key={propIndex} variant='secondary'>
                                    {prop}
                                  </Badge>
                                ),
                              )}
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>
          )}
      </article>
    </div>
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { week } = await params;
  const blogData = await getBlogData(week);

  return {
    title: `${blogData.title} | Lunary Blog`,
    description: blogData.subtitle,
  };
}
