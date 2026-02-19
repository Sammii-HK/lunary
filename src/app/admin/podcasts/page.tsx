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
import {
  Mic,
  Youtube,
  Sparkles,
  Play,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Upload,
  Loader2,
  RefreshCw,
  KeyRound,
  Copy,
  Check,
  Trash2,
  Eye,
} from 'lucide-react';

interface Episode {
  id: string;
  episodeNumber: number;
  slug: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSecs: number;
  publishedAt: string;
  weekNumber: number | null;
  year: number | null;
  transcript: any;
  showNotes: any;
  grimoireSlugs: string[];
  status: string;
  youtubeVideoId: string | null;
  youtubeVideoUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
}

function formatDuration(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins}:${String(remainingSecs).padStart(2, '0')}`;
}

export default function PodcastsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    episodeId: string;
    success: boolean;
    message: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nextTopicPreview, setNextTopicPreview] = useState<{
    episodeNumber: number;
    topics: { title: string; slug: string }[];
    coveredCount: number;
  } | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Read OAuth callback params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('refresh_token');
    const error = params.get('auth_error');
    if (token) setRefreshToken(token);
    if (error) setAuthError(error);
    // Clean URL params without reload
    if (token || error) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const copyToken = () => {
    if (!refreshToken) return;
    navigator.clipboard.writeText(refreshToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/podcasts?preview=1');
      const data = await res.json();
      if (data.success) {
        setEpisodes(data.episodes);
        if (data.nextTopicPreview) {
          setNextTopicPreview(data.nextTopicPreview);
        }
      }
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/podcasts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEpisodes();
      }
    } catch (error) {
      console.error('Failed to delete episode:', error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleGenerate = async () => {
    setGenerateLoading(true);
    setGenerateResult(null);
    try {
      const res = await fetch('/api/podcast/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success && data.episode) {
        setGenerateResult({
          success: true,
          message: `Generated Episode ${data.episode.episodeNumber}: "${data.episode.title}"`,
        });
        fetchEpisodes();
      } else if (data.success && data.message) {
        setGenerateResult({ success: true, message: data.message });
      } else {
        setGenerateResult({
          success: false,
          message: data.error || 'Generation failed',
        });
      }
    } catch (error) {
      setGenerateResult({ success: false, message: 'Network error' });
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleUpload = async (episodeId: string) => {
    setUploadingId(episodeId);
    setUploadResult(null);
    try {
      const res = await fetch('/api/youtube/podcast-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId }),
      });
      const data = await res.json();

      if (data.success && !data.skipped) {
        setUploadResult({
          episodeId,
          success: true,
          message: `Uploaded "${data.title}" — ${data.youtubeUrl}`,
        });
        fetchEpisodes();
      } else if (data.skipped) {
        setUploadResult({
          episodeId,
          success: true,
          message: data.message,
        });
      } else {
        setUploadResult({
          episodeId,
          success: false,
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadResult({
        episodeId,
        success: false,
        message: 'Network error',
      });
    } finally {
      setUploadingId(null);
    }
  };

  const totalEpisodes = episodes.length;
  const onYouTube = episodes.filter((e) => e.youtubeVideoId).length;
  const pendingUpload = totalEpisodes - onYouTube;
  const pendingEpisodes = episodes.filter((e) => !e.youtubeVideoId);

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <Mic className='h-8 w-8' />
          Podcast Manager
        </h1>
        <p className='text-muted-foreground'>
          Manage episodes, generate new content, and upload to YouTube
        </p>
      </div>

      {/* Stats Summary */}
      <Card className='mb-8'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-lunary-primary-600'>
                {totalEpisodes}
              </div>
              <div className='text-sm text-muted-foreground'>
                Total Episodes
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-lunary-success'>
                {onYouTube}
              </div>
              <div className='text-sm text-muted-foreground'>On YouTube</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-lunary-accent'>
                {pendingUpload}
              </div>
              <div className='text-sm text-muted-foreground'>
                Pending Upload
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='episodes' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='episodes'>Episodes</TabsTrigger>
          <TabsTrigger value='generate'>Generate</TabsTrigger>
          <TabsTrigger value='youtube'>YouTube Upload</TabsTrigger>
          <TabsTrigger value='auth'>YouTube Auth</TabsTrigger>
        </TabsList>

        {/* Episodes Tab */}
        <TabsContent value='episodes' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <CardDescription>
              {totalEpisodes} episode{totalEpisodes !== 1 ? 's' : ''}
            </CardDescription>
            <Button
              variant='outline'
              size='sm'
              onClick={fetchEpisodes}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {loading && episodes.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center text-muted-foreground'>
                <Loader2 className='h-8 w-8 mx-auto mb-2 animate-spin' />
                Loading episodes...
              </CardContent>
            </Card>
          ) : episodes.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center text-muted-foreground'>
                <Mic className='h-8 w-8 mx-auto mb-2 opacity-50' />
                No episodes yet. Go to the Generate tab to create one.
              </CardContent>
            </Card>
          ) : (
            episodes.map((episode) => {
              const isExpanded = expandedId === episode.id;
              return (
                <Card key={episode.id}>
                  <CardHeader
                    className='cursor-pointer'
                    onClick={() =>
                      setExpandedId(isExpanded ? null : episode.id)
                    }
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                          <Hash className='h-4 w-4' />
                          {episode.episodeNumber} — {episode.title}
                        </CardTitle>
                        <CardDescription className='mt-1 flex items-center gap-3'>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {formatDuration(episode.durationSecs)}
                          </span>
                          <span>
                            {new Date(episode.publishedAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                          {episode.weekNumber && episode.year && (
                            <span>
                              W{episode.weekNumber}/{episode.year}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='success'>{episode.status}</Badge>
                        {episode.youtubeVideoId ? (
                          <Badge variant='success'>On YouTube</Badge>
                        ) : (
                          <Badge variant='outline'>Pending</Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className='h-4 w-4' />
                        ) : (
                          <ChevronDown className='h-4 w-4' />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className='space-y-4 border-t pt-4'>
                      {/* Audio Player */}
                      <div>
                        <p className='text-sm font-medium mb-2 flex items-center gap-1'>
                          <Play className='h-4 w-4' /> Audio
                        </p>
                        <audio
                          controls
                          className='w-full'
                          src={episode.audioUrl}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <p className='text-sm font-medium mb-1'>Description</p>
                        <p className='text-sm text-muted-foreground'>
                          {episode.description}
                        </p>
                      </div>

                      {/* Grimoire Topics */}
                      {episode.grimoireSlugs.length > 0 && (
                        <div>
                          <p className='text-sm font-medium mb-1'>
                            Grimoire Topics
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {episode.grimoireSlugs.map((slug) => (
                              <Badge
                                key={slug}
                                variant='secondary'
                                className='text-xs'
                              >
                                {slug}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show Notes */}
                      {episode.showNotes && (
                        <div>
                          <p className='text-sm font-medium mb-1'>Show Notes</p>
                          <pre className='text-xs text-muted-foreground bg-zinc-950 p-3 rounded-lg overflow-auto max-h-40'>
                            {JSON.stringify(episode.showNotes, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Transcript */}
                      {episode.transcript && (
                        <div>
                          <p className='text-sm font-medium mb-1'>Transcript</p>
                          <pre className='text-xs text-muted-foreground bg-zinc-950 p-3 rounded-lg overflow-auto max-h-40'>
                            {typeof episode.transcript === 'string'
                              ? episode.transcript
                              : JSON.stringify(episode.transcript, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* YouTube Link */}
                      {episode.youtubeVideoUrl && (
                        <div>
                          <a
                            href={episode.youtubeVideoUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-sm text-lunary-primary-600 hover:underline'
                          >
                            <Youtube className='h-4 w-4' />
                            Watch on YouTube
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        </div>
                      )}

                      {/* Delete */}
                      <div className='pt-2 border-t'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-destructive border-destructive/30 hover:bg-destructive/10'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(episode.id, episode.title);
                          }}
                          disabled={deletingId === episode.id}
                        >
                          {deletingId === episode.id ? (
                            <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />
                          ) : (
                            <Trash2 className='h-3.5 w-3.5 mr-1.5' />
                          )}
                          Delete Episode
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value='generate' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Generate New Episode
              </CardTitle>
              <CardDescription>
                Generate a new podcast episode using Podify. This may take up to
                5 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Next topic preview */}
              {nextTopicPreview && (
                <Card className='border-lunary-primary-600/30 bg-lunary-primary-900/5'>
                  <CardContent className='pt-4'>
                    <p className='text-sm font-medium flex items-center gap-1.5 mb-2'>
                      <Eye className='h-4 w-4' />
                      Next Episode Preview — #{nextTopicPreview.episodeNumber}
                    </p>
                    {nextTopicPreview.topics.length > 0 ? (
                      <div className='space-y-1'>
                        {nextTopicPreview.topics.map((t) => (
                          <div key={t.slug} className='flex items-center gap-2'>
                            <Badge variant='secondary' className='text-xs'>
                              {t.slug}
                            </Badge>
                            <span className='text-sm text-muted-foreground'>
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No uncovered topics found — will repeat from pool.
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground mt-2'>
                      {nextTopicPreview.coveredCount} grimoire slugs already
                      covered across all episodes
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generateLoading}
                className='w-full md:w-auto'
              >
                {generateLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4 mr-2' />
                    Generate New Episode
                  </>
                )}
              </Button>

              {generateResult && (
                <Card
                  className={
                    generateResult.success
                      ? 'border-lunary-success/50'
                      : 'border-destructive/50'
                  }
                >
                  <CardContent className='pt-4'>
                    <p
                      className={`text-sm ${generateResult.success ? 'text-lunary-success' : 'text-destructive'}`}
                    >
                      {generateResult.message}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* YouTube Upload Tab */}
        <TabsContent value='youtube' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Youtube className='h-5 w-5' />
                YouTube Uploads
              </CardTitle>
              <CardDescription>
                {pendingEpisodes.length} episode
                {pendingEpisodes.length !== 1 ? 's' : ''} pending upload
              </CardDescription>
            </CardHeader>
          </Card>

          {pendingEpisodes.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center text-muted-foreground'>
                <Youtube className='h-8 w-8 mx-auto mb-2 opacity-50' />
                All episodes are on YouTube!
              </CardContent>
            </Card>
          ) : (
            pendingEpisodes.map((episode) => (
              <Card key={episode.id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>
                        #{episode.episodeNumber} — {episode.title}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {formatDuration(episode.durationSecs)} &middot;{' '}
                        {new Date(episode.publishedAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUpload(episode.id)}
                      disabled={uploadingId !== null}
                      variant='outline'
                    >
                      {uploadingId === episode.id ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className='h-4 w-4 mr-2' />
                          Upload to YouTube
                        </>
                      )}
                    </Button>
                  </div>

                  {uploadResult?.episodeId === episode.id && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-sm ${
                        uploadResult.success
                          ? 'bg-lunary-success/10 text-lunary-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {uploadResult.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        {/* YouTube Auth Tab */}
        <TabsContent value='auth' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <KeyRound className='h-5 w-5' />
                YouTube OAuth
              </CardTitle>
              <CardDescription>
                Connect your Google account to enable YouTube uploads. This
                opens the Google consent screen, then returns a refresh token.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Button
                onClick={() =>
                  (window.location.href = '/api/admin/youtube-auth')
                }
              >
                <Youtube className='h-4 w-4 mr-2' />
                Connect YouTube Account
              </Button>

              {authError && (
                <Card className='border-destructive/50'>
                  <CardContent className='pt-4'>
                    <p className='text-sm text-destructive'>
                      Auth error: {authError}
                    </p>
                  </CardContent>
                </Card>
              )}

              {refreshToken && (
                <Card className='border-lunary-success/50'>
                  <CardContent className='pt-4 space-y-3'>
                    <p className='text-sm text-lunary-success'>
                      Authorization successful! Copy the refresh token below and
                      set it as <code>GOOGLE_REFRESH_TOKEN</code> in your Vercel
                      environment variables.
                    </p>
                    <div className='flex items-center gap-2'>
                      <code className='flex-1 text-xs bg-zinc-950 p-3 rounded-lg border break-all select-all'>
                        {refreshToken}
                      </code>
                      <Button variant='outline' size='icon' onClick={copyToken}>
                        {copied ? (
                          <Check className='h-4 w-4 text-lunary-success' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
