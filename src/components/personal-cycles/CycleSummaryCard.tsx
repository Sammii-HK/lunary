'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { AutoLinkText } from '@/components/glossary/AutoLinkText';
import AudioNarrator from '@/components/audio/AudioNarrator';
import { CyclesTimeline } from './CyclesTimeline';
import type {
  SaturnReturnResult,
  JupiterReturnResult,
  ProfectionYearResult,
  LunationResult,
  SolarReturnResult,
} from '@/lib/personal-cycles/compute';

interface CyclesPayload {
  saturn: SaturnReturnResult;
  jupiter: JupiterReturnResult;
  profection: ProfectionYearResult;
  lunation: LunationResult;
  solar: SolarReturnResult;
  summary: string;
  generatedAt: string;
}

interface Props {
  className?: string;
}

export function CycleSummaryCard({ className }: Props) {
  const [data, setData] = useState<CyclesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/personal-cycles')
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((payload: CyclesPayload) => {
        if (cancelled) return;
        setData(payload);
        setError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className={
        className ??
        'rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-5 md:p-6 space-y-5'
      }
      aria-labelledby='personal-cycles-heading'
    >
      <header className='flex items-center gap-2'>
        <Sparkles className='h-5 w-5 text-lunary-primary' aria-hidden />
        <Heading
          as='h2'
          variant='h2'
          id='personal-cycles-heading'
          className='mb-0'
        >
          Personal Cycles
        </Heading>
      </header>

      {loading && (
        <p className='text-sm text-content-muted'>
          Charting the five cycles you live inside...
        </p>
      )}

      {error && !loading && (
        <p className='text-sm text-content-muted'>
          {error.includes('birthday')
            ? 'Add your birthday to your profile to see your personal cycles.'
            : `Could not load your cycles: ${error}`}
        </p>
      )}

      {data && !loading && (
        <>
          <CyclesTimeline
            saturn={data.saturn}
            jupiter={data.jupiter}
            profection={data.profection}
            lunation={data.lunation}
            solar={data.solar}
          />

          <div className='border-t border-stroke-subtle/60 pt-4'>
            <div className='flex items-start justify-between gap-3 mb-2'>
              <Heading as='h3' variant='h3' className='mb-0'>
                Where you are right now
              </Heading>
              <AudioNarrator
                text={data.summary}
                title='Your personal cycles'
                compactVariant='inline'
              />
            </div>
            <AutoLinkText
              as='p'
              className='text-sm text-content-secondary leading-relaxed'
            >
              {data.summary}
            </AutoLinkText>
          </div>
        </>
      )}
    </section>
  );
}

export default CycleSummaryCard;
