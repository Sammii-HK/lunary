import { Metadata } from 'next';
import { BlogList } from './BlogList';
import { getPaginatedPosts } from './blog-utils';
import { generateWeeklyContent } from '../../../utils/blog/weeklyContentGenerator';

export const revalidate = 3600;

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `This Week's Astrology Forecast: What the Stars Have Planned | Lunary`,
  description: `Find out what's cosmically in store this week. Mercury retrograde warnings, best days for big decisions, moon phases & planetary shifts. Free weekly updates.`,
  openGraph: {
    title: `This Week's Astrology Forecast | Lunary`,
    description:
      'What the stars have planned for you this week. Retrograde alerts, best timing for decisions, and cosmic energy shifts.',
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
    title: `This Week's Astrology Forecast | Lunary`,
    description:
      'What the stars have planned this week. Retrograde alerts, best timing, and cosmic shifts.',
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
            name: `Weekly Astrology Forecasts`,
            description: `Free weekly astrology forecasts. What the stars have planned each week - retrogrades, best timing, moon phases & cosmic shifts.`,
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
