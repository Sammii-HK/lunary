'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, Sparkles, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoManager } from '@/app/admin/social-preview/video-manager';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function ContentVideosPage() {
  const [weekOffset, setWeekOffset] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [generationMessage, setGenerationMessage] = useState<string | null>(
    null,
  );
  const [thematicGenerating, setThematicGenerating] = useState(false);
  const [thematicStatus, setThematicStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [thematicMessage, setThematicMessage] = useState<string | null>(null);

  const weekOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 4; i >= -52; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + i * 7);
      const weekStart = getWeekStart(targetDate);
      options.push({
        offset: i,
        label: formatWeekRange(weekStart),
      });
    }
    return options;
  }, []);

  const generateLongForm = async () => {
    setGenerating(true);
    setGenerationStatus('idle');
    setGenerationMessage(null);
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'long',
          week: weekOffset,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to generate long-form video');
      }

      const data = await response.json();
      setGenerationStatus('success');
      setGenerationMessage(
        `Long-form video queued. ${data.video?.id ? `Video ID: ${data.video.id}` : ''}`.trim(),
      );
    } catch (error) {
      setGenerationStatus('error');
      setGenerationMessage(
        error instanceof Error ? error.message : 'Failed to generate video',
      );
    } finally {
      setGenerating(false);
    }
  };

  const generateThematicVideo = async () => {
    setThematicGenerating(true);
    setThematicStatus('idle');
    setThematicMessage(null);
    try {
      const response = await fetch(
        '/api/admin/video-scripts/generate-theme-video',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekOffset,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to generate thematic video');
      }

      const data = await response.json();
      setThematicStatus('success');
      setThematicMessage(
        `Thematic video queued. ${data.video?.id ? `Video ID: ${data.video.id}` : ''}`.trim(),
      );
    } catch (error) {
      setThematicStatus('error');
      setThematicMessage(
        error instanceof Error ? error.message : 'Failed to generate video',
      );
    } finally {
      setThematicGenerating(false);
    }
  };

  return (
    <div className='min-h-screen bg-lunary-background text-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='mb-8'>
          <Link
            href='/admin'
            className='flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Admin
          </Link>
          <h1 className='text-3xl font-bold'>Content Videos</h1>
          <p className='text-zinc-400 mt-2'>
            Create weekly long-form videos and review generated assets.
          </p>
        </div>

        <div className='grid gap-6'>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-lunary-primary-400' />
                Weekly Theme Long-Form Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex items-center gap-2 text-sm text-zinc-300'>
                    <Calendar className='h-4 w-4' />
                    Week
                  </div>
                  <select
                    value={weekOffset}
                    onChange={(e) => setWeekOffset(Number(e.target.value))}
                    className='bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm'
                  >
                    {weekOptions.map((opt) => (
                      <option key={opt.offset} value={opt.offset}>
                        {opt.offset === 0
                          ? `This Week (${opt.label})`
                          : opt.offset > 0
                            ? `+${opt.offset} weeks (${opt.label})`
                            : `${opt.offset} weeks (${opt.label})`}
                      </option>
                    ))}
                  </select>
                  <Button onClick={generateLongForm} disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Video className='mr-2 h-4 w-4' />
                        Generate Long-Form Video
                      </>
                    )}
                  </Button>
                </div>
                {generationStatus !== 'idle' && generationMessage && (
                  <div
                    className={`rounded border px-4 py-3 text-sm ${
                      generationStatus === 'success'
                        ? 'border-lunary-success-900 bg-lunary-success-950 text-lunary-success'
                        : 'border-lunary-error-900 bg-lunary-error-950 text-lunary-error'
                    }`}
                  >
                    {generationMessage}
                  </div>
                )}
                <p className='text-xs text-zinc-400'>
                  Generates a long-form video using the selected week’s theme
                  and stores it in the videos list below.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Video className='h-5 w-5 text-lunary-secondary-300' />
                Thematic Theme Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex items-center gap-2 text-sm text-zinc-300'>
                    <Calendar className='h-4 w-4' />
                    Week
                  </div>
                  <select
                    value={weekOffset}
                    onChange={(e) => setWeekOffset(Number(e.target.value))}
                    className='bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm'
                  >
                    {weekOptions.map((opt) => (
                      <option key={opt.offset} value={opt.offset}>
                        {opt.offset === 0
                          ? `This Week (${opt.label})`
                          : opt.offset > 0
                            ? `+${opt.offset} weeks (${opt.label})`
                            : `${opt.offset} weeks (${opt.label})`}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={generateThematicVideo}
                    disabled={thematicGenerating}
                    variant='outline'
                  >
                    {thematicGenerating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className='mr-2 h-4 w-4' />
                        Generate Thematic Video
                      </>
                    )}
                  </Button>
                </div>
                {thematicStatus !== 'idle' && thematicMessage && (
                  <div
                    className={`rounded border px-4 py-3 text-sm ${
                      thematicStatus === 'success'
                        ? 'border-lunary-success-900 bg-lunary-success-950 text-lunary-success'
                        : 'border-lunary-error-900 bg-lunary-error-950 text-lunary-error'
                    }`}
                  >
                    {thematicMessage}
                  </div>
                )}
                <p className='text-xs text-zinc-400'>
                  Uses the weekly theme scripts to generate a deep-dive video
                  from the YouTube script.
                </p>
              </div>
            </CardContent>
          </Card>

          <VideoManager weekOffset={weekOffset} />
        </div>
      </div>
    </div>
  );
}
