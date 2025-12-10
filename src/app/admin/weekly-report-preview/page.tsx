'use client';

import { useState, Suspense } from 'react';
import { Eye, Mail, Calendar, User, RefreshCw } from 'lucide-react';

type WeeklyReport = {
  weekStart: string;
  weekEnd: string;
  keyTransits: Array<{
    date: string;
    transit: string;
    description: string;
  }>;
  moonPhases: Array<{
    date: string;
    phase: string;
    emoji: string;
  }>;
  tarotPatterns: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
  };
  summary: string;
};

type PreviewData = {
  success: boolean;
  report: WeeklyReport;
  email: {
    html: string;
    text: string;
    subject: string;
    to: string;
  };
  user: {
    id: string;
    email: string;
    name?: string;
  };
  weekStart: string;
  weekEnd: string;
};

function WeeklyReportPreviewContent() {
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [weekStart, setWeekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  });
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'report' | 'email'>('report');

  const generatePreview = async () => {
    if (!userId && !userEmail) {
      setError('Please enter a user ID or email');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (userEmail) params.append('email', userEmail);
      if (weekStart) params.append('weekStart', weekStart);

      const response = await fetch(
        `/api/admin/weekly-report/preview?${params.toString()}`,
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate preview',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>
            Weekly Cosmic Report Preview
          </h1>
          <p className='text-zinc-400'>
            Preview weekly cosmic reports for any user before they're sent
          </p>
        </div>

        <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                <User className='inline w-4 h-4 mr-2' />
                User ID
              </label>
              <input
                type='text'
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder='Optional - user ID'
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                <Mail className='inline w-4 h-4 mr-2' />
                User Email
              </label>
              <input
                type='email'
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder='Optional - user email'
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                <Calendar className='inline w-4 h-4 mr-2' />
                Week Start Date
              </label>
              <input
                type='date'
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
              />
            </div>
          </div>
          <button
            onClick={generatePreview}
            disabled={loading}
            className='px-6 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors flex items-center gap-2'
          >
            {loading ? (
              <>
                <RefreshCw className='w-4 h-4 animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <Eye className='w-4 h-4' />
                Generate Preview
              </>
            )}
          </button>
        </div>

        {error && (
          <div className='bg-lunary-error-900/50 border border-lunary-error-700 rounded-lg p-4 mb-8'>
            <p className='text-lunary-error-300'>{error}</p>
          </div>
        )}

        {previewData && (
          <div className='space-y-6'>
            <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h2 className='text-2xl font-bold mb-2'>Preview</h2>
                  <p className='text-zinc-400 text-sm'>
                    User: {previewData.user.name || previewData.user.email} (
                    {previewData.user.id})
                  </p>
                  <p className='text-zinc-400 text-sm'>
                    Week: {formatDate(previewData.weekStart)} -{' '}
                    {formatDate(previewData.weekEnd)}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setViewMode('report')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'report'
                        ? 'bg-lunary-primary-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    Report Data
                  </button>
                  <button
                    onClick={() => setViewMode('email')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'email'
                        ? 'bg-lunary-primary-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    Email Preview
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'report' && (
              <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-6'>
                <h3 className='text-xl font-bold mb-4'>Report Summary</h3>
                <p className='text-zinc-300 mb-6'>
                  {previewData.report.summary}
                </p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='text-lg font-semibold mb-3'>Moon Phases</h4>
                    <div className='space-y-2'>
                      {previewData.report.moonPhases.map((phase, idx) => (
                        <div
                          key={idx}
                          className='bg-zinc-800 rounded p-3 flex items-center gap-3'
                        >
                          <span className='text-2xl'>{phase.emoji}</span>
                          <div>
                            <div className='font-medium'>{phase.phase}</div>
                            <div className='text-sm text-zinc-400'>
                              {formatDate(phase.date)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='text-lg font-semibold mb-3'>Key Transits</h4>
                    <div className='space-y-2'>
                      {previewData.report.keyTransits.map((transit, idx) => (
                        <div key={idx} className='bg-zinc-800 rounded p-3'>
                          <div className='font-medium'>{transit.transit}</div>
                          <div className='text-sm text-zinc-400'>
                            {transit.description} - {formatDate(transit.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {previewData.report.tarotPatterns.dominantThemes.length > 0 && (
                  <div className='mt-6'>
                    <h4 className='text-lg font-semibold mb-3'>
                      Tarot Patterns
                    </h4>
                    <div className='bg-zinc-800 rounded p-4'>
                      <p className='text-zinc-300 mb-2'>
                        <strong>Dominant Themes:</strong>{' '}
                        {previewData.report.tarotPatterns.dominantThemes.join(
                          ', ',
                        )}
                      </p>
                      {previewData.report.tarotPatterns.frequentCards.length >
                        0 && (
                        <div>
                          <strong className='text-zinc-300'>
                            Frequent Cards:
                          </strong>
                          <ul className='list-disc list-inside mt-2 text-zinc-400'>
                            {previewData.report.tarotPatterns.frequentCards.map(
                              (card, idx) => (
                                <li key={idx}>
                                  {card.name} ({card.count}x)
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'email' && (
              <div className='bg-zinc-900 rounded-lg border border-zinc-700 p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <div>
                    <h3 className='text-xl font-bold mb-1'>Email Preview</h3>
                    <p className='text-sm text-zinc-400'>
                      To: {previewData.email.to} | Subject:{' '}
                      {previewData.email.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([previewData.email.html], {
                        type: 'text/html',
                      });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    }}
                    className='px-4 py-2 bg-lunary-primary hover:bg-lunary-primary-400 rounded-md text-white text-sm'
                  >
                    Open in New Tab
                  </button>
                </div>
                <div className='border border-zinc-700 rounded-lg overflow-hidden'>
                  <iframe
                    srcDoc={previewData.email.html}
                    className='w-full h-[800px] bg-white'
                    title='Email Preview'
                  />
                </div>
                <details className='mt-4'>
                  <summary className='cursor-pointer text-sm text-zinc-400 hover:text-zinc-300'>
                    View HTML Source
                  </summary>
                  <pre className='mt-2 p-4 bg-zinc-800 rounded text-xs overflow-auto max-h-96'>
                    {previewData.email.html}
                  </pre>
                </details>
                <details className='mt-4'>
                  <summary className='cursor-pointer text-sm text-zinc-400 hover:text-zinc-300'>
                    View Text Version
                  </summary>
                  <pre className='mt-2 p-4 bg-zinc-800 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap'>
                    {previewData.email.text}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeeklyReportPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center'>
          <div className='text-zinc-400'>Loading...</div>
        </div>
      }
    >
      <WeeklyReportPreviewContent />
    </Suspense>
  );
}
