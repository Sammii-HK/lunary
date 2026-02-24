'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Sun,
  Sparkles,
  Zap,
  Video,
  MessageCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface Transit {
  date: string;
  planet: string;
  event: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  type: string;
}

interface ScriptOption {
  topic: string;
  points: string[];
  transitContext: string;
}

interface HotTopic {
  title: string;
  category: string;
  snippet: string;
}

interface PendingScript {
  id: number;
  topic: string;
  status: string;
  platform: string;
}

interface CreatorBrief {
  cosmicWeather: {
    transits: Transit[];
    summary: string;
  };
  scriptOptions: ScriptOption[];
  hotTopics: HotTopic[];
  pendingScripts: PendingScript[];
}

export default function CreatorBriefPage() {
  const [brief, setBrief] = useState<CreatorBrief | null>(null);
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generatingScript, setGeneratingScript] = useState<number | null>(null);

  const loadBrief = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/creator-brief');
      const data = await response.json();
      if (data.success) {
        setBrief(data.brief);
        setDate(data.date);
      }
    } catch (error) {
      console.error('Failed to load brief:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrief();
  }, []);

  const generateFullScript = async (optionIndex: number, topic: string) => {
    try {
      setGeneratingScript(optionIndex);
      const response = await fetch('/api/admin/video-scripts/seer-sammii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString(), topic }),
      });
      const data = await response.json();
      if (data.success) {
        alert(
          `Script generated! ${data.script.wordCount} words, ${data.script.estimatedDuration}. Check the Seer Sammii page.`,
        );
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate script:', error);
      alert('Failed to generate script');
    } finally {
      setGeneratingScript(null);
    }
  };

  const significanceBadge = (sig: string) => {
    switch (sig) {
      case 'high':
        return 'bg-lunary-rose-900 text-lunary-rose border-lunary-rose-800';
      case 'medium':
        return 'bg-lunary-accent-900 text-lunary-accent border-lunary-accent-700';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-10 w-10 animate-spin mx-auto mb-4 text-lunary-primary-400' />
          <p className='text-zinc-400'>Building your morning brief...</p>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center'>
        <p className='text-zinc-400'>Failed to load brief. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-5xl'>
        {/* Header */}
        <div className='mb-8 flex items-start justify-between'>
          <div>
            <h1 className='text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3'>
              <Sun className='h-8 w-8 md:h-10 md:w-10 text-lunary-accent' />
              Creator Brief
            </h1>
            <p className='text-zinc-400'>
              {new Date(date).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <Button
            variant='outline'
            onClick={loadBrief}
            className='border-zinc-700 text-zinc-400'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>

        {/* 1. Cosmic Weather */}
        <Card className='mb-6 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-lunary-primary-400' />
              Today&apos;s Cosmic Weather
            </CardTitle>
            <CardDescription>{brief.cosmicWeather.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            {brief.cosmicWeather.transits.length === 0 ? (
              <p className='text-sm text-zinc-500'>
                No major transits in the next 3 days.
              </p>
            ) : (
              <div className='space-y-3'>
                {brief.cosmicWeather.transits.map((transit, i) => (
                  <div
                    key={i}
                    className='flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg'
                  >
                    <Badge className={significanceBadge(transit.significance)}>
                      {transit.significance}
                    </Badge>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-white'>
                        {transit.planet} {transit.event}
                      </div>
                      <div className='text-xs text-zinc-400 mt-0.5'>
                        {transit.description}
                      </div>
                      <div className='text-xs text-zinc-500 mt-1'>
                        {transit.date} &middot; {transit.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Script Options */}
        <Card className='mb-6 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Video className='h-5 w-5 text-lunary-secondary' />
              Script Options
            </CardTitle>
            <CardDescription>
              Talking point sets based on today&apos;s transits — pick one and
              generate a full script
            </CardDescription>
          </CardHeader>
          <CardContent>
            {brief.scriptOptions.length === 0 ? (
              <p className='text-sm text-zinc-500'>
                No script options generated. Try refreshing.
              </p>
            ) : (
              <div className='space-y-4'>
                {brief.scriptOptions.map((option, i) => (
                  <div
                    key={i}
                    className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div>
                        <h4 className='text-sm font-medium text-white'>
                          {option.topic}
                        </h4>
                        <p className='text-xs text-zinc-500 mt-0.5'>
                          Based on: {option.transitContext}
                        </p>
                      </div>
                      <Button
                        size='sm'
                        onClick={() => generateFullScript(i, option.topic)}
                        disabled={generatingScript === i}
                        className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                      >
                        {generatingScript === i ? (
                          <Loader2 className='h-3 w-3 animate-spin mr-1' />
                        ) : (
                          <Sparkles className='h-3 w-3 mr-1' />
                        )}
                        Generate Script
                      </Button>
                    </div>
                    <ul className='space-y-1'>
                      {option.points.map((point, j) => (
                        <li
                          key={j}
                          className='text-sm text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded flex items-center gap-2'
                        >
                          <span className='text-xs text-zinc-500'>
                            {j + 1}.
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Hot Topics */}
        {brief.hotTopics.length > 0 && (
          <Card className='mb-6 bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5 text-lunary-accent' />
                Hot Topics
              </CardTitle>
              <CardDescription>
                Grimoire topics relevant to today&apos;s transits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {brief.hotTopics.map((topic, i) => (
                  <div key={i} className='p-3 bg-zinc-800/50 rounded-lg'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-sm font-medium text-white'>
                        {topic.title}
                      </span>
                      <Badge
                        variant='outline'
                        className='text-xs border-zinc-700 text-zinc-500'
                      >
                        {topic.category}
                      </Badge>
                    </div>
                    <p className='text-xs text-zinc-400 line-clamp-2'>
                      {topic.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. Quick Actions */}
        <Card className='mb-6 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-lunary-success' />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
              <Link href='/admin/seer-sammii'>
                <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-lunary-primary-600 transition-colors cursor-pointer'>
                  <Video className='h-5 w-5 text-lunary-primary-400 mb-2' />
                  <div className='text-sm font-medium'>Seer Sammii</div>
                  <div className='text-xs text-zinc-500'>View all scripts</div>
                </div>
              </Link>
              <Link href='/admin/reddit-generator'>
                <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-lunary-secondary-600 transition-colors cursor-pointer'>
                  <MessageCircle className='h-5 w-5 text-lunary-secondary mb-2' />
                  <div className='text-sm font-medium'>Reddit Post</div>
                  <div className='text-xs text-zinc-500'>Generate content</div>
                </div>
              </Link>
              <Link href='/admin/video-scripts'>
                <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-lunary-accent-600 transition-colors cursor-pointer'>
                  <FileText className='h-5 w-5 text-lunary-accent mb-2' />
                  <div className='text-sm font-medium'>Video Scripts</div>
                  <div className='text-xs text-zinc-500'>
                    Manage all scripts
                  </div>
                </div>
              </Link>
              <Link href='/admin/social-posts'>
                <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-lunary-rose-600 transition-colors cursor-pointer'>
                  <Sparkles className='h-5 w-5 text-lunary-rose mb-2' />
                  <div className='text-sm font-medium'>Social Posts</div>
                  <div className='text-xs text-zinc-500'>Approve pending</div>
                </div>
              </Link>
            </div>

            {/* Pending Scripts */}
            {brief.pendingScripts.length > 0 && (
              <div className='mt-4 pt-4 border-t border-zinc-800'>
                <h4 className='text-xs font-medium text-zinc-400 mb-2'>
                  Pending Scripts ({brief.pendingScripts.length})
                </h4>
                <div className='space-y-1'>
                  {brief.pendingScripts.slice(0, 5).map((script) => (
                    <div
                      key={script.id}
                      className='flex items-center justify-between px-3 py-1.5 bg-zinc-800/30 rounded text-sm'
                    >
                      <span className='text-zinc-300 truncate'>
                        {script.topic}
                      </span>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='text-xs border-zinc-700 text-zinc-500'
                        >
                          {script.platform}
                        </Badge>
                        <Badge className='bg-lunary-accent-900/50 text-lunary-accent text-xs'>
                          {script.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
