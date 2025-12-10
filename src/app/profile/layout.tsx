import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile - Lunary',
  description:
    'Manage your Lunary profile, birth chart details, notification preferences, and subscription settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
