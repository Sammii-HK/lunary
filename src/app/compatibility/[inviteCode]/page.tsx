import { Metadata } from 'next';
import { CompatibilityClient } from './CompatibilityClient';
import { kvGet } from '@/lib/cloudflare/kv';

interface Props {
  params: Promise<{ inviteCode: string }>;
}

interface CompatInviteData {
  inviterName: string;
  inviterSign: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;

  let inviterName = '';
  let inviterSign = '';

  try {
    const raw = await kvGet(`compat-invite:${inviteCode}`);
    if (raw) {
      const data = JSON.parse(raw) as CompatInviteData;
      inviterName = data.inviterName;
      inviterSign = data.inviterSign;
    }
  } catch {
    // Fall back to generic metadata
  }

  const hasInviter = inviterName && inviterSign;
  const title = hasInviter
    ? `Check your compatibility with ${inviterName} (${inviterSign}) | Lunary`
    : 'Check Your Cosmic Compatibility | Lunary';
  const description = hasInviter
    ? `${inviterName} wants to check your cosmic compatibility! Enter your birth data to discover your connection.`
    : 'Someone wants to check your cosmic compatibility! Enter your birth data to discover your connection.';
  const ogImageUrl = hasInviter
    ? `https://lunary.app/api/og/share/compat-invite?code=${encodeURIComponent(inviteCode)}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lunary.app/compatibility/${inviteCode}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lunary.app/compatibility/${inviteCode}`,
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

export default async function CompatibilityPage({ params }: Props) {
  const { inviteCode } = await params;

  return <CompatibilityClient inviteCode={inviteCode} />;
}
