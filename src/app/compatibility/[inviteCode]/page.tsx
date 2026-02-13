import { Metadata } from 'next';
import { CompatibilityClient } from './CompatibilityClient';

interface Props {
  params: Promise<{ inviteCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;

  return {
    title: 'Check Your Cosmic Compatibility | Lunary',
    description:
      'Someone wants to check your cosmic compatibility! Enter your birth data to discover your connection.',
    alternates: {
      canonical: `https://lunary.app/compatibility/${inviteCode}`,
    },
    openGraph: {
      title: 'Check Your Cosmic Compatibility | Lunary',
      description:
        'Someone wants to check your cosmic compatibility! Enter your birth data to discover your connection.',
      url: `https://lunary.app/compatibility/${inviteCode}`,
    },
  };
}

export default async function CompatibilityPage({ params }: Props) {
  const { inviteCode } = await params;

  return <CompatibilityClient inviteCode={inviteCode} />;
}
