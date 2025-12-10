import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moon Circles: Community Rituals & Lunar Gatherings - Lunary',
  description:
    'Join moon circles and connect with a community of moon-conscious practitioners. New moon intentions, full moon releases, and lunar rituals.',
  keywords: [
    'moon circles',
    'lunar rituals',
    'moon community',
    'new moon circle',
    'full moon gathering',
  ],
  alternates: {
    canonical: 'https://lunary.app/moon-circles',
  },
};

export default function MoonCirclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
