import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getTransitReplyShare,
  isTransitReplyAnalysis,
  primaryTransitLabel,
  transitReplyImageUrl,
  transitReplyPublicUrl,
} from '@/lib/share/transit-reply';
import {
  ShareTransitReplyDisplayData,
  ShareTransitReplyLayout,
} from '@/app/share/transit-reply/ShareTransitReplyLayout';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

type ShareTransitReplyPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

const buildCanonical = (shareId: string) =>
  transitReplyPublicUrl(shareId, APP_URL);

export async function generateMetadata({
  params,
}: ShareTransitReplyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const record = await getTransitReplyShare(resolvedParams.shareId);
  // The share record is a raw JSON.parse with no schema validation, so a
  // malformed/partial KV value must 404 rather than throw on analysis.summary.
  if (!record || typeof record.analysis?.summary !== 'string') notFound();

  const isBirthChart = record.mode === 'birth-chart';
  const title = isBirthChart
    ? `${record.name ? `${record.name}'s ` : ''}birth chart read | Lunary`
    : `${primaryTransitLabel(
        isTransitReplyAnalysis(record.analysis) ? record.analysis.transits : [],
      )} | Lunary transit overlay`;
  const description = record.analysis.summary;
  const canonical = buildCanonical(resolvedParams.shareId);
  const ogImage = transitReplyImageUrl(resolvedParams.shareId, APP_URL);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Lunary',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
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

export default async function ShareTransitReplyPage({
  params,
}: ShareTransitReplyPageProps) {
  const resolvedParams = await params;
  const record = await getTransitReplyShare(resolvedParams.shareId);
  // Guard against malformed share records (raw JSON.parse, unvalidated) so one
  // bad KV value 404s cleanly instead of crashing the page for every visitor.
  if (!record || typeof record.analysis?.summary !== 'string') notFound();

  const shareUrl = buildCanonical(resolvedParams.shareId);
  const imageUrl = transitReplyImageUrl(resolvedParams.shareId, APP_URL);
  const data: ShareTransitReplyDisplayData = {
    shareId: record.shareId,
    name: record.name,
    date: record.date,
    question: record.question,
    sourceUrl: record.sourceUrl,
    mode: record.mode ?? 'transits',
    chartMeta: record.chartMeta,
    birthChart: record.birthChart,
    houseCusps: record.houseCusps,
    summary: record.analysis.summary,
    transits: isTransitReplyAnalysis(record.analysis)
      ? record.analysis.transits
      : [],
    placements:
      !isTransitReplyAnalysis(record.analysis) &&
      'placements' in record.analysis
        ? record.analysis.placements
        : [],
    redditReply: record.redditReply,
    shareUrl,
    imageUrl,
  };

  return <ShareTransitReplyLayout data={data} />;
}
