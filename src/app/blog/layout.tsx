import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Lunary',
  description:
    'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance. Stay connected to the cosmos with our weekly blog posts.',
  openGraph: {
    title: 'Blog - Lunary',
    description:
      'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance.',
    url: 'https://lunary.app/blog',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Lunary',
    description:
      'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
