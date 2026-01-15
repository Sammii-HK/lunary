'use client';

import { useMemo, useState } from 'react';
import { CosmicReportPreview } from '@/components/cosmic-report/CosmicReportPreview';
import { CosmicReportData } from '@/lib/cosmic-report/types';
import { Paywall } from '@/components/Paywall';

const SECTION_OPTIONS = [
  { key: 'transits', label: 'Transits' },
  { key: 'moon', label: 'Moon' },
  { key: 'tarot', label: 'Tarot' },
  { key: 'mood', label: 'Mood' },
  { key: 'rituals', label: 'Rituals' },
];

type ReportResponse = {
  id: number;
  share_token?: string | null;
  share_url?: string;
  pdf_url: string;
  data: CosmicReportData;
};

export function GeneratorClient() {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'custom'>(
    'weekly',
  );
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSections, setSelectedSections] = useState<string[]>(
    SECTION_OPTIONS.map((option) => option.key),
  );
  const [makePublic, setMakePublic] = useState(true);
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);

  const requestPayload = useMemo(
    () => ({
      report_type: reportType,
      date_range:
        dateRange.start || dateRange.end
          ? {
              start: dateRange.start || undefined,
              end: dateRange.end || undefined,
            }
          : undefined,
      include_sections: selectedSections,
      make_public: makePublic,
      generated_for: 'Launch Campaign',
    }),
    [reportType, dateRange, selectedSections, makePublic],
  );

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setStatus(null);
      const response = await fetch('/api/cosmic-report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestPayload,
          email: email || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.requiresAuth) {
          setStatus('Please sign in to use the Cosmic Report Generator');
        } else if (data.requiresUpgrade) {
          setStatus(
            'Upgrade to Lunary+ Pro to unlock the Cosmic Report Generator',
          );
        } else {
          throw new Error(data.message || 'Failed to generate report');
        }
        return;
      }
      setReport(data.report);
      setStatus('Report generated');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Unable to generate report right now.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSection = (key: string) => {
    setSelectedSections((sections) =>
      sections.includes(key)
        ? sections.filter((section) => section !== key)
        : [...sections, key],
    );
  };

  const handleShare = async () => {
    if (!report?.id) return;
    try {
      setStatus('Creating share link…');
      const response = await fetch(`/api/cosmic-report/${report.id}/share`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create share link');
      }
      setReport((prev) =>
        prev
          ? {
              ...prev,
              share_url: data.share_url,
              share_token: data.share_token,
            }
          : prev,
      );
      setStatus('Share link ready');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Unable to create share link right now.',
      );
    }
  };

  const handleEmail = async (targetEmail: string) => {
    if (!report?.id) return;
    setStatus('Sending email…');
    const response = await fetch(`/api/cosmic-report/${report.id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, make_public: makePublic }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send email');
    }
    setStatus('Report emailed successfully');
  };

  return (
    <Paywall feature='downloadable_reports'>
      <div className='w-full max-w-5xl space-y-8 px-4 py-10 text-white'>
        <section className='rounded-3xl border border-white/10 bg-black/50 p-6'>
          <h1 className='text-4xl font-semibold'>Cosmic Report Generator</h1>
          <p className='text-sm text-zinc-300'>
            Build launch-ready cosmic briefings with custom sections, optional
            share links, and PDF exports. Available for Lunary+ Pro subscribers.
          </p>
        </section>

        <section className='grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                Report type
              </p>
              <div className='mt-3 flex flex-wrap gap-3'>
                {['weekly', 'monthly', 'custom'].map((type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => setReportType(type as typeof reportType)}
                    className={`rounded-full border px-4 py-2 text-sm capitalize ${
                      reportType === type
                        ? 'border-lunary-primary-400 bg-lunary-primary-400/20'
                        : 'border-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                  Start date
                </label>
                <input
                  type='date'
                  value={dateRange.start}
                  onChange={(event) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: event.target.value,
                    }))
                  }
                  className='mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-sm text-white focus:border-lunary-primary-400 focus:outline-none'
                />
              </div>
              <div>
                <label className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                  End date
                </label>
                <input
                  type='date'
                  value={dateRange.end}
                  onChange={(event) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: event.target.value,
                    }))
                  }
                  className='mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-sm text-white focus:border-lunary-primary-400 focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                Sections
              </label>
              <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                {SECTION_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className='flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white'
                  >
                    <input
                      type='checkbox'
                      checked={selectedSections.includes(option.key)}
                      onChange={() => handleToggleSection(option.key)}
                      className='accent-lunary-primary-400'
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm'>
              <span>Generate public share link</span>
              <label className='inline-flex cursor-pointer items-center gap-2'>
                <input
                  type='checkbox'
                  checked={makePublic}
                  onChange={(event) => setMakePublic(event.target.checked)}
                  className='accent-lunary-primary-400'
                />
              </label>
            </div>
            <div>
              <label className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                Email (optional)
              </label>
              <input
                type='email'
                placeholder='Send report to email when generating'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className='mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-zinc-400 focus:border-lunary-primary-400 focus:outline-none'
              />
            </div>
            <button
              type='button'
              onClick={handleGenerate}
              disabled={isGenerating}
              className='rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50'
            >
              {isGenerating ? 'Generating…' : 'Generate report'}
            </button>
            {status && (
              <p className='text-sm text-lunary-primary-200'>{status}</p>
            )}
          </div>
          <div>
            <CosmicReportPreview
              report={
                report
                  ? {
                      ...report.data,
                      id: report.id,
                      shareUrl: report.share_url,
                      pdfUrl: report.pdf_url,
                    }
                  : undefined
              }
              isLoading={isGenerating}
              onShare={handleShare}
              onEmail={async (targetEmail) => {
                try {
                  await handleEmail(targetEmail);
                } catch (error) {
                  setStatus(
                    error instanceof Error
                      ? error.message
                      : 'Unable to email report right now.',
                  );
                }
              }}
            />
          </div>
        </section>
      </div>
    </Paywall>
  );
}
