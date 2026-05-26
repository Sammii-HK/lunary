import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { transitReplyPublicUrl } from '@/lib/share/transit-reply';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

type LegacyTransitReplyPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export async function generateMetadata({
  params,
}: LegacyTransitReplyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    alternates: {
      canonical: transitReplyPublicUrl(resolvedParams.shareId, APP_URL),
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default async function LegacyTransitReplyPage({
  params,
}: LegacyTransitReplyPageProps) {
  const resolvedParams = await params;
  redirect(transitReplyPublicUrl(resolvedParams.shareId, APP_URL));
}
