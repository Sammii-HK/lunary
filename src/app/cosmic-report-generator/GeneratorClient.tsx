'use client';

import { useMemo, useState } from 'react';
import { CosmicReportPreview } from '@/components/cosmic-report/CosmicReportPreview';
import { CosmicReportData } from '@/lib/cosmic-report/types';
import { Paywall } from '@/components/Paywall';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Orbit, Moon, Sparkles, Heart, Flame } from 'lucide-react';

const SECTION_OPTIONS = [
  { key: 'transits', label: 'Transits', icon: Orbit },
  { key: 'moon', label: 'Moon', icon: Moon },
  { key: 'tarot', label: 'Tarot', icon: Sparkles },
  { key: 'mood', label: 'Mood', icon: Heart },
  { key: 'rituals', label: 'Rituals', icon: Flame },
];

const REPORT_TYPES = [
  { value: 'weekly', label: 'Weekly', description: 'This week' },
  { value: 'monthly', label: 'Monthly', description: 'This month' },
  { value: 'custom', label: 'Custom', description: 'Pick dates' },
] as const;

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
      setStatus(null);
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
      setStatus(null);
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
      <div className='w-full max-w-5xl mx-auto space-y-8 px-4 py-8 text-content-primary'>
        <div className='space-y-2'>
          <Heading as='h1' variant='h1'>
            Cosmic Report Generator
          </Heading>
          <p className='text-content-muted'>
            Generate personalised cosmic reports from live astronomical data.
            Choose your sections, date range and export as PDF or shareable
            link.
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-[1fr,1.2fr]'>
          {/* Controls */}
          <div className='space-y-6'>
            {/* Report type */}
            <div className='space-y-2'>
              <label className='text-xs uppercase tracking-wider text-content-muted'>
                Report type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type='button'
                    onClick={() => setReportType(type.value)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition',
                      reportType === type.value
                        ? 'border-lunary-primary-500 bg-lunary-primary-500/10'
                        : 'border-stroke-subtle bg-surface-elevated/30 hover:border-stroke-default',
                    )}
                  >
                    <span className='text-sm font-medium'>{type.label}</span>
                    <span className='block text-xs text-content-muted'>
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date range (only for custom) */}
            {reportType === 'custom' && (
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <label className='text-xs uppercase tracking-wider text-content-muted'>
                    Start
                  </label>
                  <input
                    type='date'
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className='w-full rounded-xl border border-stroke-subtle bg-surface-elevated/50 px-3 py-2 text-sm text-content-primary focus:border-lunary-primary-500 focus:outline-none'
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-xs uppercase tracking-wider text-content-muted'>
                    End
                  </label>
                  <input
                    type='date'
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }))
                    }
                    className='w-full rounded-xl border border-stroke-subtle bg-surface-elevated/50 px-3 py-2 text-sm text-content-primary focus:border-lunary-primary-500 focus:outline-none'
                  />
                </div>
              </div>
            )}

            {/* Sections */}
            <div className='space-y-2'>
              <label className='text-xs uppercase tracking-wider text-content-muted'>
                Sections
              </label>
              <div className='grid gap-2 sm:grid-cols-2'>
                {SECTION_OPTIONS.map((option) => {
                  const isSelected = selectedSections.includes(option.key);
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.key}
                      type='button'
                      onClick={() => handleToggleSection(option.key)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition text-left',
                        isSelected
                          ? 'border-lunary-primary-500/50 bg-lunary-primary-500/10 text-white'
                          : 'border-stroke-subtle bg-surface-elevated/30 text-content-muted hover:border-stroke-default',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isSelected
                            ? 'text-lunary-primary-400'
                            : 'text-content-muted',
                        )}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className='space-y-3'>
              <button
                type='button'
                onClick={() => setMakePublic(!makePublic)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition',
                  makePublic
                    ? 'border-lunary-primary-500/50 bg-lunary-primary-500/10'
                    : 'border-stroke-subtle bg-surface-elevated/30',
                )}
              >
                <span>Public share link</span>
                <span
                  className={cn(
                    'h-4 w-4 rounded-full border-2 transition',
                    makePublic
                      ? 'border-lunary-primary-400 bg-lunary-primary-400'
                      : 'border-stroke-strong',
                  )}
                />
              </button>

              <div className='space-y-1'>
                <label className='text-xs uppercase tracking-wider text-content-muted'>
                  Email (optional)
                </label>
                <input
                  type='email'
                  placeholder='Send report to email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full rounded-xl border border-stroke-subtle bg-surface-elevated/50 px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-lunary-primary-500 focus:outline-none'
                />
              </div>
            </div>

            {/* Generate */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedSections.length === 0}
              className='w-full'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Generating...
                </>
              ) : (
                'Generate report'
              )}
            </Button>

            {status && <p className='text-sm text-red-400'>{status}</p>}
          </div>

          {/* Preview */}
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
        </div>
      </div>
    </Paywall>
  );
}
