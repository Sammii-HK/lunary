'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  BookOpen,
  Mail,
  Calendar,
  Send,
  Eye,
  Download,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Star,
  RotateCcw,
  Moon,
  Gem,
} from 'lucide-react';

interface WeeklyContent {
  title: string;
  subtitle: string;
  summary: string;
  weekNumber: number;
  year: number;
  planetaryHighlights: any[];
  retrogradeChanges: any[];
  signIngresses?: any[];
  majorAspects: any[];
  moonPhases: any[];
  seasonalEvents?: any[];
  dailyForecasts?: any[];
  bestDaysFor?: any;
  crystalRecommendations?: any[];
  magicalTiming?: any;
}

export default function BlogManagerPage() {
  const [currentWeek, setCurrentWeek] = useState<WeeklyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Newsletter settings
  const [customSubject, setCustomSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [autoSend, setAutoSend] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    generateCurrentWeek();
  }, []);

  const generateCurrentWeek = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blog/weekly');
      const data = await response.json();

      if (data.success) {
        setCurrentWeek(data.data);
      }
    } catch (error) {
      console.error('Error generating current week:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyPost = async (offset: number = 0) => {
    setLoading(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offset * 7);

      const response = await fetch(
        `/api/blog/weekly?date=${targetDate.toISOString().split('T')[0]}`,
      );
      const data = await response.json();

      if (data.success) {
        console.log('Generated weekly post:', data.data.title);
        console.log('[Blog Manager] Generated data:', {
          title: data.data.title,
          crystalCount: data.data.crystalRecommendations?.length || 0,
          dailyForecastCount: data.data.dailyForecasts?.length || 0,
        });

        alert(`✅ Generated: "${data.data.title}"`);

        if (offset === 0) {
          setCurrentWeek(data.data);
        }
      }
    } catch (error) {
      console.error('Error generating weekly post:', error);
      alert('❌ Error generating post');
    } finally {
      setLoading(false);
    }
  };

  const previewNewsletter = async () => {
    setNewsletterLoading(true);
    try {
      const response = await fetch('/api/newsletter/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send: false,
          weekOffset,
          customSubject: customSubject || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Open newsletter preview in new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.newsletter.html);
          newWindow.document.title = data.newsletter.subject;
        }
      }
    } catch (error) {
      console.error('Error previewing newsletter:', error);
      alert('❌ Error previewing newsletter');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!testEmail && !autoSend) {
      alert('Please enter a test email or enable auto-send to subscriber list');
      return;
    }

    setNewsletterLoading(true);
    try {
      const response = await fetch('/api/newsletter/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send: true,
          testEmail: testEmail || undefined,
          customSubject: customSubject || undefined,
          weekOffset,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Failed to send: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('❌ Error sending newsletter');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const downloadMarkdown = async () => {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + weekOffset * 7);

      const response = await fetch(
        `/api/blog/weekly?date=${targetDate.toISOString().split('T')[0]}&format=markdown`,
      );
      const markdown = await response.text();

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmic-week-${targetDate.toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading markdown:', error);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <BookOpen className='h-8 w-8' />
          Blog & Newsletter Manager
        </h1>
        <p className='text-muted-foreground'>
          Generate automated cosmic content using your astronomical APIs
        </p>
      </div>

      {/* Current Week Overview */}
      {currentWeek && (
        <Card className='mb-8'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  This Week: {currentWeek.title}
                </CardTitle>
                <CardDescription>{currentWeek.subtitle}</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant={showPreview ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setShowPreview(!showPreview)}
                  className='ml-4'
                >
                  <Eye className='h-4 w-4 mr-2' />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>{currentWeek.summary}</p>

            {/* Inline Preview */}
            {showPreview && (
              <div className='mb-6 prose prose-invert max-w-none bg-zinc-950 p-6 rounded-lg border border-zinc-800 overflow-auto max-h-[60vh]'>
                <article className='space-y-8'>
                  <header className='space-y-4 border-b border-zinc-800 pb-6'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Badge variant='outline'>
                        Week {currentWeek.weekNumber}
                      </Badge>
                      <span>•</span>
                      <span>{currentWeek.year}</span>
                    </div>
                    <h1 className='text-4xl font-bold'>{currentWeek.title}</h1>
                    <p className='text-xl text-muted-foreground italic'>
                      {currentWeek.subtitle}
                    </p>
                    <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Star className='h-4 w-4' />
                        {currentWeek.planetaryHighlights?.length || 0} planetary
                        events
                      </span>
                      <span className='flex items-center gap-1'>
                        <RotateCcw className='h-4 w-4' />
                        {currentWeek.retrogradeChanges?.length || 0} retrograde
                        changes
                      </span>
                      <span className='flex items-center gap-1'>
                        <Moon className='h-4 w-4' />
                        {currentWeek.moonPhases?.length || 0} moon phases
                      </span>
                      <span className='flex items-center gap-1'>
                        <Sparkles className='h-4 w-4' />
                        {currentWeek.majorAspects?.length || 0} major aspects
                      </span>
                    </div>
                  </header>

                  <div className='prose prose-invert max-w-none'>
                    <p className='text-lg leading-relaxed'>
                      {currentWeek.summary}
                    </p>
                  </div>

                  {currentWeek.planetaryHighlights &&
                    currentWeek.planetaryHighlights.length > 0 && (
                      <section className='space-y-4'>
                        <h2 className='text-3xl font-bold'>
                          Major Planetary Highlights
                        </h2>
                        <div className='space-y-4'>
                          {currentWeek.planetaryHighlights.map(
                            (highlight: any, index: number) => (
                              <div
                                key={index}
                                className='border border-zinc-800 rounded-lg p-4'
                              >
                                <div className='flex items-start justify-between mb-2'>
                                  <h3 className='text-xl font-semibold'>
                                    {highlight.planet}{' '}
                                    {highlight.event.replace('-', ' ')}
                                  </h3>
                                  <Badge variant='secondary'>
                                    {highlight.date
                                      ? new Date(
                                          highlight.date,
                                        ).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                        })
                                      : ''}
                                  </Badge>
                                </div>
                                <p className='text-muted-foreground'>
                                  {highlight.description}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </section>
                    )}

                  {currentWeek.moonPhases &&
                    currentWeek.moonPhases.length > 0 && (
                      <section className='space-y-4'>
                        <h2 className='text-3xl font-bold'>Moon Phases</h2>
                        <div className='space-y-4'>
                          {currentWeek.moonPhases.map(
                            (phase: any, index: number) => (
                              <div
                                key={index}
                                className='border border-zinc-800 rounded-lg p-4'
                              >
                                <div className='flex items-start justify-between mb-2'>
                                  <h3 className='text-xl font-semibold'>
                                    {phase.phase}
                                  </h3>
                                  <Badge variant='secondary'>
                                    {phase.date
                                      ? new Date(phase.date).toLocaleDateString(
                                          'en-US',
                                          {
                                            month: 'short',
                                            day: 'numeric',
                                          },
                                        )
                                      : ''}
                                  </Badge>
                                </div>
                                {phase.energy && (
                                  <p className='text-muted-foreground mb-2'>
                                    {phase.energy}
                                  </p>
                                )}
                                {phase.guidance && (
                                  <p className='text-sm text-muted-foreground'>
                                    {phase.guidance}
                                  </p>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </section>
                    )}

                  {currentWeek.dailyForecasts &&
                    currentWeek.dailyForecasts.length > 0 && (
                      <section className='space-y-4'>
                        <h2 className='text-3xl font-bold'>Daily Forecasts</h2>
                        <div className='space-y-6'>
                          {currentWeek.dailyForecasts.map(
                            (forecast: any, index: number) => {
                              // Find crystal recommendation for this day
                              const dayCrystal =
                                currentWeek.crystalRecommendations?.find(
                                  (crystal: any) => {
                                    if (!forecast.date || !crystal.date)
                                      return false;
                                    const forecastDate = new Date(
                                      forecast.date,
                                    ).toDateString();
                                    const crystalDate = new Date(
                                      crystal.date,
                                    ).toDateString();
                                    return forecastDate === crystalDate;
                                  },
                                );

                              return (
                                <div
                                  key={index}
                                  className='border border-zinc-800 rounded-lg p-4'
                                >
                                  <h3 className='text-xl font-semibold mb-2'>
                                    {forecast.date
                                      ? new Date(
                                          forecast.date,
                                        ).toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          month: 'long',
                                          day: 'numeric',
                                        })
                                      : `Day ${index + 1}`}
                                  </h3>
                                  {forecast.energy && (
                                    <p className='text-muted-foreground mb-2'>
                                      {forecast.energy}
                                    </p>
                                  )}
                                  {forecast.guidance && (
                                    <p className='mb-2'>{forecast.guidance}</p>
                                  )}

                                  {dayCrystal && (
                                    <div className='mt-3 p-3 bg-lunary-rose-950/20 border border-lunary-rose-800/30 rounded-lg'>
                                      <div className='flex items-center gap-2 mb-2'>
                                        <Gem className='h-4 w-4 text-lunary-rose-300' />
                                        <p className='text-sm font-semibold text-lunary-rose-300'>
                                          Crystal: {dayCrystal.crystal}
                                        </p>
                                      </div>
                                      {dayCrystal.reason && (
                                        <p className='text-xs text-muted-foreground mb-1'>
                                          {dayCrystal.reason}
                                        </p>
                                      )}
                                      {dayCrystal.intention && (
                                        <p className='text-xs text-lunary-rose-200/80 mb-1'>
                                          Intention: {dayCrystal.intention}
                                        </p>
                                      )}
                                      {dayCrystal.chakra && (
                                        <p className='text-xs text-muted-foreground'>
                                          Chakra: {dayCrystal.chakra}
                                        </p>
                                      )}
                                      {dayCrystal.usage && (
                                        <p className='text-xs text-muted-foreground mt-1 italic'>
                                          {dayCrystal.usage}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </section>
                    )}
                </article>
              </div>
            )}

            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lunary-primary-600'>
                  {currentWeek.planetaryHighlights?.length || 0}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Planetary Events
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lunary-secondary'>
                  {currentWeek.retrogradeChanges?.length || 0}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Retrograde Changes
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lunary-primary'>
                  {currentWeek.signIngresses?.length || 0}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Sign Ingresses
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lunary-success'>
                  {currentWeek.majorAspects?.length || 0}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Major Aspects
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lunary-accent'>
                  {currentWeek.moonPhases?.length || 0}
                </div>
                <div className='text-sm text-muted-foreground'>Moon Phases</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lunary-rose'>
                  {currentWeek.seasonalEvents?.length || 0}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Seasonal Events
                </div>
              </div>
            </div>
            {(currentWeek.dailyForecasts?.length ||
              currentWeek.crystalRecommendations?.length ||
              currentWeek.bestDaysFor) && (
              <div className='mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4'>
                {currentWeek.dailyForecasts && (
                  <div className='text-center'>
                    <div className='text-xl font-bold text-lunary-secondary'>
                      {currentWeek.dailyForecasts.length}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Daily Forecasts
                    </div>
                  </div>
                )}
                {currentWeek.crystalRecommendations && (
                  <div className='text-center'>
                    <div className='text-xl font-bold text-lunary-rose'>
                      {currentWeek.crystalRecommendations.length}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Crystal Recommendations
                    </div>
                  </div>
                )}
                {currentWeek.bestDaysFor && (
                  <div className='text-center'>
                    <div className='text-xl font-bold text-lunary-success'>
                      {
                        Object.values(currentWeek.bestDaysFor).filter(
                          (item: any) => item.dates?.length > 0,
                        ).length
                      }
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Best Days Categories
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='generator' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='generator'>Content Generator</TabsTrigger>
          <TabsTrigger value='newsletter'>Newsletter</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='generator' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Weekly Content Generator
              </CardTitle>
              <CardDescription>
                Generate blog posts using your astronomical APIs and retrograde
                tracking
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Button
                  onClick={() => generateWeeklyPost(-1)}
                  disabled={loading}
                  variant='outline'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Generate Last Week
                </Button>

                <Button
                  onClick={() => generateWeeklyPost(0)}
                  disabled={loading}
                  className='bg-primary'
                >
                  <Calendar className='h-4 w-4 mr-2' />
                  {loading ? 'Generating...' : 'Generate This Week'}
                </Button>

                <Button
                  onClick={() => generateWeeklyPost(1)}
                  disabled={loading}
                  variant='outline'
                >
                  <TrendingUp className='h-4 w-4 mr-2' />
                  Generate Next Week
                </Button>
              </div>

              <div className='flex gap-2 flex-wrap'>
                {currentWeek && (
                  <Button
                    variant={showPreview ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className='h-4 w-4 mr-2' />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                )}
                <Button onClick={downloadMarkdown} variant='outline' size='sm'>
                  <Download className='h-4 w-4 mr-2' />
                  Download Markdown
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inline Preview */}
          {showPreview && currentWeek && (
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Eye className='h-5 w-5' />
                  Blog Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-invert max-w-none bg-zinc-950 p-6 rounded-lg border border-zinc-800 overflow-auto max-h-[80vh]'>
                  <article className='space-y-8'>
                    <header className='space-y-4 border-b border-zinc-800 pb-6'>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Badge variant='outline'>
                          Week {currentWeek.weekNumber}
                        </Badge>
                        <span>•</span>
                        <span>{currentWeek.year}</span>
                      </div>
                      <h1 className='text-4xl font-bold'>
                        {currentWeek.title}
                      </h1>
                      <p className='text-xl text-muted-foreground italic'>
                        {currentWeek.subtitle}
                      </p>
                      <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Star className='h-4 w-4' />
                          {currentWeek.planetaryHighlights?.length || 0}{' '}
                          planetary events
                        </span>
                        <span className='flex items-center gap-1'>
                          <RotateCcw className='h-4 w-4' />
                          {currentWeek.retrogradeChanges?.length || 0}{' '}
                          retrograde changes
                        </span>
                        <span className='flex items-center gap-1'>
                          <Moon className='h-4 w-4' />
                          {currentWeek.moonPhases?.length || 0} moon phases
                        </span>
                        <span className='flex items-center gap-1'>
                          <Sparkles className='h-4 w-4' />
                          {currentWeek.majorAspects?.length || 0} major aspects
                        </span>
                      </div>
                    </header>

                    <div className='prose prose-invert max-w-none'>
                      <p className='text-lg leading-relaxed'>
                        {currentWeek.summary}
                      </p>
                    </div>

                    {currentWeek.planetaryHighlights &&
                      currentWeek.planetaryHighlights.length > 0 && (
                        <section className='space-y-4'>
                          <h2 className='text-3xl font-bold'>
                            Major Planetary Highlights
                          </h2>
                          <div className='space-y-4'>
                            {currentWeek.planetaryHighlights.map(
                              (highlight: any, index: number) => (
                                <div
                                  key={index}
                                  className='border border-zinc-800 rounded-lg p-4'
                                >
                                  <div className='flex items-start justify-between mb-2'>
                                    <h3 className='text-xl font-semibold'>
                                      {highlight.planet}{' '}
                                      {highlight.event.replace('-', ' ')}
                                    </h3>
                                    <Badge variant='secondary'>
                                      {highlight.date
                                        ? new Date(
                                            highlight.date,
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                          })
                                        : ''}
                                    </Badge>
                                  </div>
                                  <p className='text-muted-foreground'>
                                    {highlight.description}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </section>
                      )}

                    {currentWeek.moonPhases &&
                      currentWeek.moonPhases.length > 0 && (
                        <section className='space-y-4'>
                          <h2 className='text-3xl font-bold'>Moon Phases</h2>
                          <div className='space-y-4'>
                            {currentWeek.moonPhases.map(
                              (phase: any, index: number) => (
                                <div
                                  key={index}
                                  className='border border-zinc-800 rounded-lg p-4'
                                >
                                  <div className='flex items-start justify-between mb-2'>
                                    <h3 className='text-xl font-semibold'>
                                      {phase.phase}
                                    </h3>
                                    <Badge variant='secondary'>
                                      {phase.date
                                        ? new Date(
                                            phase.date,
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                          })
                                        : ''}
                                    </Badge>
                                  </div>
                                  {phase.energy && (
                                    <p className='text-muted-foreground mb-2'>
                                      {phase.energy}
                                    </p>
                                  )}
                                  {phase.guidance && (
                                    <p className='text-sm text-muted-foreground'>
                                      {phase.guidance}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </section>
                      )}

                    {currentWeek.dailyForecasts &&
                      currentWeek.dailyForecasts.length > 0 && (
                        <section className='space-y-4'>
                          <h2 className='text-3xl font-bold'>
                            Daily Forecasts
                          </h2>
                          <div className='space-y-6'>
                            {currentWeek.dailyForecasts.map(
                              (forecast: any, index: number) => {
                                // Find crystal recommendation for this day
                                const dayCrystal =
                                  currentWeek.crystalRecommendations?.find(
                                    (crystal: any) => {
                                      if (!forecast.date || !crystal.date)
                                        return false;
                                      const forecastDate = new Date(
                                        forecast.date,
                                      ).toDateString();
                                      const crystalDate = new Date(
                                        crystal.date,
                                      ).toDateString();
                                      return forecastDate === crystalDate;
                                    },
                                  );

                                return (
                                  <div
                                    key={index}
                                    className='border border-zinc-800 rounded-lg p-4'
                                  >
                                    <h3 className='text-xl font-semibold mb-2'>
                                      {forecast.date
                                        ? new Date(
                                            forecast.date,
                                          ).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                          })
                                        : `Day ${index + 1}`}
                                    </h3>
                                    {forecast.energy && (
                                      <p className='text-muted-foreground mb-2'>
                                        {forecast.energy}
                                      </p>
                                    )}
                                    {forecast.guidance && (
                                      <p className='mb-2'>
                                        {forecast.guidance}
                                      </p>
                                    )}

                                    {dayCrystal && (
                                      <div className='mt-3 p-3 bg-lunary-rose-950/20 border border-lunary-rose-800/30 rounded-lg'>
                                        <div className='flex items-center gap-2 mb-2'>
                                          <Gem className='h-4 w-4 text-lunary-rose-300' />
                                          <p className='text-sm font-semibold text-lunary-rose-300'>
                                            Crystal: {dayCrystal.crystal}
                                          </p>
                                        </div>
                                        {dayCrystal.reason && (
                                          <p className='text-xs text-muted-foreground mb-1'>
                                            {dayCrystal.reason}
                                          </p>
                                        )}
                                        {dayCrystal.intention && (
                                          <p className='text-xs text-lunary-rose-200/80 mb-1'>
                                            Intention: {dayCrystal.intention}
                                          </p>
                                        )}
                                        {dayCrystal.chakra && (
                                          <p className='text-xs text-muted-foreground'>
                                            Chakra: {dayCrystal.chakra}
                                          </p>
                                        )}
                                        {dayCrystal.usage && (
                                          <p className='text-xs text-muted-foreground mt-1 italic'>
                                            {dayCrystal.usage}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </section>
                      )}
                  </article>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='newsletter' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='h-5 w-5' />
                Weekly Newsletter
              </CardTitle>
              <CardDescription>
                Send automated cosmic newsletters to your subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='custom-subject'>
                    Custom Subject (Optional)
                  </Label>
                  <Input
                    id='custom-subject'
                    placeholder='Override auto-generated subject...'
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='test-email'>Test Email</Label>
                  <Input
                    id='test-email'
                    type='email'
                    placeholder='your@email.com'
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='week-offset'>Week Offset</Label>
                  <Input
                    id='week-offset'
                    type='number'
                    placeholder='0 = this week, 1 = next week'
                    value={weekOffset}
                    onChange={(e) =>
                      setWeekOffset(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='auto-send'
                    checked={autoSend}
                    onCheckedChange={setAutoSend}
                  />
                  <Label htmlFor='auto-send'>Send to All Subscribers</Label>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={previewNewsletter}
                  disabled={newsletterLoading}
                  variant='outline'
                >
                  <Eye className='h-4 w-4 mr-2' />
                  Preview Newsletter
                </Button>

                <Button
                  onClick={sendNewsletter}
                  disabled={newsletterLoading || (!testEmail && !autoSend)}
                >
                  <Send className='h-4 w-4 mr-2' />
                  {newsletterLoading ? 'Sending...' : 'Send Newsletter'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Content Analytics
              </CardTitle>
              <CardDescription>
                Track blog performance and newsletter engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Analytics dashboard coming soon!</p>
                <p className='text-sm'>Track opens, clicks, and engagement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
