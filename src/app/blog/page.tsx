import { Metadata } from 'next';
import { BlogList } from './BlogList';
import { getPaginatedPosts } from './blog-utils';
import { generateWeeklyContent } from '../../../utils/blog/weeklyContentGenerator';

export const revalidate = 3600;

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Weekly Astrology Forecast ${year}: Transits, Moon Phases & More - Lunary`,
  description: `Weekly astrology updates for ${year}. This week's planetary transits, moon phases, retrogrades & cosmic events. Your personalized cosmic forecast.`,
  openGraph: {
    title: `Weekly Astrology Forecast ${year} - Lunary`,
    description:
      'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance.',
    url: 'https://lunary.app/blog',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/blog',
        width: 1200,
        height: 630,
        alt: 'Weekly Astrology Forecast - Lunary Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Weekly Astrology Forecast ${year} - Lunary`,
    description:
      'Weekly cosmic insights, planetary highlights, moon phases, and astrological guidance.',
    images: ['/api/og/blog'],
  },
  alternates: {
    canonical: 'https://lunary.app/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: [
    'astrology blog',
    'weekly horoscope',
    'planetary transits',
    'moon phases',
    'astrological guidance',
    'cosmic insights',
    'weekly forecast',
    'astrology weekly',
  ],
};

async function getCurrentWeekData() {
  try {
    const today = new Date();
    const weeklyData = await generateWeeklyContent(today);
    return weeklyData;
  } catch {
    return null;
  }
}

export default async function BlogPage() {
  const { posts, totalPages, totalPosts } = getPaginatedPosts(1);
  const currentWeekData = await getCurrentWeekData();

  return (
    <>
      <BlogList
        posts={posts}
        currentWeekData={currentWeekData}
        currentPage={1}
        totalPages={totalPages}
        totalPosts={totalPosts}
      />

      {totalPages > 1 && (
        <head>
          <link rel='next' href='https://lunary.app/blog/page/2' />
        </head>
      )}

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Weekly Astrology Forecast ${year}`,
            description: `Weekly astrology updates for ${year}. This week's planetary transits, moon phases, retrogrades & cosmic events.`,
            url: 'https://lunary.app/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Lunary',
              url: 'https://lunary.app',
              logo: {
                '@type': 'ImageObject',
                url: 'https://lunary.app/logo.png',
              },
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: totalPosts,
              itemListElement: posts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://lunary.app/blog/week/${post.slug}`,
                item: {
                  '@type': 'Article',
                  headline: post.title,
                  description: post.subtitle,
                  datePublished: post.weekStart,
                  url: `https://lunary.app/blog/week/${post.slug}`,
                },
              })),
            },
          }),
        }}
      />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://lunary.app',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://lunary.app/blog',
              },
            ],
          }),
        }}
      />
    </>
  );
}
