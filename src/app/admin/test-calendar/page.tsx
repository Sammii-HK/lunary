'use client';

import { useState } from 'react';
import { Calendar, Download, Loader2 } from 'lucide-react';

export default function TestCalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/shop/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, dryRun: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Direct download via GET request
    window.open(`/api/shop/calendar/generate?year=${year}`, '_blank');
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-light text-zinc-100 mb-2 flex items-center gap-3'>
            <Calendar className='h-8 w-8 text-purple-400' />
            Test Calendar Generation
          </h1>
          <p className='text-zinc-400'>
            Generate and test cosmic calendars without creating Stripe products.
            Perfect for testing before adding to the shop.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-2'>
                Year
              </label>
              <input
                type='number'
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || year)}
                min={2025}
                max={2100}
                className='w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-zinc-500 mt-1'>
                Calendar will include all moon phases, retrogrades, and sign
                ingresses for this year
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={handlePreview}
                disabled={loading}
                className='flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className='h-4 w-4' />
                    Preview Events
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                disabled={loading}
                className='flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Download className='h-4 w-4' />
                Download .ics File
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6'>
            <p className='text-red-400'>{error}</p>
          </div>
        )}

        {preview && (
          <div className='space-y-6'>
            <div className='bg-green-900/20 border border-green-500/30 rounded-lg p-6'>
              <h2 className='text-xl font-medium text-green-300 mb-4'>
                Preview: {preview.eventCount} Events Generated
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <span className='text-zinc-400 text-sm'>File Size:</span>
                  <span className='text-zinc-100 ml-2'>
                    {Math.round(preview.icsSize / 1024)} KB
                  </span>
                </div>
                <div>
                  <span className='text-zinc-400 text-sm'>Year:</span>
                  <span className='text-zinc-100 ml-2'>{preview.year}</span>
                </div>
              </div>

              <div className='mt-4'>
                <h3 className='text-sm font-medium text-zinc-300 mb-2'>
                  Sample Events (first 10):
                </h3>
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {preview.preview.map((event: any, idx: number) => (
                    <div
                      key={idx}
                      className='bg-zinc-800/50 border border-zinc-700 rounded p-3 text-sm'
                    >
                      <div className='flex items-start justify-between mb-1'>
                        <span className='font-medium text-zinc-100'>
                          {event.title}
                        </span>
                        <span className='text-zinc-500 text-xs ml-2'>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className='text-zinc-400 text-xs'>
                        {event.description}
                      </p>
                      <span className='inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded'>
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-6'>
              <h3 className='text-lg font-medium text-blue-300 mb-3'>
                Testing Instructions
              </h3>
              <ol className='list-decimal list-inside space-y-2 text-sm text-zinc-300'>
                <li>
                  Click "Download .ics File" to download the calendar file
                </li>
                <li>
                  <strong>Apple Calendar (iCal):</strong> Double-click the .ics
                  file or File → Import
                </li>
                <li>
                  <strong>Google Calendar:</strong> Go to Settings → Import &
                  export → Import, then select the .ics file
                </li>
                <li>
                  <strong>Outlook:</strong> File → Open & Export → Import/Export
                  → Import iCalendar (.ics)
                </li>
                <li>
                  Verify all events appear correctly and dates are accurate
                </li>
                <li>
                  Check that moon phases, retrogrades, and sign ingresses are
                  all included
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
