'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { generateStoryAltText } from '@/lib/instagram/alt-text';
import { sanitizeImageUrl } from '@/utils/url-security';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCw,
  Calendar,
  Zap,
  CheckCircle,
  Circle,
} from 'lucide-react';

const VARIANT_COLORS: Record<string, string> = {
  daily_moon:
    'bg-lunary-primary-900 text-lunary-primary-300 border-lunary-primary-700',
  tarot_pull:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  affirmation:
    'bg-lunary-success-900 text-lunary-success-300 border-lunary-success-700',
  ritual_tip: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  sign_of_the_day:
    'bg-lunary-accent-900 text-lunary-accent-300 border-lunary-accent-700',
  transit_alert: 'bg-orange-900 text-orange-300 border-orange-700',
  did_you_know: 'bg-cyan-900 text-cyan-300 border-cyan-700',
  numerology: 'bg-violet-900 text-violet-300 border-violet-700',
  quote: 'bg-zinc-800 text-zinc-300 border-zinc-600',
  calendar_event: 'bg-amber-900 text-amber-300 border-amber-700',
};

interface StoryImage {
  variant: string;
  title: string;
  subtitle: string;
  blobUrl: string | null;
  ogUrl: string;
  preRendered: boolean;
}

function getWeekDates(weekOffset: number): {
  dates: string[];
  startDate: string;
} {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const offsetMonday = addDays(monday, weekOffset * 7);
  const startDate = format(offsetMonday, 'yyyy-MM-dd');
  const dates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(offsetMonday, i), 'yyyy-MM-dd'),
  );
  return { dates, startDate };
}

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    window.open(url, '_blank');
  }
}

export default function WeeklyStoriesPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [preRendering, setPreRendering] = useState(false);
  const [preRenderResult, setPreRenderResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekStories, setWeekStories] = useState<Record<string, StoryImage[]>>(
    {},
  );

  const { dates: weekDates, startDate } = useMemo(
    () => getWeekDates(weekOffset),
    [weekOffset],
  );

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0] + 'T12:00:00');
    const end = new Date(weekDates[6] + 'T12:00:00');
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }, [weekDates]);

  // Fetch story images from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/admin/story-images?startDate=${startDate}&days=7`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setWeekStories(data.dates || {});
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch story images:', err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [startDate]);

  const preRenderedCount = useMemo(() => {
    let count = 0;
    for (const stories of Object.values(weekStories)) {
      for (const s of stories) {
        if (s.preRendered) count++;
      }
    }
    return count;
  }, [weekStories]);

  const handlePreRender = useCallback(async () => {
    setPreRendering(true);
    setPreRenderResult(null);
    try {
      const res = await fetch(
        `/api/cron/weekly-stories?startDate=${startDate}&days=7&force=true`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''}`,
          },
        },
      );
      const data = await res.json();
      if (data.success) {
        setPreRenderResult(
          `Rendered ${data.totalRendered}, scheduled ${data.totalScheduled} in ${(data.executionTimeMs / 1000).toFixed(1)}s`,
        );
        // Refresh images
        const refreshRes = await fetch(
          `/api/admin/story-images?startDate=${startDate}&days=7`,
        );
        const refreshData = await refreshRes.json();
        setWeekStories(refreshData.dates || {});
      } else {
        setPreRenderResult(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setPreRenderResult(
        `Error: ${err instanceof Error ? err.message : 'Unknown'}`,
      );
    }
    setPreRendering(false);
  }, [startDate]);

  const handleDownloadAll = useCallback(
    async (dateStr: string, stories: StoryImage[]) => {
      setDownloading(dateStr);
      const dayLabel = format(
        new Date(dateStr + 'T12:00:00'),
        'yyyy-MM-dd_EEE',
      );
      for (const story of stories) {
        const url = story.blobUrl || story.ogUrl;
        await downloadImage(url, `story_${dayLabel}_${story.variant}.png`);
        await new Promise((r) => setTimeout(r, 500));
      }
      setDownloading(null);
    },
    [],
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px]'>
        {/* Header */}
        <div className='mb-6 md:mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold flex items-center gap-2'>
                <Calendar className='h-7 w-7' />
                Weekly Stories
              </h1>
              <p className='text-sm text-zinc-400 mt-1'>
                {preRenderedCount}/28 pre-rendered to Blob
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handlePreRender}
                disabled={preRendering}
                className='bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white'
              >
                <Zap className='h-4 w-4 mr-2' />
                {preRendering
                  ? 'Pre-rendering...'
                  : 'Pre-render + Schedule Week'}
              </Button>
              <Button
                onClick={() => {
                  setLoading(true);
                  fetch(`/api/admin/story-images?startDate=${startDate}&days=7`)
                    .then((res) => res.json())
                    .then((data) => {
                      setWeekStories(data.dates || {});
                      setLoading(false);
                    });
                }}
                variant='outline'
                className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              >
                <RotateCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
            </div>
          </div>
          {preRenderResult && (
            <div className='mt-3 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-300'>
              {preRenderResult}
            </div>
          )}
        </div>

        {/* Week Navigation */}
        <div className='flex items-center justify-center gap-4 mb-8 p-4 rounded-xl bg-zinc-900 border border-zinc-800'>
          <Button
            onClick={() => setWeekOffset((w) => w - 1)}
            variant='ghost'
            size='sm'
            className='text-zinc-300 hover:text-white hover:bg-zinc-800'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Prev
          </Button>
          <Button
            onClick={() => setWeekOffset(0)}
            variant='outline'
            size='sm'
            className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
          >
            This Week
          </Button>
          <span className='text-sm font-medium text-zinc-300 min-w-[180px] text-center'>
            {weekLabel}
          </span>
          <Button
            onClick={() => setWeekOffset((w) => w + 1)}
            variant='ghost'
            size='sm'
            className='text-zinc-300 hover:text-white hover:bg-zinc-800'
          >
            Next
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
        </div>

        {loading ? (
          <div className='text-center py-20 text-zinc-400'>
            Loading story previews...
          </div>
        ) : (
          /* 7-Day Grid */
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4'>
            {weekDates.map((dateStr) => {
              const stories = weekStories[dateStr] || [];
              const date = new Date(dateStr + 'T12:00:00');
              const dayName = format(date, 'EEE');
              const dayNum = format(date, 'd');
              const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
              const allPreRendered = stories.every((s) => s.preRendered);
              const somePreRendered = stories.some((s) => s.preRendered);

              return (
                <div
                  key={dateStr}
                  className={`rounded-xl border p-3 ${
                    isToday
                      ? 'border-lunary-primary-600 bg-lunary-primary-950/30'
                      : 'border-zinc-800 bg-zinc-900/50'
                  }`}
                >
                  {/* Day Header */}
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold'>{dayNum}</span>
                      <span className='text-xs text-zinc-400 uppercase'>
                        {dayName}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      {allPreRendered && stories.length > 0 ? (
                        <CheckCircle className='h-3.5 w-3.5 text-lunary-success' />
                      ) : somePreRendered ? (
                        <Circle className='h-3.5 w-3.5 text-yellow-500' />
                      ) : (
                        <Circle className='h-3.5 w-3.5 text-zinc-600' />
                      )}
                      {isToday && (
                        <Badge className='bg-lunary-primary-900 text-lunary-primary-300 border-lunary-primary-700 text-[10px]'>
                          Today
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Story Cards */}
                  <div className='space-y-3'>
                    {stories.map((story, i) => {
                      const imageUrl = story.blobUrl || story.ogUrl;
                      return (
                        <div
                          key={i}
                          className='rounded-lg border border-zinc-700/50 bg-zinc-800/50 overflow-hidden'
                        >
                          {/* Image Preview */}
                          <div className='aspect-[9/16] relative group'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sanitizeImageUrl(imageUrl)}
                              alt={generateStoryAltText(
                                story.variant,
                                story.title,
                              )}
                              className='w-full h-full object-cover'
                              loading='lazy'
                            />
                            {/* Download overlay */}
                            <button
                              onClick={() =>
                                downloadImage(
                                  imageUrl,
                                  `story_${dateStr}_${story.variant}.png`,
                                )
                              }
                              className='absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer'
                            >
                              <Download className='h-6 w-6 text-white' />
                            </button>
                            {/* Pre-rendered indicator */}
                            {story.preRendered && (
                              <div className='absolute top-1 right-1'>
                                <CheckCircle className='h-3 w-3 text-lunary-success' />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className='p-2'>
                            <Badge
                              className={`text-[10px] mb-1 ${VARIANT_COLORS[story.variant] ?? 'bg-zinc-800 text-zinc-300'}`}
                            >
                              {story.variant.replace(/_/g, ' ')}
                            </Badge>
                            <p className='text-[11px] text-zinc-400 line-clamp-2 leading-tight'>
                              {story.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Download All */}
                  <Button
                    onClick={() => handleDownloadAll(dateStr, stories)}
                    disabled={downloading === dateStr || stories.length === 0}
                    variant='outline'
                    size='sm'
                    className='w-full mt-3 border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs'
                  >
                    <Download className='h-3 w-3 mr-1' />
                    {downloading === dateStr
                      ? 'Downloading...'
                      : 'Download All'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
