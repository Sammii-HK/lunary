'use client';

import { useState } from 'react';

export default function SocialPreviewPage() {
  const [week, setWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formats = ['story', 'square', 'portrait', 'landscape'] as const;

  const generateVoiceover = async () => {
    setLoading(true);
    setError(null);
    try {
      const script = `Your cosmic forecast for the week ahead. The stars align to bring transformation and new opportunities. Trust your intuition and embrace the journey.`;

      const response = await fetch('/api/social/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate voiceover');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
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
              <p className='text-zinc-500'>
                Click "Generate Voiceover" to hear the audio
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
