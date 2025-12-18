'use client';

import { useState, useEffect } from 'react';

interface Video {
  id: string;
  type: 'short' | 'medium' | 'long';
  video_url: string;
  audio_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  post_content: string | null;
  week_number: number | null;
  blog_slug: string | null;
  status: 'pending' | 'uploaded' | 'failed';
  youtube_video_id: string | null;
  created_at: string;
  expires_at: string;
}

export default function SocialPreviewPage() {
  const [week, setWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videoFilter, setVideoFilter] = useState<{
    type?: 'short' | 'medium' | 'long';
    status?: 'pending' | 'uploaded' | 'failed';
  }>({});
  const [longFormAudioUrl, setLongFormAudioUrl] = useState<string | null>(null);
  const [previewingLongForm, setPreviewingLongForm] = useState(false);
  const [mediumFormAudioUrl, setMediumFormAudioUrl] = useState<string | null>(
    null,
  );
  const [previewingMediumForm, setPreviewingMediumForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoGenerationError, setVideoGenerationError] = useState<
    string | null
  >(null);
  const [videoGenerationSuccess, setVideoGenerationSuccess] = useState<
    string | null
  >(null);
  const [postingVideoId, setPostingVideoId] = useState<string | null>(null);
  const [postingResults, setPostingResults] = useState<{
    [videoId: string]: {
      tiktok?: { success: boolean; error?: string };
      instagram?: { success: boolean; error?: string };
      youtube?: { success: boolean; error?: string };
    };
  }>({});

  const formats = ['story', 'square', 'portrait', 'landscape'] as const;

  const postToPlatforms = async (
    videoId: string,
    platforms: ('tiktok' | 'instagram' | 'youtube')[],
  ) => {
    setPostingVideoId(videoId);
    try {
      const response = await fetch('/api/video/post-to-platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, platforms }),
      });

      const data = await response.json();
      if (data.results) {
        setPostingResults((prev) => ({
          ...prev,
          [videoId]: data.results,
        }));
      }

      // Refresh videos list after posting
      if (data.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to post to platforms:', error);
    } finally {
      setPostingVideoId(null);
    }
  };

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      setVideosLoading(true);
      try {
        const params = new URLSearchParams();
        if (videoFilter.type) params.set('type', videoFilter.type);
        if (videoFilter.status) params.set('status', videoFilter.status);

        const response = await fetch(`/api/videos/list?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [videoFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getExpirationCountdown = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, expired: diff < 0 };
  };

  const generateVoiceover = async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      // Use the short-form preview audio endpoint which uses OpenAI
      const response = await fetch('/api/video/preview-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'short',
          week: week,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate voiceover');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate voiceover',
      );
    } finally {
      setLoading(false);
    }
  };

  const previewLongFormAudio = async () => {
    setPreviewingLongForm(true);
    setError(null);
    setLongFormAudioUrl(null);
    try {
      const response = await fetch('/api/video/preview-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'long',
          week: week,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate audio preview');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setLongFormAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview audio');
    } finally {
      setPreviewingLongForm(false);
    }
  };

  const previewMediumFormAudio = async () => {
    setPreviewingMediumForm(true);
    setError(null);
    setMediumFormAudioUrl(null);
    try {
      const response = await fetch('/api/video/preview-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medium',
          week: week,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate audio preview');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setMediumFormAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview audio');
    } finally {
      setPreviewingMediumForm(false);
    }
  };

  const generateShortVideo = async () => {
    setGeneratingVideo(true);
    setVideoGenerationError(null);
    setVideoGenerationSuccess(null);
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'short',
          week: week,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate video');
      }

      const data = await response.json();
      setVideoGenerationSuccess(
        `✅ Short-form video generated! ${data.video?.id ? 'Video ID: ' + data.video.id : ''}`,
      );

      // Refresh videos list
      const params = new URLSearchParams();
      if (videoFilter.type) params.set('type', videoFilter.type);
      if (videoFilter.status) params.set('status', videoFilter.status);
      const videosResponse = await fetch(
        `/api/videos/list?${params.toString()}`,
      );
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);
      }
    } catch (err) {
      setVideoGenerationError(
        err instanceof Error ? err.message : 'Failed to generate video',
      );
    } finally {
      setGeneratingVideo(false);
    }
  };

  const generateMediumVideo = async () => {
    setGeneratingVideo(true);
    setVideoGenerationError(null);
    setVideoGenerationSuccess(null);
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medium',
          week: week,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate video');
      }

      const data = await response.json();
      setVideoGenerationSuccess(
        `✅ Medium-form video generated! ${data.video?.id ? 'Video ID: ' + data.video.id : ''}`,
      );

      // Refresh videos list
      const params = new URLSearchParams();
      if (videoFilter.type) params.set('type', videoFilter.type);
      if (videoFilter.status) params.set('status', videoFilter.status);
      const videosResponse = await fetch(
        `/api/videos/list?${params.toString()}`,
      );
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);
      }
    } catch (err) {
      setVideoGenerationError(
        err instanceof Error ? err.message : 'Failed to generate video',
      );
    } finally {
      setGeneratingVideo(false);
    }
  };

  const generateLongVideo = async () => {
    setGeneratingVideo(true);
    setVideoGenerationError(null);
    setVideoGenerationSuccess(null);
    try {
      // For long-form, we'll use weekly data (the endpoint will handle it)
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'long',
          // The endpoint will use weekly data if blogContent is not provided
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate video');
      }

      const data = await response.json();
      setVideoGenerationSuccess(
        `✅ Long-form video generated! ${data.video?.id ? 'Video ID: ' + data.video.id : ''}`,
      );

      // Refresh videos list
      const params = new URLSearchParams();
      if (videoFilter.type) params.set('type', videoFilter.type);
      if (videoFilter.status) params.set('status', videoFilter.status);
      const videosResponse = await fetch(
        `/api/videos/list?${params.toString()}`,
      );
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);
      }
    } catch (err) {
      setVideoGenerationError(
        err instanceof Error ? err.message : 'Failed to generate video',
      );
    } finally {
      setGeneratingVideo(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 p-8'>
      <h1 className='text-2xl font-bold text-white mb-6'>
        Social Media Preview
      </h1>

      <div className='mb-6 flex gap-4 items-center'>
        <label className='text-white'>Week offset:</label>
        <select
          value={week}
          onChange={(e) => setWeek(parseInt(e.target.value))}
          className='bg-zinc-800 text-white p-2 rounded'
        >
          {[0, -1, -2, -3, -4].map((w) => (
            <option key={w} value={w}>
              {w === 0
                ? 'This week'
                : `${Math.abs(w)} week${Math.abs(w) > 1 ? 's' : ''} ago`}
            </option>
          ))}
        </select>

        <button
          onClick={generateVoiceover}
          disabled={loading}
          className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white px-4 py-2 rounded disabled:opacity-50'
        >
          {loading ? 'Generating...' : 'Generate Voiceover'}
        </button>
      </div>

      {error && (
        <div className='bg-lunary-error-900/50 text-lunary-error-200 p-4 rounded mb-6'>
          {error}
        </div>
      )}

      {audioUrl && (
        <div className='mb-6 bg-zinc-900 p-4 rounded'>
          <h3 className='text-white mb-2'>Voiceover Audio:</h3>
          <audio controls src={audioUrl} className='w-full' />
        </div>
      )}

      <div className='grid grid-cols-2 gap-6'>
        {formats.map((format) => (
          <div key={format} className='bg-zinc-900 p-4 rounded'>
            <h3 className='text-white mb-2 capitalize'>{format}</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/social/images?week=${week}&format=${format}&t=${Date.now()}`}
              alt={format}
              className='w-full rounded'
            />
          </div>
        ))}
      </div>

      <div className='mt-8 bg-zinc-900 p-6 rounded'>
        <h2 className='text-xl text-white mb-4'>
          Video Preview (Image + Audio)
        </h2>
        <p className='text-zinc-400 mb-4'>
          Play the audio while viewing the Story format to simulate the video
          experience.
        </p>
        <div className='flex gap-6'>
          <div className='w-64'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/social/images?week=${week}&format=story&t=${Date.now()}`}
              alt='Story preview'
              className='w-full rounded'
            />
          </div>
          <div className='flex-1'>
            {audioUrl ? (
              <audio
                controls
                src={audioUrl}
                className='w-full'
                autoPlay={false}
              />
            ) : (
              <p className='text-zinc-400'>
                Click "Generate Voiceover" to hear the audio
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Medium-Form Audio Preview */}
      <div className='mt-8 bg-zinc-900 p-6 rounded'>
        <h2 className='text-xl text-white mb-4'>
          Medium-Form Video Audio Preview (30-60s Recap)
        </h2>
        <p className='text-zinc-400 mb-4'>
          Preview the voiceover audio for medium-form videos (30-60 second
          recap). Perfect for Reels, TikTok, and YouTube Shorts. Includes top
          planetary highlights, major aspects, moon phases, and best days.
        </p>
        <button
          onClick={previewMediumFormAudio}
          disabled={previewingMediumForm}
          className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors mb-4'
        >
          {previewingMediumForm
            ? 'Generating...'
            : '🎧 Preview Medium-Form Audio'}
        </button>
        {mediumFormAudioUrl && (
          <div className='mt-4'>
            <audio controls src={mediumFormAudioUrl} className='w-full' />
            <p className='text-zinc-400 text-sm mt-2'>
              Preview the audio above. If it sounds good, you can generate the
              full video.
            </p>
          </div>
        )}
      </div>

      {/* Long-Form Audio Preview */}
      <div className='mt-8 bg-zinc-900 p-6 rounded'>
        <h2 className='text-xl text-white mb-4'>
          Long-Form Video Audio Preview
        </h2>
        <p className='text-zinc-400 mb-4'>
          Preview the voiceover audio for long-form YouTube videos before
          generating the full video. This uses actual weekly cosmic highlights
          including planetary movements, retrogrades, moon phases, and best
          days.
        </p>
        <button
          onClick={previewLongFormAudio}
          disabled={previewingLongForm}
          className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors mb-4'
        >
          {previewingLongForm ? 'Generating...' : '🎧 Preview Long-Form Audio'}
        </button>
        {longFormAudioUrl && (
          <div className='mt-4'>
            <audio controls src={longFormAudioUrl} className='w-full' />
            <p className='text-zinc-400 text-sm mt-2'>
              Preview the audio above. If it sounds good, you can generate the
              full video.
            </p>
          </div>
        )}
      </div>

      {/* Generate Test Video */}
      <div className='mt-8 bg-zinc-900 p-6 rounded'>
        <h2 className='text-xl text-white mb-4'>Generate Videos</h2>
        <p className='text-zinc-400 mb-4'>
          Generate short-form, medium-form, or long-form videos. Videos are
          stored for 7 days and can be uploaded to YouTube.
        </p>

        <div className='flex gap-4 mb-4 flex-wrap'>
          <button
            onClick={generateShortVideo}
            disabled={generatingVideo}
            className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium transition-colors'
          >
            {generatingVideo ? 'Generating...' : '🎬 Generate Short Video'}
          </button>

          <button
            onClick={generateMediumVideo}
            disabled={generatingVideo}
            className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium transition-colors'
          >
            {generatingVideo ? 'Generating...' : '🎬 Generate Medium Video'}
          </button>

          <button
            onClick={generateLongVideo}
            disabled={generatingVideo}
            className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium transition-colors'
          >
            {generatingVideo ? 'Generating...' : '🎬 Generate Long Video'}
          </button>
        </div>

        {videoGenerationError && (
          <div className='bg-red-900/50 text-red-200 p-4 rounded mb-4'>
            {videoGenerationError}
          </div>
        )}

        {videoGenerationSuccess && (
          <div className='bg-green-900/50 text-green-200 p-4 rounded mb-4'>
            {videoGenerationSuccess}
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className='mt-8 bg-zinc-900 p-6 rounded'>
        <h2 className='text-xl text-white mb-4'>
          Generated Videos (7-day retention)
        </h2>

        {/* Filters */}
        <div className='mb-4 flex gap-4'>
          <select
            value={videoFilter.type || ''}
            onChange={(e) =>
              setVideoFilter({
                ...videoFilter,
                type: e.target.value as 'short' | 'medium' | 'long' | undefined,
              })
            }
            className='bg-zinc-800 text-white p-2 rounded'
          >
            <option value=''>All Types</option>
            <option value='short'>Short</option>
            <option value='medium'>Medium</option>
            <option value='long'>Long</option>
          </select>
          <select
            value={videoFilter.status || ''}
            onChange={(e) =>
              setVideoFilter({
                ...videoFilter,
                status: e.target.value as
                  | 'pending'
                  | 'uploaded'
                  | 'failed'
                  | undefined,
              })
            }
            className='bg-zinc-800 text-white p-2 rounded'
          >
            <option value=''>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='uploaded'>Uploaded</option>
            <option value='failed'>Failed</option>
          </select>
        </div>

        {videosLoading ? (
          <p className='text-zinc-400'>Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className='text-zinc-400'>No videos found</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {videos.map((video) => {
              const countdown = getExpirationCountdown(video.expires_at);
              return (
                <div
                  key={video.id}
                  className='bg-zinc-800 p-4 rounded border border-zinc-700'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <h3 className='text-white font-semibold'>
                        {video.title || `${video.type} video`}
                      </h3>
                      <p className='text-zinc-400 text-sm'>
                        {video.type === 'short'
                          ? 'Short-form'
                          : video.type === 'medium'
                            ? 'Medium-form'
                            : 'Long-form'}{' '}
                        • {video.status}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        video.status === 'uploaded'
                          ? 'bg-green-900/50 text-green-200'
                          : video.status === 'failed'
                            ? 'bg-red-900/50 text-red-200'
                            : 'bg-yellow-900/50 text-yellow-200'
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>

                  {video.description && (
                    <p className='text-zinc-300 text-sm mb-3 line-clamp-2'>
                      {video.description}
                    </p>
                  )}

                  <video
                    src={video.video_url}
                    controls
                    className='w-full rounded mb-3 cursor-pointer hover:opacity-90 transition-opacity'
                    style={{ maxHeight: '500px' }}
                    onClick={() => setSelectedVideo(video)}
                  />

                  {video.post_content && (
                    <div className='mt-3 p-3 bg-zinc-700/50 rounded'>
                      <p className='text-zinc-300 text-sm font-semibold mb-1'>
                        Post Content:
                      </p>
                      <p className='text-zinc-400 text-sm whitespace-pre-wrap'>
                        {video.post_content}
                      </p>
                    </div>
                  )}

                  <div className='text-xs text-zinc-400 space-y-1'>
                    <div>Created: {formatDate(video.created_at)}</div>
                    <div>
                      {countdown.expired ? (
                        <span className='text-red-400'>Expired</span>
                      ) : (
                        <span>
                          Expires in: {countdown.days}d {countdown.hours}h
                        </span>
                      )}
                    </div>
                    {video.youtube_video_id && (
                      <div>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-lunary-primary-400 hover:underline'
                        >
                          View on YouTube →
                        </a>
                      </div>
                    )}
                    {video.status === 'failed' && (
                      <button
                        onClick={async () => {
                          // Retry upload
                          const response = await fetch('/api/youtube/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              videoUrl: video.video_url,
                              videoId: video.id,
                              title: video.title || 'Video',
                              description: video.description || '',
                              type: video.type,
                            }),
                          });
                          if (response.ok) {
                            // Refresh videos
                            window.location.reload();
                          }
                        }}
                        className='text-lunary-primary-400 hover:underline'
                      >
                        Retry Upload
                      </button>
                    )}
                  </div>

                  {/* Post to Platforms */}
                  <div className='mt-3 pt-3 border-t border-zinc-700'>
                    <p className='text-zinc-400 text-xs mb-2'>
                      Post to platforms:
                    </p>
                    <div className='flex gap-2 flex-wrap'>
                      <button
                        onClick={() => postToPlatforms(video.id, ['tiktok'])}
                        disabled={postingVideoId === video.id}
                        className='bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs transition-colors'
                      >
                        {postingVideoId === video.id ? 'Posting...' : 'TikTok'}
                      </button>
                      <button
                        onClick={() => postToPlatforms(video.id, ['instagram'])}
                        disabled={postingVideoId === video.id}
                        className='bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs transition-colors'
                      >
                        {postingVideoId === video.id
                          ? 'Posting...'
                          : video.type === 'short'
                            ? 'IG Story'
                            : 'IG Reel'}
                      </button>
                      <button
                        onClick={() => postToPlatforms(video.id, ['youtube'])}
                        disabled={postingVideoId === video.id}
                        className='bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs transition-colors'
                      >
                        {postingVideoId === video.id
                          ? 'Posting...'
                          : video.type === 'long'
                            ? 'YouTube'
                            : 'YT Shorts'}
                      </button>
                      <button
                        onClick={() =>
                          postToPlatforms(video.id, [
                            'tiktok',
                            'instagram',
                            'youtube',
                          ])
                        }
                        disabled={postingVideoId === video.id}
                        className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white px-3 py-1 rounded text-xs transition-colors'
                      >
                        {postingVideoId === video.id
                          ? 'Posting...'
                          : 'All Platforms'}
                      </button>
                    </div>

                    {/* Show posting results */}
                    {postingResults[video.id] && (
                      <div className='mt-2 text-xs space-y-1'>
                        {postingResults[video.id].tiktok && (
                          <div
                            className={
                              postingResults[video.id].tiktok?.success
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            TikTok:{' '}
                            {postingResults[video.id].tiktok?.success
                              ? '✓ Posted'
                              : `✗ ${postingResults[video.id].tiktok?.error}`}
                          </div>
                        )}
                        {postingResults[video.id].instagram && (
                          <div
                            className={
                              postingResults[video.id].instagram?.success
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            Instagram:{' '}
                            {postingResults[video.id].instagram?.success
                              ? '✓ Posted'
                              : `✗ ${postingResults[video.id].instagram?.error}`}
                          </div>
                        )}
                        {postingResults[video.id].youtube && (
                          <div
                            className={
                              postingResults[video.id].youtube?.success
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            YouTube:{' '}
                            {postingResults[video.id].youtube?.success
                              ? '✓ Uploaded'
                              : `✗ ${postingResults[video.id].youtube?.error}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-screen video modal */}
      {selectedVideo && (
        <div
          className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className='relative w-full max-w-4xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className='absolute top-4 right-4 text-white bg-zinc-800 hover:bg-zinc-700 p-2 rounded z-10 transition-colors'
              aria-label='Close video'
            >
              ✕ Close
            </button>
            <video
              src={selectedVideo.video_url}
              controls
              autoPlay
              className='w-full rounded'
            />
            {selectedVideo.post_content && (
              <div className='mt-4 p-4 bg-zinc-800 rounded'>
                <p className='text-zinc-300 text-sm font-semibold mb-2'>
                  Post Content:
                </p>
                <p className='text-zinc-400 text-sm whitespace-pre-wrap'>
                  {selectedVideo.post_content}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
