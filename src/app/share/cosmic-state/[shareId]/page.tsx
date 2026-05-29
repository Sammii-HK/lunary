import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { kvGet } from '@/lib/cloudflare/kv';
import { parseIsoDateOnly } from '@/lib/date-only';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import type { ShareCosmicStateRecord } from '@/app/api/share/cosmic-state/route';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

type Props = {
  params: Promise<{ shareId: string }>;
};

async function getCosmicStateShare(
  shareId: string,
): Promise<ShareCosmicStateRecord | null> {
  try {
    const raw = await kvGet(`cosmic-state:${shareId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ShareCosmicStateRecord;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const record = await getCosmicStateShare(shareId);
  if (!record) notFound();

  const title = record.name
    ? `${record.name}'s Cosmic State`
    : "Today's Cosmic State from Lunary";
  const description =
    record.insight ?? 'Daily cosmic insight powered by Lunary.';
  const ogImage = `${APP_URL}/api/og/share/cosmic-state?shareId=${encodeURIComponent(
    shareId,
  )}`;
  const canonical = `${APP_URL}/share/cosmic-state/${encodeURIComponent(
    shareId,
  )}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Lunary',
      images: [{ url: ogImage, width: 1080, height: 1080, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ShareCosmicStatePage({ params }: Props) {
  const { shareId } = await params;
  const record = await getCosmicStateShare(shareId);
  if (!record) notFound();

  // Carry the sharer's referral code through to the signup CTA so FREE
  // signups from a shared cosmic-state card are attributed. The /auth page
  // redeems the `ref` once the account exists.
  const signupHref = record.referralCode
    ? `/auth?signup=true&redirect=/app&ref=${encodeURIComponent(
        record.referralCode,
      )}`
    : '/auth?signup=true&redirect=/app';

  const parsedDate = record.date ? parseIsoDateOnly(record.date) : null;
  const dateLabel = parsedDate
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(parsedDate)
    : null;

  const title = record.name
    ? `${record.name}'s Cosmic State`
    : "Today's Cosmic State";

  return (
    <div className='min-h-screen bg-layer-deep text-content-primary'>
      <div className='mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 py-16'>
        <div className='w-full rounded-3xl border border-white/10 bg-surface-base/70 p-8 shadow-2xl backdrop-blur'>
          <div className='space-y-6'>
            <div className='space-y-1 text-center'>
              <p className='text-xs uppercase tracking-[0.3em] text-content-muted'>
                Shared from Lunary
              </p>
              <Heading as='h1' variant='h1'>
                {title}
              </Heading>
              {dateLabel && (
                <p className='text-sm text-content-muted'>{dateLabel}</p>
              )}
            </div>

            <div className='flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6'>
              {record.moonPhase.icon.src && (
                <Image
                  src={record.moonPhase.icon.src}
                  alt={record.moonPhase.icon.alt}
                  width={72}
                  height={72}
                  className='shrink-0'
                  unoptimized
                />
              )}
              <div>
                <p className='text-lg font-medium text-lunary-primary-300'>
                  {record.moonPhase.name}
                </p>
                <p className='text-sm uppercase tracking-widest text-content-muted'>
                  {record.zodiacSeason} Season
                </p>
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
              <p className='mb-2 text-xs uppercase tracking-[0.3em] text-content-muted'>
                Cosmic Insight
              </p>
              <p className='text-sm leading-relaxed text-content-secondary'>
                {record.insight}
              </p>
            </div>

            {record.transit && (
              <div className='rounded-2xl border border-lunary-primary-800/40 bg-lunary-primary-950/30 p-5'>
                <p className='mb-1 text-sm font-medium text-lunary-primary-300'>
                  {record.transit.headline}
                </p>
                <p className='text-xs leading-relaxed text-content-muted'>
                  {record.transit.description}
                </p>
              </div>
            )}

            <div className='rounded-2xl border border-white/10 bg-gradient-to-br from-layer-deep/60 to-lunary-secondary-950/40 p-6 text-center'>
              <div className='mb-3 flex items-center justify-center gap-2'>
                <Sparkles className='h-5 w-5 text-lunary-primary-400' />
                <Heading as='h2' variant='h3' className='mb-0'>
                  Get your own cosmic snapshot
                </Heading>
              </div>
              <p className='mb-4 text-sm text-content-muted'>
                Free birth chart, daily cosmic state, and personalised transits,
                all in Lunary.
              </p>
              <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
                <Button asChild variant='lunary'>
                  <Link href={signupHref}>
                    <Sparkles className='h-4 w-4' />
                    Create Free Account
                  </Link>
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/'>Explore Lunary</Link>
                </Button>
              </div>
              <p className='mt-3 text-xs text-content-muted'>
                Free account includes birth chart, daily insights, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
