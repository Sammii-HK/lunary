import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | Lunary',
  description:
    'Connect with your cosmic community. Join sign-based spaces, Saturn Return circles, and retrograde check-ins.',
  alternates: {
    canonical: 'https://lunary.app/community',
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
