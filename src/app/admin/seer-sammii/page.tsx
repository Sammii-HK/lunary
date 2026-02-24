'use client';

import { useState, useEffect } from 'react';
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
  Copy,
  Check,
  Video,
  Sparkles,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface SeerSammiiScript {
  id: number;
  topic: string;
  talkingPoints: string[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
  caption: string;
  hashtags: string[];
  cta: string;
  transitContext: string;
  scheduledDate: string;
  status: 'draft' | 'approved' | 'used';
}

export default function SeerSammiiPage() {
  const [scripts, setScripts] = useState<SeerSammiiScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/video-scripts/seer-sammii');
      const data = await response.json();
      if (data.success) {
        setScripts(
          (data.scripts || []).map((s: any) => ({
            id: s.id,
            topic: s.facetTitle || s.topic || 'Untitled',
            talkingPoints:
              s.metadata?.talkingPoints ||
              s.sections?.map((sec: any) => sec.content) ||
              [],
            fullScript: s.fullScript,
            wordCount: s.wordCount,
            estimatedDuration: s.estimatedDuration,
            caption: s.metadata?.caption || s.metadata?.summary || '',
            hashtags: s.metadata?.hashtags || [],
            cta: s.metadata?.cta || '',
            transitContext: s.metadata?.transitContext || '',
            scheduledDate: s.scheduledDate,
            status: s.status,
          })),
        );
      }
    } catch (error) {
      console.error('Failed to load scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateScript = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/admin/video-scripts/seer-sammii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          topic: customTopic || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await loadScripts();
        setCustomTopic('');
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate:', error);
      alert('Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: 'draft' | 'approved' | 'used',
  ) => {
    try {
      setUpdatingId(id);
      await fetch(`/api/admin/video-scripts/seer-sammii/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setScripts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({
    text,
    fieldKey,
  }: {
    text: string;
    fieldKey: string;
  }) => (
    <Button
      size='sm'
      variant='ghost'
      onClick={() => copyToClipboard(text, fieldKey)}
      className='h-7 px-2'
    >
      {copiedField === fieldKey ? (
        <Check className='h-3 w-3 text-lunary-success' />
      ) : (
        <Copy className='h-3 w-3' />
      )}
    </Button>
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-lunary-success-900 text-lunary-success border-lunary-success-800';
      case 'used':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-lunary-accent-900 text-lunary-accent border-lunary-accent-700';
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-5xl'>
        <div className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3'>
            <Video className='h-8 w-8 md:h-10 md:w-10' />
            Seer Sammii Scripts
          </h1>
          <p className='text-zinc-400'>
            First-person talking-to-camera scripts with glanceable talking
            points
          </p>
        </div>

        {/* Generate Section */}
        <Card className='mb-8 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-lunary-primary-400' />
              Generate New Script
            </CardTitle>
            <CardDescription>
              Pull from today&apos;s transits and grimoire to create a
              first-person script
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row gap-4'>
              <input
                type='text'
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Custom topic (optional — defaults to today's cosmic weather)"
                className='flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500'
              />
              <Button
                onClick={generateScript}
                disabled={generating}
                className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
              >
                {generating ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4 mr-2' />
                    Generate for Today
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scripts List */}
        {loading ? (
          <div className='text-center py-12 text-zinc-400'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p>Loading scripts...</p>
          </div>
        ) : scripts.length === 0 ? (
          <div className='text-center py-12 text-zinc-400'>
            <Video className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p className='text-lg'>No scripts yet</p>
            <p className='text-sm mt-2'>
              Generate your first Seer Sammii script above
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {scripts.map((script) => (
              <Card key={script.id} className='bg-zinc-900 border-zinc-800'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>{script.topic}</CardTitle>
                      <CardDescription className='flex items-center gap-3 mt-1'>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          {new Date(script.scheduledDate).toLocaleDateString()}
                        </span>
                        <span>{script.wordCount} words</span>
                        <span>{script.estimatedDuration}</span>
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className={statusColor(script.status)}>
                        {script.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Talking Points */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='text-sm font-medium text-zinc-300 flex items-center gap-2'>
                        <MessageSquare className='h-4 w-4' />
                        Talking Points
                      </h4>
                      <CopyButton
                        text={script.talkingPoints.join('\n')}
                        fieldKey={`tp-${script.id}`}
                      />
                    </div>
                    <ul className='space-y-1'>
                      {script.talkingPoints.map((point, i) => (
                        <li
                          key={i}
                          className='text-sm text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded'
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Full Script */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='text-sm font-medium text-zinc-300'>
                        Full Script
                      </h4>
                      <CopyButton
                        text={script.fullScript}
                        fieldKey={`script-${script.id}`}
                      />
                    </div>
                    <div className='text-sm text-zinc-300 bg-zinc-800/50 p-4 rounded-lg whitespace-pre-wrap'>
                      {script.fullScript}
                    </div>
                  </div>

                  {/* Caption + Hashtags */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <div className='flex items-center justify-between mb-1'>
                        <h4 className='text-xs font-medium text-zinc-400'>
                          Caption
                        </h4>
                        <CopyButton
                          text={`${script.caption}\n\n${script.hashtags.map((h) => `#${h}`).join(' ')}`}
                          fieldKey={`caption-${script.id}`}
                        />
                      </div>
                      <p className='text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded'>
                        {script.caption}
                      </p>
                    </div>
                    <div>
                      <h4 className='text-xs font-medium text-zinc-400 mb-1'>
                        Hashtags
                      </h4>
                      <div className='flex flex-wrap gap-1'>
                        {script.hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant='outline'
                            className='text-xs border-zinc-700 text-zinc-400'
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Transit Context */}
                  {script.transitContext && (
                    <details className='text-xs text-zinc-500'>
                      <summary className='cursor-pointer hover:text-zinc-300'>
                        Transit context
                      </summary>
                      <pre className='mt-2 p-3 bg-zinc-800/30 rounded text-xs whitespace-pre-wrap'>
                        {script.transitContext}
                      </pre>
                    </details>
                  )}

                  {/* Status Actions */}
                  <div className='flex gap-2 pt-2 border-t border-zinc-800'>
                    {script.status === 'draft' && (
                      <Button
                        size='sm'
                        onClick={() => updateStatus(script.id, 'approved')}
                        disabled={updatingId === script.id}
                        className='bg-lunary-success-700 hover:bg-lunary-success-600 text-white'
                      >
                        {updatingId === script.id ? (
                          <Loader2 className='h-3 w-3 animate-spin mr-1' />
                        ) : null}
                        Approve
                      </Button>
                    )}
                    {script.status === 'approved' && (
                      <Button
                        size='sm'
                        onClick={() => updateStatus(script.id, 'used')}
                        disabled={updatingId === script.id}
                        variant='outline'
                        className='border-zinc-700 text-zinc-300'
                      >
                        Mark as Used
                      </Button>
                    )}
                    {script.status !== 'draft' && (
                      <Button
                        size='sm'
                        onClick={() => updateStatus(script.id, 'draft')}
                        disabled={updatingId === script.id}
                        variant='ghost'
                        className='text-zinc-500'
                      >
                        Reset to Draft
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
