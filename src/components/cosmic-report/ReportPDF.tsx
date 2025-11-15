'use client';

import { useMemo, useState } from 'react';
import { Download, Mail } from 'lucide-react';
import clsx from 'clsx';

interface ReportPDFProps {
  reportId?: number;
  pdfUrl?: string;
  onEmail?: (email: string) => Promise<void> | void;
  disabled?: boolean;
}

export function ReportPDF({
  reportId,
  pdfUrl,
  onEmail,
  disabled = false,
}: ReportPDFProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const resolvedPdfUrl = useMemo(() => {
    if (pdfUrl) return pdfUrl;
    if (!reportId) return undefined;
    return `/api/cosmic-report/${reportId}/pdf`;
  }, [pdfUrl, reportId]);

  const handleDownload = () => {
    if (!resolvedPdfUrl || disabled) return;
    window.open(resolvedPdfUrl, '_blank');
  };

  const handleEmail = async () => {
    if (!onEmail || !email) return;
    try {
      setIsSending(true);
      await onEmail(email);
      setEmail('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4'>
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={handleDownload}
          disabled={!resolvedPdfUrl || disabled}
          className={clsx(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
            !resolvedPdfUrl || disabled
              ? 'cursor-not-allowed border-white/10 text-zinc-400'
              : 'border-white/10 text-white hover:border-purple-400',
          )}
        >
          <Download className='h-4 w-4' />
          Download PDF
        </button>
        {onEmail && (
          <button
            onClick={handleEmail}
            disabled={!email || isSending}
            className='inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-purple-400 disabled:opacity-50'
          >
            <Mail className='h-4 w-4' />
            {isSending ? 'Sending…' : 'Email'}
          </button>
        )}
      </div>
      {onEmail && (
        <input
          type='email'
          placeholder='Email this report'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className='w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none'
        />
      )}
    </div>
  );
}
