'use client';

import { useMemo } from 'react';
import { Share2 } from 'lucide-react';
import {
  CosmicReportData,
  CosmicReportSection,
} from '@/lib/cosmic-report/types';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { ReportPDF } from './ReportPDF';

interface CosmicReportPreviewProps {
  report?: CosmicReportData & {
    id?: number;
    shareUrl?: string;
    pdfUrl?: string;
  };
  isLoading?: boolean;
  onShare?: () => Promise<void> | void;
  onEmail?: (email: string) => Promise<void>;
}

const placeholderReport: CosmicReportData = {
  title: 'Your Cosmic Blueprint',
  subtitle: 'Select a report type to preview your insights.',
  reportType: 'weekly',
  sections: [
    {
      key: 'transits',
      title: 'Planetary Transits',
      summary:
        'We will analyze the week’s most influential alignments and translate them into actionable insights.',
      highlights: [
        'Personalized transit synopsis',
        'Energy windows for focus, launch, or rest',
      ],
    },
  ],
};

function SectionCard({ section }: { section: CosmicReportSection }) {
  return (
    <div className='space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4'>
      <p className='text-xs uppercase tracking-[0.3em] text-purple-200'>
        {section.key}
      </p>
      <h4 className='text-xl font-semibold text-white'>{section.title}</h4>
      <p className='text-sm text-zinc-300'>{section.summary}</p>
      <ul className='space-y-2 text-sm text-purple-100'>
        {section.highlights.map((item) => (
          <li key={item} className='flex items-start gap-2'>
            <span className='text-purple-300'>✷</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {section.actionSteps && (
        <div className='rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-sm text-purple-100'>
          <p className='text-xs uppercase tracking-[0.3em] text-purple-200'>
            Rituals
          </p>
          <ul className='mt-2 list-disc space-y-1 pl-4 text-purple-50'>
            {section.actionSteps.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CosmicReportPreview({
  report = placeholderReport,
  isLoading = false,
  onShare,
  onEmail,
}: CosmicReportPreviewProps) {
  const sections = useMemo(() => report.sections || [], [report.sections]);

  return (
    <section className='space-y-6 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950/80 to-black/80 p-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-purple-200'>
            Report Preview
          </p>
          <h3 className='text-2xl font-semibold text-white'>{report.title}</h3>
          <p className='text-sm text-zinc-300'>{report.subtitle}</p>
        </div>
        <div className='flex flex-wrap gap-3'>
          {report.shareUrl && (
            <SocialShareButtons
              title={`My Lunary ${report.reportType} report`}
              url={report.shareUrl}
            />
          )}
          {!report.shareUrl && (
            <button
              onClick={onShare}
              disabled={isLoading}
              className='inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-400 disabled:opacity-50'
            >
              <Share2 className='h-4 w-4' />
              {isLoading ? 'Sharing…' : 'Generate Share Link'}
            </button>
          )}
          <ReportPDF
            reportId={report.id}
            pdfUrl={report.pdfUrl}
            onEmail={onEmail}
            disabled={!report.id}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {sections.map((section) => (
          <SectionCard key={section.key} section={section} />
        ))}
      </div>
    </section>
  );
}
